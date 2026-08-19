/* ===== Configuration, DOM references, and mutable state ===== */

(function () {
  "use strict";

/* Opens the shared IIFE scope for every partial. Closed by 08-init.js. */

/* --- DOM --- */

const listSubtitleEl = document.getElementById("list-subtitle");
const headerTitleEl = document.getElementById("header-title");
const customListViewTitleEl = document.getElementById("custom-list-view-title");
const listTabs = document.getElementById("list-tabs");
const headerLogo = document.getElementById("header-logo");
const listsNavBtn = document.getElementById("lists-nav-btn");
const customListsIndex = document.getElementById("custom-lists-index");
const customListsRows = document.getElementById("custom-lists-rows");
const customListsIndexTitle = document.getElementById("custom-lists-index-title");
const customListsIndexActions = document.getElementById("custom-lists-index-actions");
const customListsSortSelect = document.getElementById("custom-lists-sort");
const customListsSortControl = document.getElementById("custom-lists-sort-control");
const customListsEmpty = document.getElementById("custom-lists-empty");
const customListCreateBtn = document.getElementById("custom-list-create-btn");
const customListBackBtn = document.getElementById("custom-list-back-btn");
const addMovieFromWatchedSection = document.getElementById("add-movie-from-watched-section");
const addMovieFromWatchedBtn = document.getElementById("add-movie-from-watched-btn");

const addMovieCustomListsSection = document.getElementById("add-movie-custom-lists-section");
const addMovieCustomListPicker = document.getElementById("add-movie-custom-list-picker");
const addMovieCustomListsEmpty = document.getElementById("add-movie-custom-lists-empty");
const addMovieCreateListsLink = document.getElementById("add-movie-create-lists-link");

const watchlistPickerDialog = document.getElementById("watchlist-picker-dialog");
const watchlistPickerBack = document.getElementById("watchlist-picker-back");
const watchlistPickerClose = document.getElementById("watchlist-picker-close");
const watchlistPickerList = document.getElementById("watchlist-picker-list");
const watchlistPickerEmpty = document.getElementById("watchlist-picker-empty");
const watchlistPickerSubmit = document.getElementById("watchlist-picker-submit");
const watchlistPickerMainLink = document.getElementById("watchlist-picker-main-link");

const customListDeleteDialog = document.getElementById("custom-list-delete-dialog");
const customListDeleteMessage = document.getElementById("custom-list-delete-message");
const customListDeleteCancel = document.getElementById("custom-list-delete-cancel");
const customListDeleteOk = document.getElementById("custom-list-delete-ok");

const searchInput = document.getElementById("search");
const searchCombobox = document.getElementById("search-combobox");
const searchSuggest = document.getElementById("search-suggest");
const searchClearBtn = document.getElementById("search-clear");
const searchSpinner = document.getElementById("search-spinner");
const searchDirectorToggle = document.getElementById("search-director-toggle");

const addMovieFab = document.getElementById("add-movie-fab");
const addMovieDialog = document.getElementById("add-movie-dialog");
const addMovieTitle = document.getElementById("add-movie-title");
const addMovieClose = document.getElementById("add-movie-close");
const addMovieHint = document.getElementById("add-movie-hint");
const addMovieSearchStep = document.getElementById("add-movie-search-step");
const addMoviePickStep = document.getElementById("add-movie-pick-step");
const addMoviePicked = document.getElementById("add-movie-picked");
const addMoviePresetSection = document.getElementById("add-movie-preset-section");
const addMovieListPicker = document.getElementById("add-movie-list-picker");
const addMovieSubmit = document.getElementById("add-movie-submit");
const addMovieRatingSlider = document.getElementById("add-movie-rating-slider");
const addMovieRatingSelect = document.getElementById("add-movie-rating-select");
const addMovieRatingClear = document.getElementById("add-movie-rating-clear");
const addMovieRatingValue = document.getElementById("add-movie-rating-value");
const addMovieRatingField = document.getElementById("add-movie-rating-field");
const addMovieBack = document.getElementById("add-movie-back");
const addMoviePickTabs = document.getElementById("add-movie-pick-tabs");
const addMovieTabAdd = document.getElementById("add-movie-tab-add");
const addMovieTabDetail = document.getElementById("add-movie-tab-detail");
const addMovieAddPanel = document.getElementById("add-movie-add-panel");
const addMovieDetailPanel = document.getElementById("add-movie-detail-panel");
const addMovieDetailContent = document.getElementById("add-movie-detail-content");

const viewModeCycleBtn = document.getElementById("view-mode-cycle");
const sortControl = document.getElementById("sort-control");
const listSortSelect = document.getElementById("list-sort");
const sortReverseBtn = document.getElementById("sort-reverse");
const reorderToolbarSlot = document.getElementById("reorder-toolbar-slot");
const reorderModeControl = document.getElementById("reorder-mode-control");
const reorderModeToggle = document.getElementById("reorder-mode-toggle");
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
const gistBackupSection = document.getElementById("gist-backup-section");
const gistBackupList = document.getElementById("gist-backup-list");
const gistBackupStatus = document.getElementById("gist-backup-status");

const backupRestoreDialog = document.getElementById("backup-restore-dialog");
const backupRestoreMessage = document.getElementById("backup-restore-message");
const backupRestoreCancel = document.getElementById("backup-restore-cancel");
const backupRestoreOk = document.getElementById("backup-restore-ok");
const cacheClearBtn = document.getElementById("cache-clear");
const cacheStatus = document.getElementById("cache-status");
const exportCsvBtn = document.getElementById("export-csv");
const exportCsvStatus = document.getElementById("export-csv-status");

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

const detailListsDialog = document.getElementById("detail-lists-dialog");
const detailListsDialogBody = document.getElementById("detail-lists-dialog-body");
const detailListsDialogClose = document.getElementById("detail-lists-dialog-close");
const detailListsCancel = document.getElementById("detail-lists-cancel");
const detailListsSaveOverlay = document.getElementById("detail-lists-save-overlay");

const removeConfirmDialog = document.getElementById("remove-confirm-dialog");
const removeConfirmMessage = document.getElementById("remove-confirm-message");
const removeConfirmCancel = document.getElementById("remove-confirm-cancel");
const removeConfirmOk = document.getElementById("remove-confirm-ok");

const watchConfirmDialog = document.getElementById("watch-confirm-dialog");
const watchConfirmMessage = document.getElementById("watch-confirm-message");
const watchConfirmCancel = document.getElementById("watch-confirm-cancel");
const watchConfirmOk = document.getElementById("watch-confirm-ok");

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
let reorderModeActive = false;
let detailMovieId = null;
let detailRatingEditorOpen = false;
/** Rating saved when the editor opens; Cancel restores this value. */
let detailRatingEditorSnapshot = null;
let detailListPickerOpen = false;
/** Staged custom-list membership while the detail list editor is open. */
let detailListPickerSelectedIds = new Set();
let pendingRemoveMovieId = null;
let pendingWatchMovieId = null;
let pendingCustomListDeleteId = null;
let tmdbCredential = "";

/** "main" | "customIndex" | "customDetail" */
let appView = "main";
let activeCustomListId = null;

function isCustomListIndexActive() {
  return appView === "customIndex";
}

function isCustomListDetailActive() {
  return appView === "customDetail" && activeCustomListId != null;
}

function isCustomListView() {
  return isCustomListIndexActive() || isCustomListDetailActive();
}

function usesWatchedStyleDisplay() {
  return isWatchedListActive() || isCustomListDetailActive();
}

function getActiveDisplayContext() {
  if (isCustomListDetailActive()) {
    const list = appCustomLists.findCustomList(userState.customLists, activeCustomListId);
    return {
      movieIds: list?.movieIds || [],
      sortable: true,
      searchable: false,
      listKind: "custom",
      listId: activeCustomListId,
      listName: list?.name || "List",
    };
  }
  const list = activeList();
  return {
    movieIds: list?.movieIds || [],
    sortable: isWatchedListActive(),
    searchable: isWatchedListActive(),
    listKind: "preset",
    listId: userState?.activeListId,
    listName: list?.name || "",
  };
}

/* --- Small shared helpers --- */

function activeList() {
  if (!userState) {
    return null;
  }
  return appLists.findList(userState.lists, userState.activeListId);
}

function activeMovieIds() {
  return getActiveDisplayContext().movieIds;
}

function isWatchedListActive() {
  return !isCustomListView() && userState?.activeListId === appLists.WATCHED_ID;
}

function isWatchlistActive() {
  return !isCustomListView() && userState?.activeListId === appLists.WATCHLIST_ID;
}

function usesCustomDisplayOrder() {
  return isWatchlistActive();
}

function displayMovieIds() {
  const ctx = getActiveDisplayContext();
  let ids = ctx.movieIds;
  if (ctx.searchable && typeof hasActiveListSearch === "function" && hasActiveListSearch()) {
    ids = appListSearch.filterMovieIds(ids, getListSearchFilter(), (id) =>
      movieById.get(id) ?? localMovieRecord(id),
    );
  }
  if (ctx.sortable) {
    const sortContext = {
      getRecord: (id) => movieById.get(id) ?? localMovieRecord(id),
      getUserRating: (id) => appRatings.getRating(userState.ratings, id),
      getAddedAt: (id) => appAddedAt.getAddedAt(userState.addedAt, id),
    };
    if (ctx.listKind === "custom") {
      const joinOrder = appSort.buildOrderIndex(ctx.movieIds);
      sortContext.getListJoinIndex = (id) => joinOrder.get(Number(id)) ?? null;
    }
    return appSort.sortMovieIds(ids, userState.preferences.sort, sortContext);
  }
  return ids;
}

function setStatus(element, message, tone) {
  if (!element) {
    return;
  }
  element.textContent = message || "";
  element.classList.toggle("is-ok", tone === "ok");
  element.classList.toggle("is-error", tone === "error");
}

/** Keeps range sliders responsive on touch devices during slow drags. */
function bindRangeSliderLiveInput(slider, onInput) {
  if (!slider) {
    return;
  }
  const emit = () => onInput({ target: slider });
  slider.addEventListener("input", emit);
  slider.addEventListener("change", emit);
  slider.addEventListener("pointerdown", (event) => {
    if (typeof slider.setPointerCapture === "function") {
      slider.setPointerCapture(event.pointerId);
    }
    emit();
  });
  slider.addEventListener("pointermove", (event) => {
    if (
      typeof slider.hasPointerCapture === "function" &&
      !slider.hasPointerCapture(event.pointerId)
    ) {
      return;
    }
    emit();
  });
  const release = (event) => {
    if (
      typeof slider.hasPointerCapture === "function" &&
      slider.hasPointerCapture(event.pointerId)
    ) {
      slider.releasePointerCapture(event.pointerId);
    }
    emit();
  };
  slider.addEventListener("pointerup", release);
  slider.addEventListener("pointercancel", release);
}

function delegateRangeSliderLiveInput(root, sliderId, onInput) {
  if (!root) {
    return;
  }
  const sliderFromEvent = (event) =>
    event.target instanceof HTMLInputElement && event.target.id === sliderId
      ? event.target
      : null;

  root.addEventListener("input", (event) => {
    if (sliderFromEvent(event)) {
      onInput(event);
    }
  });
  root.addEventListener("pointerdown", (event) => {
    const slider = sliderFromEvent(event);
    if (!slider) {
      return;
    }
    if (typeof slider.setPointerCapture === "function") {
      slider.setPointerCapture(event.pointerId);
    }
    onInput(event);
  });
  root.addEventListener("pointermove", (event) => {
    const slider = sliderFromEvent(event);
    if (!slider) {
      return;
    }
    if (
      typeof slider.hasPointerCapture === "function" &&
      !slider.hasPointerCapture(event.pointerId)
    ) {
      return;
    }
    onInput(event);
  });
  const release = (event) => {
    const slider = sliderFromEvent(event);
    if (!slider) {
      return;
    }
    if (
      typeof slider.hasPointerCapture === "function" &&
      slider.hasPointerCapture(event.pointerId)
    ) {
      slider.releasePointerCapture(event.pointerId);
    }
    onInput(event);
  };
  root.addEventListener("pointerup", release);
  root.addEventListener("pointercancel", release);
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

  function buildPersonSearchUrl(query) {
    return buildUrl("/search/person", {
      query: String(query || "").trim(),
      include_adult: "false",
      language: "en-US",
      page: "1",
    });
  }

  function buildPersonMovieCreditsUrl(personId) {
    const id = Number(personId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid person id: ${personId}`);
    }
    return buildUrl(`/person/${id}/movie_credits`, {
      language: "en-US",
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
      .map((entry) => normalizeSearchMovieEntry(entry));
  }

  function normalizeSearchMovieEntry(entry) {
    return {
      id: Number(entry.id),
      title: cleanText(entry.title) || cleanText(entry.original_title) || "Untitled",
      releaseDate: cleanText(entry.release_date),
      posterPath: cleanImagePath(entry.poster_path),
      overview: cleanText(entry.overview),
    };
  }

  function normalizePersonSearchResults(payload) {
    const results = Array.isArray(payload?.results) ? payload.results : [];
    return results
      .filter((entry) => Number.isInteger(Number(entry?.id)))
      .map((entry) => ({
        id: Number(entry.id),
        name: cleanText(entry.name) || "Unknown",
        knownForDepartment: cleanText(entry.known_for_department),
      }));
  }

  const DIRECTOR_SEARCH_CANDIDATE_LIMIT = 2;
  const DIRECTOR_SEARCH_MOVIE_LIMIT = 15;

  function pickDirectorSearchCandidates(persons, options = {}) {
    const directors = persons.filter((person) => person.knownForDepartment === "Directing");
    if (directors.length) {
      return directors.slice(0, DIRECTOR_SEARCH_CANDIDATE_LIMIT);
    }
    if (options.allowAnyPerson) {
      return persons.slice(0, DIRECTOR_SEARCH_CANDIDATE_LIMIT);
    }
    return [];
  }

  function flattenDirectorSearchResults(directorEntries) {
    return mergeMovieSearchResults([], directorEntries);
  }

  function directedMoviesFromPersonCredits(payload) {
    const crew = Array.isArray(payload?.crew) ? payload.crew : [];
    const seen = new Set();
    const movies = [];
    for (const entry of crew) {
      if (entry?.job !== "Director") {
        continue;
      }
      const id = Number(entry?.id);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      movies.push(normalizeSearchMovieEntry(entry));
    }
    movies.sort((left, right) => {
      const leftTime = Date.parse(left.releaseDate || "") || 0;
      const rightTime = Date.parse(right.releaseDate || "") || 0;
      return rightTime - leftTime;
    });
    return movies.slice(0, DIRECTOR_SEARCH_MOVIE_LIMIT);
  }

  /** Title hits first; director filmography fills in movies not already listed. */
  function mergeMovieSearchResults(movieResults, directorEntries) {
    const seen = new Set(movieResults.map((movie) => movie.id));
    const merged = movieResults.map((movie) => ({ ...movie }));
    for (const entry of directorEntries) {
      const personName = entry?.personName;
      const movies = Array.isArray(entry?.movies) ? entry.movies : [];
      for (const movie of movies) {
        if (seen.has(movie.id)) {
          continue;
        }
        seen.add(movie.id);
        merged.push({
          ...movie,
          directorHint: personName || null,
        });
      }
    }
    return merged;
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
    buildPersonSearchUrl,
    buildPersonMovieCreditsUrl,
    buildMovieUrl,
    buildConfigurationUrl,
    isValidImagePath,
    buildImageUrl,
    normalizeSearchResults,
    normalizePersonSearchResults,
    pickDirectorSearchCandidates,
    directedMoviesFromPersonCredits,
    mergeMovieSearchResults,
    flattenDirectorSearchResults,
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

/* ===== Committed data/ snapshot (generated from scripts/lib/local-data.js) ===== */

/* Generated from scripts/lib/local-data.js — run npm run bundle */

const appLocalData = (function () {
  /**
   * The committed movie snapshot under data/.
   *
   * `npm run scrape` writes TMDB's own output for every id in data/my_list.csv,
   * and the app reads it before it considers a network call. That makes load time
   * one static file instead of one request per movie, and it means the collection
   * still renders if the API changes, costs money, or is simply unreachable.
   *
   * The snapshot is a cache, not an edit layer: every field in it came from TMDB
   * and is replaced wholesale on the next scrape. Nothing here is authored.
   *
   * Records are stored in the shape `normalizeMovie` already produces, so the
   * validation below re-checks that shape rather than parsing raw TMDB fields.
   * The file ships with the site, but it still arrives over the network, so it is
   * validated on read like any other payload.
   */

  const LOCAL_DATA_VERSION = 1;
  const LOCAL_DATA_URL = "data/movies.json";
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

  return {
    LOCAL_DATA_VERSION,
    LOCAL_DATA_URL,
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
  };
})();

/* ===== List operations (generated from scripts/lib/lists.js) ===== */

/* Generated from scripts/lib/lists.js — run npm run bundle */

const appLists = (function () {
  /**
   * Two fixed lists, in tab order. There is deliberately no way to create,
   * rename, or delete one: these are statuses, not user-defined collections.
   *
   * One invariant defines how they relate, enforced on read as well as on write:
   *
   *   Watchlist is disjoint from Watched. A movie is either unseen (watchlist)
   *   or seen (watched), never both.
   *
   * `movieIds` carries membership and order in one array. Every function is pure
   * and returns new arrays.
   */

  const WATCHED_ID = "watched";
  const WATCHLIST_ID = "watchlist";
  const LEGACY_FAVOURITES_ID = "favourites";

  const PRESET_LISTS = [
    { id: WATCHED_ID, name: "Watched" },
    { id: WATCHLIST_ID, name: "Watchlist" },
  ];

  const LIST_IDS = PRESET_LISTS.map((preset) => preset.id);
  const DEFAULT_LIST_ID = WATCHED_ID;
  const STATUS_PRIORITY = [WATCHED_ID, WATCHLIST_ID];

  function isListId(listId) {
    return LIST_IDS.includes(listId);
  }

  function isListReorderable(listId) {
    return isListId(listId);
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
   * Rebuilds the two lists from stored data: preset order and names always win,
   * unknown list ids are dropped, and the watchlist/watched invariant is repaired.
   *
   * Legacy payloads with separate favourites and watched lists are merged into
   * watched: former favourites keep their order, then any watched-only ids append.
   */
  function normalizeLists(raw) {
    const stored = Array.isArray(raw) ? raw : [];
    const storedIds = (listId) => {
      const match = stored.find((entry) => entry && entry.id === listId);
      return normalizeMovieIds(match?.movieIds);
    };

    const legacyFavourites = storedIds(LEGACY_FAVOURITES_ID);
    const legacyWatched = storedIds(WATCHED_ID);
    const watched = [...legacyFavourites];
    for (const id of legacyWatched) {
      if (!watched.includes(id)) {
        watched.push(id);
      }
    }

    const seen = new Set(watched);
    const watchlist = storedIds(WATCHLIST_ID).filter((id) => !seen.has(id));

    const byId = {
      [WATCHED_ID]: watched,
      [WATCHLIST_ID]: watchlist,
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

  function primaryListIdForMovie(lists, movieId) {
    const holding = new Set(findListIdsForMovie(lists, movieId));
    for (const listId of STATUS_PRIORITY) {
      if (holding.has(listId)) {
        return listId;
      }
    }
    return null;
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
   * Sets a movie's status. Each target clears the other list so callers never
   * have to reason about the invariant themselves.
   */
  function assignMovieToList(lists, listId, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0 || !isListId(listId)) {
      return lists;
    }

    if (listId === WATCHED_ID) {
      return applyMembership(lists, id, [WATCHED_ID], [WATCHLIST_ID]);
    }
    return applyMembership(lists, id, [WATCHLIST_ID], [WATCHED_ID]);
  }

  function removeMovieFromList(lists, listId, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || !isListId(listId)) {
      return lists;
    }
    return applyMembership(lists, id, [], [listId]);
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

  /** Drops a movie from every list. */
  function removeMovie(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return lists;
    }
    return applyMembership(lists, id, [], LIST_IDS);
  }

  function replaceMovieIds(lists, listId, movieIds) {
    if (!isListReorderable(listId)) {
      return lists;
    }
    const target = findList(lists, listId);
    if (!target || movieIds === target.movieIds) {
      return lists;
    }
    return lists.map((list) =>
      list.id === listId ? { ...list, movieIds: [...movieIds] } : list,
    );
  }

  return {
    WATCHLIST_ID,
    WATCHED_ID,
    PRESET_LISTS,
    LIST_IDS,
    DEFAULT_LIST_ID,
    isListId,
    isListReorderable,
    normalizeMovieIds,
    defaultLists,
    normalizeLists,
    findList,
    findListIdsForMovie,
    primaryListIdForMovie,
    isWatched,
    isOnWatchlist,
    assignMovieToList,
    removeMovieFromList,
    removeMovie,
    replaceMovieIds,
  };
})();

/* ===== Custom lists (generated from scripts/lib/custom-lists.js) ===== */

/* Generated from scripts/lib/custom-lists.js — run npm run bundle */

const appCustomLists = (function () {
  /**
   * User-defined custom lists, separate from Watched/Watchlist preset statuses.
   * A movie may belong to multiple custom lists and optionally to a preset list.
   */

  const MAX_CUSTOM_LISTS = 10;
  const MAX_NAME_LENGTH = 40;
  const MIN_NAME_LENGTH = 1;
  const CUSTOM_ID_PREFIX = "custom-";

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function normalizeStamp(value, fallback) {
    const time = Date.parse(String(value || ""));
    if (Number.isFinite(time)) {
      return new Date(time).toISOString();
    }
    if (fallback) {
      const fallbackTime = Date.parse(String(fallback));
      if (Number.isFinite(fallbackTime)) {
        return new Date(fallbackTime).toISOString();
      }
    }
    return new Date(0).toISOString();
  }

  function normalizeName(name) {
    return String(name || "").trim();
  }

  function nameKey(name) {
    return normalizeName(name).toLowerCase();
  }

  const CUSTOM_LIST_INDEX_SORT_MODES = new Set(["recent", "alphabetical", "size"]);
  const DEFAULT_CUSTOM_LIST_INDEX_SORT = "recent";

  function normalizeCustomListIndexSort(mode) {
    const value = String(mode || "").trim().toLowerCase();
    return CUSTOM_LIST_INDEX_SORT_MODES.has(value)
      ? value
      : DEFAULT_CUSTOM_LIST_INDEX_SORT;
  }

  function compareCustomListsForIndex(a, b, mode) {
    if (mode === "alphabetical") {
      const byName = nameKey(a.name).localeCompare(nameKey(b.name));
      if (byName !== 0) {
        return byName;
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    }
    if (mode === "size") {
      const sizeDiff = b.movieIds.length - a.movieIds.length;
      if (sizeDiff !== 0) {
        return sizeDiff;
      }
      return nameKey(a.name).localeCompare(nameKey(b.name));
    }
    const byRecent = b.updatedAt.localeCompare(a.updatedAt);
    if (byRecent !== 0) {
      return byRecent;
    }
    return nameKey(a.name).localeCompare(nameKey(b.name));
  }

  function sortCustomListsForIndex(customLists, mode) {
    if (!Array.isArray(customLists)) {
      return [];
    }
    const normalizedMode = normalizeCustomListIndexSort(mode);
    return [...customLists].sort((a, b) =>
      compareCustomListsForIndex(a, b, normalizedMode),
    );
  }

  function isCustomListId(id) {
    return typeof id === "string" && id.startsWith(CUSTOM_ID_PREFIX) && id.length > CUSTOM_ID_PREFIX.length;
  }

  function normalizeMovieIds(raw) {
    return getLists().normalizeMovieIds(raw);
  }

  function defaultCustomLists() {
    return [];
  }

  function defaultCustomListTombstones() {
    return {};
  }

  function normalizeCustomList(raw, fallbackStamp) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const id = typeof raw.id === "string" ? raw.id.trim() : "";
    if (!isCustomListId(id)) {
      return null;
    }
    const name = normalizeName(raw.name);
    if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
      return null;
    }
    const stamp = normalizeStamp(raw.updatedAt || raw.createdAt, fallbackStamp);
    return {
      id,
      name,
      movieIds: normalizeMovieIds(raw.movieIds),
      createdAt: normalizeStamp(raw.createdAt, stamp),
      updatedAt: stamp,
    };
  }

  function normalizeCustomLists(raw, fallbackStamp) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seenIds = new Set();
    const seenNames = new Set();
    const out = [];
    for (const entry of raw) {
      const list = normalizeCustomList(entry, fallbackStamp);
      if (!list) {
        continue;
      }
      const key = nameKey(list.name);
      if (seenIds.has(list.id) || seenNames.has(key)) {
        continue;
      }
      seenIds.add(list.id);
      seenNames.add(key);
      out.push(list);
      if (out.length >= MAX_CUSTOM_LISTS) {
        break;
      }
    }
    return out;
  }

  function normalizeCustomListTombstones(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {};
    }
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!isCustomListId(key)) {
        continue;
      }
      const at = normalizeStamp(value);
      if (at) {
        out[key] = at;
      }
    }
    return out;
  }

  function findCustomList(customLists, listId) {
    if (!Array.isArray(customLists) || !isCustomListId(listId)) {
      return null;
    }
    return customLists.find((list) => list.id === listId) || null;
  }

  function customListsForMovie(customLists, movieId) {
    const id = Number(movieId);
    if (!Array.isArray(customLists) || !Number.isInteger(id)) {
      return [];
    }
    return customLists.filter((list) => list.movieIds.includes(id));
  }

  function isDuplicateName(customLists, name, excludeId) {
    const key = nameKey(name);
    if (!key) {
      return true;
    }
    return customLists.some(
      (list) => list.id !== excludeId && nameKey(list.name) === key,
    );
  }

  function createCustomListId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${CUSTOM_ID_PREFIX}${crypto.randomUUID()}`;
    }
    const hex = () =>
      Math.floor(Math.random() * 0xffffffff)
        .toString(16)
        .padStart(8, "0");
    return `${CUSTOM_ID_PREFIX}${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
  }

  function createCustomList(customLists, name, now = new Date()) {
    const lists = Array.isArray(customLists) ? customLists : [];
    const trimmed = normalizeName(name);
    if (
      lists.length >= MAX_CUSTOM_LISTS ||
      trimmed.length < MIN_NAME_LENGTH ||
      trimmed.length > MAX_NAME_LENGTH ||
      isDuplicateName(lists, trimmed)
    ) {
      return lists;
    }
    const stamp = now.toISOString();
    return [
      ...lists,
      {
        id: createCustomListId(),
        name: trimmed,
        movieIds: [],
        createdAt: stamp,
        updatedAt: stamp,
      },
    ];
  }

  function renameCustomList(customLists, listId, name, now = new Date()) {
    const trimmed = normalizeName(name);
    if (
      !isCustomListId(listId) ||
      trimmed.length < MIN_NAME_LENGTH ||
      trimmed.length > MAX_NAME_LENGTH ||
      isDuplicateName(customLists, trimmed, listId)
    ) {
      return customLists;
    }
    const stamp = now.toISOString();
    return customLists.map((list) =>
      list.id === listId ? { ...list, name: trimmed, updatedAt: stamp } : list,
    );
  }

  function deleteCustomList(customLists, tombstones, listId, now = new Date()) {
    if (!isCustomListId(listId)) {
      return { customLists, tombstones };
    }
    const stamp = now.toISOString();
    return {
      customLists: customLists.filter((list) => list.id !== listId),
      tombstones: {
        ...(tombstones && typeof tombstones === "object" ? tombstones : {}),
        [listId]: stamp,
      },
    };
  }

  function addMovieToCustomList(customLists, listId, movieId, now = new Date()) {
    const id = Number(movieId);
    if (!isCustomListId(listId) || !Number.isInteger(id) || id <= 0) {
      return customLists;
    }
    const stamp = now.toISOString();
    return customLists.map((list) => {
      if (list.id !== listId || list.movieIds.includes(id)) {
        return list;
      }
      return {
        ...list,
        movieIds: [...list.movieIds, id],
        updatedAt: stamp,
      };
    });
  }

  function removeMovieFromCustomList(customLists, listId, movieId, now = new Date()) {
    const id = Number(movieId);
    if (!isCustomListId(listId) || !Number.isInteger(id)) {
      return customLists;
    }
    const stamp = now.toISOString();
    return customLists.map((list) => {
      if (list.id !== listId || !list.movieIds.includes(id)) {
        return list;
      }
      return {
        ...list,
        movieIds: list.movieIds.filter((entry) => entry !== id),
        updatedAt: stamp,
      };
    });
  }

  function replaceCustomListMovieIds(customLists, listId, movieIds, now = new Date()) {
    if (!isCustomListId(listId)) {
      return customLists;
    }
    const stamp = now.toISOString();
    const normalized = normalizeMovieIds(movieIds);
    return customLists.map((list) =>
      list.id === listId ? { ...list, movieIds: normalized, updatedAt: stamp } : list,
    );
  }

  return {
    MAX_CUSTOM_LISTS,
    MAX_NAME_LENGTH,
    MIN_NAME_LENGTH,
    CUSTOM_ID_PREFIX,
    isCustomListId,
    normalizeName,
    CUSTOM_LIST_INDEX_SORT_MODES,
    DEFAULT_CUSTOM_LIST_INDEX_SORT,
    normalizeCustomListIndexSort,
    sortCustomListsForIndex,
    defaultCustomLists,
    defaultCustomListTombstones,
    normalizeCustomList,
    normalizeCustomLists,
    normalizeCustomListTombstones,
    findCustomList,
    customListsForMovie,
    isDuplicateName,
    createCustomListId,
    createCustomList,
    renameCustomList,
    deleteCustomList,
    addMovieToCustomList,
    removeMovieFromCustomList,
    replaceCustomListMovieIds,
  };
})();

/* ===== Scrape list CSV (generated from scripts/lib/list-csv.js) ===== */

/* Generated from scripts/lib/list-csv.js — run npm run bundle */

const appListCsv = (function () {
  /**
   * The CSV that carries a list of ids from the browser to the scraper.
   *
   * The browser is the only place that knows the collection, and the scraper runs
   * on a machine that cannot read localStorage or the Gist. Settings exports this
   * file, you commit it, and `npm run scrape` reads it back. Both ends share these
   * functions so the format has exactly one definition.
   *
   * Only `tmdb_id` is load-bearing. `title` and `list` exist so the committed file
   * is readable in a diff; the scraper ignores them.
   */

  const CSV_HEADER = ["tmdb_id", "title", "list"];
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
   * Watched first, then watchlist, each in stored order. Removal records live only
   * in `statuses` and never in `movieIds`, so they are excluded for free.
   */
  function listCsvRows(state, titleFor) {
    const lists = Array.isArray(state?.lists) ? state.lists : [];
    const resolveTitle = typeof titleFor === "function" ? titleFor : () => "";
    const rows = [];
    for (const listId of getLists().LIST_IDS) {
      const list = lists.find((entry) => entry && entry.id === listId);
      for (const movieId of list?.movieIds || []) {
        const id = Number(movieId);
        if (!Number.isInteger(id) || id <= 0) {
          continue;
        }
        rows.push({ id, title: String(resolveTitle(id) || ""), listId });
      }
    }
    return rows;
  }

  function buildListCsv(rows) {
    const lines = [csvRow(CSV_HEADER)];
    for (const row of rows || []) {
      lines.push(csvRow([row.id, row.title, row.listId]));
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

  return {
    CSV_HEADER,
    CSV_FILENAME,
    listCsvRows,
    buildListCsv,
    parseListCsv,
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

  /** Value shown in mobile rating dropdowns; unrated uses the slider default (7). */
  function ratingSelectDisplayValue(rating) {
    const normalized = normalizeRating(rating);
    if (normalized != null) {
      return formatUserRating(normalized);
    }
    return formatUserRating(ratingFromSliderValue(DEFAULT_SLIDER_VALUE));
  }

  /** `<option>` markup for mobile rating dropdowns (10–1 in 0.1 steps, high to low). */
  function ratingSelectInnerHtml(selectedRating, options) {
    const includeUnrated = options?.includeUnrated === true;
    const selected = normalizeRating(selectedRating);
    let html = "";
    if (includeUnrated) {
      html += `<option value=""${selected == null ? " selected" : ""}>—</option>`;
    }
    const displayValue =
      selected != null ? formatUserRating(selected) : ratingSelectDisplayValue(null);
    for (let step = SLIDER_MAX; step >= SLIDER_MIN; step--) {
      const rating = MIN_RATING + step / 10;
      const label = formatUserRating(rating);
      const isSelected = selected != null ? label === formatUserRating(selected) : !includeUnrated && label === displayValue;
      html += `<option value="${label}"${isSelected ? " selected" : ""}>${label}</option>`;
    }
    return html;
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

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function collectWatchedMovieIds(lists) {
    const { WATCHED_ID, findList } = getLists();
    const ids = new Set();
    const watched = findList(lists, WATCHED_ID);
    if (!watched || !Array.isArray(watched.movieIds)) {
      return ids;
    }
    for (const id of watched.movieIds) {
      const movieId = Number(id);
      if (Number.isInteger(movieId) && movieId > 0) {
        ids.add(movieId);
      }
    }
    return ids;
  }

  function collectRateableMovieIds(lists, customLists) {
    const ids = collectWatchedMovieIds(lists);
    if (!Array.isArray(customLists)) {
      return ids;
    }
    for (const list of customLists) {
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

  function isRatingAllowed(lists, movieId, customLists) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return false;
    }
    return collectRateableMovieIds(lists, customLists).has(id);
  }

  function normalizeRatings(raw, lists, customLists) {
    const allowed = collectRateableMovieIds(lists, customLists);
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
    ratingSelectDisplayValue,
    ratingSelectInnerHtml,
    isRatingAllowed,
    normalizeRatings,
    getRating,
    setRating,
    removeRating,
  };
})();

/* ===== Date added stamps (generated from scripts/lib/added-at.js) ===== */

/* Generated from scripts/lib/added-at.js — run npm run bundle */

const appAddedAt = (function () {
  /**
   * When each movie first entered the collection. Stored beside ratings in user
   * state, never in TMDB records or the data/ snapshot.
   *
   * Set once on add, cleared on remove, and stamped again when a removed movie is
   * re-added. Moving watchlist → watched does not touch it. Sync merges by keeping
   * the later stamp so a re-add beats a stale pre-delete copy left on another device.
   *
   * Legacy payloads with no per-movie stamp are backfilled from list order: the
   * last movie in the list is treated as added today, each earlier one one day
   * before. A collection where every stamp is identical — the old "all today"
   * migration — is repaired the same way on the next normalize.
   */

  const MS_PER_DAY = 86_400_000;

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function parseStamp(value) {
    const time = Date.parse(value || "");
    return Number.isFinite(time) ? time : null;
  }

  function normalizeStamp(value) {
    const time = parseStamp(value);
    return time == null ? null : new Date(time).toISOString();
  }

  /** Watched first, then watchlist, each in stored order — same as list export. */
  function orderedMovieIds(lists) {
    const ids = [];
    const seen = new Set();
    for (const listId of getLists().LIST_IDS) {
      const list = Array.isArray(lists) ? lists.find((entry) => entry?.id === listId) : null;
      for (const movieId of list?.movieIds || []) {
        const id = Number(movieId);
        if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
          continue;
        }
        seen.add(id);
        ids.push(id);
      }
    }
    return ids;
  }

  function stampFromListIndex(index, total, now) {
    const endMs = parseStamp(normalizeStamp(now));
    const daysAgo = Math.max(0, total - 1 - index);
    return new Date(endMs - daysAgo * MS_PER_DAY).toISOString();
  }

  /** When every movie shares one stamp, spread them by list order so sort works. */
  function repairUniformAddedAt(next, ordered, now) {
    if (ordered.length < 2) {
      return next;
    }
    const stamps = ordered.map((id) => next[String(id)]).filter(Boolean);
    if (stamps.length < 2 || new Set(stamps).size !== 1) {
      return next;
    }
    const repaired = {};
    for (let index = 0; index < ordered.length; index++) {
      repaired[String(ordered[index])] = stampFromListIndex(index, ordered.length, now);
    }
    return repaired;
  }

  function normalizeAddedAt(raw, lists, now = new Date()) {
    const ordered = orderedMovieIds(lists);
    const rawMap = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const next = {};

    for (let index = 0; index < ordered.length; index++) {
      const id = ordered[index];
      const key = String(id);
      const fromRaw = normalizeStamp(rawMap[key]);
      next[key] = fromRaw || stampFromListIndex(index, ordered.length, now);
    }

    return repairUniformAddedAt(next, ordered, now);
  }

  function getAddedAt(addedAt, movieId) {
    const id = Number(movieId);
    if (!addedAt || typeof addedAt !== "object" || !Number.isInteger(id) || id <= 0) {
      return null;
    }
    return normalizeStamp(addedAt[String(id)]);
  }

  /** Overwrites only when the stamp actually changes. */
  function setAddedAt(addedAt, movieId, at) {
    const id = Number(movieId);
    const stamp = normalizeStamp(at);
    if (!Number.isInteger(id) || id <= 0 || !stamp) {
      return addedAt || {};
    }

    const base =
      addedAt && typeof addedAt === "object" && !Array.isArray(addedAt) ? addedAt : {};
    const key = String(id);
    if (getAddedAt(base, id) === stamp) {
      return base;
    }
    return { ...base, [key]: stamp };
  }

  /** First add only, unless `readded` — then always stamp again. */
  function recordAddedAt(addedAt, movieId, at = new Date(), options = {}) {
    if (!options.readded && getAddedAt(addedAt, movieId)) {
      return addedAt || {};
    }
    return setAddedAt(addedAt, movieId, at);
  }

  function removeAddedAt(addedAt, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return addedAt || {};
    }
    const base =
      addedAt && typeof addedAt === "object" && !Array.isArray(addedAt) ? addedAt : {};
    const key = String(id);
    if (!(key in base)) {
      return base;
    }
    const next = { ...base };
    delete next[key];
    return next;
  }

  /** Later stamp wins so a re-add after removal beats a stale pre-delete copy. */
  function mergeAddedAt(a, b) {
    const left = a && typeof a === "object" && !Array.isArray(a) ? a : {};
    const right = b && typeof b === "object" && !Array.isArray(b) ? b : {};
    const merged = {};

    for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
      const leftStamp = normalizeStamp(left[key]);
      const rightStamp = normalizeStamp(right[key]);
      if (leftStamp == null) {
        merged[key] = right[key];
        continue;
      }
      if (rightStamp == null) {
        merged[key] = left[key];
        continue;
      }
      merged[key] = leftStamp >= rightStamp ? left[key] : right[key];
    }
    return merged;
  }

  return {
    normalizeStamp,
    normalizeAddedAt,
    getAddedAt,
    setAddedAt,
    recordAddedAt,
    removeAddedAt,
    mergeAddedAt,
  };
})();

/* ===== Watched list display sort (generated from scripts/lib/sort.js) ===== */

/* Generated from scripts/lib/sort.js — run npm run bundle */

const appSort = (function () {
  /**
   * Display-only sort for the Watched list. Stored `movieIds` order is untouched;
   * Watchlist always uses stored order (drag reorder). Watched never uses custom sort.
   */

  const SORT_MODES = new Set([
    "custom",
    "added-asc",
    "added-desc",
    "year-asc",
    "year-desc",
    "rating-desc",
    "rating-asc",
    "user-rating-desc",
    "user-rating-asc",
    "title-asc",
    "title-desc",
  ]);

  const DEFAULT_SORT = "custom";
  const DEFAULT_PREFERENCE_SORT = "user-rating-desc";
  const MISSING_SORT_HINT = "—";

  const SORT_FIELDS = new Set(["added", "year", "rating", "user-rating", "title"]);

  const SORT_FIELD_DEFAULTS = {
    added: "added-desc",
    year: "year-desc",
    rating: "rating-desc",
    "user-rating": "user-rating-desc",
    title: "title-desc",
  };

  const SORT_FIELD_LABELS = {
    "user-rating": "My Rating",
    added: "Date Added",
    year: "Release Year",
    rating: "Fan Rating",
    title: "Title",
  };

  const SORT_FIELD_LABELS_SHORT = {
    "user-rating": "My Rating",
    added: "Added",
    year: "Year",
    rating: "Fan Rating",
    title: "Title",
  };

  function getSortFieldLabel(field, short = false) {
    const labels = short ? SORT_FIELD_LABELS_SHORT : SORT_FIELD_LABELS;
    return labels[field] || SORT_FIELD_LABELS.title;
  }

  function getSortField(mode) {
    const normalized = normalizeSort(mode);
    if (normalized === "custom") {
      return "custom";
    }
    if (normalized.startsWith("added-")) {
      return "added";
    }
    if (normalized.startsWith("year-")) {
      return "year";
    }
    if (normalized.startsWith("user-rating-")) {
      return "user-rating";
    }
    if (normalized.startsWith("rating-")) {
      return "rating";
    }
    if (normalized.startsWith("title-")) {
      return "title";
    }
    return "custom";
  }

  function isSortDescending(mode) {
    const normalized = normalizeSort(mode);
    return normalized.endsWith("-desc");
  }

  function toggleSortDirection(mode) {
    const normalized = normalizeSort(mode);
    if (normalized === "custom") {
      return normalized;
    }
    if (normalized.endsWith("-asc")) {
      return normalized.replace(/-asc$/, "-desc");
    }
    if (normalized.endsWith("-desc")) {
      return normalized.replace(/-desc$/, "-asc");
    }
    return normalized;
  }

  function sortModeForField(field, currentMode) {
    if (!field || !SORT_FIELDS.has(field)) {
      return DEFAULT_PREFERENCE_SORT;
    }
    const normalized = normalizeSort(currentMode);
    if (getSortField(normalized) === field) {
      return normalized;
    }
    return SORT_FIELD_DEFAULTS[field] || DEFAULT_PREFERENCE_SORT;
  }

  /** Watched preferences never keep custom; watchlist ignores sort entirely. */
  function normalizeWatchedSort(raw, fallback = DEFAULT_PREFERENCE_SORT) {
    const normalized = normalizeSort(raw, fallback);
    if (normalized === DEFAULT_SORT) {
      return fallback;
    }
    return normalized;
  }

  /** Human label for the active sort direction (toolbar state). */
  function sortDirectionLabel(field, descending) {
    switch (field) {
      case "added":
        return descending ? "Newest first" : "Oldest first";
      case "year":
        return descending ? "Newest first" : "Oldest first";
      case "rating":
        return descending ? "Highest first" : "Lowest first";
      case "user-rating":
        return descending ? "Highest first" : "Lowest first";
      case "title":
        return descending ? "Z to A" : "A to Z";
      default:
        return descending ? "Descending" : "Ascending";
    }
  }

  function formatFanRating(voteAverage) {
    const value = Number(voteAverage);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return value.toFixed(1);
  }

  function formatUserRatingHint(userRating) {
    if (userRating == null || userRating === "") {
      return null;
    }
    const value = Number(userRating);
    if (!Number.isFinite(value)) {
      return null;
    }
    if (Number.isInteger(value)) {
      return String(value);
    }
    return value.toFixed(1);
  }

  function normalizeSort(raw, fallback = DEFAULT_SORT) {
    if (raw && SORT_MODES.has(raw)) {
      return raw;
    }
    return fallback;
  }

  function isCustomSort(mode) {
    return normalizeSort(mode) === DEFAULT_SORT;
  }

  function parseYear(releaseDate) {
    if (!releaseDate) {
      return null;
    }
    const match = String(releaseDate).match(/\d{4}/);
    return match ? match[0] : null;
  }

  function parseAddedTime(iso) {
    const time = Date.parse(iso || "");
    return Number.isFinite(time) ? time : null;
  }

  /** Card hint: ISO calendar date from an addedAt stamp. */
  function formatAddedHint(iso) {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(iso || "").trim());
    return match ? match[1] : null;
  }

  function buildOrderIndex(movieIds) {
    return new Map(movieIds.map((id, index) => [Number(id), index]));
  }

  function compareOrderTiebreak(a, b, orderIndex) {
    const indexA = orderIndex.has(a) ? orderIndex.get(a) : a;
    const indexB = orderIndex.has(b) ? orderIndex.get(b) : b;
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    return a - b;
  }

  function compareNullableNumber(a, b, direction, tiebreak) {
    const aMissing = a == null;
    const bMissing = b == null;
    if (aMissing && bMissing) {
      return tiebreak();
    }
    if (aMissing) {
      return 1;
    }
    if (bMissing) {
      return -1;
    }
    if (a !== b) {
      return direction === "asc" ? a - b : b - a;
    }
    return tiebreak();
  }

  function compareYear(a, b, direction, orderIndex, getRecord) {
    const yearA = parseYear(getRecord(a)?.releaseDate);
    const yearB = parseYear(getRecord(b)?.releaseDate);
    if (yearA == null && yearB == null) {
      return compareOrderTiebreak(a, b, orderIndex);
    }
    if (yearA == null) {
      return 1;
    }
    if (yearB == null) {
      return -1;
    }
    if (yearA !== yearB) {
      return direction === "asc" ? yearA.localeCompare(yearB) : yearB.localeCompare(yearA);
    }
    return compareOrderTiebreak(a, b, orderIndex);
  }

  function sortMovieIds(movieIds, mode, context = {}) {
    const normalized = normalizeSort(mode);
    if (normalized === DEFAULT_SORT) {
      return [...movieIds];
    }

    const orderIndex = buildOrderIndex(movieIds);
    const getRecord = typeof context.getRecord === "function" ? context.getRecord : () => null;
    const getUserRating =
      typeof context.getUserRating === "function" ? context.getUserRating : () => null;
    const getAddedAt =
      typeof context.getAddedAt === "function" ? context.getAddedAt : () => null;
    const getListJoinIndex =
      typeof context.getListJoinIndex === "function" ? context.getListJoinIndex : null;
    const tiebreak = (a, b) => compareOrderTiebreak(a, b, orderIndex);
    const copy = [...movieIds];

    if (normalized === "added-asc" || normalized === "added-desc") {
      const direction = normalized === "added-asc" ? "asc" : "desc";
      if (getListJoinIndex) {
        return copy.sort((a, b) =>
          compareNullableNumber(getListJoinIndex(a), getListJoinIndex(b), direction, () =>
            tiebreak(a, b),
          ),
        );
      }
      return copy.sort((a, b) =>
        compareNullableNumber(
          parseAddedTime(getAddedAt(a)),
          parseAddedTime(getAddedAt(b)),
          direction,
          () => tiebreak(a, b),
        ),
      );
    }

    if (normalized === "title-asc" || normalized === "title-desc") {
      return copy.sort((a, b) => {
        const cmp = (getRecord(a)?.title || "").localeCompare(getRecord(b)?.title || "");
        if (cmp !== 0) {
          return normalized === "title-asc" ? cmp : -cmp;
        }
        return tiebreak(a, b);
      });
    }

    if (normalized === "year-asc" || normalized === "year-desc") {
      const direction = normalized === "year-asc" ? "asc" : "desc";
      return copy.sort((a, b) => compareYear(a, b, direction, orderIndex, getRecord));
    }

    if (normalized === "rating-asc" || normalized === "rating-desc") {
      const direction = normalized === "rating-asc" ? "asc" : "desc";
      return copy.sort((a, b) =>
        compareNullableNumber(
          getRecord(a)?.voteAverage,
          getRecord(b)?.voteAverage,
          direction,
          () => tiebreak(a, b),
        ),
      );
    }

    if (normalized === "user-rating-asc" || normalized === "user-rating-desc") {
      const direction = normalized === "user-rating-asc" ? "asc" : "desc";
      return copy.sort((a, b) =>
        compareNullableNumber(
          getUserRating(a),
          getUserRating(b),
          direction,
          () => tiebreak(a, b),
        ),
      );
    }

    return copy;
  }

  /** Short label for small-card view when Watched is sorted (not custom order). */
  function formatSortCardHint(mode, context = {}) {
    const normalized = normalizeSort(mode);
    if (normalized === DEFAULT_SORT) {
      return null;
    }

    const record = context.record;
    if (!record) {
      return null;
    }

    if (normalized === "year-asc" || normalized === "year-desc") {
      return parseYear(record.releaseDate) || MISSING_SORT_HINT;
    }

    if (normalized === "added-asc" || normalized === "added-desc") {
      return formatAddedHint(context.addedAt) || MISSING_SORT_HINT;
    }

    if (normalized === "rating-asc" || normalized === "rating-desc") {
      return formatFanRating(record.voteAverage) || MISSING_SORT_HINT;
    }

    if (normalized === "user-rating-asc" || normalized === "user-rating-desc") {
      return formatUserRatingHint(context.userRating) || MISSING_SORT_HINT;
    }

    if (normalized === "title-asc" || normalized === "title-desc") {
      const title = String(record.title || "").trim();
      return title || MISSING_SORT_HINT;
    }

    return null;
  }

  return {
    SORT_MODES,
    SORT_FIELDS,
    SORT_FIELD_DEFAULTS,
    DEFAULT_SORT,
    DEFAULT_PREFERENCE_SORT,
    normalizeSort,
    normalizeWatchedSort,
    isCustomSort,
    getSortField,
    isSortDescending,
    toggleSortDirection,
    sortModeForField,
    sortDirectionLabel,
    getSortFieldLabel,
    parseYear,
    buildOrderIndex,
    compareOrderTiebreak,
    sortMovieIds,
    formatSortCardHint,
  };
})();

/* ===== Sync merge and tombstones (generated from scripts/lib/sync-merge.js) ===== */

/* Generated from scripts/lib/sync-merge.js — run npm run bundle */

const appSyncMerge = (function () {
  /**
   * Merge for multi-tab and multi-device sync.
   *
   * Every tab holds its own in-memory copy, so a blind "newest payload wins" push
   * lets a tab that has been open for an hour replace everything another tab
   * added. Merging fixes that, but merging on list membership alone cannot work:
   * an id missing from one side is either a movie that side deleted or one it
   * never heard of, and those look identical.
   *
   * So removal is recorded rather than inferred. Every movie carries a status —
   * `watched`, `watchlist`, or `removed` — stamped with the time it last changed,
   * and merging compares those per-movie stamps. Deletion becomes a positive
   * fact, which is what makes it survive a stale tab without needing to track
   * what each copy has already seen.
   *
   * `movieIds` still holds membership and order for everything the UI touches.
   * Removed ids live only in this map, so nothing renders them and TMDB is never
   * asked about them.
   */

  const REMOVED_STATUS = "removed";
  /** Unknown history sorts oldest, so any real stamp beats a backfilled one. */
  const EPOCH_ISO = "1970-01-01T00:00:00.000Z";
  /** Bounds the payload: removal records are the only entries that accumulate. */
  const REMOVED_LIMIT = 500;

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function getAddedAt() {
    if (typeof appAddedAt !== "undefined") {
      return appAddedAt;
    }
    if (typeof require === "function") {
      return require("./added-at");
    }
    throw new Error("appAddedAt is not available");
  }

  function getCustomListMerge() {
    if (typeof appCustomListMerge !== "undefined") {
      return appCustomListMerge;
    }
    if (typeof require === "function") {
      return require("./custom-list-merge");
    }
    throw new Error("appCustomListMerge is not available");
  }

  function parseStamp(value) {
    const time = Date.parse(value || "");
    return Number.isFinite(time) ? time : null;
  }

  function normalizeStamp(value) {
    const time = parseStamp(value);
    return time == null ? null : new Date(time).toISOString();
  }

  /** Returns whichever ISO stamp is later, preferring the one that parses. */
  function newerStamp(a, b) {
    const aTime = parseStamp(a);
    const bTime = parseStamp(b);
    if (aTime == null) {
      return bTime == null ? null : b;
    }
    if (bTime == null) {
      return a;
    }
    return bTime > aTime ? b : a;
  }

  function isStatus(value) {
    return value === REMOVED_STATUS || getLists().isListId(value);
  }

  function statusEntry(status, at) {
    return { status, at };
  }

  function statusOf(statuses, movieId) {
    return statuses?.[String(movieId)]?.status || null;
  }

  function isRemoved(statuses, movieId) {
    return statusOf(statuses, movieId) === REMOVED_STATUS;
  }

  /**
   * Rebuilds the map against the lists, which stay authoritative for membership
   * while the app is running: an id in a list gets that list's status, an id in no
   * list keeps a removal record, and anything else is dropped. Dropping is safe
   * because a missing entry means "no opinion", and merge keeps the movie.
   */
  function normalizeStatuses(raw, lists, fallbackStamp) {
    const listsLib = getLists();
    const fallback = normalizeStamp(fallbackStamp) || EPOCH_ISO;

    const stored = new Map();
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [key, value] of Object.entries(raw)) {
        const id = Number(key);
        if (!Number.isInteger(id) || id <= 0 || !isStatus(value?.status)) {
          continue;
        }
        stored.set(
          id,
          statusEntry(value.status, normalizeStamp(value?.at) || fallback),
        );
      }
    }

    const next = {};
    const inList = new Set();
    for (const listId of listsLib.LIST_IDS) {
      const list = listsLib.findList(lists, listId);
      for (const entry of list?.movieIds || []) {
        const id = Number(entry);
        if (!Number.isInteger(id) || id <= 0) {
          continue;
        }
        inList.add(id);
        const existing = stored.get(id);
        // A stored status that disagrees with membership is out of date, so the
        // stamp is refreshed too: keeping the old one would let another copy's
        // removal outrank a movie that is demonstrably back in a list.
        const at = existing && existing.status === listId ? existing.at : fallback;
        next[String(id)] = statusEntry(listId, at);
      }
    }

    const removals = [];
    for (const [id, entry] of stored) {
      if (!inList.has(id) && entry.status === REMOVED_STATUS) {
        removals.push([id, entry]);
      }
    }
    removals.sort((a, b) => Date.parse(b[1].at) - Date.parse(a[1].at));
    for (const [id, entry] of removals.slice(0, REMOVED_LIMIT)) {
      next[String(id)] = entry;
    }

    return next;
  }

  function setMovieStatus(statuses, movieId, status, now = new Date()) {
    const id = Number(movieId);
    const base = statuses && typeof statuses === "object" ? statuses : {};
    if (!Number.isInteger(id) || id <= 0 || !isStatus(status)) {
      return base;
    }
    return {
      ...base,
      [String(id)]: statusEntry(status, now.toISOString()),
    };
  }

  /**
   * Per-movie last write wins. A tie keeps the movie rather than the removal,
   * because losing a film is the only outcome here that cannot be undone by hand.
   */
  function mergeStatuses(a, b) {
    const left = a && typeof a === "object" ? a : {};
    const right = b && typeof b === "object" ? b : {};
    const merged = {};

    for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
      const leftEntry = left[key];
      const rightEntry = right[key];
      if (!leftEntry || !rightEntry) {
        merged[key] = leftEntry || rightEntry;
        continue;
      }
      const leftTime = parseStamp(leftEntry.at);
      const rightTime = parseStamp(rightEntry.at);
      if (rightTime != null && (leftTime == null || rightTime > leftTime)) {
        merged[key] = rightEntry;
      } else if (leftTime != null && (rightTime == null || leftTime > rightTime)) {
        merged[key] = leftEntry;
      } else {
        merged[key] = leftEntry.status === REMOVED_STATUS ? rightEntry : leftEntry;
      }
    }

    return merged;
  }

  function idsFor(state, listId) {
    const list = getLists().findList(state?.lists, listId);
    return Array.isArray(list?.movieIds) ? list.movieIds.map(Number) : [];
  }

  /**
   * Membership comes from the merged statuses; the old arrays only supply order,
   * newer side first. A movie that changed lists is positioned by wherever it
   * already appeared, which is why every array is offered as a hint.
   */
  function orderedIdsForStatus(statuses, listId, orderHints) {
    const wanted = new Set();
    for (const [key, entry] of Object.entries(statuses)) {
      if (entry.status === listId) {
        wanted.add(Number(key));
      }
    }

    const ordered = [];
    const placed = new Set();
    for (const hint of orderHints) {
      for (const id of hint) {
        if (wanted.has(id) && !placed.has(id)) {
          placed.add(id);
          ordered.push(id);
        }
      }
    }
    for (const id of wanted) {
      if (!placed.has(id)) {
        placed.add(id);
        ordered.push(id);
      }
    }
    return ordered;
  }

  /**
   * Combines two payloads. The result is raw: callers run it through
   * normalizeUserState to re-apply the list invariants.
   */
  function mergeUserStates(a, b) {
    if (!a) {
      return b || null;
    }
    if (!b) {
      return a;
    }

    const lists = getLists();
    const aTime = parseStamp(a.updatedAt);
    const bTime = parseStamp(b.updatedAt);
    // Ties and missing stamps keep `a` primary, so the local copy is never
    // demoted by a payload that cannot prove it is newer. This decides display
    // order and preferences only; membership is settled per movie.
    const bWins = bTime != null && (aTime == null || bTime > aTime);
    const primary = bWins ? b : a;
    const secondary = bWins ? a : b;

    // Derived per side rather than trusted: a payload written before statuses
    // existed has none, and reading membership straight from an empty map would
    // merge both lists down to nothing. Backfill stamps come from each side's own
    // `updatedAt`, never from now, or a stale tab would look freshly edited.
    const statuses = mergeStatuses(
      normalizeStatuses(a.statuses, a.lists, a.updatedAt),
      normalizeStatuses(b.statuses, b.lists, b.updatedAt),
    );
    const orderHints = [
      ...lists.LIST_IDS.map((listId) => idsFor(primary, listId)),
      ...lists.LIST_IDS.map((listId) => idsFor(secondary, listId)),
    ];

    const customListState = getCustomListMerge().mergeCustomListState(a, b);

    return {
      ...primary,
      updatedAt: newerStamp(a.updatedAt, b.updatedAt),
      lists: lists.LIST_IDS.map((listId) => ({
        id: listId,
        movieIds: orderedIdsForStatus(statuses, listId, orderHints),
      })),
      ratings: {
        ...(secondary.ratings && typeof secondary.ratings === "object" ? secondary.ratings : {}),
        ...(primary.ratings && typeof primary.ratings === "object" ? primary.ratings : {}),
      },
      addedAt: getAddedAt().mergeAddedAt(
        secondary.addedAt && typeof secondary.addedAt === "object" ? secondary.addedAt : {},
        primary.addedAt && typeof primary.addedAt === "object" ? primary.addedAt : {},
      ),
      statuses,
      customLists: customListState.customLists,
      customListTombstones: customListState.customListTombstones,
    };
  }

  return {
    REMOVED_STATUS,
    REMOVED_LIMIT,
    EPOCH_ISO,
    newerStamp,
    statusOf,
    isRemoved,
    normalizeStatuses,
    setMovieStatus,
    mergeStatuses,
    mergeUserStates,
  };
})();

/* ===== Custom list Gist merge (generated from scripts/lib/custom-list-merge.js) ===== */

/* Generated from scripts/lib/custom-list-merge.js — run npm run bundle */

const appCustomListMerge = (function () {
  /**
   * Gist merge for custom lists: per-list last-write-wins on updatedAt, with
   * tombstones for deleted lists.
   */

  function getCustomLists() {
    if (typeof appCustomLists !== "undefined") {
      return appCustomLists;
    }
    if (typeof require === "function") {
      return require("./custom-lists");
    }
    throw new Error("appCustomLists is not available");
  }

  function getSyncMerge() {
    if (typeof appSyncMerge !== "undefined") {
      return appSyncMerge;
    }
    if (typeof require === "function") {
      return require("./sync-merge");
    }
    throw new Error("appSyncMerge is not available");
  }

  function parseStamp(value) {
    const time = Date.parse(String(value || ""));
    return Number.isFinite(time) ? time : null;
  }

  function listIsDeleted(list, tombstones) {
    const deletedAt = parseStamp(tombstones?.[list.id]);
    const updatedAt = parseStamp(list.updatedAt);
    if (deletedAt == null) {
      return false;
    }
    if (updatedAt == null) {
      return true;
    }
    return deletedAt >= updatedAt;
  }

  function mergeCustomListTombstones(a, b) {
    const left = getCustomLists().normalizeCustomListTombstones(a);
    const right = getCustomLists().normalizeCustomListTombstones(b);
    const merged = { ...left };
    for (const [id, at] of Object.entries(right)) {
      merged[id] = getSyncMerge().newerStamp(merged[id], at) || at;
    }
    return merged;
  }

  function pickListWinner(left, right) {
    const leftTime = parseStamp(left?.updatedAt);
    const rightTime = parseStamp(right?.updatedAt);
    if (rightTime != null && (leftTime == null || rightTime > leftTime)) {
      return right;
    }
    return left;
  }

  function mergeCustomLists(aLists, bLists, tombstones) {
    const customLists = getCustomLists();
    const left = customLists.normalizeCustomLists(aLists);
    const right = customLists.normalizeCustomLists(bLists);
    const byId = new Map();

    for (const list of [...left, ...right]) {
      const existing = byId.get(list.id);
      byId.set(list.id, existing ? pickListWinner(existing, list) : list);
    }

    const merged = [];
    for (const list of byId.values()) {
      if (listIsDeleted(list, tombstones)) {
        continue;
      }
      merged.push(list);
    }

    merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return merged.slice(0, customLists.MAX_CUSTOM_LISTS);
  }

  function mergeCustomListState(a, b) {
    const tombstones = mergeCustomListTombstones(
      a?.customListTombstones,
      b?.customListTombstones,
    );
    const customLists = mergeCustomLists(a?.customLists, b?.customLists, tombstones);
    return { customLists, customListTombstones: tombstones };
  }

  return {
    mergeCustomListTombstones,
    mergeCustomLists,
    mergeCustomListState,
    listIsDeleted,
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
  /** Payload from just before the last merge, so a bad merge stays recoverable. */
  const USER_STATE_BACKUP_KEY = "moviecollector-user-state-backup";
  const GIST_SYNC_KEY = "moviecollector-gist-sync";
  const TMDB_AUTH_KEY = "moviecollector-tmdb-auth";
  const HOSTED_SESSION_KEY = "moviecollector-hosted-session";
  const USER_STATE_VERSION = 3;

  const VIEW_MODES = new Set(["cards", "detail"]);
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

  function getAddedAt() {
    if (typeof appAddedAt !== "undefined") {
      return appAddedAt;
    }
    if (typeof require === "function") {
      return require("./added-at");
    }
    throw new Error("appAddedAt is not available");
  }

  function getSort() {
    if (typeof appSort !== "undefined") {
      return appSort;
    }
    if (typeof require === "function") {
      return require("./sort");
    }
    throw new Error("appSort is not available");
  }

  function getSyncMerge() {
    if (typeof appSyncMerge !== "undefined") {
      return appSyncMerge;
    }
    if (typeof require === "function") {
      return require("./sync-merge");
    }
    throw new Error("appSyncMerge is not available");
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

  function defaultPreferences() {
    return { viewMode: "cards", sort: getSort().DEFAULT_PREFERENCE_SORT };
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
      addedAt: {},
      statuses: {},
      customLists: getCustomLists().defaultCustomLists(),
      customListTombstones: getCustomLists().defaultCustomListTombstones(),
    };
  }

  function normalizePreferences(raw) {
    const base = defaultPreferences();
    if (!raw || typeof raw !== "object") {
      return base;
    }
    let viewMode = raw.viewMode;
    if (viewMode === "list") {
      viewMode = "cards";
    }
    return {
      viewMode: VIEW_MODES.has(viewMode) ? viewMode : base.viewMode,
      sort: getSort().normalizeWatchedSort(raw.sort, base.sort),
    };
  }

  function normalizeUserState(raw) {
    const lists = getLists();
    const base = defaultUserState();
    if (!raw || typeof raw !== "object") {
      return base;
    }

    const normalizedLists = lists.normalizeLists(raw.lists);

    let activeListId = raw.activeListId;
    if (activeListId === "favourites") {
      activeListId = lists.WATCHED_ID;
    }

    const statuses = getSyncMerge().normalizeStatuses(
      raw.statuses,
      normalizedLists,
      raw.updatedAt,
    );

    const customListsLib = getCustomLists();
    const customLists = customListsLib.normalizeCustomLists(
      raw.customLists,
      raw.updatedAt,
    );
    const customListTombstones = customListsLib.normalizeCustomListTombstones(
      raw.customListTombstones,
    );

    return {
      version: USER_STATE_VERSION,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
      storageMode: STORAGE_MODES.has(raw.storageMode) ? raw.storageMode : "local",
      lists: normalizedLists,
      activeListId: lists.isListId(activeListId)
        ? activeListId
        : lists.DEFAULT_LIST_ID,
      preferences: normalizePreferences(raw.preferences),
      ratings: getRatings().normalizeRatings(raw.ratings, normalizedLists, customLists),
      addedAt: getAddedAt().normalizeAddedAt(raw.addedAt, normalizedLists),
      statuses,
      customLists,
      customListTombstones,
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

  /** Map key order follows insertion, so sort it or the fingerprint is unstable. */
  function sortedIdMap(map) {
    const out = {};
    for (const key of Object.keys(map || {}).sort((a, b) => Number(a) - Number(b))) {
      out[key] = map[key];
    }
    return out;
  }

  function sortedStringMap(map) {
    const out = {};
    for (const key of Object.keys(map || {}).sort()) {
      out[key] = map[key];
    }
    return out;
  }

  /**
   * Fingerprint of everything except `updatedAt`. Sync compares these to tell a
   * real edit from a re-stamp, which is what stops two tabs from pushing
   * identical payloads back and forth forever.
   */
  function userStateSignature(state) {
    const normalized = normalizeUserState(state);
    return JSON.stringify({
      storageMode: normalized.storageMode,
      activeListId: normalized.activeListId,
      preferences: normalized.preferences,
      lists: normalized.lists.map((list) => [list.id, list.movieIds]),
      ratings: sortedIdMap(normalized.ratings),
      addedAt: sortedIdMap(normalized.addedAt),
      statuses: sortedIdMap(normalized.statuses),
      customLists: normalized.customLists.map((list) => [
        list.id,
        list.name,
        list.movieIds,
        list.updatedAt,
      ]),
      customListTombstones: sortedStringMap(normalized.customListTombstones),
    });
  }

  return {
    USER_STATE_KEY,
    USER_STATE_BACKUP_KEY,
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
    userStateSignature,
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

  function getSyncMerge() {
    if (typeof appSyncMerge !== "undefined") {
      return appSyncMerge;
    }
    if (typeof require === "function") {
      return require("./sync-merge");
    }
    throw new Error("appSyncMerge is not available");
  }

  function parseGistSyncConfig(json) {
    if (json == null || json === "") {
      return null;
    }
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      const token = typeof parsed.token === "string" ? parsed.token.trim() : "";
      const gistId = typeof parsed.gistId === "string" ? parsed.gistId.trim() : "";
      const backupGistId =
        typeof parsed.backupGistId === "string" ? parsed.backupGistId.trim() : "";
      if (!token) {
        return null;
      }
      return { token, gistId, backupGistId };
    } catch (_) {
      return null;
    }
  }

  function serializeGistSyncConfig(config) {
    return JSON.stringify({
      token: config.token,
      gistId: config.gistId || "",
      backupGistId: config.backupGistId || "",
    });
  }

  function isConnectedGistConfig(config) {
    return Boolean(config?.token && config?.gistId);
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
   * second device at the same account picks up the lists already there. The two
   * sides are merged rather than swapped, so movies added on this device before
   * connecting are not dropped on the way in.
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
      return {
        ok: true,
        action: "adopt",
        gistId,
        nextState: getSyncMerge().mergeUserStates(remoteState, localState),
      };
    }

    return { ok: true, action: "create", gistId: "", nextState: localState };
  }

  return {
    GIST_STATE_FILENAME,
    GITHUB_API,
    parseGistSyncConfig,
    serializeGistSyncConfig,
    isConnectedGistConfig,
    extractStateJsonFromGistResponse,
    findCollectorGistId,
    buildGistCreatePayload,
    buildGistUpdatePayload,
    resolveGistConnectState,
  };
})();

/* ===== GitHub Gist snapshot backups (generated from scripts/lib/gist-backup.js) ===== */

/* Generated from scripts/lib/gist-backup.js — run npm run bundle */

const appGistBackup = (function () {
  /**
   * Gist snapshot backups: one private gist, one JSON file, up to five immutable
   * state entries appended over time. The file is rewritten on each append, but
   * existing snapshot objects in the array are copied forward unchanged.
   */

  const BACKUP_GIST_DESCRIPTION = "Movie collector backups";
  const BACKUP_FILENAME = "moviecollector-backups.json";
  const BACKUP_PAYLOAD_VERSION = 1;
  const MAX_SNAPSHOTS = 5;
  const SNAPSHOT_INTERVAL_MS = 20 * 60 * 1000;

  function emptyBackupPayload() {
    return { version: BACKUP_PAYLOAD_VERSION, snapshots: [] };
  }

  function normalizeAtStamp(value) {
    const time = Date.parse(String(value || ""));
    if (!Number.isFinite(time)) {
      return null;
    }
    return new Date(time).toISOString();
  }

  function normalizeSnapshotEntry(entry) {
    if (!entry || typeof entry !== "object") {
      return null;
    }
    const at = normalizeAtStamp(entry.at);
    const state = entry.state;
    if (!at || !state || typeof state !== "object") {
      return null;
    }
    return { at, state };
  }

  function parseBackupPayload(json) {
    if (json == null || json === "") {
      return emptyBackupPayload();
    }
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      if (!parsed || typeof parsed !== "object") {
        return emptyBackupPayload();
      }
      const snapshots = Array.isArray(parsed.snapshots)
        ? parsed.snapshots.map(normalizeSnapshotEntry).filter(Boolean)
        : [];
      snapshots.sort((a, b) => a.at.localeCompare(b.at));
      return {
        version: BACKUP_PAYLOAD_VERSION,
        snapshots,
      };
    } catch (_) {
      return emptyBackupPayload();
    }
  }

  function serializeBackupPayload(payload) {
    const snapshots = Array.isArray(payload?.snapshots)
      ? payload.snapshots.map(normalizeSnapshotEntry).filter(Boolean)
      : [];
    snapshots.sort((a, b) => a.at.localeCompare(b.at));
    return JSON.stringify(
      {
        version: BACKUP_PAYLOAD_VERSION,
        snapshots,
      },
      null,
      2,
    );
  }

  function snapshotListEntries(payload) {
    return (payload?.snapshots || []).map((entry) => ({ at: entry.at }));
  }

  function shouldCreateSnapshot(snapshots, nowMs, intervalMs = SNAPSHOT_INTERVAL_MS) {
    if (!snapshots?.length) {
      return true;
    }
    const latestAt = Date.parse(snapshots[snapshots.length - 1]?.at || "");
    if (!Number.isFinite(latestAt)) {
      return true;
    }
    return nowMs - latestAt >= intervalMs;
  }

  function appendSnapshot(payload, state, at, maxSnapshots = MAX_SNAPSHOTS) {
    const atIso = normalizeAtStamp(at);
    if (!atIso || !state || typeof state !== "object") {
      return payload || emptyBackupPayload();
    }
    const previous = (payload?.snapshots || [])
      .map(normalizeSnapshotEntry)
      .filter(Boolean);
    const next = [...previous, { at: atIso, state }];
    const trimmed =
      next.length > maxSnapshots ? next.slice(next.length - maxSnapshots) : next;
    return {
      version: BACKUP_PAYLOAD_VERSION,
      snapshots: trimmed,
    };
  }

  function findSnapshotByAt(payload, at) {
    const needle = normalizeAtStamp(at);
    if (!needle) {
      return null;
    }
    return (payload?.snapshots || []).find((entry) => entry.at === needle) || null;
  }

  function findBackupGistId(gists, syncGistId) {
    if (!Array.isArray(gists)) {
      return null;
    }
    let byDescription = null;
    for (const gist of gists) {
      if (!gist?.id || gist.id === syncGistId) {
        continue;
      }
      const files = gist.files || {};
      if (files[BACKUP_FILENAME]) {
        return gist.id;
      }
      if (gist.description === BACKUP_GIST_DESCRIPTION && !byDescription) {
        byDescription = gist.id;
      }
    }
    return byDescription;
  }

  function buildBackupGistCreatePayload(contentJson) {
    return {
      description: BACKUP_GIST_DESCRIPTION,
      public: false,
      files: { [BACKUP_FILENAME]: { content: contentJson } },
    };
  }

  function buildBackupGistUpdatePayload(contentJson) {
    return {
      files: { [BACKUP_FILENAME]: { content: contentJson } },
    };
  }

  function extractBackupContent(body) {
    if (!body?.files || typeof body.files !== "object") {
      return null;
    }
    const content = body.files[BACKUP_FILENAME]?.content;
    return typeof content === "string" ? content : null;
  }

  return {
    BACKUP_GIST_DESCRIPTION,
    BACKUP_FILENAME,
    BACKUP_PAYLOAD_VERSION,
    MAX_SNAPSHOTS,
    SNAPSHOT_INTERVAL_MS,
    emptyBackupPayload,
    parseBackupPayload,
    serializeBackupPayload,
    snapshotListEntries,
    shouldCreateSnapshot,
    appendSnapshot,
    findSnapshotByAt,
    findBackupGistId,
    buildBackupGistCreatePayload,
    buildBackupGistUpdatePayload,
    extractBackupContent,
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

/* ===== Watched list metadata search (generated from scripts/lib/list-search.js) ===== */

/* Generated from scripts/lib/list-search.js — run npm run bundle */

const appListSearch = (function () {
  function normalizeLabelKey(label) {
    return String(label || "")
      .trim()
      .toLowerCase();
  }

  function normalizePersonKey(name) {
    return normalizeLabelKey(name);
  }

  function emptyFieldTerms() {
    return { genre: [], actor: [], year: [] };
  }

  function emptySearchFilter() {
    return { fieldTerms: emptyFieldTerms(), textTerms: [] };
  }

  function formatFieldSearchQuery(prefix, label) {
    const text = String(label || "").trim();
    if (!text) {
      return "";
    }
    if (/\s/.test(text)) {
      return `${prefix}:"${text.replace(/"/g, "")}"`;
    }
    return `${prefix}:${text}`;
  }

  function buildFieldTokenRegex(prefix) {
    return new RegExp(`${prefix}:\\s*(?:"([^"]*)"|(\\S+))`, "gi");
  }

  function parseYearTrailingToken(input) {
    const text = String(input || "").trim();
    const digitMatch = text.match(/(?:^|\s)(\d{1,4}s?)$/i);
    if (!digitMatch) {
      return null;
    }
    return {
      partial: digitMatch[1],
      prefix: text.slice(0, digitMatch.index).trim(),
    };
  }

  function isYearFilterDraftPartial(partial) {
    const token = String(partial || "").trim();
    if (!token) {
      return false;
    }
    if (/^\d{4}$/.test(token)) {
      return false;
    }
    if (/^\d{4}s$/i.test(token)) {
      return false;
    }
    return /^\d{1,3}s?$/i.test(token);
  }

  function parseYearDraftInput(input) {
    const text = String(input || "").trim();
    if (!text) {
      return null;
    }

    const prefixEsc = "year".replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const colonMatch = text.match(
      new RegExp(`(?:^|\\s)${prefixEsc}:\\s*(?:"([^"]*)"?|(\\S*))$`, "i"),
    );
    if (colonMatch) {
      const partial = String(colonMatch[1] ?? colonMatch[2] ?? "").trim();
      if (!isYearFilterDraftPartial(partial)) {
        return null;
      }
      return {
        fieldKey: "year",
        partial,
        quoted: /"/.test(colonMatch[0]),
        prefix: text.slice(0, colonMatch.index).trim(),
      };
    }

    const token = parseYearTrailingToken(text);
    if (!token || !isYearFilterDraftPartial(token.partial)) {
      return null;
    }

    return {
      fieldKey: "year",
      partial: token.partial,
      quoted: false,
      prefix: token.prefix,
    };
  }

  function getYearSuggestDraft(input) {
    const filterDraft = parseYearDraftInput(input);
    if (filterDraft) {
      return filterDraft;
    }

    const text = String(input || "").trim();
    const prefixEsc = "year".replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const colonMatch = text.match(
      new RegExp(`(?:^|\\s)${prefixEsc}:\\s*(?:"([^"]*)"?|(\\S*))$`, "i"),
    );
    if (colonMatch) {
      return {
        fieldKey: "year",
        partial: String(colonMatch[1] ?? colonMatch[2] ?? "").trim(),
        quoted: /"/.test(colonMatch[0]),
        prefix: text.slice(0, colonMatch.index).trim(),
      };
    }

    const token = parseYearTrailingToken(text);
    if (!token) {
      return null;
    }

    return {
      fieldKey: "year",
      partial: token.partial,
      quoted: false,
      prefix: token.prefix,
    };
  }

  function parseFieldDraftInput(input, field) {
    if (field.key === "year") {
      return parseYearDraftInput(input);
    }

    const text = String(input || "").trim();
    if (!text) {
      return null;
    }

    const prefix = field.prefix;
    const prefixEsc = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const colonMatch = text.match(
      new RegExp(`(?:^|\\s)${prefixEsc}:\\s*(?:"([^"]*)"?|(\\S*))$`, "i"),
    );
    if (colonMatch) {
      return {
        fieldKey: field.key,
        partial: String(colonMatch[1] ?? colonMatch[2] ?? "").trim(),
        quoted: /"/.test(colonMatch[0]),
        prefix: text.slice(0, colonMatch.index).trim(),
      };
    }

    const shorthandMatch = text.match(
      new RegExp(
        `(?:^|\\s)${prefixEsc}(?:\\s+(?:"([^"]*)"?|(\\S*)))?$`,
        "i",
      ),
    );
    if (shorthandMatch) {
      return {
        fieldKey: field.key,
        partial: String(shorthandMatch[1] ?? shorthandMatch[2] ?? "").trim(),
        quoted: /"/.test(shorthandMatch[0]),
        prefix: text.slice(0, shorthandMatch.index).trim(),
      };
    }

    return null;
  }

  function getFieldByKey(key) {
    return SEARCH_FIELD_TYPES.find((field) => field.key === key) || null;
  }

  function decadeFromYear(year) {
    if (!Number.isFinite(year)) {
      return "";
    }
    const decade = Math.floor(year / 10) * 10;
    return `${decade}s`;
  }

  function movieReleaseYear(movie) {
    if (!movie) {
      return null;
    }
    const match = String(movie.releaseDate || "").match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  }

  function ensureSearchHaystack(movie) {
    if (!movie || movie._searchHaystack) {
      return;
    }
    const year = movieReleaseYear(movie);
    const decade = year != null ? decadeFromYear(year) : "";
    movie._decadeLabel = decade;
    movie._searchHaystack = [
      movie.title,
      ...(Array.isArray(movie.directors) ? movie.directors : []),
      ...(Array.isArray(movie.cast) ? movie.cast : []),
      ...(Array.isArray(movie.genres) ? movie.genres : []),
      movie.releaseDate,
      decade,
      year != null ? String(year) : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  const GENRE_FIELD = {
    key: "genre",
    prefix: "genre",
    suppressTextOnLiteralPrefix: true,
    chipAriaPrefix: "genre",
    labelKey: normalizeLabelKey,
    formatQuery(label) {
      return formatFieldSearchQuery("genre", label);
    },
    formatLabel(raw, knownValues) {
      const needle = this.labelKey(raw);
      if (!needle) {
        return null;
      }
      for (const label of knownValues || []) {
        if (this.labelKey(label) === needle) {
          return String(label).trim();
        }
      }
      return String(raw || "").trim() || null;
    },
    matchMovie(movie, term) {
      if (!term) {
        return true;
      }
      const genres = Array.isArray(movie?.genres) ? movie.genres : [];
      return genres.some((genre) => this.labelKey(genre).includes(term));
    },
    collectValues(movies) {
      const seen = new Set();
      const values = [];
      for (const movie of movies || []) {
        for (const label of Array.isArray(movie?.genres) ? movie.genres : []) {
          const key = this.labelKey(label);
          if (!key || seen.has(key)) {
            continue;
          }
          seen.add(key);
          values.push(String(label).trim());
        }
      }
      return values.sort((a, b) => this.labelKey(a).localeCompare(this.labelKey(b)));
    },
  };

  const ACTOR_FIELD = {
    key: "actor",
    prefix: "actor",
    suppressTextOnLiteralPrefix: false,
    chipAriaPrefix: "actor",
    labelKey: normalizePersonKey,
    formatQuery(label) {
      return formatFieldSearchQuery("actor", label);
    },
    formatLabel(raw, knownValues) {
      const needle = this.labelKey(raw);
      if (!needle) {
        return null;
      }
      for (const label of knownValues || []) {
        if (this.labelKey(label) === needle) {
          return String(label).trim();
        }
      }
      return String(raw || "").trim() || null;
    },
    matchMovie(movie, term) {
      if (!term) {
        return true;
      }
      const cast = Array.isArray(movie?.cast) ? movie.cast : [];
      return cast.some((name) => this.labelKey(name).includes(term));
    },
    collectValues(movies) {
      const seen = new Set();
      const values = [];
      for (const movie of movies || []) {
        for (const label of Array.isArray(movie?.cast) ? movie.cast : []) {
          const key = this.labelKey(label);
          if (!key || seen.has(key)) {
            continue;
          }
          seen.add(key);
          values.push(String(label).trim());
        }
      }
      return values.sort((a, b) => this.labelKey(a).localeCompare(this.labelKey(b)));
    },
  };

  function yearSortKey(label) {
    const match = String(label || "")
      .trim()
      .match(/^(\d{4})/);
    return match ? parseInt(match[1], 10) : 0;
  }

  const YEAR_FIELD = {
    key: "year",
    prefix: "year",
    suppressTextOnLiteralPrefix: false,
    chipAriaPrefix: "year",
    labelKey: normalizeLabelKey,
    formatQuery(label) {
      return formatFieldSearchQuery("year", label);
    },
    formatLabel(raw, knownValues) {
      const needle = this.labelKey(raw);
      if (!needle) {
        return null;
      }
      for (const label of knownValues || []) {
        if (this.labelKey(label) === needle) {
          return String(label).trim();
        }
      }
      return null;
    },
    matchesSuggestion(partial, label) {
      const needle = this.labelKey(partial);
      if (!needle) {
        return true;
      }
      return this.labelKey(label).startsWith(needle);
    },
    matchMovie(movie, term) {
      if (!term) {
        return true;
      }
      ensureSearchHaystack(movie);
      return this.labelKey(movie._decadeLabel) === term;
    },
    collectValues(movies) {
      const seen = new Set();
      const values = [];
      for (const movie of movies || []) {
        ensureSearchHaystack(movie);
        const label = String(movie._decadeLabel || "").trim();
        if (!label) {
          continue;
        }
        const key = this.labelKey(label);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        values.push(label);
      }
      return values.sort((a, b) => yearSortKey(a) - yearSortKey(b));
    },
  };

  function decadeStartYear(label) {
    const match = String(label || "")
      .trim()
      .match(/^(\d{4})s$/i);
    return match ? parseInt(match[1], 10) : null;
  }

  function yearInDecade(year, decadeLabel) {
    const start = decadeStartYear(decadeLabel);
    if (start == null || !Number.isFinite(year)) {
      return false;
    }
    return year >= start && year <= start + 9;
  }

  function movieMatchesYearTerm(movie, term) {
    ensureSearchHaystack(movie);
    const normalizedTerm = normalizeLabelKey(term);
    if (!normalizedTerm) {
      return true;
    }
    if (YEAR_FIELD.labelKey(movie._decadeLabel) === normalizedTerm) {
      return true;
    }
    const year = movieReleaseYear(movie);
    return year != null && yearInDecade(year, term);
  }

  function splitYearDecadeTextTerms(textTerms) {
    const decadeTermsFromText = [];
    const yearTerms = [];
    const otherTextTerms = [];
    for (const term of textTerms || []) {
      if (/^\d{4}s$/i.test(term)) {
        decadeTermsFromText.push(normalizeLabelKey(term));
      } else if (/^\d{4}$/.test(term)) {
        yearTerms.push(parseInt(term, 10));
      } else {
        otherTextTerms.push(term);
      }
    }
    return { decadeTermsFromText, yearTerms, otherTextTerms };
  }

  function dedupeLowerTerms(terms) {
    const seen = new Set();
    const out = [];
    for (const term of terms) {
      const key = normalizeLabelKey(term);
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      out.push(key);
    }
    return out;
  }

  function buildYearDecadeCriteria(yearFieldTerms, textTerms) {
    const { decadeTermsFromText, yearTerms, otherTextTerms } =
      splitYearDecadeTextTerms(textTerms);
    const decades = dedupeLowerTerms([
      ...(yearFieldTerms || []),
      ...decadeTermsFromText,
    ]);
    const years = yearTerms.filter(
      (year) => !decades.some((decade) => yearInDecade(year, decade)),
    );
    return { decades, years, otherTextTerms };
  }

  function movieMatchesYearDecadeCriteria(movie, criteria) {
    const { decades, years } = criteria;
    if (decades.length === 0 && years.length === 0) {
      return true;
    }
    if (decades.some((term) => movieMatchesYearTerm(movie, term))) {
      return true;
    }
    const movieYear = movieReleaseYear(movie);
    if (movieYear != null && years.some((year) => movieYear === year)) {
      return true;
    }
    return false;
  }

  const SEARCH_FIELD_TYPES = [GENRE_FIELD, ACTOR_FIELD, YEAR_FIELD];

  function getActiveDraftField(draftQuery) {
    const text = String(draftQuery || "").trim();
    if (!text) {
      return null;
    }

    let active = null;
    for (const field of SEARCH_FIELD_TYPES) {
      const draft = parseFieldDraftInput(text, field);
      if (draft) {
        active = field;
      }
    }
    return active;
  }

  function isFieldLiteralPrefixPending(draftQuery, field) {
    if (!field.suppressTextOnLiteralPrefix) {
      return false;
    }
    const text = String(draftQuery || "").trim();
    if (!text) {
      return false;
    }
    const lower = text.toLowerCase();
    const literal = field.prefix.toLowerCase();
    if (lower.length <= literal.length && literal.startsWith(lower)) {
      return true;
    }
    return false;
  }

  function isSearchDraftBlockingText(draftQuery) {
    for (const field of SEARCH_FIELD_TYPES) {
      if (isFieldLiteralPrefixPending(draftQuery, field)) {
        return true;
      }
    }
    return false;
  }

  function parseCompoundSearchQuery(query) {
    let remainder = String(query || "");
    const fieldTerms = emptyFieldTerms();

    for (const field of SEARCH_FIELD_TYPES) {
      const tokenRe = buildFieldTokenRegex(field.prefix);
      remainder = remainder.replace(tokenRe, (_, quoted, unquoted) => {
        const term = String(quoted ?? unquoted ?? "")
          .trim()
          .toLowerCase();
        if (term) {
          fieldTerms[field.key].push(term);
        }
        return " ";
      });
    }

    const textTerms = remainder
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => term.toLowerCase());

    return { fieldTerms, textTerms };
  }

  function mergeFieldTermsFromChips(chips, parsedFieldTerms) {
    const fieldTerms = emptyFieldTerms();
    const seen = {
      genre: new Set(),
      actor: new Set(),
      year: new Set(),
    };

    for (const chip of chips || []) {
      const field = getFieldByKey(chip?.type);
      if (!field) {
        continue;
      }
      const label = field.formatLabel(chip.label, [chip.label]);
      const term = field.labelKey(label);
      if (!term || seen[field.key].has(term)) {
        continue;
      }
      seen[field.key].add(term);
      fieldTerms[field.key].push(term);
    }

    for (const field of SEARCH_FIELD_TYPES) {
      for (const term of parsedFieldTerms[field.key] || []) {
        if (!seen[field.key].has(term)) {
          seen[field.key].add(term);
          fieldTerms[field.key].push(term);
        }
      }
    }

    return fieldTerms;
  }

  function buildSearchFilter(chips, draftQuery) {
    const trimmed = String(draftQuery || "").trim();
    const activeDraftField = getActiveDraftField(trimmed);
    let parsed;

    if (activeDraftField) {
      const draft = parseFieldDraftInput(trimmed, activeDraftField);
      parsed = draft?.prefix
        ? parseCompoundSearchQuery(draft.prefix)
        : emptySearchFilter();
    } else if (isSearchDraftBlockingText(trimmed)) {
      parsed = emptySearchFilter();
    } else {
      parsed = parseCompoundSearchQuery(trimmed);
    }

    return {
      fieldTerms: mergeFieldTermsFromChips(chips, parsed.fieldTerms),
      textTerms: parsed.textTerms,
    };
  }

  function resolveKnownFieldLabel(term, field, knownValues) {
    const needle = field.labelKey(term);
    if (!needle) {
      return null;
    }
    for (const label of knownValues || []) {
      if (field.labelKey(label) === needle) {
        return String(label).trim();
      }
    }
    if (field.key === "year" || field.key === "actor") {
      const matches = (knownValues || []).filter((label) => {
        if (field.matchesSuggestion) {
          return field.matchesSuggestion.call(field, needle, label);
        }
        return field.labelKey(label).includes(needle);
      });
      if (matches.length === 1) {
        return String(matches[0]).trim();
      }
    }
    return null;
  }

  function absorbFieldDraftInput(input, field, knownValues) {
    if (field.key === "year") {
      return null;
    }

    const draft = parseFieldDraftInput(input, field);
    if (!draft) {
      return null;
    }
    const prefix = draft.prefix || "";
    if (!draft.partial) {
      return { fieldKey: field.key, chipLabel: null, remainder: prefix };
    }
    const chipLabel = resolveKnownFieldLabel(draft.partial, field, knownValues);
    if (chipLabel) {
      return { fieldKey: field.key, chipLabel, remainder: prefix };
    }
    return {
      fieldKey: field.key,
      chipLabel: null,
      remainder: prefix
        ? `${prefix} ${field.formatQuery(draft.partial)}`
        : field.formatQuery(draft.partial),
    };
  }

  function filterFieldSuggestions(partial, field, knownValues, options = {}) {
    const { exclude = [], limit } = options;
    const needle = String(partial || "").trim().toLowerCase();
    const excluded = new Set((exclude || []).map((label) => field.labelKey(label)));

    const matches = (knownValues || [])
      .filter((label) => !excluded.has(field.labelKey(label)))
      .filter((label) => {
        if (!needle) {
          return true;
        }
        if (field.matchesSuggestion) {
          return field.matchesSuggestion.call(field, needle, label);
        }
        return field.labelKey(label).includes(needle);
      });

    return typeof limit === "number" ? matches.slice(0, limit) : matches;
  }

  function normalizeSearchFilter(filter) {
    if (!filter) {
      return emptySearchFilter();
    }
    if (filter.fieldTerms) {
      return {
        fieldTerms: {
          genre: [...(filter.fieldTerms.genre || [])],
          actor: [...(filter.fieldTerms.actor || [])],
          year: [...(filter.fieldTerms.year || [])],
        },
        textTerms: [...(filter.textTerms || [])],
      };
    }
    return emptySearchFilter();
  }

  function hasAnyFilterTerms(filter) {
    const normalized = normalizeSearchFilter(filter);
    if (normalized.textTerms.length > 0) {
      return true;
    }
    return SEARCH_FIELD_TYPES.some(
      (field) => (normalized.fieldTerms[field.key] || []).length > 0,
    );
  }

  function matchesCompoundSearch(movie, filter) {
    const { fieldTerms, textTerms } = normalizeSearchFilter(filter);
    const yearDecadeCriteria = buildYearDecadeCriteria(fieldTerms.year, textTerms);

    for (const field of SEARCH_FIELD_TYPES) {
      if (field.key === "year") {
        continue;
      }
      for (const term of fieldTerms[field.key] || []) {
        if (!field.matchMovie(movie, term)) {
          return false;
        }
      }
    }

    if (
      yearDecadeCriteria.decades.length > 0 ||
      yearDecadeCriteria.years.length > 0
    ) {
      if (!movieMatchesYearDecadeCriteria(movie, yearDecadeCriteria)) {
        return false;
      }
    }

    ensureSearchHaystack(movie);
    const haystack = movie._searchHaystack || "";
    for (const term of yearDecadeCriteria.otherTextTerms) {
      if (!haystack.includes(term)) {
        return false;
      }
    }
    return true;
  }

  function filterMoviesMatchingFieldTerms(movies, fieldTermsPartial) {
    const partial = normalizeSearchFilter({
      fieldTerms: fieldTermsPartial,
      textTerms: [],
    });
    return (movies || []).filter((movie) => matchesCompoundSearch(movie, partial));
  }

  function chipsToFieldTermsPartial(chips, excludeFieldKey) {
    const partial = emptyFieldTerms();
    for (const chip of chips || []) {
      if (chip.type === excludeFieldKey) {
        continue;
      }
      const field = getFieldByKey(chip.type);
      if (!field) {
        continue;
      }
      const label = field.formatLabel(chip.label, [chip.label]);
      const term = field.labelKey(label);
      if (term) {
        partial[chip.type].push(term);
      }
    }
    return partial;
  }

  function filterMovieIds(ids, filter, getRecord) {
    if (!hasAnyFilterTerms(filter)) {
      return ids;
    }
    return (ids || []).filter((id) => {
      const movie = getRecord(id);
      if (!movie) {
        return true;
      }
      return matchesCompoundSearch(movie, filter);
    });
  }

  return {
    SEARCH_FIELD_TYPES,
    normalizeLabelKey,
    emptyFieldTerms,
    emptySearchFilter,
    getFieldByKey,
    parseYearTrailingToken,
    parseYearDraftInput,
    getYearSuggestDraft,
    parseFieldDraftInput,
    getActiveDraftField,
    isFieldLiteralPrefixPending,
    isSearchDraftBlockingText,
    parseCompoundSearchQuery,
    buildSearchFilter,
    absorbFieldDraftInput,
    resolveKnownFieldLabel,
    filterFieldSuggestions,
    normalizeSearchFilter,
    hasAnyFilterTerms,
    decadeFromYear,
    movieReleaseYear,
    ensureSearchHaystack,
    movieMatchesYearTerm,
    buildYearDecadeCriteria,
    movieMatchesYearDecadeCriteria,
    matchesCompoundSearch,
    filterMoviesMatchingFieldTerms,
    chipsToFieldTermsPartial,
    filterMovieIds,
    formatFieldSearchQuery,
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

/** `updatedAt` of the Gist payload this tab last saw, for staleness reporting. */
let lastRemoteUpdatedAt = null;

/** Serializes every Gist read/write pair; see queueGistSync(). */
let gistSyncChain = Promise.resolve();

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

/** Snapshot taken before any merge replaces state, so a bad merge is undoable. */
function backupUserState(state) {
  if (!state) {
    return;
  }
  writeStorage(
    appUserState.USER_STATE_BACKUP_KEY,
    appUserState.serializeUserState(state),
  );
}

function gistSyncEnabled() {
  return (
    userState.storageMode === "gist" &&
    appGistSync.isConnectedGistConfig(gistConfig)
  );
}

function persistUserState(options = {}) {
  userState = appUserState.touchUserState(userState);
  writeUserStateToStorage();
  if (options.sync !== false && gistSyncEnabled()) {
    queueGistSync({ push: true });
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
  if (
    rating != null &&
    !appRatings.isRatingAllowed(userState.lists, movieId, userState.customLists)
  ) {
    return false;
  }
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
  userState = {
    ...userState,
    lists: nextLists,
    ratings: appRatings.normalizeRatings(
      userState.ratings,
      nextLists,
      userState.customLists,
    ),
  };
  return true;
}

/**
 * Stamps what just happened to one movie. Sync merges on these per-movie
 * records, so every membership change has to pass through here or a stale copy
 * will out-vote it.
 */
function recordMovieStatus(movieId, status) {
  userState = {
    ...userState,
    statuses: appSyncMerge.setMovieStatus(userState.statuses, movieId, status),
  };
}

/** First add only; a removed movie being added again always gets a fresh stamp. */
function recordAddedAt(movieId, at) {
  const readded = appSyncMerge.isRemoved(userState.statuses, movieId);
  const next = appAddedAt.recordAddedAt(userState.addedAt, movieId, at, { readded });
  if (next === userState.addedAt) {
    return;
  }
  userState = { ...userState, addedAt: next };
}

function updateAddedAt(nextAddedAt) {
  if (nextAddedAt === userState.addedAt) {
    return false;
  }
  userState = { ...userState, addedAt: nextAddedAt };
  return true;
}

const VIEW_MODE_CYCLE = ["cards", "detail"];

const VIEW_MODE_LABELS = {
  cards: "Card view",
  detail: "Detail view",
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
  viewModeCycleBtn.hidden = isWatchlistActive();
  if (isWatchlistActive()) {
    return;
  }
  viewModeCycleBtn.dataset.viewMode = gridViewMode;
  viewModeCycleBtn.setAttribute("aria-label", VIEW_MODE_LABELS[gridViewMode]);
}

function refreshViewModeForActiveList() {
  if (isWatchlistActive()) {
    gridViewMode = "detail";
  } else {
    gridViewMode = userState.preferences.viewMode;
  }
  document.body.classList.toggle("view-mode-cards", gridViewMode === "cards");
  document.body.classList.toggle("view-mode-detail", gridViewMode === "detail");
  syncViewModeButton();
}

function setViewMode(mode) {
  if (isWatchlistActive()) {
    refreshViewModeForActiveList();
    return;
  }
  gridViewMode = appUserState.normalizePreferences({ viewMode: mode }).viewMode;
  userState = {
    ...userState,
    preferences: { ...userState.preferences, viewMode: gridViewMode },
  };
  document.body.classList.toggle("view-mode-cards", gridViewMode === "cards");
  document.body.classList.toggle("view-mode-detail", gridViewMode === "detail");
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
      const error = new Error(`GitHub request failed (${response.status})`);
      error.status = response.status;
      throw error;
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

/** Adopts a merged payload locally, keeping the previous one as a backup. */
function adoptMergedState(merged) {
  backupUserState(userState);
  userState = { ...merged, storageMode: "gist" };
  gridViewMode = userState.preferences.viewMode;
  writeUserStateToStorage();
}

function mergeIntoUserState(incoming) {
  return appUserState.normalizeUserState(
    appSyncMerge.mergeUserStates(userState, incoming),
  );
}

/**
 * Reads the Gist, merges, and only then writes. The read is the whole point: a
 * blind PATCH from a tab that has been open a while replaces whatever another
 * tab has since added, and because the stale copy carries a fresh `updatedAt`,
 * every later pull believes it. Merging first means a stale tab contributes its
 * change instead of overwriting the payload.
 */
async function reconcileWithGist(options = {}) {
  if (!appGistSync.isConnectedGistConfig(gistConfig)) {
    return { ok: false, reason: "disconnected" };
  }

  const body = await gistRequest(`/gists/${gistConfig.gistId}`, {
    token: gistConfig.token,
  });
  const remoteState = remoteStateFromGistBody(body);

  const localSignature = appUserState.userStateSignature(userState);
  const merged = mergeIntoUserState(remoteState);
  const mergedSignature = appUserState.userStateSignature(merged);
  const remoteSignature = remoteState
    ? appUserState.userStateSignature(remoteState)
    : null;

  const localChanged = mergedSignature !== localSignature;
  if (localChanged) {
    adoptMergedState(merged);
  }

  lastRemoteUpdatedAt = remoteState?.updatedAt || null;

  if (options.push || mergedSignature !== remoteSignature) {
    userState = appUserState.touchUserState(userState);
    writeUserStateToStorage();
    await gistRequest(`/gists/${gistConfig.gistId}`, {
      method: "PATCH",
      token: gistConfig.token,
      body: appGistSync.buildGistUpdatePayload(
        appUserState.serializeUserState(userState),
      ),
    });
    lastRemoteUpdatedAt = userState.updatedAt;
  }

  return { ok: true, localChanged };
}

function formatSyncTime(value) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) {
    return "just now";
  }
  return new Date(time).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Every sync runs through one chain. Two overlapping GET/PATCH pairs would let
 * the second PATCH carry a payload built before the first one landed, which is
 * the same lost update the read-before-write is there to prevent.
 */
function queueGistSync(options = {}) {
  gistSyncChain = gistSyncChain
    .then(() => reconcileWithGist(options))
    .then(async (result) => {
      if (!result?.ok) {
        return;
      }
      if (result.localChanged) {
        onRemoteStateAdopted();
      }
      setStatus(
        gistStatus,
        `Synced with GitHub at ${formatSyncTime(userState.updatedAt)}.`,
        "ok",
      );
      try {
        await maybeCreateGistSnapshot();
      } catch (_) {
        /* Backup failures must not block live sync or overwrite snapshots. */
      }
    })
    .catch(() => {
      // Never fall back to a blind write: keeping the change local and retrying
      // later is always safer than overwriting a payload we could not read.
      setStatus(
        gistStatus,
        "Could not reach GitHub. Changes are saved on this device and will sync later.",
        "error",
      );
    });
  return gistSyncChain;
}

/**
 * Another tab wrote to localStorage. Merging it in stops this tab from sitting
 * on a stale list, which is what made a background tab dangerous before.
 */
function onUserStateStorageEvent(event) {
  if (event.key !== appUserState.USER_STATE_KEY || !event.newValue) {
    return;
  }
  const incoming = appUserState.parseUserState(event.newValue);
  if (!incoming) {
    return;
  }
  const merged = mergeIntoUserState(incoming);
  if (
    appUserState.userStateSignature(merged) ===
    appUserState.userStateSignature(userState)
  ) {
    return;
  }
  adoptMergedState(merged);
  onRemoteStateAdopted();
}

/** A tab coming back to the foreground is the most likely one to be stale. */
function onVisibilityRefresh() {
  if (document.visibilityState === "visible" && gistSyncEnabled()) {
    queueGistSync();
  }
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

    const backupGistId = appGistBackup.findBackupGistId(gists, nextGistId) || "";
    saveGistConfig({ token: trimmed, gistId: nextGistId, backupGistId });
    backupUserState(userState);
    userState = {
      ...appUserState.normalizeUserState(resolved.nextState),
      storageMode: "gist",
    };
    gridViewMode = userState.preferences.viewMode;
    writeUserStateToStorage();
    queueGistSync();
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

/* --- Gist snapshot backups (write-only, separate gist) --- */

let backupSnapshotChain = Promise.resolve();

function clearStoredBackupGistId() {
  if (!gistConfig?.backupGistId) {
    return;
  }
  saveGistConfig({ ...gistConfig, backupGistId: "" });
}

async function resolveBackupGistId() {
  if (!gistConfig?.token) {
    return null;
  }
  if (gistConfig.backupGistId) {
    return gistConfig.backupGistId;
  }
  const gists = await gistRequest("/gists", { token: gistConfig.token });
  const backupGistId = appGistBackup.findBackupGistId(gists, gistConfig.gistId);
  if (backupGistId) {
    saveGistConfig({ ...gistConfig, backupGistId });
  }
  return backupGistId || null;
}

async function fetchBackupGistBody(backupGistId) {
  try {
    return await gistRequest(`/gists/${backupGistId}`, {
      token: gistConfig.token,
    });
  } catch (error) {
    if (error?.status === 404) {
      clearStoredBackupGistId();
      return null;
    }
    throw error;
  }
}

async function readBackupPayload(backupGistId) {
  const body = await fetchBackupGistBody(backupGistId);
  if (!body) {
    return appGistBackup.emptyBackupPayload();
  }
  const content = appGistBackup.extractBackupContent(body);
  return content
    ? appGistBackup.parseBackupPayload(content)
    : appGistBackup.emptyBackupPayload();
}

async function writeBackupPayload(backupGistId, payload) {
  const contentJson = appGistBackup.serializeBackupPayload(payload);
  try {
    await gistRequest(`/gists/${backupGistId}`, {
      method: "PATCH",
      token: gistConfig.token,
      body: appGistBackup.buildBackupGistUpdatePayload(contentJson),
    });
  } catch (error) {
    if (error?.status === 404) {
      clearStoredBackupGistId();
      await createBackupGist(payload);
      return;
    }
    throw error;
  }
}

async function createBackupGist(payload) {
  const contentJson = appGistBackup.serializeBackupPayload(payload);
  const created = await gistRequest("/gists", {
    method: "POST",
    token: gistConfig.token,
    body: appGistBackup.buildBackupGistCreatePayload(contentJson),
  });
  const backupGistId = created?.id || "";
  if (!backupGistId) {
    throw new Error("GitHub did not return a backup Gist id.");
  }
  saveGistConfig({ ...gistConfig, backupGistId });
  return backupGistId;
}

async function createGistSnapshotNow() {
  const now = Date.now();
  const atIso = new Date(now).toISOString();
  const stateObject = appUserState.parseUserState(
    appUserState.serializeUserState(userState),
  );
  if (!stateObject) {
    return { ok: false, reason: "state" };
  }

  let backupGistId = await resolveBackupGistId();
  let payload = appGistBackup.emptyBackupPayload();

  if (backupGistId) {
    const body = await fetchBackupGistBody(backupGistId);
    if (!body) {
      backupGistId = null;
    } else {
      payload = appGistBackup.parseBackupPayload(
        appGistBackup.extractBackupContent(body) || "",
      );
      if (!appGistBackup.shouldCreateSnapshot(payload.snapshots, now)) {
        return { ok: true, skipped: true };
      }
    }
  }

  if (!backupGistId && !appGistBackup.shouldCreateSnapshot([], now)) {
    return { ok: true, skipped: true };
  }

  const nextPayload = appGistBackup.appendSnapshot(payload, stateObject, atIso);

  if (!backupGistId) {
    await createBackupGist(nextPayload);
    return { ok: true, created: true };
  }

  await writeBackupPayload(backupGistId, nextPayload);
  return { ok: true, created: true };
}

/**
 * Adds an immutable snapshot when the latest one is at least 20 minutes old.
 * All snapshots live in one backup gist file and are only appended or purged.
 */
async function maybeCreateGistSnapshot() {
  if (!gistSyncEnabled()) {
    return { ok: false, reason: "disabled" };
  }
  backupSnapshotChain = backupSnapshotChain.then(() => createGistSnapshotNow());
  return backupSnapshotChain;
}

async function listGistSnapshots() {
  if (!gistSyncEnabled()) {
    return [];
  }
  const backupGistId = await resolveBackupGistId();
  if (!backupGistId) {
    return [];
  }
  const payload = await readBackupPayload(backupGistId);
  return appGistBackup.snapshotListEntries(payload);
}

async function restoreGistSnapshot(at) {
  if (!gistSyncEnabled()) {
    return { ok: false, error: "Gist sync is not connected." };
  }
  if (!Date.parse(String(at || ""))) {
    return { ok: false, error: "That snapshot is not valid." };
  }

  const backupGistId = await resolveBackupGistId();
  if (!backupGistId) {
    return { ok: false, error: "No backup Gist found." };
  }

  const payload = await readBackupPayload(backupGistId);
  const entry = appGistBackup.findSnapshotByAt(payload, at);
  if (!entry) {
    return { ok: false, error: "Could not find that snapshot." };
  }
  const parsed = appUserState.parseUserState(entry.state);
  if (!parsed) {
    return { ok: false, error: "Could not read that snapshot." };
  }

  backupUserState(userState);
  userState = {
    ...parsed,
    storageMode: "gist",
  };
  gridViewMode = userState.preferences.viewMode;
  writeUserStateToStorage();
  queueGistSync({ push: true });
  onRemoteStateAdopted();
  return { ok: true };
}

/* ===== TMDB client: credential, Cache API wrapper, hydration pool ===== */

/**
 * TMDB access with a stale-while-revalidate Cache API layer.
 *
 * Movie detail responses are cached under a synthetic key that omits the
 * credential, so the cache survives a credential change and never stores the
 * secret itself. Search is transient and only memoized for the session.
 *
 * Ahead of all of that sits the snapshot committed under data/. Anything it
 * covers is served from the repo and never requested, so the API is only
 * consulted for ids added since the last `npm run scrape`.
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

/** Records from data/movies.json, kept apart so hydrateMovies stays the only
 * path into movieById and its onRecord contract still holds. */
const localMovieById = new Map();
let localPosterSizes = [];
let localDataGeneratedAt = null;

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

/* --- Committed snapshot --- */

/**
 * Read once at startup. A repo with no snapshot yet 404s here, which is not an
 * error condition: the app simply falls back to the API path it always used.
 */
async function loadLocalMovieData() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(appLocalData.LOCAL_DATA_URL, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return false;
    }
    const data = appLocalData.normalizeLocalData(await response.json());
    localMovieById.clear();
    for (const record of data.records) {
      localMovieById.set(record.id, record);
    }
    localPosterSizes = data.posterSizes;
    localDataGeneratedAt = data.generatedAt;
    return localMovieById.size > 0;
  } catch (_) {
    /* No snapshot, or an unreadable one. Either way, use the API. */
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function hasLocalMovieData() {
  return localMovieById.size > 0;
}

function localMovieCount() {
  return localMovieById.size;
}

function localMovieRecord(movieId) {
  return localMovieById.get(Number(movieId)) || null;
}

function localDataStamp() {
  return localDataGeneratedAt;
}

/** True when something can render this collection, with or without a credential. */
function hasMovieData() {
  return hasTmdbAccess() || hasLocalMovieData();
}

/** Null whenever the snapshot cannot serve this poster, so callers fall back. */
function localPosterUrlFor(record, size) {
  const local = record ? localMovieById.get(record.id) : null;
  if (!local) {
    return null;
  }
  return appLocalData.localPosterUrl(local.poster, size, localPosterSizes);
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
    // Keep the in-memory blob URL alive — imgs already display it and revoking
    // here breaks posters on every refresh after a cache hit.
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
  const directorMode = options.mode === "director";
  const cacheKey = `${directorMode ? "director" : "movie"}:${trimmed}`;
  if (searchMemo.has(cacheKey)) {
    return searchMemo.get(cacheKey);
  }

  const signal = options.signal;
  let results;

  if (directorMode) {
    const personPayload = await fetchTmdb(appTmdb.buildPersonSearchUrl(trimmed), { signal }).then(
      (response) => response.json(),
    );
    const directorCandidates = appTmdb.pickDirectorSearchCandidates(
      appTmdb.normalizePersonSearchResults(personPayload),
      { allowAnyPerson: true },
    );
    const directorEntries = await Promise.all(
      directorCandidates.map(async (person) => {
        const creditsPayload = await fetchTmdb(appTmdb.buildPersonMovieCreditsUrl(person.id), {
          signal,
        }).then((response) => response.json());
        return {
          personName: person.name,
          movies: appTmdb.directedMoviesFromPersonCredits(creditsPayload),
        };
      }),
    );
    results = appTmdb.flattenDirectorSearchResults(directorEntries);
  } else {
    const moviePayload = await fetchTmdb(appTmdb.buildSearchUrl(trimmed), { signal }).then(
      (response) => response.json(),
    );
    results = appTmdb.normalizeSearchResults(moviePayload);
  }

  searchMemo.set(cacheKey, results);
  return results;
}

/**
 * Resolve many movies, snapshot first, then a bounded number of in-flight
 * requests for the rest. TMDB has no batch endpoint for arbitrary ids, so a
 * long list is many small requests — which is exactly what the snapshot avoids.
 */
async function hydrateMovies(ids, handlers = {}) {
  const queue = ids.filter((id) => !movieById.has(id));
  if (!queue.length) {
    return { hydratedFromNetwork: false };
  }

  // The snapshot resolves synchronously, so anything it covers is on screen
  // before a single request is considered.
  const pending = [];
  for (const id of queue) {
    const local = localMovieById.get(id);
    if (!local) {
      pending.push(id);
      continue;
    }
    movieById.set(id, local);
    movieErrors.delete(id);
    handlers.onRecord?.(id, local);
  }

  // Without access every remaining request would fail, turning those cards into
  // error cards. Leaving the skeletons up reads better and stays accurate.
  if (!pending.length || !hasTmdbAccess()) {
    return { hydratedFromNetwork: false };
  }

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
  return { hydratedFromNetwork: true };
}

/* ===== Search box, TMDB autocomplete, and add-to-list ===== */

/**
 * TMDB search and add flow. The floating + button opens a sheet: search first,
 * then pick Watched or Watchlist.
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
let addMovieRatingTouched = false;
let addMoviePickTab = "add";
let searchDirectorMode = false;

const ADD_MOVIE_TMDB_URL = "https://www.themoviedb.org/movie/";

function resetAddMovieRatingControls() {
  pendingAddRating = null;
  addMovieRatingTouched = false;
  addMovieRatingSlider.value = String(appRatings.DEFAULT_SLIDER_VALUE);
  if (addMovieRatingSelect) {
    addMovieRatingSelect.value = "";
  }
  if (addMovieRatingClear) {
    addMovieRatingClear.hidden = true;
  }
  addMovieRatingValue.textContent = "—";
  addMovieRatingValue.classList.add("is-empty");
  addMovieRatingField?.classList.remove("is-active");
}

function syncAddMovieRatingDisplay() {
  if (!addMovieRatingTouched) {
    addMovieRatingValue.textContent = "—";
    addMovieRatingValue.classList.add("is-empty");
    addMovieRatingField?.classList.remove("is-active");
    pendingAddRating = null;
    addMovieRatingSlider.value = String(appRatings.DEFAULT_SLIDER_VALUE);
    if (addMovieRatingSelect) {
      addMovieRatingSelect.value = "";
    }
    if (addMovieRatingClear) {
      addMovieRatingClear.hidden = true;
    }
    return;
  }
  addMovieRatingField?.classList.add("is-active");
  if (addMovieRatingClear) {
    addMovieRatingClear.hidden = false;
  }
  const rating =
    pendingAddRating ?? appRatings.ratingFromSliderValue(Number(addMovieRatingSlider.value));
  pendingAddRating = rating;
  addMovieRatingValue.textContent = appRatings.formatUserRating(rating);
  addMovieRatingValue.classList.remove("is-empty");
  addMovieRatingSlider.value = String(appRatings.sliderValueFromRating(rating));
  if (addMovieRatingSelect) {
    addMovieRatingSelect.value = appRatings.formatUserRating(rating);
  }
}

function onAddMovieRatingSliderInput() {
  addMovieRatingTouched = true;
  pendingAddRating = appRatings.ratingFromSliderValue(Number(addMovieRatingSlider.value));
  syncAddMovieRatingDisplay();
}

function onAddMovieRatingSelectChange() {
  if (!addMovieRatingSelect) {
    return;
  }
  if (addMovieRatingSelect.value === "") {
    resetAddMovieRatingControls();
    return;
  }
  addMovieRatingTouched = true;
  pendingAddRating = appRatings.normalizeRating(addMovieRatingSelect.value);
  syncAddMovieRatingDisplay();
}

function clearAddMovieRating() {
  resetAddMovieRatingControls();
}

function initAddMovieRatingSelect() {
  if (!addMovieRatingSelect) {
    return;
  }
  addMovieRatingSelect.innerHTML = appRatings.ratingSelectInnerHtml(null, { includeUnrated: true });
}

function syncAddMoviePickStep() {
  if (isCustomListDetailActive()) {
    if (addMovieRatingField) {
      addMovieRatingField.hidden = true;
    }
    resetAddMovieRatingControls();
    return;
  }
  const watched = selectedAddListId === appLists.WATCHED_ID;
  if (addMovieRatingField) {
    addMovieRatingField.hidden = !watched;
  }
  if (!watched) {
    resetAddMovieRatingControls();
  }
}

function syncAddMovieDialogChrome() {
  const customAdd = isCustomListDetailActive();
  const listName = customAdd ? getActiveDisplayContext().listName : "";

  if (addMovieTitle) {
    addMovieTitle.textContent = customAdd ? `Add a movie to ${listName}` : "Add a movie";
  }
  if (addMoviePresetSection) {
    addMoviePresetSection.hidden = customAdd;
  }
  if (addMovieCustomListsSection) {
    if (customAdd) {
      addMovieCustomListsSection.hidden = true;
    } else {
      renderAddMovieCustomListPicker();
    }
  }
  if (addMoviePickTabs && customAdd) {
    addMoviePickTabs.hidden = true;
  }
  addMovieDialog?.classList.toggle("is-custom-list-add", customAdd);
  syncAddMoviePickStep();
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
      const metaParts = [];
      if (year) {
        metaParts.push(year);
      } else if (!result.directorHint) {
        metaParts.push("Year unknown");
      }
      if (result.directorHint) {
        metaParts.push(result.directorHint);
      }
      const meta = metaParts.join(" · ");
      return `<li class="search-suggest-item${active}" role="option" data-suggest-index="${index}" aria-selected="${index === suggestIndex}">
  ${suggestPosterHtml(result)}
  <span class="search-suggest-text">
    <span class="search-suggest-title">${appCardHtml.escapeHtml(result.title)}</span>
    <span class="search-suggest-meta">${appCardHtml.escapeHtml(meta)}</span>
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
    const results = await searchMovies(query, {
      signal: searchController.signal,
      mode: searchDirectorMode ? "director" : "movie",
    });
    if (token !== suggestRequestToken) {
      return;
    }
    suggestResults = results;
    suggestIndex = -1;
    if (!results.length) {
      const emptyMessage = searchDirectorMode
        ? `No directed movies found for "${query}".`
        : `No movies found for "${query}".`;
      showSuggestMessage(emptyMessage);
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
  if (!hasTmdbAccess()) {
    addMovieHint.textContent = "Add a TMDB credential in Settings to search.";
    return;
  }
  addMovieHint.textContent = searchDirectorMode
    ? "Search by director name."
    : "Search by movie title.";
}

function syncSearchDirectorToggle() {
  if (!searchDirectorToggle) {
    return;
  }
  searchDirectorToggle.checked = searchDirectorMode;
  if (searchInput) {
    searchInput.placeholder = searchDirectorMode ? "Search directors…" : "Search movies…";
    searchInput.setAttribute(
      "aria-label",
      searchDirectorMode ? "Search directors to add movies" : "Search movies to add",
    );
  }
  updateAddMovieHint();
}

function setSearchDirectorMode(active) {
  searchDirectorMode = Boolean(active);
  syncSearchDirectorToggle();
  const query = searchInput?.value.trim();
  if (query && hasTmdbAccess()) {
    runSearch(query);
  } else {
    hideSuggest();
  }
}

function onSearchDirectorToggleChange() {
  setSearchDirectorMode(searchDirectorToggle?.checked ?? false);
}

function showAddSearchStep() {
  pendingAddResult = null;
  selectedAddListId = null;
  resetAddMovieCustomListSelection();
  resetAddMovieRatingControls();
  setAddMoviePickTab("add");
  if (addMoviePickTabs) {
    addMoviePickTabs.hidden = true;
  }
  addMovieDialog?.classList.remove("is-pick-step");
  if (addMovieBack) {
    addMovieBack.hidden = true;
  }
  addMovieSearchStep.hidden = false;
  addMoviePickStep.hidden = true;
  syncAddMovieDialogChrome();
}

function syncAddMoviePickTabs() {
  const onAdd = addMoviePickTab === "add";
  addMovieTabAdd?.setAttribute("aria-selected", String(onAdd));
  addMovieTabDetail?.setAttribute("aria-selected", String(!onAdd));
  addMovieTabAdd?.setAttribute("tabindex", onAdd ? "0" : "-1");
  addMovieTabDetail?.setAttribute("tabindex", onAdd ? "-1" : "0");
  addMovieDialog?.classList.toggle("is-detail-tab", !onAdd);
  if (addMovieAddPanel) {
    addMovieAddPanel.hidden = !onAdd;
  }
  if (addMovieDetailPanel) {
    addMovieDetailPanel.hidden = onAdd;
  }
}

function setAddMoviePickTab(tab) {
  addMoviePickTab = tab === "detail" ? "detail" : "add";
  syncAddMoviePickTabs();
  if (addMoviePickTab === "detail") {
    renderAddMovieDetail();
    addMovieTabDetail?.focus({ preventScroll: true });
  } else {
    addMovieTabAdd?.focus({ preventScroll: true });
  }
}

function onAddMoviePickTabClick(event) {
  const tab = event.target.closest(".add-movie-pick-tab");
  if (!tab || !pendingAddResult) {
    return;
  }
  if (tab.id === "add-movie-tab-detail") {
    setAddMoviePickTab("detail");
  } else if (tab.id === "add-movie-tab-add") {
    setAddMoviePickTab("add");
  }
}

function prefetchAddMovieDetail(movieId) {
  if (!Number.isInteger(movieId) || movieId <= 0 || movieById.has(movieId)) {
    return;
  }
  if (!hasTmdbAccess()) {
    return;
  }
  hydrateMovies([movieId], {
    onRecord: (id, record) => {
      if (pendingAddResult?.id === id && addMoviePickTab === "detail") {
        renderAddMovieDetail();
      }
    },
  });
}

function addMovieDetailPosterHtml(record) {
  const url = appTmdb.buildImageUrl(record.posterPath, appTmdb.POSTER_SIZES.card);
  if (!url) {
    return `<div class="add-movie-detail-poster add-movie-detail-poster--empty"></div>`;
  }
  return `<img class="add-movie-detail-poster" data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy">`;
}

function renderAddMovieDetail() {
  if (!pendingAddResult || !addMovieDetailContent) {
    return;
  }

  const movieId = pendingAddResult.id;
  const record = movieById.get(movieId);
  const canLoad = hasTmdbAccess();

  if (!record) {
    const year = appCardHtml.formatYear(pendingAddResult.releaseDate);
    let statusText;
    if (movieErrors.has(movieId)) {
      statusText = "Could not load details. Check your credential and connection.";
    } else if (canLoad) {
      statusText = "Loading details…";
    } else {
      statusText = "Add a TMDB credential in Settings to load details.";
    }
    addMovieDetailContent.innerHTML = `<div class="add-movie-detail-layout">
  ${addMovieDetailPosterHtml(pendingAddResult)}
  <div class="add-movie-detail-body">
    <h3 class="add-movie-detail-title">${appCardHtml.escapeHtml(pendingAddResult.title)}</h3>
    ${year ? `<p class="add-movie-detail-tagline">${year}</p>` : ""}
    <p class="add-movie-detail-status">${appCardHtml.escapeHtml(statusText)}</p>
  </div>
</div>`;
    bindPosterImages(addMovieDetailContent);
    if (canLoad) {
      prefetchAddMovieDetail(movieId);
    }
    return;
  }

  const tagline = record.tagline
    ? `<p class="add-movie-detail-tagline">${appCardHtml.escapeHtml(record.tagline)}</p>`
    : "";

  addMovieDetailContent.innerHTML = `<div class="add-movie-detail-layout">
  ${addMovieDetailPosterHtml(record)}
  <div class="add-movie-detail-body">
    <h3 class="add-movie-detail-title">${appCardHtml.escapeHtml(record.title)}</h3>
    ${tagline}
    <div class="add-movie-detail-meta">${detailMetaChips(record)}</div>
    <p class="add-movie-detail-overview">${appCardHtml.escapeHtml(record.overview || "No overview available.")}</p>
    <div class="add-movie-detail-credits">${detailCreditsHtml(record)}</div>
    <a class="add-movie-detail-link" href="${ADD_MOVIE_TMDB_URL}${movieId}" target="_blank" rel="noopener noreferrer">View on TMDB</a>
  </div>
</div>`;
  bindPosterImages(addMovieDetailContent);
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
    const selected = listId != null && button.dataset.listId === listId;
    button.setAttribute("aria-pressed", String(selected));
  });
}

function showAddPickStep(result) {
  pendingAddResult = result;
  selectedAddListId =
    !isCustomListView() && appLists.isListId(userState.activeListId)
      ? userState.activeListId
      : null;
  resetAddMovieRatingControls();
  resetAddMovieCustomListSelection();
  if (addMoviePickTabs) {
    addMoviePickTabs.hidden = isCustomListDetailActive();
  }
  addMovieDialog?.classList.add("is-pick-step");
  if (addMovieBack) {
    addMovieBack.hidden = false;
  }
  setAddMoviePickTab("add");
  addMovieSearchStep.hidden = true;
  addMoviePickStep.hidden = false;
  renderAddMoviePicked(result);
  updateAddListPickerSelection(selectedAddListId);
  syncAddMovieDialogChrome();
  syncAddMovieSubmitState();
  prefetchAddMovieDetail(result.id);
  addMovieSubmit.focus({ preventScroll: true });
}

function confirmAddMovie() {
  if (!pendingAddResult) {
    return;
  }
  if (isCustomListDetailActive()) {
    if (selectedAddCustomListIds.size === 0) {
      return;
    }
  } else if (selectedAddListId == null) {
    return;
  }

  const movieId = pendingAddResult.id;
  let changed = false;

  if (!isCustomListDetailActive() && selectedAddListId != null) {
    const nextLists = appLists.assignMovieToList(userState.lists, selectedAddListId, movieId);
    if (updateLists(nextLists)) {
      changed = true;
    }
    if (selectedAddListId === appLists.WATCHED_ID && pendingAddRating != null) {
      if (
        updateRatings(appRatings.setRating(userState.ratings, movieId, pendingAddRating))
      ) {
        changed = true;
      }
    }
    if (changed) {
      recordAddedAt(movieId);
      recordMovieStatus(movieId, selectedAddListId);
    }
  }

  let nextCustomLists = userState.customLists;
  for (const listId of selectedAddCustomListIds) {
    const updated = appCustomLists.addMovieToCustomList(nextCustomLists, listId, movieId);
    if (updated !== nextCustomLists) {
      nextCustomLists = updated;
      changed = true;
    }
  }
  if (nextCustomLists !== userState.customLists) {
    userState = { ...userState, customLists: nextCustomLists };
  }

  if (!changed) {
    return;
  }
  persistUserState();
  closeAddMovieDialog();
  if (isCustomListIndexActive()) {
    renderCustomListsIndex();
  } else {
    render();
  }
  hydrateMovies([movieId], {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
}

function syncAddMovieFromWatchedSection() {
  if (addMovieFromWatchedSection) {
    addMovieFromWatchedSection.hidden = !isCustomListDetailActive();
  }
  syncAddMovieDialogChrome();
}

function openAddMovieDialog() {
  setSearchDirectorMode(false);
  showAddSearchStep();
  clearSearch();
  syncAddMovieFromWatchedSection();
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
  const listsChanged = updateLists(nextLists);
  let ratingsChanged = false;
  if (rating != null) {
    ratingsChanged = updateRatings(
      appRatings.setRating(userState.ratings, result.id, rating),
    );
  }
  if (!listsChanged && !ratingsChanged) {
    return;
  }
  recordAddedAt(result.id);
  recordMovieStatus(result.id, listId);
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
  if (listId !== appLists.WATCHED_ID && listId !== appLists.WATCHLIST_ID) {
    return;
  }
  selectedAddListId = listId;
  updateAddListPickerSelection(selectedAddListId);
  syncAddMoviePickStep();
  syncAddMovieSubmitState();
}

/* ===== Cards, skeletons, and the main grid render ===== */

/**
 * Grid rendering. `render()` writes the whole grid from the active list's ids,
 * emitting skeleton cards for anything not hydrated yet; hydration then
 * patches single rows through applyHydratedRecord() rather than re-rendering.
 */

function posterHtml(record, size) {
  const remote = record ? appTmdb.buildImageUrl(record.posterPath, size) : null;
  const local = record ? localPosterUrlFor(record, size) : null;
  const url = local || remote;
  if (!url) {
    const label = record ? appCardHtml.escapeHtml(record.title) : "";
    return `<div class="placeholder">${label}</div>`;
  }
  // A snapshot entry whose file has gone missing retries TMDB rather than
  // leaving a hole where the poster was.
  const fallback =
    local && remote ? ` data-poster-fallback="${appCardHtml.escapeHtml(remote)}"` : "";
  return `<img data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy" decoding="async"${fallback}>`;
}

function cardMetaHtml(record) {
  const year = appCardHtml.formatYear(record.releaseDate);
  const runtime = appCardHtml.formatRuntime(record.runtime);
  const yearHtml = year
    ? `<span class="card-meta-year">${appCardHtml.escapeHtml(year)}</span>`
    : "";
  const runtimeHtml = runtime
    ? `<span class="card-meta-runtime">${appCardHtml.escapeHtml(runtime)}</span>`
    : "";
  return `${yearHtml}${runtimeHtml}`;
}

function cardUserRatingHtml(movieId) {
  return cardUserRatingChipHtml(movieId);
}

function cardFanRatingHtml(movieId) {
  if (!usesWatchedStyleDisplay()) {
    return "";
  }
  const record = movieById.get(movieId);
  if (!record) {
    return "";
  }
  const label = appCardHtml.formatRating(record.voteAverage);
  const text = label || "—";
  const emptyClass = label ? "" : " is-empty";
  return `<span class="card-fan-rating${emptyClass}" aria-label="Fan rating ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function cardDetailRatingsHtml(movieId) {
  if (gridViewMode !== "detail" || !usesWatchedStyleDisplay()) {
    return "";
  }
  const fan = cardFanRatingHtml(movieId);
  const user = cardUserRatingHtml(movieId);
  return `<div class="card-body-ratings">${fan}${user}</div>`;
}

function isUserRatingSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "user-rating-asc" || sortMode === "user-rating-desc";
}

function isFanRatingSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "rating-asc" || sortMode === "rating-desc";
}

function isYearSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "year-asc" || sortMode === "year-desc";
}

function isTitleSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "title-asc" || sortMode === "title-desc";
}

function isAddedSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "added-asc" || sortMode === "added-desc";
}

function cardUserRatingChipHtml(movieId, { showEmpty = false } = {}) {
  const label = appRatings.formatUserRating(
    appRatings.getRating(userState.ratings, movieId),
  );
  if (!label && !showEmpty) {
    return "";
  }
  const text = label || "—";
  const emptyClass = label ? "" : " is-empty";
  return `<span class="card-user-rating${emptyClass}" aria-label="Your rating ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function cardReleaseYearFooterHtml(movieId) {
  const record = movieById.get(movieId);
  const year = record ? appCardHtml.formatYear(record.releaseDate) : "";
  const text = year || "—";
  const emptyClass = year ? "" : " is-empty";
  return `<span class="card-footer-main${emptyClass}" aria-label="Release year ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function cardSmallWatchedFooterContentHtml(movieId) {
  if (isTitleSortMode() || isAddedSortMode()) {
    return "";
  }
  if (isUserRatingSortMode()) {
    return cardUserRatingChipHtml(movieId, { showEmpty: true });
  }
  if (isFanRatingSortMode()) {
    return cardFanRatingHtml(movieId);
  }
  if (isYearSortMode()) {
    return cardReleaseYearFooterHtml(movieId);
  }
  return "";
}

function cardSmallFooterHtml(movieId) {
  if (gridViewMode !== "cards") {
    return "";
  }

  if (userState.activeListId === appLists.WATCHLIST_ID) {
    const panel = watchlistCardPanelHtml(movieId);
    return panel ? `<div class="card-footer card-footer--watchlist">${panel}</div>` : "";
  }

  if (!usesWatchedStyleDisplay()) {
    return "";
  }

  const content = cardSmallWatchedFooterContentHtml(movieId);
  if (!content) {
    return "";
  }
  return `<div class="card-footer card-footer--sort"><div class="card-footer-sort">${content}</div></div>`;
}

function cardUnratedClass(movieId) {
  if (!isUserRatingSortMode()) {
    return "";
  }
  if (appRatings.getRating(userState.ratings, movieId) != null) {
    return "";
  }
  return " is-unrated";
}

function cardRemoveIconHtml() {
  return `<svg class="card-remove-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none">
  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
</svg>`;
}

/**
 * Watchlist cards use a dedicated bottom panel: title text, then split actions.
 */
function watchlistCardPanelHtml(movieId) {
  if (userState.activeListId !== appLists.WATCHLIST_ID) {
    return "";
  }
  const record = movieById.get(movieId);
  const title = record ? appCardHtml.escapeHtml(record.title) : "";
  const titleLabel = record ? appCardHtml.escapeHtml(record.title) : "movie";
  return `<div class="watchlist-card-panel">
  <div class="watchlist-card-text"><span class="watchlist-card-title">${title}</span></div>
  <div class="watchlist-card-actions">
    <button type="button" class="watchlist-action-btn watchlist-action-btn--remove card-remove-btn" aria-label="Remove ${titleLabel}" title="Remove movie">${cardRemoveIconHtml()}</button>
    <button type="button" class="watchlist-action-btn watchlist-action-btn--watch card-watch-btn" aria-label="Mark as watched" title="Mark as watched">&#10003;</button>
  </div>
</div>`;
}

function cardPosterOnlyHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = failed
      ? `<div class="placeholder">Could not load</div>`
      : `<div class="placeholder"></div>`;
    return `<div class="poster-wrap">${body}</div>${cardSmallFooterHtml(movieId)}`;
  }
  const grip = listShowsReorderGrip()
    ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  return `<div class="poster-wrap">${posterHtml(record, appTmdb.POSTER_SIZES.card)}${grip}</div>${cardSmallFooterHtml(movieId)}`;
}

function listShowsReorderGrip() {
  return (
    appLists.isListReorderable(userState.activeListId) &&
    reorderModeActive &&
    usesCustomDisplayOrder()
  );
}

function syncSortSelectLabels() {
  const options = listSortSelect?.options;
  if (!options?.length) {
    return;
  }
  const short = window.matchMedia("(max-width: 640px)").matches;
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    option.textContent = appSort.getSortFieldLabel(option.value, short);
  }
}

function syncSortControlUi() {
  const show =
    usesWatchedStyleDisplay() && activeMovieIds().length > 0 && hasMovieData();
  const sort = userState.preferences.sort;
  if (sortControl) {
    sortControl.hidden = !show;
  }
  if (listSortSelect) {
    if (show) {
      listSortSelect.value = appSort.getSortField(sort);
    }
  }
  if (sortReverseBtn) {
    sortReverseBtn.hidden = !show;
    const descending = appSort.isSortDescending(sort);
    const field = appSort.getSortField(sort);
    sortReverseBtn.classList.toggle("is-descending", descending);
    sortReverseBtn.classList.toggle("is-ascending", !descending);
    const directionLabel = appSort.sortDirectionLabel(field, descending);
    sortReverseBtn.title = `${directionLabel} · click to reverse`;
    sortReverseBtn.setAttribute(
      "aria-label",
      `Sort order: ${directionLabel}. Reverse.`,
    );
  }
  syncSortSelectLabels();
}

function syncReorderModeUi() {
  const canReorder =
    isWatchlistActive() &&
    appLists.isListReorderable(userState.activeListId) &&
    activeMovieIds().length > 0;
  if (!canReorder) {
    reorderModeActive = false;
  }
  const orderLocked = !reorderModeActive;
  if (reorderModeControl) {
    if (canReorder && reorderToolbarSlot) {
      reorderToolbarSlot.appendChild(reorderModeControl);
      reorderModeControl.hidden = false;
    } else {
      reorderModeControl.hidden = true;
    }
  }
  if (reorderModeToggle) {
    reorderModeToggle.checked = reorderModeActive;
    const toggleLabel = reorderModeActive
      ? "Reorder on. Drag movies to change order."
      : "Reorder off.";
    reorderModeToggle.setAttribute("aria-label", toggleLabel);
    reorderModeToggle.title = reorderModeActive
      ? "Turn off to lock list order"
      : "Turn on to drag and reorder";
  }
  document.body.classList.toggle("reorder-mode", reorderModeActive);
  document.body.classList.toggle("order-locked", canReorder && orderLocked);
  syncSortControlUi();
}

function setSortMode(mode) {
  const next = appSort.normalizeSort(mode);
  if (next === userState.preferences.sort) {
    syncSortControlUi();
    return;
  }
  userState = { ...userState, preferences: { ...userState.preferences, sort: next } };
  persistUserState();
  render();
}

function setSortField(field) {
  setSortMode(appSort.sortModeForField(field, userState.preferences.sort));
}

function toggleSortOrder() {
  setSortMode(appSort.toggleSortDirection(userState.preferences.sort));
  sortReverseBtn?.blur();
}

function setReorderMode(active) {
  const next = Boolean(active);
  if (reorderModeActive === next) {
    syncReorderModeUi();
    return;
  }
  reorderModeActive = next;
  syncReorderModeUi();
  render();
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

  if (userState.activeListId === appLists.WATCHLIST_ID) {
    return `<div class="poster-wrap">
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
</div>
<div class="card-body card-body--watchlist">
  ${watchlistCardPanelHtml(movieId)}
</div>`;
  }

  return `<div class="poster-wrap">
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta-row">
      <div class="card-meta">${cardMetaHtml(record)}</div>
      ${cardDetailRatingsHtml(movieId)}
    </div>
  </div>
</div>`;
}

function rowInnerHtml(movieId) {
  const record = movieById.get(movieId);
  const stateClass = record
    ? ""
    : movieErrors.has(movieId)
      ? " is-error"
      : " is-skeleton";
  const title = record ? appCardHtml.escapeHtml(record.title) : `Movie ${movieId}`;

  const watchlistCard =
    userState.activeListId === appLists.WATCHLIST_ID ? " card--watchlist" : "";

  return `<article class="card${stateClass}${cardUnratedClass(movieId)}${watchlistCard}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${cardInnerHtml(movieId)}
</article>`;
}

function rowHtml(movieId) {
  return `<div class="movie-row movie-row--card" data-movie-id="${movieId}">${rowInnerHtml(movieId)}</div>`;
}

/** Tabs are the only list switcher, and carry each list's count. */
function renderListTabs() {
  if (!listTabs || isCustomListView()) {
    return;
  }
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

function syncHeaderViewTitle() {
  if (!headerTitleEl || !customListViewTitleEl) {
    return;
  }
  if (isCustomListDetailActive()) {
    customListViewTitleEl.textContent = getActiveDisplayContext().listName;
    customListViewTitleEl.hidden = false;
    headerTitleEl.hidden = true;
    return;
  }
  customListViewTitleEl.hidden = true;
  headerTitleEl.hidden = false;
}

function updateListHeader() {
  syncHeaderViewTitle();
  const count = activeMovieIds().length;
  if (isCustomListIndexActive()) {
    listSubtitleEl.textContent = "Create and manage custom lists";
    return;
  }
  if (isCustomListDetailActive()) {
    if (count) {
      listSubtitleEl.textContent = `${count} ${count === 1 ? "movie" : "movies"}`;
    } else {
      listSubtitleEl.textContent = "Add movies from Watched or search";
    }
    return;
  }
  if (count && !hasMovieData()) {
    listSubtitleEl.textContent = "Add a TMDB credential in Settings to load details";
  } else if (count) {
    if (reorderModeActive) {
      listSubtitleEl.textContent = "+ Add a movie · drag to reorder";
    } else if (isWatchedListActive()) {
      listSubtitleEl.textContent = "+ Add a movie · sorted view";
    } else {
      listSubtitleEl.textContent =
        gridViewMode === "cards"
          ? "+ Add a movie · tap a poster for details"
          : "+ Add a movie · tap a card for details";
    }
  } else {
    listSubtitleEl.textContent = hasTmdbAccess()
      ? "Search TMDB to add your first movie"
      : "Add a TMDB credential in Settings to get started";
  }
}

function setActiveList(listId) {
  if (!appLists.isListId(listId) || listId === userState.activeListId) {
    return;
  }
  userState = { ...userState, activeListId: listId };
  reorderModeActive = false;
  persistUserState();
  closeDetail({ popHistory: false });
  refreshViewModeForActiveList();
  render();
  hydrateActiveList();
}

function syncAddMovieFabVisibility(count) {
  if (addMovieFab) {
    addMovieFab.hidden =
      isCustomListIndexActive() || (count === 0 && !isCustomListDetailActive());
  }
}

function renderEmptyState(count) {
  const totalCount = activeMovieIds().length;
  if (count) {
    emptyState.hidden = true;
    emptyState.innerHTML = "";
    return;
  }
  emptyState.hidden = false;
  if (isCustomListDetailActive()) {
    if (!hasTmdbAccess()) {
      emptyState.innerHTML = `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to search and load movies.`;
      return;
    }
    emptyState.innerHTML = `<strong>This list is empty</strong>
<p class="empty-state-hint">Add movies from Watched or search TMDB.</p>
<button type="button" class="empty-state-add-btn">
  <span class="empty-state-add-icon" aria-hidden="true">+</span>
  Add a movie
</button>`;
    return;
  }
  const listName = getActiveDisplayContext().listName || "this list";
  if (
    totalCount > 0 &&
    typeof hasActiveListSearch === "function" &&
    hasActiveListSearch()
  ) {
    emptyState.innerHTML = `<strong>No matches</strong>
<p class="empty-state-hint">Try a different title, director, genre, actor, or year.</p>`;
    return;
  }
  if (!hasTmdbAccess()) {
    emptyState.innerHTML = `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to search and load movies.`;
    return;
  }
  emptyState.innerHTML = `<strong>Nothing in ${appCardHtml.escapeHtml(listName)} yet</strong>
<p class="empty-state-hint">Search TMDB to add your first movie.</p>
<button type="button" class="empty-state-add-btn">
  <span class="empty-state-add-icon" aria-hidden="true">+</span>
  Add a movie
</button>`;
}

/**
 * Called after sync replaces state behind the user's back, so an old tab
 * redraws instead of sitting on a list that no longer matches storage.
 */
function onRemoteStateAdopted() {
  onRemoteCustomListsAdopted();
  refreshViewModeForActiveList();
  syncViewFromLocation();
}

function render() {
  if (isCustomListIndexActive()) {
    syncAppViewChrome();
    renderCustomListsIndex();
    return;
  }
  const ids = displayMovieIds();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  renderListTabs();
  syncReorderModeUi();
  syncListSearchVisibility();
  syncAppViewChrome();
  renderEmptyState(ids.length);
  syncAddMovieFabVisibility(ids.length);
}

/** Patches one row after hydration so the rest of the grid stays untouched. */
function applyHydratedRecord(movieId, options = {}) {
  const row = grid.querySelector(`.movie-row[data-movie-id="${movieId}"]`);
  if (!row) {
    return;
  }
  row.innerHTML = rowInnerHtml(movieId);
  bindPosterImages(row);
  if (!options.skipDetail && detailMovieId === movieId) {
    renderDetail();
  }
}

function needsResortAfterHydration() {
  if (!getActiveDisplayContext().sortable) {
    return false;
  }
  const field = appSort.getSortField(userState.preferences.sort);
  return field === "title" || field === "year" || field === "rating";
}

function hydrateActiveList() {
  return hydrateMovies(displayMovieIds(), {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  }).then((result) => {
    if (result?.hydratedFromNetwork && needsResortAfterHydration()) {
      render();
    }
  });
}

/** A broken poster URL should degrade to the title placeholder, not a torn card. */
function handleImageError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.closest(".poster-wrap")) {
    return;
  }
  const fallback = img.getAttribute("data-poster-fallback");
  if (fallback) {
    img.removeAttribute("data-poster-fallback");
    img.setAttribute("data-poster-src", fallback);
    img.removeAttribute("src");
    attachPosterImage(img);
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

/** Records the status alongside the list change so an unchanged list stamps nothing. */
function commitListChange(nextLists, statusChange) {
  if (!updateLists(nextLists)) {
    return false;
  }
  if (statusChange) {
    recordMovieStatus(statusChange.movieId, statusChange.status);
  }
  persistUserState();
  return true;
}

function watchMovie(movieId) {
  const nextLists = appLists.assignMovieToList(
    userState.lists,
    appLists.WATCHED_ID,
    movieId,
  );
  if (!commitListChange(nextLists, { movieId, status: appLists.WATCHED_ID })) {
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

function requestWatchMovie(movieId) {
  pendingWatchMovieId = Number(movieId);
  const record = movieById.get(pendingWatchMovieId);
  const title = record?.title || `Movie ${pendingWatchMovieId}`;
  watchConfirmMessage.textContent = `Mark “${title}” as watched? It will move to your Watched list.`;
  watchConfirmDialog.hidden = false;
  watchConfirmCancel.focus({ preventScroll: true });
}

function closeWatchConfirm() {
  pendingWatchMovieId = null;
  watchConfirmDialog.hidden = true;
}

function confirmWatchMovie() {
  const movieId = pendingWatchMovieId;
  closeWatchConfirm();
  if (movieId == null) {
    return;
  }
  watchMovie(movieId);
}

function removeMovieFromCollection(movieId) {
  const nextLists = appLists.removeMovie(userState.lists, movieId);
  if (!updateLists(nextLists)) {
    return;
  }
  updateRatings(appRatings.removeRating(userState.ratings, movieId));
  updateAddedAt(appAddedAt.removeAddedAt(userState.addedAt, movieId));
  recordMovieStatus(movieId, appSyncMerge.REMOVED_STATUS);
  persistUserState();
  if (detailMovieId === movieId) {
    closeDetail();
  }
  render();
}

function refreshMovieRating(movieId) {
  if (usesWatchedStyleDisplay()) {
    render();
    if (detailMovieId === movieId) {
      renderDetail();
    }
    return;
  }
  applyHydratedRecord(movieId, { skipDetail: true });
  if (detailMovieId === movieId) {
    syncDetailRatingDisplay(appRatings.getRating(userState.ratings, movieId));
  }
}

function removeConfirmScopeLabel(movieId) {
  if (appLists.isOnWatchlist(userState.lists, movieId)) {
    return "the watchlist";
  }
  return "your watched list";
}

function requestRemoveMovie(movieId) {
  pendingRemoveMovieId = Number(movieId);
  const record = movieById.get(pendingRemoveMovieId);
  const title = record?.title || `Movie ${pendingRemoveMovieId}`;
  const scope = removeConfirmScopeLabel(pendingRemoveMovieId);
  removeConfirmMessage.textContent = `Remove “${title}” from ${scope}? This cannot be undone.`;
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
  if (isCustomListDetailActive()) {
    removeMovieFromCustomListView(movieId);
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

function detailMovieAllowsRating() {
  return (
    detailMovieId != null &&
    appRatings.isRatingAllowed(
      userState.lists,
      detailMovieId,
      userState.customLists,
    )
  );
}

function detailMovieShowsListsBlock(movieId) {
  if (appLists.isWatched(userState.lists, movieId)) {
    return true;
  }
  return appCustomLists.customListsForMovie(userState.customLists, movieId).length > 0;
}

function detailListMembershipChipsHtml(movieId) {
  return appCustomLists
    .customListsForMovie(userState.customLists, movieId)
    .map(
      (list) =>
        `<button type="button" class="add-custom-list-chip is-member" data-detail-list-nav-id="${appCardHtml.escapeHtml(list.id)}">${appCardHtml.escapeHtml(list.name)}</button>`,
    )
    .join("");
}

function syncDetailListPickerSelection(movieId) {
  detailListPickerSelectedIds = new Set(
    appCustomLists.customListsForMovie(userState.customLists, movieId).map((list) => list.id),
  );
}

function detailAddToListPickerHtml(movieId) {
  const allLists = userState.customLists || [];
  if (!allLists.length) {
    return `<p class="detail-add-to-list-hint"><a href="#lists" class="detail-add-to-list-link">Create lists…</a></p>`;
  }
  return `<div class="add-custom-list-picker detail-custom-list-picker">${allLists
    .map((list) => {
      const selected = detailListPickerSelectedIds.has(list.id);
      return `<button type="button" class="add-custom-list-chip" data-detail-list-toggle-id="${appCardHtml.escapeHtml(list.id)}" aria-pressed="${selected}">${appCardHtml.escapeHtml(list.name)}</button>`;
    })
    .join("")}</div>`;
}

function detailListsEditorUsesOverlay() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function renderDetailListsOverlay() {
  if (!detailListsDialogBody || detailMovieId == null) {
    return;
  }
  detailListsDialogBody.innerHTML = detailAddToListPickerHtml(detailMovieId);
}

function openDetailListsOverlay() {
  renderDetailListsOverlay();
  if (detailListsDialog) {
    detailListsDialog.hidden = false;
  }
}

function closeDetailListsOverlay() {
  if (detailListsDialog) {
    detailListsDialog.hidden = true;
  }
}

function syncDetailListsPickerUi() {
  if (detailListPickerOpen && detailListsEditorUsesOverlay()) {
    renderDetailListsOverlay();
    return;
  }
  renderDetail();
}

function detailListsBlockHtml(movieId) {
  if (!detailMovieShowsListsBlock(movieId)) {
    return "";
  }
  const membership = detailListMembershipChipsHtml(movieId);
  const membershipHtml = membership
    ? membership
    : `<span class="detail-lists-empty">Not on any lists</span>`;
  const inlineEditorOpen = detailListPickerOpen && !detailListsEditorUsesOverlay();

  return `<div class="detail-lists-block${inlineEditorOpen ? " is-editing" : ""}" id="detail-lists-block">
  <div class="detail-lists-panel"${inlineEditorOpen ? " hidden" : ""} id="detail-lists-summary">
    <span class="detail-lists-panel-title">Lists</span>
    <div class="detail-list-chips">${membershipHtml}</div>
    <button
      type="button"
      class="detail-lists-edit-btn"
      id="detail-lists-edit"
      aria-expanded="${detailListPickerOpen}"
      aria-controls="detail-lists-editor"
    >Edit</button>
  </div>
  <div class="detail-lists-editor" id="detail-lists-editor"${inlineEditorOpen ? "" : " hidden"}>
    <div class="detail-lists-editor-head">
      <span class="detail-lists-editor-title">Lists</span>
    </div>
    <div class="detail-lists-editor-body">
      ${detailAddToListPickerHtml(movieId)}
    </div>
    <div class="detail-lists-editor-actions">
      <button type="button" class="detail-lists-save-btn" id="detail-lists-save">Save</button>
    </div>
  </div>
</div>`;
}

function saveDetailListPicker() {
  if (detailMovieId == null) {
    return;
  }
  const movieId = detailMovieId;
  let nextLists = userState.customLists;
  let changed = false;

  for (const list of userState.customLists || []) {
    const isMember = list.movieIds.includes(movieId);
    const shouldBeMember = detailListPickerSelectedIds.has(list.id);
    if (shouldBeMember && !isMember) {
      const updated = appCustomLists.addMovieToCustomList(nextLists, list.id, movieId);
      if (updated !== nextLists) {
        nextLists = updated;
        changed = true;
      }
    } else if (!shouldBeMember && isMember) {
      const updated = appCustomLists.removeMovieFromCustomList(nextLists, list.id, movieId);
      if (updated !== nextLists) {
        nextLists = updated;
        changed = true;
      }
    }
  }

  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();

  if (changed) {
    persistCustomLists(nextLists);
    if (isCustomListDetailActive() && !activeMovieIds().includes(movieId)) {
      closeDetail();
      render();
      return;
    }
    render();
  }
  renderDetail();
}

function toggleDetailListPickerChip(listId) {
  if (!appCustomLists.isCustomListId(listId)) {
    return;
  }
  if (detailListPickerSelectedIds.has(listId)) {
    detailListPickerSelectedIds.delete(listId);
  } else {
    detailListPickerSelectedIds.add(listId);
  }
  syncDetailListsPickerUi();
}

function closeDetailListPicker() {
  if (!detailListPickerOpen) {
    return;
  }
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();
  renderDetail();
}

function toggleDetailListPicker() {
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  if (detailListPickerOpen) {
    closeDetailListPicker();
    return;
  }
  if (detailMovieId != null) {
    syncDetailListPickerSelection(detailMovieId);
  }
  detailListPickerOpen = true;
  if (detailListsEditorUsesOverlay()) {
    openDetailListsOverlay();
    renderDetail();
    return;
  }
  renderDetail();
}

function detailUserRatingBlockHtml(movieId) {
  if (!appRatings.isRatingAllowed(userState.lists, movieId, userState.customLists)) {
    return "";
  }

  const rating = appRatings.getRating(userState.ratings, movieId);
  const valueText = rating == null ? "—" : appRatings.formatUserRating(rating);
  const sliderValue = appRatings.sliderValueFromRating(rating);
  const editorOpen = detailRatingEditorOpen;
  const editorValueClass =
    rating == null ? "detail-rating-editor-value is-empty" : "detail-rating-editor-value";

  return `<div class="detail-rating-block${editorOpen ? " is-editing" : ""}" id="detail-rating-block">
  <div class="detail-rating-row"${editorOpen ? " hidden" : ""} id="detail-rating-summary-row">
    <span class="detail-rating-label">My Rating:</span>
    <button
      type="button"
      class="detail-rating-chip meta-chip${rating == null ? "" : " is-rated"}"
      id="detail-rating-summary"
      aria-expanded="${editorOpen}"
      aria-controls="detail-rating-editor"
      title="Edit my rating"
    >★ <span id="detail-rating-summary-value">${appCardHtml.escapeHtml(valueText)}</span></button>
  </div>
  <div class="detail-rating-editor" id="detail-rating-editor"${editorOpen ? "" : " hidden"}>
    <div class="detail-rating-editor-head">
      <span class="detail-rating-editor-title">My rating</span>
      <span class="${editorValueClass}" id="detail-rating-editor-value">${appCardHtml.escapeHtml(valueText)}</span>
    </div>
    <div class="detail-rating-slider-wrap">
      <span class="detail-rating-scale" aria-hidden="true">1</span>
      <div class="rating-control">
        <input
          type="range"
          class="detail-rating-slider rating-control-slider"
          id="detail-rating-slider"
          min="0"
          max="90"
          step="1"
          value="${sliderValue}"
          aria-label="My rating from 1 to 10"
          aria-valuetext="${rating == null ? "Not rated" : appRatings.formatUserRating(rating)}"
        />
        <select
          class="detail-rating-select rating-control-select"
          id="detail-rating-select"
          aria-label="My rating from 1 to 10"
        >${appRatings.ratingSelectInnerHtml(rating)}</select>
      </div>
      <span class="detail-rating-scale" aria-hidden="true">10</span>
    </div>
    <div class="detail-rating-editor-actions">
      <button type="button" class="detail-rating-btn detail-rating-btn--clear" id="detail-rating-clear"${rating == null ? " hidden" : ""}>Clear rating</button>
      <div class="detail-rating-editor-actions-main">
        <button type="button" class="detail-rating-btn detail-rating-btn--ghost" id="detail-rating-cancel">Cancel</button>
        <button type="button" class="detail-rating-btn detail-rating-btn--primary" id="detail-rating-done">Done</button>
      </div>
    </div>
  </div>
</div>`;
}

function syncDetailRatingDisplay(rating) {
  const chipValue = document.getElementById("detail-rating-summary-value");
  if (chipValue) {
    chipValue.textContent = rating == null ? "—" : appRatings.formatUserRating(rating);
  }

  const editorValue = document.getElementById("detail-rating-editor-value");
  if (editorValue) {
    editorValue.textContent = rating == null ? "—" : appRatings.formatUserRating(rating);
    editorValue.classList.toggle("is-empty", rating == null);
  }

  const slider = document.getElementById("detail-rating-slider");
  if (slider) {
    slider.value = String(
      rating == null
        ? appRatings.DEFAULT_SLIDER_VALUE
        : appRatings.sliderValueFromRating(rating),
    );
    slider.setAttribute(
      "aria-valuetext",
      rating == null ? "Not rated" : appRatings.formatUserRating(rating),
    );
  }

  const select = document.getElementById("detail-rating-select");
  if (select) {
    select.value = appRatings.ratingSelectDisplayValue(rating);
  }

  const clearBtn = document.getElementById("detail-rating-clear");
  if (clearBtn) {
    clearBtn.hidden = rating == null;
  }

  const summary = document.getElementById("detail-rating-summary");
  if (summary) {
    summary.classList.toggle("is-rated", rating != null);
  }
}

function syncDetailRatingEditorVisibility() {
  const block = document.getElementById("detail-rating-block");
  const summaryRow = document.getElementById("detail-rating-summary-row");
  const summary = document.getElementById("detail-rating-summary");
  const editor = document.getElementById("detail-rating-editor");
  if (!summary || !editor) {
    return;
  }
  block?.classList.toggle("is-editing", detailRatingEditorOpen);
  if (summaryRow) {
    summaryRow.hidden = detailRatingEditorOpen;
  }
  summary.setAttribute("aria-expanded", String(detailRatingEditorOpen));
  editor.hidden = !detailRatingEditorOpen;
}

function openDetailRatingEditor() {
  if (detailMovieId == null || !detailMovieAllowsRating()) {
    return;
  }
  detailRatingEditorSnapshot = appRatings.getRating(userState.ratings, detailMovieId);
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();
  detailRatingEditorOpen = true;
  renderDetail();
  focusDetailRatingControl();
}

function focusDetailRatingControl() {
  const mobile = window.matchMedia("(max-width: 640px)").matches;
  const select = document.getElementById("detail-rating-select");
  const slider = document.getElementById("detail-rating-slider");
  (mobile ? select : slider)?.focus({ preventScroll: true });
}

function closeDetailRatingEditor() {
  commitDetailRating();
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  syncDetailRatingEditorVisibility();
}

function cancelDetailRatingEditor() {
  if (detailMovieId == null) {
    return;
  }
  const snapshot = detailRatingEditorSnapshot;
  const current = appRatings.getRating(userState.ratings, detailMovieId);
  if (snapshot !== current) {
    const nextRatings =
      snapshot == null
        ? appRatings.removeRating(userState.ratings, detailMovieId)
        : appRatings.setRating(userState.ratings, detailMovieId, snapshot);
    updateRatings(nextRatings);
    persistUserState();
    refreshMovieRating(detailMovieId);
  }
  syncDetailRatingDisplay(snapshot);
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  syncDetailRatingEditorVisibility();
}

function toggleDetailRatingEditor() {
  if (detailRatingEditorOpen) {
    closeDetailRatingEditor();
    return;
  }
  openDetailRatingEditor();
}

function commitDetailRating() {
  if (detailMovieId == null) {
    return;
  }
  persistUserState();
  refreshMovieRating(detailMovieId);
}

function onDetailRatingSliderInput(event) {
  if (detailMovieId == null || !detailMovieAllowsRating()) {
    return;
  }
  const rating = appRatings.ratingFromSliderValue(Number(event.target.value));
  if (!updateRatings(appRatings.setRating(userState.ratings, detailMovieId, rating))) {
    return;
  }
  syncDetailRatingDisplay(rating);
}

function onDetailRatingSelectChange(event) {
  if (detailMovieId == null || !detailMovieAllowsRating()) {
    return;
  }
  const rating = appRatings.normalizeRating(event.target.value);
  if (!updateRatings(appRatings.setRating(userState.ratings, detailMovieId, rating))) {
    return;
  }
  syncDetailRatingDisplay(rating);
}

function clearDetailRating() {
  if (detailMovieId == null || !detailMovieAllowsRating()) {
    return;
  }
  if (!updateRatings(appRatings.removeRating(userState.ratings, detailMovieId))) {
    return;
  }
  persistUserState();
  refreshMovieRating(detailMovieId);
  syncDetailRatingDisplay(null);
}

function renderDetail() {
  if (detailMovieId == null) {
    return;
  }

  const ids = displayMovieIds();
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
${detailUserRatingBlockHtml(detailMovieId)}
<p class="movie-detail-overview">${appCardHtml.escapeHtml(record.overview || "No overview available.")}</p>
<div class="movie-detail-credits">${detailCreditsHtml(record)}</div>
${detailListsBlockHtml(detailMovieId)}`;
  }

  const leftActions = [];
  let removeBtn = "";

  if (isCustomListDetailActive()) {
    if (activeMovieIds().includes(detailMovieId)) {
      removeBtn = `<button type="button" class="detail-remove-btn" id="detail-remove-from-list">Remove from list</button>`;
    }
  } else {
    const inCollection = appLists.findListIdsForMovie(userState.lists, detailMovieId).length > 0;
    const onWatchlist = appLists.isOnWatchlist(userState.lists, detailMovieId);

    if (inCollection && onWatchlist) {
      leftActions.push(
        `<button type="button" class="card-watch-btn detail-watch-btn" id="detail-watch" aria-label="Mark as watched" title="Mark as watched">&#10003;</button>`,
      );
    }

    if (inCollection) {
      removeBtn = `<button type="button" class="detail-remove-btn" id="detail-remove">Remove movie</button>`;
    }
  }

  if (removeBtn) {
    leftActions.push(removeBtn);
  }

  detailActions.innerHTML = `<div class="detail-actions-left">${leftActions.join("")}</div>
<div class="detail-actions-right">
<a class="detail-link" href="${TMDB_MOVIE_URL}${detailMovieId}" target="_blank" rel="noopener noreferrer">View on TMDB</a></div>`;
}

function openDetail(movieId, options = {}) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  detailMovieId = id;
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();
  detailDialog.hidden = false;
  document.body.classList.add("movie-detail-open");
  renderDetail();
  detailCloseBtn.focus({ preventScroll: true });

  if (options.pushHistory !== false) {
    history.pushState(
      { detailMovieId: id, appView, activeCustomListId },
      "",
      `#movie/${id}`,
    );
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
  commitDetailRating();
  const hadHistoryEntry = history.state?.detailMovieId != null;
  detailMovieId = null;
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();
  detailDialog.hidden = true;
  document.body.classList.remove("movie-detail-open");

  if (options.popHistory !== false && hadHistoryEntry) {
    history.back();
  }
}

function stepDetail(delta) {
  const ids = displayMovieIds();
  const index = ids.indexOf(detailMovieId);
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return;
  }
  commitDetailRating();
  detailMovieId = ids[nextIndex];
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();
  history.replaceState(
    { detailMovieId, appView, activeCustomListId },
    "",
    `#movie/${detailMovieId}`,
  );
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

let pendingBackupRestoreFilename = null;

function formatSnapshotLabel(iso) {
  const time = Date.parse(iso || "");
  if (!Number.isFinite(time)) {
    return iso || "Unknown time";
  }
  return new Date(time).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function refreshGistBackupList() {
  if (!gistBackupSection || !gistBackupList) {
    return;
  }
  if (!gistSyncEnabled()) {
    gistBackupSection.hidden = true;
    gistBackupList.innerHTML = "";
    setStatus(gistBackupStatus, "", null);
    return;
  }
  gistBackupSection.hidden = false;
  gistBackupList.innerHTML =
    '<li class="gist-backup-empty">Loading snapshots…</li>';
  try {
    const snapshots = await listGistSnapshots();
    if (!snapshots.length) {
      gistBackupList.innerHTML =
        '<li class="gist-backup-empty">No snapshots yet. The first one is written on load when sync is active.</li>';
      setStatus(gistBackupStatus, "", null);
      return;
    }
    gistBackupList.innerHTML = snapshots
      .slice()
      .reverse()
      .map((entry) => {
        const label = formatSnapshotLabel(entry.at);
        const safeLabel = appCardHtml.escapeHtml(label);
        return `<li class="gist-backup-item"><button type="button" class="gist-backup-restore-btn" data-backup-at="${entry.at}" data-backup-label="${safeLabel}">Restore ${safeLabel}</button></li>`;
      })
      .join("");
    setStatus(
      gistBackupStatus,
      `${snapshots.length} snapshot${snapshots.length === 1 ? "" : "s"} stored (max ${appGistBackup.MAX_SNAPSHOTS}).`,
      "ok",
    );
  } catch (_) {
    gistBackupList.innerHTML =
      '<li class="gist-backup-empty">Could not load snapshots.</li>';
    setStatus(gistBackupStatus, "Could not reach the backup Gist.", "error");
  }
}

function openBackupRestoreConfirm(at, label) {
  pendingBackupRestoreFilename = at;
  backupRestoreMessage.textContent = `Restore your lists from the snapshot taken ${label}? Your current lists will be replaced and synced to GitHub.`;
  backupRestoreDialog.hidden = false;
}

function closeBackupRestoreConfirm() {
  pendingBackupRestoreFilename = null;
  backupRestoreDialog.hidden = true;
}

async function onConfirmBackupRestore() {
  const at = pendingBackupRestoreFilename;
  closeBackupRestoreConfirm();
  if (!at) {
    return;
  }
  setStatus(gistBackupStatus, "Restoring snapshot…", null);
  backupRestoreOk.disabled = true;
  try {
    const result = await restoreGistSnapshot(at);
    if (!result.ok) {
      setStatus(gistBackupStatus, result.error, "error");
      return;
    }
    closeSettings();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
  } finally {
    backupRestoreOk.disabled = false;
  }
}

function onGistBackupListClick(event) {
  const button = event.target.closest("[data-backup-at]");
  if (!button) {
    return;
  }
  openBackupRestoreConfirm(
    button.dataset.backupAt,
    button.dataset.backupLabel || "at that time",
  );
}

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
  const bundled = localMovieCount();
  setStatus(
    exportCsvStatus,
    bundled ? `${bundled} movies bundled in this build.` : "No bundled data yet.",
    bundled ? "ok" : null,
  );
}

function openSettings() {
  refreshSettings();
  refreshGistBackupList();
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

/**
 * Titles are for reading the committed file; only the ids drive the scrape. The
 * snapshot is the second source because only the active list gets hydrated.
 */
function csvTitleFor(movieId) {
  return movieById.get(movieId)?.title || localMovieRecord(movieId)?.title || "";
}

function onExportCsv() {
  const rows = appListCsv.listCsvRows(userState, csvTitleFor);
  if (!rows.length) {
    setStatus(exportCsvStatus, "Nothing to export yet.", null);
    return;
  }
  const blob = new Blob([appListCsv.buildListCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = appListCsv.CSV_FILENAME;
  link.click();
  URL.revokeObjectURL(objectUrl);
  setStatus(exportCsvStatus, `Exported ${rows.length} movies.`, "ok");
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
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
    refreshGistBackupList();
  } finally {
    gistConnectBtn.disabled = false;
  }
}

function onDisconnectGist() {
  disconnectGist();
  refreshSettings();
  refreshGistBackupList();
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
 * Drag reorder for card grid views, ported from arkham's want-list engine.
 *
 * Targets are chosen by overlap area so the same code works in the 2D card grid.
 * There is no gate: the stored order is the only order, so nothing can
 * disagree with what was dragged.
 */

const EDGE_SCROLL_ZONE = 72;
const EDGE_SCROLL_SPEED = 18;

const LIFT_CONFIG = {
  liftSelector: ".card",
  targetSelector: ".movie-row--card .card",
  floatingClass: "movie-card-floating",
};

let dragState = null;

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
  if (!appLists.isListReorderable(userState.activeListId) || !reorderModeActive) {
    return;
  }
  const handle = event.target.closest(".card-grip");
  if (!handle || dragState || (event.pointerType === "mouse" && event.button !== 0)) {
    return;
  }

  const source = handle.closest(LIFT_CONFIG.liftSelector);
  const movieId = elementMovieId(source);
  if (!source || !Number.isInteger(movieId)) {
    return;
  }

  event.preventDefault();
  const rect = source.getBoundingClientRect();
  const floatEl = source.cloneNode(true);
  floatEl.classList.add(LIFT_CONFIG.floatingClass);
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
    grid.querySelectorAll(LIFT_CONFIG.targetSelector),
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
  if (!list || targetId == null || !appLists.isListReorderable(list.id)) {
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

/* ===== Watched list filter search chips and suggestions ===== */

/* Watched list metadata filter — chips, field autocomplete, compound query */

const listSearchRow = document.getElementById("list-search-row");
const listSearchInput = document.getElementById("list-search");
const listSearchChips = document.getElementById("list-search-chips");
const listSearchFieldSuggest = document.getElementById("list-search-suggest");
const listSearchClearBtn = document.getElementById("list-search-clear");

/** @type {{ type: string, label: string }[]} */
const listSearchFilterChips = [];
let listSearchSuggestIndex = -1;
let listSearchRenderTimer = null;

function getActiveListSuggestField() {
  if (appListSearch.getYearSuggestDraft(listSearchInput.value)) {
    return appListSearch.getFieldByKey("year");
  }
  return appListSearch.getActiveDraftField(listSearchInput.value);
}

function getListFieldDraftForSuggest(field) {
  if (field?.key === "year") {
    return appListSearch.getYearSuggestDraft(listSearchInput.value);
  }
  return appListSearch.parseFieldDraftInput(listSearchInput.value, field);
}

function watchedMoviesForListSearch() {
  const list = appLists.findList(userState.lists, appLists.WATCHED_ID);
  const ids = list?.movieIds || [];
  return ids
    .map((id) => movieById.get(id))
    .filter(Boolean);
}

function getKnownListFieldValues(fieldKey) {
  const field = appListSearch.getFieldByKey(fieldKey);
  if (!field) {
    return [];
  }
  const scopedMovies = appListSearch.filterMoviesMatchingFieldTerms(
    watchedMoviesForListSearch(),
    appListSearch.chipsToFieldTermsPartial(listSearchFilterChips, fieldKey),
  );
  return field.collectValues(scopedMovies);
}

function getListSearchFilter() {
  return appListSearch.buildSearchFilter(
    listSearchFilterChips,
    listSearchInput.value,
  );
}

function hasActiveListSearch() {
  if (listSearchFilterChips.length > 0) {
    return true;
  }
  const draft = listSearchInput.value.trim();
  if (!draft || appListSearch.isSearchDraftBlockingText(draft)) {
    return false;
  }
  const filter = appListSearch.buildSearchFilter([], draft);
  return appListSearch.hasAnyFilterTerms(filter);
}

function updateListSearchClearVisibility() {
  if (listSearchClearBtn) {
    listSearchClearBtn.hidden = !hasActiveListSearch();
  }
}

function listSearchRenderNow() {
  if (listSearchRenderTimer) {
    clearTimeout(listSearchRenderTimer);
    listSearchRenderTimer = null;
  }
  render();
}

function debouncedListSearchRender() {
  if (listSearchRenderTimer) {
    clearTimeout(listSearchRenderTimer);
  }
  listSearchRenderTimer = setTimeout(() => {
    listSearchRenderTimer = null;
    render();
  }, 200);
}

function renderListSearchChips() {
  if (!listSearchChips) {
    return;
  }
  listSearchChips.innerHTML = listSearchFilterChips
    .map((chip, index) => {
      const field = appListSearch.getFieldByKey(chip.type);
      const safe = appCardHtml.escapeHtml(chip.label);
      const ariaPrefix = field?.chipAriaPrefix || chip.type;
      return `<span class="search-field-chip search-field-chip--${chip.type}"><span class="search-field-chip-label">${safe}</span><button type="button" class="search-field-chip-remove" data-list-search-chip-index="${index}" aria-label="Remove ${ariaPrefix} ${safe}">&times;</button></span>`;
    })
    .join("");
}

function hideListSearchSuggest() {
  listSearchSuggestIndex = -1;
  if (!listSearchFieldSuggest || !listSearchInput) {
    return;
  }
  listSearchFieldSuggest.hidden = true;
  listSearchFieldSuggest.innerHTML = "";
  listSearchInput.setAttribute("aria-expanded", "false");
}

function getListSuggestItems() {
  const field = getActiveListSuggestField();
  if (!field) {
    return [];
  }
  const draft = getListFieldDraftForSuggest(field);
  if (!draft) {
    return [];
  }
  const exclude = listSearchFilterChips
    .filter((chip) => chip.type === field.key)
    .map((chip) => chip.label);
  return appListSearch.filterFieldSuggestions(
    draft.partial,
    field,
    getKnownListFieldValues(field.key),
    { exclude },
  );
}

function renderListSearchSuggest() {
  const field = getActiveListSuggestField();
  const items = getListSuggestItems();
  if (!field || !items.length || !listSearchFieldSuggest || !listSearchInput) {
    hideListSearchSuggest();
    return;
  }

  listSearchFieldSuggest.innerHTML = items
    .map((label, index) => {
      const safe = appCardHtml.escapeHtml(label);
      const activeClass = index === listSearchSuggestIndex ? " active" : "";
      return `<li class="search-field-suggest-item search-field-suggest-item--${field.key}${activeClass}" role="option" data-list-suggest-index="${index}" aria-selected="${index === listSearchSuggestIndex}">${safe}</li>`;
    })
    .join("");
  listSearchFieldSuggest.hidden = false;
  listSearchInput.setAttribute("aria-expanded", "true");
}

function updateListSearchSuggest() {
  if (!getActiveListSuggestField()) {
    hideListSearchSuggest();
    return;
  }
  if (listSearchSuggestIndex >= getListSuggestItems().length) {
    listSearchSuggestIndex = -1;
  }
  renderListSearchSuggest();
}

function addListSearchChip(fieldKey, label, options = {}) {
  const field = appListSearch.getFieldByKey(fieldKey);
  if (!field) {
    return false;
  }
  const known = getKnownListFieldValues(fieldKey);
  const canonical = field.formatLabel(label, known);
  if (!canonical) {
    return false;
  }
  if (
    listSearchFilterChips.some(
      (chip) =>
        chip.type === fieldKey &&
        field.labelKey(chip.label) === field.labelKey(canonical),
    )
  ) {
    return false;
  }
  listSearchFilterChips.push({ type: fieldKey, label: canonical });
  renderListSearchChips();
  if (!options.silent) {
    updateListSearchClearVisibility();
    updateListSearchSuggest();
    debouncedListSearchRender();
  }
  return true;
}

function removeListSearchChipAt(index) {
  if (index < 0 || index >= listSearchFilterChips.length) {
    return;
  }
  listSearchFilterChips.splice(index, 1);
  renderListSearchChips();
  updateListSearchClearVisibility();
  updateListSearchSuggest();
  listSearchRenderNow();
}

function absorbListSearchInputTokens() {
  const trimmed = listSearchInput.value.trim();
  const activeField = appListSearch.getActiveDraftField(trimmed);

  if (activeField && activeField.key !== "year") {
    const draftAbsorbed = appListSearch.absorbFieldDraftInput(
      trimmed,
      activeField,
      getKnownListFieldValues(activeField.key),
    );
    if (draftAbsorbed) {
      if (draftAbsorbed.chipLabel) {
        addListSearchChip(activeField.key, draftAbsorbed.chipLabel, { silent: true });
      }
      listSearchInput.value = draftAbsorbed.remainder;
      return;
    }
  }

  const parsed = appListSearch.parseCompoundSearchQuery(listSearchInput.value);
  const unknownParts = [];

  for (const field of appListSearch.SEARCH_FIELD_TYPES) {
    if (field.key === "year") {
      continue;
    }
    const known = getKnownListFieldValues(field.key);
    for (const term of parsed.fieldTerms[field.key] || []) {
      const label = appListSearch.resolveKnownFieldLabel(term, field, known);
      if (label) {
        addListSearchChip(field.key, label, { silent: true });
      } else {
        unknownParts.push(field.formatQuery(term));
      }
    }
  }

  listSearchInput.value = [...unknownParts, ...parsed.textTerms].join(" ").trim();
}

function pickListSearchSuggestion(index) {
  const field = getActiveListSuggestField();
  const items = getListSuggestItems();
  const label = items[index];
  if (!field || !label) {
    return;
  }
  const draft = getListFieldDraftForSuggest(field);
  const prefix = draft?.prefix?.trim() || "";
  addListSearchChip(field.key, label, { silent: true });
  listSearchInput.value = prefix;
  hideListSearchSuggest();
  updateListSearchClearVisibility();
  listSearchRenderNow();
}

function clearListSearchState() {
  listSearchFilterChips.length = 0;
  listSearchInput.value = "";
  renderListSearchChips();
  hideListSearchSuggest();
  updateListSearchClearVisibility();
}

function clearListSearchAll() {
  clearListSearchState();
  listSearchRenderNow();
}

function syncListSearchVisibility() {
  if (!listSearchRow) {
    return;
  }
  const show =
    isWatchedListActive() && activeMovieIds().length > 0 && hasMovieData();
  listSearchRow.hidden = !show;
}

function onListSearchInput() {
  updateListSearchClearVisibility();
  updateListSearchSuggest();
  debouncedListSearchRender();
}

function onListSearchCommit() {
  absorbListSearchInputTokens();
  hideListSearchSuggest();
  updateListSearchClearVisibility();
  listSearchRenderNow();
}

if (listSearchChips) {
  listSearchChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-list-search-chip-index]");
    if (!button) {
      return;
    }
    removeListSearchChipAt(Number(button.dataset.listSearchChipIndex));
  });
}

if (listSearchFieldSuggest) {
  listSearchFieldSuggest.addEventListener("mousedown", (event) => {
    const item = event.target.closest("[data-list-suggest-index]");
    if (!item) {
      return;
    }
    event.preventDefault();
    pickListSearchSuggestion(Number(item.dataset.listSuggestIndex));
  });
}

if (listSearchInput) {
  listSearchInput.addEventListener("keydown", (event) => {
    const items = getListSuggestItems();
    const suggestOpen = items.length > 0 && !listSearchFieldSuggest.hidden;
    const activeField = getActiveListSuggestField();

    if (event.key === "Backspace" && !listSearchInput.value && listSearchFilterChips.length) {
      removeListSearchChipAt(listSearchFilterChips.length - 1);
      return;
    }

    if (event.key === " " && !suggestOpen && activeField && activeField.key !== "year") {
      const draft = appListSearch.parseFieldDraftInput(
        listSearchInput.value.trim(),
        activeField,
      );
      if (draft?.partial) {
        const label = appListSearch.resolveKnownFieldLabel(
          draft.partial,
          activeField,
          getKnownListFieldValues(activeField.key),
        );
        if (label) {
          event.preventDefault();
          addListSearchChip(activeField.key, label, { silent: true });
          listSearchInput.value = draft.prefix?.trim() || "";
          updateListSearchClearVisibility();
          updateListSearchSuggest();
          listSearchRenderNow();
        }
      }
      return;
    }

    if (!suggestOpen) {
      if (event.key === "Escape") {
        hideListSearchSuggest();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      listSearchSuggestIndex = (listSearchSuggestIndex + 1) % items.length;
      renderListSearchSuggest();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      listSearchSuggestIndex =
        listSearchSuggestIndex <= 0 ? items.length - 1 : listSearchSuggestIndex - 1;
      renderListSearchSuggest();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (listSearchSuggestIndex >= 0) {
        pickListSearchSuggestion(listSearchSuggestIndex);
      } else {
        onListSearchCommit();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      hideListSearchSuggest();
    }
  });

  listSearchInput.addEventListener("blur", () => {
    window.setTimeout(() => {
      absorbListSearchInputTokens();
      hideListSearchSuggest();
      updateListSearchClearVisibility();
      listSearchRenderNow();
    }, 120);
  });

  listSearchInput.addEventListener("input", onListSearchInput);
  listSearchInput.addEventListener("search", onListSearchCommit);
  listSearchInput.addEventListener("change", onListSearchCommit);
}

if (listSearchClearBtn) {
  listSearchClearBtn.addEventListener("click", () => {
    clearListSearchAll();
    listSearchInput.focus();
  });
}

document.addEventListener("click", (event) => {
  if (
    listSearchFieldSuggest &&
    !listSearchFieldSuggest.hidden &&
    !event.target.closest(".list-search-wrap")
  ) {
    hideListSearchSuggest();
  }
});

/* ===== Custom lists routing, index CRUD, and watchlist picker ===== */

/**
 * Custom lists: hash routing (#lists, #lists/{id}), index CRUD, watched picker.
 */

let pendingCustomListRenameId = null;
let customListIndexSort = appCustomLists.DEFAULT_CUSTOM_LIST_INDEX_SORT;
const selectedAddCustomListIds = new Set();
const watchedPickerSelectedIds = new Set();
/** Ids shown in the watched picker; kept so hydration can re-render rows. */
let watchedPickerAvailableIds = [];

function parseLocationHash() {
  const hash = window.location.hash || "";
  const movieMatch = /^#movie\/(\d+)$/.exec(hash);
  if (movieMatch) {
    return { kind: "movie", movieId: Number(movieMatch[1]) };
  }
  const listDetailMatch = /^#lists\/([^/]+)$/.exec(hash);
  if (listDetailMatch) {
    return { kind: "customDetail", listId: decodeURIComponent(listDetailMatch[1]) };
  }
  if (hash === "#lists" || hash === "#lists/") {
    return { kind: "customIndex" };
  }
  return { kind: "main" };
}

function syncAppViewChrome() {
  document.body.classList.toggle("view-custom-index", isCustomListIndexActive());
  document.body.classList.toggle("view-custom-detail", isCustomListDetailActive());
  if (customListsIndex) {
    customListsIndex.hidden = !isCustomListIndexActive();
  }
  if (listTabs) {
    listTabs.hidden = isCustomListView();
  }
  if (listsNavBtn) {
    listsNavBtn.textContent = isCustomListView() ? "Collection" : "Lists";
  }
  if (customListBackBtn) {
    customListBackBtn.hidden = !isCustomListDetailActive();
  }
  if (customListsIndexTitle) {
    customListsIndexTitle.hidden = !isCustomListIndexActive();
  }
  if (customListsIndexActions) {
    customListsIndexActions.hidden = !isCustomListIndexActive();
  }
  if (addMovieFab) {
    addMovieFab.hidden = isCustomListIndexActive();
  }
  updateListHeader();
}

function navigateToMain(options = {}) {
  appView = "main";
  activeCustomListId = null;
  if (options.pushHistory !== false) {
    const base = window.location.pathname + window.location.search;
    history.pushState({ appView: "main" }, "", base);
  }
  syncAppViewChrome();
  refreshViewModeForActiveList();
  render();
  if (!options.skipHydrate) {
    hydrateActiveList();
  }
}

function navigateHomeToWatched(options = {}) {
  closeDetail({ popHistory: false });
  closeWatchedPicker();
  appView = "main";
  activeCustomListId = null;
  if (userState.activeListId !== appLists.WATCHED_ID) {
    userState = { ...userState, activeListId: appLists.WATCHED_ID };
    reorderModeActive = false;
    persistUserState();
  }
  if (options.pushHistory !== false) {
    const base = window.location.pathname + window.location.search;
    history.pushState({ appView: "main" }, "", base);
  }
  syncAppViewChrome();
  refreshViewModeForActiveList();
  render();
  hydrateActiveList();
}

function navigateToCustomListsIndex(options = {}) {
  appView = "customIndex";
  activeCustomListId = null;
  closeDetail({ popHistory: false });
  if (options.pushHistory !== false) {
    history.pushState({ appView: "customIndex" }, "", "#lists");
  }
  syncAppViewChrome();
  renderCustomListsIndex();
}

function navigateToCustomList(listId, options = {}) {
  if (!appCustomLists.isCustomListId(listId)) {
    navigateToCustomListsIndex(options);
    return;
  }
  const list = appCustomLists.findCustomList(userState.customLists, listId);
  if (!list) {
    navigateToCustomListsIndex(options);
    return;
  }
  closeDetail({ popHistory: false });
  appView = "customDetail";
  activeCustomListId = listId;
  if (options.pushHistory !== false) {
    history.pushState(
      { appView: "customDetail", activeCustomListId: listId },
      "",
      `#lists/${encodeURIComponent(listId)}`,
    );
  }
  syncAppViewChrome();
  refreshViewModeForActiveList();
  render();
  hydrateActiveList();
}

function syncViewFromLocation() {
  const parsed = parseLocationHash();
  if (parsed.kind === "movie") {
    const state = history.state;
    if (state?.appView) {
      appView = state.appView;
      activeCustomListId = state.activeCustomListId ?? null;
    } else if (!isCustomListView()) {
      appView = "main";
      activeCustomListId = null;
    }
    syncAppViewChrome();
    refreshViewModeForActiveList();
    if (isCustomListIndexActive()) {
      renderCustomListsIndex();
    } else {
      render();
    }
    syncDetailFromLocation();
    return;
  }

  closeDetail({ popHistory: false });

  if (parsed.kind === "customIndex") {
    appView = "customIndex";
    activeCustomListId = null;
    syncAppViewChrome();
    renderCustomListsIndex();
    return;
  }

  if (parsed.kind === "customDetail") {
    const list = appCustomLists.findCustomList(userState.customLists, parsed.listId);
    if (list) {
      appView = "customDetail";
      activeCustomListId = parsed.listId;
      syncAppViewChrome();
      refreshViewModeForActiveList();
      render();
      hydrateActiveList();
      return;
    }
    navigateToCustomListsIndex({ pushHistory: false });
    return;
  }

  appView = "main";
  activeCustomListId = null;
  syncAppViewChrome();
  refreshViewModeForActiveList();
  render();
  hydrateActiveList();
}

function onListsNavClick() {
  if (isCustomListView()) {
    navigateToMain();
  } else {
    navigateToCustomListsIndex();
  }
}

function persistCustomLists(nextLists, nextTombstones) {
  userState = {
    ...userState,
    customLists: nextLists,
    customListTombstones: nextTombstones ?? userState.customListTombstones,
    ratings: appRatings.normalizeRatings(userState.ratings, userState.lists, nextLists),
  };
  persistUserState();
}

function renderCustomListsIndex() {
  if (!customListsRows) {
    return;
  }
  const lists = appCustomLists.sortCustomListsForIndex(
    userState.customLists || [],
    customListIndexSort,
  );
  const atMax = (userState.customLists || []).length >= appCustomLists.MAX_CUSTOM_LISTS;
  if (customListCreateBtn) {
    customListCreateBtn.disabled = atMax;
    customListCreateBtn.title = atMax ? "Maximum of 10 lists" : "";
  }
  if (customListsSortSelect) {
    customListsSortSelect.value = customListIndexSort;
  }
  if (customListsSortControl) {
    customListsSortControl.hidden = lists.length === 0;
  }
  if (customListsEmpty) {
    customListsEmpty.hidden = lists.length > 0;
  }
  customListsRows.innerHTML = lists
    .map((list) => {
      const renaming = pendingCustomListRenameId === list.id;
      const countLabel = `${list.movieIds.length} ${list.movieIds.length === 1 ? "movie" : "movies"}`;
      const mainInner = renaming
        ? `<input type="text" class="custom-list-rename-input" data-rename-input="${appCardHtml.escapeHtml(list.id)}" value="${appCardHtml.escapeHtml(list.name)}" maxlength="${appCustomLists.MAX_NAME_LENGTH}" aria-label="Rename list">`
        : `<span class="custom-list-row-name">${appCardHtml.escapeHtml(list.name)}</span><span class="custom-list-row-count">${countLabel}</span>`;
      return `<li class="custom-list-row" data-custom-list-id="${appCardHtml.escapeHtml(list.id)}">
  ${
    renaming
      ? `<div class="custom-list-row-main">${mainInner}</div>`
      : `<button type="button" class="custom-list-row-main" data-open-custom-list="${appCardHtml.escapeHtml(list.id)}">${mainInner}</button>`
  }
  <div class="custom-list-row-actions">
    <button type="button" class="custom-list-row-btn" data-rename-custom-list="${appCardHtml.escapeHtml(list.id)}">${renaming ? "Save" : "Rename"}</button>
    <button type="button" class="custom-list-row-btn custom-list-row-btn--danger" data-delete-custom-list="${appCardHtml.escapeHtml(list.id)}">Delete</button>
  </div>
</li>`;
    })
    .join("");

  if (pendingCustomListRenameId) {
    const input = customListsRows.querySelector(
      `[data-rename-input="${CSS.escape(pendingCustomListRenameId)}"]`,
    );
    input?.focus({ preventScroll: true });
    input?.select();
  }
}

function onCustomListIndexSortChange() {
  if (!customListsSortSelect) {
    return;
  }
  customListIndexSort = appCustomLists.normalizeCustomListIndexSort(
    customListsSortSelect.value,
  );
  renderCustomListsIndex();
}

function promptCreateCustomListName() {
  const name = window.prompt("List name (1–40 characters):");
  if (name == null) {
    return;
  }
  const trimmed = appCustomLists.normalizeName(name);
  if (!trimmed) {
    window.alert("Enter a list name.");
    return;
  }
  const next = appCustomLists.createCustomList(userState.customLists, trimmed);
  if (next === userState.customLists) {
    window.alert("Could not create list. You may be at the limit or the name is already in use.");
    return;
  }
  persistCustomLists(next);
  renderCustomListsIndex();
}

function startRenameCustomList(listId) {
  if (pendingCustomListRenameId === listId) {
    commitRenameCustomList(listId);
    return;
  }
  pendingCustomListRenameId = listId;
  renderCustomListsIndex();
}

function commitRenameCustomList(listId) {
  const input = customListsRows?.querySelector(
    `[data-rename-input="${CSS.escape(listId)}"]`,
  );
  const name = input?.value ?? "";
  pendingCustomListRenameId = null;
  const next = appCustomLists.renameCustomList(userState.customLists, listId, name);
  if (next === userState.customLists) {
    window.alert("Could not rename. Check the name length and that it is unique.");
    renderCustomListsIndex();
    return;
  }
  persistCustomLists(next);
  renderCustomListsIndex();
  if (isCustomListDetailActive() && activeCustomListId === listId) {
    updateListHeader();
  }
}

function requestDeleteCustomList(listId) {
  const list = appCustomLists.findCustomList(userState.customLists, listId);
  if (!list) {
    return;
  }
  pendingCustomListDeleteId = listId;
  customListDeleteMessage.textContent = `Delete “${list.name}”? Movies stay in Watched, Watchlist, and other lists.`;
  customListDeleteDialog.hidden = false;
  customListDeleteCancel.focus({ preventScroll: true });
}

function closeCustomListDeleteConfirm() {
  pendingCustomListDeleteId = null;
  customListDeleteDialog.hidden = true;
}

function confirmDeleteCustomList() {
  const listId = pendingCustomListDeleteId;
  closeCustomListDeleteConfirm();
  if (!listId) {
    return;
  }
  const { customLists, tombstones } = appCustomLists.deleteCustomList(
    userState.customLists,
    userState.customListTombstones,
    listId,
  );
  persistCustomLists(customLists, tombstones);
  if (isCustomListDetailActive() && activeCustomListId === listId) {
    navigateToCustomListsIndex();
    return;
  }
  renderCustomListsIndex();
}

function removeMovieFromCustomListById(movieId, listId) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || !appCustomLists.isCustomListId(listId)) {
    return;
  }
  const next = appCustomLists.removeMovieFromCustomList(userState.customLists, listId, id);
  if (next === userState.customLists) {
    return;
  }
  persistCustomLists(next);
  if (
    isCustomListDetailActive() &&
    activeCustomListId === listId &&
    detailMovieId === id &&
    !activeMovieIds().includes(id)
  ) {
    closeDetail();
    render();
    return;
  }
  render();
  if (detailMovieId === id) {
    renderDetail();
  }
}

function removeMovieFromCustomListView(movieId) {
  if (!isCustomListDetailActive()) {
    return;
  }
  removeMovieFromCustomListById(movieId, activeCustomListId);
}

function requestRemoveFromCustomList(movieId) {
  pendingRemoveMovieId = Number(movieId);
  const record = movieById.get(pendingRemoveMovieId);
  const title = record?.title || `Movie ${pendingRemoveMovieId}`;
  const listName = getActiveDisplayContext().listName;
  removeConfirmMessage.textContent = `Remove “${title}” from “${listName}”?`;
  removeConfirmDialog.hidden = false;
  removeConfirmCancel.focus({ preventScroll: true });
}

function renderAddMovieCustomListPicker() {
  const lists = userState.customLists || [];
  const hasLists = lists.length > 0;
  if (addMovieCustomListsSection) {
    addMovieCustomListsSection.hidden = !hasLists;
  }
  if (addMovieCustomListsEmpty) {
    addMovieCustomListsEmpty.hidden = hasLists;
  }
  if (!addMovieCustomListPicker || !hasLists) {
    return;
  }
  addMovieCustomListPicker.innerHTML = lists
    .map((list) => {
      const selected = selectedAddCustomListIds.has(list.id);
      return `<button type="button" class="add-custom-list-chip" data-custom-list-id="${appCardHtml.escapeHtml(list.id)}" aria-pressed="${selected}">${appCardHtml.escapeHtml(list.name)}</button>`;
    })
    .join("");
}

function resetAddMovieCustomListSelection() {
  selectedAddCustomListIds.clear();
  if (isCustomListDetailActive() && activeCustomListId) {
    selectedAddCustomListIds.add(activeCustomListId);
  }
  renderAddMovieCustomListPicker();
}

function syncAddMovieSubmitState() {
  if (isCustomListDetailActive()) {
    if (addMovieSubmit) {
      addMovieSubmit.disabled = selectedAddCustomListIds.size === 0;
    }
    return;
  }
  if (addMovieSubmit) {
    addMovieSubmit.disabled = selectedAddListId == null;
  }
}

function primeMovieRecords(ids) {
  for (const id of ids) {
    if (movieById.has(id)) {
      continue;
    }
    const local = localMovieById.get(id);
    if (local) {
      movieById.set(id, local);
      movieErrors.delete(id);
    }
  }
}

function watchedPickerDisplayIds() {
  return appSort.sortMovieIds(watchedPickerAvailableIds, "title-asc", {
    getRecord: (id) => movieById.get(id) ?? localMovieRecord(id),
  });
}

function renderWatchedPickerList() {
  if (!watchlistPickerList) {
    return;
  }
  const available = watchedPickerDisplayIds();
  if (watchlistPickerEmpty) {
    watchlistPickerEmpty.hidden = available.length > 0;
  }
  watchlistPickerList.hidden = available.length === 0;
  watchlistPickerList.innerHTML = available
    .map((id) => {
      const record = movieById.get(id);
      const title = record?.title || `Movie ${id}`;
      const year = record ? appCardHtml.formatYear(record.releaseDate) : "";
      const posterUrl = record
        ? appTmdb.buildImageUrl(record.posterPath, appTmdb.POSTER_SIZES.suggest)
        : null;
      const poster = posterUrl
        ? `<img class="watchlist-picker-poster" data-poster-src="${appCardHtml.escapeHtml(posterUrl)}" alt="" loading="lazy">`
        : `<span class="watchlist-picker-poster watchlist-picker-poster--empty"></span>`;
      const selected = watchedPickerSelectedIds.has(id);
      return `<li class="watchlist-picker-item">
  <button type="button" class="watchlist-picker-row" data-watched-pick-id="${id}" aria-pressed="${selected}">
    ${poster}
    <span class="watchlist-picker-text">
      <span class="watchlist-picker-title">${appCardHtml.escapeHtml(title)}</span>
      ${year ? `<span class="watchlist-picker-meta">${appCardHtml.escapeHtml(year)}</span>` : ""}
    </span>
  </button>
</li>`;
    })
    .join("");
  bindPosterImages(watchlistPickerList);
}

function openWatchedPicker(options = {}) {
  if (!isCustomListDetailActive()) {
    return;
  }
  if (!options.preserveSelection) {
    watchedPickerSelectedIds.clear();
  }
  const watchedIds =
    appLists.findList(userState.lists, appLists.WATCHED_ID)?.movieIds || [];
  const inList = new Set(
    appCustomLists.findCustomList(userState.customLists, activeCustomListId)?.movieIds ||
      [],
  );
  watchedPickerAvailableIds = watchedIds.filter((id) => !inList.has(id));
  primeMovieRecords(watchedPickerAvailableIds);
  renderWatchedPickerList();
  syncWatchedPickerSubmit();
  watchlistPickerDialog.hidden = false;
  watchlistPickerClose?.focus({ preventScroll: true });

  const missing = watchedPickerAvailableIds.filter((id) => !movieById.has(id));
  if (missing.length && hasTmdbAccess()) {
    hydrateMovies(missing, {
      onRecord: () => {
        if (!watchlistPickerDialog.hidden) {
          renderWatchedPickerList();
        }
      },
      onUpdate: () => {
        if (!watchlistPickerDialog.hidden) {
          renderWatchedPickerList();
        }
      },
    });
  }
}

function closeWatchedPicker() {
  watchlistPickerDialog.hidden = true;
  watchedPickerSelectedIds.clear();
  watchedPickerAvailableIds = [];
}

function backFromWatchedPickerToAddMovie() {
  closeWatchedPicker();
  openAddMovieDialog();
}

function syncWatchedPickerSubmit() {
  if (watchlistPickerSubmit) {
    watchlistPickerSubmit.disabled = watchedPickerSelectedIds.size === 0;
  }
}

function confirmWatchedPicker() {
  if (!isCustomListDetailActive() || watchedPickerSelectedIds.size === 0) {
    return;
  }
  let nextLists = userState.customLists;
  for (const id of watchedPickerSelectedIds) {
    nextLists = appCustomLists.addMovieToCustomList(nextLists, activeCustomListId, id);
  }
  persistCustomLists(nextLists);
  closeWatchedPicker();
  render();
  hydrateMovies([...watchedPickerSelectedIds], {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
}

function onCustomListsIndexClick(event) {
  const openBtn = event.target.closest("[data-open-custom-list]");
  if (openBtn) {
    navigateToCustomList(openBtn.dataset.openCustomList);
    return;
  }
  const renameBtn = event.target.closest("[data-rename-custom-list]");
  if (renameBtn) {
    startRenameCustomList(renameBtn.dataset.renameCustomList);
    return;
  }
  const deleteBtn = event.target.closest("[data-delete-custom-list]");
  if (deleteBtn) {
    requestDeleteCustomList(deleteBtn.dataset.deleteCustomList);
  }
}

function onCustomListsIndexKeydown(event) {
  if (event.key !== "Enter" || !pendingCustomListRenameId) {
    return;
  }
  const input = event.target.closest("[data-rename-input]");
  if (input) {
    event.preventDefault();
    commitRenameCustomList(pendingCustomListRenameId);
  }
}

function onAddMovieCustomListPickerClick(event) {
  const chip = event.target.closest("[data-custom-list-id]");
  if (!chip) {
    return;
  }
  const listId = chip.dataset.customListId;
  if (selectedAddCustomListIds.has(listId)) {
    selectedAddCustomListIds.delete(listId);
  } else {
    selectedAddCustomListIds.add(listId);
  }
  const selected = selectedAddCustomListIds.has(listId);
  chip.setAttribute("aria-pressed", String(selected));
  syncAddMovieSubmitState();
}

function onWatchedPickerClick(event) {
  const row = event.target.closest("[data-watched-pick-id]");
  if (!row) {
    return;
  }
  const id = Number(row.dataset.watchedPickId);
  if (watchedPickerSelectedIds.has(id)) {
    watchedPickerSelectedIds.delete(id);
  } else {
    watchedPickerSelectedIds.add(id);
  }
  const selected = watchedPickerSelectedIds.has(id);
  row.setAttribute("aria-pressed", String(selected));
  syncWatchedPickerSubmit();
}

function onRemoteCustomListsAdopted() {
  if (isCustomListDetailActive()) {
    const list = appCustomLists.findCustomList(userState.customLists, activeCustomListId);
    if (!list) {
      navigateToCustomListsIndex({ pushHistory: false });
    }
  }
  if (isCustomListIndexActive()) {
    renderCustomListsIndex();
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
searchDirectorToggle?.addEventListener("change", onSearchDirectorToggleChange);

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
emptyState.addEventListener("click", (event) => {
  if (event.target.closest(".empty-state-add-btn")) {
    openAddMovieDialog();
  }
});
addMovieClose.addEventListener("click", closeAddMovieDialog);
addMovieBack.addEventListener("click", () => {
  showAddSearchStep();
  searchInput.focus();
});
addMovieTabAdd?.addEventListener("click", onAddMoviePickTabClick);
addMovieTabDetail?.addEventListener("click", onAddMoviePickTabClick);
addMovieListPicker.addEventListener("click", onAddListOptionClick);
addMovieSubmit.addEventListener("click", confirmAddMovie);
initAddMovieRatingSelect();
bindRangeSliderLiveInput(addMovieRatingSlider, onAddMovieRatingSliderInput);
addMovieRatingSelect?.addEventListener("change", onAddMovieRatingSelectChange);
addMovieRatingClear?.addEventListener("click", clearAddMovieRating);

/* --- Grid --- */

grid.addEventListener("click", (event) => {
  const watchBtn = event.target.closest(".card-watch-btn");
  if (watchBtn) {
    event.stopPropagation();
    requestWatchMovie(Number(watchBtn.closest("[data-movie-id]").dataset.movieId));
    return;
  }
  const removeBtn = event.target.closest(".card-remove-btn");
  if (removeBtn) {
    event.stopPropagation();
    const movieId = Number(removeBtn.closest("[data-movie-id]").dataset.movieId);
    if (isCustomListDetailActive()) {
      requestRemoveFromCustomList(movieId);
    } else {
      requestRemoveMovie(movieId);
    }
    return;
  }
  if (event.target.closest(".card-grip")) {
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

viewModeCycleBtn?.addEventListener("click", () => {
  if (isWatchlistActive()) {
    return;
  }
  setViewMode(nextViewMode(gridViewMode));
  persistUserState();
  render();
});
listSortSelect?.addEventListener("change", () => {
  setSortField(listSortSelect.value);
});
window
  .matchMedia("(max-width: 640px)")
  .addEventListener("change", () => syncSortSelectLabels());
sortReverseBtn?.addEventListener("click", toggleSortOrder);
reorderModeToggle?.addEventListener("change", () => {
  setReorderMode(reorderModeToggle.checked);
});

/* --- Detail overlay --- */

detailListsDialogClose?.addEventListener("click", closeDetailListPicker);
detailListsCancel?.addEventListener("click", closeDetailListPicker);
detailListsSaveOverlay?.addEventListener("click", saveDetailListPicker);
detailListsDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-detail-lists")) {
    closeDetailListPicker();
    return;
  }
  const listToggleChip = event.target.closest("[data-detail-list-toggle-id]");
  if (listToggleChip) {
    toggleDetailListPickerChip(listToggleChip.dataset.detailListToggleId);
  }
});

detailCloseBtn.addEventListener("click", () => closeDetail());
detailPrevBtn.addEventListener("click", () => stepDetail(-1));
detailNextBtn.addEventListener("click", () => stepDetail(1));
detailDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-detail")) {
    closeDetail();
    return;
  }
  if (event.target.closest("#detail-rating-summary")) {
    toggleDetailRatingEditor();
    return;
  }
  if (event.target.closest("#detail-rating-done")) {
    closeDetailRatingEditor();
    return;
  }
  if (event.target.closest("#detail-rating-cancel")) {
    cancelDetailRatingEditor();
    return;
  }
  if (event.target.closest("#detail-rating-clear")) {
    clearDetailRating();
    return;
  }
  if (event.target.closest("#detail-lists-edit")) {
    toggleDetailListPicker();
    return;
  }
  if (event.target.closest("#detail-lists-save")) {
    saveDetailListPicker();
    return;
  }
  const listNavChip = event.target.closest("[data-detail-list-nav-id]");
  if (listNavChip) {
    navigateToCustomList(listNavChip.dataset.detailListNavId);
    return;
  }
  const listToggleChip = event.target.closest("[data-detail-list-toggle-id]");
  if (listToggleChip) {
    toggleDetailListPickerChip(listToggleChip.dataset.detailListToggleId);
  }
});
delegateRangeSliderLiveInput(detailDialog, "detail-rating-slider", onDetailRatingSliderInput);
detailDialog.addEventListener("change", (event) => {
  if (event.target.id === "detail-rating-slider") {
    commitDetailRating();
    return;
  }
  if (event.target.id === "detail-rating-select") {
    onDetailRatingSelectChange(event);
    commitDetailRating();
  }
});
detailActions.addEventListener("click", (event) => {
  if (event.target.id === "detail-remove-from-list") {
    requestRemoveFromCustomList(detailMovieId);
    return;
  }
  if (event.target.id === "detail-remove") {
    requestRemoveMovie(detailMovieId);
    return;
  }
  if (event.target.id === "detail-watch") {
    requestWatchMovie(detailMovieId);
  }
});

watchConfirmCancel.addEventListener("click", () => closeWatchConfirm());
watchConfirmOk.addEventListener("click", () => confirmWatchMovie());
watchConfirmDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-watch-confirm")) {
    closeWatchConfirm();
  }
});

removeConfirmCancel.addEventListener("click", () => closeRemoveConfirm());
removeConfirmOk.addEventListener("click", () => confirmRemoveMovie());
removeConfirmDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-remove-confirm")) {
    closeRemoveConfirm();
  }
});

