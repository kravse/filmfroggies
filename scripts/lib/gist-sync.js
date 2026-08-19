/**
 * GitHub Gist sync helpers, ported from arkham's viewer-gist-sync.
 *
 * Only the user state is written to the Gist. The Gist token and the TMDB
 * credential are stored under separate localStorage keys and never appear in
 * the payload.
 */

const GIST_STATE_FILENAME = "moviecollector-state.json";
const GITHUB_API = "https://api.github.com";
const GIST_DESCRIPTION = "Movie collector sync";

function getSyncMerge() {
  if (typeof appSyncMerge !== "undefined") {
    return appSyncMerge;
  }
  if (typeof require === "function") {
    return require("./sync-merge");
  }
  throw new Error("appSyncMerge is not available");
}

function parseGistSyncConfig(json) {
  if (json == null || json === "") {
    return null;
  }
  try {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    const token = typeof parsed.token === "string" ? parsed.token.trim() : "";
    const gistId = typeof parsed.gistId === "string" ? parsed.gistId.trim() : "";
    if (!token) {
      return null;
    }
    return { token, gistId };
  } catch (_) {
    return null;
  }
}

function serializeGistSyncConfig(config) {
  return JSON.stringify({
    token: config.token,
    gistId: config.gistId || "",
  });
}

function isConnectedGistConfig(config) {
  return Boolean(config?.token && config?.gistId);
}

function extractStateJsonFromGistResponse(body) {
  if (!body || typeof body !== "object") {
    return null;
  }
  const file = body.files?.[GIST_STATE_FILENAME];
  if (!file || typeof file.content !== "string") {
    return null;
  }
  return file.content;
}

function findCollectorGistId(gists, stateFilename = GIST_STATE_FILENAME) {
  if (!Array.isArray(gists)) {
    return null;
  }
  const match = gists.find((gist) => gist?.files && gist.files[stateFilename]);
  return match?.id || null;
}

function buildGistCreatePayload(stateJson) {
  return {
    description: GIST_DESCRIPTION,
    public: false,
    files: { [GIST_STATE_FILENAME]: { content: stateJson } },
  };
}

function buildGistUpdatePayload(stateJson) {
  return {
    files: { [GIST_STATE_FILENAME]: { content: stateJson } },
  };
}

/**
 * Connecting adopts an existing Gist rather than overwriting it, so pointing a
 * second device at the same account picks up the lists already there. The two
 * sides are merged rather than swapped, so movies added on this device before
 * connecting are not dropped on the way in.
 */
function resolveGistConnectState({ gistId, remoteState, localState }) {
  if (gistId) {
    if (!remoteState) {
      return {
        ok: false,
        error:
          "Found an existing sync Gist but could not read moviecollector-state.json. Your Gist was not changed.",
      };
    }
    return {
      ok: true,
      action: "adopt",
      gistId,
      nextState: getSyncMerge().mergeUserStates(remoteState, localState),
    };
  }

  return { ok: true, action: "create", gistId: "", nextState: localState };
}

module.exports = {
  GIST_STATE_FILENAME,
  GITHUB_API,
  parseGistSyncConfig,
  serializeGistSyncConfig,
  isConnectedGistConfig,
  extractStateJsonFromGistResponse,
  findCollectorGistId,
  buildGistCreatePayload,
  buildGistUpdatePayload,
  resolveGistConnectState,
};
