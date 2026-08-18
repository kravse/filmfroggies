/**
 * Three fixed lists, in tab order. There is deliberately no way to create,
 * rename, or delete one: these are statuses, not user-defined collections.
 *
 * Two invariants define how they relate, and both are enforced on read as well
 * as on write, so no stored or synced payload can violate them:
 *
 *   1. Favourites is a subset of Watched. You cannot favourite something you
 *      have not watched, so favouriting also marks it watched.
 *   2. Watchlist is disjoint from both others. It means "not seen yet", which
 *      is incompatible with having watched or favourited it.
 *
 * Together those collapse to three reachable states per movie: on the
 * watchlist, watched, or watched and favourited.
 *
 * `movieIds` carries membership and order in one array. Every function is pure
 * and returns new arrays.
 */

const FAVOURITES_ID = "favourites";
const WATCHLIST_ID = "watchlist";
const WATCHED_ID = "watched";

const PRESET_LISTS = [
  { id: WATCHED_ID, name: "Watched" },
  { id: FAVOURITES_ID, name: "Favourites" },
  { id: WATCHLIST_ID, name: "Watchlist" },
];

const LIST_IDS = PRESET_LISTS.map((preset) => preset.id);
const DEFAULT_LIST_ID = WATCHED_ID;
/** Most-specific status first; independent of tab order. */
const STATUS_PRIORITY = [FAVOURITES_ID, WATCHED_ID, WATCHLIST_ID];

function isListId(listId) {
  return LIST_IDS.includes(listId);
}

/** Watched is append-only by date added; favourites and watchlist stay manually ordered. */
function isListReorderable(listId) {
  return listId !== WATCHED_ID;
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
 * Rebuilds the three lists from stored data: preset order and names always
 * win, unknown list ids are dropped, and both invariants are repaired.
 *
 * Where stored data contradicts itself, the repair keeps the stronger claim.
 * Having watched something is a fact, so a movie in both Watchlist and
 * Watched stays watched and leaves the watchlist.
 */
function normalizeLists(raw) {
  const stored = Array.isArray(raw) ? raw : [];
  const storedIds = (listId) => {
    const match = stored.find((entry) => entry && entry.id === listId);
    return normalizeMovieIds(match?.movieIds);
  };

  const favourites = storedIds(FAVOURITES_ID);
  const watchedStored = storedIds(WATCHED_ID);

  // Invariant 1: anything favourited counts as watched.
  const watched = [...watchedStored];
  for (const id of favourites) {
    if (!watched.includes(id)) {
      watched.push(id);
    }
  }

  // Invariant 2: the watchlist cannot hold anything already seen.
  const seen = new Set(watched);
  const watchlist = storedIds(WATCHLIST_ID).filter((id) => !seen.has(id));

  const byId = {
    [FAVOURITES_ID]: favourites,
    [WATCHLIST_ID]: watchlist,
    [WATCHED_ID]: watched,
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

/**
 * The most specific status for a movie, for a single-value badge or picker.
 * STATUS_PRIORITY does the work: favourited outranks merely watched, and a
 * watchlisted movie is in no other list.
 */
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
      const nextIds =
        list.id === WATCHED_ID
          ? [movieId, ...list.movieIds]
          : [...list.movieIds, movieId];
      return { ...list, movieIds: nextIds };
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
 * Sets a movie's status. Each target implies the memberships needed to keep
 * both invariants true, so callers never have to reason about the others.
 */
function assignMovieToList(lists, listId, movieId) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0 || !isListId(listId)) {
    return lists;
  }

  if (listId === FAVOURITES_ID) {
    return applyMembership(lists, id, [FAVOURITES_ID, WATCHED_ID], [WATCHLIST_ID]);
  }
  if (listId === WATCHED_ID) {
    // Favourites is left alone: marking a favourite watched changes nothing.
    return applyMembership(lists, id, [WATCHED_ID], [WATCHLIST_ID]);
  }
  return applyMembership(lists, id, [WATCHLIST_ID], [FAVOURITES_ID, WATCHED_ID]);
}

/**
 * Removes a movie from one list. Un-favouriting leaves it watched, but
 * un-watching also drops the favourite, since a favourite must be watched.
 */
function removeMovieFromList(lists, listId, movieId) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || !isListId(listId)) {
    return lists;
  }
  const removeFrom =
    listId === WATCHED_ID ? [WATCHED_ID, FAVOURITES_ID] : [listId];
  return applyMembership(lists, id, [], removeFrom);
}

function isFavourited(lists, movieId) {
  const id = Number(movieId);
  if (!Number.isInteger(id)) {
    return false;
  }
  return findList(lists, FAVOURITES_ID)?.movieIds.includes(id) ?? false;
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

/** Toggles favourite for a watched movie; no-op on the watchlist. */
function toggleFavourite(lists, movieId) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0 || !isWatched(lists, id)) {
    return lists;
  }
  if (isFavourited(lists, id)) {
    return removeMovieFromList(lists, FAVOURITES_ID, id);
  }
  return assignMovieToList(lists, FAVOURITES_ID, id);
}

/** Drops a movie from every list. */
function removeMovie(lists, movieId) {
  const id = Number(movieId);
  if (!Number.isInteger(id)) {
    return lists;
  }
  return applyMembership(lists, id, [], LIST_IDS);
}

/** Used by drag reorder to commit a new order for one list. Watched is not reorderable. */
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

module.exports = {
  FAVOURITES_ID,
  WATCHLIST_ID,
  WATCHED_ID,
  PRESET_LISTS,
  LIST_IDS,
  DEFAULT_LIST_ID,
  isListReorderable,
  isListId,
  normalizeMovieIds,
  defaultLists,
  normalizeLists,
  findList,
  findListIdsForMovie,
  primaryListIdForMovie,
  isFavourited,
  isWatched,
  isOnWatchlist,
  assignMovieToList,
  removeMovieFromList,
  toggleFavourite,
  removeMovie,
  replaceMovieIds,
};
