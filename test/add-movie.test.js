const { test } = require("node:test");
const assert = require("node:assert/strict");

const { applyAddMovie, hasAddMovieDestinations } = require("../scripts/lib/add-movie");
const { defaultUserState } = require("../scripts/lib/user-state");
const { isWatched, isOnWatchlist, WATCHED_ID, WATCHLIST_ID } = require("../scripts/lib/lists");
const { createCustomList, customListsForMovie } = require("../scripts/lib/custom-lists");
const { getRating } = require("../scripts/lib/ratings");
const { viewingEntries } = require("../scripts/lib/viewing-history");
const { getAddedAt } = require("../scripts/lib/added-at");
const { REMOVED_STATUS, setMovieStatus } = require("../scripts/lib/sync-merge");

const NOW = new Date("2026-08-19T12:00:00.000Z");

function stateWithCustomList() {
  const base = defaultUserState();
  return {
    ...base,
    customLists: createCustomList(base.customLists, "Noir", NOW),
  };
}

test("hasAddMovieDestinations requires a preset or at least one custom list", () => {
  assert.equal(hasAddMovieDestinations(null, []), false);
  assert.equal(hasAddMovieDestinations(WATCHED_ID, []), true);
  assert.equal(hasAddMovieDestinations(WATCHLIST_ID, ["custom-1"]), true);
  assert.equal(hasAddMovieDestinations(null, ["custom-1"]), true);
  assert.equal(hasAddMovieDestinations("nope", []), false);
});

test("applyAddMovie is a no-op without destinations or a valid id", () => {
  const state = defaultUserState();
  assert.equal(applyAddMovie(state, { movieId: 1 }, NOW), state);
  assert.equal(applyAddMovie(state, { movieId: 0, presetListId: WATCHED_ID }, NOW), state);
});

test("applyAddMovie to watched records status, addedAt, rating, and viewing", () => {
  const next = applyAddMovie(
    defaultUserState(),
    {
      movieId: 12,
      presetListId: WATCHED_ID,
      rating: 8.5,
      watchedOn: "2026-08-18",
    },
    NOW,
  );
  assert.equal(isWatched(next.lists, 12), true);
  assert.equal(isOnWatchlist(next.lists, 12), false);
  assert.equal(next.statuses["12"].status, "watched");
  assert.equal(next.statuses["12"].at, NOW.toISOString());
  assert.equal(getAddedAt(next.addedAt, 12), NOW.toISOString());
  assert.equal(getRating(next.ratings, 12), 8.5);
  assert.equal(viewingEntries(next.viewingHistory, 12)[0].watchedOn, "2026-08-18");
});

test("applyAddMovie to watchlist ignores rating and viewing date", () => {
  const next = applyAddMovie(
    defaultUserState(),
    {
      movieId: 12,
      presetListId: WATCHLIST_ID,
      rating: 9,
      watchedOn: "2026-08-18",
    },
    NOW,
  );
  assert.equal(isOnWatchlist(next.lists, 12), true);
  assert.equal(getRating(next.ratings, 12), null);
  assert.deepEqual(viewingEntries(next.viewingHistory, 12), []);
});

test("applyAddMovie can add only to a custom list", () => {
  const state = stateWithCustomList();
  const listId = state.customLists[0].id;
  const next = applyAddMovie(
    state,
    { movieId: 44, customListIds: [listId], rating: 7 },
    NOW,
  );
  assert.equal(isWatched(next.lists, 44), false);
  assert.equal(customListsForMovie(next.customLists, 44)[0].id, listId);
  assert.equal(getRating(next.ratings, 44), null);
  assert.equal(getAddedAt(next.addedAt, 44), null);
});

test("applyAddMovie can combine a preset with custom lists", () => {
  const state = stateWithCustomList();
  const listId = state.customLists[0].id;
  const next = applyAddMovie(
    state,
    { movieId: 44, presetListId: WATCHLIST_ID, customListIds: [listId] },
    NOW,
  );
  assert.equal(isOnWatchlist(next.lists, 44), true);
  assert.equal(customListsForMovie(next.customLists, 44).length, 1);
});

test("applyAddMovie restamps addedAt when re-adding a removed movie", () => {
  const removed = {
    ...defaultUserState(),
    statuses: setMovieStatus({}, 12, REMOVED_STATUS, new Date("2026-01-01T00:00:00.000Z")),
    addedAt: { 12: "2025-12-01T00:00:00.000Z" },
  };
  const next = applyAddMovie(
    removed,
    { movieId: 12, presetListId: WATCHLIST_ID },
    NOW,
  );
  assert.equal(getAddedAt(next.addedAt, 12), NOW.toISOString());
  assert.equal(next.statuses["12"].status, "watchlist");
});
