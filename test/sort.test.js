const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeSort,
  isCustomSort,
  buildOrderIndex,
  sortMovieIds,
} = require("../scripts/lib/sort");

function movie(id, { title, releaseDate, voteAverage } = {}) {
  return {
    id,
    title: title || `Movie ${id}`,
    releaseDate: releaseDate ?? null,
    voteAverage: voteAverage ?? null,
  };
}

function context(records, ratings = {}, addedAt = {}, watchedOn = {}) {
  const byId = new Map(records.map((entry) => [entry.id, entry]));
  return {
    getRecord: (id) => byId.get(id) || null,
    getUserRating: (id) => ratings[id] ?? null,
    getAddedAt: (id) => addedAt[id] ?? null,
    getWatchedOn: (id) => watchedOn[id] ?? null,
  };
}

test("normalizeSort defaults to custom and rejects unknown modes", () => {
  assert.equal(normalizeSort(undefined), "custom");
  assert.equal(normalizeSort("year-desc"), "year-desc");
  assert.equal(normalizeSort("bad"), "custom");
});

test("isCustomSort is true only for custom", () => {
  assert.equal(isCustomSort("custom"), true);
  assert.equal(isCustomSort("year-asc"), false);
});

test("custom sort preserves stored order", () => {
  assert.deepEqual(sortMovieIds([3, 1, 2], "custom", context([])), [3, 1, 2]);
});

test("year-asc sorts by release year then custom order within a year", () => {
  const records = [
    movie(30, { releaseDate: "1968-01-01" }),
    movie(10, { releaseDate: "1967-06-01" }),
    movie(11, { releaseDate: "1967-01-01" }),
    movie(12, { releaseDate: "1967-03-01" }),
  ];
  const sorted = sortMovieIds([11, 12, 10, 30], "year-asc", context(records));
  assert.deepEqual(sorted, [11, 12, 10, 30]);
});

test("year-desc reverses years but keeps custom order within a year", () => {
  const records = [
    movie(30, { releaseDate: "1968-01-01" }),
    movie(10, { releaseDate: "1967-06-01" }),
    movie(11, { releaseDate: "1967-01-01" }),
    movie(12, { releaseDate: "1967-03-01" }),
  ];
  const sorted = sortMovieIds([11, 12, 10, 30], "year-desc", context(records));
  assert.deepEqual(sorted, [30, 11, 12, 10]);
});

test("added-desc sorts newest additions first with undated movies last", () => {
  const addedAt = {
    1: "2026-01-01T00:00:00.000Z",
    2: "2026-06-01T00:00:00.000Z",
    3: "2026-03-01T00:00:00.000Z",
  };
  assert.deepEqual(
    sortMovieIds([1, 2, 3, 4], "added-desc", context([movie(1), movie(2), movie(3), movie(4)], {}, addedAt)),
    [2, 3, 1, 4],
  );
});

test("added-asc sorts oldest additions first", () => {
  const addedAt = {
    1: "2026-01-01T00:00:00.000Z",
    2: "2026-06-01T00:00:00.000Z",
    3: "2026-03-01T00:00:00.000Z",
  };
  assert.deepEqual(
    sortMovieIds([1, 2, 3], "added-asc", context([movie(1), movie(2), movie(3)], {}, addedAt)),
    [1, 3, 2],
  );
});

test("watched sort uses the latest viewing date and keeps undated movies last", () => {
  const watchedOn = { 1: "2026-01-01", 2: "2026-06-01", 3: "2026-03-01" };
  const records = [movie(1), movie(2), movie(3), movie(4)];
  assert.deepEqual(sortMovieIds([1, 2, 3, 4], "watched-desc", context(records, {}, {}, watchedOn)), [2, 3, 1, 4]);
  assert.deepEqual(sortMovieIds([1, 2, 3, 4], "watched-asc", context(records, {}, {}, watchedOn)), [1, 3, 2, 4]);
});

test("added sort uses list join index when provided", () => {
  const listOrder = buildOrderIndex([10, 20, 30]);
  const listContext = {
    ...context([movie(10), movie(20), movie(30)]),
    getListJoinIndex: (id) => listOrder.get(Number(id)) ?? null,
  };
  assert.deepEqual(sortMovieIds([30, 10, 20], "added-asc", listContext), [10, 20, 30]);
  assert.deepEqual(sortMovieIds([30, 10, 20], "added-desc", listContext), [30, 20, 10]);
});

test("rating-desc and user-rating-desc sort high to low with unrated last", () => {
  const records = [
    movie(1, { voteAverage: 6.2 }),
    movie(2, { voteAverage: 8.4 }),
    movie(3, { voteAverage: null }),
  ];
  assert.deepEqual(
    sortMovieIds([1, 2, 3], "rating-desc", context(records)),
    [2, 1, 3],
  );
  assert.deepEqual(
    sortMovieIds([1, 2, 3], "user-rating-desc", context(records, { 1: 9, 3: 7.5 })),
    [1, 3, 2],
  );
});

