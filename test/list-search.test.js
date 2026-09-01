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

test("parseCompoundSearchQuery splits genre, director, year, and text", () => {
  assert.deepEqual(
    parseCompoundSearchQuery(
      'genre:horror director:"John Carpenter" year:1980s thing',
    ),
    {
      fieldTerms: {
        genre: ["horror"],
        director: ["john carpenter"],
        year: ["1980s"],
      },
      textTerms: ["thing"],
    },
  );
});

test("cast is not searchable", () => {
  assert.equal(getFieldByKey("actor"), null);
  assert.deepEqual(parseCompoundSearchQuery("actor:russell").fieldTerms, {
    genre: [],
    director: [],
    year: [],
  });
  assert.equal(
    matchesCompoundSearch(movie(), buildSearchFilter([], "russell")),
    false,
  );
});

test("parseFieldDraftInput supports genre, director, and year prefixes", () => {
  const genreField = getFieldByKey("genre");
  const directorField = getFieldByKey("director");
  const yearField = getFieldByKey("year");

  assert.deepEqual(parseFieldDraftInput("genre:hor", genreField), {
    fieldKey: "genre",
    partial: "hor",
    quoted: false,
    prefix: "",
  });
  assert.deepEqual(parseFieldDraftInput("director:carp", directorField), {
    fieldKey: "director",
    partial: "carp",
    quoted: false,
    prefix: "",
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
    fieldTerms: { genre: [], director: [], year: [] },
    textTerms: [],
  });
  assert.deepEqual(buildSearchFilter([], "1982"), {
    fieldTerms: { genre: [], director: [], year: [] },
    textTerms: ["1982"],
  });
  assert.deepEqual(buildSearchFilter([], "1980s"), {
    fieldTerms: { genre: [], director: [], year: [] },
    textTerms: ["1980s"],
  });
});

test("genre, director, and year field filters match only their movie fields", () => {
  const sample = movie();
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: ["horror"], director: [], year: [] },
      textTerms: [],
    }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: ["comedy"], director: [], year: [] },
      textTerms: [],
    }),
    false,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], director: ["carpenter"], year: [] },
      textTerms: [],
    }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], director: ["spielberg"], year: [] },
      textTerms: [],
    }),
    false,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], director: [], year: ["1980s"] },
      textTerms: [],
    }),
    true,
  );
});

test("plain text search matches title words, not director or cast", () => {
  const sample = movie();
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], director: [], year: [] },
      textTerms: ["thing"],
    }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], director: [], year: [] },
      textTerms: ["carpenter"],
    }),
    false,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], director: [], year: [] },
      textTerms: ["russell"],
    }),
    false,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], director: [], year: [] },
      textTerms: ["horror"],
    }),
    false,
  );
  assert.equal(
    matchesCompoundSearch(sample, {
      fieldTerms: { genre: [], director: [], year: [] },
      textTerms: ["thi"],
    }),
    true,
  );
});

test("title search requires a distinct title word for each query word", () => {
  const escape = movie({ title: "The Great Escape" });
  const empty = { fieldTerms: { genre: [], director: [], year: [] } };
  assert.equal(
    matchesCompoundSearch(escape, { ...empty, textTerms: ["great", "escape"] }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(escape, { ...empty, textTerms: ["the"] }),
    true,
  );
  assert.equal(
    matchesCompoundSearch(escape, {
      ...empty,
      textTerms: ["the", "the", "the", "the", "the", "the"],
    }),
    false,
  );
});

test("a query typed without spaces matches consecutive title words", () => {
  const bladeRunner = movie({ title: "Blade Runner" });
  const sequel = movie({ id: 2, title: "Blade Runner 2049", releaseDate: "2017-10-06" });
  const knight = movie({ id: 3, title: "The Dark Knight", releaseDate: "2008-07-18" });

  for (const query of ["bladerunner", "bladerun", "blade runner"]) {
    assert.deepEqual(
      [bladeRunner, sequel, knight].filter((record) =>
        matchesCompoundSearch(record, buildSearchFilter([], query)),
      ),
      [bladeRunner, sequel],
      query,
    );
  }

  assert.equal(
    matchesCompoundSearch(knight, buildSearchFilter([], "darkknight")),
    true,
  );
  assert.equal(
    matchesCompoundSearch(knight, buildSearchFilter([], "thedarkknight")),
    true,
  );
});

test("a four-digit word can name a title instead of a release year", () => {
  const sequel = movie({ id: 2, title: "Blade Runner 2049", releaseDate: "2017-10-06" });
  const original = movie({ title: "Blade Runner", releaseDate: "1982-06-25" });

  for (const query of ["blade runner 2049", "bladerunner 2049", "2049"]) {
    assert.equal(matchesCompoundSearch(sequel, buildSearchFilter([], query)), true, query);
  }
  assert.equal(
    matchesCompoundSearch(original, buildSearchFilter([], "blade runner 2049")),
    false,
  );
  // A bare year still filters by release year.
  assert.equal(matchesCompoundSearch(original, buildSearchFilter([], "1982")), true);
  assert.equal(matchesCompoundSearch(sequel, buildSearchFilter([], "1982")), false);
  // An explicit year chip stays a strict filter.
  assert.equal(
    matchesCompoundSearch(sequel, {
      fieldTerms: { genre: [], director: [], year: ["1980s"] },
      textTerms: ["2049"],
    }),
    false,
  );
});

test("a spaceless query only matches on a title word boundary", () => {
  const others = movie({ title: "The Others", releaseDate: "2001-08-10" });
  // "theothers" contains "heoth", but the run has to start on a word.
  assert.equal(matchesCompoundSearch(others, buildSearchFilter([], "heoth")), false);
  assert.equal(matchesCompoundSearch(others, buildSearchFilter([], "theoth")), true);
});

test("a title search that matches nothing returns nothing", () => {
  const sample = movie();
  assert.equal(matchesCompoundSearch(sample, buildSearchFilter([], "bladerunner")), false);
  assert.equal(matchesCompoundSearch(sample, buildSearchFilter([], "thething")), true);
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

test("filterMovieIds drops ids whose metadata has not loaded", () => {
  const ids = [1, 2, 3];
  const records = new Map([[1, movie()]]);
  const filtered = filterMovieIds(
    ids,
    {
      fieldTerms: { genre: ["horror"], director: [], year: [] },
      textTerms: [],
    },
    (id) => records.get(id),
  );
  assert.deepEqual(filtered, [1]);
});

test("filterMovieIds leaves ids untouched with no filter terms", () => {
  const ids = [1, 2, 3];
  assert.deepEqual(filterMovieIds(ids, buildSearchFilter([], ""), () => null), ids);
});

test("SEARCH_FIELD_TYPES includes genre, director, and year", () => {
  assert.deepEqual(
    SEARCH_FIELD_TYPES.map((field) => field.key),
    ["genre", "director", "year"],
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
    resolveKnownFieldLabel("carp", getFieldByKey("director"), ["John Carpenter"]),
    "John Carpenter",
  );
});

test("hasAnyFilterTerms detects active filters", () => {
  assert.equal(
    hasAnyFilterTerms({ fieldTerms: { genre: [], director: [], year: [] }, textTerms: [] }),
    false,
  );
  assert.equal(
    hasAnyFilterTerms({
      fieldTerms: { genre: ["horror"], director: [], year: [] },
      textTerms: [],
    }),
    true,
  );
});
