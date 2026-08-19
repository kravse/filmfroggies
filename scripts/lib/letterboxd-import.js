/**
 * Parse the useful parts of a Letterboxd account export into a small,
 * source-oriented model. ZIP extraction and TMDB matching run in the local
 * browser tool; CSV handling here keeps the risky data conversion testable.
 */

function getParseCsv() {
  if (typeof appListCsv !== "undefined" && typeof appListCsv.parseCsv === "function") {
    return appListCsv.parseCsv;
  }
  if (typeof require === "function") {
    return require("./list-csv").parseCsv;
  }
  throw new Error("parseCsv is not available");
}

const SUPPORTED_FILES = new Set([
  "watched.csv",
  "watchlist.csv",
  "ratings.csv",
  "diary.csv",
]);

function canonicalHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function parseCsv(text) {
  return getParseCsv()(text);
}

function csvRecords(text) {
  const rows = getParseCsv()(text);
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

function normalizeMatchTitle(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function candidateReleaseYear(candidate) {
  return Number(String(candidate?.releaseDate || "").slice(0, 4)) || null;
}

/**
 * Letterboxd and TMDB can differ by one year when one uses a festival premiere
 * and the other a wider release. Exact titles are required; where several
 * candidates remain, TMDB's relevance ordering supplies the tie-break.
 */
function pickTmdbMatch(film, candidates) {
  const title = normalizeMatchTitle(film?.title);
  const seenIds = new Set();
  const exactTitle = (Array.isArray(candidates) ? candidates : []).filter((candidate) => {
    const id = Number(candidate?.id);
    if (!Number.isInteger(id) || id <= 0 || seenIds.has(id)) return false;
    seenIds.add(id);
    return normalizeMatchTitle(candidate?.title) === title;
  });
  if (!film?.year) return exactTitle.length === 1 ? exactTitle[0].id : null;
  const exactYear = exactTitle.filter((candidate) => candidateReleaseYear(candidate) === film.year);
  // TMDB orders search results by relevance. If several films have the exact
  // same title and release year, its first result is the best available signal.
  if (exactYear.length) return exactYear[0].id;
  const adjacentYear = exactTitle.filter((candidate) => {
    const year = candidateReleaseYear(candidate);
    return year != null && Math.abs(year - film.year) === 1;
  });
  return adjacentYear.length ? adjacentYear[0].id : null;
}

/** Rank TMDB search hits for manual review (year proximity, then TMDB order). */
function sortedTmdbCandidates(film, candidates, limit = 10) {
  const seenIds = new Set();
  const unique = (Array.isArray(candidates) ? candidates : []).filter((candidate) => {
    const id = Number(candidate?.id);
    if (!Number.isInteger(id) || id <= 0 || seenIds.has(id)) {
      return false;
    }
    seenIds.add(id);
    return true;
  });
  return unique
    .map((candidate, index) => ({ candidate, index }))
    .sort((left, right) => {
      const yearRank = (candidate) => {
        const year = candidateReleaseYear(candidate);
        if (!film?.year || year == null) {
          return 2;
        }
        if (year === film.year) {
          return 0;
        }
        if (Math.abs(year - film.year) === 1) {
          return 1;
        }
        return 2;
      };
      return yearRank(left.candidate) - yearRank(right.candidate) || left.index - right.index;
    })
    .map((entry) => entry.candidate)
    .slice(0, limit);
}

function matchReviewRank(film, matches, lookupFailed) {
  if (lookupFailed.has(film.sourceKey)) {
    return 0;
  }
  if (!matches[film.sourceKey]) {
    return 1;
  }
  return 2;
}

/** Films to step through in an interactive review (lookup failures and ambiguous first). */
function filmsForMatchReview(films, matches, lookupFailed, options = {}) {
  const reviewAll = options.reviewAll === true;
  return (films || [])
    .filter((film) => {
      if (reviewAll) {
        return true;
      }
      return lookupFailed.has(film.sourceKey) || !matches[film.sourceKey];
    })
    .sort((left, right) => {
      return (
        matchReviewRank(left, matches, lookupFailed)
        - matchReviewRank(right, matches, lookupFailed)
        || String(left.title).localeCompare(String(right.title))
      );
    });
}

/**
 * Parse a review prompt answer.
 * Menu picks are 1…n; 0 skips; a positive integer outside the menu is a manual TMDB id.
 */
function parseMatchChoice(answer, candidates, currentId = null) {
  const text = String(answer ?? "").trim().toLowerCase();
  if (!text) {
    return currentId ? { action: "keep", id: currentId } : { action: "skip" };
  }
  if (text === "q" || text === "quit") {
    return { action: "quit" };
  }
  if (text === "s" || text === "skip") {
    return { action: "skip" };
  }
  const num = Number(text);
  if (!Number.isInteger(num)) {
    return { action: "invalid" };
  }
  if (num === 0) {
    return { action: "skip" };
  }
  const menuSize = Array.isArray(candidates) ? candidates.length : 0;
  if (num >= 1 && num <= menuSize) {
    return { action: "pick", id: Number(candidates[num - 1].id) };
  }
  if (num > 0) {
    return { action: "pick", id: num };
  }
  return { action: "invalid" };
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

function getListCsvLibraries() {
  if (typeof appLists !== "undefined" && typeof appRatings !== "undefined") {
    return { lists: appLists, ratings: appRatings };
  }
  if (typeof require === "function") {
    return {
      lists: require("./lists"),
      ratings: require("./ratings"),
    };
  }
  throw new Error("List CSV libraries are not available.");
}

/** Turn matched Letterboxd films into collection backup CSV row objects. */
function letterboxdFilmsToImportRows(films, matches) {
  const { lists, ratings } = getListCsvLibraries();
  const watchedPreset = lists.PRESET_LISTS.find((entry) => entry.id === lists.WATCHED_ID);
  const watchlistPreset = lists.PRESET_LISTS.find((entry) => entry.id === lists.WATCHLIST_ID);
  const rows = [];

  for (const film of films || []) {
    const movieId = Number(matches?.[film.sourceKey]);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      continue;
    }
    const base = {
      id: movieId,
      title: film.title,
      myRating: film.rating != null ? ratings.formatUserRating(film.rating) : "",
      releaseYear: film.year != null ? String(film.year) : "",
      watchDates: (film.viewings || []).join(";"),
    };
    if (film.watched) {
      rows.push({
        ...base,
        listId: lists.WATCHED_ID,
        listName: watchedPreset?.name || "Watched",
      });
    } else if (film.watchlist) {
      rows.push({
        ...base,
        listId: lists.WATCHLIST_ID,
        listName: watchlistPreset?.name || "Watchlist",
      });
    }
  }

  return rows;
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

module.exports = {
  SUPPORTED_FILES,
  parseCsv,
  csvRecords,
  normalizeDate,
  normalizeRating,
  filmSourceKey,
  isSupportedPath,
  parseLetterboxdFiles,
  stableViewingId,
  normalizeMatchTitle,
  candidateReleaseYear,
  pickTmdbMatch,
  sortedTmdbCandidates,
  filmsForMatchReview,
  parseMatchChoice,
  letterboxdFilmsToImportRows,
  applyLetterboxdImport,
};
