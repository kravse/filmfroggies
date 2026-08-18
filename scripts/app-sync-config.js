/**
 * Declares which scripts/lib modules are mirrored into js/app/00-*.js partials.
 *
 * Each lib module is plain CommonJS so Node tests can require it directly.
 * The sync step strips `module.exports` and re-wraps the body in an IIFE
 * assigned to `globalName`, which later partials read from the shared scope.
 */
const path = require("path");

const LIB = path.join(__dirname, "lib");

const APP_SYNC_ENTRIES = [
  {
    sources: [path.join(LIB, "card-html.js")],
    target: "00-app-card-html.js",
    globalName: "appCardHtml",
    header: "Generated from scripts/lib/card-html.js — run npm run bundle",
    exports: [
      "escapeHtml",
      "formatYear",
      "formatRuntime",
      "formatRating",
      "joinNames",
    ],
  },
  {
    sources: [path.join(LIB, "tmdb.js")],
    target: "00-app-tmdb.js",
    globalName: "appTmdb",
    header: "Generated from scripts/lib/tmdb.js — run npm run bundle",
    exports: [
      "API_BASE",
      "IMAGE_BASE",
      "POSTER_SIZES",
      "isReadAccessToken",
      "looksLikeV3ApiKey",
      "describeCredentialProblem",
      "buildRequestInit",
      "buildSearchUrl",
      "buildMovieUrl",
      "buildConfigurationUrl",
      "isValidImagePath",
      "buildImageUrl",
      "normalizeSearchResults",
      "normalizeMovie",
    ],
  },
  {
    sources: [path.join(LIB, "lists.js")],
    target: "00-app-lists.js",
    globalName: "appLists",
    header: "Generated from scripts/lib/lists.js — run npm run bundle",
    exports: [
      "FAVOURITES_ID",
      "WATCHLIST_ID",
      "WATCHED_ID",
      "PRESET_LISTS",
      "LIST_IDS",
      "DEFAULT_LIST_ID",
      "isListId",
      "normalizeMovieIds",
      "defaultLists",
      "normalizeLists",
      "findList",
      "findListIdsForMovie",
      "primaryListIdForMovie",
      "isFavourited",
      "isWatched",
      "isOnWatchlist",
      "assignMovieToList",
      "removeMovieFromList",
      "toggleFavourite",
      "removeMovie",
      "replaceMovieIds",
    ],
  },
  {
    sources: [path.join(LIB, "user-state.js")],
    target: "00-app-user-state.js",
    globalName: "appUserState",
    header: "Generated from scripts/lib/user-state.js — run npm run bundle",
    exports: [
      "USER_STATE_KEY",
      "GIST_SYNC_KEY",
      "TMDB_AUTH_KEY",
      "USER_STATE_VERSION",
      "defaultUserState",
      "normalizePreferences",
      "normalizeUserState",
      "parseUserState",
      "serializeUserState",
      "touchUserState",
    ],
  },
  {
    sources: [path.join(LIB, "gist-sync.js")],
    target: "00-app-gist-sync.js",
    globalName: "appGistSync",
    header: "Generated from scripts/lib/gist-sync.js — run npm run bundle",
    exports: [
      "GIST_STATE_FILENAME",
      "GITHUB_API",
      "parseGistSyncConfig",
      "serializeGistSyncConfig",
      "isConnectedGistConfig",
      "mergeStateByUpdatedAt",
      "extractStateJsonFromGistResponse",
      "findCollectorGistId",
      "buildGistCreatePayload",
      "buildGistUpdatePayload",
      "resolveGistConnectState",
    ],
  },
  {
    sources: [path.join(LIB, "reorder.js")],
    target: "00-app-reorder.js",
    globalName: "appReorder",
    header: "Generated from scripts/lib/reorder.js — run npm run bundle",
    exports: ["moveMovieId", "rectOverlapArea", "pickOverlapTargetId"],
  },
  {
    sources: [path.join(LIB, "pointer-reorder.js")],
    target: "00-app-pointer-reorder.js",
    globalName: "appPointerReorder",
    header: "Generated from scripts/lib/pointer-reorder.js — run npm run bundle",
    exports: ["floatingRectFor", "collectTargetRects"],
  },
];

module.exports = { APP_SYNC_ENTRIES };
