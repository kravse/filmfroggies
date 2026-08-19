const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  SEARCH_FIELD_TYPES,
  parseCompoundSearchQuery,
  parseFieldDraftInput,
  parseYearDraftInput,
  getYearSuggestDraft,
  getActiveDraftField,
  isSearchDraftBlockingText,
  buildSearchFilter,
  absorbFieldDraftInput,
  resolveKnownFieldLabel,
  filterFieldSuggestions,
  getFieldByKey,
  buildYearDecadeCriteria,
  movieMatchesYearDecadeCriteria,
  matchesCompoundSearch,
  ensureSearchHaystack,
  decadeFromYear,
  filterMovieIds,
  hasAnyFilterTerms,
} = require("../scripts/lib/list-search");

function movie(overrides = {}) {
  const record = {
    id: 1,
    title: "The Thing",
    releaseDate: "1982-06-25",
    genres: ["Horror", "Science Fiction"],
    directors: ["John Carpenter"],
    cast: ["Kurt Russell", "Wilford Brimley"],
    ...overrides,
  };
  ensureSearchHaystack(record);
  return record;
}

test("parseCompoundSearchQuery splits genre, actor, year, and text", () => {
  assert.deepEqual(
    parseCompoundSearchQuery('genre:horror actor:"Kurt Russell" year:1980s carpenter'),
    {
      fieldTerms: {
        genre: ["horror"],
        actor: ["kurt russell"],
        year: ["1980s"],
      },
      textTerms: ["carpenter"],
    },
  );
});

test("parseFieldDraftInput supports genre, actor, and year prefixes", () => {
  const genreField = getFieldByKey("genre");
  const actorField = getFieldByKey("actor");
  const yearField = getFieldByKey("year");

  assert.deepEqual(parseFieldDraftInput("genre:hor", genreField), {
    fieldKey: "genre",
    partial: "hor",
    quoted: false,
    prefix: "",
  });
  assert.deepEqual(parseFieldDraftInput("horror actor:kur", actorField), {
    fieldKey: "actor",
    partial: "kur",
    quoted: false,
    prefix: "horror",
  });
  assert.deepEqual(parseYearDraftInput("19"), {
    fieldKey: "year",
    partial: "19",
    quoted: false,
    prefix: "",
  });
  assert.equal(parseYearDraftInput("1982", yearField), null);
  assert.equal(parseYearDraftInput("1980s", yearField), null);
  assert.deepEqual(parseYearDraftInput("horror 19"), {
    fieldKey: "year",
    partial: "19",
    quoted: false,
    prefix: "horror",
  });
});

test("buildSearchFilter keeps typed year suffixes as text search", () => {
  assert.deepEqual(buildSearchFilter([], "19"), {
    fieldTerms: { genre: [], actor: [], year: [] },
    textTerms: [],
  });
  assert.deepEqual(buildSearchFilter([], "1982"), {
    fieldTerms: { genre: [], actor: [], year: [] },
    textTerms: ["1982"],
  });
  assert.deepEqual(buildSearchFilter([], "1980s"), {
    fieldTerms: { genre: [], actor: [], year: [] },
    textTerms: ["1980s"],
  });
});

test("genre, actor, and year field filters match only their movie fields", () => {
  const sample = movie();
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: ["horror"], actor: [], year: [] },
      textTerms: [],
    }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: ["comedy"], actor: [], year: [] },
      textTerms: [],
    }),
    false,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], actor: ["kurt russell"], year: [] },
      textTerms: [],
    }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], actor: [], year: ["1980s"] },
      textTerms: [],
    }),
    true,
  );
});

test("text search matches title and director in haystack", () => {
  const sample = movie();
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], actor: [], year: [] },
      textTerms: ["carpenter"],
    }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], actor: [], year: [] },
      textTerms: ["thing"],
    }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], actor: [], year: [] },
      textTerms: ["spielberg"],
    }),
    false,
  );
});

test("year suggestions prefix-match decades from the collection", () => {
  const yearField = getFieldByKey("year");
  const decades = ["1970s", "1980s", "1990s", "2000s", "2010s"];
  assert.deepEqual(filterFieldSuggestions("19", yearField, decades), [
    "1970s",
    "1980s",
    "1990s",
  ]);
  assert.deepEqual(filterFieldSuggestions("20", yearField, ["2000s", "2010s"]), [
    "2000s",
    "2010s",
  ]);
});

test("year and decade filters combine with OR within the date dimension", () => {
  const eighties = movie({ releaseDate: "1985-01-01" });
  const year1982 = movie({ id: 2, releaseDate: "1982-01-01" });
  const criteria = buildYearDecadeCriteria(["1970s"], ["1982"]);
  assert.equal(movieMatchesYearDecadeCriteria(eighties, criteria), false);
  assert.equal(movieMatchesYearDecadeCriteria(year1982, criteria), true);
});

test("getYearSuggestDraft offers decades for partial typed years", () => {
  assert.deepEqual(getYearSuggestDraft("1982"), {
    fieldKey: "year",
    partial: "1982",
    quoted: false,
    prefix: "",
  });
  assert.equal(getActiveDraftField("1982"), null);
});

test("decadeFromYear buckets release years", () => {
  assert.equal(decadeFromYear(1982), "1980s");
  assert.equal(decadeFromYear(2001), "2000s");
});

test("filterMovieIds keeps loading ids when filter is active", () => {
  const ids = [1, 2, 3];
  const records = new Map([[1, movie()]]);
  const filtered = filterMovieIds(
    ids,
    {
      fieldTerms: { genre: ["horror"], actor: [], year: [] },
      textTerms: [],
    },
    (id) => records.get(id),
  );
  assert.deepEqual(filtered, [1, 2, 3]);
});

test("SEARCH_FIELD_TYPES includes genre, actor, and year", () => {
  assert.deepEqual(
    SEARCH_FIELD_TYPES.map((field) => field.key),
    ["genre", "actor", "year"],
  );
});

test("isSearchDraftBlockingText blocks partial genre prefix", () => {
  assert.equal(isSearchDraftBlockingText("gen"), true);
  assert.equal(isSearchDraftBlockingText("genre"), true);
  assert.equal(isSearchDraftBlockingText("genre:hor"), false);
});

test("absorbFieldDraftInput resolves known genre labels", () => {
  const genreField = getFieldByKey("genre");
  const genres = ["Horror", "Comedy"];
  assert.deepEqual(absorbFieldDraftInput("genre:horror", genreField, genres), {
    fieldKey: "genre",
    chipLabel: "Horror",
    remainder: "",
  });
  assert.equal(
    resolveKnownFieldLabel("kur", getFieldByKey("actor"), ["Kurt Russell"]),
    "Kurt Russell",
  );
});

test("hasAnyFilterTerms detects active filters", () => {
  assert.equal(hasAnyFilterTerms({ fieldTerms: { genre: [], actor: [], year: [] }, textTerms: [] }), false);
  assert.equal(
    hasAnyFilterTerms({
      fieldTerms: { genre: ["horror"], actor: [], year: [] },
      textTerms: [],
    }),
    true,
  );
});
