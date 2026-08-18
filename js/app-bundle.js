/* ===== Configuration, DOM references, and mutable state ===== */

(function () {
  "use strict";

/* Opens the shared IIFE scope for every partial. Closed by 08-init.js. */

/* --- DOM --- */

const listSubtitleEl = document.getElementById("list-subtitle");
const listTabs = document.getElementById("list-tabs");
const headerLogo = document.getElementById("header-logo");

const searchInput = document.getElementById("search");
const searchCombobox = document.getElementById("search-combobox");
const searchSuggest = document.getElementById("search-suggest");
const searchClearBtn = document.getElementById("search-clear");
const searchSpinner = document.getElementById("search-spinner");

const addMovieFab = document.getElementById("add-movie-fab");
const addMovieDialog = document.getElementById("add-movie-dialog");
const addMovieClose = document.getElementById("add-movie-close");
const addMovieHint = document.getElementById("add-movie-hint");
const addMovieSearchStep = document.getElementById("add-movie-search-step");
const addMoviePickStep = document.getElementById("add-movie-pick-step");
const addMoviePicked = document.getElementById("add-movie-picked");
const addMovieListPicker = document.getElementById("add-movie-list-picker");
const addMovieSubmit = document.getElementById("add-movie-submit");
const addMovieRatingSlider = document.getElementById("add-movie-rating-slider");
const addMovieRatingValue = document.getElementById("add-movie-rating-value");
const addMovieRatingEnabled = document.getElementById("add-movie-rating-enabled");
const addMovieBack = document.getElementById("add-movie-back");

const viewModeCycleBtn = document.getElementById("view-mode-cycle");
const grid = document.getElementById("grid");
const emptyState = document.getElementById("empty-state");

const settingsBtn = document.getElementById("settings-btn");
const aboutBtn = document.getElementById("about-btn");

const settingsDialog = document.getElementById("settings-dialog");
const settingsClose = document.getElementById("settings-close");
const tmdbKeyInput = document.getElementById("tmdb-key-input");
const tmdbKeySave = document.getElementById("tmdb-key-save");
const tmdbKeyClear = document.getElementById("tmdb-key-clear");
const tmdbKeyStatus = document.getElementById("tmdb-key-status");
const storageModeLocal = document.getElementById("storage-mode-local");
const storageModeGist = document.getElementById("storage-mode-gist");
const gistFields = document.getElementById("gist-fields");
const gistTokenInput = document.getElementById("gist-token-input");
const gistConnectBtn = document.getElementById("gist-connect");
const gistClearBtn = document.getElementById("gist-clear");
const gistStatus = document.getElementById("gist-status");
const cacheClearBtn = document.getElementById("cache-clear");
const cacheStatus = document.getElementById("cache-status");

const aboutDialog = document.getElementById("about-dialog");
const aboutClose = document.getElementById("about-close");

const detailDialog = document.getElementById("movie-detail-dialog");
const detailPrevBtn = document.getElementById("movie-detail-prev");
const detailNextBtn = document.getElementById("movie-detail-next");
const detailEyebrow = document.getElementById("movie-detail-eyebrow");
const detailCloseBtn = document.getElementById("movie-detail-close");
const detailPoster = document.getElementById("movie-detail-poster");
const detailBody = document.getElementById("movie-detail-body");
const detailActions = document.getElementById("movie-detail-actions");

const removeConfirmDialog = document.getElementById("remove-confirm-dialog");
const removeConfirmMessage = document.getElementById("remove-confirm-message");
const removeConfirmCancel = document.getElementById("remove-confirm-cancel");
const removeConfirmOk = document.getElementById("remove-confirm-ok");

const hostedUnlockDialog = document.getElementById("hosted-unlock-dialog");
const hostedUnlockInput = document.getElementById("hosted-unlock-input");
const hostedUnlockStatus = document.getElementById("hosted-unlock-status");
const hostedUnlockCancel = document.getElementById("hosted-unlock-cancel");
const hostedUnlockSubmit = document.getElementById("hosted-unlock-submit");

const hostedLockDialog = document.getElementById("hosted-lock-dialog");
const hostedLockCancel = document.getElementById("hosted-lock-cancel");
const hostedLockOk = document.getElementById("hosted-lock-ok");

/* --- Mutable state --- */

/** Persisted shape from scripts/lib/user-state.js. Loaded in startApp(). */
let userState = null;

/** Hydrated TMDB records by id. Rebuilt from cache or network every load. */
const movieById = new Map();

/** Ids whose hydration failed, so cards can show an error instead of a spinner. */
const movieErrors = new Set();

let gridViewMode = "cards";
let detailMovieId = null;
let detailRatingEditorOpen = false;
let pendingRemoveMovieId = null;
let tmdbCredential = "";

/* --- Small shared helpers --- */

function activeList() {
  if (!userState) {
    return null;
  }
  return appLists.findList(userState.lists, userState.activeListId);
}

function activeMovieIds() {
  return activeList()?.movieIds || [];
}

function setStatus(element, message, tone) {
  if (!element) {
    return;
  }
  element.textContent = message || "";
  element.classList.toggle("is-ok", tone === "ok");
  element.classList.toggle("is-error", tone === "error");
}

/* ===== Card HTML helpers (generated from scripts/lib/card-html.js) ===== */

/* Generated from scripts/lib/card-html.js — run npm run bundle */

const appCardHtml = (function () {
  /** Formatting helpers shared by cards, suggestions, and the detail overlay. */

  const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  function escapeHtml(value) {
    if (value == null) {
      return "";
    }
    return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
  }

  /** TMDB release dates are `YYYY-MM-DD`; anything else yields no year. */
  function formatYear(releaseDate) {
    const match = /^(\d{4})/.exec(String(releaseDate || "").trim());
    return match ? match[1] : "";
  }

  function formatRuntime(minutes) {
    const total = Number(minutes);
    if (!Number.isFinite(total) || total <= 0) {
      return "";
    }
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    if (!hours) {
      return `${rest}m`;
    }
    if (!rest) {
      return `${hours}h`;
    }
    return `${hours}h ${rest}m`;
  }

  function formatRating(voteAverage) {
    const value = Number(voteAverage);
    if (!Number.isFinite(value) || value <= 0) {
      return "";
    }
    return value.toFixed(1);
  }

  function joinNames(names, limit) {
    if (!Array.isArray(names)) {
      return "";
    }
    const cleaned = names
      .map((name) => String(name || "").trim())
      .filter(Boolean);
    const capped =
      typeof limit === "number" && limit > 0 ? cleaned.slice(0, limit) : cleaned;
    return capped.join(", ");
  }

  return {
    escapeHtml,
    formatYear,
    formatRuntime,
    formatRating,
    joinNames,
  };
})();

/* ===== TMDB request and response helpers (generated from scripts/lib/tmdb.js) ===== */

/* Generated from scripts/lib/tmdb.js — run npm run bundle */

const appTmdb = (function () {
  /**
   * TMDB URL building, credential handling, and response normalization.
   *
   * Hosts are constants: only query values are ever user-derived. Image paths
   * from the API are validated before being interpolated into a URL.
   */

  const API_BASE = "https://api.themoviedb.org/3";
  const IMAGE_BASE = "https://image.tmdb.org/t/p";

  const POSTER_SIZES = {
    suggest: "w92",
    card: "w185",
    detailGrid: "w342",
    detail: "w500",
  };

  const ALLOWED_IMAGE_SIZES = new Set([
    "w92",
    "w154",
    "w185",
    "w342",
    "w500",
    "w780",
    "original",
  ]);

  const IMAGE_PATH_PATTERN = /^\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/i;

  const CAST_LIMIT = 8;

  /**
   * Only the v4 API Read Access Token is accepted. It is a JWT: three
   * dot-separated base64url segments whose header begins with `eyJ`. Matching on
   * that structure beats a length threshold — it is exact and self-describing.
   */
  const READ_TOKEN_PATTERN =
    /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

  /** A v3 API key is 32 hex characters, which is worth naming in the error. */
  const V3_API_KEY_PATTERN = /^[0-9a-f]{32}$/i;

  function isReadAccessToken(credential) {
    return READ_TOKEN_PATTERN.test(String(credential || "").trim());
  }

  function looksLikeV3ApiKey(credential) {
    return V3_API_KEY_PATTERN.test(String(credential || "").trim());
  }

  /** Null when the credential is usable, otherwise a message for the user. */
  function describeCredentialProblem(credential) {
    const value = String(credential || "").trim();
    if (!value) {
      return "Paste your TMDB API Read Access Token.";
    }
    if (isReadAccessToken(value)) {
      return null;
    }
    if (looksLikeV3ApiKey(value)) {
      return "That is the v3 API Key. This app needs the API Read Access Token — the much longer value further down the same TMDB API settings page.";
    }
    return 'That does not look like a TMDB API Read Access Token. It should be three dot-separated sections starting with "eyJ".';
  }

  function buildRequestInit(credential, options = {}) {
    const headers = { accept: "application/json" };
    if (isReadAccessToken(credential)) {
      headers.Authorization = `Bearer ${String(credential).trim()}`;
    }
    const init = { headers };
    if (options.signal) {
      init.signal = options.signal;
    }
    return init;
  }

  /** The credential travels in the Authorization header, never in the URL. */
  function buildUrl(pathname, params) {
    const url = new URL(`${API_BASE}${pathname}`);
    for (const [key, value] of Object.entries(params || {})) {
      if (value != null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  function buildSearchUrl(query) {
    return buildUrl("/search/movie", {
      query: String(query || "").trim(),
      include_adult: "false",
      language: "en-US",
      page: "1",
    });
  }

  function buildMovieUrl(movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid movie id: ${movieId}`);
    }
    return buildUrl(`/movie/${id}`, {
      append_to_response: "credits",
      language: "en-US",
    });
  }

  function buildConfigurationUrl() {
    return buildUrl("/configuration", {});
  }

  function isValidImagePath(imagePath) {
    return IMAGE_PATH_PATTERN.test(String(imagePath || ""));
  }

  function buildImageUrl(imagePath, size = POSTER_SIZES.card) {
    if (!isValidImagePath(imagePath) || !ALLOWED_IMAGE_SIZES.has(size)) {
      return null;
    }
    return `${IMAGE_BASE}/${size}${imagePath}`;
  }

  function cleanText(value) {
    const text = String(value == null ? "" : value).trim();
    return text || null;
  }

  function cleanImagePath(value) {
    return isValidImagePath(value) ? String(value) : null;
  }

  function normalizeSearchResults(payload) {
    const results = Array.isArray(payload?.results) ? payload.results : [];
    return results
      .filter((entry) => Number.isInteger(Number(entry?.id)))
      .map((entry) => ({
        id: Number(entry.id),
        title: cleanText(entry.title) || cleanText(entry.original_title) || "Untitled",
        releaseDate: cleanText(entry.release_date),
        posterPath: cleanImagePath(entry.poster_path),
        overview: cleanText(entry.overview),
      }));
  }

  function directorsFromCredits(credits) {
    const crew = Array.isArray(credits?.crew) ? credits.crew : [];
    return crew
      .filter((member) => member?.job === "Director")
      .map((member) => cleanText(member.name))
      .filter(Boolean);
  }

  function castFromCredits(credits) {
    const cast = Array.isArray(credits?.cast) ? credits.cast : [];
    return cast
      .slice(0, CAST_LIMIT)
      .map((member) => cleanText(member.name))
      .filter(Boolean);
  }

  function normalizeMovie(payload) {
    const id = Number(payload?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }
    const runtime = Number(payload.runtime);
    const voteAverage = Number(payload.vote_average);
    return {
      id,
      title: cleanText(payload.title) || cleanText(payload.original_title) || "Untitled",
      releaseDate: cleanText(payload.release_date),
      overview: cleanText(payload.overview),
      tagline: cleanText(payload.tagline),
      posterPath: cleanImagePath(payload.poster_path),
      backdropPath: cleanImagePath(payload.backdrop_path),
      runtime: Number.isFinite(runtime) && runtime > 0 ? runtime : null,
      voteAverage: Number.isFinite(voteAverage) && voteAverage > 0 ? voteAverage : null,
      genres: Array.isArray(payload.genres)
        ? payload.genres.map((genre) => cleanText(genre?.name)).filter(Boolean)
        : [],
      directors: directorsFromCredits(payload.credits),
      cast: castFromCredits(payload.credits),
    };
  }

  return {
    API_BASE,
    IMAGE_BASE,
    POSTER_SIZES,
    isReadAccessToken,
    looksLikeV3ApiKey,
    describeCredentialProblem,
    buildRequestInit,
    buildSearchUrl,
    buildMovieUrl,
    buildConfigurationUrl,
    isValidImagePath,
    buildImageUrl,
    normalizeSearchResults,
    normalizeMovie,
  };
})();

/* ===== Poster cache helpers (generated from scripts/lib/poster-cache.js) ===== */

/* Generated from scripts/lib/poster-cache.js — run npm run bundle */

const appPosterCache = (function () {
  /**
   * Poster URL validation for the browser Cache API layer.
   *
   * Only https://image.tmdb.org paths built by buildImageUrl are cacheable.
   */

  const POSTER_CACHE_NAME = "moviecollector-posters-v1";
  const POSTER_HOST = "image.tmdb.org";

  function isPosterUrl(url) {
    if (!url || typeof url !== "string") {
      return false;
    }
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === POSTER_HOST;
    } catch (_) {
      return false;
    }
  }

  return {
    POSTER_CACHE_NAME,
    POSTER_HOST,
    isPosterUrl,
  };
})();

/* ===== List operations (generated from scripts/lib/lists.js) ===== */

/* Generated from scripts/lib/lists.js — run npm run bundle */

const appLists = (function () {
  /**
   * Three fixed lists, in tab order. There is deliberately no way to create,
   * rename, or delete one: these are statuses, not user-defined collections.
   *
   * Two invariants define how they relate, and both are enforced on read as well
   * as on write, so no stored or synced payload can violate them:
   *
   *   1. Favourites is a subset of Watched. You cannot favourite something you
   *      have not watched, so favouriting also marks it watched.
   *   2. Watchlist is disjoint from both others. It means "not seen yet", which
   *      is incompatible with having watched or favourited it.
   *
   * Together those collapse to three reachable states per movie: on the
   * watchlist, watched, or watched and favourited.
   *
   * `movieIds` carries membership and order in one array. Every function is pure
   * and returns new arrays.
   */

  const FAVOURITES_ID = "favourites";
  const WATCHLIST_ID = "watchlist";
  const WATCHED_ID = "watched";

  const PRESET_LISTS = [
    { id: FAVOURITES_ID, name: "Favourites" },
    { id: WATCHLIST_ID, name: "Watchlist" },
    { id: WATCHED_ID, name: "Watched" },
  ];

  const LIST_IDS = PRESET_LISTS.map((preset) => preset.id);
  const DEFAULT_LIST_ID = FAVOURITES_ID;

  function isListId(listId) {
    return LIST_IDS.includes(listId);
  }

  function normalizeMovieIds(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = new Set();
    const ids = [];
    for (const entry of raw) {
      const id = Number(entry);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
    return ids;
  }

  function defaultLists() {
    return PRESET_LISTS.map((preset) => ({ ...preset, movieIds: [] }));
  }

  /**
   * Rebuilds the three lists from stored data: preset order and names always
   * win, unknown list ids are dropped, and both invariants are repaired.
   *
   * Where stored data contradicts itself, the repair keeps the stronger claim.
   * Having watched something is a fact, so a movie in both Watchlist and
   * Watched stays watched and leaves the watchlist.
   */
  function normalizeLists(raw) {
    const stored = Array.isArray(raw) ? raw : [];
    const storedIds = (listId) => {
      const match = stored.find((entry) => entry && entry.id === listId);
      return normalizeMovieIds(match?.movieIds);
    };

    const favourites = storedIds(FAVOURITES_ID);
    const watchedStored = storedIds(WATCHED_ID);

    // Invariant 1: anything favourited counts as watched.
    const watched = [...watchedStored];
    for (const id of favourites) {
      if (!watched.includes(id)) {
        watched.push(id);
      }
    }

    // Invariant 2: the watchlist cannot hold anything already seen.
    const seen = new Set(watched);
    const watchlist = storedIds(WATCHLIST_ID).filter((id) => !seen.has(id));

    const byId = {
      [FAVOURITES_ID]: favourites,
      [WATCHLIST_ID]: watchlist,
      [WATCHED_ID]: watched,
    };
    return PRESET_LISTS.map((preset) => ({ ...preset, movieIds: byId[preset.id] }));
  }

  function findList(lists, listId) {
    if (!Array.isArray(lists)) {
      return null;
    }
    return lists.find((list) => list.id === listId) || null;
  }

  function findListIdsForMovie(lists, movieId) {
    const id = Number(movieId);
    if (!Array.isArray(lists) || !Number.isInteger(id)) {
      return [];
    }
    return lists.filter((list) => list.movieIds.includes(id)).map((list) => list.id);
  }

  /**
   * The most specific status for a movie, for a single-value badge or picker.
   * Preset order does the work: favourited outranks merely watched, and a
   * watchlisted movie is in no other list.
   */
  function primaryListIdForMovie(lists, movieId) {
    return findListIdsForMovie(lists, movieId)[0] || null;
  }

  function applyMembership(lists, movieId, addTo, removeFrom) {
    let changed = false;
    const next = lists.map((list) => {
      const has = list.movieIds.includes(movieId);
      if (addTo.includes(list.id) && !has) {
        changed = true;
        return { ...list, movieIds: [...list.movieIds, movieId] };
      }
      if (removeFrom.includes(list.id) && has) {
        changed = true;
        return {
          ...list,
          movieIds: list.movieIds.filter((entry) => entry !== movieId),
        };
      }
      return list;
    });
    return changed ? next : lists;
  }

  /**
   * Sets a movie's status. Each target implies the memberships needed to keep
   * both invariants true, so callers never have to reason about the others.
   */
  function assignMovieToList(lists, listId, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0 || !isListId(listId)) {
      return lists;
    }

    if (listId === FAVOURITES_ID) {
      return applyMembership(lists, id, [FAVOURITES_ID, WATCHED_ID], [WATCHLIST_ID]);
    }
    if (listId === WATCHED_ID) {
      // Favourites is left alone: marking a favourite watched changes nothing.
      return applyMembership(lists, id, [WATCHED_ID], [WATCHLIST_ID]);
    }
    return applyMembership(lists, id, [WATCHLIST_ID], [FAVOURITES_ID, WATCHED_ID]);
  }

  /**
   * Removes a movie from one list. Un-favouriting leaves it watched, but
   * un-watching also drops the favourite, since a favourite must be watched.
   */
  function removeMovieFromList(lists, listId, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || !isListId(listId)) {
      return lists;
    }
    const removeFrom =
      listId === WATCHED_ID ? [WATCHED_ID, FAVOURITES_ID] : [listId];
    return applyMembership(lists, id, [], removeFrom);
  }

  function isFavourited(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return false;
    }
    return findList(lists, FAVOURITES_ID)?.movieIds.includes(id) ?? false;
  }

  function isWatched(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return false;
    }
    return findList(lists, WATCHED_ID)?.movieIds.includes(id) ?? false;
  }

  function isOnWatchlist(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return false;
    }
    return findList(lists, WATCHLIST_ID)?.movieIds.includes(id) ?? false;
  }

  /** Toggles favourite for a watched movie; no-op on the watchlist. */
  function toggleFavourite(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0 || !isWatched(lists, id)) {
      return lists;
    }
    if (isFavourited(lists, id)) {
      return removeMovieFromList(lists, FAVOURITES_ID, id);
    }
    return assignMovieToList(lists, FAVOURITES_ID, id);
  }

  /** Drops a movie from every list. */
  function removeMovie(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return lists;
    }
    return applyMembership(lists, id, [], LIST_IDS);
  }

  /** Used by drag reorder to commit a new order for one list. */
  function replaceMovieIds(lists, listId, movieIds) {
    const target = findList(lists, listId);
    if (!target || movieIds === target.movieIds) {
      return lists;
    }
    return lists.map((list) =>
      list.id === listId ? { ...list, movieIds: [...movieIds] } : list,
    );
  }

  return {
    FAVOURITES_ID,
    WATCHLIST_ID,
    WATCHED_ID,
    PRESET_LISTS,
    LIST_IDS,
    DEFAULT_LIST_ID,
    isListId,
    normalizeMovieIds,
    defaultLists,
    normalizeLists,
    findList,
    findListIdsForMovie,
    primaryListIdForMovie,
    isFavourited,
    isWatched,
    isOnWatchlist,
    assignMovieToList,
    removeMovieFromList,
    toggleFavourite,
    removeMovie,
    replaceMovieIds,
  };
})();

/* ===== User movie ratings (generated from scripts/lib/ratings.js) ===== */

/* Generated from scripts/lib/ratings.js — run npm run bundle */

const appRatings = (function () {
  /**
   * User-assigned movie ratings (1–10, one decimal). Stored beside list ids in
   * user state, never in TMDB records.
   */

  const MIN_RATING = 1;
  const MAX_RATING = 10;
  const SLIDER_MIN = 0;
  const SLIDER_MAX = 90;
  const DEFAULT_SLIDER_VALUE = 60; // 7.0

  function normalizeRating(value) {
    if (value == null || value === "") {
      return null;
    }
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return null;
    }
    const clamped = Math.min(MAX_RATING, Math.max(MIN_RATING, num));
    return Math.round(clamped * 10) / 10;
  }

  function formatUserRating(value) {
    const normalized = normalizeRating(value);
    if (normalized == null) {
      return "";
    }
    if (Number.isInteger(normalized)) {
      return String(normalized);
    }
    return normalized.toFixed(1);
  }

  function ratingFromSliderValue(sliderValue) {
    const step = Number(sliderValue);
    if (!Number.isInteger(step)) {
      return null;
    }
    return normalizeRating(MIN_RATING + step / 10);
  }

  function sliderValueFromRating(rating) {
    const normalized = normalizeRating(rating);
    if (normalized == null) {
      return DEFAULT_SLIDER_VALUE;
    }
    return Math.round((normalized - MIN_RATING) * 10);
  }

  function collectMovieIds(lists) {
    const ids = new Set();
    if (!Array.isArray(lists)) {
      return ids;
    }
    for (const list of lists) {
      if (!list || !Array.isArray(list.movieIds)) {
        continue;
      }
      for (const id of list.movieIds) {
        const movieId = Number(id);
        if (Number.isInteger(movieId) && movieId > 0) {
          ids.add(movieId);
        }
      }
    }
    return ids;
  }

  function normalizeRatings(raw, lists) {
    const allowed = collectMovieIds(lists);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {};
    }

    const next = {};
    for (const [key, value] of Object.entries(raw)) {
      const movieId = Number(key);
      const rating = normalizeRating(value);
      if (!Number.isInteger(movieId) || movieId <= 0 || rating == null) {
        continue;
      }
      if (!allowed.has(movieId)) {
        continue;
      }
      next[String(movieId)] = rating;
    }
    return next;
  }

  function getRating(ratings, movieId) {
    const id = Number(movieId);
    if (!ratings || typeof ratings !== "object" || !Number.isInteger(id) || id <= 0) {
      return null;
    }
    return normalizeRating(ratings[String(id)]);
  }

  function setRating(ratings, movieId, rating) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return ratings || {};
    }

    const base = ratings && typeof ratings === "object" && !Array.isArray(ratings)
      ? ratings
      : {};
    const key = String(id);
    const normalized = rating == null ? null : normalizeRating(rating);
    const current = getRating(base, id);

    if (normalized === current) {
      return base;
    }

    if (normalized == null) {
      if (!(key in base)) {
        return base;
      }
      const next = { ...base };
      delete next[key];
      return next;
    }

    return { ...base, [key]: normalized };
  }

  function removeRating(ratings, movieId) {
    return setRating(ratings, movieId, null);
  }

  return {
    MIN_RATING,
    MAX_RATING,
    SLIDER_MIN,
    SLIDER_MAX,
    DEFAULT_SLIDER_VALUE,
    normalizeRating,
    formatUserRating,
    ratingFromSliderValue,
    sliderValueFromRating,
    normalizeRatings,
    getRating,
    setRating,
    removeRating,
  };
})();

/* ===== User state persistence (generated from scripts/lib/user-state.js) ===== */

/* Generated from scripts/lib/user-state.js — run npm run bundle */

const appUserState = (function () {
  /**
   * The only thing this app persists: lists of TMDB ids in display order, which
   * list is active, and the view preference. Movie records are never stored.
   *
   * The TMDB credential and the Gist token live under their own keys and are
   * deliberately absent from this payload so they are never synced to a Gist.
   */

  const USER_STATE_KEY = "moviecollector-user-state";
  const GIST_SYNC_KEY = "moviecollector-gist-sync";
  const TMDB_AUTH_KEY = "moviecollector-tmdb-auth";
  const HOSTED_SESSION_KEY = "moviecollector-hosted-session";
  const USER_STATE_VERSION = 1;

  const VIEW_MODES = new Set(["cards", "detail", "list"]);
  const STORAGE_MODES = new Set(["local", "gist"]);

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
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

  function defaultPreferences() {
    return { viewMode: "cards" };
  }

  function defaultUserState() {
    const lists = getLists();
    return {
      version: USER_STATE_VERSION,
      updatedAt: null,
      storageMode: "local",
      lists: lists.defaultLists(),
      activeListId: lists.DEFAULT_LIST_ID,
      preferences: defaultPreferences(),
      ratings: {},
    };
  }

  function normalizePreferences(raw) {
    const base = defaultPreferences();
    if (!raw || typeof raw !== "object") {
      return base;
    }
    return {
      viewMode: VIEW_MODES.has(raw.viewMode) ? raw.viewMode : base.viewMode,
    };
  }

  function normalizeUserState(raw) {
    const lists = getLists();
    const base = defaultUserState();
    if (!raw || typeof raw !== "object") {
      return base;
    }

    const normalizedLists = lists.normalizeLists(raw.lists);

    return {
      version: USER_STATE_VERSION,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
      storageMode: STORAGE_MODES.has(raw.storageMode) ? raw.storageMode : "local",
      lists: normalizedLists,
      activeListId: lists.isListId(raw.activeListId)
        ? raw.activeListId
        : lists.DEFAULT_LIST_ID,
      preferences: normalizePreferences(raw.preferences),
      ratings: getRatings().normalizeRatings(raw.ratings, normalizedLists),
    };
  }

  function parseUserState(json) {
    if (json == null || json === "") {
      return null;
    }
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return normalizeUserState(parsed);
    } catch (_) {
      return null;
    }
  }

  function serializeUserState(state) {
    return JSON.stringify(normalizeUserState(state));
  }

  function touchUserState(state, now = new Date()) {
    return { ...state, updatedAt: now.toISOString() };
  }

  return {
    USER_STATE_KEY,
    GIST_SYNC_KEY,
    TMDB_AUTH_KEY,
    HOSTED_SESSION_KEY,
    USER_STATE_VERSION,
    defaultUserState,
    normalizePreferences,
    normalizeUserState,
    parseUserState,
    serializeUserState,
    touchUserState,
  };
})();

/* ===== GitHub Gist sync helpers (generated from scripts/lib/gist-sync.js) ===== */

/* Generated from scripts/lib/gist-sync.js — run npm run bundle */

const appGistSync = (function () {
  /**
   * GitHub Gist sync helpers, ported from arkham's viewer-gist-sync.
   *
   * Only the user state is written to the Gist. The Gist token and the TMDB
   * credential are stored under separate localStorage keys and never appear in
   * the payload.
   */

  const GIST_STATE_FILENAME = "moviecollector-state.json";
  const GITHUB_API = "https://api.github.com";
  const GIST_DESCRIPTION = "Movie collector sync";

  function parseGistSyncConfig(json) {
    if (json == null || json === "") {
      return null;
    }
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      const token = typeof parsed.token === "string" ? parsed.token.trim() : "";
      const gistId = typeof parsed.gistId === "string" ? parsed.gistId.trim() : "";
      if (!token) {
        return null;
      }
      return { token, gistId };
    } catch (_) {
      return null;
    }
  }

  function serializeGistSyncConfig(config) {
    return JSON.stringify({
      token: config.token,
      gistId: config.gistId || "",
    });
  }

  function isConnectedGistConfig(config) {
    return Boolean(config?.token && config?.gistId);
  }

  /** Last write wins, decided by the `updatedAt` stamp each device sets. */
  function mergeStateByUpdatedAt(localState, remoteState) {
    if (!remoteState) {
      return localState;
    }
    if (!localState) {
      return remoteState;
    }
    const localTime = Date.parse(localState.updatedAt || "");
    const remoteTime = Date.parse(remoteState.updatedAt || "");
    if (!Number.isFinite(localTime) && Number.isFinite(remoteTime)) {
      return remoteState;
    }
    if (Number.isFinite(localTime) && !Number.isFinite(remoteTime)) {
      return localState;
    }
    if (remoteTime > localTime) {
      return remoteState;
    }
    return localState;
  }

  function extractStateJsonFromGistResponse(body) {
    if (!body || typeof body !== "object") {
      return null;
    }
    const file = body.files?.[GIST_STATE_FILENAME];
    if (!file || typeof file.content !== "string") {
      return null;
    }
    return file.content;
  }

  function findCollectorGistId(gists, stateFilename = GIST_STATE_FILENAME) {
    if (!Array.isArray(gists)) {
      return null;
    }
    const match = gists.find((gist) => gist?.files && gist.files[stateFilename]);
    return match?.id || null;
  }

  function buildGistCreatePayload(stateJson) {
    return {
      description: GIST_DESCRIPTION,
      public: false,
      files: { [GIST_STATE_FILENAME]: { content: stateJson } },
    };
  }

  function buildGistUpdatePayload(stateJson) {
    return {
      files: { [GIST_STATE_FILENAME]: { content: stateJson } },
    };
  }

  /**
   * Connecting adopts an existing Gist rather than overwriting it, so pointing a
   * second device at the same account picks up the lists already there.
   */
  function resolveGistConnectState({ gistId, remoteState, localState }) {
    if (gistId) {
      if (!remoteState) {
        return {
          ok: false,
          error:
            "Found an existing sync Gist but could not read moviecollector-state.json. Your Gist was not changed.",
        };
      }
      return { ok: true, action: "adopt", gistId, nextState: remoteState };
    }

    return { ok: true, action: "create", gistId: "", nextState: localState };
  }

  return {
    GIST_STATE_FILENAME,
    GITHUB_API,
    parseGistSyncConfig,
    serializeGistSyncConfig,
    isConnectedGistConfig,
    mergeStateByUpdatedAt,
    extractStateJsonFromGistResponse,
    findCollectorGistId,
    buildGistCreatePayload,
    buildGistUpdatePayload,
    resolveGistConnectState,
  };
})();

/* ===== Reorder and overlap math (generated from scripts/lib/reorder.js) ===== */

/* Generated from scripts/lib/reorder.js — run npm run bundle */

const appReorder = (function () {
  /**
   * Reorder math, ported from arkham's want-list drag engine.
   *
   * Targets are picked by rect intersection area rather than row hit testing,
   * which is what lets the same code drive a vertical list and a 2D card grid.
   */

  function moveMovieId(movieIds, dragId, targetId) {
    const from = movieIds.indexOf(dragId);
    const to = movieIds.indexOf(targetId);
    if (from < 0 || to < 0 || from === to) {
      return movieIds;
    }

    const next = [...movieIds];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    return next;
  }

  function normalizeRect(rect) {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right != null ? rect.right : rect.left + rect.width,
      bottom: rect.bottom != null ? rect.bottom : rect.top + rect.height,
    };
  }

  function rectOverlapArea(a, b) {
    const ra = normalizeRect(a);
    const rb = normalizeRect(b);
    const width = Math.max(0, Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left));
    const height = Math.max(0, Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top));
    return width * height;
  }

  /**
   * Pick the item the floating element overlaps most. `itemRects` includes the
   * dragged item's own slot, so "still mostly over my own slot" resolves to the
   * drag id and returns null. Returns null when there is no overlap at all.
   */
  function pickOverlapTargetId(floatingRect, itemRects, dragId) {
    const drag = Number(dragId);
    let bestId = null;
    let bestArea = 0;
    for (const item of itemRects) {
      const area = rectOverlapArea(floatingRect, item.rect);
      if (area > bestArea) {
        bestArea = area;
        bestId = Number(item.id);
      }
    }
    if (bestArea <= 0) {
      return null;
    }
    return bestId === drag ? null : bestId;
  }

  return {
    moveMovieId,
    rectOverlapArea,
    pickOverlapTargetId,
  };
})();

/* ===== Pointer drag helpers (generated from scripts/lib/pointer-reorder.js) ===== */

/* Generated from scripts/lib/pointer-reorder.js — run npm run bundle */

const appPointerReorder = (function () {
  /**
   * Pointer drag geometry. Kept free of DOM lookups so it can be tested in Node:
   * callers pass elements plus the accessors used to read ids and rects.
   */

  /** Where the lifted clone sits right now, given the grab offset. */
  function floatingRectFor(drag, clientX, clientY) {
    const left = clientX - drag.offsetX;
    const top = clientY - drag.offsetY;
    return {
      left,
      top,
      width: drag.width,
      height: drag.height,
      right: left + drag.width,
      bottom: top + drag.height,
    };
  }

  function collectTargetRects(elements, getId, getRect) {
    const items = Array.isArray(elements) ? elements : [...(elements || [])];
    return items
      .map((el) => ({ id: Number(getId(el)), el, rect: getRect(el) }))
      .filter((item) => Number.isInteger(item.id) && item.rect);
  }

  return {
    floatingRectFor,
    collectTargetRects,
  };
})();

/* ===== User state runtime, localStorage, and Gist storage mode ===== */

/**
 * User state runtime: localStorage persistence plus optional GitHub Gist sync.
 *
 * Only the list payload is ever synced. The Gist token and TMDB credential
 * live under their own keys and are never part of the serialized state.
 */

const GIST_TIMEOUT_MS = 15000;

let gistConfig = null;

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_) {
    /* Quota or private browsing; state still works for this session. */
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {
    /* Ignored for the same reason as writeStorage. */
  }
}

function loadUserState() {
  const stored = readStorage(appUserState.USER_STATE_KEY);
  const parsed = appUserState.parseUserState(stored);
  userState = parsed || appUserState.defaultUserState();
  gridViewMode = userState.preferences.viewMode;

  // Normalizing on read leaves stale shapes on disk — a payload written before
  // the lists became fixed, say. Write the cleaned version back so storage
  // matches the model, without touching updatedAt: bumping it here would make
  // merely opening the app look like an edit to Gist sync.
  const normalized = appUserState.serializeUserState(userState);
  if (stored !== normalized) {
    writeStorage(appUserState.USER_STATE_KEY, normalized);
  }
  return userState;
}

function writeUserStateToStorage() {
  writeStorage(
    appUserState.USER_STATE_KEY,
    appUserState.serializeUserState(userState),
  );
}

function persistUserState(options = {}) {
  userState = appUserState.touchUserState(userState);
  writeUserStateToStorage();
  if (
    options.sync !== false &&
    userState.storageMode === "gist" &&
    appGistSync.isConnectedGistConfig(gistConfig)
  ) {
    pushStateToGist().catch(() => {
      setStatus(gistStatus, "Could not save to GitHub. Changes are on this device.", "error");
    });
  }
}

function updateRatings(nextRatings) {
  if (nextRatings === userState.ratings) {
    return false;
  }
  userState = { ...userState, ratings: nextRatings };
  return true;
}

function setMovieRating(movieId, rating) {
  const nextRatings = appRatings.setRating(userState.ratings, movieId, rating);
  if (!updateRatings(nextRatings)) {
    return false;
  }
  persistUserState();
  return true;
}

function updateLists(nextLists) {
  if (nextLists === userState.lists) {
    return false;
  }
  userState = { ...userState, lists: nextLists };
  return true;
}

const VIEW_MODE_CYCLE = ["cards", "detail", "list"];

const VIEW_MODE_LABELS = {
  cards: "Card view",
  detail: "Detail view",
  list: "List view",
};

function nextViewMode(mode) {
  const index = VIEW_MODE_CYCLE.indexOf(mode);
  const next = index < 0 ? 0 : (index + 1) % VIEW_MODE_CYCLE.length;
  return VIEW_MODE_CYCLE[next];
}

function syncViewModeButton() {
  if (!viewModeCycleBtn) {
    return;
  }
  viewModeCycleBtn.dataset.viewMode = gridViewMode;
  viewModeCycleBtn.setAttribute("aria-label", VIEW_MODE_LABELS[gridViewMode]);
}

function setViewMode(mode) {
  gridViewMode = appUserState.normalizePreferences({ viewMode: mode }).viewMode;
  userState = {
    ...userState,
    preferences: { ...userState.preferences, viewMode: gridViewMode },
  };
  document.body.classList.toggle("view-mode-cards", gridViewMode === "cards");
  document.body.classList.toggle("view-mode-detail", gridViewMode === "detail");
  document.body.classList.toggle("view-mode-list", gridViewMode === "list");
  syncViewModeButton();
}

/* --- Gist sync --- */

function loadGistConfig() {
  gistConfig = appGistSync.parseGistSyncConfig(
    readStorage(appUserState.GIST_SYNC_KEY),
  );
  return gistConfig;
}

function saveGistConfig(config) {
  gistConfig = config;
  if (config) {
    writeStorage(
      appUserState.GIST_SYNC_KEY,
      appGistSync.serializeGistSyncConfig(config),
    );
  } else {
    removeStorage(appUserState.GIST_SYNC_KEY);
  }
}

async function gistRequest(pathname, options = {}) {
  const { method = "GET", token, body } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GIST_TIMEOUT_MS);
  try {
    const headers = {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
    };
    if (body) {
      headers["content-type"] = "application/json";
    }
    const response = await fetch(`${appGistSync.GITHUB_API}${pathname}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`GitHub request failed (${response.status})`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function remoteStateFromGistBody(body) {
  const json = appGistSync.extractStateJsonFromGistResponse(body);
  return json ? appUserState.parseUserState(json) : null;
}

async function pushStateToGist() {
  if (!appGistSync.isConnectedGistConfig(gistConfig)) {
    return;
  }
  await gistRequest(`/gists/${gistConfig.gistId}`, {
    method: "PATCH",
    token: gistConfig.token,
    body: appGistSync.buildGistUpdatePayload(
      appUserState.serializeUserState(userState),
    ),
  });
}

/** Adopts the remote payload when it is newer than what this device holds. */
async function pullStateFromGist() {
  if (!appGistSync.isConnectedGistConfig(gistConfig)) {
    return false;
  }
  const body = await gistRequest(`/gists/${gistConfig.gistId}`, {
    token: gistConfig.token,
  });
  const remoteState = remoteStateFromGistBody(body);
  const merged = appGistSync.mergeStateByUpdatedAt(userState, remoteState);
  if (merged === userState) {
    return false;
  }
  userState = { ...merged, storageMode: "gist" };
  gridViewMode = userState.preferences.viewMode;
  writeUserStateToStorage();
  return true;
}

/**
 * Connecting looks for an existing sync Gist on the account and adopts it, so
 * a second device picks up lists already there instead of overwriting them.
 */
async function connectGist(token) {
  const trimmed = String(token || "").trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a GitHub token first." };
  }

  try {
    const gists = await gistRequest("/gists", { token: trimmed });
    const gistId = appGistSync.findCollectorGistId(gists);
    let remoteState = null;

    if (gistId) {
      const body = await gistRequest(`/gists/${gistId}`, { token: trimmed });
      remoteState = remoteStateFromGistBody(body);
    }

    const resolved = appGistSync.resolveGistConnectState({
      gistId,
      remoteState,
      localState: userState,
    });
    if (!resolved.ok) {
      return resolved;
    }

    let nextGistId = resolved.gistId;
    if (resolved.action === "create") {
      const created = await gistRequest("/gists", {
        method: "POST",
        token: trimmed,
        body: appGistSync.buildGistCreatePayload(
          appUserState.serializeUserState(userState),
        ),
      });
      nextGistId = created?.id || "";
      if (!nextGistId) {
        return { ok: false, error: "GitHub did not return a Gist id." };
      }
    }

    saveGistConfig({ token: trimmed, gistId: nextGistId });
    userState = { ...resolved.nextState, storageMode: "gist" };
    gridViewMode = userState.preferences.viewMode;
    writeUserStateToStorage();
    return { ok: true, action: resolved.action };
  } catch (error) {
    return { ok: false, error: `Could not reach GitHub. ${error.message}` };
  }
}

function disconnectGist() {
  saveGistConfig(null);
  userState = { ...userState, storageMode: "local" };
  writeUserStateToStorage();
}

/* ===== TMDB client: credential, Cache API wrapper, hydration pool ===== */

/**
 * TMDB access with a stale-while-revalidate Cache API layer.
 *
 * Movie detail responses are cached under a synthetic key that omits the
 * credential, so the cache survives a credential change and never stores the
 * secret itself. Search is transient and only memoized for the session.
 *
 * On Netlify, an optional hosted session routes API calls through /api/tmdb so
 * the read token stays server-side. Personal tokens in Settings still work.
 */

const TMDB_CACHE_NAME = "moviecollector-tmdb-v1";
const CACHE_KEY_ORIGIN = "https://moviecollector.invalid/tmdb";
const REQUEST_TIMEOUT_MS = 12000;
const HYDRATE_CONCURRENCY = 6;

const searchMemo = new Map();

let cachePromise;
let posterCachePromise;
/** Session map from remote poster URL to blob: object URL. */
const posterBlobUrls = new Map();
let hostedSessionToken = "";

/* --- Credential --- */

function loadCredential() {
  try {
    tmdbCredential = localStorage.getItem(appUserState.TMDB_AUTH_KEY) || "";
  } catch (_) {
    tmdbCredential = "";
  }
  return tmdbCredential;
}

function saveCredential(value) {
  tmdbCredential = String(value || "").trim();
  try {
    if (tmdbCredential) {
      localStorage.setItem(appUserState.TMDB_AUTH_KEY, tmdbCredential);
    } else {
      localStorage.removeItem(appUserState.TMDB_AUTH_KEY);
    }
  } catch (_) {
    /* Private browsing can refuse writes; the in-memory value still works. */
  }
  return tmdbCredential;
}

function hasCredential() {
  return appTmdb.isReadAccessToken(tmdbCredential);
}

/* --- Hosted session (Netlify proxy) --- */

function loadHostedSession() {
  try {
    hostedSessionToken = localStorage.getItem(appUserState.HOSTED_SESSION_KEY) || "";
  } catch (_) {
    hostedSessionToken = "";
  }
  return hostedSessionToken;
}

function saveHostedSession(token) {
  hostedSessionToken = String(token || "").trim();
  try {
    if (hostedSessionToken) {
      localStorage.setItem(appUserState.HOSTED_SESSION_KEY, hostedSessionToken);
    } else {
      localStorage.removeItem(appUserState.HOSTED_SESSION_KEY);
    }
  } catch (_) {
    /* Same private-browsing caveat as the TMDB credential. */
  }
  return hostedSessionToken;
}

function clearHostedSession() {
  return saveHostedSession("");
}

function hasHostedAccess() {
  return Boolean(hostedSessionToken);
}

function hasTmdbAccess() {
  return hasHostedAccess() || hasCredential();
}

function tmdbUrlToProxyRequest(url) {
  const parsed = new URL(String(url));
  const match = /^\/3(\/.+)$/.exec(parsed.pathname);
  const path = match ? match[1] : parsed.pathname;
  const searchParams = {};
  for (const key of ["query", "language", "page", "include_adult", "append_to_response"]) {
    const value = parsed.searchParams.get(key);
    if (value != null && value !== "") {
      searchParams[key] = value;
    }
  }
  return { path, searchParams };
}

function buildProxyUrl(path, searchParams) {
  const url = new URL("/api/tmdb", window.location.origin);
  url.searchParams.set("path", path);
  for (const [key, value] of Object.entries(searchParams || {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function unlockHostedAccess(password) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ password: String(password || "") }),
  });
  if (response.status === 503) {
    throw new Error("Hosted access is not available on this host.");
  }
  if (!response.ok) {
    throw new Error("Incorrect password.");
  }
  const body = await response.json();
  if (!body?.token) {
    throw new Error("Hosted access did not return a session.");
  }
  saveHostedSession(body.token);
  await verifyCredential();
}

function lockHostedAccess() {
  clearHostedSession();
}

/* --- Cache --- */

/** The Cache API is unavailable on file:// and in some privacy modes. */
function openTmdbCache() {
  if (cachePromise === undefined) {
    cachePromise =
      typeof caches === "undefined"
        ? Promise.resolve(null)
        : caches.open(TMDB_CACHE_NAME).catch(() => null);
  }
  return cachePromise;
}

function movieCacheKey(movieId) {
  return `${CACHE_KEY_ORIGIN}/movie/${movieId}`;
}

async function clearMovieCache() {
  searchMemo.clear();
  revokePosterBlobUrls();
  if (typeof caches === "undefined") {
    return false;
  }
  cachePromise = undefined;
  posterCachePromise = undefined;
  try {
    const results = await Promise.all([
      caches.delete(TMDB_CACHE_NAME),
      caches.delete(appPosterCache.POSTER_CACHE_NAME),
    ]);
    return results.some(Boolean);
  } catch (_) {
    return false;
  }
}

/* --- Poster cache --- */

function openPosterCache() {
  if (posterCachePromise === undefined) {
    posterCachePromise =
      typeof caches === "undefined"
        ? Promise.resolve(null)
        : caches.open(appPosterCache.POSTER_CACHE_NAME).catch(() => null);
  }
  return posterCachePromise;
}

function revokePosterBlobUrls() {
  for (const objectUrl of posterBlobUrls.values()) {
    URL.revokeObjectURL(objectUrl);
  }
  posterBlobUrls.clear();
}

async function fetchPoster(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Poster request failed (${response.status})`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function revalidatePoster(url, cache) {
  try {
    const response = await fetchPoster(url);
    const blob = await response.blob();
    if (cache) {
      await cache.put(
        url,
        new Response(blob, {
          headers: { "content-type": blob.type || "image/jpeg" },
        }),
      );
    }
    const existing = posterBlobUrls.get(url);
    if (existing) {
      URL.revokeObjectURL(existing);
    }
    posterBlobUrls.set(url, URL.createObjectURL(blob));
  } catch (_) {
    /* Cached poster stays on screen. */
  }
}

async function getPosterObjectUrl(url) {
  if (!appPosterCache.isPosterUrl(url)) {
    return url;
  }
  const cachedObjectUrl = posterBlobUrls.get(url);
  if (cachedObjectUrl) {
    return cachedObjectUrl;
  }

  const cache = await openPosterCache();
  if (cache) {
    const cached = await cache.match(url);
    if (cached) {
      const blob = await cached.blob();
      const objectUrl = URL.createObjectURL(blob);
      posterBlobUrls.set(url, objectUrl);
      revalidatePoster(url, cache);
      return objectUrl;
    }
  }

  const response = await fetchPoster(url);
  const blob = await response.blob();
  if (cache) {
    await cache.put(
      url,
      new Response(blob, {
        headers: { "content-type": blob.type || "image/jpeg" },
      }),
    );
  }
  const objectUrl = URL.createObjectURL(blob);
  posterBlobUrls.set(url, objectUrl);
  return objectUrl;
}

async function attachPosterImage(img) {
  const url = img.getAttribute("data-poster-src");
  if (!url) {
    return;
  }
  try {
    const displayUrl = await getPosterObjectUrl(url);
    if (img.isConnected && img.getAttribute("data-poster-src") === url) {
      img.src = displayUrl;
    }
  } catch (_) {
    if (img.isConnected && img.getAttribute("data-poster-src") === url) {
      img.src = url;
    }
  }
}

function bindPosterImages(root) {
  if (!root) {
    return;
  }
  for (const img of root.querySelectorAll("img[data-poster-src]:not([src])")) {
    attachPosterImage(img);
  }
}

/* --- Requests --- */

async function fetchTmdb(url, options = {}) {
  if (!hasTmdbAccess()) {
    throw new Error("No TMDB credential");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortOuter = () => controller.abort();
  const outerSignal = options.signal;

  if (outerSignal) {
    if (outerSignal.aborted) {
      controller.abort();
    } else {
      outerSignal.addEventListener("abort", abortOuter, { once: true });
    }
  }

  try {
    let requestUrl = url;
    let init = { signal: controller.signal, headers: { accept: "application/json" } };

    if (hasHostedAccess()) {
      const { path, searchParams } = tmdbUrlToProxyRequest(url);
      requestUrl = buildProxyUrl(path, searchParams);
      init.headers.authorization = `Bearer ${hostedSessionToken}`;
    } else {
      init = appTmdb.buildRequestInit(tmdbCredential, { signal: controller.signal });
    }

    const response = await fetch(requestUrl, init);
    if (!response.ok) {
      if (hasHostedAccess() && response.status === 401) {
        clearHostedSession();
      }
      throw new Error(`TMDB request failed (${response.status})`);
    }
    return response;
  } finally {
    clearTimeout(timer);
    if (outerSignal) {
      outerSignal.removeEventListener("abort", abortOuter);
    }
  }
}

function parseMovieText(text) {
  try {
    return appTmdb.normalizeMovie(JSON.parse(text));
  } catch (_) {
    return null;
  }
}

/**
 * Background refresh after a cache hit. Failures are intentionally silent:
 * the caller already has a usable record and may simply be offline.
 */
async function revalidateMovie(movieId, cacheKey, cache, cachedText, onUpdate) {
  try {
    const response = await fetchTmdb(appTmdb.buildMovieUrl(movieId));
    const text = await response.text();
    if (text === cachedText) {
      return;
    }
    const record = parseMovieText(text);
    if (!record) {
      return;
    }
    if (cache) {
      await cache.put(cacheKey, new Response(text, { headers: { "content-type": "application/json" } }));
    }
    movieById.set(movieId, record);
    if (typeof onUpdate === "function") {
      onUpdate(movieId, record);
    }
  } catch (_) {
    /* Stale data stays on screen. */
  }
}

async function fetchAndCacheMovie(movieId, cacheKey, cache) {
  const response = await fetchTmdb(appTmdb.buildMovieUrl(movieId));
  const text = await response.text();
  const record = parseMovieText(text);
  if (!record) {
    throw new Error(`Unexpected TMDB payload for movie ${movieId}`);
  }
  if (cache) {
    await cache.put(
      cacheKey,
      new Response(text, { headers: { "content-type": "application/json" } }),
    );
  }
  return record;
}

/** Resolves from cache when possible, then refreshes behind the caller. */
async function getMovie(movieId, options = {}) {
  const id = Number(movieId);
  const cacheKey = movieCacheKey(id);
  const cache = await openTmdbCache();

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const cachedText = await cached.text();
      const record = parseMovieText(cachedText);
      if (record) {
        revalidateMovie(id, cacheKey, cache, cachedText, options.onUpdate);
        return record;
      }
    }
  }

  return fetchAndCacheMovie(id, cacheKey, cache);
}

/**
 * Cheapest authenticated call TMDB offers, so a bad credential is caught before
 * it fans out into one failing request per movie.
 */
async function verifyCredential() {
  const response = await fetchTmdb(appTmdb.buildConfigurationUrl());
  const body = await response.json();
  if (!body?.images?.secure_base_url) {
    throw new Error("TMDB returned an unexpected configuration payload");
  }
  return true;
}

async function searchMovies(query, options = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) {
    return [];
  }
  if (searchMemo.has(trimmed)) {
    return searchMemo.get(trimmed);
  }
  const response = await fetchTmdb(appTmdb.buildSearchUrl(trimmed), {
    signal: options.signal,
  });
  const results = appTmdb.normalizeSearchResults(await response.json());
  searchMemo.set(trimmed, results);
  return results;
}

/**
 * Fetch many movies with a bounded number of in-flight requests. TMDB has no
 * batch endpoint for arbitrary ids, so a long list is many small requests.
 */
async function hydrateMovies(ids, handlers = {}) {
  // Without access every request would fail, turning the whole grid into
  // error cards. Leaving the skeletons up reads better and stays accurate.
  if (!hasTmdbAccess()) {
    return;
  }
  const queue = ids.filter((id) => !movieById.has(id));
  if (!queue.length) {
    return;
  }

  const pending = [...queue];

  async function worker() {
    while (pending.length) {
      const id = pending.shift();
      try {
        const record = await getMovie(id, { onUpdate: handlers.onUpdate });
        movieById.set(id, record);
        movieErrors.delete(id);
        handlers.onRecord?.(id, record);
      } catch (_) {
        movieErrors.add(id);
        handlers.onRecord?.(id, null);
      }
    }
  }

  const workerCount = Math.min(HYDRATE_CONCURRENCY, pending.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}

/* ===== Search box, TMDB autocomplete, and add-to-list ===== */

/**
 * TMDB search and add flow. The floating + button opens a sheet: search first,
 * then pick Favourites / Watched / Watchlist (pre-selected from the active tab).
 */

const SEARCH_DEBOUNCE_MS = 300;

let searchDebounceTimer = null;
let searchController = null;
let suggestResults = [];
let suggestIndex = -1;
/** Guards against a slow response overwriting a newer one. */
let suggestRequestToken = 0;
let pendingAddResult = null;
let selectedAddListId = null;
let pendingAddRating = null;

function resetAddMovieRatingControls() {
  pendingAddRating = null;
  addMovieRatingEnabled.checked = false;
  addMovieRatingSlider.disabled = true;
  addMovieRatingSlider.value = String(appRatings.DEFAULT_SLIDER_VALUE);
  addMovieRatingValue.textContent = "—";
  addMovieRatingValue.classList.add("is-empty");
}

function syncAddMovieRatingDisplay() {
  if (!addMovieRatingEnabled.checked) {
    addMovieRatingValue.textContent = "—";
    addMovieRatingValue.classList.add("is-empty");
    pendingAddRating = null;
    return;
  }
  const rating = appRatings.ratingFromSliderValue(Number(addMovieRatingSlider.value));
  pendingAddRating = rating;
  addMovieRatingValue.textContent = appRatings.formatUserRating(rating);
  addMovieRatingValue.classList.remove("is-empty");
}

function onAddMovieRatingEnabledChange() {
  addMovieRatingSlider.disabled = !addMovieRatingEnabled.checked;
  syncAddMovieRatingDisplay();
}

function onAddMovieRatingSliderInput() {
  syncAddMovieRatingDisplay();
}

function isAddMovieDialogOpen() {
  return addMovieDialog && !addMovieDialog.hidden;
}

function setSearchBusy(busy) {
  searchSpinner.hidden = !busy;
}

function updateSearchClearVisibility() {
  searchClearBtn.hidden = !searchInput.value;
}

function hideSuggest() {
  suggestResults = [];
  suggestIndex = -1;
  searchSuggest.hidden = true;
  searchSuggest.innerHTML = "";
  searchInput.setAttribute("aria-expanded", "false");
}

function showSuggestMessage(message) {
  suggestResults = [];
  suggestIndex = -1;
  searchSuggest.innerHTML = `<li class="search-suggest-empty" role="option" aria-disabled="true">${appCardHtml.escapeHtml(message)}</li>`;
  searchSuggest.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
}

function suggestPosterHtml(result) {
  const url = appTmdb.buildImageUrl(result.posterPath, appTmdb.POSTER_SIZES.suggest);
  if (!url) {
    return `<span class="search-suggest-poster search-suggest-poster--empty"></span>`;
  }
  return `<img class="search-suggest-poster" data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy">`;
}

function renderSuggest() {
  if (!suggestResults.length) {
    hideSuggest();
    return;
  }

  searchSuggest.innerHTML = suggestResults
    .map((result, index) => {
      const year = appCardHtml.formatYear(result.releaseDate);
      const active = index === suggestIndex ? " active" : "";
      const statusId = appLists.primaryListIdForMovie(userState.lists, result.id);
      const status = statusId
        ? appLists.findList(userState.lists, statusId)
        : null;
      const added = status
        ? `<span class="search-suggest-added">In ${appCardHtml.escapeHtml(status.name)}</span>`
        : "";
      return `<li class="search-suggest-item${active}" role="option" data-suggest-index="${index}" aria-selected="${index === suggestIndex}">
  ${suggestPosterHtml(result)}
  <span class="search-suggest-text">
    <span class="search-suggest-title">${appCardHtml.escapeHtml(result.title)}</span>
    <span class="search-suggest-meta">${year || "Year unknown"}</span>
  </span>
  ${added}
</li>`;
    })
    .join("");
  searchSuggest.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
  bindPosterImages(searchSuggest);
}

async function runSearch(query) {
  if (searchController) {
    searchController.abort();
  }
  searchController = new AbortController();
  const token = ++suggestRequestToken;

  setSearchBusy(true);
  try {
    const results = await searchMovies(query, { signal: searchController.signal });
    if (token !== suggestRequestToken) {
      return;
    }
    suggestResults = results;
    suggestIndex = -1;
    if (!results.length) {
      showSuggestMessage(`No movies found for "${query}".`);
      return;
    }
    renderSuggest();
  } catch (error) {
    if (error.name === "AbortError" || token !== suggestRequestToken) {
      return;
    }
    showSuggestMessage(`Search failed. ${error.message}`);
  } finally {
    if (token === suggestRequestToken) {
      setSearchBusy(false);
    }
  }
}

function onSearchInput() {
  updateSearchClearVisibility();
  const query = searchInput.value.trim();

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }

  if (!query) {
    suggestRequestToken += 1;
    setSearchBusy(false);
    hideSuggest();
    return;
  }

  if (!hasTmdbAccess()) {
    showSuggestMessage("Add a TMDB credential in Settings to search.");
    return;
  }

  searchDebounceTimer = setTimeout(() => {
    searchDebounceTimer = null;
    runSearch(query);
  }, SEARCH_DEBOUNCE_MS);
}

function clearSearch() {
  searchInput.value = "";
  updateSearchClearVisibility();
  suggestRequestToken += 1;
  setSearchBusy(false);
  hideSuggest();
}

function updateAddMovieHint() {
  if (!addMovieHint) {
    return;
  }
  addMovieHint.textContent = hasTmdbAccess()
    ? "Search TMDB to find a movie to add."
    : "Add a TMDB credential in Settings to search.";
}

function showAddSearchStep() {
  pendingAddResult = null;
  selectedAddListId = null;
  resetAddMovieRatingControls();
  addMovieSearchStep.hidden = false;
  addMoviePickStep.hidden = true;
}

function pickedPosterHtml(result) {
  const url = appTmdb.buildImageUrl(result.posterPath, appTmdb.POSTER_SIZES.suggest);
  if (!url) {
    return `<span class="add-movie-picked-poster add-movie-picked-poster--empty"></span>`;
  }
  return `<img class="add-movie-picked-poster" data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy">`;
}

function renderAddMoviePicked(result) {
  const year = appCardHtml.formatYear(result.releaseDate);
  addMoviePicked.innerHTML = `${pickedPosterHtml(result)}
<div class="add-movie-picked-text">
  <span class="add-movie-picked-title">${appCardHtml.escapeHtml(result.title)}</span>
  <span class="add-movie-picked-meta">${year || "Year unknown"}</span>
</div>`;
  bindPosterImages(addMoviePicked);
}

function updateAddListPickerSelection(listId) {
  addMovieListPicker.querySelectorAll(".add-list-option").forEach((button) => {
    const selected = button.dataset.listId === listId;
    button.setAttribute("aria-pressed", String(selected));
  });
}

function showAddPickStep(result) {
  pendingAddResult = result;
  selectedAddListId = userState.activeListId;
  resetAddMovieRatingControls();
  addMovieSearchStep.hidden = true;
  addMoviePickStep.hidden = false;
  renderAddMoviePicked(result);
  updateAddListPickerSelection(selectedAddListId);
  addMovieSubmit.focus({ preventScroll: true });
}

function confirmAddMovie() {
  if (!pendingAddResult || !selectedAddListId) {
    return;
  }
  addMovieToList(pendingAddResult, selectedAddListId, pendingAddRating);
}

function openAddMovieDialog() {
  updateAddMovieHint();
  showAddSearchStep();
  clearSearch();
  addMovieDialog.hidden = false;
  searchInput.focus();
}

function closeAddMovieDialog() {
  addMovieDialog.hidden = true;
  pendingAddResult = null;
  clearSearch();
  showAddSearchStep();
}

function addMovieToList(result, listId, rating) {
  const nextLists = appLists.assignMovieToList(userState.lists, listId, result.id);
  if (!updateLists(nextLists)) {
    return;
  }
  if (rating != null) {
    updateRatings(appRatings.setRating(userState.ratings, result.id, rating));
  }
  persistUserState();
  closeAddMovieDialog();
  render();
  hydrateMovies([result.id], {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
}

function pickSuggestion(index) {
  const result = suggestResults[index];
  if (!result) {
    return;
  }
  hideSuggest();
  showAddPickStep(result);
}

function moveSuggestSelection(delta) {
  if (!suggestResults.length) {
    return;
  }
  const count = suggestResults.length;
  if (suggestIndex < 0) {
    suggestIndex = delta > 0 ? 0 : count - 1;
  } else {
    suggestIndex = (suggestIndex + delta + count) % count;
  }
  renderSuggest();
  searchSuggest
    .querySelector(`[data-suggest-index="${suggestIndex}"]`)
    ?.scrollIntoView({ block: "nearest" });
}

function onSearchKeydown(event) {
  if (!isAddMovieDialogOpen() || addMovieSearchStep.hidden) {
    return;
  }

  const isOpen = !searchSuggest.hidden && suggestResults.length > 0;

  if (event.key === "Escape") {
    event.stopPropagation();
    if (isOpen) {
      event.preventDefault();
      hideSuggest();
    } else if (searchInput.value) {
      event.preventDefault();
      clearSearch();
    }
    return;
  }

  if (!isOpen) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveSuggestSelection(1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveSuggestSelection(-1);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    pickSuggestion(suggestIndex >= 0 ? suggestIndex : 0);
  }
}

function onAddListOptionClick(event) {
  const button = event.target.closest(".add-list-option");
  if (!button || !pendingAddResult) {
    return;
  }
  const listId = button.dataset.listId;
  if (!appLists.isListId(listId)) {
    return;
  }
  selectedAddListId = listId;
  updateAddListPickerSelection(listId);
}

/* ===== Cards, skeletons, and the main grid render ===== */

/**
 * Grid rendering. `render()` writes the whole grid from the active list's ids,
 * emitting skeleton cards for anything not hydrated yet; hydration then
 * patches single rows through applyHydratedRecord() rather than re-rendering.
 */

function posterHtml(record, size) {
  const url = record ? appTmdb.buildImageUrl(record.posterPath, size) : null;
  if (!url) {
    const label = record ? appCardHtml.escapeHtml(record.title) : "";
    return `<div class="placeholder">${label}</div>`;
  }
  return `<img data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy" decoding="async">`;
}

function cardMetaText(record, movieId) {
  const parts = [
    appCardHtml.formatYear(record.releaseDate),
    appCardHtml.formatRuntime(record.runtime),
  ].filter(Boolean);
  const userRating = appRatings.formatUserRating(
    appRatings.getRating(userState.ratings, movieId),
  );
  if (userRating && gridViewMode === "list") {
    parts.push(`<span class="card-meta-rating">${appCardHtml.escapeHtml(userRating)}</span>`);
  }
  return parts.join(" · ");
}

function cardUserRatingHtml(movieId) {
  if (gridViewMode !== "detail") {
    return "";
  }
  const label = appRatings.formatUserRating(
    appRatings.getRating(userState.ratings, movieId),
  );
  if (!label) {
    return "";
  }
  return `<span class="card-user-rating" aria-label="Your rating ${appCardHtml.escapeHtml(label)}">${appCardHtml.escapeHtml(label)}</span>`;
}

/**
 * Watchlist gets a Watch button; watched movies get a star toggle. Nothing else
 * moves movies between lists from the card.
 */
function cardActionsHtml(movieId) {
  if (gridViewMode === "cards") {
    return "";
  }
  if (userState.activeListId === appLists.WATCHLIST_ID) {
    return `<div class="card-actions"><button type="button" class="card-watch-btn" aria-label="Mark as watched" title="Mark as watched">&#10003;</button></div>`;
  }
  if (
    userState.activeListId === appLists.WATCHED_ID ||
    userState.activeListId === appLists.FAVOURITES_ID
  ) {
    const active = appLists.isFavourited(userState.lists, movieId);
    const label = active ? "Remove from favourites" : "Add to favourites";
    return `<div class="card-actions"><button type="button" class="card-favourite-btn${active ? " is-active" : ""}" aria-label="${label}" title="${label}" aria-pressed="${active}">&#9733;</button></div>`;
  }
  return "";
}

function cardPosterOnlyHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = failed
      ? `<div class="placeholder">Could not load</div>`
      : `<div class="placeholder"></div>`;
    return `<div class="poster-wrap">${body}</div>`;
  }
  return `<div class="poster-wrap">${posterHtml(record, appTmdb.POSTER_SIZES.card)}</div>`;
}

function cardInnerHtml(movieId) {
  if (gridViewMode === "cards") {
    return cardPosterOnlyHtml(movieId);
  }

  const record = movieById.get(movieId);

  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = failed
      ? `<div class="placeholder">Could not load</div>`
      : `<div class="placeholder"></div>`;
    return `<div class="poster-wrap">${body}</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${failed ? `TMDB #${movieId}` : ""}</div>
    <div class="card-meta">${failed ? "Tap to retry" : ""}</div>
  </div>
</div>`;
  }

  return `<div class="poster-wrap">
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${cardUserRatingHtml(movieId)}
  <button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>
  <button type="button" class="card-remove" aria-label="Remove ${appCardHtml.escapeHtml(record.title)}" title="Remove movie">&times;</button>
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta">${cardMetaText(record, movieId)}</div>
  </div>
  ${cardActionsHtml(movieId)}
</div>`;
}

function rowInnerHtml(movieId) {
  const record = movieById.get(movieId);
  const stateClass = record
    ? ""
    : movieErrors.has(movieId)
      ? " is-error"
      : " is-skeleton";
  const grip = record
    ? `<button type="button" class="row-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  const title = record ? appCardHtml.escapeHtml(record.title) : `Movie ${movieId}`;

  return `${grip}<article class="card${stateClass}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${cardInnerHtml(movieId)}
</article>`;
}

function rowHtml(movieId) {
  const modifier = gridViewMode === "list" ? "" : " movie-row--card";
  return `<div class="movie-row${modifier}" data-movie-id="${movieId}">${rowInnerHtml(movieId)}</div>`;
}

/** Tabs are the only list switcher, and carry each list's count. */
function renderListTabs() {
  listTabs.innerHTML = userState.lists
    .map((list) => {
      const active = list.id === userState.activeListId;
      return `<button type="button" class="list-tab" role="tab" data-list-id="${appCardHtml.escapeHtml(list.id)}" aria-selected="${active}" tabindex="${active ? "0" : "-1"}">
  ${appCardHtml.escapeHtml(list.name)}
  <span class="list-tab-count">${list.movieIds.length}</span>
</button>`;
    })
    .join("");
}

function updateListHeader() {
  const count = activeMovieIds().length;
  if (count && !hasTmdbAccess()) {
    listSubtitleEl.textContent = "Add a TMDB credential in Settings to load details";
  } else if (count) {
    listSubtitleEl.textContent =
      gridViewMode === "cards"
        ? "+ Add a movie · tap a poster for details"
        : "+ Add a movie · drag to reorder";
  } else {
    listSubtitleEl.textContent = "Tap + Add a movie to start this list";
  }
}

function setActiveList(listId) {
  if (!appLists.isListId(listId) || listId === userState.activeListId) {
    return;
  }
  userState = { ...userState, activeListId: listId };
  persistUserState();
  closeDetail({ popHistory: false });
  render();
  hydrateActiveList();
}

function renderEmptyState(count) {
  if (count) {
    emptyState.hidden = true;
    emptyState.innerHTML = "";
    return;
  }
  emptyState.hidden = false;
  const listName = activeList()?.name || "this list";
  emptyState.innerHTML = hasTmdbAccess()
    ? `<strong>Nothing in ${appCardHtml.escapeHtml(listName)} yet</strong>Tap <strong>+ Add a movie</strong> to search and add one here.`
    : `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to search and load movies.`;
}

function render() {
  const ids = activeMovieIds();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  renderListTabs();
  updateListHeader();
  renderEmptyState(ids.length);
}

/** Patches one row after hydration so the rest of the grid stays untouched. */
function applyHydratedRecord(movieId) {
  const row = grid.querySelector(`.movie-row[data-movie-id="${movieId}"]`);
  if (!row) {
    return;
  }
  row.innerHTML = rowInnerHtml(movieId);
  bindPosterImages(row);
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function hydrateActiveList() {
  return hydrateMovies(activeMovieIds(), {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
}

/** A broken poster URL should degrade to the title placeholder, not a torn card. */
function handleImageError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.closest(".poster-wrap")) {
    return;
  }
  const card = img.closest(".card");
  const movieId = Number(card?.dataset.movieId);
  const record = movieById.get(movieId);
  const placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  placeholder.textContent = record ? record.title : "";
  img.replaceWith(placeholder);
}

function commitListChange(nextLists) {
  if (!updateLists(nextLists)) {
    return false;
  }
  persistUserState();
  return true;
}

function watchMovie(movieId) {
  if (!commitListChange(appLists.assignMovieToList(userState.lists, appLists.WATCHED_ID, movieId))) {
    return;
  }
  if (detailMovieId === movieId && !activeMovieIds().includes(movieId)) {
    closeDetail();
  }
  render();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function toggleFavouriteMovie(movieId) {
  if (!commitListChange(appLists.toggleFavourite(userState.lists, movieId))) {
    return;
  }
  if (detailMovieId === movieId && !activeMovieIds().includes(movieId)) {
    closeDetail();
  }
  render();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function removeMovieFromCollection(movieId) {
  const nextLists = appLists.removeMovie(userState.lists, movieId);
  if (!updateLists(nextLists)) {
    return;
  }
  updateRatings(appRatings.removeRating(userState.ratings, movieId));
  persistUserState();
  if (detailMovieId === movieId) {
    closeDetail();
  }
  render();
}

function refreshMovieRating(movieId) {
  applyHydratedRecord(movieId);
  if (detailMovieId === movieId) {
    syncDetailRatingDisplay(appRatings.getRating(userState.ratings, movieId));
  }
}

function requestRemoveMovie(movieId) {
  pendingRemoveMovieId = Number(movieId);
  const record = movieById.get(pendingRemoveMovieId);
  const title = record?.title || `Movie ${pendingRemoveMovieId}`;
  removeConfirmMessage.textContent = `Remove “${title}” from your collection? This cannot be undone.`;
  removeConfirmDialog.hidden = false;
  removeConfirmCancel.focus({ preventScroll: true });
}

function closeRemoveConfirm() {
  pendingRemoveMovieId = null;
  removeConfirmDialog.hidden = true;
}

function confirmRemoveMovie() {
  const movieId = pendingRemoveMovieId;
  closeRemoveConfirm();
  if (movieId == null) {
    return;
  }
  removeMovieFromCollection(movieId);
}

/* ===== Detail overlay, settings, and about dialogs ===== */

/**
 * Detail overlay, settings, and about dialogs.
 *
 * The overlay is the only routed surface: it deep-links as `#movie/{id}` and
 * is driven by history state, so back and forward behave as expected.
 */

const TMDB_MOVIE_URL = "https://www.themoviedb.org/movie/";

/* --- Detail overlay --- */

function detailMetaChips(record) {
  const chips = [];
  const year = appCardHtml.formatYear(record.releaseDate);
  const runtime = appCardHtml.formatRuntime(record.runtime);
  const rating = appCardHtml.formatRating(record.voteAverage);

  if (year) {
    chips.push(`<span class="meta-chip">${year}</span>`);
  }
  if (runtime) {
    chips.push(`<span class="meta-chip">${runtime}</span>`);
  }
  if (rating) {
    chips.push(`<span class="meta-chip">★ ${rating}</span>`);
  }
  for (const genre of record.genres) {
    chips.push(`<span class="meta-chip">${appCardHtml.escapeHtml(genre)}</span>`);
  }
  return chips.join("");
}

function detailCreditsHtml(record) {
  const rows = [];
  const directors = appCardHtml.joinNames(record.directors);
  const cast = appCardHtml.joinNames(record.cast);

  if (directors) {
    rows.push(
      `<div><strong>${record.directors.length > 1 ? "Directors" : "Director"}:</strong> ${appCardHtml.escapeHtml(directors)}</div>`,
    );
  }
  if (cast) {
    rows.push(`<div><strong>Cast:</strong> ${appCardHtml.escapeHtml(cast)}</div>`);
  }
  return rows.join("");
}

function detailUserRatingRowHtml(movieId) {
  const inCollection = appLists.findListIdsForMovie(userState.lists, movieId).length > 0;
  if (!inCollection) {
    return "";
  }

  const rating = appRatings.getRating(userState.ratings, movieId);
  const valueText = rating == null ? "—" : appRatings.formatUserRating(rating);
  const sliderValue = appRatings.sliderValueFromRating(rating);
  const editorOpen = detailRatingEditorOpen;

  return `<div class="detail-rating-row">
  <span class="detail-rating-label">My Rating:</span>
  <button
    type="button"
    class="detail-rating-chip meta-chip"
    id="detail-rating-summary"
    aria-expanded="${editorOpen}"
    aria-controls="detail-rating-editor"
    title="Edit my rating"
  >★ <span id="detail-rating-summary-value">${appCardHtml.escapeHtml(valueText)}</span></button>
</div>
${detailUserRatingEditorHtml(movieId)}`;
}

function detailUserRatingEditorHtml(movieId) {
  const inCollection = appLists.findListIdsForMovie(userState.lists, movieId).length > 0;
  if (!inCollection) {
    return "";
  }

  const rating = appRatings.getRating(userState.ratings, movieId);
  const sliderValue = appRatings.sliderValueFromRating(rating);
  const editorOpen = detailRatingEditorOpen;

  return `<div class="detail-rating-editor" id="detail-rating-editor"${editorOpen ? "" : " hidden"}>
  <input
    type="range"
    class="detail-rating-slider"
    id="detail-rating-slider"
    min="0"
    max="90"
    step="1"
    value="${sliderValue}"
    aria-label="My rating from 1 to 10"
    aria-valuetext="${rating == null ? "Not rated" : appRatings.formatUserRating(rating)}"
  />
  <div class="detail-rating-editor-foot">
    <span class="detail-rating-scale" aria-hidden="true">1</span>
    <button type="button" class="detail-rating-link" id="detail-rating-clear"${rating == null ? " hidden" : ""}>Clear</button>
    <button type="button" class="detail-rating-link" id="detail-rating-done">Done</button>
    <span class="detail-rating-scale" aria-hidden="true">10</span>
  </div>
</div>`;
}

function syncDetailRatingDisplay(rating) {
  const chipValue = document.getElementById("detail-rating-summary-value");
  if (chipValue) {
    chipValue.textContent = rating == null ? "—" : appRatings.formatUserRating(rating);
  }

  const slider = document.getElementById("detail-rating-slider");
  if (slider) {
    slider.setAttribute(
      "aria-valuetext",
      rating == null ? "Not rated" : appRatings.formatUserRating(rating),
    );
  }

  const clearBtn = document.getElementById("detail-rating-clear");
  if (clearBtn) {
    clearBtn.hidden = rating == null;
  }
}

function syncDetailRatingEditorVisibility() {
  const summary = document.getElementById("detail-rating-summary");
  const editor = document.getElementById("detail-rating-editor");
  if (!summary || !editor) {
    return;
  }
  summary.setAttribute("aria-expanded", String(detailRatingEditorOpen));
  editor.hidden = !detailRatingEditorOpen;
}

function openDetailRatingEditor() {
  detailRatingEditorOpen = true;
  syncDetailRatingEditorVisibility();
  document.getElementById("detail-rating-slider")?.focus({ preventScroll: true });
}

function closeDetailRatingEditor() {
  detailRatingEditorOpen = false;
  syncDetailRatingEditorVisibility();
}

function toggleDetailRatingEditor() {
  if (detailRatingEditorOpen) {
    closeDetailRatingEditor();
    return;
  }
  openDetailRatingEditor();
}

function onDetailRatingSliderInput(event) {
  if (detailMovieId == null) {
    return;
  }
  const rating = appRatings.ratingFromSliderValue(Number(event.target.value));
  if (!setMovieRating(detailMovieId, rating)) {
    return;
  }
  applyHydratedRecord(detailMovieId);
  syncDetailRatingDisplay(rating);
}

function clearDetailRating() {
  if (detailMovieId == null) {
    return;
  }
  if (!setMovieRating(detailMovieId, null)) {
    return;
  }
  applyHydratedRecord(detailMovieId);
  const slider = document.getElementById("detail-rating-slider");
  if (slider) {
    slider.value = String(appRatings.DEFAULT_SLIDER_VALUE);
  }
  syncDetailRatingDisplay(null);
}

function renderDetail() {
  if (detailMovieId == null) {
    return;
  }

  const ids = activeMovieIds();
  const index = ids.indexOf(detailMovieId);
  const record = movieById.get(detailMovieId);

  detailEyebrow.textContent =
    index >= 0 ? `${index + 1} of ${ids.length}` : "Not in this list";
  detailPrevBtn.disabled = index <= 0;
  detailNextBtn.disabled = index < 0 || index >= ids.length - 1;

  if (!record) {
    let heading = "Loading…";
    let note = "";
    if (!hasTmdbAccess()) {
      heading = "No TMDB credential";
      note = "Open Settings and paste your TMDB credential to load this movie.";
    } else if (movieErrors.has(detailMovieId)) {
      heading = "Could not load this movie";
      note = "TMDB did not return details. Check your credential and connection.";
    }
    detailPoster.innerHTML = `<div class="placeholder"></div>`;
    detailBody.innerHTML = `<h2 class="movie-detail-title" id="movie-detail-title">${heading}</h2>
<p class="movie-detail-overview">${note}</p>`;
  } else {
    detailPoster.innerHTML = posterHtml(record, appTmdb.POSTER_SIZES.detail);
    bindPosterImages(detailPoster);
    detailBody.innerHTML = `<h2 class="movie-detail-title" id="movie-detail-title">${appCardHtml.escapeHtml(record.title)}</h2>
${record.tagline ? `<p class="movie-detail-tagline">${appCardHtml.escapeHtml(record.tagline)}</p>` : ""}
<div class="movie-detail-meta">${detailMetaChips(record)}</div>
${detailUserRatingRowHtml(detailMovieId)}
<p class="movie-detail-overview">${appCardHtml.escapeHtml(record.overview || "No overview available.")}</p>
<div class="movie-detail-credits">${detailCreditsHtml(record)}</div>`;
  }

  const inCollection = appLists.findListIdsForMovie(userState.lists, detailMovieId).length > 0;
  const onWatchlist = appLists.isOnWatchlist(userState.lists, detailMovieId);
  const watched = appLists.isWatched(userState.lists, detailMovieId);
  const favourited = appLists.isFavourited(userState.lists, detailMovieId);

  const leftActions = [];
  if (inCollection && onWatchlist) {
    leftActions.push(
      `<button type="button" class="detail-watch-btn" id="detail-watch">Mark as watched</button>`,
    );
  }
  if (inCollection && watched) {
    const label = favourited ? "Remove from favourites" : "Add to favourites";
    leftActions.push(
      `<button type="button" class="detail-favourite-btn${favourited ? " is-active" : ""}" id="detail-favourite" aria-label="${label}" aria-pressed="${favourited}" title="${label}">&#9733;</button>`,
    );
  }

  const removeBtn = inCollection
    ? `<button type="button" class="detail-remove-btn" id="detail-remove">Remove movie</button>`
    : "";

  detailActions.innerHTML = `<div class="detail-actions-left">${leftActions.join("")}</div>
<div class="detail-actions-right">${removeBtn}
<a class="detail-link" href="${TMDB_MOVIE_URL}${detailMovieId}" target="_blank" rel="noopener noreferrer">View on TMDB</a></div>`;
}

function openDetail(movieId, options = {}) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  detailMovieId = id;
  detailRatingEditorOpen = false;
  detailDialog.hidden = false;
  document.body.classList.add("movie-detail-open");
  renderDetail();
  detailCloseBtn.focus({ preventScroll: true });

  if (options.pushHistory !== false) {
    history.pushState({ detailMovieId: id }, "", `#movie/${id}`);
  }

  if (!movieById.has(id)) {
    hydrateMovies([id], {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
  }
}

function closeDetail(options = {}) {
  if (detailMovieId == null) {
    return;
  }
  const hadHistoryEntry = history.state?.detailMovieId != null;
  detailMovieId = null;
  detailRatingEditorOpen = false;
  detailDialog.hidden = true;
  document.body.classList.remove("movie-detail-open");

  if (options.popHistory !== false && hadHistoryEntry) {
    history.back();
  }
}

function stepDetail(delta) {
  const ids = activeMovieIds();
  const index = ids.indexOf(detailMovieId);
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return;
  }
  detailMovieId = ids[nextIndex];
  detailRatingEditorOpen = false;
  history.replaceState({ detailMovieId }, "", `#movie/${detailMovieId}`);
  renderDetail();
  if (!movieById.has(detailMovieId)) {
    hydrateMovies([detailMovieId], {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
  }
}

function movieIdFromHash() {
  const match = /^#movie\/(\d+)$/.exec(window.location.hash || "");
  return match ? Number(match[1]) : null;
}

/** Single source of truth for the overlay on load, back, and forward. */
function syncDetailFromLocation() {
  const id = movieIdFromHash();
  if (id == null) {
    closeDetail({ popHistory: false });
    return;
  }
  if (id !== detailMovieId) {
    openDetail(id, { pushHistory: false });
  }
}

/* --- Settings --- */

function refreshSettings() {
  tmdbKeyInput.value = "";
  setStatus(
    tmdbKeyStatus,
    hasCredential() ? "Read access token saved." : "No token saved.",
    hasCredential() ? "ok" : null,
  );

  const usingGist = userState.storageMode === "gist";
  storageModeLocal.checked = !usingGist;
  storageModeGist.checked = usingGist;
  gistFields.hidden = !usingGist;
  gistTokenInput.value = "";
  setStatus(
    gistStatus,
    appGistSync.isConnectedGistConfig(gistConfig)
      ? `Connected to Gist ${gistConfig.gistId.slice(0, 8)}…`
      : "Not connected.",
    appGistSync.isConnectedGistConfig(gistConfig) ? "ok" : null,
  );
  setStatus(cacheStatus, "");
}

function openSettings() {
  refreshSettings();
  settingsDialog.hidden = false;
  settingsBtn.setAttribute("aria-expanded", "true");
  tmdbKeyInput.focus({ preventScroll: true });
}

function closeSettings() {
  settingsDialog.hidden = true;
  settingsBtn.setAttribute("aria-expanded", "false");
}

async function onSaveCredential() {
  const value = tmdbKeyInput.value.trim();

  // Reject the wrong credential shape before storing it, so a mistyped or v3
  // value never becomes the reason every later request fails.
  const problem = appTmdb.describeCredentialProblem(value);
  if (problem) {
    setStatus(tmdbKeyStatus, problem, "error");
    return;
  }

  saveCredential(value);
  refreshSettings();
  render();
  setStatus(tmdbKeyStatus, "Checking with TMDB…", null);
  tmdbKeySave.disabled = true;

  try {
    await verifyCredential();
    refreshSettings();
    hydrateActiveList();
  } catch (error) {
    // The credential stays saved so it can be corrected rather than retyped.
    setStatus(tmdbKeyStatus, `Saved, but TMDB rejected it. ${error.message}`, "error");
  } finally {
    tmdbKeySave.disabled = false;
  }
}

function onClearCredential() {
  saveCredential("");
  movieById.clear();
  movieErrors.clear();
  refreshSettings();
  render();
}

async function onClearCache() {
  const cleared = await clearMovieCache();
  movieById.clear();
  movieErrors.clear();
  setStatus(
    cacheStatus,
    cleared ? "Cache cleared. Reloading movie data…" : "Nothing cached.",
    "ok",
  );
  render();
  hydrateActiveList();
}

function onStorageModeChange(mode) {
  if (mode === "gist") {
    userState = { ...userState, storageMode: "gist" };
    gistFields.hidden = false;
    persistUserState({ sync: false });
    refreshSettings();
    return;
  }
  disconnectGist();
  gistFields.hidden = true;
  refreshSettings();
}

async function onConnectGist() {
  const token = gistTokenInput.value.trim();
  setStatus(gistStatus, "Connecting to GitHub…", null);
  gistConnectBtn.disabled = true;
  try {
    const result = await connectGist(token);
    if (!result.ok) {
      setStatus(gistStatus, result.error, "error");
      return;
    }
    setStatus(
      gistStatus,
      result.action === "adopt"
        ? "Connected. Loaded the lists already in your Gist."
        : "Connected. Created a new private Gist for your lists.",
      "ok",
    );
    gistTokenInput.value = "";
    setViewMode(gridViewMode);
    render();
    hydrateActiveList();
  } finally {
    gistConnectBtn.disabled = false;
  }
}

function onDisconnectGist() {
  disconnectGist();
  refreshSettings();
}

/* --- About --- */

function openAbout() {
  aboutDialog.hidden = false;
  aboutBtn.setAttribute("aria-expanded", "true");
  aboutClose.focus({ preventScroll: true });
}

function closeAbout() {
  aboutDialog.hidden = true;
  aboutBtn.setAttribute("aria-expanded", "false");
}

/* --- Hosted unlock (hidden) --- */

function openHostedUnlockDialog() {
  hostedUnlockInput.value = "";
  setStatus(hostedUnlockStatus, "");
  hostedUnlockDialog.hidden = false;
  hostedUnlockInput.focus({ preventScroll: true });
}

function closeHostedUnlockDialog() {
  hostedUnlockDialog.hidden = true;
  hostedUnlockInput.value = "";
  setStatus(hostedUnlockStatus, "");
}

async function submitHostedUnlock() {
  const password = hostedUnlockInput.value;
  setStatus(hostedUnlockStatus, "Checking…", null);
  hostedUnlockSubmit.disabled = true;
  try {
    await unlockHostedAccess(password);
    closeHostedUnlockDialog();
    render();
    hydrateActiveList();
  } catch (error) {
    setStatus(hostedUnlockStatus, error.message, "error");
  } finally {
    hostedUnlockSubmit.disabled = false;
  }
}

function openHostedLockDialog() {
  hostedLockDialog.hidden = false;
  hostedLockCancel.focus({ preventScroll: true });
}

function closeHostedLockDialog() {
  hostedLockDialog.hidden = true;
}

function confirmHostedLock() {
  lockHostedAccess();
  closeHostedLockDialog();
  render();
}

/* ===== Drag reorder for list rows and grid cards ===== */

/**
 * Drag reorder for both views, ported from arkham's want-list engine.
 *
 * One lift-and-drop implementation drives a vertical list and a 2D card grid;
 * only the lifted element, the drop-target selector, and the floating class
 * differ. Targets are chosen by overlap area, which is what makes the same
 * code work in a grid where row hit testing would fall apart.
 *
 * There is no gate: the stored order is the only order, so nothing can
 * disagree with what was dragged.
 */

const EDGE_SCROLL_ZONE = 72;
const EDGE_SCROLL_SPEED = 18;

let dragState = null;

function getLiftConfig() {
  if (gridViewMode === "list") {
    return {
      liftSelector: ".movie-row",
      targetSelector: ".movie-row:not(.movie-row--card)",
      floatingClass: "movie-row-floating",
    };
  }
  return {
    liftSelector: ".card",
    targetSelector: ".movie-row--card .card",
    floatingClass: "movie-card-floating",
  };
}

function elementMovieId(element) {
  return Number(element?.dataset?.movieId);
}

function clearDropHighlight() {
  for (const el of grid.querySelectorAll(".drop-target")) {
    el.classList.remove("drop-target");
  }
}

function highlightTarget(targets, targetId) {
  clearDropHighlight();
  if (targetId == null) {
    return;
  }
  targets.find((item) => item.id === targetId)?.el.classList.add("drop-target");
}

function autoScrollForPointer(clientY) {
  const fromTop = clientY;
  const fromBottom = window.innerHeight - clientY;
  if (fromTop < EDGE_SCROLL_ZONE) {
    window.scrollBy(0, -EDGE_SCROLL_SPEED);
  } else if (fromBottom < EDGE_SCROLL_ZONE) {
    window.scrollBy(0, EDGE_SCROLL_SPEED);
  }
}

function onGripPointerDown(event) {
  const handle = event.target.closest(".card-grip, .row-grip");
  if (!handle || dragState || (event.pointerType === "mouse" && event.button !== 0)) {
    return;
  }

  const config = getLiftConfig();
  const source = handle.closest(config.liftSelector);
  const movieId = elementMovieId(source);
  if (!source || !Number.isInteger(movieId)) {
    return;
  }

  event.preventDefault();
  const rect = source.getBoundingClientRect();
  const floatEl = source.cloneNode(true);
  floatEl.classList.add(config.floatingClass);
  floatEl.style.position = "fixed";
  floatEl.style.left = `${rect.left}px`;
  floatEl.style.top = `${rect.top}px`;
  floatEl.style.width = `${rect.width}px`;
  floatEl.style.height = `${rect.height}px`;
  floatEl.style.margin = "0";
  document.body.appendChild(floatEl);

  source.classList.add("drag-lift-source");
  document.body.classList.add("reorder-active");
  handle.setPointerCapture(event.pointerId);

  dragState = {
    pointerId: event.pointerId,
    handle,
    config,
    movieId,
    source,
    floatEl,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
    lastTargetId: null,
  };
}

function onGripPointerMove(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }
  event.preventDefault();

  const floatingRect = appPointerReorder.floatingRectFor(
    dragState,
    event.clientX,
    event.clientY,
  );
  dragState.floatEl.style.left = `${floatingRect.left}px`;
  dragState.floatEl.style.top = `${floatingRect.top}px`;

  autoScrollForPointer(event.clientY);

  // Rects are re-read every move so hydration or scrolling cannot desync them.
  const targets = appPointerReorder.collectTargetRects(
    grid.querySelectorAll(dragState.config.targetSelector),
    elementMovieId,
    (el) => el.getBoundingClientRect(),
  );
  const targetId = appReorder.pickOverlapTargetId(
    floatingRect,
    targets,
    dragState.movieId,
  );
  dragState.lastTargetId = targetId;
  highlightTarget(targets, targetId);
}

function commitDrop(targetId) {
  const list = activeList();
  if (!list || targetId == null) {
    return false;
  }
  const nextIds = appReorder.moveMovieId(list.movieIds, dragState.movieId, targetId);
  if (!updateLists(appLists.replaceMovieIds(userState.lists, list.id, nextIds))) {
    return false;
  }
  persistUserState();
  return true;
}

function finishDrag(event, { commit }) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  // Release coordinates can drift from where the glow was, so trust the last
  // highlighted target over a fresh hit test.
  const targetId = dragState.lastTargetId;
  const { handle, source, floatEl, pointerId } = dragState;

  const changed = commit ? commitDrop(targetId) : false;

  if (handle.hasPointerCapture?.(pointerId)) {
    handle.releasePointerCapture(pointerId);
  }
  floatEl.remove();
  source.classList.remove("drag-lift-source");
  document.body.classList.remove("reorder-active");
  clearDropHighlight();
  dragState = null;

  if (changed) {
    render();
  }
}

/* ===== Event wiring and startup ===== */

/* Event wiring and startup. Closes the shared IIFE opened in 01-config-dom-state.js. */

/* --- Search --- */

searchInput.addEventListener("input", onSearchInput);
searchInput.addEventListener("keydown", onSearchKeydown);
searchInput.addEventListener("focus", () => {
  if (suggestResults.length) {
    renderSuggest();
  }
});
searchClearBtn.addEventListener("click", () => {
  clearSearch();
  searchInput.focus();
});

searchSuggest.addEventListener("click", (event) => {
  const item = event.target.closest("[data-suggest-index]");
  if (!item) {
    return;
  }
  pickSuggestion(Number(item.dataset.suggestIndex));
});

addMovieDialog.addEventListener("click", (event) => {
  if (
    !searchCombobox.contains(event.target) &&
    !searchSuggest.contains(event.target)
  ) {
    hideSuggest();
  }
  if (event.target.closest("[data-close-add-movie]")) {
    closeAddMovieDialog();
  }
});

addMovieFab.addEventListener("click", openAddMovieDialog);
addMovieClose.addEventListener("click", closeAddMovieDialog);
addMovieBack.addEventListener("click", () => {
  showAddSearchStep();
  searchInput.focus();
});
addMovieListPicker.addEventListener("click", onAddListOptionClick);
addMovieSubmit.addEventListener("click", confirmAddMovie);
addMovieRatingEnabled.addEventListener("change", onAddMovieRatingEnabledChange);
addMovieRatingSlider.addEventListener("input", onAddMovieRatingSliderInput);

/* --- Grid --- */

grid.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".card-remove");
  if (removeBtn) {
    event.stopPropagation();
    requestRemoveMovie(Number(removeBtn.closest("[data-movie-id]").dataset.movieId));
    return;
  }
  const watchBtn = event.target.closest(".card-watch-btn");
  if (watchBtn) {
    event.stopPropagation();
    watchMovie(Number(watchBtn.closest("[data-movie-id]").dataset.movieId));
    return;
  }
  const favouriteBtn = event.target.closest(".card-favourite-btn");
  if (favouriteBtn) {
    event.stopPropagation();
    toggleFavouriteMovie(Number(favouriteBtn.closest("[data-movie-id]").dataset.movieId));
    return;
  }
  if (event.target.closest(".card-grip, .row-grip")) {
    return;
  }

  const card = event.target.closest(".card");
  if (!card) {
    return;
  }
  const movieId = Number(card.dataset.movieId);

  if (movieErrors.has(movieId)) {
    movieErrors.delete(movieId);
    applyHydratedRecord(movieId);
    hydrateMovies([movieId], {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
    return;
  }
  openDetail(movieId);
});

grid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  const card = event.target.closest(".card");
  if (!card) {
    return;
  }
  event.preventDefault();
  openDetail(Number(card.dataset.movieId));
});

grid.addEventListener("error", handleImageError, true);

/* --- Drag reorder --- */

grid.addEventListener("pointerdown", onGripPointerDown);
document.addEventListener("pointermove", onGripPointerMove, { passive: false });
document.addEventListener("pointerup", (event) => finishDrag(event, { commit: true }));
document.addEventListener("pointercancel", (event) =>
  finishDrag(event, { commit: false }),
);

/* --- List tabs --- */

listTabs.addEventListener("click", (event) => {
  const tab = event.target.closest(".list-tab");
  if (tab) {
    setActiveList(tab.dataset.listId);
  }
});

// Arrow keys move between tabs, as expected of a tablist.
listTabs.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    return;
  }
  const tabs = [...listTabs.children];
  const current = tabs.findIndex((tab) => tab.dataset.listId === userState.activeListId);
  const next = current + (event.key === "ArrowRight" ? 1 : -1);
  if (current < 0 || next < 0 || next >= tabs.length) {
    return;
  }
  event.preventDefault();
  setActiveList(tabs[next].dataset.listId);
  listTabs.children[next]?.focus();
});

/* --- Toolbar --- */

viewModeCycleBtn.addEventListener("click", () => {
  setViewMode(nextViewMode(gridViewMode));
  persistUserState();
  render();
});

/* --- Detail overlay --- */

detailCloseBtn.addEventListener("click", () => closeDetail());
detailPrevBtn.addEventListener("click", () => stepDetail(-1));
detailNextBtn.addEventListener("click", () => stepDetail(1));
detailDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-detail")) {
    closeDetail();
    return;
  }
  if (event.target.id === "detail-rating-summary") {
    toggleDetailRatingEditor();
    return;
  }
  if (event.target.id === "detail-rating-done") {
    closeDetailRatingEditor();
    return;
  }
  if (event.target.id === "detail-rating-clear") {
    clearDetailRating();
  }
});
detailDialog.addEventListener("input", (event) => {
  if (event.target.id === "detail-rating-slider") {
    onDetailRatingSliderInput(event);
  }
});
detailActions.addEventListener("click", (event) => {
  if (event.target.id === "detail-remove") {
    requestRemoveMovie(detailMovieId);
    return;
  }
  if (event.target.id === "detail-watch") {
    watchMovie(detailMovieId);
    return;
  }
  if (event.target.id === "detail-favourite") {
    toggleFavouriteMovie(detailMovieId);
  }
});

