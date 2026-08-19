/**
 * Lib modules mirrored into js/tools/00-*.js for the local Letterboxd tool bundle.
 */
const path = require("path");

const LIB = path.join(__dirname, "lib");

const LETTERBOXD_TOOL_SYNC_ENTRIES = [
  {
    sources: [path.join(LIB, "card-html.js")],
    target: "00-tool-card-html.js",
    globalName: "appCardHtml",
    header: "Generated from scripts/lib/card-html.js — run npm run bundle:letterboxd",
    exports: ["escapeHtml", "formatRatingLabel"],
  },
  {
    sources: [path.join(LIB, "tmdb.js")],
    target: "00-tool-tmdb.js",
    globalName: "appTmdb",
    header: "Generated from scripts/lib/tmdb.js — run npm run bundle:letterboxd",
    exports: [
      "isReadAccessToken",
      "buildRequestInit",
      "buildSearchUrl",
      "normalizeSearchResults",
    ],
  },
  {
    sources: [path.join(LIB, "lists.js")],
    target: "00-tool-lists.js",
    globalName: "appLists",
    header: "Generated from scripts/lib/lists.js — run npm run bundle:letterboxd",
    exports: ["WATCHED_ID", "WATCHLIST_ID", "PRESET_LISTS"],
  },
  {
    sources: [path.join(LIB, "ratings.js")],
    target: "00-tool-ratings.js",
    globalName: "appRatings",
    header: "Generated from scripts/lib/ratings.js — run npm run bundle:letterboxd",
    exports: ["formatUserRating"],
  },
  {
    sources: [path.join(LIB, "list-csv.js")],
    target: "00-tool-list-csv.js",
    globalName: "appListCsv",
    header: "Generated from scripts/lib/list-csv.js — run npm run bundle:letterboxd",
    exports: ["CSV_FILENAME", "buildListCsv", "parseCsv"],
  },
  {
    sources: [path.join(LIB, "letterboxd-import.js")],
    target: "00-tool-letterboxd-import.js",
    globalName: "appLetterboxdImport",
    header: "Generated from scripts/lib/letterboxd-import.js — run npm run bundle:letterboxd",
    exports: [
      "SUPPORTED_FILES",
      "isSupportedPath",
      "parseLetterboxdFiles",
      "pickTmdbMatch",
      "sortedTmdbCandidates",
      "candidateReleaseYear",
      "letterboxdFilmsToImportRows",
    ],
  },
];

module.exports = { LETTERBOXD_TOOL_SYNC_ENTRIES };
