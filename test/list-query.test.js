const { test } = require("node:test");
const assert = require("node:assert/strict");

const { sortMovieIds } = require("../scripts/lib/sort");
const {
  parseListRoute,
  sortNeedsMovieMetadata,
  sortedListIds,
} = require("../scripts/lib/list-query");

function movie(id, { title, releaseDate, voteAverage } = {}) {
  return {
    id,
    title: title || `Movie ${id}`,
    releaseDate: releaseDate ?? null,
    voteAverage: voteAverage ?? null,
  };
}

function userDoc(overrides = {}) {
  return {
    lists: [
      { id: "watched", name: "Watched", movieIds: overrides.watched ?? [3, 1, 2] },
      { id: "watchlist", name: "Watchlist", movieIds: overrides.watchlist ?? [4] },
    ],
    preferences: { sort: overrides.sort ?? "user-rating-desc" },
    ratings: overrides.ratings ?? {},
    addedAt: overrides.addedAt ?? {},
    viewingHistory: overrides.viewingHistory ?? {},
    customLists: overrides.customLists ?? [],
    updatedAt: overrides.updatedAt ?? "2026-01-01T00:00:00.000Z",
  };
}

function recordMap(records) {
  const byId = new Map(records.map((entry) => [entry.id, entry]));
  return (id) => byId.get(Number(id)) || null;
}

test("parseListRoute accepts preset and custom list ids", () => {
  assert.deepEqual(parseListRoute("watched"), { kind: "preset", listId: "watched" });
  assert.deepEqual(parseListRoute("watchlist"), { kind: "preset", listId: "watchlist" });
  assert.deepEqual(parseListRoute("custom-abc"), { kind: "custom", listId: "custom-abc" });
  assert.equal(parseListRoute("bad"), null);
});

test("sortNeedsMovieMetadata is true only for title, year, and fan rating", () => {
  assert.equal(sortNeedsMovieMetadata("title-desc"), true);
  assert.equal(sortNeedsMovieMetadata("year-asc"), true);
  assert.equal(sortNeedsMovieMetadata("rating-desc"), true);
  assert.equal(sortNeedsMovieMetadata("user-rating-desc"), false);
  assert.equal(sortNeedsMovieMetadata("added-desc"), false);
});

test("watchlist ignores sort and returns stored order", () => {
  const doc = userDoc({ watchlist: [9, 8, 7], sort: "title-desc" });
  const result = sortedListIds({
    userDoc: doc,
    listId: "watchlist",
    sort: "title-desc",
    getMovieRecord: recordMap([
      movie(9, { title: "Zulu" }),
      movie(8, { title: "Alpha" }),
      movie(7, { title: "Bravo" }),
    ]),
  });
  assert.deepEqual(result.ids, [9, 8, 7]);
  assert.equal(result.sort, "custom");
});

test("invalid list id returns empty ids", () => {
  const result = sortedListIds({ userDoc: userDoc(), listId: "nope" });
  assert.deepEqual(result.ids, []);
});

test("sortedListIds matches client sort for metadata modes", () => {
  const records = [
    movie(1, { title: "Charlie", releaseDate: "2020-01-01", voteAverage: 6 }),
    movie(2, { title: "Alpha", releaseDate: "2019-01-01", voteAverage: 8 }),
    movie(3, { title: "Bravo", releaseDate: "2021-01-01", voteAverage: 7 }),
  ];
  const doc = userDoc({ watched: [1, 2, 3] });
  const getRecord = recordMap(records);
  const context = { getRecord };

  for (const mode of ["title-asc", "title-desc", "year-asc", "year-desc", "rating-asc", "rating-desc"]) {
    const expected = sortMovieIds([1, 2, 3], mode, context);
    const result = sortedListIds({
      userDoc: doc,
      listId: "watched",
      sort: mode,
      getMovieRecord: getRecord,
    });
    assert.deepEqual(result.ids, expected, mode);
  }
});

