/* Generated from scripts/lib/friend-view.js — run npm run bundle */

const appFriendView = (function () {
  /**
   * Friend list page: hash routing helpers and overview stats.
   */

  const FRIEND_HASH_RE = /^#friend\/(\d+)$/;

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

  function friendNavigationIds(sections, movieId) {
    if (movieId != null) {
      const section = friendSectionContainingMovie(sections, movieId);
      if (section) {
        return [...section.movieIds];
      }
    }
    return sections.flatMap((section) => section.movieIds);
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
    friendListSections,
    friendOverviewStats,
    friendSectionContainingMovie,
    friendNavigationIds,
    friendListNamesForMovie,
  };
})();
