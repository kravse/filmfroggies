/**
 * The only thing this app persists: lists of TMDB ids in display order, which
 * list is active, and the view preference. Movie records are never stored.
 *
 * The TMDB credential and the Gist token live under their own keys and are
 * deliberately absent from this payload so they are never synced to a Gist.
 */

const USER_STATE_KEY = "moviecollector-user-state";
const GIST_SYNC_KEY = "moviecollector-gist-sync";
const TMDB_AUTH_KEY = "moviecollector-tmdb-auth";
const HOSTED_SESSION_KEY = "moviecollector-hosted-session";
const USER_STATE_VERSION = 1;

const VIEW_MODES = new Set(["cards", "detail"]);
const STORAGE_MODES = new Set(["local", "gist"]);

function getLists() {
  if (typeof appLists !== "undefined") {
    return appLists;
  }
  if (typeof require === "function") {
    return require("./lists");
  }
  throw new Error("appLists is not available");
}

function getRatings() {
  if (typeof appRatings !== "undefined") {
    return appRatings;
  }
  if (typeof require === "function") {
    return require("./ratings");
  }
  throw new Error("appRatings is not available");
}

function defaultPreferences() {
  return { viewMode: "cards" };
}

function defaultUserState() {
  const lists = getLists();
  return {
    version: USER_STATE_VERSION,
    updatedAt: null,
    storageMode: "local",
    lists: lists.defaultLists(),
    activeListId: lists.DEFAULT_LIST_ID,
    preferences: defaultPreferences(),
    ratings: {},
  };
}

function normalizePreferences(raw) {
  const base = defaultPreferences();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  let viewMode = raw.viewMode;
  if (viewMode === "list") {
    viewMode = "cards";
  }
  return {
    viewMode: VIEW_MODES.has(viewMode) ? viewMode : base.viewMode,
  };
}

function normalizeUserState(raw) {
  const lists = getLists();
  const base = defaultUserState();
  if (!raw || typeof raw !== "object") {
    return base;
  }

  const normalizedLists = lists.normalizeLists(raw.lists);

  let activeListId = raw.activeListId;
  if (activeListId === "favourites") {
    activeListId = lists.WATCHED_ID;
  }

  return {
    version: USER_STATE_VERSION,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    storageMode: STORAGE_MODES.has(raw.storageMode) ? raw.storageMode : "local",
    lists: normalizedLists,
    activeListId: lists.isListId(activeListId)
      ? activeListId
      : lists.DEFAULT_LIST_ID,
    preferences: normalizePreferences(raw.preferences),
    ratings: getRatings().normalizeRatings(raw.ratings, normalizedLists),
  };
}

function parseUserState(json) {
  if (json == null || json === "") {
    return null;
  }
  try {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return normalizeUserState(parsed);
  } catch (_) {
    return null;
  }
}

function serializeUserState(state) {
  return JSON.stringify(normalizeUserState(state));
}

function touchUserState(state, now = new Date()) {
  return { ...state, updatedAt: now.toISOString() };
}

module.exports = {
  USER_STATE_KEY,
  GIST_SYNC_KEY,
  TMDB_AUTH_KEY,
  HOSTED_SESSION_KEY,
  USER_STATE_VERSION,
  defaultUserState,
  normalizePreferences,
  normalizeUserState,
  parseUserState,
  serializeUserState,
  touchUserState,
};
