const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  REMOVED_STATUS,
  REMOVED_LIMIT,
  normalizeStatuses,
  setMovieStatus,
  mergeStatuses,
  mergeUserStates,
  statusOf,
  isRemoved,
} = require("../scripts/lib/sync-merge");

const T0 = "2026-08-01T00:00:00.000Z";
const T1 = "2026-08-02T00:00:00.000Z";
const T2 = "2026-08-03T00:00:00.000Z";
const T3 = "2026-08-04T00:00:00.000Z";

function listsOf(watched, watchlist) {
  return [
    { id: "watched", name: "Watched", movieIds: watched },
    { id: "watchlist", name: "Watchlist", movieIds: watchlist },
  ];
}

function statusMap(entries) {
  const out = {};
  for (const [id, status, at] of entries) {
    out[String(id)] = { status, at };
  }
  return out;
}

function state({ watched = [], watchlist = [], statuses, updatedAt = null, ratings = {}, addedAt = {} }) {
  return {
    updatedAt,
    lists: listsOf(watched, watchlist),
    ratings,
    addedAt,
    statuses: statuses || {},
  };
}

function idsIn(merged, listId) {
  return merged.lists.find((list) => list.id === listId).movieIds;
}

test("normalizeStatuses backfills list members from the payload stamp", () => {
  const statuses = normalizeStatuses(null, listsOf([1], [2]), T1);
  assert.deepEqual(statuses, {
    1: { status: "watched", at: T1 },
    2: { status: "watchlist", at: T1 },
  });
});

test("normalizeStatuses keeps removal records for ids in no list", () => {
  const statuses = normalizeStatuses(
    statusMap([[9, REMOVED_STATUS, T1]]),
    listsOf([1], []),
    T2,
  );
  assert.equal(statusOf(statuses, 9), REMOVED_STATUS);
  assert.equal(isRemoved(statuses, 9), true);
});

test("normalizeStatuses drops a removal record once the movie is back in a list", () => {
  const statuses = normalizeStatuses(
    statusMap([[9, REMOVED_STATUS, T1]]),
    listsOf([9], []),
    T2,
  );
  assert.equal(statusOf(statuses, 9), "watched");
  assert.equal(statuses["9"].at, T2, "a status that contradicts membership is restamped");
});

test("normalizeStatuses discards unknown statuses and bad ids", () => {
  const statuses = normalizeStatuses(
    { 5: { status: "favourites", at: T1 }, "-2": { status: "watched", at: T1 } },
    listsOf([], []),
    T1,
  );
  assert.deepEqual(statuses, {});
});

test("normalizeStatuses caps how many removal records are kept", () => {
  const raw = {};
  for (let index = 0; index < REMOVED_LIMIT + 25; index++) {
    raw[String(index + 1)] = {
      status: REMOVED_STATUS,
      at: new Date(Date.parse(T0) + index * 1000).toISOString(),
    };
  }
  const statuses = normalizeStatuses(raw, listsOf([], []), T1);
  assert.equal(Object.keys(statuses).length, REMOVED_LIMIT);
  assert.equal(statuses["1"], undefined, "the oldest removals are dropped first");
});

test("setMovieStatus stamps one movie without touching the others", () => {
  const base = statusMap([[1, "watched", T0]]);
  const next = setMovieStatus(base, 2, REMOVED_STATUS, new Date(T1));
  assert.equal(next["1"].at, T0);
  assert.deepEqual(next["2"], { status: REMOVED_STATUS, at: T1 });
  assert.equal(base["2"], undefined, "the input is not mutated");
});

test("setMovieStatus ignores invalid ids and statuses", () => {
  const base = statusMap([[1, "watched", T0]]);
  assert.equal(setMovieStatus(base, 0, "watched"), base);
  assert.equal(setMovieStatus(base, 1, "nonsense"), base);
});

test("mergeStatuses takes the newer stamp per movie", () => {
  const merged = mergeStatuses(
    statusMap([[1, "watchlist", T1]]),
    statusMap([[1, "watched", T2]]),
  );
  assert.deepEqual(merged["1"], { status: "watched", at: T2 });
});

test("mergeStatuses keeps an entry only one side knows about", () => {
  const merged = mergeStatuses(statusMap([[1, "watched", T1]]), statusMap([[2, "watched", T2]]));
  assert.equal(statusOf(merged, 1), "watched");
  assert.equal(statusOf(merged, 2), "watched");
});

test("mergeStatuses keeps the movie when stamps tie", () => {
  const merged = mergeStatuses(
    statusMap([[1, REMOVED_STATUS, T1]]),
    statusMap([[1, "watched", T1]]),
  );
  assert.equal(statusOf(merged, 1), "watched");
});

test("a stale tab does not drop a movie added elsewhere", () => {
  // The stale copy carries the newer payload stamp because acting on it touches
  // `updatedAt`, which is exactly the case a whole-payload merge got wrong.
  const stale = state({ watched: [1], statuses: statusMap([[1, "watched", T0]]), updatedAt: T3 });
  const remote = state({
    watched: [1, 3],
    statuses: statusMap([
      [1, "watched", T0],
      [3, "watched", T1],
    ]),
    updatedAt: T1,
  });

  const merged = mergeUserStates(stale, remote);
  assert.deepEqual(idsIn(merged, "watched"), [1, 3]);
});

