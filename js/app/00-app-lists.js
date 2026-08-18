/* Generated from scripts/lib/lists.js — run npm run bundle */

const appLists = (function () {
  /**
   * Two fixed lists, in tab order. There is deliberately no way to create,
   * rename, or delete one: these are statuses, not user-defined collections.
   *
   * One invariant defines how they relate, enforced on read as well as on write:
   *
   *   Watchlist is disjoint from Watched. A movie is either unseen (watchlist)
   *   or seen (watched), never both.
   *
   * `movieIds` carries membership and order in one array. Every function is pure
   * and returns new arrays.
   */

  const WATCHED_ID = "watched";
  const WATCHLIST_ID = "watchlist";
  const LEGACY_FAVOURITES_ID = "favourites";

  const PRESET_LISTS = [
    { id: WATCHED_ID, name: "Watched" },
    { id: WATCHLIST_ID, name: "Watchlist" },
  ];

  const LIST_IDS = PRESET_LISTS.map((preset) => preset.id);
  const DEFAULT_LIST_ID = WATCHED_ID;
  const STATUS_PRIORITY = [WATCHED_ID, WATCHLIST_ID];

  function isListId(listId) {
    return LIST_IDS.includes(listId);
  }

  function isListReorderable(listId) {
    return isListId(listId);
  }

  function normalizeMovieIds(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = new Set();
    const ids = [];
    for (const entry of raw) {
      const id = Number(entry);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
    return ids;
  }

  function defaultLists() {
    return PRESET_LISTS.map((preset) => ({ ...preset, movieIds: [] }));
  }

  /**
   * Rebuilds the two lists from stored data: preset order and names always win,
   * unknown list ids are dropped, and the watchlist/watched invariant is repaired.
   *
   * Legacy payloads with separate favourites and watched lists are merged into
   * watched: former favourites keep their order, then any watched-only ids append.
   */
  function normalizeLists(raw) {
    const stored = Array.isArray(raw) ? raw : [];
    const storedIds = (listId) => {
      const match = stored.find((entry) => entry && entry.id === listId);
      return normalizeMovieIds(match?.movieIds);
    };

    const legacyFavourites = storedIds(LEGACY_FAVOURITES_ID);
    const legacyWatched = storedIds(WATCHED_ID);
    const watched = [...legacyFavourites];
    for (const id of legacyWatched) {
      if (!watched.includes(id)) {
        watched.push(id);
      }
    }

    const seen = new Set(watched);
    const watchlist = storedIds(WATCHLIST_ID).filter((id) => !seen.has(id));

    const byId = {
      [WATCHED_ID]: watched,
      [WATCHLIST_ID]: watchlist,
    };
    return PRESET_LISTS.map((preset) => ({ ...preset, movieIds: byId[preset.id] }));
  }

  function findList(lists, listId) {
    if (!Array.isArray(lists)) {
      return null;
    }
    return lists.find((list) => list.id === listId) || null;
  }

  function findListIdsForMovie(lists, movieId) {
    const id = Number(movieId);
    if (!Array.isArray(lists) || !Number.isInteger(id)) {
      return [];
    }
    return lists.filter((list) => list.movieIds.includes(id)).map((list) => list.id);
  }

  function primaryListIdForMovie(lists, movieId) {
    const holding = new Set(findListIdsForMovie(lists, movieId));
    for (const listId of STATUS_PRIORITY) {
      if (holding.has(listId)) {
        return listId;
      }
    }
    return null;
  }

  function applyMembership(lists, movieId, addTo, removeFrom) {
    let changed = false;
    const next = lists.map((list) => {
      const has = list.movieIds.includes(movieId);
      if (addTo.includes(list.id) && !has) {
        changed = true;
        return { ...list, movieIds: [...list.movieIds, movieId] };
      }
      if (removeFrom.includes(list.id) && has) {
        changed = true;
        return {
          ...list,
          movieIds: list.movieIds.filter((entry) => entry !== movieId),
        };
      }
      return list;
    });
    return changed ? next : lists;
  }

  /**
   * Sets a movie's status. Each target clears the other list so callers never
   * have to reason about the invariant themselves.
   */
  function assignMovieToList(lists, listId, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0 || !isListId(listId)) {
      return lists;
    }

    if (listId === WATCHED_ID) {
      return applyMembership(lists, id, [WATCHED_ID], [WATCHLIST_ID]);
    }
    return applyMembership(lists, id, [WATCHLIST_ID], [WATCHED_ID]);
  }

  function removeMovieFromList(lists, listId, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || !isListId(listId)) {
      return lists;
    }
    return applyMembership(lists, id, [], [listId]);
  }

  function isWatched(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return false;
    }
    return findList(lists, WATCHED_ID)?.movieIds.includes(id) ?? false;
  }

  function isOnWatchlist(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return false;
    }
    return findList(lists, WATCHLIST_ID)?.movieIds.includes(id) ?? false;
  }

  /** Drops a movie from every list. */
  function removeMovie(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return lists;
    }
    return applyMembership(lists, id, [], LIST_IDS);
  }

  function replaceMovieIds(lists, listId, movieIds) {
    if (!isListReorderable(listId)) {
      return lists;
    }
    const target = findList(lists, listId);
    if (!target || movieIds === target.movieIds) {
      return lists;
    }
    return lists.map((list) =>
      list.id === listId ? { ...list, movieIds: [...movieIds] } : list,
    );
  }

  return {
    WATCHLIST_ID,
    WATCHED_ID,
    PRESET_LISTS,
    LIST_IDS,
    DEFAULT_LIST_ID,
    isListId,
    isListReorderable,
    normalizeMovieIds,
    defaultLists,
    normalizeLists,
    findList,
    findListIdsForMovie,
    primaryListIdForMovie,
    isWatched,
    isOnWatchlist,
    assignMovieToList,
    removeMovieFromList,
    removeMovie,
    replaceMovieIds,
  };
})();
