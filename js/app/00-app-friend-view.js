/* Generated from scripts/lib/friend-view.js — run npm run bundle */

const appFriendView = (function () {
  /**
   * Friend list page: hash routing helpers and overview stats.
   */

  const FRIEND_HASH_RE = /^#friend\/(\d+)$/;
  const FRIENDS_INDEX_HASH = "#friends";

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function parseFriendHash(hash) {
    const match = FRIEND_HASH_RE.exec(hash || "");
    if (!match) {
      return null;
    }
    const userId = Number(match[1]);
    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }
    return { userId };
  }

  function buildFriendHash(userId) {
    const id = Number(userId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid friend user id");
    }
    return `#friend/${id}`;
  }

  function parseFriendsIndexHash(hash) {
    const normalized = hash || "";
    return normalized === FRIENDS_INDEX_HASH || normalized === `${FRIENDS_INDEX_HASH}/`;
  }

  function buildFriendsIndexHash() {
    return FRIENDS_INDEX_HASH;
  }

  function friendListSections(friendState) {
    if (!friendState) {
      return [];
    }
    const lists = getLists();
    const sections = [];
    for (const preset of lists.PRESET_LISTS) {
      const list = lists.findList(friendState.lists, preset.id);
      const movieIds = list?.movieIds || [];
      if (movieIds.length) {
        sections.push({ id: preset.id, name: preset.name, movieIds: [...movieIds] });
      }
    }
    for (const custom of friendState.customLists || []) {
      if (custom.movieIds?.length) {
        sections.push({ id: custom.id, name: custom.name, movieIds: [...custom.movieIds] });
      }
    }
    return sections;
  }

  function friendOverviewStats(friendState, viewerState) {
    const lists = getLists();
    const watched =
      lists.findList(friendState?.lists, lists.WATCHED_ID)?.movieIds || [];
    const watchlist =
      lists.findList(friendState?.lists, lists.WATCHLIST_ID)?.movieIds || [];
    const customLists = friendState?.customLists || [];
    const customListCount = customLists.filter((list) => list.movieIds?.length).length;

    let ratedCount = 0;
    const ratings = friendState?.ratings || {};
    for (const key of Object.keys(ratings)) {
      if (ratings[key] != null) {
        ratedCount += 1;
      }
    }

    const yourWatched = new Set(
      lists.findList(viewerState?.lists, lists.WATCHED_ID)?.movieIds || [],
    );
    let overlapWatched = 0;
    for (const id of watched) {
      if (yourWatched.has(id)) {
        overlapWatched += 1;
      }
    }

    const sections = friendListSections(friendState);
    const totalMovies = new Set(sections.flatMap((section) => section.movieIds)).size;

    return {
      watchedCount: watched.length,
      watchlistCount: watchlist.length,
      customListCount,
      ratedCount,
      overlapWatched,
      totalMovies,
      sectionCount: sections.length,
    };
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

  function getRatings() {
    if (typeof appRatings !== "undefined") {
      return appRatings;
    }
    if (typeof require === "function") {
      return require("./ratings");
    }
    throw new Error("appRatings is not available");
  }

  function getAddedAtLib() {
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

  function friendSortContext(sectionMovieIds, viewerState, _friendState, runtimeContext = {}) {
    const sortLib = getSort();
    const sortMode = runtimeContext.sortMode ?? sortLib.DEFAULT_PREFERENCE_SORT;
    const getRecord =
      typeof runtimeContext.getRecord === "function" ? runtimeContext.getRecord : () => null;
    const ratingsLib = getRatings();
    const addedAtLib = getAddedAtLib();
    const viewingHistoryLib = getViewingHistory();

    const sortContext = {
      getRecord,
      getUserRating: (id) => ratingsLib.getRating(viewerState?.ratings, id),
      getFriendRating: (id) => ratingsLib.getRating(_friendState?.ratings, id),
      getAddedAt: (id) => addedAtLib.getAddedAt(viewerState?.addedAt, id),
      getWatchedOn: (id) => viewingHistoryLib.latestViewingDate(viewerState?.viewingHistory, id),
    };

    const joinOrder = sortLib.buildOrderIndex(sectionMovieIds);
    sortContext.getListJoinIndex = (id) => joinOrder.get(Number(id)) ?? null;

    if (sortLib.getSortField(sortMode) === "watched") {
      const latestByMovie = new Map();
      const normalized = viewingHistoryLib.normalizeViewingHistory(viewerState?.viewingHistory);
      for (const [movieId, entries] of Object.entries(normalized)) {
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

    return sortContext;
  }

  function friendSectionSortedIds(section, sortMode, viewerState, friendState, runtimeContext = {}) {
    return getSort().sortMovieIds(
      section.movieIds,
      sortMode,
      friendSortContext(section.movieIds, viewerState, friendState, {
        ...runtimeContext,
        sortMode,
      }),
    );
  }

  function friendSectionContainingMovie(sections, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }
    for (const section of sections) {
      if (section.movieIds.includes(id)) {
        return section;
      }
    }
    return null;
  }

  function friendNavigationIds(sections, movieId, options = {}) {
    const sortMode = options.sortMode ?? null;
    const viewerState = options.viewerState ?? null;
    const friendState = options.friendState ?? null;
    const runtimeContext = options.runtimeContext ?? {};

    function idsForSection(section) {
      if (sortMode == null) {
        return [...section.movieIds];
      }
      return friendSectionSortedIds(section, sortMode, viewerState, friendState, runtimeContext);
    }

    if (movieId != null) {
      const section = friendSectionContainingMovie(sections, movieId);
      if (section) {
        return idsForSection(section);
      }
    }
    return sections.flatMap((section) => idsForSection(section));
  }

  function friendListNamesForMovie(friendState, movieId) {
    const id = Number(movieId);
    if (!friendState || !Number.isInteger(id) || id <= 0) {
      return [];
    }
    return friendListSections(friendState)
      .filter((section) => section.movieIds.includes(id))
      .map((section) => section.name);
  }

  return {
    parseFriendHash,
    buildFriendHash,
    parseFriendsIndexHash,
    buildFriendsIndexHash,
    FRIENDS_INDEX_HASH,
    friendListSections,
    friendOverviewStats,
    friendSortContext,
    friendSectionSortedIds,
    friendSectionContainingMovie,
    friendNavigationIds,
    friendListNamesForMovie,
  };
})();
