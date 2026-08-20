const { test } = require("node:test");
const assert = require("node:assert/strict");

const { movieShareUrl, isMovieOwned } = require("../scripts/lib/movie-share");
const { defaultLists, assignMovieToList, WATCHED_ID, WATCHLIST_ID } = require("../scripts/lib/lists");
const {
  defaultCustomLists,
  createCustomList,
  addMovieToCustomList,
} = require("../scripts/lib/custom-lists");

const NOW = new Date("2026-08-19T12:00:00.000Z");

test("movieShareUrl writes #movie/{id} onto the current page origin", () => {
  assert.equal(
    movieShareUrl("https://example.com/app/", 550),
    "https://example.com/app/#movie/550",
  );
});

test("movieShareUrl replaces an existing hash and keeps the path", () => {
  assert.equal(
    movieShareUrl("https://example.com/app/#lists/custom-1", 42),
    "https://example.com/app/#movie/42",
  );
});

test("movieShareUrl rejects non-positive ids and unparseable hrefs", () => {
  assert.equal(movieShareUrl("https://example.com/", 0), "");
  assert.equal(movieShareUrl("https://example.com/", -1), "");
  assert.equal(movieShareUrl("https://example.com/", "nope"), "");
  assert.equal(movieShareUrl("not a url", 550), "");
});

test("isMovieOwned is false for an empty collection", () => {
  assert.equal(isMovieOwned(defaultLists(), defaultCustomLists(), 1), false);
  assert.equal(isMovieOwned(defaultLists(), defaultCustomLists(), 0), false);
});

test("isMovieOwned is true for watched or watchlist membership", () => {
  const watched = assignMovieToList(defaultLists(), WATCHED_ID, 7);
  const watchlist = assignMovieToList(defaultLists(), WATCHLIST_ID, 8);
  assert.equal(isMovieOwned(watched, defaultCustomLists(), 7), true);
  assert.equal(isMovieOwned(watchlist, defaultCustomLists(), 8), true);
  assert.equal(isMovieOwned(watched, defaultCustomLists(), 8), false);
});

test("isMovieOwned is true for custom-list-only membership", () => {
  const lists = createCustomList(defaultCustomLists(), "Noir", NOW);
  const listId = lists[0].id;
  const withMovie = addMovieToCustomList(lists, listId, 99, NOW);
  assert.equal(isMovieOwned(defaultLists(), withMovie, 99), true);
  assert.equal(isMovieOwned(defaultLists(), lists, 99), false);
});
