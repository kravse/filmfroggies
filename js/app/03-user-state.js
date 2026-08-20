/**
 * User state runtime: localStorage persistence plus optional GitHub Gist sync.
 *
 * Only the list payload is ever synced. The Gist token and TMDB credential
 * live under their own keys and are never part of the serialized state.
 */

const GIST_TIMEOUT_MS = 15000;

let gistConfig = null;

/** `updatedAt` of the Gist payload this tab last saw, for staleness reporting. */
let lastRemoteUpdatedAt = null;

/** Serializes every Gist read/write pair; see queueGistSync(). */
let gistSyncChain = Promise.resolve();

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

function writeUserStateToStorage() {
  writeStorage(
    appUserState.USER_STATE_KEY,
    appUserState.serializeUserState(userState),
  );
}

/** Snapshot taken before any merge replaces state, so a bad merge is undoable. */
function backupUserState(state) {
  if (!state) {
    return;
  }
  writeStorage(
    appUserState.USER_STATE_BACKUP_KEY,
    appUserState.serializeUserState(state),
  );
}

function gistSyncEnabled() {
  return (
    userState.storageMode === "gist" &&
    appGistSync.isConnectedGistConfig(gistConfig)
  );
}

function persistUserState(options = {}) {
  userState = appUserState.touchUserState(userState);
  writeUserStateToStorage();
  if (options.sync !== false && gistSyncEnabled()) {
    queueGistSync({ push: true });
  }
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

/* --- Gist sync --- */

function loadGistConfig() {
  gistConfig = appGistSync.parseGistSyncConfig(
    readStorage(appUserState.GIST_SYNC_KEY),
  );
  return gistConfig;
}

function saveGistConfig(config) {
  gistConfig = config;
  if (config) {
    writeStorage(
      appUserState.GIST_SYNC_KEY,
      appGistSync.serializeGistSyncConfig(config),
    );
  } else {
    removeStorage(appUserState.GIST_SYNC_KEY);
  }
}

async function gistRequest(pathname, options = {}) {
  const { method = "GET", token, body } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GIST_TIMEOUT_MS);
  try {
    const headers = {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
    };
    if (body) {
      headers["content-type"] = "application/json";
    }
    const response = await fetch(`${appGistSync.GITHUB_API}${pathname}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error(`GitHub request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function remoteStateFromGistBody(body) {
  const json = appGistSync.extractStateJsonFromGistResponse(body);
  return json ? appUserState.parseUserState(json) : null;
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

/**
 * Reads the Gist, merges, and only then writes. The read is the whole point: a
 * blind PATCH from a tab that has been open a while replaces whatever another
 * tab has since added, and because the stale copy carries a fresh `updatedAt`,
 * every later pull believes it. Merging first means a stale tab contributes its
 * change instead of overwriting the payload.
 */
async function reconcileWithGist(options = {}) {
  if (!appGistSync.isConnectedGistConfig(gistConfig)) {
    return { ok: false, reason: "disconnected" };
  }

  const body = await gistRequest(`/gists/${gistConfig.gistId}`, {
    token: gistConfig.token,
  });
  const remoteState = remoteStateFromGistBody(body);

  const localSignature = appUserState.userStateSignature(userState);
  const merged = mergeIntoUserState(remoteState);
  const mergedSignature = appUserState.userStateSignature(merged);
  const remoteSignature = remoteState
    ? appUserState.userStateSignature(remoteState)
    : null;

  const localChanged = mergedSignature !== localSignature;
  if (localChanged) {
    adoptMergedState(merged);
  }

  lastRemoteUpdatedAt = remoteState?.updatedAt || null;

  if (options.push || mergedSignature !== remoteSignature) {
    userState = appUserState.touchUserState(userState);
    writeUserStateToStorage();
    await gistRequest(`/gists/${gistConfig.gistId}`, {
      method: "PATCH",
      token: gistConfig.token,
      body: appGistSync.buildGistUpdatePayload(
        appUserState.serializeUserState(userState),
      ),
    });
    lastRemoteUpdatedAt = userState.updatedAt;
  }

  return { ok: true, localChanged };
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
 * Every sync runs through one chain. Two overlapping GET/PATCH pairs would let
 * the second PATCH carry a payload built before the first one landed, which is
 * the same lost update the read-before-write is there to prevent.
 */
function queueGistSync(options = {}) {
  gistSyncChain = gistSyncChain
    .then(() => reconcileWithGist(options))
    .then(async (result) => {
      if (!result?.ok) {
        return;
      }
      if (result.localChanged) {
        onRemoteStateAdopted();
      }
      setStatus(
        gistStatus,
        `Synced with GitHub at ${formatSyncTime(userState.updatedAt)}.`,
        "ok",
      );
      try {
        await maybeCreateGistSnapshot();
      } catch (_) {
        /* Backup failures must not block live sync or overwrite snapshots. */
      }
    })
    .catch(() => {
      // Never fall back to a blind write: keeping the change local and retrying
      // later is always safer than overwriting a payload we could not read.
      setStatus(
        gistStatus,
        "Could not reach GitHub. Changes are saved on this device and will sync later.",
        "error",
      );
    });
  return gistSyncChain;
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
    return;
  }
  if (gistSyncEnabled()) {
    queueGistSync();
  }
  if (accountSyncEnabled()) {
    queueAccountSync();
  }
}

/**
 * Connecting looks for an existing sync Gist on the account and adopts it, so
 * a second device picks up lists already there instead of overwriting them.
 */
async function connectGist(token) {
  const trimmed = String(token || "").trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a GitHub token first." };
  }

  try {
    const gists = await gistRequest("/gists", { token: trimmed });
    const gistId = appGistSync.findCollectorGistId(gists);
    let remoteState = null;

    if (gistId) {
      const body = await gistRequest(`/gists/${gistId}`, { token: trimmed });
      remoteState = remoteStateFromGistBody(body);
    }

    const resolved = appGistSync.resolveGistConnectState({
      gistId,
      remoteState,
      localState: userState,
    });
    if (!resolved.ok) {
      return resolved;
    }

    let nextGistId = resolved.gistId;
    if (resolved.action === "create") {
      const created = await gistRequest("/gists", {
        method: "POST",
        token: trimmed,
        body: appGistSync.buildGistCreatePayload(
          appUserState.serializeUserState(userState),
        ),
      });
      nextGistId = created?.id || "";
      if (!nextGistId) {
        return { ok: false, error: "GitHub did not return a Gist id." };
      }
    }

    const backupGistId = appGistBackup.findBackupGistId(gists, nextGistId) || "";
    saveGistConfig({ token: trimmed, gistId: nextGistId, backupGistId });
    backupUserState(userState);
    userState = {
      ...appUserState.normalizeUserState(resolved.nextState),
      storageMode: "gist",
    };
    gridViewMode = userState.preferences.viewMode;
    writeUserStateToStorage();
    queueGistSync();
    return { ok: true, action: resolved.action };
  } catch (error) {
    return { ok: false, error: `Could not reach GitHub. ${error.message}` };
  }
}

function disconnectGist() {
  saveGistConfig(null);
  userState = { ...userState, storageMode: "local" };
  writeUserStateToStorage();
}

/* --- Gist snapshot backups (write-only, separate gist) --- */

let backupSnapshotChain = Promise.resolve();

function clearStoredBackupGistId() {
  if (!gistConfig?.backupGistId) {
    return;
  }
  saveGistConfig({ ...gistConfig, backupGistId: "" });
}

async function resolveBackupGistId() {
  if (!gistConfig?.token) {
    return null;
  }
  if (gistConfig.backupGistId) {
    return gistConfig.backupGistId;
  }
  const gists = await gistRequest("/gists", { token: gistConfig.token });
  const backupGistId = appGistBackup.findBackupGistId(gists, gistConfig.gistId);
  if (backupGistId) {
    saveGistConfig({ ...gistConfig, backupGistId });
  }
  return backupGistId || null;
}

async function fetchBackupGistBody(backupGistId) {
  try {
    return await gistRequest(`/gists/${backupGistId}`, {
      token: gistConfig.token,
    });
  } catch (error) {
    if (error?.status === 404) {
      clearStoredBackupGistId();
      return null;
    }
    throw error;
  }
}

async function readBackupPayload(backupGistId) {
  const body = await fetchBackupGistBody(backupGistId);
  if (!body) {
    return appGistBackup.emptyBackupPayload();
  }
  const content = appGistBackup.extractBackupContent(body);
  return content
    ? appGistBackup.parseBackupPayload(content)
    : appGistBackup.emptyBackupPayload();
}

async function writeBackupPayload(backupGistId, payload) {
  const contentJson = appGistBackup.serializeBackupPayload(payload);
  try {
    await gistRequest(`/gists/${backupGistId}`, {
      method: "PATCH",
      token: gistConfig.token,
      body: appGistBackup.buildBackupGistUpdatePayload(contentJson),
    });
  } catch (error) {
    if (error?.status === 404) {
      clearStoredBackupGistId();
      await createBackupGist(payload);
      return;
    }
    throw error;
  }
}

async function createBackupGist(payload) {
  const contentJson = appGistBackup.serializeBackupPayload(payload);
  const created = await gistRequest("/gists", {
    method: "POST",
    token: gistConfig.token,
    body: appGistBackup.buildBackupGistCreatePayload(contentJson),
  });
  const backupGistId = created?.id || "";
  if (!backupGistId) {
    throw new Error("GitHub did not return a backup Gist id.");
  }
  saveGistConfig({ ...gistConfig, backupGistId });
  return backupGistId;
}

async function createGistSnapshotNow() {
  const now = Date.now();
  const atIso = new Date(now).toISOString();
  const stateObject = appUserState.parseUserState(
    appUserState.serializeUserState(userState),
  );
  if (!stateObject) {
    return { ok: false, reason: "state" };
  }

  let backupGistId = await resolveBackupGistId();
  let payload = appGistBackup.emptyBackupPayload();

  if (backupGistId) {
    const body = await fetchBackupGistBody(backupGistId);
    if (!body) {
      backupGistId = null;
    } else {
      payload = appGistBackup.parseBackupPayload(
        appGistBackup.extractBackupContent(body) || "",
      );
      if (!appGistBackup.shouldCreateSnapshot(payload.snapshots, now)) {
        return { ok: true, skipped: true };
      }
    }
  }

  if (!backupGistId && !appGistBackup.shouldCreateSnapshot([], now)) {
    return { ok: true, skipped: true };
  }

  const nextPayload = appGistBackup.appendSnapshot(payload, stateObject, atIso);

  if (!backupGistId) {
    await createBackupGist(nextPayload);
    return { ok: true, created: true };
  }

  await writeBackupPayload(backupGistId, nextPayload);
  return { ok: true, created: true };
}

/**
 * Adds an immutable snapshot when the latest one is at least 20 minutes old.
 * All snapshots live in one backup gist file and are only appended or purged.
 */
async function maybeCreateGistSnapshot() {
  if (!gistSyncEnabled()) {
    return { ok: false, reason: "disabled" };
  }
  backupSnapshotChain = backupSnapshotChain.then(() => createGistSnapshotNow());
  return backupSnapshotChain;
}

async function listGistSnapshots() {
  if (!gistSyncEnabled()) {
    return [];
  }
  const backupGistId = await resolveBackupGistId();
  if (!backupGistId) {
    return [];
  }
  const payload = await readBackupPayload(backupGistId);
  return appGistBackup.snapshotListEntries(payload);
}

async function restoreGistSnapshot(at) {
  if (!gistSyncEnabled()) {
    return { ok: false, error: "Gist sync is not connected." };
  }
  if (!Date.parse(String(at || ""))) {
    return { ok: false, error: "That snapshot is not valid." };
  }

  const backupGistId = await resolveBackupGistId();
  if (!backupGistId) {
    return { ok: false, error: "No backup Gist found." };
  }

  const payload = await readBackupPayload(backupGistId);
  const entry = appGistBackup.findSnapshotByAt(payload, at);
  if (!entry) {
    return { ok: false, error: "Could not find that snapshot." };
  }
  const parsed = appUserState.parseUserState(entry.state);
  if (!parsed) {
    return { ok: false, error: "Could not read that snapshot." };
  }

  backupUserState(userState);
  userState = {
    ...parsed,
    storageMode: "gist",
  };
  gridViewMode = userState.preferences.viewMode;
  writeUserStateToStorage();
  queueGistSync({ push: true });
  onRemoteStateAdopted();
  return { ok: true };
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
  const merged = mergeIntoUserState(remoteState);
  const mergedSignature = appUserState.userStateSignature(merged);
  const remoteSignature = remoteState
    ? appUserState.userStateSignature(remoteState)
    : null;

  const localChanged = mergedSignature !== localSignature;
  if (localChanged) {
    adoptMergedState(merged);
  }

  if (options.push || mergedSignature !== remoteSignature) {
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
 * Signup and login share a shape: get a session, switch to account mode, then
 * reconcile so lists already on the account and lists already on this device
 * merge instead of one clobbering the other.
 */
async function connectAccount(mode, email, password) {
  try {
    const body = await accountRequest(`/${mode}`, {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    saveAccountConfig({
      token: body.token,
      email: body.user.email,
      userId: body.user.id,
      displayName: body.user.displayName || "",
    });
    backupUserState(userState);
    userState = { ...userState, storageMode: "account" };
    writeUserStateToStorage();
    await queueAccountSync({ push: true });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function disconnectAccount() {
  saveAccountConfig(null);
  userState = { ...userState, storageMode: "local" };
  writeUserStateToStorage();
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
