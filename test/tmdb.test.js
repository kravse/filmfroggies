const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  isReadAccessToken,
  looksLikeV3ApiKey,
  describeCredentialProblem,
  buildRequestInit,
  buildSearchUrl,
  buildMovieUrl,
  buildConfigurationUrl,
  isValidImagePath,
  buildImageUrl,
  normalizeSearchResults,
  normalizeMovie,
} = require("../scripts/lib/tmdb");

const READ_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYmMifQ.s1gn4tur3-_x";

test("isReadAccessToken accepts a three-segment JWT read token", () => {
  assert.equal(isReadAccessToken(READ_TOKEN), true);
  assert.equal(isReadAccessToken(`  ${READ_TOKEN}  `), true);
});

test("isReadAccessToken rejects a v3 API key", () => {
  assert.equal(isReadAccessToken("0123456789abcdef0123456789abcdef"), false);
});

test("isReadAccessToken rejects a truncated or malformed token", () => {
  assert.equal(isReadAccessToken("eyJhbGciOiJIUzI1NiJ9.onlytwo"), false);
  assert.equal(isReadAccessToken("eyJhbGciOiJIUzI1NiJ9"), false);
  assert.equal(isReadAccessToken("notatoken.at.all!"), false);
  assert.equal(isReadAccessToken(""), false);
  assert.equal(isReadAccessToken(null), false);
});

test("looksLikeV3ApiKey matches 32 hex characters in either case", () => {
  assert.equal(looksLikeV3ApiKey("0123456789abcdef0123456789abcdef"), true);
  assert.equal(looksLikeV3ApiKey("0123456789ABCDEF0123456789ABCDEF"), true);
});

test("looksLikeV3ApiKey does not match a read token or the wrong length", () => {
  assert.equal(looksLikeV3ApiKey(READ_TOKEN), false);
  assert.equal(looksLikeV3ApiKey("0123456789abcdef"), false);
  assert.equal(looksLikeV3ApiKey("zzzz456789abcdef0123456789abcdef"), false);
});

test("describeCredentialProblem passes a valid read token", () => {
  assert.equal(describeCredentialProblem(READ_TOKEN), null);
});

test("describeCredentialProblem names the v3 key specifically", () => {
  const problem = describeCredentialProblem("0123456789abcdef0123456789abcdef");
  assert.match(problem, /v3 API Key/);
  assert.match(problem, /API Read Access Token/);
});

test("describeCredentialProblem asks for a token when the field is empty", () => {
  assert.match(describeCredentialProblem(""), /Paste your TMDB API Read Access Token/);
  assert.match(describeCredentialProblem("   "), /Paste your TMDB API Read Access Token/);
});

test("describeCredentialProblem explains the expected shape for other input", () => {
  assert.match(describeCredentialProblem("hunter2"), /three dot-separated sections/);
});

test("buildRequestInit sends the read token as a bearer header", () => {
  const init = buildRequestInit(READ_TOKEN);
  assert.equal(init.headers.Authorization, `Bearer ${READ_TOKEN}`);
});

test("buildRequestInit omits the auth header for a rejected credential", () => {
  const init = buildRequestInit("0123456789abcdef0123456789abcdef");
  assert.equal(init.headers.Authorization, undefined);
  assert.equal(init.headers.accept, "application/json");
});

test("buildRequestInit forwards an abort signal when given one", () => {
  const controller = new AbortController();
  const init = buildRequestInit(READ_TOKEN, { signal: controller.signal });
  assert.equal(init.signal, controller.signal);
});

test("buildSearchUrl encodes the query and excludes adult results", () => {
  const url = new URL(buildSearchUrl("the thing & other"));
  assert.equal(url.origin + url.pathname, "https://api.themoviedb.org/3/search/movie");
  assert.equal(url.searchParams.get("query"), "the thing & other");
  assert.equal(url.searchParams.get("include_adult"), "false");
});

test("no builder ever puts a credential in the URL", () => {
  for (const url of [buildSearchUrl("alien"), buildMovieUrl(603), buildConfigurationUrl()]) {
    assert.equal(new URL(url).searchParams.get("api_key"), null);
    assert.equal(url.includes("eyJ"), false);
  }
});

test("buildMovieUrl requests credits alongside the movie", () => {
  const url = new URL(buildMovieUrl(603));
  assert.equal(url.pathname, "/3/movie/603");
  assert.equal(url.searchParams.get("append_to_response"), "credits");
});

test("buildMovieUrl rejects a non-numeric id rather than building a bad path", () => {
  assert.throws(() => buildMovieUrl("../../etc"), /Invalid movie id/);
});

