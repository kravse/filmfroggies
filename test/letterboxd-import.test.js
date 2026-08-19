const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseCsv,
  parseLetterboxdFiles,
  stableViewingId,
  applyLetterboxdImport,
  pickTmdbMatch,
} = require("../scripts/lib/letterboxd-import");
const { defaultUserState } = require("../scripts/lib/user-state");

test("parseCsv supports commas, escaped quotes, newlines, CRLF, and a BOM", () => {
  assert.deepEqual(
    parseCsv('\uFEFFName,Review\r\n"Paris, Texas","A ""great""\nfilm"\r\n'),
    [["Name", "Review"], ["Paris, Texas", 'A "great"\nfilm']],
  );
});

test("parseLetterboxdFiles merges core exports by Letterboxd URI", () => {
  const result = parseLetterboxdFiles({
    "export/watched.csv": "Date,Name,Year,Letterboxd URI\n2024-01-01,The Matrix,1999,https://boxd.it/2a1m\n",
    "export/ratings.csv": "Date,Name,Year,Letterboxd URI,Rating\n2024-01-02,The Matrix,1999,https://boxd.it/2a1m,4.5\n",
    "export/diary.csv": "Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date\n2024-01-03,The Matrix,1999,https://boxd.it/2a1m,4.5,No,,2024-01-02\n2025-02-04,The Matrix,1999,https://boxd.it/2a1m,4,Yes,,2025-02-03\n",
    "export/watchlist.csv": "Date,Name,Year,Letterboxd URI\n2020-01-01,The Matrix,1999,https://boxd.it/2a1m\n2020-01-02,Arrival,2016,https://boxd.it/EDWU\n",
    "export/reviews.csv": "Date,Name,Year,Letterboxd URI,Review\n",
  });

  assert.deepEqual(result.seenFiles, ["diary.csv", "ratings.csv", "watched.csv", "watchlist.csv"]);
  assert.deepEqual(result.ignoredFiles, ["export/reviews.csv"]);
  assert.equal(result.films.length, 2);
  assert.deepEqual(result.films[0], {
    sourceKey: "uri:https://boxd.it/2a1m",
    letterboxdUri: "https://boxd.it/2a1m",
    title: "The Matrix",
    year: 1999,
    watched: true,
    watchlist: false,
    rating: 9,
    viewings: ["2024-01-02", "2025-02-03"],
  });
  assert.equal(result.films[1].watchlist, true);
});

test("dated diary entries deduplicate and invalid dates are ignored", () => {
  const result = parseLetterboxdFiles({
    "diary.csv": "Name,Year,Letterboxd URI,Watched Date\nAlien,1979,https://boxd.it/2awY,2024-05-01\nAlien,1979,https://boxd.it/2awY,2024-05-01\nAlien,1979,https://boxd.it/2awY,2024-02-31\n",
  });
  assert.deepEqual(result.films[0].viewings, ["2024-05-01"]);
});

test("deleted and orphaned exports are never treated as live diary entries", () => {
  const result = parseLetterboxdFiles({
    "watched.csv": "Name,Year,Letterboxd URI\nAlien,1979,https://boxd.it/2awY\n",
    "deleted/diary.csv": "Name,Year,Letterboxd URI,Watched Date\nDeleted Film,2000,https://boxd.it/deleted,2020-01-01\n",
    "orphaned/diary.csv": "Name,Year,Letterboxd URI,Watched Date\nOrphaned Film,2001,https://boxd.it/orphaned,2020-01-01\n",
  });
  assert.equal(result.films.length, 1);
  assert.deepEqual(result.ignoredFiles, ["deleted/diary.csv", "orphaned/diary.csv"]);
});

test("ratings.csv is authoritative regardless of archive entry order", () => {
  const result = parseLetterboxdFiles({
    "ratings.csv": "Name,Year,Letterboxd URI,Rating\nAlien,1979,https://boxd.it/2awY,5\n",
    "diary.csv": "Name,Year,Letterboxd URI,Rating,Watched Date\nAlien,1979,https://boxd.it/2awY,3,2024-05-01\n",
  });
  assert.equal(result.films[0].rating, 10);
});

test("stableViewingId is deterministic and date-sensitive", () => {
  const first = stableViewingId("uri:https://boxd.it/2awY", "2024-05-01");
  assert.equal(first, stableViewingId("uri:https://boxd.it/2awY", "2024-05-01"));
  assert.notEqual(first, stableViewingId("uri:https://boxd.it/2awY", "2024-05-02"));
});

