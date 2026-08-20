/* Generated from scripts/lib/local-data.js — run npm run bundle */

const appLocalData = (function () {
  /**
   * Committed poster assets under data/.
   *
   * `npm run scrape` downloads poster files for ids in data/my_list.csv and writes
   * data/posters.json so the app can serve them from the repo. Movie metadata
   * comes from the account D1 batch cache, not from data/.
   *
   * Legacy data/movies.json helpers remain for tests and one-time scraper migration.
   */

  const LOCAL_DATA_VERSION = 1;
  const LOCAL_DATA_URL = "data/movies.json";
  const LOCAL_POSTERS_VERSION = 1;
  const LOCAL_POSTERS_URL = "data/posters.json";
  const LOCAL_POSTER_DIR = "data/posters";
  /** Ascending. Card and suggest requests scale down from the smallest stored. */
  const LOCAL_POSTER_SIZES = ["w342", "w500"];

  const POSTER_SIZE_PATTERN = /^w(\d+)$/;
  const POSTER_FILE_PATTERN = /^[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/i;

  function getTmdb() {
    if (typeof appTmdb !== "undefined") {
      return appTmdb;
    }
    if (typeof require === "function") {
      return require("./tmdb");
    }
    throw new Error("appTmdb is not available");
  }

  function cleanText(value) {
    const text = String(value == null ? "" : value).trim();
    return text || null;
  }

  function cleanNames(value) {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.map(cleanText).filter(Boolean);
  }

  function cleanPositiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function cleanImagePath(value) {
    return getTmdb().isValidImagePath(value) ? String(value) : null;
  }

  /** Stored poster filenames are basenames, so validate them with a leading slash. */
  function isPosterFile(value) {
    const file = String(value == null ? "" : value);
    return POSTER_FILE_PATTERN.test(file) && getTmdb().isValidImagePath(`/${file}`);
  }

  function posterFileFromPath(imagePath) {
    if (!getTmdb().isValidImagePath(imagePath)) {
      return null;
    }
    return String(imagePath).slice(1);
  }

  /** `original` has no width, so it sorts above every numbered size. */
  function posterSizeWidth(size) {
    if (size === "original") {
      return Number.POSITIVE_INFINITY;
    }
    const match = POSTER_SIZE_PATTERN.exec(String(size || ""));
    return match ? Number(match[1]) : null;
  }

  function normalizePosterSizes(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = new Set();
    const sizes = [];
    for (const entry of raw) {
      const size = String(entry || "");
      if (posterSizeWidth(size) == null || seen.has(size)) {
        continue;
      }
      seen.add(size);
      sizes.push(size);
    }
    return sizes.sort((a, b) => posterSizeWidth(a) - posterSizeWidth(b));
  }

  /**
   * The smallest stored size that is at least as wide as the one asked for, so a
   * w185 card is served the stored w342 and scaled down by the browser. A request
   * wider than anything stored falls back to the largest available.
   */
  function pickPosterSize(size, storedSizes) {
    const sizes = normalizePosterSizes(storedSizes);
    if (!sizes.length) {
      return null;
    }
    const wanted = posterSizeWidth(size);
    if (wanted == null) {
      return null;
    }
    return sizes.find((stored) => posterSizeWidth(stored) >= wanted) || sizes[sizes.length - 1];
  }

  /** Null whenever the snapshot cannot serve this image, which means fall back to TMDB. */
  function localPosterUrl(posterFile, size, storedSizes) {
    if (!isPosterFile(posterFile)) {
      return null;
    }
    const stored = pickPosterSize(size, storedSizes);
    if (!stored) {
      return null;
    }
    return `${LOCAL_POSTER_DIR}/${stored}/${posterFile}`;
  }

  function normalizeLocalRecord(raw) {
    const id = Number(raw?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }
    return {
      id,
      title: cleanText(raw.title) || "Untitled",
      releaseDate: cleanText(raw.releaseDate),
      overview: cleanText(raw.overview),
      tagline: cleanText(raw.tagline),
      posterPath: cleanImagePath(raw.posterPath),
      backdropPath: cleanImagePath(raw.backdropPath),
      runtime: cleanPositiveNumber(raw.runtime),
      voteAverage: cleanPositiveNumber(raw.voteAverage),
      genres: cleanNames(raw.genres),
      directors: cleanNames(raw.directors),
      cast: cleanNames(raw.cast),
      poster: isPosterFile(raw.poster) ? String(raw.poster) : null,
    };
  }

  /**
   * A snapshot the app cannot read is treated as absent rather than fatal: the
   * app then behaves exactly as it did before there was a data folder.
   */
  function normalizeLocalData(raw) {
    const empty = { generatedAt: null, posterSizes: [], records: [] };
    if (!raw || typeof raw !== "object" || Number(raw.version) !== LOCAL_DATA_VERSION) {
      return empty;
    }
    const movies = raw.movies;
    if (!movies || typeof movies !== "object") {
      return empty;
    }
    const records = Object.values(movies).map(normalizeLocalRecord).filter(Boolean);
    return {
      generatedAt: cleanText(raw.generatedAt),
      posterSizes: normalizePosterSizes(raw.posterSizes),
      records,
    };
  }

  /** Ids ascend so the file diffs cleanly between scrapes. */
  function serializeLocalData(records, options = {}) {
    const movies = {};
    for (const record of records.map(normalizeLocalRecord).filter(Boolean).sort((a, b) => a.id - b.id)) {
      movies[record.id] = record;
    }
    return {
      version: LOCAL_DATA_VERSION,
      generatedAt: cleanText(options.generatedAt) || new Date().toISOString(),
      posterSizes: normalizePosterSizes(options.posterSizes || LOCAL_POSTER_SIZES),
      movies,
    };
  }

  function normalizePostersManifest(raw) {
    const empty = { generatedAt: null, posterSizes: [], posters: {} };
    if (!raw || typeof raw !== "object" || Number(raw.version) !== LOCAL_POSTERS_VERSION) {
      return empty;
    }
    const postersRaw = raw.posters;
    if (!postersRaw || typeof postersRaw !== "object") {
      return empty;
    }
    const posters = {};
    for (const [key, value] of Object.entries(postersRaw)) {
      const id = Number(key);
      if (!Number.isInteger(id) || id <= 0 || !isPosterFile(value)) {
        continue;
      }
      posters[id] = String(value);
    }
    return {
      generatedAt: cleanText(raw.generatedAt),
      posterSizes: normalizePosterSizes(raw.posterSizes),
      posters,
    };
  }

  function serializePostersManifest(postersById, options = {}) {
    const posters = {};
    for (const id of Object.keys(postersById)
      .map(Number)
      .filter((value) => Number.isInteger(value) && value > 0)
      .sort((a, b) => a - b)) {
      const file = postersById[id];
      if (isPosterFile(file)) {
        posters[id] = String(file);
      }
    }
    return {
      version: LOCAL_POSTERS_VERSION,
      generatedAt: cleanText(options.generatedAt) || new Date().toISOString(),
      posterSizes: normalizePosterSizes(options.posterSizes || LOCAL_POSTER_SIZES),
      posters,
    };
  }

  return {
    LOCAL_DATA_VERSION,
    LOCAL_DATA_URL,
    LOCAL_POSTERS_VERSION,
    LOCAL_POSTERS_URL,
    LOCAL_POSTER_DIR,
    LOCAL_POSTER_SIZES,
    posterSizeWidth,
    posterFileFromPath,
    isPosterFile,
    pickPosterSize,
    localPosterUrl,
    normalizeLocalRecord,
    normalizeLocalData,
    serializeLocalData,
    normalizePostersManifest,
  };
})();