test("a removal made elsewhere survives a stale tab with a newer payload stamp", () => {
  const stale = state({
    watched: [1, 2],
    statuses: statusMap([
      [1, "watched", T0],
      [2, "watched", T0],
    ]),
    updatedAt: T3,
  });
  const remote = state({
    watched: [1],
    statuses: statusMap([
      [1, "watched", T0],
      [2, REMOVED_STATUS, T1],
    ]),
    updatedAt: T1,
  });

  const merged = mergeUserStates(stale, remote);
  assert.deepEqual(idsIn(merged, "watched"), [1]);
  assert.equal(isRemoved(merged.statuses, 2), true);
});

test("re-adding a movie outranks an older removal", () => {
  const local = state({ watched: [5], statuses: statusMap([[5, "watched", T3]]), updatedAt: T3 });
  const remote = state({ statuses: statusMap([[5, REMOVED_STATUS, T1]]), updatedAt: T1 });

  const merged = mergeUserStates(local, remote);
  assert.deepEqual(idsIn(merged, "watched"), [5]);
});

test("the newer watched or watchlist change wins and stays disjoint", () => {
  const local = state({
    watchlist: [7],
    statuses: statusMap([[7, "watchlist", T1]]),
    updatedAt: T1,
  });
  const remote = state({ watched: [7], statuses: statusMap([[7, "watched", T2]]), updatedAt: T2 });

  const merged = mergeUserStates(local, remote);
  assert.deepEqual(idsIn(merged, "watched"), [7]);
  assert.deepEqual(idsIn(merged, "watchlist"), []);
});

test("merging orders by the newer payload and appends what only the older side has", () => {
  const newer = state({
    watched: [3, 1],
    statuses: statusMap([
      [3, "watched", T0],
      [1, "watched", T0],
    ]),
    updatedAt: T2,
  });
  const older = state({
    watched: [1, 3, 8],
    statuses: statusMap([
      [1, "watched", T0],
      [3, "watched", T0],
      [8, "watched", T1],
    ]),
    updatedAt: T1,
  });

  assert.deepEqual(idsIn(mergeUserStates(newer, older), "watched"), [3, 1, 8]);
});

test("merging a payload written before statuses existed keeps both sides' movies", () => {
  const legacyLocal = { updatedAt: T1, lists: listsOf([1], [2]), ratings: {} };
  const legacyRemote = { updatedAt: T2, lists: listsOf([3], []), ratings: {} };

  const merged = mergeUserStates(legacyLocal, legacyRemote);
  assert.deepEqual(idsIn(merged, "watched").sort((a, b) => a - b), [1, 3]);
  assert.deepEqual(idsIn(merged, "watchlist"), [2]);
});

test("merging unions ratings and lets the newer payload settle a conflict", () => {
  const newer = state({
    watched: [1, 2],
    statuses: statusMap([
      [1, "watched", T0],
      [2, "watched", T0],
    ]),
    ratings: { 1: 9 },
    updatedAt: T2,
  });
  const older = state({
    watched: [1, 2],
    statuses: statusMap([
      [1, "watched", T0],
      [2, "watched", T0],
    ]),
    ratings: { 1: 4, 2: 7 },
    updatedAt: T1,
  });

  assert.deepEqual(mergeUserStates(newer, older).ratings, { 1: 9, 2: 7 });
});

test("merging addedAt keeps the later stamp on conflict", () => {
  const newer = state({
    watched: [1],
    statuses: statusMap([[1, "watched", T0]]),
    addedAt: { 1: T2 },
    updatedAt: T2,
  });
  const older = state({
    watched: [1],
    statuses: statusMap([[1, "watched", T0]]),
    addedAt: { 1: T1 },
    updatedAt: T1,
  });

  assert.deepEqual(mergeUserStates(newer, older).addedAt, { 1: T2 });
});

test("mergeUserStates falls back to whichever side exists", () => {
  const local = state({ watched: [1], updatedAt: T1 });
  assert.equal(mergeUserStates(local, null), local);
  assert.equal(mergeUserStates(null, local), local);
  assert.equal(mergeUserStates(null, null), null);
});

test("mergeUserStates merges custom lists with per-list LWW", () => {
  const local = {
    ...state({ watched: [], updatedAt: T1 }),
    customLists: [
      {
        id: "custom-a",
        name: "Local",
        movieIds: [1],
        createdAt: T1,
        updatedAt: T1,
      },
    ],
    customListTombstones: {},
  };
  const remote = {
    ...state({ watched: [], updatedAt: T2 }),
    customLists: [
      {
        id: "custom-a",
        name: "Remote",
        movieIds: [1, 2],
        createdAt: T1,
        updatedAt: T2,
      },
    ],
    customListTombstones: {},
  };
  const merged = mergeUserStates(local, remote);
  assert.equal(merged.customLists.length, 1);
  assert.equal(merged.customLists[0].name, "Remote");
  assert.deepEqual(merged.customLists[0].movieIds, [1, 2]);
});
