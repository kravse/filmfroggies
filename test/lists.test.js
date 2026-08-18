const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
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
} = require("../scripts/lib/lists");

function idsIn(lists, listId) {
  return findList(lists, listId).movieIds;
}

function assertInvariants(lists) {
  const watchlist = idsIn(lists, WATCHLIST_ID);
  const watched = idsIn(lists, WATCHED_ID);

  for (const id of watchlist) {
    assert.ok(!watched.includes(id), `watchlisted ${id} must not be watched`);
  }
}

function listsFixture() {
  return [
    { id: WATCHED_ID, name: "Watched", movieIds: [1, 2] },
    { id: WATCHLIST_ID, name: "Watchlist", movieIds: [3] },
  ];
}

test("the two preset lists are fixed, in tab order", () => {
  assert.deepEqual(LIST_IDS, ["watched", "watchlist"]);
  assert.deepEqual(
    PRESET_LISTS.map((preset) => preset.name),
    ["Watched", "Watchlist"],
  );
  assert.equal(DEFAULT_LIST_ID, WATCHED_ID);
});

test("isListReorderable is true for both preset lists", () => {
  assert.equal(isListReorderable(WATCHED_ID), true);
  assert.equal(isListReorderable(WATCHLIST_ID), true);
});

test("isListId accepts only the presets", () => {
  assert.equal(isListId(WATCHED_ID), true);
  assert.equal(isListId("favourites"), false);
  assert.equal(isListId("my-custom-list"), false);
  assert.equal(isListId(undefined), false);
});

test("the fixture itself satisfies the invariants", () => {
  assertInvariants(listsFixture());
});

test("defaultLists gives two empty lists", () => {
  const lists = defaultLists();
  assert.equal(lists.length, 2);
  assert.deepEqual(
    lists.map((list) => list.movieIds),
    [[], []],
  );
});

test("normalizeMovieIds keeps order while dropping duplicates and junk", () => {
  assert.deepEqual(normalizeMovieIds([3, "7", 3, 0, -2, null, "abc", 5]), [3, 7, 5]);
});

test("normalizeLists rebuilds both lists and restores preset names", () => {
  const lists = normalizeLists([
    { id: WATCHED_ID, name: "Renamed", movieIds: [9] },
  ]);
  assert.deepEqual(
    lists.map((list) => list.id),
    LIST_IDS,
  );
  assert.equal(findList(lists, WATCHED_ID).name, "Watched");
  assert.deepEqual(idsIn(lists, WATCHED_ID), [9]);
});

test("normalizeLists drops list ids that are not presets", () => {
  const lists = normalizeLists([
    { id: "custom", name: "Custom", movieIds: [42] },
    { id: WATCHED_ID, name: "Watched", movieIds: [1] },
  ]);
  assert.equal(lists.length, 2);
  assert.equal(findList(lists, "custom"), null);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [1]);
});

test("normalizeLists merges legacy favourites into watched", () => {
  const lists = normalizeLists([
    { id: "favourites", name: "Favourites", movieIds: [7] },
    { id: WATCHED_ID, name: "Watched", movieIds: [] },
  ]);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [7]);
  assertInvariants(lists);
});

test("normalizeLists keeps favourites order and appends legacy watched-only ids", () => {
  const lists = normalizeLists([
    { id: "favourites", name: "Favourites", movieIds: [9] },
    { id: WATCHED_ID, name: "Watched", movieIds: [4, 5] },
  ]);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [9, 4, 5]);
});

test("normalizeLists resolves a watchlist conflict in favour of having watched", () => {
  const lists = normalizeLists([
    { id: "favourites", name: "Favourites", movieIds: [8] },
    { id: WATCHLIST_ID, name: "Watchlist", movieIds: [8, 9, 10] },
    { id: WATCHED_ID, name: "Watched", movieIds: [9] },
  ]);
  assert.deepEqual(idsIn(lists, WATCHLIST_ID), [10]);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [8, 9]);
  assertInvariants(lists);
});

test("normalizeLists falls back to defaults for junk input", () => {
  assert.deepEqual(normalizeLists(null), defaultLists());
  assert.deepEqual(normalizeLists([]), defaultLists());
  assert.deepEqual(normalizeLists([null, "nope"]), defaultLists());
});

test("findListIdsForMovie reports the list holding a movie", () => {
  const lists = listsFixture();
  assert.deepEqual(findListIdsForMovie(lists, 1), [WATCHED_ID]);
  assert.deepEqual(findListIdsForMovie(lists, 2), [WATCHED_ID]);
  assert.deepEqual(findListIdsForMovie(lists, 3), [WATCHLIST_ID]);
  assert.deepEqual(findListIdsForMovie(lists, 99), []);
});