removeConfirmCancel.addEventListener("click", () => closeRemoveConfirm());
removeConfirmOk.addEventListener("click", () => confirmRemoveMovie());
removeConfirmDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-remove-confirm")) {
    closeRemoveConfirm();
  }
});

window.addEventListener("popstate", syncDetailFromLocation);

/* --- Settings and about --- */

settingsBtn.addEventListener("click", openSettings);
settingsClose.addEventListener("click", closeSettings);
settingsDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-settings")) {
    closeSettings();
  }
});
tmdbKeySave.addEventListener("click", onSaveCredential);
tmdbKeyInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    onSaveCredential();
  }
});
tmdbKeyClear.addEventListener("click", onClearCredential);
cacheClearBtn.addEventListener("click", onClearCache);
storageModeLocal.addEventListener("change", () => onStorageModeChange("local"));
storageModeGist.addEventListener("change", () => onStorageModeChange("gist"));
gistConnectBtn.addEventListener("click", onConnectGist);
gistClearBtn.addEventListener("click", onDisconnectGist);

aboutBtn.addEventListener("click", openAbout);
aboutClose.addEventListener("click", closeAbout);
aboutDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-about")) {
    closeAbout();
  }
});

/* --- Hidden hosted unlock (triple-click logo) --- */

let logoClickCount = 0;
let logoClickTimer = null;

