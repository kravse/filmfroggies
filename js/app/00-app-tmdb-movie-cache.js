/* Generated from scripts/lib/tmdb-movie-cache.js — run npm run bundle */

const appTmdbMovieCache = (function () {
  /**
   * Cache API timestamps for TMDB movie JSON and poster blobs. Cached entries are
   * served immediately; upstream is consulted again only after the interval.
   */

  const CACHE_REVALIDATE_MS = 30 * 24 * 60 * 60 * 1000;
  const CACHE_TIMESTAMP_HEADER = "x-moviecollector-cached-at";

  /** @deprecated use CACHE_REVALIDATE_MS */
  const MOVIE_CACHE_REVALIDATE_MS = CACHE_REVALIDATE_MS;
  /** @deprecated use CACHE_TIMESTAMP_HEADER */
  const MOVIE_CACHE_TIMESTAMP_HEADER = CACHE_TIMESTAMP_HEADER;

  function buildCachedResponse(body, contentType, cachedAtMs = Date.now()) {
    const at = Number(cachedAtMs);
    const stamp = Number.isFinite(at) ? new Date(at).toISOString() : new Date().toISOString();
    return new Response(body, {
      headers: {
        "content-type": contentType,
        [CACHE_TIMESTAMP_HEADER]: stamp,
      },
    });
  }

  function buildCachedMovieResponse(text, cachedAtMs = Date.now()) {
    return buildCachedResponse(String(text), "application/json", cachedAtMs);
  }

  function buildCachedBlobResponse(blob, contentType, cachedAtMs = Date.now()) {
    return buildCachedResponse(blob, contentType || "application/octet-stream", cachedAtMs);
  }

  function readCacheTimestampMs(response) {
    const raw = response?.headers?.get?.(CACHE_TIMESTAMP_HEADER);
    if (!raw) {
      return null;
    }
    const ms = Date.parse(raw);
    return Number.isFinite(ms) ? ms : null;
  }

  function shouldRevalidateCache(response, nowMs = Date.now()) {
    const cachedAt = readCacheTimestampMs(response);
    if (cachedAt == null) {
      return true;
    }
    return nowMs - cachedAt >= CACHE_REVALIDATE_MS;
  }

  /** @deprecated use readCacheTimestampMs */
  const readMovieCacheTimestampMs = readCacheTimestampMs;
  /** @deprecated use shouldRevalidateCache */
  const shouldRevalidateMovieCache = shouldRevalidateCache;

  return {
    CACHE_REVALIDATE_MS,
    CACHE_TIMESTAMP_HEADER,
    MOVIE_CACHE_REVALIDATE_MS,
    MOVIE_CACHE_TIMESTAMP_HEADER,
    buildCachedResponse,
    buildCachedMovieResponse,
    buildCachedBlobResponse,
    readCacheTimestampMs,
    shouldRevalidateCache,
    readMovieCacheTimestampMs,
    shouldRevalidateMovieCache,
  };
})();
