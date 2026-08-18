const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  FAVOURITES_ID,
  WATCHLIST_ID,
  WATCHED_ID,
  PRESET_LISTS,
  LIST_IDS,
  DEFAULT_LIST_ID,
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
} = require("../scripts/lib/lists");

function idsIn(lists, listId) {
  return findList(lists, listId).movieIds;
}

/** Both invariants, asserted directly so every mutation test can reuse them. */
function assertInvariants(lists) {
  const favourites = idsIn(lists, FAVOURITES_ID);
  const watchlist = idsIn(lists, WATCHLIST_ID);
  const watched = idsIn(lists, WATCHED_ID);

  for (const id of favourites) {
    assert.ok(watched.includes(id), `favourite ${id} must also be watched`);
  }
  for (const id of watchlist) {
    assert.ok(!watched.includes(id), `watchlisted ${id} must not be watched`);
    assert.ok(!favourites.includes(id), `watchlisted ${id} must not be favourited`);
  }
}

function listsFixture() {
  // 1 is favourited (so also watched), 2 is watched only, 3 is on the watchlist.
  return [
    { id: FAVOURITES_ID, name: "Favourites", movieIds: [1] },
    { id: WATCHLIST_ID, name: "Watchlist", movieIds: [3] },
    { id: WATCHED_ID, name: "Watched", movieIds: [1, 2] },
  ];
}

test("the three preset lists are fixed, in tab order", () => {
  assert.deepEqual(LIST_IDS, ["favourites", "watchlist", "watched"]);
  assert.deepEqual(
    PRESET_LISTS.map((preset) => preset.name),
    ["Favourites", "Watchlist", "Watched"],
  );
  assert.equal(DEFAULT_LIST_ID, FAVOURITES_ID);
});

test("isListId accepts only the presets", () => {
  assert.equal(isListId(WATCHED_ID), true);
  assert.equal(isListId("my-custom-list"), false);
  assert.equal(isListId(undefined), false);
});

test("the fixture itself satisfies the invariants", () => {
  assertInvariants(listsFixture());
});

test("defaultLists gives three empty lists", () => {
  const lists = defaultLists();
  assert.equal(lists.length, 3);
  assert.deepEqual(
    lists.map((list) => list.movieIds),
    [[], [], []],
  );
});

test("normalizeMovieIds keeps order while dropping duplicates and junk", () => {
  assert.deepEqual(normalizeMovieIds([3, "7", 3, 0, -2, null, "abc", 5]), [3, 7, 5]);
});

test("normalizeLists rebuilds all three lists and restores preset names", () => {
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
    { id: FAVOURITES_ID, name: "Favourites", movieIds: [1] },
  ]);
  assert.equal(lists.length, 3);
  assert.equal(findList(lists, "custom"), null);
  assert.deepEqual(idsIn(lists, FAVOURITES_ID), [1]);
});

test("normalizeLists marks a stored favourite as watched", () => {
  const lists = normalizeLists([
    { id: FAVOURITES_ID, name: "Favourites", movieIds: [7] },
    { id: WATCHED_ID, name: "Watched", movieIds: [] },
  ]);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [7]);
  assertInvariants(lists);
});

test("normalizeLists keeps watched order and appends missing favourites", () => {
  const lists = normalizeLists([
    { id: FAVOURITES_ID, name: "Favourites", movieIds: [9] },
    { id: WATCHED_ID, name: "Watched", movieIds: [4, 5] },
  ]);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [4, 5, 9]);
});

test("normalizeLists resolves a watchlist conflict in favour of having watched", () => {
  const lists = normalizeLists([
    { id: FAVOURITES_ID, name: "Favourites", movieIds: [8] },
    { id: WATCHLIST_ID, name: "Watchlist", movieIds: [8, 9, 10] },
    { id: WATCHED_ID, name: "Watched", movieIds: [9] },
  ]);
  assert.deepEqual(idsIn(lists, WATCHLIST_ID), [10]);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [9, 8]);
  assertInvariants(lists);
});

test("normalizeLists falls back to defaults for junk input", () => {
  assert.deepEqual(normalizeLists(null), defaultLists());
  assert.deepEqual(normalizeLists([]), defaultLists());
  assert.deepEqual(normalizeLists([null, "nope"]), defaultLists());
});

test("findListIdsForMovie reports every list holding a movie", () => {
  const lists = listsFixture();
  assert.deepEqual(findListIdsForMovie(lists, 1), [FAVOURITES_ID, WATCHED_ID]);
  assert.deepEqual(findListIdsForMovie(lists, 2), [WATCHED_ID]);
  assert.deepEqual(findListIdsForMovie(lists, 3), [WATCHLIST_ID]);
  assert.deepEqual(findListIdsForMovie(lists, 99), []);
});

test("primaryListIdForMovie prefers favourited over merely watched", () => {
  const lists = listsFixture();
  assert.equal(primaryListIdForMovie(lists, 1), FAVOURITES_ID);
  assert.equal(primaryListIdForMovie(lists, 2), WATCHED_ID);
  assert.equal(primaryListIdForMovie(lists, 3), WATCHLIST_ID);
  assert.equal(primaryListIdForMovie(lists, 99), null);
});

test("favouriting also marks a movie watched", () => {
  const next = assignMovieToList(listsFixture(), FAVOURITES_ID, 5);
  assert.deepEqual(idsIn(next, FAVOURITES_ID), [1, 5]);
  assert.deepEqual(idsIn(next, WATCHED_ID), [1, 2, 5]);
  assertInvariants(next);
});

