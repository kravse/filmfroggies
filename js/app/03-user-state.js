/**
 * User state runtime: localStorage persistence plus optional account sync.
 *
 * Only the list payload is ever synced. The account session token lives under
 * its own key and is never part of the serialized state.
 */

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_) {
    /* Quota or private browsing; state still works for this session. */
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {
    /* Ignored for the same reason as writeStorage. */
  }
}

function loadUserState() {
  const stored = readStorage(appUserState.USER_STATE_KEY);
  const parsed = appUserState.parseUserState(stored);
  userState = parsed || appUserState.defaultUserState();
  gridViewMode = userState.preferences.viewMode;

  // Normalizing on read leaves stale shapes on disk — a payload written before
  // the lists became fixed, say. Write the cleaned version back so storage
  // matches the model, without touching updatedAt: bumping it here would make
  // merely opening the app look like an edit to Gist sync.
  const normalized = appUserState.serializeUserState(userState);
  if (stored !== normalized) {
    writeStorage(appUserState.USER_STATE_KEY, normalized);
  }
  return userState;
}

/** Drops list data from this browser without touching the account token. */
function resetLocalUserState() {
  userState = appUserState.defaultUserState();
  gridViewMode = userState.preferences.viewMode;
  removeStorage(appUserState.USER_STATE_BACKUP_KEY);
  writeUserStateToStorage();
  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
  activeCustomListId = null;
  appView = "main";
  reorderModeActive = false;
}

function writeUserStateToStorage() {
  writeStorage(
    appUserState.USER_STATE_KEY,
    appUserState.serializeUserState(userState),
  );
}

function backupUserState(state) {
  if (!state) {
    return;
  }
  writeStorage(
    appUserState.USER_STATE_BACKUP_KEY,
    appUserState.serializeUserState(state),
  );
}

function persistUserState(options = {}) {
  userState = appUserState.touchUserState(userState);
  writeUserStateToStorage();
  if (options.sync !== false && accountSyncEnabled()) {
    queueAccountSync({ push: true });
  }
}

function updateRatings(nextRatings) {
  if (nextRatings === userState.ratings) {
    return false;
  }
  userState = { ...userState, ratings: nextRatings };
  return true;
}

function updateViewingHistory(nextHistory) {
  if (nextHistory === userState.viewingHistory) return false;
  userState = { ...userState, viewingHistory: nextHistory };
  return true;
}

function addMovieViewing(movieId, watchedOn) {
  if (!appLists.isWatched(userState.lists, movieId)) {
    return false;
  }
  if (appViewingHistory.hasActiveViewingOnDate(userState.viewingHistory, movieId, watchedOn)) {
    return false;
  }
  return updateViewingHistory(
    appViewingHistory.addViewing(userState.viewingHistory, movieId, watchedOn),
  );
}

function setMovieRating(movieId, rating) {
  if (
    rating != null &&
    !appRatings.isRatingAllowed(userState.lists, movieId, userState.customLists)
  ) {
    return false;
  }
  const nextRatings = appRatings.setRating(userState.ratings, movieId, rating);
  if (!updateRatings(nextRatings)) {
    return false;
  }
  persistUserState();
  return true;
}

function updateLists(nextLists) {
  if (nextLists === userState.lists) {
    return false;
  }
  userState = {
    ...userState,
    lists: nextLists,
    ratings: appRatings.normalizeRatings(
      userState.ratings,
      nextLists,
      userState.customLists,
    ),
  };
  return true;
}

/**
 * Stamps what just happened to one movie. Sync merges on these per-movie
 * records, so every membership change has to pass through here or a stale copy
 * will out-vote it.
 */
function recordMovieStatus(movieId, status) {
  userState = {
    ...userState,
    statuses: appSyncMerge.setMovieStatus(userState.statuses, movieId, status),
  };
}

/** First add only; a removed movie being added again always gets a fresh stamp. */
function recordAddedAt(movieId, at) {
  const readded = appSyncMerge.isRemoved(userState.statuses, movieId);
  const next = appAddedAt.recordAddedAt(userState.addedAt, movieId, at, { readded });
  if (next === userState.addedAt) {
    return;
  }
  userState = { ...userState, addedAt: next };
}

function updateAddedAt(nextAddedAt) {
  if (nextAddedAt === userState.addedAt) {
    return false;
  }
  userState = { ...userState, addedAt: nextAddedAt };
  return true;
}

const VIEW_MODE_CYCLE = ["cards", "detail"];

const VIEW_MODE_LABELS = {
  cards: "Card view",
  detail: "Detail view",
};

function nextViewMode(mode) {
  const index = VIEW_MODE_CYCLE.indexOf(mode);
  const next = index < 0 ? 0 : (index + 1) % VIEW_MODE_CYCLE.length;
  return VIEW_MODE_CYCLE[next];
}

