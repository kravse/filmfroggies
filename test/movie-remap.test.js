const test = require("node:test");
const assert = require("node:assert/strict");
const { remapMovieState } = require("../scripts/lib/movie-remap");

const NOW = new Date("2026-08-19T20:00:00.000Z");

test("remapMovieState moves every movie-id keyed field and membership", () => {
  const state = {
    lists: [{ id: "watched", movieIds: [1, 2] }, { id: "watchlist", movieIds: [] }],
    customLists: [{ id: "custom-faves", name: "Faves", movieIds: [2], updatedAt: "2020-01-01T00:00:00.000Z" }],
    ratings: { 2: 7 },
    viewingHistory: { 2: [{ id: "v", watchedOn: "2026-01-01", updatedAt: "2026-01-01T00:00:00.000Z" }] },
    addedAt: { 2: "2026-01-01T00:00:00.000Z" },
    statuses: { 2: { status: "watched", updatedAt: "2026-01-01T00:00:00.000Z" } },
  };
  const next = remapMovieState(state, 2, 3, NOW);
  assert.deepEqual(next.lists[0].movieIds, [1, 3]);
  assert.deepEqual(next.customLists[0].movieIds, [3]);
  assert.equal(next.ratings[3], 7);
  assert.equal(next.viewingHistory[3][0].id, "v");
  assert.equal(next.addedAt[3], "2026-01-01T00:00:00.000Z");
  assert.deepEqual(next.statuses[2], { status: "removed", updatedAt: NOW.toISOString() });
  assert.deepEqual(next.statuses[3], { status: "watched", updatedAt: NOW.toISOString() });
});

test("remapMovieState refuses collisions and invalid replacements", () => {
  const state = { lists: [{ id: "watched", movieIds: [1, 2] }], customLists: [] };
  assert.throws(() => remapMovieState(state, 1, 2, NOW), /already/);
  assert.throws(() => remapMovieState(state, 1, 1, NOW), /different/);
});

test("remapMovieState refuses movies that are not watched", () => {
  const watchlistOnly = {
    lists: [{ id: "watched", movieIds: [] }, { id: "watchlist", movieIds: [1] }],
    customLists: [{ id: "custom-faves", name: "Faves", movieIds: [1], updatedAt: "2020-01-01T00:00:00.000Z" }],
  };
  assert.throws(() => remapMovieState(watchlistOnly, 1, 9, NOW), /watched/);

  const customOnly = {
    lists: [{ id: "watched", movieIds: [] }, { id: "watchlist", movieIds: [] }],
    customLists: [{ id: "custom-faves", name: "Faves", movieIds: [1], updatedAt: "2020-01-01T00:00:00.000Z" }],
  };
  assert.throws(() => remapMovieState(customOnly, 1, 9, NOW), /watched/);
});
