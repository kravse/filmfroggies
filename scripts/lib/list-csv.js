/**
 * The CSV that carries a list of ids from the browser to the scraper.
 *
 * The browser is the only place that knows the collection, and the scraper runs
 * on a machine that cannot read localStorage or the Gist. Settings exports this
 * file, you commit it, and `npm run scrape` reads it back. Both ends share these
 * functions so the format has exactly one definition.
 *
 * Only `tmdb_id` is load-bearing. The other columns are for reading the
 * committed file in a diff and as a portable backup of list metadata; the scraper
 * ignores them.
 */

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
  const watchDates = getViewingHistory().viewingEntries(state?.viewingHistory, id)
    .map((entry) => entry.watchedOn).sort().join(";");
  return { title, releaseYear, myRating, ...(watchDates ? { watchDates } : {}) };
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

/**
 * Watched first, then watchlist, each in stored order. Then movies that appear
 * only on custom lists, in list order. Removal records live only in `statuses`
 * and never in `movieIds`, so they are excluded for free.
 */
function listCsvRows(state, recordFor) {
  const lists = Array.isArray(state?.lists) ? state.lists : [];
  const customLists = Array.isArray(state?.customLists) ? state.customLists : [];
  const rows = [];
  const seen = new Set();
  for (const listId of getLists().LIST_IDS) {
    const list = lists.find((entry) => entry && entry.id === listId);
    for (const movieId of list?.movieIds || []) {
      const id = Number(movieId);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      rows.push({
        id,
        listId,
        listName: listNameFor(state, listId),
        ...rowMeta(state, id, recordFor),
      });
    }
  }
  for (const list of customLists) {
    if (!list || !getCustomLists().isCustomListId(list.id)) {
      continue;
    }
    for (const movieId of list.movieIds || []) {
      const id = Number(movieId);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      rows.push({
        id,
        listId: list.id,
        listName: list.name,
        ...rowMeta(state, id, recordFor),
      });
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

/**
 * Reads the first column of every line as an id. The header, blank lines, and
 * anything hand-edited into an unparseable state are skipped rather than
 * refused: a typo in a comment column should not stop a scrape.
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

module.exports = {
  CSV_HEADER,
  CSV_FILENAME,
  listCsvRows,
  buildListCsv,
  parseListCsv,
};