headerLogo.addEventListener("click", () => {
  logoClickCount += 1;
  if (logoClickTimer) {
    clearTimeout(logoClickTimer);
  }
  logoClickTimer = setTimeout(() => {
    logoClickCount = 0;
    logoClickTimer = null;
  }, 600);
  if (logoClickCount < 3) {
    return;
  }
  logoClickCount = 0;
  clearTimeout(logoClickTimer);
  logoClickTimer = null;
  if (hasHostedAccess()) {
    openHostedLockDialog();
  } else {
    openHostedUnlockDialog();
  }
});

hostedUnlockCancel.addEventListener("click", () => closeHostedUnlockDialog());
hostedUnlockSubmit.addEventListener("click", () => submitHostedUnlock());
hostedUnlockInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitHostedUnlock();
  }
});
hostedUnlockDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-hosted-unlock")) {
    closeHostedUnlockDialog();
  }
});

hostedLockCancel.addEventListener("click", () => closeHostedLockDialog());
hostedLockOk.addEventListener("click", () => confirmHostedLock());
hostedLockDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-hosted-lock")) {
    closeHostedLockDialog();
  }
});

/* --- Global keys --- */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!hostedUnlockDialog.hidden) {
      closeHostedUnlockDialog();
      return;
    }
    if (!hostedLockDialog.hidden) {
      closeHostedLockDialog();
      return;
    }
    if (!removeConfirmDialog.hidden) {
      closeRemoveConfirm();
      return;
    }
    if (!aboutDialog.hidden) {
      closeAbout();
      return;
    }
    if (!settingsDialog.hidden) {
      closeSettings();
      return;
    }
    if (!addMovieDialog.hidden) {
      if (!addMoviePickStep.hidden) {
        showAddSearchStep();
        searchInput.focus();
      } else {
        closeAddMovieDialog();
      }
      return;
    }
    if (detailMovieId != null) {
      if (detailRatingEditorOpen) {
        closeDetailRatingEditor();
        return;
      }
      closeDetail();
    }
    return;
  }

  if (detailMovieId == null || event.target === searchInput) {
    return;
  }
  if (event.key === "ArrowLeft") {
    stepDetail(-1);
  } else if (event.key === "ArrowRight") {
    stepDetail(1);
  }
});

/* --- Startup --- */

function startApp() {
  loadCredential();
  loadHostedSession();
  loadGistConfig();
  loadUserState();
  setViewMode(userState.preferences.viewMode);
  updateSearchClearVisibility();
  render();
  syncDetailFromLocation();
  hydrateActiveList();

  if (
    userState.storageMode === "gist" &&
    appGistSync.isConnectedGistConfig(gistConfig)
  ) {
    pullStateFromGist()
      .then((changed) => {
        if (!changed) {
          return;
        }
        setViewMode(gridViewMode);
        render();
        hydrateActiveList();
      })
      .catch(() => {
        /* Offline or a revoked token; the local copy stays authoritative. */
      });
  }
}

startApp();
})();
