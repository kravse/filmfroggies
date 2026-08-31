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
    statuses: { 2: { status: "watched", at: "2026-01-01T00:00:00.000Z" } },
  };
  const next = remapMovieState(state, 2, 3, NOW);
  assert.deepEqual(next.lists[0].movieIds, [1, 3]);
  assert.deepEqual(next.customLists[0].movieIds, [3]);
  assert.equal(next.ratings[3], 7);
  assert.equal(next.viewingHistory[3][0].id, "v");
  assert.equal(next.addedAt[3], "2026-01-01T00:00:00.000Z");
  assert.deepEqual(next.statuses[2], { status: "removed", at: NOW.toISOString() });
  assert.deepEqual(next.statuses[3], { status: "watched", at: NOW.toISOString() });
});

// The old hand-built entries used an `updatedAt` key, so every stamp parsed as
// null and the removal lost to any stale copy that still had the movie.
test("remapMovieState stamps survive a merge against a stale watched copy", () => {
  const { mergeUserStates } = require("../scripts/lib/sync-merge");
  const { normalizeUserState, defaultUserState } = require("../scripts/lib/user-state");

  const local = normalizeUserState({
    ...defaultUserState(),
    updatedAt: "2026-01-01T00:00:00.000Z",
    lists: [{ id: "watched", movieIds: [2] }, { id: "watchlist", movieIds: [] }],
    statuses: { 2: { status: "watched", at: "2026-01-01T00:00:00.000Z" } },
  });
  const remapped = remapMovieState(local, 2, 3, NOW);

  const staleRemote = normalizeUserState({
    ...defaultUserState(),
    updatedAt: "2026-01-01T00:00:00.000Z",
    lists: [{ id: "watched", movieIds: [2] }, { id: "watchlist", movieIds: [] }],
    statuses: { 2: { status: "watched", at: "2026-01-01T00:00:00.000Z" } },
  });

  const merged = normalizeUserState(mergeUserStates(remapped, staleRemote));
  const watched = merged.lists.find((list) => list.id === "watched").movieIds;
  assert.deepEqual(watched, [3]);
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