test("sortedListIds matches client sort for user state modes", () => {
  const { normalizeLists } = require("../scripts/lib/lists");
  const { normalizeAddedAt, getAddedAt } = require("../scripts/lib/added-at");
  const { normalizeRatings, getRating } = require("../scripts/lib/ratings");
  const {
    normalizeViewingHistory,
    latestViewingDate,
  } = require("../scripts/lib/viewing-history");

  const doc = userDoc({
    watched: [1, 2, 3, 4],
    ratings: { 1: 9, 3: 7.5 },
    addedAt: {
      1: "2026-01-01T00:00:00.000Z",
      2: "2026-06-01T00:00:00.000Z",
      3: "2026-03-01T00:00:00.000Z",
    },
    viewingHistory: {
      1: [{ id: "v1", watchedOn: "2026-01-01", updatedAt: "2026-01-01T00:00:00.000Z" }],
      2: [{ id: "v2", watchedOn: "2026-06-01", updatedAt: "2026-06-01T00:00:00.000Z" }],
      3: [{ id: "v3", watchedOn: "2026-03-01", updatedAt: "2026-03-01T00:00:00.000Z" }],
    },
  });
  const lists = normalizeLists(doc.lists);
  const normalizedAddedAt = normalizeAddedAt(doc.addedAt, lists);
  const normalizedRatings = normalizeRatings(doc.ratings, lists, []);
  const normalizedViewing = normalizeViewingHistory(doc.viewingHistory);
  const getRecord = recordMap([movie(1), movie(2), movie(3), movie(4)]);

  const latestByMovie = new Map();
  for (const [movieId, entries] of Object.entries(normalizedViewing)) {
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

  for (const mode of [
    "user-rating-desc",
    "added-desc",
    "added-asc",
    "watched-desc",
    "watched-asc",
  ]) {
    const expected = sortMovieIds([1, 2, 3, 4], mode, {
      getRecord,
      getUserRating: (id) => getRating(normalizedRatings, id),
      getAddedAt: (id) => getAddedAt(normalizedAddedAt, id),
      getWatchedOn: (id) => latestByMovie.get(Number(id)) ?? null,
    });
    const result = sortedListIds({
      userDoc: doc,
      listId: "watched",
      sort: mode,
      getMovieRecord: getRecord,
    });
    assert.deepEqual(result.ids, expected, mode);
  }
});

test("custom list added sort uses list join index", () => {
  const doc = userDoc({
    watched: [],
    customLists: [
      {
        id: "custom-a",
        name: "Favorites",
        movieIds: [30, 10, 20],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  });
  const result = sortedListIds({
    userDoc: doc,
    listId: "custom-a",
    sort: "added-asc",
    getMovieRecord: recordMap([movie(10), movie(20), movie(30)]),
  });
  assert.deepEqual(result.ids, [30, 10, 20]);
});

test("missing movie metadata tiebreaks on stored order", () => {
  const doc = userDoc({ watched: [2, 1, 3] });
  const result = sortedListIds({
    userDoc: doc,
    listId: "watched",
    sort: "title-asc",
    getMovieRecord: () => null,
  });
  assert.deepEqual(result.ids, [2, 1, 3]);
});

test("friend view sorts by friend watch dates, not viewer", () => {
  const friendDoc = userDoc({
    watched: [1, 2, 3],
    viewingHistory: {
      1: [{ id: "f1", watchedOn: "2025-12-01", updatedAt: "2025-12-01T00:00:00.000Z" }],
      2: [{ id: "f2", watchedOn: "2026-08-01", updatedAt: "2026-08-01T00:00:00.000Z" }],
      3: [{ id: "f3", watchedOn: "2026-02-01", updatedAt: "2026-02-01T00:00:00.000Z" }],
    },
  });
  const viewerDoc = userDoc({
    watched: [1, 2, 3],
    viewingHistory: {
      1: [{ id: "v1", watchedOn: "2026-01-01", updatedAt: "2026-01-01T00:00:00.000Z" }],
      2: [{ id: "v2", watchedOn: "2026-06-01", updatedAt: "2026-06-01T00:00:00.000Z" }],
      3: [{ id: "v3", watchedOn: "2026-03-01", updatedAt: "2026-03-01T00:00:00.000Z" }],
    },
  });
  const result = sortedListIds({
    userDoc: friendDoc,
    ownerDoc: friendDoc,
    viewerDoc,
    listId: "watched",
    sort: "watched-desc",
    friendView: true,
    getMovieRecord: recordMap([movie(1), movie(2), movie(3)]),
  });
  assert.deepEqual(result.ids, [2, 3, 1]);
});

test("friend view uses viewer ratings and friend ratings separately", () => {
  const friendDoc = userDoc({
    watched: [1, 2, 3],
    ratings: { 1: 5, 2: 9, 3: 7 },
  });
  const viewerDoc = userDoc({
    watched: [],
    ratings: { 1: 10, 2: 6, 3: 8 },
  });
  const result = sortedListIds({
    userDoc: friendDoc,
    ownerDoc: friendDoc,
    viewerDoc,
    listId: "watched",
    sort: "friend-rating-desc",
    friendView: true,
    getMovieRecord: recordMap([movie(1), movie(2), movie(3)]),
  });
  assert.deepEqual(result.ids, [2, 3, 1]);
});
