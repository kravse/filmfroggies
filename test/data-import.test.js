const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  listCsvRows,
  buildListCsv,
  parseCollectionCsv,
  summarizeCollectionImport,
  applyCollectionImport,
} = require("../scripts/lib/list-csv");
const { defaultUserState } = require("../scripts/lib/user-state");
const { assignMovieToList } = require("../scripts/lib/lists");

function stateWith(entries) {
  let state = defaultUserState();
  for (const [movieId, listId] of entries) {
    state = { ...state, lists: assignMovieToList(state.lists, listId, movieId) };
  }
  return state;
}

test("parseCollectionCsv reads multi-row backup rows", () => {
  const rows = parseCollectionCsv(
    "tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates\n" +
      "603,The Matrix,watched,Watched,8.5,1999,2024-01-01\n" +
      "603,The Matrix,custom-scifi,Sci-Fi,8.5,1999,2024-01-01\n" +
      "1891,Star Wars,watchlist,Watchlist,,1977,\n",
  );
  assert.equal(rows.length, 3);
  assert.equal(rows[0].tmdbId, 603);
  assert.equal(rows[0].myRating, 8.5);
  assert.deepEqual(rows[0].watchDates, ["2024-01-01"]);
});

test("applyCollectionImport replace rebuilds lists ratings and viewing history", () => {
  const now = new Date("2026-08-19T12:00:00.000Z");
  const base = {
    ...stateWith([[1, "watched"], [2, "watchlist"]]),
    ratings: { 1: 10, 2: 5 },
    viewingHistory: { 1: [{ id: "a", watchedOn: "2020-01-01", updatedAt: now.toISOString() }] },
    customLists: [
      {
        id: "custom-a",
        name: "A",
        movieIds: [99],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ],
  };
  const rows = parseCollectionCsv(
    "tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates\n" +
      "603,The Matrix,watched,Watched,8.5,1999,2024-05-01;2025-01-02\n" +
      "603,The Matrix,custom-a,A,8.5,1999,2024-05-01;2025-01-02\n" +
      "1891,Star Wars,watchlist,Watchlist,7.0,1977,\n",
  );
  const result = applyCollectionImport(base, rows, { mode: "replace", now });
  assert.deepEqual(result.state.lists[0].movieIds, [603]);
  assert.deepEqual(result.state.lists[1].movieIds, [1891]);
  assert.deepEqual(result.state.customLists[0].movieIds, [603]);
  assert.equal(result.state.ratings[603], 8.5);
  assert.equal(result.state.ratings[1891], 7);
  assert.equal(result.state.ratings[1], undefined);
  assert.deepEqual(
    result.state.viewingHistory[603].map((entry) => entry.watchedOn),
    ["2024-05-01", "2025-01-02"],
  );
  assert.equal(result.state.viewingHistory[1], undefined);
});

test("applyCollectionImport creates missing custom lists on a fresh browser", () => {
  const now = new Date("2026-08-19T12:00:00.000Z");
  const rows = parseCollectionCsv(
    "tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates\n" +
      "603,The Matrix,custom-scifi,Sci-Fi,8.5,1999,2024-05-01\n",
  );
  const result = applyCollectionImport(defaultUserState(now), rows, { mode: "replace", now });
  assert.equal(result.state.customLists.length, 1);
  assert.equal(result.state.customLists[0].id, "custom-scifi");
  assert.equal(result.state.customLists[0].name, "Sci-Fi");
  assert.deepEqual(result.state.customLists[0].movieIds, [603]);
  assert.equal(result.state.ratings[603], 8.5);
});

test("export parse import round-trip preserves collection data", () => {
  const now = new Date("2026-08-19T12:00:00.000Z");
  const state = {
    ...stateWith([[603, "watched"], [1891, "watchlist"]]),
    ratings: { 603: 8.5 },
    addedAt: {
      603: "2024-01-15T10:00:00.000Z",
      1891: "2024-02-20T08:30:00.000Z",
    },
    viewingHistory: {
      603: [{ id: "v1", watchedOn: "2024-05-01", updatedAt: now.toISOString() }],
    },
    customLists: [
      {
        id: "custom-a",
        name: "A",
        movieIds: [603],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ],
  };
  const csv = buildListCsv(
    listCsvRows(state, () => ({ title: "The Matrix", releaseDate: "1999-03-31" })),
  );
  const imported = applyCollectionImport(state, parseCollectionCsv(csv), {
    mode: "replace",
    now,
  });
  assert.deepEqual(imported.state.lists[0].movieIds, [603]);
  assert.deepEqual(imported.state.lists[1].movieIds, [1891]);
  assert.deepEqual(imported.state.customLists[0].movieIds, [603]);
  assert.equal(imported.state.ratings[603], 8.5);
  assert.equal(imported.state.viewingHistory[603][0].watchedOn, "2024-05-01");
  assert.equal(imported.state.addedAt[603], "2024-01-15T10:00:00.000Z");
  assert.equal(imported.state.addedAt[1891], "2024-02-20T08:30:00.000Z");
});

test("applyCollectionImport preserves added_at from csv rows", () => {
  const now = new Date("2026-08-19T12:00:00.000Z");
  const rows = parseCollectionCsv(
    "tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates,added_at\n" +
      "603,The Matrix,watched,Watched,,1999,,2024-01-15T10:00:00.000Z\n" +
      "1891,Star Wars,watchlist,Watchlist,,1977,,2024-02-20T08:30:00.000Z\n",
  );
  const result = applyCollectionImport(defaultUserState(), rows, { mode: "replace", now });
  assert.equal(result.state.addedAt[603], "2024-01-15T10:00:00.000Z");
  assert.equal(result.state.addedAt[1891], "2024-02-20T08:30:00.000Z");
});

test("applyCollectionImport falls back to import time when added_at is missing", () => {
  const now = new Date("2026-08-19T12:00:00.000Z");
  const rows = parseCollectionCsv(
    "tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates\n" +
      "603,The Matrix,watched,Watched,,1999,\n",
  );
  const result = applyCollectionImport(defaultUserState(), rows, { mode: "replace", now });
  assert.equal(result.state.addedAt[603], now.toISOString());
});

test("parseCollectionCsv reads added_at on legacy rows without the column", () => {
  const rows = parseCollectionCsv(
    "tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates\n" +
      "603,The Matrix,watched,Watched,,1999,\n",
  );
  assert.equal(rows[0].addedAt, null);
});

test("summarizeCollectionImport counts movies and memberships", () => {
  const summary = summarizeCollectionImport(
    parseCollectionCsv(
      "tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates\n" +
        "1,A,watched,Watched,8.0,1999,2024-01-01\n" +
        "1,A,custom-a,A,8.0,1999,2024-01-01\n" +
        "2,B,watchlist,Watchlist,,,\n",
    ),
  );
  assert.deepEqual(summary, {
    movies: 2,
    rows: 3,
    watched: 1,
    watchlist: 1,
    customRows: 1,
    ratings: 1,
    viewings: 1,
  });
});
