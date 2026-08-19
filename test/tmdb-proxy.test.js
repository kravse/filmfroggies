const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  isAllowedPathname,
  buildProxiedTmdbUrl,
  parseProxyRequestQuery,
} = require("../scripts/lib/tmdb-proxy");

test("isAllowedPathname accepts only the app paths", () => {
  assert.equal(isAllowedPathname("/configuration"), true);
  assert.equal(isAllowedPathname("/search/movie"), true);
  assert.equal(isAllowedPathname("/search/person"), true);
  assert.equal(isAllowedPathname("/movie/603"), true);
  assert.equal(isAllowedPathname("/discover/movie"), true);
  assert.equal(isAllowedPathname("/movie/upcoming"), true);
  assert.equal(isAllowedPathname("/movie/now_playing"), true);
  assert.equal(isAllowedPathname("/person/525/movie_credits"), true);
  assert.equal(isAllowedPathname("/movie/0"), false);
  assert.equal(isAllowedPathname("/movie/603/credits"), false);
  assert.equal(isAllowedPathname("/person/1"), false);
});

test("buildProxiedTmdbUrl rebuilds allowed URLs with safe query keys", () => {
  const url = buildProxiedTmdbUrl("/search/movie", {
    query: "matrix",
    language: "en-US",
    page: "1",
    include_adult: "false",
    evil: "drop-me",
  });
  assert.equal(
    url,
    "https://api.themoviedb.org/3/search/movie?query=matrix&language=en-US&page=1&include_adult=false",
  );
});

test("buildProxiedTmdbUrl forwards region for TMDB list endpoints", () => {
  const upcoming = buildProxiedTmdbUrl("/movie/upcoming", {
    language: "en-US",
    page: "1",
    region: "US",
  });
  assert.equal(
    upcoming,
    "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1&region=US",
  );

  const nowPlaying = buildProxiedTmdbUrl("/movie/now_playing", {
    language: "en-US",
    page: "1",
    region: "US",
  });
  assert.equal(
    nowPlaying,
    "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1&region=US",
  );
});

test("buildProxiedTmdbUrl rejects unknown paths", () => {
  assert.throws(() => buildProxiedTmdbUrl("/tv/1", {}), /not allowed/);
});

test("parseProxyRequestQuery extracts path and allowed params", () => {
  const parsed = parseProxyRequestQuery({
    path: "/movie/27205",
    append_to_response: "credits",
    language: "en-US",
    extra: "nope",
  });
  assert.equal(parsed.pathname, "/movie/27205");
  assert.deepEqual(parsed.searchParams, {
    append_to_response: "credits",
    language: "en-US",
  });
});
