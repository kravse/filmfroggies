/**
 * Cache API timestamps for TMDB movie detail responses. Cached rows are served
 * immediately; TMDB is consulted again only after the revalidation interval.
 */

const MOVIE_CACHE_REVALIDATE_MS = 30 * 24 * 60 * 60 * 1000;
const MOVIE_CACHE_TIMESTAMP_HEADER = "x-moviecollector-cached-at";

function buildCachedMovieResponse(text, cachedAtMs = Date.now()) {
  const at = Number(cachedAtMs);
  const stamp = Number.isFinite(at) ? new Date(at).toISOString() : new Date().toISOString();
  return new Response(String(text), {
    headers: {
      "content-type": "application/json",
      [MOVIE_CACHE_TIMESTAMP_HEADER]: stamp,
    },
  });
}

function readMovieCacheTimestampMs(response) {
  const raw = response?.headers?.get?.(MOVIE_CACHE_TIMESTAMP_HEADER);
  if (!raw) {
    return null;
  }
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : null;
}

function shouldRevalidateMovieCache(response, nowMs = Date.now()) {
  const cachedAt = readMovieCacheTimestampMs(response);
  if (cachedAt == null) {
    return true;
  }
  return nowMs - cachedAt >= MOVIE_CACHE_REVALIDATE_MS;
}

module.exports = {
  MOVIE_CACHE_REVALIDATE_MS,
  MOVIE_CACHE_TIMESTAMP_HEADER,
  buildCachedMovieResponse,
  readMovieCacheTimestampMs,
  shouldRevalidateMovieCache,
};
