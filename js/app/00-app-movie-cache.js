/* Generated from scripts/lib/movie-cache.js — run npm run bundle */

const appMovieCache = (function () {
  /**
   * Client-side helpers for POST /api/movies/batch.
   */

  const BATCH_MAX_IDS = 100;

  function getTmdb() {
    if (typeof appTmdb !== "undefined") {
      return appTmdb;
    }
    if (typeof require === "function") {
      return require("./tmdb");
    }
    throw new Error("appTmdb is not available");
  }

  /** Dedupe positive integer ids, preserve first-seen order. */
  function normalizeBatchIds(ids, max = BATCH_MAX_IDS) {
    if (!Array.isArray(ids)) {
      return [];
    }
    const seen = new Set();
    const out = [];
    for (const value of ids) {
      const id = Number(value);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      if (out.length >= max) {
        break;
      }
      out.push(id);
    }
    return out;
  }

  function chunkIds(ids, max = BATCH_MAX_IDS) {
    const normalized = normalizeBatchIds(ids, Number.POSITIVE_INFINITY);
    const chunks = [];
    for (let i = 0; i < normalized.length; i += max) {
      chunks.push(normalized.slice(i, i + max));
    }
    return chunks.length ? chunks : [[]];
  }

  function parseBatchResponse(body) {
    if (!body || typeof body !== "object" || !body.movies || typeof body.movies !== "object") {
      return { movies: {}, missing: [] };
    }
    const tmdb = getTmdb();
    const movies = {};
    for (const [key, raw] of Object.entries(body.movies)) {
      const id = Number(key);
      if (!Number.isInteger(id) || id <= 0 || !raw || typeof raw !== "object") {
        continue;
      }
      if (tmdb.isDetailedMovieRecord(raw) && Number(raw.id) === id) {
        movies[id] = raw;
      }
    }
    const missing = Array.isArray(body.missing)
      ? body.missing
          .map((value) => Number(value))
          .filter((id) => Number.isInteger(id) && id > 0)
      : [];
    return { movies, missing };
  }

  function mergeBatchIntoMap(target, batchMovies) {
    if (!target || !batchMovies || typeof batchMovies !== "object") {
      return target;
    }
    for (const [key, record] of Object.entries(batchMovies)) {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && record) {
        target.set(id, record);
      }
    }
    return target;
  }

  return {
    BATCH_MAX_IDS,
    normalizeBatchIds,
    chunkIds,
    parseBatchResponse,
    mergeBatchIntoMap,
  };
})();
