const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  isAllowedPathname,
  buildProxiedTmdbUrl,
  parseProxyRequestQuery,
  pickAllowedSearchParams,
  ALLOWED_QUERY_KEYS,
} = require("../scripts/lib/tmdb-proxy");
const { buildUpcomingUrl, buildNowPlayingUrl } = require("../scripts/lib/tmdb");

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

test("buildProxiedTmdbUrl forwards discover/movie release filters", () => {
  const discover = buildProxiedTmdbUrl("/discover/movie", {
    language: "en-US",
    page: "1",
    region: "US",
    include_adult: "false",
    include_video: "false",
    with_release_type: "2|3",
    sort_by: "primary_release_date.asc",
    "primary_release_date.gte": "2026-08-19",
    "primary_release_date.lte": "2026-11-17",
    evil: "drop-me",
  });
  assert.match(discover, /\/3\/discover\/movie\?/);
  assert.match(discover, /primary_release_date\.gte=2026-08-19/);
  assert.match(discover, /primary_release_date\.lte=2026-11-17/);
  assert.match(discover, /with_release_type=2%7C3/);
  assert.doesNotMatch(discover, /evil=/);
});

test("pickAllowedSearchParams keeps every buildUpcomingUrl query key", () => {
  const params = pickAllowedSearchParams(new URL(buildUpcomingUrl({ today: "2026-08-19" })).searchParams);
  for (const key of new URL(buildUpcomingUrl({ today: "2026-08-19" })).searchParams.keys()) {
    assert.equal(ALLOWED_QUERY_KEYS.has(key), true, `unexpected query key: ${key}`);
    assert.ok(params[key], `missing allowed query key: ${key}`);
  }
});

test("pickAllowedSearchParams keeps every buildNowPlayingUrl query key", () => {
  const built = new URL(buildNowPlayingUrl({ today: "2026-08-19" }));
  const params = pickAllowedSearchParams(built.searchParams);
  for (const key of built.searchParams.keys()) {
    assert.equal(ALLOWED_QUERY_KEYS.has(key), true, `unexpected query key: ${key}`);
    assert.ok(params[key], `missing allowed query key: ${key}`);
  }
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
