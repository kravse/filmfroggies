/* Generated from scripts/lib/list-query.js — run npm run sync-worker-lib */

import * as lists from "./lists.js";
import * as customLists from "./custom-lists.js";
import * as sort from "./sort.js";
import * as ratings from "./ratings.js";
import * as addedAt from "./added-at.js";
import * as viewingHistory from "./viewing-history.js";
/**
 * Server-side sorted list ids from a synced user doc and movie metadata lookup.
 */








function parseListRoute(listId) {
  const id = String(listId || "").trim();
  if (id === lists.WATCHED_ID || id === lists.WATCHLIST_ID) {
    return { kind: "preset", listId: id };
  }
  if (customLists.isCustomListId(id)) {
    return { kind: "custom", listId: id };
  }
  return null;
}

function extractListMovieIds(userDoc, route) {
  if (!route) {
    return [];
  }
  const normalizedLists = lists.normalizeLists(userDoc?.lists);
  if (route.kind === "preset") {
    return lists.findList(normalizedLists, route.listId)?.movieIds || [];
  }
  const normalizedCustom = customLists.normalizeCustomLists(
    userDoc?.customLists,
    userDoc?.updatedAt,
  );
  return customLists.findCustomList(normalizedCustom, route.listId)?.movieIds || [];
}

function normalizeSortForList(route, rawSort, userDoc) {
  const fallback = userDoc?.preferences?.sort || sort.DEFAULT_PREFERENCE_SORT;
  if (route.kind === "preset" && route.listId === lists.WATCHED_ID) {
    return sort.normalizeWatchedSort(rawSort ?? fallback);
  }
  return sort.normalizeSort(rawSort ?? fallback);
}

function buildSortContext(movieIds, route, options = {}) {
  const ownerDoc = options.ownerDoc || options.userDoc;
  const viewerDoc = options.viewerDoc || ownerDoc;
  const friendView = options.friendView === true;

  const normalizedLists = lists.normalizeLists(ownerDoc?.lists);
  const normalizedCustom = customLists.normalizeCustomLists(
    ownerDoc?.customLists,
    ownerDoc?.updatedAt,
  );
  const ownerRatings = ratings.normalizeRatings(
    ownerDoc?.ratings,
    normalizedLists,
    normalizedCustom,
  );
  const viewerRatings = ratings.normalizeRatings(
    viewerDoc?.ratings,
    lists.normalizeLists(viewerDoc?.lists),
    customLists.normalizeCustomLists(viewerDoc?.customLists, viewerDoc?.updatedAt),
  );
  const viewerAddedAt = addedAt.normalizeAddedAt(
    viewerDoc?.addedAt,
    lists.normalizeLists(viewerDoc?.lists),
  );
  const ownerViewing = viewingHistory.normalizeViewingHistory(ownerDoc?.viewingHistory);
  const viewerViewing = viewingHistory.normalizeViewingHistory(viewerDoc?.viewingHistory);
  const watchedViewing = friendView ? ownerViewing : viewerViewing;

  const getMovieRecord =
    typeof options.getMovieRecord === "function" ? options.getMovieRecord : () => null;

  const sortMode = sort.resolveSortMode(options.sort, { friendView });

  const sortContext = {
    getRecord: (id) => getMovieRecord(id),
    getUserRating: (id) => ratings.getRating(viewerRatings, id),
    getFriendRating: (id) => ratings.getRating(ownerRatings, id),
    getAddedAt: (id) => addedAt.getAddedAt(viewerAddedAt, id),
    getWatchedOn: (id) => viewingHistory.latestViewingDate(watchedViewing, id),
  };

  if (sort.getSortField(sortMode) === "watched") {
    const latestByMovie = new Map();
    for (const [movieId, entries] of Object.entries(watchedViewing)) {
      let latest = null;
      for (const entry of entries) {
        if (!entry.deletedAt && (!latest || entry.watchedOn > latest)) {
          latest = entry.watchedOn;
        }
      }
      if (latest) {
        latestByMovie.set(Number(movieId), latest);
      }
    }
    sortContext.getWatchedOn = (id) => latestByMovie.get(Number(id)) ?? null;
  }

  if (route.kind === "custom" || friendView) {
    const joinOrder = sort.buildOrderIndex(movieIds);
    sortContext.getListJoinIndex = (id) => joinOrder.get(Number(id)) ?? null;
  }

  return { sortContext, sortMode };
}

function sortNeedsMovieMetadata(sortMode) {
  const field = sort.getSortField(sort.normalizeSort(sortMode));
  return field === "title" || field === "year" || field === "rating";
}

function sortedListIds(options = {}) {
  const userDoc = options.userDoc;
  const listId = options.listId;
  const route = parseListRoute(listId);
  if (!route) {
    return {
      listId: String(listId || ""),
      sort: sort.normalizeSort(options.sort),
      ids: [],
    };
  }

  const movieIds = extractListMovieIds(userDoc, route);

  if (route.listId === lists.WATCHLIST_ID) {
    return { listId: route.listId, sort: sort.DEFAULT_SORT, ids: [...movieIds] };
  }

  const normalizedSort = normalizeSortForList(route, options.sort, userDoc);
  const { sortContext, sortMode } = buildSortContext(movieIds, route, {
    userDoc,
    ownerDoc: options.ownerDoc || userDoc,
    viewerDoc: options.viewerDoc || userDoc,
    friendView: options.friendView === true,
    sort: normalizedSort,
    getMovieRecord: options.getMovieRecord,
  });

  return {
    listId: route.listId,
    sort: sortMode,
    ids: sort.sortMovieIds(movieIds, sortMode, sortContext),
  };
}

function listMovieIds(userDoc, listId) {
  return extractListMovieIds(userDoc, parseListRoute(listId));
}

function resolveListSort(userDoc, listId, rawSort) {
  const route = parseListRoute(listId);
  if (!route) {
    return sort.normalizeSort(rawSort);
  }
  if (route.listId === lists.WATCHLIST_ID) {
    return sort.DEFAULT_SORT;
  }
  return normalizeSortForList(route, rawSort, userDoc);
}

export { parseListRoute, listMovieIds, resolveListSort, sortNeedsMovieMetadata, sortedListIds };
