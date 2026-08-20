const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  CACHE_REVALIDATE_MS,
  CACHE_TIMESTAMP_HEADER,
  buildCachedMovieResponse,
  buildCachedBlobResponse,
  readCacheTimestampMs,
  shouldRevalidateCache,
} = require("../scripts/lib/tmdb-movie-cache");

test("buildCachedMovieResponse stamps cache time", () => {
  const at = Date.parse("2026-01-15T12:00:00.000Z");
  const response = buildCachedMovieResponse('{"id":1}', at);
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.equal(response.headers.get(CACHE_TIMESTAMP_HEADER), "2026-01-15T12:00:00.000Z");
});

test("buildCachedBlobResponse stamps poster cache time", () => {
  const at = Date.parse("2026-01-15T12:00:00.000Z");
  const blob = new Blob(["x"], { type: "image/jpeg" });
  const response = buildCachedBlobResponse(blob, "image/jpeg", at);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.equal(response.headers.get(CACHE_TIMESTAMP_HEADER), "2026-01-15T12:00:00.000Z");
});

test("readCacheTimestampMs returns null without header", () => {
  const response = new Response("{}", { headers: { "content-type": "application/json" } });
  assert.equal(readCacheTimestampMs(response), null);
});

test("shouldRevalidateMovieCache is false inside the interval", () => {
  const now = Date.parse("2026-02-01T00:00:00.000Z");
  const response = buildCachedMovieResponse("{}", now - CACHE_REVALIDATE_MS + 60_000);
  assert.equal(shouldRevalidateCache(response, now), false);
});

test("shouldRevalidateMovieCache is true after the interval", () => {
  const now = Date.parse("2026-02-01T00:00:00.000Z");
  const response = buildCachedMovieResponse("{}", now - CACHE_REVALIDATE_MS);
  assert.equal(shouldRevalidateCache(response, now), true);
});

test("shouldRevalidateMovieCache is true for legacy entries", () => {
  const response = new Response("{}", { headers: { "content-type": "application/json" } });
  assert.equal(shouldRevalidateCache(response), true);
});