test("TMDB matching tolerates one unique adjacent release year", () => {
  const candidates = [
    { id: 123, title: "Sing Sing", releaseDate: "2024-07-12" },
    { id: 456, title: "Sing", releaseDate: "2023-01-01" },
  ];
  assert.equal(pickTmdbMatch({ title: "Sing Sing", year: 2023 }, candidates), 123);
});

test("TMDB matching chooses the imported year among same-title releases", () => {
  const candidates = [
    { id: 1, title: "The Thing", releaseDate: "1982-06-25" },
    { id: 2, title: "The Thing", releaseDate: "2011-10-14" },
    { id: 3, title: "The Thing", releaseDate: "1951-04-05" },
  ];
  assert.equal(pickTmdbMatch({ title: "The Thing", year: 2011 }, candidates), 2);
});

test("TMDB matching takes the first ranked exact title and year", () => {
  const candidates = [
    { id: 10, title: "Past Lives", releaseDate: "2023-06-02" },
    { id: 11, title: "Past Lives", releaseDate: "2023-10-01" },
    { id: 12, title: "Past Lives", releaseDate: "2022-01-01" },
  ];
  assert.equal(pickTmdbMatch({ title: "Past Lives", year: 2023 }, candidates), 10);
});

test("TMDB matching ignores duplicate copies of the same result", () => {
  const candidates = [
    { id: 10, title: "Past Lives", releaseDate: "2023-06-02" },
    { id: 10, title: "Past Lives", releaseDate: "2023-06-02" },
  ];
  assert.equal(pickTmdbMatch({ title: "Past Lives", year: 2023 }, candidates), 10);
});

test("TMDB matching rejects large year differences and ranks adjacent matches", () => {
  assert.equal(pickTmdbMatch({ title: "Film", year: 2020 }, [
    { id: 1, title: "Film", releaseDate: "2022-01-01" },
  ]), null);
  assert.equal(pickTmdbMatch({ title: "Film", year: 2020 }, [
    { id: 1, title: "Film", releaseDate: "2021-01-01" },
    { id: 2, title: "Film", releaseDate: "2019-01-01" },
  ]), 1);
});

test("unsupported exports fail with a useful error", () => {
  assert.throws(
    () => parseLetterboxdFiles({ "profile.csv": "Username\nalex\n" }),
    /No supported Letterboxd files/,
  );
});

test("applyLetterboxdImport adds matched data atomically and is idempotent", () => {
  const parsed = parseLetterboxdFiles({
    "watched.csv": "Name,Year,Letterboxd URI\nAlien,1979,https://boxd.it/2awY\n",
    "ratings.csv": "Name,Year,Letterboxd URI,Rating\nAlien,1979,https://boxd.it/2awY,4.5\n",
    "diary.csv": "Name,Year,Letterboxd URI,Watched Date\nAlien,1979,https://boxd.it/2awY,2024-05-01\n",
    "watchlist.csv": "Name,Year,Letterboxd URI\nArrival,2016,https://boxd.it/EDWU\n",
  });
  const matches = {
    "uri:https://boxd.it/2awy": 348,
    "uri:https://boxd.it/edwu": 329865,
  };
  const now = new Date("2026-08-19T12:00:00.000Z");
  const first = applyLetterboxdImport(defaultUserState(now), parsed.films, matches, { now });
  assert.deepEqual(first.state.lists[0].movieIds, [348]);
  assert.deepEqual(first.state.lists[1].movieIds, [329865]);
  assert.equal(first.state.ratings[348], 9);
  assert.equal(first.state.viewingHistory[348][0].watchedOn, "2024-05-01");
  assert.deepEqual(first.summary, { matched: 2, skipped: 0, watched: 1, watchlist: 1, ratings: 1, viewings: 1 });

  const second = applyLetterboxdImport(first.state, parsed.films, matches, { now });
  assert.equal(second.summary.viewings, 0);
  assert.equal(second.state.viewingHistory[348].length, 1);
});

test("additive import does not demote watched movies or overwrite local ratings", () => {
  const base = defaultUserState(new Date("2026-08-19T12:00:00.000Z"));
  base.lists[0].movieIds = [348];
  base.ratings = { 348: 10 };
  const films = [{
    sourceKey: "uri:x", title: "Alien", year: 1979, watched: false,
    watchlist: true, rating: 7, viewings: [],
  }];
  const result = applyLetterboxdImport(base, films, { "uri:x": 348 });
  assert.deepEqual(result.state.lists[0].movieIds, [348]);
  assert.deepEqual(result.state.lists[1].movieIds, []);
  assert.equal(result.state.ratings[348], 10);
});
