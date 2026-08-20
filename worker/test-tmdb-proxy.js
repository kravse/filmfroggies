import test from "node:test";
import assert from "node:assert/strict";
import {
  buildProxiedTmdbUrl,
  isAllowedPathname,
  parseProxyRequestQuery,
  tmdbCacheControl,
} from "./src/tmdb-proxy.js";

test("isAllowedPathname accepts movie detail and rejects traversal", () => {
  assert.equal(isAllowedPathname("/movie/550"), true);
  assert.equal(isAllowedPathname("/search/movie"), true);
  assert.equal(isAllowedPathname("/admin/users"), false);
  assert.equal(isAllowedPathname("/movie/0"), false);
});

test("parseProxyRequestQuery forwards allowlisted keys only", () => {
  const parsed = parseProxyRequestQuery({
    path: "/movie/42",
    append_to_response: "credits",
    language: "en-US",
    evil: "yes",
  });
  assert.equal(parsed.pathname, "/movie/42");
  assert.deepEqual(parsed.searchParams, {
    append_to_response: "credits",
    language: "en-US",
  });
});

test("buildProxiedTmdbUrl builds TMDB API URL", () => {
  const url = buildProxiedTmdbUrl("/movie/550", { language: "en-US" });
  assert.match(url, /^https:\/\/api\.themoviedb\.org\/3\/movie\/550\?/);
  assert.match(url, /language=en-US/);
});

test("tmdbCacheControl caches configuration only", () => {
  assert.equal(tmdbCacheControl("/configuration"), "public, max-age=86400");
  assert.equal(tmdbCacheControl("/movie/1"), null);
});