backupRestoreCancel?.addEventListener("click", () => closeBackupRestoreConfirm());
backupRestoreOk?.addEventListener("click", () => onConfirmBackupRestore());
backupRestoreDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-backup-restore")) {
    closeBackupRestoreConfirm();
  }
});

window.addEventListener("popstate", syncViewFromLocation);
window.addEventListener("hashchange", syncViewFromLocation);

listsNavBtn?.addEventListener("click", onListsNavClick);
customListCreateBtn?.addEventListener("click", promptCreateCustomListName);
customListsEmpty?.addEventListener("click", (event) => {
  if (event.target.closest(".empty-state-add-btn")) {
    promptCreateCustomListName();
  }
});
customListsRows?.addEventListener("click", onCustomListsIndexClick);
customListsRows?.addEventListener("keydown", onCustomListsIndexKeydown);
customListsSortSelect?.addEventListener("change", onCustomListIndexSortChange);
customListDeleteCancel?.addEventListener("click", closeCustomListDeleteConfirm);
customListDeleteOk?.addEventListener("click", confirmDeleteCustomList);
customListDeleteDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-custom-list-delete")) {
    closeCustomListDeleteConfirm();
  }
});
customListBackBtn?.addEventListener("click", () => navigateToCustomListsIndex());
addMovieFromWatchedBtn?.addEventListener("click", () => {
  closeAddMovieDialog();
  openWatchedPicker();
});
watchlistPickerBack?.addEventListener("click", backFromWatchedPickerToAddMovie);
watchlistPickerClose?.addEventListener("click", closeWatchedPicker);
watchlistPickerSubmit?.addEventListener("click", confirmWatchedPicker);
watchlistPickerList?.addEventListener("click", onWatchedPickerClick);
watchlistPickerDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-watchlist-picker")) {
    closeWatchedPicker();
  }
});
watchlistPickerMainLink?.addEventListener("click", (event) => {
  event.preventDefault();
  closeWatchedPicker();
  navigateToMain();
});
addMovieCustomListPicker?.addEventListener("click", onAddMovieCustomListPickerClick);
addMovieCreateListsLink?.addEventListener("click", (event) => {
  event.preventDefault();
  closeAddMovieDialog();
  navigateToCustomListsIndex();
});