function isLayoutLockedToDetail() {
  return isWatchlistActive() || isDiscoverActive();
}

function syncViewModeButton() {
  if (!viewModeCycleBtn) {
    return;
  }
  viewModeCycleBtn.hidden = isLayoutLockedToDetail();
  if (isLayoutLockedToDetail()) {
    return;
  }
  viewModeCycleBtn.dataset.viewMode = gridViewMode;
  viewModeCycleBtn.setAttribute("aria-label", VIEW_MODE_LABELS[gridViewMode]);
}

function refreshViewModeForActiveList() {
  if (isLayoutLockedToDetail()) {
    gridViewMode = "detail";
  } else {
    gridViewMode = userState.preferences.viewMode;
  }
  document.body.classList.toggle("view-mode-cards", gridViewMode === "cards");
  document.body.classList.toggle("view-mode-detail", gridViewMode === "detail");
  syncViewModeButton();
}

function setViewMode(mode) {
  if (isLayoutLockedToDetail()) {
    refreshViewModeForActiveList();
    return;
  }
  gridViewMode = appUserState.normalizePreferences({ viewMode: mode }).viewMode;
  userState = {
    ...userState,
    preferences: { ...userState.preferences, viewMode: gridViewMode },
  };
  document.body.classList.toggle("view-mode-cards", gridViewMode === "cards");
  document.body.classList.toggle("view-mode-detail", gridViewMode === "detail");
  syncViewModeButton();
}

/** Adopts a merged payload locally, keeping the previous one as a backup. */
function adoptMergedState(merged) {
  backupUserState(userState);
  userState = { ...merged, storageMode: userState.storageMode };
  gridViewMode = userState.preferences.viewMode;
  writeUserStateToStorage();
}

function mergeIntoUserState(incoming) {
  return appUserState.normalizeUserState(
    appSyncMerge.mergeUserStates(userState, incoming),
  );
}

function formatSyncTime(value) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) {
    return "just now";
  }
  return new Date(time).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Another tab wrote to localStorage. Merging it in stops this tab from sitting
 * on a stale list, which is what made a background tab dangerous before.
 */
function onUserStateStorageEvent(event) {
  if (event.key !== appUserState.USER_STATE_KEY || !event.newValue) {
    return;
  }
  const incoming = appUserState.parseUserState(event.newValue);
  if (!incoming) {
    return;
  }
  const merged = mergeIntoUserState(incoming);
  if (
    appUserState.userStateSignature(merged) ===
    appUserState.userStateSignature(userState)
  ) {
    return;
  }
  adoptMergedState(merged);
  onRemoteStateAdopted();
}

/** A tab coming back to the foreground is the most likely one to be stale. */
function onVisibilityRefresh() {
  if (document.visibilityState !== "visible") {
    stopFriendsNavPolling();
    return;
  }
  if (accountSyncEnabled()) {
    queueAccountSync();
    refreshFriendsNavBadge({ quiet: true });
    startFriendsNavPolling();
  }
}

/* --- Account sync (CineQueue backend: Cloudflare Worker + D1) --- */

const ACCOUNT_TIMEOUT_MS = 15000;

let accountConfig = null;

/** Serializes every account read/write pair, same reasoning as queueGistSync. */
let accountSyncChain = Promise.resolve();

function loadAccountConfig() {
  accountConfig = appAccountSync.parseAccountConfig(
    readStorage(appUserState.ACCOUNT_KEY),
  );
  return accountConfig;
}

function saveAccountConfig(config) {
  accountConfig = config;
  if (config) {
    writeStorage(
      appUserState.ACCOUNT_KEY,
      appAccountSync.serializeAccountConfig(config),
    );
    writeStorage(appUserState.LAST_ACCOUNT_USER_ID_KEY, String(config.userId));
  } else {
    removeStorage(appUserState.ACCOUNT_KEY);
  }
}

function accountSyncEnabled() {
  return (
    userState.storageMode === "account" &&
    appAccountSync.isConnectedAccountConfig(accountConfig)
  );
}

