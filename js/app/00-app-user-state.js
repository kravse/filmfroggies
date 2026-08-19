/* Generated from scripts/lib/user-state.js — run npm run bundle */

const appUserState = (function () {
  /**
   * The only thing this app persists: lists of TMDB ids in display order, which
   * list is active, and the view preference. Movie records are never stored.
   *
   * The TMDB credential and the Gist token live under their own keys and are
   * deliberately absent from this payload so they are never synced to a Gist.
   */

  const USER_STATE_KEY = "moviecollector-user-state";
  /** Payload from just before the last merge, so a bad merge stays recoverable. */
  const USER_STATE_BACKUP_KEY = "moviecollector-user-state-backup";
  const GIST_SYNC_KEY = "moviecollector-gist-sync";
  const TMDB_AUTH_KEY = "moviecollector-tmdb-auth";
  const HOSTED_SESSION_KEY = "moviecollector-hosted-session";
  const USER_STATE_VERSION = 4;

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

  function getAddedAt() {
    if (typeof appAddedAt !== "undefined") {
      return appAddedAt;
    }
    if (typeof require === "function") {
      return require("./added-at");
    }
    throw new Error("appAddedAt is not available");
  }

  function getViewingHistory() {
    if (typeof appViewingHistory !== "undefined") return appViewingHistory;
    if (typeof require === "function") return require("./viewing-history");
    throw new Error("appViewingHistory is not available");
  }

  function getSort() {
    if (typeof appSort !== "undefined") {
      return appSort;
    }
    if (typeof require === "function") {
      return require("./sort");
    }
    throw new Error("appSort is not available");
  }

  function getSyncMerge() {
    if (typeof appSyncMerge !== "undefined") {
      return appSyncMerge;
    }
    if (typeof require === "function") {
      return require("./sync-merge");
    }
    throw new Error("appSyncMerge is not available");
  }

  function getCustomLists() {
    if (typeof appCustomLists !== "undefined") {
      return appCustomLists;
    }
    if (typeof require === "function") {
      return require("./custom-lists");
    }
    throw new Error("appCustomLists is not available");
  }

  function defaultPreferences() {
    return {
      viewMode: "cards",
      sort: getSort().DEFAULT_PREFERENCE_SORT,
      pinnedCustomListId: null,
    };
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
      addedAt: {},
      viewingHistory: {},
      statuses: {},
      customLists: getCustomLists().defaultCustomLists(),
      customListTombstones: getCustomLists().defaultCustomListTombstones(),
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
      sort: getSort().normalizeWatchedSort(raw.sort, base.sort),
    };
  }

  function normalizeUserState(raw) {
    const lists = getLists();
    const base = defaultUserState();
    if (!raw || typeof raw !== "object") {
      return base;
    }

    const normalizedLists = lists.normalizeLists(raw.lists);

    const activeListId = raw.activeListId;

    const statuses = getSyncMerge().normalizeStatuses(
      raw.statuses,
      normalizedLists,
      raw.updatedAt,
    );

    const customListsLib = getCustomLists();
    const customLists = customListsLib.normalizeCustomLists(
      raw.customLists,
      raw.updatedAt,
    );
    const customListTombstones = customListsLib.normalizeCustomListTombstones(
      raw.customListTombstones,
    );

    const preferences = normalizePreferences(raw.preferences);

    return {
      version: USER_STATE_VERSION,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
      storageMode: STORAGE_MODES.has(raw.storageMode) ? raw.storageMode : "local",
      lists: normalizedLists,
      activeListId: lists.isListId(activeListId)
        ? activeListId
        : lists.DEFAULT_LIST_ID,
      preferences: {
        ...preferences,
        pinnedCustomListId: customListsLib.normalizePinnedCustomListId(
          raw.preferences?.pinnedCustomListId,
          customLists,
        ),
      },
      ratings: getRatings().normalizeRatings(raw.ratings, normalizedLists, customLists),
      addedAt: getAddedAt().normalizeAddedAt(raw.addedAt, normalizedLists),
      viewingHistory: getViewingHistory().normalizeViewingHistory(raw.viewingHistory),
      statuses,
      customLists,
      customListTombstones,
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

  /** Map key order follows insertion, so sort it or the fingerprint is unstable. */
  function sortedIdMap(map) {
    const out = {};
    for (const key of Object.keys(map || {}).sort((a, b) => Number(a) - Number(b))) {
      out[key] = map[key];
    }
    return out;
  }

  function sortedStringMap(map) {
    const out = {};
    for (const key of Object.keys(map || {}).sort()) {
      out[key] = map[key];
    }
    return out;
  }

  /**
   * Fingerprint of everything except `updatedAt`. Sync compares these to tell a
   * real edit from a re-stamp, which is what stops two tabs from pushing
   * identical payloads back and forth forever.
   */
  function userStateSignature(state) {
    const normalized = normalizeUserState(state);
    return JSON.stringify({
      storageMode: normalized.storageMode,
      activeListId: normalized.activeListId,
      preferences: normalized.preferences,
      lists: normalized.lists.map((list) => [list.id, list.movieIds]),
      ratings: sortedIdMap(normalized.ratings),
      addedAt: sortedIdMap(normalized.addedAt),
      viewingHistory: sortedIdMap(normalized.viewingHistory),
      statuses: sortedIdMap(normalized.statuses),
      customLists: normalized.customLists.map((list) => [
        list.id,
        list.name,
        list.movieIds,
        list.updatedAt,
      ]),
      customListTombstones: sortedStringMap(normalized.customListTombstones),
    });
  }

  return {
    USER_STATE_KEY,
    USER_STATE_BACKUP_KEY,
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
    userStateSignature,
  };
})();
