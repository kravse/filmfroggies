/* Generated from scripts/lib/add-movie.js — run npm run bundle */

const appAddMovie = (function () {
  /**
   * Apply an add-movie choice to user state: optional preset, custom lists,
   * and Watched-only rating / viewing date.
   *
   * Callers persist. This function does not bump `updatedAt`.
   */

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
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
    if (typeof appViewingHistory !== "undefined") {
      return appViewingHistory;
    }
    if (typeof require === "function") {
      return require("./viewing-history");
    }
    throw new Error("appViewingHistory is not available");
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

  function hasAddMovieDestinations(presetListId, customListIds) {
    if (getLists().isListId(presetListId)) {
      return true;
    }
    return Array.isArray(customListIds) && customListIds.length > 0;
  }

  function applyAddMovie(userState, options = {}, now = new Date()) {
    if (!userState || typeof userState !== "object") {
      return userState;
    }

    const movieId = Number(options.movieId);
    const presetListId = options.presetListId ?? null;
    const customListIds = Array.isArray(options.customListIds)
      ? options.customListIds
      : [];
    const rating = options.rating;
    const watchedOn = options.watchedOn || null;

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return userState;
    }
    if (!hasAddMovieDestinations(presetListId, customListIds)) {
      return userState;
    }

    const listsLib = getLists();
    const customLib = getCustomLists();
    const ratingsLib = getRatings();
    const addedAtLib = getAddedAt();
    const viewingLib = getViewingHistory();
    const syncMerge = getSyncMerge();

    let next = userState;
    let changed = false;

    if (listsLib.isListId(presetListId)) {
      const nextLists = listsLib.assignMovieToList(next.lists, presetListId, movieId);
      if (nextLists !== next.lists) {
        changed = true;
        const readded = syncMerge.isRemoved(next.statuses, movieId);
        next = {
          ...next,
          lists: nextLists,
          ratings: ratingsLib.normalizeRatings(
            next.ratings,
            nextLists,
            next.customLists,
          ),
          addedAt: addedAtLib.recordAddedAt(next.addedAt, movieId, now, { readded }),
          statuses: syncMerge.setMovieStatus(
            next.statuses,
            movieId,
            presetListId,
            now,
          ),
        };
      }
    }

    let nextCustomLists = next.customLists;
    for (const listId of customListIds) {
      const updated = customLib.addMovieToCustomList(
        nextCustomLists,
        listId,
        movieId,
        now,
      );
      if (updated !== nextCustomLists) {
        nextCustomLists = updated;
        changed = true;
      }
    }
    if (nextCustomLists !== next.customLists) {
      next = { ...next, customLists: nextCustomLists };
    }

    if (
      presetListId === listsLib.WATCHED_ID &&
      listsLib.isWatched(next.lists, movieId)
    ) {
      if (rating != null) {
        const nextRatings = ratingsLib.setRating(next.ratings, movieId, rating);
        if (nextRatings !== next.ratings) {
          next = { ...next, ratings: nextRatings };
          changed = true;
        }
      }
      if (watchedOn) {
        const nextHistory = viewingLib.addViewing(
          next.viewingHistory,
          movieId,
          watchedOn,
          now,
        );
        if (nextHistory !== next.viewingHistory) {
          next = { ...next, viewingHistory: nextHistory };
          changed = true;
        }
      }
    }

    return changed ? next : userState;
  }

  return {
    hasAddMovieDestinations,
    applyAddMovie,
  };
})();
