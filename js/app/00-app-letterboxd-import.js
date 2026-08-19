/* Generated from scripts/lib/letterboxd-import.js — run npm run bundle */

const appLetterboxdImport = (function () {
  /**
   * Parse the useful parts of a Letterboxd account export into a small,
   * source-oriented model. ZIP extraction and TMDB matching live in the browser
   * layer; keeping CSV handling here makes the risky data conversion testable.
   */

  const SUPPORTED_FILES = new Set([
    "watched.csv",
    "watchlist.csv",
    "ratings.csv",
    "diary.csv",
  ]);

  function parseCsv(text) {
    const source = String(text == null ? "" : text).replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (quoted) {
        if (char === '"' && source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          field += char;
        }
        continue;
      }
      if (char === '"' && field === "") {
        quoted = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && source[index + 1] === "\n") index += 1;
        row.push(field);
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
    if (quoted) throw new Error("CSV contains an unterminated quoted field.");
    row.push(field);
    if (row.some((value) => value !== "")) rows.push(row);
    return rows;
  }

  function canonicalHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  }

  function csvRecords(text) {
    const rows = parseCsv(text);
    if (!rows.length) return [];
    const headers = rows[0].map(canonicalHeader);
    return rows.slice(1).map((values) => {
      const record = {};
      headers.forEach((header, index) => {
        if (header) record[header] = String(values[index] || "").trim();
      });
      return record;
    });
  }

  function baseName(pathname) {
    return String(pathname || "").replace(/\\/g, "/").split("/").pop().toLowerCase();
  }

  function isSupportedPath(pathname) {
    const parts = String(pathname || "").replace(/\\/g, "/").toLowerCase().split("/").filter(Boolean);
    if (["deleted", "orphaned", "likes"].some((part) => parts.includes(part))) return false;
    return SUPPORTED_FILES.has(parts.at(-1));
  }

  function normalizeYear(value) {
    const year = Number(value);
    return Number.isInteger(year) && year >= 1870 && year <= 2200 ? year : null;
  }

  function normalizeDate(value) {
    const text = String(value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
    const date = new Date(`${text}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text
      ? text
      : null;
  }

  function normalizeRating(value) {
    const rating = Number(value);
    return Number.isFinite(rating) && rating >= 0.5 && rating <= 5
      ? Math.round(rating * 20) / 10
      : null;
  }

  function filmSourceKey(record) {
    const uri = record.letterboxduri || record.url;
    if (uri) return `uri:${uri.toLowerCase()}`;
    const title = record.name || record.title;
    const year = normalizeYear(record.year);
    return title ? `title:${title.toLowerCase()}|${year || ""}` : null;
  }

  function emptyFilm(record, sourceKey) {
    return {
      sourceKey,
      letterboxdUri: record.letterboxduri || record.url || null,
      title: record.name || record.title || "Untitled",
      year: normalizeYear(record.year),
      watched: false,
      watchlist: false,
      rating: null,
      viewings: [],
    };
  }

  function parseLetterboxdFiles(files) {
    const films = new Map();
    const seenFiles = [];
    const ignoredFiles = [];
    const warnings = [];

    const priority = { "diary.csv": 0, "watched.csv": 1, "watchlist.csv": 2, "ratings.csv": 3 };
    const entries = Object.entries(files || {}).sort((left, right) => {
      return (priority[baseName(left[0])] ?? 99) - (priority[baseName(right[0])] ?? 99);
    });
    for (const [pathname, text] of entries) {
      const filename = baseName(pathname);
      if (!isSupportedPath(pathname)) {
        if (filename.endsWith(".csv")) ignoredFiles.push(pathname);
        continue;
      }
      seenFiles.push(filename);
      let records;
      try {
        records = csvRecords(text);
      } catch (error) {
        throw new Error(`${filename}: ${error.message}`);
      }
      for (const record of records) {
        const sourceKey = filmSourceKey(record);
        if (!sourceKey) {
          warnings.push(`${filename}: skipped a row without a film URI or title.`);
          continue;
        }
        const film = films.get(sourceKey) || emptyFilm(record, sourceKey);
        if (filename === "watched.csv" || filename === "diary.csv" || filename === "ratings.csv") {
          film.watched = true;
        }
        if (filename === "watchlist.csv") film.watchlist = true;
        if (filename === "ratings.csv" || filename === "diary.csv") {
          const rating = normalizeRating(record.rating);
          if (rating != null) film.rating = rating;
        }
        if (filename === "diary.csv") {
          const watchedOn = normalizeDate(record.watcheddate);
          if (watchedOn && !film.viewings.includes(watchedOn)) film.viewings.push(watchedOn);
        }
        films.set(sourceKey, film);
      }
    }

    if (!seenFiles.length) {
      throw new Error("No supported Letterboxd files were found. Expected watched.csv, watchlist.csv, ratings.csv, or diary.csv.");
    }
    for (const film of films.values()) {
      film.viewings.sort();
      if (film.watched) film.watchlist = false;
    }
    return { films: [...films.values()], seenFiles: [...new Set(seenFiles)].sort(), ignoredFiles, warnings };
  }

  function stableViewingId(sourceKey, watchedOn) {
    const input = `letterboxd:${sourceKey}:${watchedOn}`;
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `letterboxd-${(hash >>> 0).toString(36)}`;
  }

  function getImportLibraries() {
    if (typeof appLists !== "undefined") {
      return {
        lists: appLists,
        ratings: appRatings,
        addedAt: appAddedAt,
        viewingHistory: appViewingHistory,
        syncMerge: appSyncMerge,
      };
    }
    if (typeof require === "function") {
      const load = require;
      return {
        lists: load("./lists"),
        ratings: load("./ratings"),
        addedAt: load("./added-at"),
        viewingHistory: load("./viewing-history"),
        syncMerge: load("./sync-merge"),
      };
    }
    throw new Error("Import libraries are not available.");
  }

  /** Build one new state object. Callers decide when to persist and sync it. */
  function applyLetterboxdImport(state, films, matches, options = {}) {
    const lib = getImportLibraries();
    const now = options.now instanceof Date ? options.now : new Date();
    const overwriteRatings = options.overwriteRatings === true;
    let lists = state.lists;
    let ratings = state.ratings;
    let addedAt = state.addedAt;
    let viewingHistory = state.viewingHistory;
    let statuses = state.statuses;
    const summary = { matched: 0, skipped: 0, watched: 0, watchlist: 0, ratings: 0, viewings: 0 };

    for (const film of films || []) {
      const movieId = Number(matches?.[film.sourceKey]);
      if (!Number.isInteger(movieId) || movieId <= 0) {
        summary.skipped += 1;
        continue;
      }
      summary.matched += 1;
      const wasWatched = lib.lists.isWatched(lists, movieId);
      const wasWatchlisted = lib.lists.isOnWatchlist(lists, movieId);
      let targetStatus = null;
      if (film.watched && !wasWatched) targetStatus = lib.lists.WATCHED_ID;
      else if (film.watchlist && !wasWatched && !wasWatchlisted) targetStatus = lib.lists.WATCHLIST_ID;

      if (targetStatus) {
        lists = lib.lists.assignMovieToList(lists, targetStatus, movieId);
        statuses = lib.syncMerge.setMovieStatus(statuses, movieId, targetStatus, now);
        addedAt = lib.addedAt.recordAddedAt(addedAt, movieId, now, {
          readded: lib.syncMerge.isRemoved(state.statuses, movieId),
        });
        summary[targetStatus] += 1;
      }

      if (film.rating != null && (overwriteRatings || lib.ratings.getRating(ratings, movieId) == null)) {
        const nextRatings = lib.ratings.setRating(ratings, movieId, film.rating);
        if (nextRatings !== ratings) {
          ratings = nextRatings;
          summary.ratings += 1;
        }
      }

      for (const watchedOn of film.viewings || []) {
        const id = stableViewingId(film.sourceKey, watchedOn);
        const known = lib.viewingHistory
          .viewingEntries(viewingHistory, movieId, { includeDeleted: true })
          .some((entry) => entry.id === id);
        if (known) continue;
        const nextHistory = lib.viewingHistory.addViewing(viewingHistory, movieId, watchedOn, now, id);
        if (nextHistory !== viewingHistory) {
          viewingHistory = nextHistory;
          summary.viewings += 1;
        }
      }
    }

    return {
      state: { ...state, lists, ratings, addedAt, viewingHistory, statuses },
      summary,
    };
  }

  return {
    SUPPORTED_FILES,
    parseCsv,
    csvRecords,
    normalizeDate,
    normalizeRating,
    filmSourceKey,
    isSupportedPath,
    parseLetterboxdFiles,
    stableViewingId,
    applyLetterboxdImport,
  };
})();