async function accountRequest(path, options = {}) {
  const { method = "GET", body, auth = true } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ACCOUNT_TIMEOUT_MS);
  try {
    const headers = {};
    if (auth) {
      headers.authorization = `Bearer ${accountConfig?.token || ""}`;
    }
    if (body) {
      headers["content-type"] = "application/json";
    }
    const base = appAccountSync.resolveAccountApiBase(window.location.hostname);
    const response = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      // An expired or revoked session should read as "logged out", not as an
      // endless string of sync errors.
      if (response.status === 401 && auth) {
        saveAccountConfig(null);
      }
      const error = new Error(
        payload?.error || `Account request failed (${response.status})`,
      );
      error.status = response.status;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

/** Same read-merge-write dance as reconcileWithGist, against /api/data. */
async function reconcileWithAccount(options = {}) {
  if (!accountSyncEnabled()) {
    return { ok: false, reason: "disconnected" };
  }

  let remoteState = null;
  try {
    const body = await accountRequest("/data");
    remoteState = body?.doc
      ? appUserState.parseUserState(JSON.stringify(body.doc))
      : null;
  } catch (error) {
    if (error?.status !== 404) {
      throw error;
    }
    /* 404 just means nothing has been pushed yet. */
  }

  const localSignature = appUserState.userStateSignature(userState);

  if (options.pullOnly) {
    const adopted = appUserState.userStateAfterAccountConnect(remoteState);
    adoptMergedState(adopted);
    return {
      ok: true,
      localChanged: appUserState.userStateSignature(userState) !== localSignature,
    };
  }

  const merged = mergeIntoUserState(remoteState);
  const mergedSignature = appUserState.userStateSignature(merged);
  const remoteSignature = remoteState
    ? appUserState.userStateSignature(remoteState)
    : null;

  const localChanged = mergedSignature !== localSignature;
  if (localChanged) {
    adoptMergedState(merged);
  }

  if (options.push && mergedSignature !== remoteSignature) {
    userState = appUserState.touchUserState(userState);
    writeUserStateToStorage();
    await accountRequest("/data", {
      method: "PUT",
      body: { doc: JSON.parse(appUserState.serializeUserState(userState)) },
    });
  }

  return { ok: true, localChanged };
}

function queueAccountSync(options = {}) {
  accountSyncChain = accountSyncChain
    .then(() => reconcileWithAccount(options))
    .then((result) => {
      if (!result?.ok) {
        return;
      }
      if (result.localChanged) {
        onRemoteStateAdopted();
      }
      setStatus(
        accountSyncStatus,
        `Synced at ${formatSyncTime(userState.updatedAt)}.`,
        "ok",
      );
    })
    .catch((error) => {
      // Same rule as Gist sync: never blind-write after a failed read.
      setStatus(
        accountSyncStatus,
        error?.status === 401
          ? "Session expired. Log in again to keep syncing."
          : "Could not reach the sync server. Changes are saved on this device and will sync later.",
        "error",
      );
    });
  return accountSyncChain;
}

/**
 * Signup and login share a shape: get a session, then pull remote lists only.
 * Local data is not pushed on connect — export/import CSV to migrate old lists.
 */
async function connectAccount(mode, email, password, inviteCode) {
  try {
    const payload = { email, password };
    if (mode === "signup") {
      payload.inviteCode = inviteCode || "";
    }
    const body = await accountRequest(`/${mode}`, {
      method: "POST",
      auth: false,
      body: payload,
    });
    if (!body?.token || !body?.user?.id) {
      return {
        ok: false,
        error:
          mode === "signup"
            ? "Could not create that account. Try logging in if you already have one."
            : "Could not sign in. Check your email and password.",
      };
    }
    const previousUserId = Number(readStorage(appUserState.LAST_ACCOUNT_USER_ID_KEY));
    const sameAccount =
      Number.isInteger(previousUserId) && previousUserId === body.user.id;
    saveAccountConfig({
      token: body.token,
      email: body.user.email,
      userId: body.user.id,
      displayName: body.user.displayName || "",
    });
    if (!sameAccount) {
      resetLocalUserState();
    }
    await queueAccountSync({ push: false, pullOnly: !sameAccount });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function disconnectAccount() {
  saveAccountConfig(null);
  userState = { ...userState, storageMode: "account" };
  writeUserStateToStorage();
  stopFriendsNavPolling();
}

async function logoutAccount() {
  try {
    // Drain any in-flight sync, then push once more while the session is still
    // valid. Logout clears local lists, so unpushed edits would otherwise die here.
    if (accountSyncEnabled()) {
      await queueAccountSync({ push: true });
    }
    await accountRequest("/logout", { method: "POST" });
  } catch (_) {
    /* offline or already revoked */
  }
  disconnectAccount();
  resetLocalUserState();
}

async function deleteRemoteAccount(password) {
  return accountRequest("/account", {
    method: "DELETE",
    body: { password },
  });
}

async function changeRemoteAccountPassword(currentPassword, newPassword) {
  return accountRequest("/account/password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}

/* Friends: thin wrappers, the dialog layer owns rendering and status text. */

function fetchFriends() {
  return accountRequest("/friends");
}

function sendFriendRequest(email) {
  return accountRequest("/friends/request", { method: "POST", body: { email } });
}

function acceptFriend(userId) {
  return accountRequest(`/friends/${userId}/accept`, { method: "POST" });
}

function removeFriend(userId) {
  return accountRequest(`/friends/${userId}`, { method: "DELETE" });
}

async function fetchFriendState(userId) {
  const body = await accountRequest(`/friends/${userId}/data`);
  return body?.doc
    ? appUserState.parseUserState(JSON.stringify(body.doc))
    : null;
}