test("title sorts ignore custom order", () => {
  const records = [
    movie(1, { title: "Charlie" }),
    movie(2, { title: "Alpha" }),
    movie(3, { title: "Bravo" }),
  ];
  assert.deepEqual(
    sortMovieIds([1, 2, 3], "title-asc", context(records)),
    [2, 3, 1],
  );
  assert.deepEqual(
    sortMovieIds([1, 2, 3], "title-desc", context(records)),
    [1, 3, 2],
  );
});

test("buildOrderIndex maps ids to positions", () => {
  const index = buildOrderIndex([42, 7, 9]);
  assert.equal(index.get(42), 0);
  assert.equal(index.get(7), 1);
  assert.equal(index.get(9), 2);
});

test("getSortField maps stored modes to dropdown fields", () => {
  const {
    getSortField,
    isSortDescending,
    toggleSortDirection,
    sortModeForField,
  } = require("../scripts/lib/sort");
  assert.equal(getSortField("custom"), "custom");
  assert.equal(getSortField("year-desc"), "year");
  assert.equal(getSortField("user-rating-asc"), "user-rating");
  assert.equal(getSortField("watched-desc"), "watched");
  assert.equal(isSortDescending("rating-desc"), true);
  assert.equal(isSortDescending("title-asc"), false);
  assert.equal(toggleSortDirection("year-desc"), "year-asc");
  assert.equal(toggleSortDirection("title-asc"), "title-desc");
  assert.equal(sortModeForField("year", "rating-desc"), "year-desc");
  assert.equal(sortModeForField("year", "year-asc"), "year-asc");
  assert.equal(sortModeForField("custom", "year-desc"), "user-rating-desc");
  assert.equal(sortModeForField("title", "rating-desc"), "title-desc");
  assert.equal(sortModeForField("watched", "rating-desc"), "watched-desc");
});

test("sortDirectionLabel describes the active order", () => {
  const { sortDirectionLabel } = require("../scripts/lib/sort");
  assert.equal(sortDirectionLabel("year", true), "Newest first");
  assert.equal(sortDirectionLabel("year", false), "Oldest first");
  assert.equal(sortDirectionLabel("watched", true), "Newest first");
  assert.equal(sortDirectionLabel("rating", true), "Highest first");
  assert.equal(sortDirectionLabel("title", false), "A to Z");
  assert.equal(sortDirectionLabel("title", true), "Z to A");
});

test("getSortFieldLabel returns full and short toolbar labels", () => {
  const { getSortFieldLabel } = require("../scripts/lib/sort");
  assert.equal(getSortFieldLabel("user-rating"), "My Rating");
  assert.equal(getSortFieldLabel("added"), "Date Added");
  assert.equal(getSortFieldLabel("watched"), "Date Watched");
  assert.equal(getSortFieldLabel("user-rating", true), "My Rating");
  assert.equal(getSortFieldLabel("added", true), "Added");
  assert.equal(getSortFieldLabel("year", true), "Year");
  assert.equal(getSortFieldLabel("rating", true), "Fan Rating");
  assert.equal(getSortFieldLabel("unknown"), "Title");
});

test("formatSortCardHint returns null for custom sort or missing records", () => {
  const { formatSortCardHint } = require("../scripts/lib/sort");
  assert.equal(formatSortCardHint("custom", { record: movie(1) }), null);
  assert.equal(formatSortCardHint("year-desc", { record: null }), null);
});

test("formatSortCardHint shows the sorted field in small-card view", () => {
  const { formatSortCardHint } = require("../scripts/lib/sort");
  const record = movie(1, {
    title: "The Matrix",
    releaseDate: "1999-03-31",
    voteAverage: 8.7,
  });
  assert.equal(formatSortCardHint("year-desc", { record }), "1999");
  assert.equal(
    formatSortCardHint("added-desc", { record, addedAt: "2026-08-18T15:30:00.000Z" }),
    "2026-08-18",
  );
  assert.equal(formatSortCardHint("rating-desc", { record }), "8.7");
  assert.equal(formatSortCardHint("user-rating-desc", { record, userRating: 9 }), "9");
  assert.equal(formatSortCardHint("watched-desc", { record, watchedOn: "2026-08-19" }), "2026-08-19");
  assert.equal(formatSortCardHint("title-asc", { record }), "The Matrix");
  assert.equal(
    formatSortCardHint("year-desc", { record: movie(2, { releaseDate: null }) }),
    "—",
  );
});