test("buildConfigurationUrl points at the configuration endpoint", () => {
  const url = new URL(buildConfigurationUrl());
  assert.equal(url.pathname, "/3/configuration");
});

test("isValidImagePath accepts TMDB-shaped paths", () => {
  assert.equal(isValidImagePath("/kqjL17yufvn9OVLyXYpvtyrFfak.jpg"), true);
  assert.equal(isValidImagePath("/abc-123_x.webp"), true);
});

test("isValidImagePath rejects traversal, absolute URLs, and empty values", () => {
  assert.equal(isValidImagePath("/../secret.jpg"), false);
  assert.equal(isValidImagePath("https://evil.test/x.jpg"), false);
  assert.equal(isValidImagePath("/script.js"), false);
  assert.equal(isValidImagePath(""), false);
  assert.equal(isValidImagePath(null), false);
});

test("buildImageUrl composes a CDN url for a valid path and size", () => {
  assert.equal(
    buildImageUrl("/poster.jpg", "w342"),
    "https://image.tmdb.org/t/p/w342/poster.jpg",
  );
});

test("buildImageUrl returns null for an invalid path or unknown size", () => {
  assert.equal(buildImageUrl("/../poster.jpg", "w342"), null);
  assert.equal(buildImageUrl("/poster.jpg", "w9999"), null);
});

test("normalizeSearchResults keeps id, title, year source, and poster", () => {
  const results = normalizeSearchResults({
    results: [
      {
        id: 603,
        title: "The Matrix",
        release_date: "1999-03-30",
        poster_path: "/matrix.jpg",
        overview: "A hacker learns the truth.",
      },
    ],
  });
  assert.deepEqual(results, [
    {
      id: 603,
      title: "The Matrix",
      releaseDate: "1999-03-30",
      posterPath: "/matrix.jpg",
      overview: "A hacker learns the truth.",
    },
  ]);
});

test("normalizeSearchResults drops entries without a usable id", () => {
  const results = normalizeSearchResults({
    results: [{ title: "No id" }, { id: 7, title: "Kept" }],
  });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 7);
});

test("normalizeSearchResults tolerates a missing results array", () => {
  assert.deepEqual(normalizeSearchResults({}), []);
  assert.deepEqual(normalizeSearchResults(null), []);
});

test("normalizeSearchResults strips an unsafe poster path", () => {
  const [result] = normalizeSearchResults({
    results: [{ id: 1, title: "X", poster_path: "javascript:alert(1)" }],
  });
  assert.equal(result.posterPath, null);
});

test("normalizeMovie extracts the director from crew credits", () => {
  const movie = normalizeMovie({
    id: 603,
    title: "The Matrix",
    runtime: 136,
    vote_average: 8.2,
    genres: [{ name: "Action" }, { name: "Science Fiction" }],
    credits: {
      crew: [
        { job: "Editor", name: "Zach Staenberg" },
        { job: "Director", name: "Lana Wachowski" },
        { job: "Director", name: "Lilly Wachowski" },
      ],
      cast: [{ name: "Keanu Reeves" }, { name: "Carrie-Anne Moss" }],
    },
  });
  assert.deepEqual(movie.directors, ["Lana Wachowski", "Lilly Wachowski"]);
  assert.deepEqual(movie.cast, ["Keanu Reeves", "Carrie-Anne Moss"]);
  assert.deepEqual(movie.genres, ["Action", "Science Fiction"]);
  assert.equal(movie.runtime, 136);
  assert.equal(movie.voteAverage, 8.2);
});

test("normalizeMovie caps the cast list", () => {
  const cast = Array.from({ length: 20 }, (_, index) => ({ name: `Actor ${index}` }));
  const movie = normalizeMovie({ id: 1, title: "X", credits: { cast } });
  assert.equal(movie.cast.length, 8);
});

test("normalizeMovie nulls out zero runtime and unrated scores", () => {
  const movie = normalizeMovie({ id: 1, title: "X", runtime: 0, vote_average: 0 });
  assert.equal(movie.runtime, null);
  assert.equal(movie.voteAverage, null);
});

test("normalizeMovie returns null when there is no usable id", () => {
  assert.equal(normalizeMovie({ title: "No id" }), null);
  assert.equal(normalizeMovie(null), null);
});

test("normalizeMovie falls back to the original title then to Untitled", () => {
  assert.equal(normalizeMovie({ id: 1, original_title: "Original" }).title, "Original");
  assert.equal(normalizeMovie({ id: 1 }).title, "Untitled");
});