test("primaryListIdForMovie returns watched or watchlist", () => {
  const lists = listsFixture();
  assert.equal(primaryListIdForMovie(lists, 1), WATCHED_ID);
  assert.equal(primaryListIdForMovie(lists, 3), WATCHLIST_ID);
  assert.equal(primaryListIdForMovie(lists, 99), null);
});

test("marking watched moves a watchlisted movie across", () => {
  const next = assignMovieToList(listsFixture(), WATCHED_ID, 3);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), []);
  assert.deepEqual(idsIn(next, WATCHED_ID), [1, 2, 3]);
  assertInvariants(next);
});

test("watchlisting a watched movie clears watched", () => {
  const next = assignMovieToList(listsFixture(), WATCHLIST_ID, 1);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2]);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), [3, 1]);
  assertInvariants(next);
});

test("assignMovieToList keeps the invariants through any sequence", () => {
  let lists = listsFixture();
  const order = [
    [WATCHLIST_ID, 1],
    [WATCHED_ID, 3],
    [WATCHED_ID, 1],
    [WATCHLIST_ID, 3],
    [WATCHED_ID, 2],
  ];
  for (const [listId, movieId] of order) {
    lists = assignMovieToList(lists, listId, movieId);
    assertInvariants(lists);
    assert.ok(idsIn(lists, listId).includes(movieId));
  }
});

test("assignMovieToList is a no-op when the status already holds", () => {
  const lists = listsFixture();
  assert.equal(assignMovieToList(lists, WATCHED_ID, 1), lists);
  assert.equal(assignMovieToList(lists, WATCHLIST_ID, 3), lists);
});

test("assignMovieToList rejects unknown lists and invalid ids", () => {
  const lists = listsFixture();
  assert.equal(assignMovieToList(lists, "custom", 9), lists);
  assert.equal(assignMovieToList(lists, WATCHED_ID, 0), lists);
  assert.equal(assignMovieToList(lists, WATCHED_ID, "abc"), lists);
});

test("assignMovieToList does not mutate the input", () => {
  const lists = listsFixture();
  assignMovieToList(lists, WATCHLIST_ID, 1);
  assert.deepEqual(lists[0].movieIds, [1, 2]);
  assert.deepEqual(lists[1].movieIds, [3]);
});

test("removing from watched drops it entirely", () => {
  const next = removeMovieFromList(listsFixture(), WATCHED_ID, 1);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2]);
  assertInvariants(next);
});

test("removing from the watchlist drops it entirely", () => {
  const next = removeMovieFromList(listsFixture(), WATCHLIST_ID, 3);
  assert.deepEqual(findListIdsForMovie(next, 3), []);
});

test("removeMovieFromList is a no-op when the movie is not in that list", () => {
  const lists = listsFixture();
  assert.equal(removeMovieFromList(lists, WATCHED_ID, 3), lists);
  assert.equal(removeMovieFromList(lists, WATCHLIST_ID, 99), lists);
  assert.equal(removeMovieFromList(lists, "custom", 1), lists);
});

test("replaceMovieIds commits a new order for watched", () => {
  const next = replaceMovieIds(listsFixture(), WATCHED_ID, [2, 1]);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2, 1]);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), [3]);
});

test("replaceMovieIds commits a new order for watchlist", () => {
  const next = replaceMovieIds(listsFixture(), WATCHLIST_ID, [9, 3]);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), [9, 3]);
});

test("replaceMovieIds ignores an unknown list", () => {
  const lists = listsFixture();
  assert.equal(replaceMovieIds(lists, "custom", [1]), lists);
});

test("replaceMovieIds copies the array so later mutation cannot leak in", () => {
  const order = [2, 1];
  const next = replaceMovieIds(listsFixture(), WATCHED_ID, order);
  order.push(999);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2, 1]);
});

test("isWatched and isOnWatchlist reflect membership", () => {
  const lists = listsFixture();
  assert.equal(isWatched(lists, 1), true);
  assert.equal(isOnWatchlist(lists, 1), false);
  assert.equal(isWatched(lists, 3), false);
  assert.equal(isOnWatchlist(lists, 3), true);
});

test("removeMovie drops a movie from every list", () => {
  const next = removeMovie(listsFixture(), 1);
  assert.deepEqual(findListIdsForMovie(next, 1), []);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2]);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), [3]);
  assertInvariants(next);
});