/* --- Staying current across tabs --- */

window.addEventListener("storage", onUserStateStorageEvent);
document.addEventListener("visibilitychange", onVisibilityRefresh);

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
exportCsvBtn.addEventListener("click", onExportCsv);
storageModeLocal.addEventListener("change", () => onStorageModeChange("local"));
storageModeGist.addEventListener("change", () => onStorageModeChange("gist"));
gistConnectBtn.addEventListener("click", onConnectGist);
gistClearBtn.addEventListener("click", onDisconnectGist);
gistBackupList?.addEventListener("click", onGistBackupListClick);

aboutBtn.addEventListener("click", openAbout);
aboutClose.addEventListener("click", closeAbout);
aboutDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-about")) {
    closeAbout();
  }
});

/* --- Logo: single click home (delayed); triple-click hosted unlock --- */

let logoClickCount = 0;
let logoClickTimer = null;
const LOGO_CLICK_WINDOW_MS = 600;

headerLogo.addEventListener("click", () => {
  logoClickCount += 1;
  if (logoClickTimer) {
    clearTimeout(logoClickTimer);
  }

  if (logoClickCount >= 3) {
    logoClickCount = 0;
    logoClickTimer = null;
    if (hasHostedAccess()) {
      openHostedLockDialog();
    } else {
      openHostedUnlockDialog();
    }
    return;
  }

  logoClickTimer = setTimeout(() => {
    if (logoClickCount === 1) {
      navigateHomeToWatched();
    }
    logoClickCount = 0;
    logoClickTimer = null;
  }, LOGO_CLICK_WINDOW_MS);
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
    if (!backupRestoreDialog.hidden) {
      closeBackupRestoreConfirm();
      return;
    }
    if (!customListDeleteDialog.hidden) {
      closeCustomListDeleteConfirm();
      return;
    }
    if (!watchlistPickerDialog.hidden) {
      closeWatchedPicker();
      return;
    }
    if (!removeConfirmDialog.hidden) {
      closeRemoveConfirm();
      return;
    }
    if (!watchConfirmDialog.hidden) {
      closeWatchConfirm();
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
        if (addMoviePickTab === "detail") {
          setAddMoviePickTab("add");
          return;
        }
        showAddSearchStep();
        searchInput.focus();
      } else {
        closeAddMovieDialog();
      }
      return;
    }
    if (detailMovieId != null) {
      if (detailRatingEditorOpen) {
        cancelDetailRatingEditor();
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

async function startApp() {
  loadCredential();
  loadHostedSession();
  loadGistConfig();
  loadUserState();
  refreshViewModeForActiveList();
  updateSearchClearVisibility();

  // One static file, read before the first paint. When it covers the list that
  // paint shows real cards instead of skeletons, which is the whole point.
  await loadLocalMovieData();

  render();
  syncViewFromLocation();
  hydrateActiveList();

  // Reconcile rather than pull: startup is also when this tab is most likely to
  // be holding something the Gist has not seen yet.
  if (gistSyncEnabled()) {
    queueGistSync();
  }
}

startApp();
})();
