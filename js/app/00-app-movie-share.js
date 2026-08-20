/* Generated from scripts/lib/movie-share.js — run npm run bundle */

const appMovieShare = (function () {
  /**
   * Shareable movie URLs and whether a recipient already has the film.
   *
   * The link is always `#movie/{id}` on the current origin. Membership is any
   * preset list or custom list — custom-list-only still counts as owned.
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

  function movieShareUrl(pageHref, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return "";
    }
    try {
      const url = new URL(pageHref);
      url.hash = `#movie/${id}`;
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function isMovieOwned(lists, customLists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return false;
    }
    if (getLists().findListIdsForMovie(lists, id).length > 0) {
      return true;
    }
    return getCustomLists().customListsForMovie(customLists, id).length > 0;
  }

  return {
    movieShareUrl,
    isMovieOwned,
  };
})();
