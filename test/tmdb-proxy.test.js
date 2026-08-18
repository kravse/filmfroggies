const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  isAllowedPathname,
  buildProxiedTmdbUrl,
  parseProxyRequestQuery,
} = require("../scripts/lib/tmdb-proxy");

test("isAllowedPathname accepts only the three app paths", () => {
  assert.equal(isAllowedPathname("/configuration"), true);
  assert.equal(isAllowedPathname("/search/movie"), true);
  assert.equal(isAllowedPathname("/movie/603"), true);
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
