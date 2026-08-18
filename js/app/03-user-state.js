/**
 * User state runtime: localStorage persistence plus optional GitHub Gist sync.
 *
 * Only the list payload is ever synced. The Gist token and TMDB credential
 * live under their own keys and are never part of the serialized state.
 */

const GIST_TIMEOUT_MS = 15000;

let gistConfig = null;

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

function persistUserState(options = {}) {
  userState = appUserState.touchUserState(userState);
  writeUserStateToStorage();
  if (
    options.sync !== false &&
    userState.storageMode === "gist" &&
    appGistSync.isConnectedGistConfig(gistConfig)
  ) {
    pushStateToGist().catch(() => {
      setStatus(gistStatus, "Could not save to GitHub. Changes are on this device.", "error");
    });
  }
}

function updateRatings(nextRatings) {
  if (nextRatings === userState.ratings) {
    return false;
  }
  userState = { ...userState, ratings: nextRatings };
  return true;
}

function setMovieRating(movieId, rating) {
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
  userState = { ...userState, lists: nextLists };
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

function syncViewModeButton() {
  if (!viewModeCycleBtn) {
    return;
  }
  viewModeCycleBtn.dataset.viewMode = gridViewMode;
  viewModeCycleBtn.setAttribute("aria-label", VIEW_MODE_LABELS[gridViewMode]);
}

function setViewMode(mode) {
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
      throw new Error(`GitHub request failed (${response.status})`);
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

async function pushStateToGist() {
  if (!appGistSync.isConnectedGistConfig(gistConfig)) {
    return;
  }
  await gistRequest(`/gists/${gistConfig.gistId}`, {
    method: "PATCH",
    token: gistConfig.token,
    body: appGistSync.buildGistUpdatePayload(
      appUserState.serializeUserState(userState),
    ),
  });
}

/** Adopts the remote payload when it is newer than what this device holds. */
async function pullStateFromGist() {
  if (!appGistSync.isConnectedGistConfig(gistConfig)) {
    return false;
  }
  const body = await gistRequest(`/gists/${gistConfig.gistId}`, {
    token: gistConfig.token,
  });
  const remoteState = remoteStateFromGistBody(body);
  const merged = appGistSync.mergeStateByUpdatedAt(userState, remoteState);
  if (merged === userState) {
    return false;
  }
  userState = { ...merged, storageMode: "gist" };
  gridViewMode = userState.preferences.viewMode;
  writeUserStateToStorage();
  return true;
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

    saveGistConfig({ token: trimmed, gistId: nextGistId });
    userState = { ...resolved.nextState, storageMode: "gist" };
    gridViewMode = userState.preferences.viewMode;
    writeUserStateToStorage();
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
