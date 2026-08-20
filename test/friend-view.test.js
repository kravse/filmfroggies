const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  parseFriendHash,
  buildFriendHash,
  friendListSections,
  friendOverviewStats,
  friendSectionContainingMovie,
  friendNavigationIds,
} = require("../scripts/lib/friend-view");
const { defaultUserState } = require("../scripts/lib/user-state");

test("parseFriendHash and buildFriendHash round-trip", () => {
  assert.deepEqual(parseFriendHash("#friend/42"), { userId: 42 });
  assert.equal(buildFriendHash(42), "#friend/42");
  assert.equal(parseFriendHash("#friend/0"), null);
  assert.equal(parseFriendHash("#friend/abc"), null);
  assert.equal(parseFriendHash("#lists/foo"), null);
});

test("friendListSections orders presets before custom lists and skips empty", () => {
  const friendState = {
    lists: [
      { id: "watched", name: "Watched", movieIds: [1, 2] },
      { id: "watchlist", name: "Watchlist", movieIds: [] },
    ],
    customLists: [
      { id: "custom-a", name: "Favorites", movieIds: [3] },
      { id: "custom-b", name: "Empty", movieIds: [] },
    ],
  };
  assert.deepEqual(friendListSections(friendState), [
    { id: "watched", name: "Watched", movieIds: [1, 2] },
    { id: "custom-a", name: "Favorites", movieIds: [3] },
  ]);
});

test("friendOverviewStats counts movies and overlap with viewer watched", () => {
  const friendState = {
    lists: [
      { id: "watched", name: "Watched", movieIds: [1, 2, 3] },
      { id: "watchlist", name: "Watchlist", movieIds: [4] },
    ],
    customLists: [{ id: "custom-a", name: "Sci-fi", movieIds: [2, 5] }],
    ratings: { 1: 8, 2: 7.5, 99: 6 },
  };
  const viewerState = defaultUserState();
  viewerState.lists = [
    { id: "watched", name: "Watched", movieIds: [2, 9] },
    { id: "watchlist", name: "Watchlist", movieIds: [] },
  ];

  assert.deepEqual(friendOverviewStats(friendState, viewerState), {
    watchedCount: 3,
    watchlistCount: 1,
    customListCount: 1,
    ratedCount: 3,
    overlapWatched: 1,
    totalMovies: 5,
    sectionCount: 3,
  });
});

test("friendNavigationIds prefers the section containing the active movie", () => {
  const sections = [
    { id: "watched", name: "Watched", movieIds: [1, 2] },
    { id: "watchlist", name: "Watchlist", movieIds: [3, 4] },
  ];
  assert.deepEqual(friendNavigationIds(sections, 3), [3, 4]);
  assert.deepEqual(friendNavigationIds(sections, null), [1, 2, 3, 4]);
  assert.equal(friendSectionContainingMovie(sections, 2)?.id, "watched");
});
