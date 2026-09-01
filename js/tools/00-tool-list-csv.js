/* Generated from scripts/lib/list-csv.js — run npm run bundle:letterboxd */

const appListCsv = (function () {
  /**
   * Collection backup CSV: export from the browser, import to restore.
   *
   * The browser is the only place that knows the collection, so Settings exports
   * this file and reads it back on import. Export and import share these
   * functions so the format has exactly one definition.
   *
   * Only `tmdb_id` identifies a movie. The other columns carry list membership,
   * ratings, and viewing dates for backup/restore.
   */

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

  const CSV_HEADER = ["tmdb_id", "title", "list_id", "list_name", "my_rating", "release_year", "watch_dates"];
  const CSV_FILENAME = "my_list.csv";

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function getCustomLists() {
    if (typeof appCustomLists !== "undefined") {
      return appCustomLists;
    }
    if (typeof require === "function") {
      return require("./custom-lists");
    }
    throw new Error("appCustomLists is not available");
  }

  function getRatings() {
    if (typeof appRatings !== "undefined") {
      return appRatings;
    }
    if (typeof require === "function") {
      return require("./ratings");
    }
    throw new Error("appRatings is not available");
  }

  function getViewingHistory() {
    if (typeof appViewingHistory !== "undefined") return appViewingHistory;
    if (typeof require === "function") return require("./viewing-history");
    throw new Error("appViewingHistory is not available");
  }

  function getAddedAt() {
    if (typeof appAddedAt !== "undefined") return appAddedAt;
    if (typeof require === "function") return require("./added-at");
    throw new Error("appAddedAt is not available");
  }

  function getSyncMerge() {
    if (typeof appSyncMerge !== "undefined") return appSyncMerge;
    if (typeof require === "function") return require("./sync-merge");
    throw new Error("appSyncMerge is not available");
  }

  function releaseYearFrom(releaseDate) {
    const match = /^(\d{4})/.exec(String(releaseDate || "").trim());
    return match ? match[1] : "";
  }

  function rowMeta(state, id, recordFor) {
    const record = typeof recordFor === "function" ? recordFor(id) : null;
    const title = String(record?.title || "");
    const releaseYear = releaseYearFrom(record?.releaseDate);
    const myRating = getRatings().formatUserRating(
      getRatings().getRating(state?.ratings, id),
    );
    const watchDates = getViewingHistory()
      .viewingEntries(state?.viewingHistory, id)
      .map((entry) => entry.watchedOn)
      .sort()
      .join(";");
    return { title, releaseYear, myRating, watchDates: watchDates || "" };
  }

  function listNameFor(state, listId) {
    const preset = getLists().PRESET_LISTS.find((entry) => entry.id === listId);
    if (preset) {
      return preset.name;
    }
    const custom = getCustomLists().findCustomList(state?.customLists, listId);
    return custom?.name || "";
  }

  /** Quote whenever a field could otherwise change the shape of the row. */
  function csvField(value) {
    const text = String(value == null ? "" : value);
    if (!/[",\r\n]/.test(text)) {
      return text;
    }
    return `"${text.replace(/"/g, '""')}"`;
  }

  function csvRow(values) {
    return values.map(csvField).join(",");
  }

  function rowFromMembership(state, id, listId, listName, recordFor) {
    return {
      id,
      listId,
      listName,
      ...rowMeta(state, id, recordFor),
    };
  }

  /**
   * One row per list membership. Watched and watchlist rows first (stored order),
   * then each custom list in stored order.
   */
  function listCsvRows(state, recordFor) {
    const lists = Array.isArray(state?.lists) ? state.lists : [];
    const customLists = Array.isArray(state?.customLists) ? state.customLists : [];
    const rows = [];

    for (const listId of getLists().LIST_IDS) {
      const list = lists.find((entry) => entry && entry.id === listId);
      for (const movieId of list?.movieIds || []) {
        const id = Number(movieId);
        if (!Number.isInteger(id) || id <= 0) {
          continue;
        }
        rows.push(rowFromMembership(state, id, listId, listNameFor(state, listId), recordFor));
      }
    }

    for (const list of customLists) {
      if (!list || !getCustomLists().isCustomListId(list.id)) {
        continue;
      }
      for (const movieId of list.movieIds || []) {
        const id = Number(movieId);
        if (!Number.isInteger(id) || id <= 0) {
          continue;
        }
        rows.push(rowFromMembership(state, id, list.id, list.name, recordFor));
      }
    }

    return rows;
  }

  function buildListCsv(rows) {
    const lines = [csvRow(CSV_HEADER)];
    for (const row of rows || []) {
      lines.push(
        csvRow([
          row.id,
          row.title,
          row.listId,
          row.listName,
          row.myRating,
          row.releaseYear,
          row.watchDates,
        ]),
      );
    }
    return `${lines.join("\n")}\n`;
  }

  function canonicalHeader(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
  }

  function parseRatingField(value) {
    const text = String(value || "").trim();
    if (!text) {
      return null;
    }
    return getRatings().normalizeRating(Number(text));
  }

  function parseWatchDatesField(value) {
    const viewingLib = getViewingHistory();
    const dates = [];
    const seen = new Set();
    for (const part of String(value || "").split(";")) {
      const normalized = viewingLib.normalizeDate(part.trim());
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        dates.push(normalized);
      }
    }
    dates.sort();
    return dates;
  }

  /** Parse a collection backup CSV into normalized row objects. */
  function parseCollectionCsv(text) {
    const grid = parseCsv(text);
    if (!grid.length) {
      return [];
    }
    const headers = grid[0].map(canonicalHeader);
    const index = {};
    headers.forEach((header, position) => {
      if (header) {
        index[header] = position;
      }
    });
    const idCol = index.tmdbid ?? index.id ?? 0;
    const rows = [];
    for (const values of grid.slice(1)) {
      const rawId = String(values[idCol] || "").trim();
      if (!/^\d+$/.test(rawId)) {
        continue;
      }
      const tmdbId = Number(rawId);
      if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
        continue;
      }
      const read = (key) => String(values[index[key]] || "").trim();
      rows.push({
        tmdbId,
        title: read("title"),
        listId: read("listid"),
        listName: read("listname"),
        myRating: parseRatingField(read("myrating")),
        releaseYear: read("releaseyear"),
        watchDates: parseWatchDatesField(read("watchdates")),
      });
    }
    return rows;
  }

  function summarizeCollectionImport(rows) {
    const movieIds = new Set();
    let watched = 0;
    let watchlist = 0;
    let customRows = 0;
    let ratings = 0;
    let viewings = 0;
    const ratingMovies = new Set();
    const viewingMovies = new Set();

    for (const row of rows || []) {
      movieIds.add(row.tmdbId);
      if (row.listId === getLists().WATCHED_ID) {
        watched += 1;
      } else if (row.listId === getLists().WATCHLIST_ID) {
        watchlist += 1;
      } else if (getCustomLists().isCustomListId(row.listId)) {
        customRows += 1;
      }
      if (row.myRating != null && !ratingMovies.has(row.tmdbId)) {
        ratingMovies.add(row.tmdbId);
        ratings += 1;
      }
      if (row.watchDates.length && !viewingMovies.has(row.tmdbId)) {
        viewingMovies.add(row.tmdbId);
        viewings += row.watchDates.length;
      }
    }

    return {
      movies: movieIds.size,
      rows: rows?.length || 0,
      watched,
      watchlist,
      customRows,
      ratings,
      viewings,
    };
  }


  function mergeMovieFields(rowsForMovie) {
    let myRating = null;
    const watchDates = new Set();
    for (const row of rowsForMovie) {
      if (row.myRating != null) {
        myRating = row.myRating;
      }
      for (const date of row.watchDates) {
        watchDates.add(date);
      }
    }
    return {
      myRating,
      watchDates: [...watchDates].sort(),
    };
  }

  /**
   * Replace lists, ratings, and viewing history from a collection backup CSV.
   * Custom lists in the file are created when missing; empty custom lists with no
   * rows are kept from the current state only.
   */
  function applyCollectionImport(state, rows, options = {}) {
    if (options.mode && options.mode !== "replace") {
      throw new Error(`Unsupported import mode: ${options.mode}`);
    }

    const now = options.now instanceof Date ? options.now : new Date();
    const listsLib = getLists();
    const customListsLib = getCustomLists();
    const ratingsLib = getRatings();
    const viewingLib = getViewingHistory();
    const addedAtLib = getAddedAt();
    const syncLib = getSyncMerge();

    const parsedRows = Array.isArray(rows) ? rows : [];
    const byMovie = new Map();
    for (const row of parsedRows) {
      if (!byMovie.has(row.tmdbId)) {
        byMovie.set(row.tmdbId, []);
      }
      byMovie.get(row.tmdbId).push(row);
    }

    let lists = listsLib.defaultLists();
    let customLists = (state?.customLists || []).map((list) => ({ ...list, movieIds: [] }));
    let customListTombstones =
      state?.customListTombstones && typeof state.customListTombstones === "object"
        ? { ...state.customListTombstones }
        : {};
    const ensured = customListsLib.ensureCustomListsFromImport(
      customLists,
      customListTombstones,
      parsedRows,
      now,
    );
    customLists = ensured.customLists.map((list) => ({ ...list, movieIds: [] }));
    customListTombstones = ensured.customListTombstones;
    let ratings = {};
    let viewingHistory = {};
    let statuses = {};
    let addedAt = {};

    const watchedOrder = [];
    const watchlistOrder = [];
    const watchedSeen = new Set();
    const watchlistSeen = new Set();
    const customOrder = new Map();

    for (const row of parsedRows) {
      const id = row.tmdbId;
      if (row.listId === listsLib.WATCHED_ID && !watchedSeen.has(id)) {
        watchedSeen.add(id);
        watchedOrder.push(id);
      } else if (row.listId === listsLib.WATCHLIST_ID && !watchlistSeen.has(id)) {
        watchlistSeen.add(id);
        watchlistOrder.push(id);
      } else if (customListsLib.isCustomListId(row.listId)) {
        if (!customListsLib.findCustomList(customLists, row.listId)) {
          continue;
        }
        if (!customOrder.has(row.listId)) {
          customOrder.set(row.listId, []);
        }
        const order = customOrder.get(row.listId);
        if (!order.includes(id)) {
          order.push(id);
        }
      }
    }

    for (const id of watchedOrder) {
      lists = listsLib.assignMovieToList(lists, listsLib.WATCHED_ID, id);
      statuses = syncLib.setMovieStatus(statuses, id, listsLib.WATCHED_ID, now);
      addedAt = addedAtLib.recordAddedAt(addedAt, id, now);
    }

    for (const id of watchlistOrder) {
      if (listsLib.isWatched(lists, id)) {
        continue;
      }
      lists = listsLib.assignMovieToList(lists, listsLib.WATCHLIST_ID, id);
      statuses = syncLib.setMovieStatus(statuses, id, listsLib.WATCHLIST_ID, now);
      addedAt = addedAtLib.recordAddedAt(addedAt, id, now);
    }

    for (const [listId, order] of customOrder) {
      for (const id of order) {
        customLists = customListsLib.addMovieToCustomList(customLists, listId, id, now);
      }
    }

    for (const [movieId, movieRows] of byMovie) {
      const { myRating, watchDates } = mergeMovieFields(movieRows);
      if (myRating != null) {
        ratings = ratingsLib.setRating(ratings, movieId, myRating);
      }
      for (const watchedOn of watchDates) {
        viewingHistory = viewingLib.addViewing(viewingHistory, movieId, watchedOn, now);
      }
    }

    const summary = {
      movies: byMovie.size,
      rows: parsedRows.length,
      watched: watchedOrder.length,
      watchlist: watchlistOrder.filter((id) => !listsLib.isWatched(lists, id)).length,
      customRows: [...customOrder.values()].reduce((sum, ids) => sum + ids.length, 0),
      ratings: Object.keys(ratings).length,
      viewings: Object.values(viewingHistory).reduce(
        (sum, entries) => sum + (Array.isArray(entries) ? entries.length : 0),
        0,
      ),
    };

    return {
      state: {
        ...state,
        lists,
        customLists,
        customListTombstones,
        ratings,
        viewingHistory,
        statuses,
        addedAt,
      },
      summary,
    };
  }

  /**
   * Reads the first column of every line as an id. The header, blank lines, and
   * anything hand-edited into an unparseable state are skipped rather than
   * refused: a typo in a comment column should not stop an import.
   */
  function parseListCsv(text) {
    const seen = new Set();
    const ids = [];
    for (const line of String(text || "").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const field = trimmed.split(",")[0].replace(/^"|"$/g, "").trim();
      if (!/^\d+$/.test(field)) {
        continue;
      }
      const id = Number(field);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
    return ids;
  }

  return {
    CSV_FILENAME,
    buildListCsv,
    parseCsv,
  };
})();
