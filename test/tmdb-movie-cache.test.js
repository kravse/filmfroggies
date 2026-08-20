const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  MOVIE_CACHE_REVALIDATE_MS,
  MOVIE_CACHE_TIMESTAMP_HEADER,
  buildCachedMovieResponse,
  readMovieCacheTimestampMs,
  shouldRevalidateMovieCache,
} = require("../scripts/lib/tmdb-movie-cache");

test("buildCachedMovieResponse stamps cache time", () => {
  const at = Date.parse("2026-01-15T12:00:00.000Z");
  const response = buildCachedMovieResponse('{"id":1}', at);
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.equal(response.headers.get(MOVIE_CACHE_TIMESTAMP_HEADER), "2026-01-15T12:00:00.000Z");
});

test("readMovieCacheTimestampMs returns null without header", () => {
  const response = new Response("{}", { headers: { "content-type": "application/json" } });
  assert.equal(readMovieCacheTimestampMs(response), null);
});

test("shouldRevalidateMovieCache is false inside the interval", () => {
  const now = Date.parse("2026-02-01T00:00:00.000Z");
  const response = buildCachedMovieResponse("{}", now - MOVIE_CACHE_REVALIDATE_MS + 60_000);
  assert.equal(shouldRevalidateMovieCache(response, now), false);
});

test("shouldRevalidateMovieCache is true after the interval", () => {
  const now = Date.parse("2026-02-01T00:00:00.000Z");
  const response = buildCachedMovieResponse("{}", now - MOVIE_CACHE_REVALIDATE_MS);
  assert.equal(shouldRevalidateMovieCache(response, now), true);
});

test("shouldRevalidateMovieCache is true for legacy entries", () => {
  const response = new Response("{}", { headers: { "content-type": "application/json" } });
  assert.equal(shouldRevalidateMovieCache(response), true);
});