test("favouriting a watchlisted movie takes it off the watchlist", () => {
  const next = assignMovieToList(listsFixture(), FAVOURITES_ID, 3);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), []);
  assert.deepEqual(idsIn(next, FAVOURITES_ID), [1, 3]);
  assert.deepEqual(idsIn(next, WATCHED_ID), [1, 2, 3]);
  assertInvariants(next);
});

test("marking watched leaves an existing favourite alone", () => {
  const lists = listsFixture();
  assert.equal(assignMovieToList(lists, WATCHED_ID, 1), lists);
});

test("marking a watchlisted movie watched moves it across", () => {
  const next = assignMovieToList(listsFixture(), WATCHED_ID, 3);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), []);
  assert.deepEqual(idsIn(next, WATCHED_ID), [1, 2, 3]);
  assert.deepEqual(idsIn(next, FAVOURITES_ID), [1]);
  assertInvariants(next);
});

test("watchlisting a favourite clears both favourite and watched", () => {
  const next = assignMovieToList(listsFixture(), WATCHLIST_ID, 1);
  assert.deepEqual(idsIn(next, FAVOURITES_ID), []);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2]);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), [3, 1]);
  assertInvariants(next);
});

test("assignMovieToList keeps the invariants through any sequence", () => {
  let lists = listsFixture();
  const order = [
    [WATCHLIST_ID, 1],
    [FAVOURITES_ID, 3],
    [WATCHED_ID, 1],
    [FAVOURITES_ID, 1],
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
  assert.equal(assignMovieToList(lists, FAVOURITES_ID, 1), lists);
  assert.equal(assignMovieToList(lists, WATCHLIST_ID, 3), lists);
});

test("assignMovieToList rejects unknown lists and invalid ids", () => {
  const lists = listsFixture();
  assert.equal(assignMovieToList(lists, "custom", 9), lists);
  assert.equal(assignMovieToList(lists, FAVOURITES_ID, 0), lists);
  assert.equal(assignMovieToList(lists, FAVOURITES_ID, "abc"), lists);
});

test("assignMovieToList does not mutate the input", () => {
  const lists = listsFixture();
  assignMovieToList(lists, WATCHLIST_ID, 1);
  assert.deepEqual(lists[0].movieIds, [1]);
  assert.deepEqual(lists[2].movieIds, [1, 2]);
});

test("un-favouriting leaves the movie watched", () => {
  const next = removeMovieFromList(listsFixture(), FAVOURITES_ID, 1);
  assert.deepEqual(idsIn(next, FAVOURITES_ID), []);
  assert.deepEqual(idsIn(next, WATCHED_ID), [1, 2]);
  assertInvariants(next);
});

test("un-watching also drops the favourite, since favourites are watched", () => {
  const next = removeMovieFromList(listsFixture(), WATCHED_ID, 1);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2]);
  assert.deepEqual(idsIn(next, FAVOURITES_ID), []);
  assertInvariants(next);
});

test("removing from the watchlist drops it entirely", () => {
  const next = removeMovieFromList(listsFixture(), WATCHLIST_ID, 3);
  assert.deepEqual(findListIdsForMovie(next, 3), []);
});

test("removeMovieFromList is a no-op when the movie is not in that list", () => {
  const lists = listsFixture();
  assert.equal(removeMovieFromList(lists, FAVOURITES_ID, 2), lists);
  assert.equal(removeMovieFromList(lists, WATCHLIST_ID, 99), lists);
  assert.equal(removeMovieFromList(lists, "custom", 1), lists);
});

test("replaceMovieIds commits a new order for one list only", () => {
  const next = replaceMovieIds(listsFixture(), WATCHED_ID, [2, 1]);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2, 1]);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), [3]);
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

test("isFavourited, isWatched, and isOnWatchlist reflect membership", () => {
  const lists = listsFixture();
  assert.equal(isFavourited(lists, 1), true);
  assert.equal(isWatched(lists, 1), true);
  assert.equal(isOnWatchlist(lists, 1), false);
  assert.equal(isFavourited(lists, 2), false);
  assert.equal(isWatched(lists, 2), true);
  assert.equal(isOnWatchlist(lists, 3), true);
});

test("toggleFavourite adds and removes favourite without leaving watched", () => {
  let lists = listsFixture();
  lists = toggleFavourite(lists, 2);
  assert.deepEqual(idsIn(lists, FAVOURITES_ID), [1, 2]);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [1, 2]);
  lists = toggleFavourite(lists, 2);
  assert.deepEqual(idsIn(lists, FAVOURITES_ID), [1]);
  assert.deepEqual(idsIn(lists, WATCHED_ID), [1, 2]);
  assertInvariants(lists);
});

test("toggleFavourite is a no-op for watchlisted movies", () => {
  const lists = listsFixture();
  assert.equal(toggleFavourite(lists, 3), lists);
});

test("removeMovie drops a movie from every list", () => {
  const next = removeMovie(listsFixture(), 1);
  assert.deepEqual(findListIdsForMovie(next, 1), []);
  assert.deepEqual(idsIn(next, WATCHED_ID), [2]);
  assert.deepEqual(idsIn(next, WATCHLIST_ID), [3]);
  assertInvariants(next);
});
