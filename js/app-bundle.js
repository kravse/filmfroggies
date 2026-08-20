/* ===== Configuration, DOM references, and mutable state ===== */

(function () {
  "use strict";

/* Opens the shared IIFE scope for every partial. Closed by 08-init.js. */

const ACCOUNT_LOGIN_HINT =
  "Sign in via Settings → Account to search TMDB and sync your lists.";
const SITE_BRAND_NAME = "filmfroggies";

/* --- DOM --- */

const listSubtitleEl = document.getElementById("list-subtitle");
const headerTitleEl = document.getElementById("header-title");
const customListViewTitleEl = document.getElementById("custom-list-view-title");
const listTabs = document.getElementById("list-tabs");
const headerLogo = document.getElementById("header-logo");
const listsNavBtn = document.getElementById("lists-nav-btn");
const customListsIndex = document.getElementById("custom-lists-index");
const customListsRows = document.getElementById("custom-lists-rows");
const customListsIndexActions = document.getElementById("custom-lists-index-actions");
const customListsSortSelect = document.getElementById("custom-lists-sort");
const customListsSortControl = document.getElementById("custom-lists-sort-control");
const customListsEmpty = document.getElementById("custom-lists-empty");
const customListCreateBtn = document.getElementById("custom-list-create-btn");
const customListBackBtn = document.getElementById("custom-list-back-btn");
const customListBackLabel = document.getElementById("custom-list-back-label");
const addMovieFromWatchedSection = document.getElementById("add-movie-from-watched-section");
const addMovieFromWatchedBtn = document.getElementById("add-movie-from-watched-btn");

const addMovieCustomListsSection = document.getElementById("add-movie-custom-lists-section");
const addMovieCustomListsLabel = document.getElementById("add-movie-custom-lists-label");
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
const discoverEntryBtn = document.getElementById("discover-entry-btn");
const friendsEntryBtn = document.getElementById("friends-entry-btn");

const discoverTabs = document.getElementById("discover-tabs");
const discoverPagination = document.getElementById("discover-pagination");
const discoverPrevBtn = document.getElementById("discover-prev");
const discoverNextBtn = document.getElementById("discover-next");
const discoverPageLabel = document.getElementById("discover-page-label");
const discoverPaginationBottom = document.getElementById("discover-pagination-bottom");
const discoverPrevBottomBtn = document.getElementById("discover-prev-bottom");
const discoverNextBottomBtn = document.getElementById("discover-next-bottom");
const discoverPageLabelBottom = document.getElementById("discover-page-label-bottom");

const addMovieFab = document.getElementById("add-movie-fab");
const addMovieDialog = document.getElementById("add-movie-dialog");
const addMovieTitle = document.getElementById("add-movie-title");
const addMovieClose = document.getElementById("add-movie-close");
const addMovieHint = document.getElementById("add-movie-hint");
const addMovieSearchStep = document.getElementById("add-movie-search-step");
const addMoviePickStep = document.getElementById("add-movie-pick-step");
const addMoviePicked = document.getElementById("add-movie-picked");
const addMoviePresetSection = document.getElementById("add-movie-preset-section");
const addMoviePresetLabel = document.getElementById("add-movie-preset-label");
const addMovieAlsoAddSection = document.getElementById("add-movie-also-add-section");
const addMoviePresetChips = document.getElementById("add-movie-preset-chips");
const addMovieListPicker = document.getElementById("add-movie-list-picker");
const addMovieSubmit = document.getElementById("add-movie-submit");
const addMovieRatingSlider = document.getElementById("add-movie-rating-slider");
const addMovieRatingSelect = document.getElementById("add-movie-rating-select");
const addMovieRatingClear = document.getElementById("add-movie-rating-clear");
const addMovieRatingValue = document.getElementById("add-movie-rating-value");
const addMovieRatingField = document.getElementById("add-movie-rating-field");
const addMovieWatchDateWrap = document.getElementById("add-movie-watch-date-wrap");
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
const settingsTabAccount = document.getElementById("settings-tab-account");
const settingsTabConfig = document.getElementById("settings-tab-config");
const settingsPanelAccount = document.getElementById("settings-panel-account");
const settingsPanelConfig = document.getElementById("settings-panel-config");
const settingsFriendsSignin = document.getElementById("settings-friends-signin");
const friendsIndexEl = document.getElementById("friends-index");
const friendsIndexEmptyEl = document.getElementById("friends-index-empty");

const accountFields = document.getElementById("account-fields");
const accountAuthFields = document.getElementById("account-auth-fields");
const accountSessionCard = document.getElementById("account-session-card");
const accountAvatar = document.getElementById("account-avatar");
const accountSessionName = document.getElementById("account-session-name");
const accountSessionEmail = document.getElementById("account-session-email");
const accountEmailInput = document.getElementById("account-email-input");
const accountPasswordInput = document.getElementById("account-password-input");
const accountInviteField = document.getElementById("account-invite-field");
const accountInviteInput = document.getElementById("account-invite-input");
const accountAuthTitle = document.getElementById("account-auth-title");
const accountAuthTabLogin = document.getElementById("account-auth-tab-login");
const accountAuthTabSignup = document.getElementById("account-auth-tab-signup");
const accountAuthForm = document.getElementById("account-auth-form");
const accountSubmitBtn = document.getElementById("account-submit");
const accountLogoutBtn = document.getElementById("account-logout");
const accountDeleteBtn = document.getElementById("account-delete");
const accountDeleteDialog = document.getElementById("account-delete-dialog");
const accountDeletePassword = document.getElementById("account-delete-password");
const accountDeleteStatus = document.getElementById("account-delete-status");
const accountDeleteCancel = document.getElementById("account-delete-cancel");
const accountDeleteOk = document.getElementById("account-delete-ok");
const accountStatus = document.getElementById("account-status");
const accountSyncStatus = document.getElementById("account-sync-status");
const accountFriendsSection = document.getElementById("account-friends-section");
const friendEmailInput = document.getElementById("friend-email-input");
const friendAddBtn = document.getElementById("friend-add");
const friendsList = document.getElementById("friends-list");
const friendsStatus = document.getElementById("friends-status");
const friendRemoveConfirmDialog = document.getElementById("friend-remove-confirm-dialog");
const friendRemoveConfirmMessage = document.getElementById("friend-remove-confirm-message");
const friendRemoveConfirmCancel = document.getElementById("friend-remove-confirm-cancel");
const friendRemoveConfirmOk = document.getElementById("friend-remove-confirm-ok");

const friendViewEl = document.getElementById("friend-view");
const friendViewOverview = document.getElementById("friend-view-overview");
const friendViewSectionsEl = document.getElementById("friend-view-sections");

const cacheClearBtn = document.getElementById("cache-clear");
const cacheStatus = document.getElementById("cache-status");
const settingsFriendFanRatingsToggle = document.getElementById("settings-friend-fan-ratings");
const exportCsvBtn = document.getElementById("export-csv");
const exportCsvStatus = document.getElementById("export-csv-status");
const collectionImportFile = document.getElementById("collection-import-file");
const collectionImportFileName = document.getElementById("collection-import-file-name");
const collectionImportRead = document.getElementById("collection-import-read");
const collectionImportStatus = document.getElementById("collection-import-status");
const collectionImportDialog = document.getElementById("collection-import-dialog");
const collectionImportMessage = document.getElementById("collection-import-message");
const collectionImportCancel = document.getElementById("collection-import-cancel");
const collectionImportOk = document.getElementById("collection-import-ok");

const appToastEl = document.getElementById("app-toast");
let appToastTimer = null;

const aboutDialog = document.getElementById("about-dialog");
const aboutClose = document.getElementById("about-close");

const detailDialog = document.getElementById("movie-detail-dialog");
const detailPrevBtn = document.getElementById("movie-detail-prev");
const detailNextBtn = document.getElementById("movie-detail-next");
const detailEyebrow = document.getElementById("movie-detail-eyebrow");
const detailCloseBtn = document.getElementById("movie-detail-close");
const movieShareDialog = document.getElementById("movie-share-dialog");
const movieShareUrlInput = document.getElementById("movie-share-url");
const movieShareCopyBtn = document.getElementById("movie-share-copy");
const movieShareCloseBtn = document.getElementById("movie-share-close");
const movieShareStatus = document.getElementById("movie-share-status");
const detailPoster = document.getElementById("movie-detail-poster");
const detailBody = document.getElementById("movie-detail-body");
const detailActions = document.getElementById("movie-detail-actions");
const detailScroll = document.getElementById("movie-detail-scroll");
const detailConfigResultsEl = document.getElementById("detail-config-results");
const detailConfigSearchDialog = document.getElementById("detail-config-search-dialog");
const detailConfigSearchQuery = document.getElementById("detail-config-search-query");
const detailConfigSearchSpinner = document.getElementById("detail-config-search-spinner");
const detailConfigSearchStatus = document.getElementById("detail-config-search-status");
const detailConfigSearchResults = document.getElementById("detail-config-search-results");
const detailConfigSearchClose = document.getElementById("detail-config-search-close");

const detailListsDialog = document.getElementById("detail-lists-dialog");
const detailListsDialogBody = document.getElementById("detail-lists-dialog-body");
const detailListsDialogClose = document.getElementById("detail-lists-dialog-close");
const detailListsCancel = document.getElementById("detail-lists-cancel");
const detailListsSaveOverlay = document.getElementById("detail-lists-save-overlay");

const removeConfirmDialog = document.getElementById("remove-confirm-dialog");
const removeConfirmMessage = document.getElementById("remove-confirm-message");
const removeConfirmCancel = document.getElementById("remove-confirm-cancel");
const removeConfirmOk = document.getElementById("remove-confirm-ok");

const viewingRemoveConfirmDialog = document.getElementById("viewing-remove-confirm-dialog");
const viewingRemoveConfirmMessage = document.getElementById("viewing-remove-confirm-message");
const viewingRemoveConfirmCancel = document.getElementById("viewing-remove-confirm-cancel");
const viewingRemoveConfirmOk = document.getElementById("viewing-remove-confirm-ok");

const watchConfirmDialog = document.getElementById("watch-confirm-dialog");
const watchConfirmMessage = document.getElementById("watch-confirm-message");
const watchConfirmCancel = document.getElementById("watch-confirm-cancel");
const watchConfirmOk = document.getElementById("watch-confirm-ok");

const discoverAddConfirmDialog = document.getElementById("discover-add-confirm-dialog");
const discoverAddConfirmTitle = document.getElementById("discover-add-confirm-title");
const discoverAddConfirmMessage = document.getElementById("discover-add-confirm-message");
const discoverAddConfirmCancel = document.getElementById("discover-add-confirm-cancel");
const discoverAddConfirmOk = document.getElementById("discover-add-confirm-ok");

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
let detailCloseNavigationPending = false;
/** Movie id being closed, so a duplicate `#movie/{id}` history entry can be skipped. */
let detailClosedMovieId = null;
/** Scroll offset of the grid/list under the detail overlay. */
let underlayScrollY = 0;
let renderedMovieIds = [];
let detailRatingEditorOpen = false;
/** Rating saved when the editor opens; Cancel restores this value. */
let detailRatingEditorSnapshot = null;
let detailListPickerOpen = false;
/** Staged custom-list membership while the detail list editor is open. */
let detailListPickerSelectedIds = new Set();
/** "overview" | "viewing-history" | "config" */
let detailBodyTab = "overview";
let detailAddListId = null;
let detailAddCustomListIds = new Set();
let detailAddRating = null;
let detailAddWatchDateActive = false;
let detailAddWatchDate = "";
let detailRemapCandidateId = null;
let detailRemapQuery = "";
let detailRemapResults = [];
let pendingRemoveMovieId = null;
let pendingViewingRemoveEntryId = null;
let pendingWatchMovieId = null;
let watchConfirmWatchDateActive = false;
let pendingDiscoverAddMovieId = null;
let pendingDiscoverAddListId = null;
let pendingCustomListDeleteId = null;
let pendingFriendRemoveId = null;
let tmdbCredential = "";

/** "main" | "customIndex" | "customDetail" | "discover" | "friend" */
let appView = "main";
let activeCustomListId = null;
let activeFriendId = null;
let friendViewName = "";
let friendViewState = null;
let friendViewSections = [];
let friendViewLoadedId = null;
let friendViewLoading = false;
let friendViewError = null;
const friendViewCollapsedSections = new Set();

function isCustomListIndexActive() {
  return appView === "customIndex";
}

function isCustomListDetailActive() {
  return appView === "customDetail" && activeCustomListId != null;
}

function isCustomListView() {
  return isCustomListIndexActive() || isCustomListDetailActive();
}

function isFriendsIndexActive() {
  return appView === "friendsIndex";
}

function isFriendViewActive() {
  return appView === "friend" && activeFriendId != null;
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
      getWatchedOn: (id) => appViewingHistory.latestViewingDate(userState.viewingHistory, id),
    };
    if (appSort.getSortField(userState.preferences.sort) === "watched") {
      const latestByMovie = new Map();
      const normalized = appViewingHistory.normalizeViewingHistory(userState.viewingHistory);
      for (const [movieId, entries] of Object.entries(normalized)) {
        let latest = null;
        for (const entry of entries) {
          if (!entry.deletedAt && (!latest || entry.watchedOn > latest)) {
            latest = entry.watchedOn;
          }
        }
        if (latest) {
          latestByMovie.set(Number(movieId), latest);
        }
      }
      sortContext.getWatchedOn = (id) => latestByMovie.get(Number(id)) ?? null;
    }
    if (ctx.listKind === "custom") {
      const joinOrder = appSort.buildOrderIndex(ctx.movieIds);
      sortContext.getListJoinIndex = (id) => joinOrder.get(Number(id)) ?? null;
    }
    return appSort.sortMovieIds(ids, appSort.resolveSortMode(userState.preferences.sort), sortContext);
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

function showAppToast(message, tone = "error") {
  if (!appToastEl || !message) {
    return;
  }
  if (appToastTimer) {
    window.clearTimeout(appToastTimer);
    appToastTimer = null;
  }
  appToastEl.textContent = message;
  appToastEl.classList.toggle("is-error", tone === "error");
  appToastEl.classList.toggle("is-ok", tone === "ok");
  appToastEl.hidden = false;
  appToastEl.classList.add("is-visible");
  appToastTimer = window.setTimeout(() => {
    appToastEl.classList.remove("is-visible");
    appToastEl.hidden = true;
    appToastTimer = null;
  }, 4000);
}

function notifyCustomListsCapReached() {
  showAppToast(`You can create up to ${appCustomLists.MAX_CUSTOM_LISTS} custom lists.`);
}

function notifyCustomListMovieCapReached(listName) {
  const label = listName ? `“${listName}”` : "This list";
  showAppToast(`${label} is full (${appCustomLists.MAX_CUSTOM_LIST_MOVIES} movies max).`);
}

function notifyCustomListMovieCaps(listNames) {
  const names = [...new Set((listNames || []).filter(Boolean))];
  if (names.length === 1) {
    notifyCustomListMovieCapReached(names[0]);
    return;
  }
  if (names.length > 1) {
    showAppToast(
      `${names.length} lists are full (${appCustomLists.MAX_CUSTOM_LIST_MOVIES} movies max).`,
    );
  }
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

  /** Full calendar date for discover cards, e.g. `August 26, 2026`. */
  function formatReleaseDate(releaseDate) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(releaseDate || "").trim());
    if (!match) {
      return "";
    }
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return "";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
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

  /** One decimal for ratings; 10 alone drops the fraction (0 → "0.0"). */
  function formatRatingLabel(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return null;
    }
    const rounded = Math.round(num * 10) / 10;
    if (rounded === 10) {
      return "10";
    }
    return rounded.toFixed(1);
  }

  function formatRating(voteAverage) {
    if (voteAverage == null || voteAverage === "") {
      return "";
    }
    const value = Number(voteAverage);
    if (!Number.isFinite(value) || value < 0) {
      return "";
    }
    const label = formatRatingLabel(value);
    return label == null ? "" : label;
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

  const WATCHLIST_PRESET_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>';

  const VIEWING_DATE_ICON_SVG =
    '<svg class="viewing-date-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none"><path d="M7.5 8 5.5 3M12.5 8 14.5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="3.5" y="8" width="13" height="8.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/><rect x="5.25" y="9.75" width="9.5" height="5" rx="0.5" stroke="currentColor" stroke-width="1.25"/><path d="M6.25 16.5v1.25M13.75 16.5v1.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  function viewingDateIconHtml() {
    return VIEWING_DATE_ICON_SVG;
  }

  function viewingDatePickerHtml(options = {}) {
    const toggleId = String(options.toggleId || "viewing-date-toggle");
    const fieldId = String(options.fieldId || "viewing-date-field");
    const inputId = String(options.inputId || "viewing-date-input");
    const clearId = String(options.clearId || "viewing-date-clear");
    const toggleClass = escapeHtml(
      String(options.toggleClass || "ghost-btn viewing-date-picker-toggle"),
    );
    const fieldClass = escapeHtml(String(options.fieldClass || "viewing-date-picker-field"));
    const icon = viewingDateIconHtml();
    return `<button type="button" class="${toggleClass}" id="${escapeHtml(toggleId)}">${icon}Add viewing date</button>
  <div class="${fieldClass}" id="${escapeHtml(fieldId)}" hidden>
    <div class="viewing-date-input-row">${icon}<input type="date" id="${escapeHtml(inputId)}" aria-label="Date watched" /></div>
    <button type="button" class="user-rating-clear-btn" id="${escapeHtml(clearId)}">Clear viewing date</button>
  </div>`;
  }

  /** Same square icons as the add-movie list picker (`watched` | `watchlist`). */
  function addListPresetIconHtml(preset) {
    if (preset === "watchlist") {
      return `<span class="add-list-icon add-list-icon-watchlist" aria-hidden="true">${WATCHLIST_PRESET_ICON_SVG}</span>`;
    }
    return `<span class="add-list-icon" aria-hidden="true">✓</span>`;
  }

  function discoverPresetButtonInnerHtml(preset, label) {
    return `${addListPresetIconHtml(preset)}<span class="discover-preset-btn-label">${escapeHtml(label)}</span>`;
  }

  return {
    escapeHtml,
    formatYear,
    formatReleaseDate,
    formatRuntime,
    formatRatingLabel,
    formatRating,
    joinNames,
    addListPresetIconHtml,
    discoverPresetButtonInnerHtml,
    viewingDateIconHtml,
    viewingDatePickerHtml,
  };
})();

/* ===== Shared movie search picker (generated from scripts/lib/movie-search-picker.js) ===== */

/* Generated from scripts/lib/movie-search-picker.js — run npm run bundle */

const appMovieSearchPicker = (function () {
  /** Shared debounced, abortable search state for movie picker UIs. */

  function createMovieSearchPicker(options = {}) {
    if (typeof options.search !== "function") {
      throw new Error("Movie search picker requires a search function.");
    }
    const debounceMs = Number.isFinite(options.debounceMs) ? options.debounceMs : 300;
    let timer = null;
    let controller = null;
    let requestToken = 0;
    let results = [];

    function cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      requestToken += 1;
      controller?.abort();
      controller = null;
      options.onBusy?.(false);
    }

    function clear() {
      cancel();
      results = [];
      options.onClear?.();
    }

    async function run(query, searchOptions = {}) {
      cancel();
      const token = ++requestToken;
      controller = new AbortController();
      options.onBusy?.(true);
      try {
        const next = await options.search(query, { ...searchOptions, signal: controller.signal });
        if (token !== requestToken) return [];
        results = Array.isArray(next) ? next : [];
        options.onResults?.(results, query, searchOptions);
        return results;
      } catch (error) {
        if (error?.name !== "AbortError" && token === requestToken) {
          options.onError?.(error, query, searchOptions);
        }
        return [];
      } finally {
        if (token === requestToken) {
          controller = null;
          options.onBusy?.(false);
        }
      }
    }

    function schedule(query, searchOptions = {}) {
      cancel();
      timer = setTimeout(() => {
        timer = null;
        run(query, searchOptions);
      }, debounceMs);
    }

    function select(index) {
      const result = results[Number(index)] || null;
      if (result) options.onSelect?.(result, Number(index));
      return result;
    }

    return { run, schedule, cancel, clear, select, getResults: () => [...results] };
  }

  function movieSearchPosterHtml(result, options = {}) {
    const escapeHtml = options.escapeHtml || String;
    const url = options.posterUrl?.(result) || "";
    return url
      ? `<img class="search-suggest-poster" data-poster-src="${escapeHtml(url)}" alt="" loading="lazy">`
      : `<span class="search-suggest-poster search-suggest-poster--empty"></span>`;
  }

  function movieSearchResultsHtml(results, options = {}) {
    const escapeHtml = options.escapeHtml || String;
    return (Array.isArray(results) ? results : []).map((result, index) => {
      const active = index === options.activeIndex ? " active" : "";
      const dataName = options.dataName || "suggest-index";
      const dataValue = options.dataValue?.(result, index) ?? index;
      const meta = options.meta?.(result) || "";
      const badge = options.badge?.(result) || "";
      return `<li class="search-suggest-item${active}" role="option" data-${dataName}="${escapeHtml(dataValue)}" aria-selected="${index === options.activeIndex}">
    ${movieSearchPosterHtml(result, options)}
    <span class="search-suggest-text">
      <span class="search-suggest-title">${escapeHtml(result.title)}</span>
      <span class="search-suggest-meta">${escapeHtml(meta)}</span>
    </span>
    ${badge}
  </li>`;
    }).join("");
  }

  return {
    createMovieSearchPicker,
    movieSearchPosterHtml,
    movieSearchResultsHtml,
  };
})();

/* ===== Movie link remapping (generated from scripts/lib/movie-remap.js) ===== */

/* Generated from scripts/lib/movie-remap.js — run npm run bundle */

const appMovieRemap = (function () {
  /** Atomically move all collection metadata from one TMDB movie id to another. */

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function validId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  function replaceId(ids, fromId, toId) {
    const out = [];
    for (const raw of Array.isArray(ids) ? ids : []) {
      const id = Number(raw) === fromId ? toId : Number(raw);
      if (Number.isInteger(id) && id > 0 && !out.includes(id)) out.push(id);
    }
    return out;
  }

  function moveKey(map, fromId, toId) {
    const source = map && typeof map === "object" && !Array.isArray(map) ? map : {};
    const out = { ...source };
    if (Object.prototype.hasOwnProperty.call(out, String(fromId))) {
      out[String(toId)] = out[String(fromId)];
      delete out[String(fromId)];
    }
    return out;
  }

  function remapMovieState(state, fromValue, toValue, now = new Date()) {
    const fromId = validId(fromValue);
    const toId = validId(toValue);
    if (!state || !fromId || !toId || fromId === toId) {
      throw new Error("Choose a different valid TMDB movie.");
    }
    if (!getLists().isWatched(state.lists, fromId)) {
      throw new Error("Only watched movies can be remapped.");
    }
    const alreadyPresent = (state.lists || []).some((list) => list.movieIds?.includes(toId)) ||
      (state.customLists || []).some((list) => list.movieIds?.includes(toId));
    if (alreadyPresent) {
      throw new Error("That TMDB movie is already in your collection.");
    }
    const sourceList = (state.lists || []).find((list) => list.movieIds?.includes(fromId));
    if (!sourceList && !(state.customLists || []).some((list) => list.movieIds?.includes(fromId))) {
      throw new Error("The original movie is no longer in your collection.");
    }
    const stamp = now.toISOString();
    const lists = (state.lists || []).map((list) => ({
      ...list,
      movieIds: replaceId(list.movieIds, fromId, toId),
    }));
    const customLists = (state.customLists || []).map((list) => {
      if (!list.movieIds?.includes(fromId)) return list;
      return { ...list, movieIds: replaceId(list.movieIds, fromId, toId), updatedAt: stamp };
    });
    const statuses = {
      ...(state.statuses && typeof state.statuses === "object" ? state.statuses : {}),
      [String(fromId)]: { status: "removed", updatedAt: stamp },
    };
    if (sourceList) {
      statuses[String(toId)] = { status: sourceList.id, updatedAt: stamp };
    }
    return {
      ...state,
      lists,
      customLists,
      ratings: moveKey(state.ratings, fromId, toId),
      viewingHistory: moveKey(state.viewingHistory, fromId, toId),
      addedAt: moveKey(state.addedAt, fromId, toId),
      statuses,
    };
  }

  return {
    remapMovieState,
  };
})();

/* ===== Shared viewing date picker mounts ===== */

(function mountViewingDatePickers() {
  const pickers = [
    {
      rootId: "add-movie-viewing-date-picker",
      toggleId: "add-movie-watch-date-toggle",
      fieldId: "add-movie-watch-date-field",
      inputId: "add-movie-watch-date",
      clearId: "add-movie-watch-date-clear",
      toggleClass: "ghost-btn add-movie-watch-date-toggle",
      fieldClass: "add-movie-watch-date",
    },
    {
      rootId: "watch-confirm-viewing-date-picker",
      toggleId: "watch-confirm-date-toggle",
      fieldId: "watch-confirm-date-field",
      inputId: "watch-confirm-date",
      clearId: "watch-confirm-date-clear",
      toggleClass: "ghost-btn watch-confirm-date-toggle",
      fieldClass: "watch-confirm-date",
    },
  ];
  for (const picker of pickers) {
    const root = document.getElementById(picker.rootId);
    if (root) {
      root.innerHTML = appCardHtml.viewingDatePickerHtml(picker);
    }
  }
})();

const addMovieWatchDateToggle = document.getElementById("add-movie-watch-date-toggle");
const addMovieWatchDateField = document.getElementById("add-movie-watch-date-field");
const addMovieWatchDate = document.getElementById("add-movie-watch-date");
const addMovieWatchDateClear = document.getElementById("add-movie-watch-date-clear");
const watchConfirmDateToggle = document.getElementById("watch-confirm-date-toggle");
const watchConfirmDateField = document.getElementById("watch-confirm-date-field");
const watchConfirmDate = document.getElementById("watch-confirm-date");
const watchConfirmDateClear = document.getElementById("watch-confirm-date-clear");

/* ===== Grid poster greys (generated from scripts/lib/poster-grey.js) ===== */

/* Generated from scripts/lib/poster-grey.js — run npm run bundle */

const appPosterGrey = (function () {
  /**
   * Deterministic grey fills for grid poster slots when the image is missing or
   * still loading. Chosen from a fixed palette so tiles vary but stay neutral.
   */

  const POSTER_GREYS = [
    "#13161c",
    "#1a1f28",
    "#1e2430",
    "#222830",
    "#1c1a1e",
    "#242428",
    "#2a3038",
    "#2e3640",
    "#323840",
    "#28302c",
    "#2c2a34",
    "#363c44",
  ];

  function posterGreyForId(movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return POSTER_GREYS[0];
    }
    return POSTER_GREYS[((id % POSTER_GREYS.length) + POSTER_GREYS.length) % POSTER_GREYS.length];
  }

  return {
    POSTER_GREYS,
    posterGreyForId,
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
  const DEFAULT_NOW_PLAYING_WINDOW_DAYS = 84;
  /** World premiere must fall in the same window as the US theatrical run (new only). */
  const DEFAULT_NOW_PLAYING_PRIMARY_WINDOW_DAYS = DEFAULT_NOW_PLAYING_WINDOW_DAYS;
  /** Match TMDB’s /movie/upcoming window (~4 weeks of US theatrical dates). */
  const DEFAULT_UPCOMING_WINDOW_DAYS = 28;
  /** Minimum TMDB vote count for discover browse queries (drops zero-interest listings). */
  const DEFAULT_DISCOVER_MIN_VOTE_COUNT = 10;

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

  function formatIsoDate(date) {
    const value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid date");
    }
    return value.toISOString().slice(0, 10);
  }

  function offsetIsoDate(base, dayOffset) {
    const value =
      base instanceof Date
        ? new Date(base.getTime())
        : new Date(`${formatIsoDate(base)}T00:00:00.000Z`);
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid date");
    }
    value.setUTCDate(value.getUTCDate() + dayOffset);
    return formatIsoDate(value);
  }

  function buildDiscoverMovieUrl(options = {}) {
    const page = Number(options.page);
    const params = {
      include_adult: "false",
      include_video: "false",
      language: options.language || "en-US",
      page: Number.isInteger(page) && page > 0 ? String(page) : "1",
      region: options.region || "US",
      with_release_type: "2|3",
      sort_by: options.sortBy || "popularity.desc",
    };
    if (options.releaseDateGte) {
      params["release_date.gte"] = options.releaseDateGte;
    }
    if (options.releaseDateLte) {
      params["release_date.lte"] = options.releaseDateLte;
    }
    if (options.primaryReleaseDateGte) {
      params["primary_release_date.gte"] = options.primaryReleaseDateGte;
    }
    if (options.primaryReleaseDateLte) {
      params["primary_release_date.lte"] = options.primaryReleaseDateLte;
    }
    if (options.voteCountGte != null) {
      params["vote_count.gte"] = String(options.voteCountGte);
    }
    return buildUrl("/discover/movie", params);
  }

  function buildUpcomingUrl(options = {}) {
    const today = options.today || formatIsoDate(new Date());
    const windowDays = Number(options.windowDays) || DEFAULT_UPCOMING_WINDOW_DAYS;
    const windowEnd = offsetIsoDate(today, windowDays);
    return buildDiscoverMovieUrl({
      language: options.language,
      page: options.page,
      region: options.region,
      releaseDateGte: today,
      releaseDateLte: windowEnd,
      primaryReleaseDateGte: today,
      primaryReleaseDateLte: windowEnd,
      sortBy: "popularity.desc",
    });
  }

  function buildNowPlayingUrl(options = {}) {
    const today = options.today || formatIsoDate(new Date());
    const windowDays = Number(options.windowDays) || DEFAULT_NOW_PLAYING_WINDOW_DAYS;
    const primaryWindowDays =
      Number(options.primaryWindowDays) || DEFAULT_NOW_PLAYING_PRIMARY_WINDOW_DAYS;
    const minVotes = Number(options.minVoteCount) || DEFAULT_DISCOVER_MIN_VOTE_COUNT;
    return buildDiscoverMovieUrl({
      language: options.language,
      page: options.page,
      region: options.region,
      releaseDateGte: offsetIsoDate(today, -windowDays),
      releaseDateLte: today,
      primaryReleaseDateGte: offsetIsoDate(today, -primaryWindowDays),
      primaryReleaseDateLte: today,
      voteCountGte: minVotes,
      sortBy: "popularity.desc",
    });
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
    const voteAverage = Number(entry.vote_average);
    return {
      id: Number(entry.id),
      title: cleanText(entry.title) || cleanText(entry.original_title) || "Untitled",
      releaseDate: cleanText(entry.release_date),
      primaryReleaseDate: cleanText(entry.primary_release_date),
      posterPath: cleanImagePath(entry.poster_path),
      overview: cleanText(entry.overview),
      voteCount: Number(entry.vote_count) || 0,
      popularity: Number(entry.popularity) || 0,
      voteAverage: Number.isFinite(voteAverage) && voteAverage > 0 ? voteAverage : null,
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

  /** Full movie/detail records always carry a genres array; search stubs do not. */
  function isDetailedMovieRecord(record) {
    return Boolean(record && Array.isArray(record.genres));
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
    formatIsoDate,
    offsetIsoDate,
    DEFAULT_NOW_PLAYING_WINDOW_DAYS,
    DEFAULT_NOW_PLAYING_PRIMARY_WINDOW_DAYS,
    DEFAULT_UPCOMING_WINDOW_DAYS,
    DEFAULT_DISCOVER_MIN_VOTE_COUNT,
    buildUpcomingUrl,
    buildNowPlayingUrl,
    isValidImagePath,
    buildImageUrl,
    normalizeSearchResults,
    normalizePersonSearchResults,
    pickDirectorSearchCandidates,
    directedMoviesFromPersonCredits,
    mergeMovieSearchResults,
    flattenDirectorSearchResults,
    normalizeMovie,
    isDetailedMovieRecord,
  };
})();

/* ===== TMDB movie cache timestamps (generated from scripts/lib/tmdb-movie-cache.js) ===== */

/* Generated from scripts/lib/tmdb-movie-cache.js — run npm run bundle */

const appTmdbMovieCache = (function () {
  /**
   * Cache API timestamps for TMDB movie JSON and poster blobs. Cached entries are
   * served immediately; upstream is consulted again only after the interval.
   */

  const CACHE_REVALIDATE_MS = 30 * 24 * 60 * 60 * 1000;
  const CACHE_TIMESTAMP_HEADER = "x-moviecollector-cached-at";

  /** @deprecated use CACHE_REVALIDATE_MS */
  const MOVIE_CACHE_REVALIDATE_MS = CACHE_REVALIDATE_MS;
  /** @deprecated use CACHE_TIMESTAMP_HEADER */
  const MOVIE_CACHE_TIMESTAMP_HEADER = CACHE_TIMESTAMP_HEADER;

  function buildCachedResponse(body, contentType, cachedAtMs = Date.now()) {
    const at = Number(cachedAtMs);
    const stamp = Number.isFinite(at) ? new Date(at).toISOString() : new Date().toISOString();
    return new Response(body, {
      headers: {
        "content-type": contentType,
        [CACHE_TIMESTAMP_HEADER]: stamp,
      },
    });
  }

  function buildCachedMovieResponse(text, cachedAtMs = Date.now()) {
    return buildCachedResponse(String(text), "application/json", cachedAtMs);
  }

  function buildCachedBlobResponse(blob, contentType, cachedAtMs = Date.now()) {
    return buildCachedResponse(blob, contentType || "application/octet-stream", cachedAtMs);
  }

  function readCacheTimestampMs(response) {
    const raw = response?.headers?.get?.(CACHE_TIMESTAMP_HEADER);
    if (!raw) {
      return null;
    }
    const ms = Date.parse(raw);
    return Number.isFinite(ms) ? ms : null;
  }

  function shouldRevalidateCache(response, nowMs = Date.now()) {
    const cachedAt = readCacheTimestampMs(response);
    if (cachedAt == null) {
      return true;
    }
    return nowMs - cachedAt >= CACHE_REVALIDATE_MS;
  }

  /** @deprecated use readCacheTimestampMs */
  const readMovieCacheTimestampMs = readCacheTimestampMs;
  /** @deprecated use shouldRevalidateCache */
  const shouldRevalidateMovieCache = shouldRevalidateCache;

  return {
    CACHE_REVALIDATE_MS,
    CACHE_TIMESTAMP_HEADER,
    MOVIE_CACHE_REVALIDATE_MS,
    MOVIE_CACHE_TIMESTAMP_HEADER,
    buildCachedResponse,
    buildCachedMovieResponse,
    buildCachedBlobResponse,
    readCacheTimestampMs,
    shouldRevalidateCache,
    readMovieCacheTimestampMs,
    shouldRevalidateMovieCache,
  };
})();

/* ===== Viewport hydration helpers (generated from scripts/lib/viewport-hydration.js) ===== */

/* Generated from scripts/lib/viewport-hydration.js — run npm run bundle */

const appViewportHydration = (function () {
  /**
   * Viewport-scoped list hydration helpers. Movie rows hydrate when they enter
   * (or neared) the viewport instead of fetching the entire list upfront.
   *
   * rootMargin expands the observer root so the first batch covers visible rows
   * plus a short prefetch band (e.g. ~20 on screen → ~25–35 in one POST).
   */

  const ROW_HYDRATE_ROOT_MARGIN = "320px 0px";

  function movieIdFromRowElement(element) {
    if (!element || typeof element !== "object") {
      return null;
    }
    const raw =
      element.dataset?.movieId ??
      (typeof element.getAttribute === "function" ? element.getAttribute("data-movie-id") : null);
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  return {
    ROW_HYDRATE_ROOT_MARGIN,
    movieIdFromRowElement,
  };
})();

/* ===== Grid reorder helpers (generated from scripts/lib/grid-reorder.js) ===== */

/* Generated from scripts/lib/grid-reorder.js — run npm run bundle */

const appGridReorder = (function () {
  /**
   * Reorder existing DOM children to match an id sequence without rebuilding HTML.
   */

  function reorderElementsById(container, orderedIds, getElementId) {
    if (!container || typeof container.appendChild !== "function" || !Array.isArray(orderedIds)) {
      return false;
    }
    const readId = typeof getElementId === "function" ? getElementId : () => null;
    const byId = new Map();
    const children = Array.from(container.children || []);
    for (const child of children) {
      const id = readId(child);
      if (id == null) {
        continue;
      }
      byId.set(id, child);
    }
    for (const id of orderedIds) {
      const element = byId.get(id);
      if (!element) {
        continue;
      }
      container.appendChild(element);
      byId.delete(id);
    }
    for (const element of byId.values()) {
      container.appendChild(element);
    }
    return true;
  }

  return {
    reorderElementsById,
  };
})();

/* ===== Discover browse helpers (generated from scripts/lib/discover.js) ===== */

/* Generated from scripts/lib/discover.js — run npm run bundle */

const appDiscover = (function () {
  /**
   * TMDB discover browse: tab ids and page merge.
   */

  const DISCOVER_TABS = new Set(["upcoming", "now-playing"]);
  const DEFAULT_DISCOVER_TAB = "upcoming";
  const DISCOVER_DEFAULT_PAGE = 1;
  const DISCOVER_MAX_MOVIES = 50;
  /** Fixed discover columns: 4 on wide viewports, 2 on mobile (see discover.css). */
  const DISCOVER_GRID_COLUMNS = 4;
  const DISCOVER_GRID_COLUMNS_MOBILE = 2;
  /** lcm(2, 4) — page sizes aligned to this fill both grids without a trailing orphan. */
  const DISCOVER_PAGE_COMPLETE_UNIT = 4;
  const DEFAULT_DISCOVER_REGION = "US";
  /** Bumped when discover list query semantics change so session memo refreshes. */
  const DISCOVER_LIST_CACHE_VERSION = 28;
  /** Skip obscure listings unless TMDB shows real interest. */
  const DISCOVER_MIN_VOTE_COUNT = 10;
  const DISCOVER_MIN_POPULARITY = 8;
  /**
   * When TMDB returns a primary premiere date, drop rows whose listed release
   * is much later — classic re-releases keep an old primary but get a new date.
   */
  const DISCOVER_MAX_PREMIERE_LAG_DAYS = 120;

  function normalizeDiscoverTab(raw) {
    const tab = String(raw || "").trim();
    return DISCOVER_TABS.has(tab) ? tab : DEFAULT_DISCOVER_TAB;
  }

  function normalizeDiscoverPage(raw, options = {}) {
    const page = Math.floor(Number(raw));
    if (!Number.isFinite(page) || page < 1) {
      return DISCOVER_DEFAULT_PAGE;
    }
    const maxPages = options.maxPages;
    if (Number.isInteger(maxPages) && maxPages > 0 && page > maxPages) {
      return maxPages;
    }
    return page;
  }

  function buildDiscoverHash(tab, page) {
    const normalizedTab = normalizeDiscoverTab(tab);
    const normalizedPage = normalizeDiscoverPage(page);
    if (normalizedPage <= 1) {
      return `#discover/${normalizedTab}`;
    }
    return `#discover/${normalizedTab}/${normalizedPage}`;
  }

  function parseDiscoverHash(hash) {
    const match = /^#discover\/(upcoming|now-playing)(?:\/(\d+))?$/.exec(String(hash || ""));
    if (!match) {
      return null;
    }
    return {
      tab: normalizeDiscoverTab(match[1]),
      page: normalizeDiscoverPage(match[2]),
    };
  }

  function normalizeDiscoverListMeta(payload) {
    const page = normalizeDiscoverPage(payload?.page);
    const totalPagesRaw = Math.floor(Number(payload?.total_pages));
    const totalPages = Number.isInteger(totalPagesRaw) && totalPagesRaw >= 1 ? totalPagesRaw : 1;
    const totalResultsRaw = Math.floor(Number(payload?.total_results));
    const totalResults =
      Number.isInteger(totalResultsRaw) && totalResultsRaw >= 0 ? totalResultsRaw : 0;
    return { page, totalPages, totalResults };
  }

  function todayIsoDate(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    return value.toISOString().slice(0, 10);
  }

  function shiftIsoDate(isoDate, dayOffset) {
    const value = new Date(`${isoDate}T00:00:00.000Z`);
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid date");
    }
    value.setUTCDate(value.getUTCDate() + dayOffset);
    return value.toISOString().slice(0, 10);
  }

  /** Drop past and dateless rows; upcoming needs a concrete future premiere. */
  function isUpcomingReleaseEntry(entry, todayIso) {
    const releaseDate = String(entry?.releaseDate || "").trim();
    if (!releaseDate) {
      return false;
    }
    const releaseTime = Date.parse(releaseDate);
    const todayTime = Date.parse(todayIso);
    if (!Number.isFinite(releaseTime) || !Number.isFinite(todayTime)) {
      return false;
    }
    return releaseTime >= todayTime;
  }

  function isNowPlayingReleaseEntry(entry, todayIso, windowDays) {
    const releaseDate = String(entry?.releaseDate || "").trim();
    if (!releaseDate) {
      return false;
    }
    const days = Number(windowDays);
    if (!Number.isFinite(days) || days < 0) {
      return false;
    }
    const releaseTime = Date.parse(releaseDate);
    const todayTime = Date.parse(todayIso);
    const startTime = Date.parse(shiftIsoDate(todayIso, -days));
    if (!Number.isFinite(releaseTime) || !Number.isFinite(todayTime) || !Number.isFinite(startTime)) {
      return false;
    }
    return releaseTime >= startTime && releaseTime <= todayTime;
  }

  /**
   * Reject re-releases when TMDB includes primary_release_date on the stub.
   * Without it, rely on discover query filters (primary_release_date.*).
   */
  function isNewPremiereEntry(entry, options = {}) {
    const primaryDate = String(entry?.primaryReleaseDate || "").trim();
    const releaseDate = String(entry?.releaseDate || "").trim();
    if (!primaryDate) {
      return true;
    }
    const primaryTime = Date.parse(primaryDate);
    if (!Number.isFinite(primaryTime)) {
      return false;
    }
    if (options.upcomingOnly && options.todayIso) {
      const todayTime = Date.parse(options.todayIso);
      if (!Number.isFinite(todayTime) || primaryTime < todayTime) {
        return false;
      }
    }
    if (options.nowPlayingOnly && options.todayIso) {
      const todayTime = Date.parse(options.todayIso);
      if (!Number.isFinite(todayTime) || primaryTime > todayTime) {
        return false;
      }
      const days = Number(options.nowPlayingWindowDays);
      if (Number.isFinite(days) && days >= 0) {
        const startTime = Date.parse(shiftIsoDate(options.todayIso, -days));
        if (Number.isFinite(startTime) && primaryTime < startTime) {
          return false;
        }
      }
    }
    if (!releaseDate) {
      return true;
    }
    const releaseTime = Date.parse(releaseDate);
    if (!Number.isFinite(releaseTime)) {
      return false;
    }
    const maxLag = Number(options.maxPremiereLagDays ?? DISCOVER_MAX_PREMIERE_LAG_DAYS);
    if (!Number.isFinite(maxLag) || maxLag < 0) {
      return true;
    }
    const lagDays = (releaseTime - primaryTime) / 86400000;
    return lagDays <= maxLag;
  }

  function isProminentDiscoverEntry(entry, options = {}) {
    const minVotes = options.minVoteCount ?? DISCOVER_MIN_VOTE_COUNT;
    const minPopularity = options.minPopularity ?? DISCOVER_MIN_POPULARITY;
    const votes = Number(entry?.voteCount) || 0;
    const popularity = Number(entry?.popularity) || 0;
    return votes >= minVotes || popularity >= minPopularity;
  }

  function mergeDiscoverListEntries(pageResults, options = {}) {
    const max = options.max ?? DISCOVER_MAX_MOVIES;
    const filterUpcoming = options.filterUpcoming === true;
    const filterNowPlaying = options.filterNowPlaying === true;
    const filterNewPremiere = options.filterNewPremiere === true;
    const filterProminent = options.filterProminent === true;
    const todayIso = options.todayIso;
    const seen = new Set();
    const entries = [];
    for (const page of pageResults) {
      if (!Array.isArray(page)) {
        continue;
      }
      for (const entry of page) {
        if (filterProminent && !isProminentDiscoverEntry(entry, options)) {
          continue;
        }
        if (filterUpcoming && todayIso && !isUpcomingReleaseEntry(entry, todayIso)) {
          continue;
        }
        if (
          filterNowPlaying &&
          todayIso &&
          !isNowPlayingReleaseEntry(entry, todayIso, options.nowPlayingWindowDays)
        ) {
          continue;
        }
        if (
          filterNewPremiere &&
          !isNewPremiereEntry(entry, {
            todayIso,
            upcomingOnly: filterUpcoming,
            nowPlayingOnly: filterNowPlaying,
            nowPlayingWindowDays: options.nowPlayingWindowDays,
            maxPremiereLagDays: options.maxPremiereLagDays,
          })
        ) {
          continue;
        }
        const id = Number(entry?.id);
        if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
          continue;
        }
        seen.add(id);
        entries.push(entry);
        if (entries.length >= max) {
          return entries;
        }
      }
    }
    return entries;
  }

  function filterDiscoverPageEntries(pageResults, options = {}) {
    if (!Array.isArray(pageResults)) {
      return [];
    }
    const entries = mergeDiscoverListEntries([pageResults], {
      ...options,
      max: Number.MAX_SAFE_INTEGER,
    });
    return trimDiscoverPageToGrid(entries, options);
  }

  /**
   * Largest count <= n that fills complete rows on both 2- and 4-column discover grids.
   * Uses 4 (lcm of 2 and 4) when possible; smaller pages fall back to min(⌊n/4⌋×4, ⌊n/2⌋×2).
   */
  function discoverCompleteCount(count) {
    if (!Number.isInteger(count) || count <= 0) {
      return 0;
    }
    const byUnit = Math.floor(count / DISCOVER_PAGE_COMPLETE_UNIT) * DISCOVER_PAGE_COMPLETE_UNIT;
    if (byUnit > 0) {
      return byUnit;
    }
    const byDesktop = Math.floor(count / DISCOVER_GRID_COLUMNS) * DISCOVER_GRID_COLUMNS;
    const byMobile = Math.floor(count / DISCOVER_GRID_COLUMNS_MOBILE) * DISCOVER_GRID_COLUMNS_MOBILE;
    const byBoth = Math.min(byDesktop, byMobile);
    return byBoth > 0 ? byBoth : count;
  }

  /**
   * Drop trailing incomplete rows on non-final pages so the grid never ends with
   * a lone movie. The last TMDB page keeps whatever count remains.
   */
  function trimDiscoverPageToGrid(entries, options = {}) {
    if (!Array.isArray(entries) || options.isLastPage) {
      return entries;
    }
    const completeCount = discoverCompleteCount(entries.length);
    if (completeCount === 0 || completeCount >= entries.length) {
      return entries;
    }
    return entries.slice(0, completeCount);
  }

  function mergeDiscoverMovieIds(pageResults, options = {}) {
    return mergeDiscoverListEntries(pageResults, options).map((entry) => entry.id);
  }

  return {
    DISCOVER_TABS,
    DEFAULT_DISCOVER_TAB,
    DISCOVER_DEFAULT_PAGE,
    DISCOVER_MAX_MOVIES,
    DISCOVER_GRID_COLUMNS,
    DISCOVER_GRID_COLUMNS_MOBILE,
    DISCOVER_PAGE_COMPLETE_UNIT,
    DEFAULT_DISCOVER_REGION,
    DISCOVER_LIST_CACHE_VERSION,
    DISCOVER_MIN_VOTE_COUNT,
    DISCOVER_MIN_POPULARITY,
    DISCOVER_MAX_PREMIERE_LAG_DAYS,
    normalizeDiscoverTab,
    normalizeDiscoverPage,
    buildDiscoverHash,
    parseDiscoverHash,
    normalizeDiscoverListMeta,
    todayIsoDate,
    shiftIsoDate,
    isUpcomingReleaseEntry,
    isNowPlayingReleaseEntry,
    isNewPremiereEntry,
    isProminentDiscoverEntry,
    mergeDiscoverMovieIds,
    mergeDiscoverListEntries,
    filterDiscoverPageEntries,
    trimDiscoverPageToGrid,
    discoverCompleteCount,
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
   */
  function normalizeLists(raw) {
    const stored = Array.isArray(raw) ? raw : [];
    const storedIds = (listId) => {
      const match = stored.find((entry) => entry && entry.id === listId);
      return normalizeMovieIds(match?.movieIds);
    };

    const watched = storedIds(WATCHED_ID);
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

  const MAX_CUSTOM_LISTS = 20;
  const MAX_CUSTOM_LIST_MOVIES = 200;
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

  function normalizePinnedCustomListId(pinnedId, customLists) {
    const id = typeof pinnedId === "string" ? pinnedId.trim() : "";
    if (!id || !isCustomListId(id)) {
      return null;
    }
    return findCustomList(customLists, id) ? id : null;
  }

  function sortCustomListsForIndex(customLists, mode, pinnedId) {
    if (!Array.isArray(customLists)) {
      return [];
    }
    const normalizedMode = normalizeCustomListIndexSort(mode);
    const sorted = [...customLists].sort((a, b) =>
      compareCustomListsForIndex(a, b, normalizedMode),
    );
    const pin = normalizePinnedCustomListId(pinnedId, customLists);
    if (!pin) {
      return sorted;
    }
    const pinned = sorted.find((list) => list.id === pin);
    if (!pinned) {
      return sorted;
    }
    return [pinned, ...sorted.filter((list) => list.id !== pin)];
  }

  function togglePinnedCustomListId(currentPin, listId, customLists) {
    if (!isCustomListId(listId) || !findCustomList(customLists, listId)) {
      return normalizePinnedCustomListId(currentPin, customLists);
    }
    const pin = normalizePinnedCustomListId(currentPin, customLists);
    return pin === listId ? null : listId;
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
      movieIds: normalizeMovieIds(raw.movieIds).slice(0, MAX_CUSTOM_LIST_MOVIES),
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

  /**
   * Create custom list shells referenced in a backup CSV before memberships apply.
   * Used when importing onto a fresh browser that has no list definitions yet.
   */
  function ensureCustomListsFromImport(customLists, tombstones, rows, now = new Date()) {
    const lists = Array.isArray(customLists) ? [...customLists] : [];
    const nextTombstones =
      tombstones && typeof tombstones === "object" ? { ...tombstones } : {};
    const stamp = now instanceof Date ? now.toISOString() : new Date().toISOString();
    const seen = new Set();

    for (const row of rows || []) {
      const listId = row?.listId;
      if (!isCustomListId(listId) || seen.has(listId)) {
        continue;
      }
      seen.add(listId);
      if (findCustomList(lists, listId)) {
        delete nextTombstones[listId];
        continue;
      }
      if (lists.length >= MAX_CUSTOM_LISTS) {
        continue;
      }
      let name = normalizeName(row?.listName);
      if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
        name = normalizeName(listId.slice(CUSTOM_ID_PREFIX.length)) || "Imported list";
      }
      if (isDuplicateName(lists, name)) {
        name = `${name} (${listId.slice(-4)})`.slice(0, MAX_NAME_LENGTH);
      }
      lists.push({
        id: listId,
        name,
        movieIds: [],
        createdAt: stamp,
        updatedAt: stamp,
      });
      delete nextTombstones[listId];
    }

    return { customLists: lists, customListTombstones: nextTombstones };
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

  function isCustomListAtMovieCap(customLists, listId) {
    const list = findCustomList(customLists, listId);
    return Boolean(list && list.movieIds.length >= MAX_CUSTOM_LIST_MOVIES);
  }

  function canAddMovieToCustomList(customLists, listId, movieId) {
    const list = findCustomList(customLists, listId);
    const id = Number(movieId);
    if (!list || !Number.isInteger(id) || id <= 0) {
      return false;
    }
    if (list.movieIds.includes(id)) {
      return true;
    }
    return list.movieIds.length < MAX_CUSTOM_LIST_MOVIES;
  }

  function addMovieToCustomList(customLists, listId, movieId, now = new Date()) {
    const id = Number(movieId);
    if (!isCustomListId(listId) || !Number.isInteger(id) || id <= 0) {
      return customLists;
    }
    const list = findCustomList(customLists, listId);
    if (!list || list.movieIds.includes(id) || list.movieIds.length >= MAX_CUSTOM_LIST_MOVIES) {
      return customLists;
    }
    const stamp = now.toISOString();
    return customLists.map((entry) => {
      if (entry.id !== listId) {
        return entry;
      }
      return {
        ...entry,
        movieIds: [...entry.movieIds, id],
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
    const normalized = normalizeMovieIds(movieIds).slice(0, MAX_CUSTOM_LIST_MOVIES);
    return customLists.map((list) =>
      list.id === listId ? { ...list, movieIds: normalized, updatedAt: stamp } : list,
    );
  }

  return {
    MAX_CUSTOM_LISTS,
    MAX_CUSTOM_LIST_MOVIES,
    MAX_NAME_LENGTH,
    MIN_NAME_LENGTH,
    CUSTOM_ID_PREFIX,
    isCustomListId,
    normalizeName,
    CUSTOM_LIST_INDEX_SORT_MODES,
    DEFAULT_CUSTOM_LIST_INDEX_SORT,
    normalizeCustomListIndexSort,
    normalizePinnedCustomListId,
    sortCustomListsForIndex,
    togglePinnedCustomListId,
    defaultCustomLists,
    defaultCustomListTombstones,
    normalizeCustomList,
    normalizeCustomLists,
    normalizeCustomListTombstones,
    findCustomList,
    customListsForMovie,
    isDuplicateName,
    isCustomListAtMovieCap,
    canAddMovieToCustomList,
    createCustomListId,
    createCustomList,
    ensureCustomListsFromImport,
    renameCustomList,
    deleteCustomList,
    addMovieToCustomList,
    removeMovieFromCustomList,
    replaceCustomListMovieIds,
  };
})();

/* ===== Collection backup CSV (generated from scripts/lib/list-csv.js) ===== */

/* Generated from scripts/lib/list-csv.js — run npm run bundle */

const appListCsv = (function () {
  /**
   * Collection backup CSV: export from the browser, import to restore, scrape ids only.
   *
   * The browser is the only place that knows the collection, and the scraper runs
   * on a machine that cannot read localStorage or the Gist. Settings exports this
   * file, you commit it, and `npm run scrape` reads it back. Both ends share these
   * functions so the format has exactly one definition.
   *
   * Only `tmdb_id` is load-bearing for scrape. The other columns carry list
   * membership, ratings, and viewing dates for backup/restore.
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
    parseCsv,
    parseCollectionCsv,
    summarizeCollectionImport,
    applyCollectionImport,
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

  function getCardHtml() {
    if (typeof appCardHtml !== "undefined") {
      return appCardHtml;
    }
    if (typeof require === "function") {
      return require("./card-html");
    }
    throw new Error("appCardHtml is not available");
  }

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
    return getCardHtml().formatRatingLabel(normalized) || "";
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
    void customLists;
    return collectWatchedMovieIds(lists);
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

/* ===== Shared rating field UI (generated from scripts/lib/rating-field-ui.js) ===== */

/* Generated from scripts/lib/rating-field-ui.js — run npm run bundle */

const appRatingFieldUi = (function () {
  /**
   * Shared optional user-rating field markup and interaction for sheets/dialogs.
   */

  function getCardHtml() {
    if (typeof appCardHtml !== "undefined") {
      return appCardHtml;
    }
    if (typeof require === "function") {
      return require("./card-html");
    }
    throw new Error("appCardHtml is not available");
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

  function userRatingFieldHtml(options = {}) {
    const prefix = String(options.idPrefix || "user-rating");
    const fieldId = `${prefix}-field`;
    const valueId = `${prefix}-value`;
    const sliderId = `${prefix}-slider`;
    const selectId = `${prefix}-select`;
    const clearId = `${prefix}-clear`;
    const activeClass = options.startActive ? " is-active" : "";
    const clearHidden = options.startActive ? "" : " hidden";
    return `<div class="user-rating-field${activeClass}" id="${getCardHtml().escapeHtml(fieldId)}">
    <div class="user-rating-header">
      <span class="user-rating-label">Your rating</span>
      <output class="user-rating-value is-empty" id="${getCardHtml().escapeHtml(valueId)}" for="${getCardHtml().escapeHtml(sliderId)}">—</output>
    </div>
    <div class="user-rating-slider-wrap">
      <span class="user-rating-scale" aria-hidden="true">1.0</span>
      <div class="rating-control">
        <input
          type="range"
          class="user-rating-slider rating-control-slider"
          id="${getCardHtml().escapeHtml(sliderId)}"
          min="0"
          max="90"
          step="1"
          value="60"
          aria-label="Your rating from 1 to 10 (optional)"
        />
        <select
          class="user-rating-select rating-control-select"
          id="${getCardHtml().escapeHtml(selectId)}"
          aria-label="Your rating from 1 to 10 (optional)"
        ></select>
      </div>
      <span class="user-rating-scale" aria-hidden="true">10</span>
    </div>
    <button type="button" class="user-rating-clear-btn" id="${getCardHtml().escapeHtml(clearId)}"${clearHidden}>Clear rating</button>
  </div>`;
  }

  function createRatingFieldController(refs, ratingsLib = getRatings()) {
    let touched = false;
    let pending = null;

    function reset() {
      touched = false;
      pending = null;
      if (refs.slider) {
        refs.slider.value = String(ratingsLib.DEFAULT_SLIDER_VALUE);
      }
      if (refs.select) {
        refs.select.value = "";
      }
      if (refs.clear) {
        refs.clear.hidden = true;
      }
      if (refs.value) {
        refs.value.textContent = "—";
        refs.value.classList.add("is-empty");
      }
      refs.field?.classList.remove("is-active");
    }

    function syncDisplay() {
      if (!touched) {
        reset();
        return;
      }
      refs.field?.classList.add("is-active");
      if (refs.clear) {
        refs.clear.hidden = false;
      }
      const rating =
        pending ?? ratingsLib.ratingFromSliderValue(Number(refs.slider?.value));
      pending = rating;
      if (refs.value) {
        refs.value.textContent = ratingsLib.formatUserRating(rating);
        refs.value.classList.remove("is-empty");
      }
      if (refs.slider) {
        refs.slider.value = String(ratingsLib.sliderValueFromRating(rating));
      }
      if (refs.select) {
        refs.select.value = ratingsLib.formatUserRating(rating);
      }
    }

    function onSliderInput() {
      if (!refs.slider) {
        return;
      }
      touched = true;
      pending = ratingsLib.ratingFromSliderValue(Number(refs.slider.value));
      syncDisplay();
    }

    function onSelectChange() {
      if (!refs.select) {
        return;
      }
      if (refs.select.value === "") {
        reset();
        return;
      }
      touched = true;
      pending = ratingsLib.normalizeRating(refs.select.value);
      syncDisplay();
    }

    function initSelect() {
      if (!refs.select) {
        return;
      }
      refs.select.innerHTML = ratingsLib.ratingSelectInnerHtml(null, { includeUnrated: true });
    }

    function getValue() {
      return touched ? pending : null;
    }

    function setValue(rating) {
      const normalized = ratingsLib.normalizeRating(rating);
      if (normalized == null) {
        reset();
        return;
      }
      touched = true;
      pending = normalized;
      syncDisplay();
    }

    return {
      reset,
      syncDisplay,
      onSliderInput,
      onSelectChange,
      initSelect,
      getValue,
      setValue,
      clear: reset,
    };
  }

  return {
    userRatingFieldHtml,
    createRatingFieldController,
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

/* ===== Per-movie viewing history (generated from scripts/lib/viewing-history.js) ===== */

/* Generated from scripts/lib/viewing-history.js — run npm run bundle */

const appViewingHistory = (function () {
  /** Per-movie viewing dates with entry-level merge metadata for Gist sync. */

  function normalizeDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
      ? value
      : null;
  }

  function normalizeStamp(value) {
    const time = Date.parse(value || "");
    return Number.isFinite(time) ? new Date(time).toISOString() : null;
  }

  function today(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function createViewingId(now = new Date()) {
    const random = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    return `view-${now.getTime().toString(36)}-${random}`;
  }

  function normalizeEntry(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.id || "").trim();
    const watchedOn = normalizeDate(raw.watchedOn);
    const updatedAt = normalizeStamp(raw.updatedAt);
    const deletedAt = normalizeStamp(raw.deletedAt);
    if (!id || !watchedOn || !updatedAt) return null;
    return { id, watchedOn, updatedAt, ...(deletedAt ? { deletedAt } : {}) };
  }

  function chooseEntry(a, b) {
    if (!a) return b;
    if (!b) return a;
    const aTime = Date.parse(a.deletedAt || a.updatedAt);
    const bTime = Date.parse(b.deletedAt || b.updatedAt);
    if (bTime > aTime) return b;
    if (aTime > bTime) return a;
    if (a.deletedAt && !b.deletedAt) return a;
    if (b.deletedAt && !a.deletedAt) return b;
    // Equal-time concurrent edits must converge regardless of merge direction.
    return b.watchedOn > a.watchedOn ? b : a;
  }

  function normalizeViewingHistory(raw) {
    const out = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
    for (const [key, entries] of Object.entries(raw)) {
      const movieId = Number(key);
      if (!Number.isInteger(movieId) || movieId <= 0 || !Array.isArray(entries)) continue;
      const byId = new Map();
      for (const rawEntry of entries) {
        const entry = normalizeEntry(rawEntry);
        if (entry) byId.set(entry.id, chooseEntry(byId.get(entry.id), entry));
      }
      // A viewing is identified to users by its movie and calendar date. Older
      // imports created fresh random ids for the same date, so a Gist merge could
      // display that viewing more than once. Keep the newest active entry for a
      // date while retaining tombstones, which stop deleted entries from being
      // resurrected by a stale client.
      const activeByDate = new Map();
      const tombstones = [];
      for (const entry of byId.values()) {
        if (entry.deletedAt) {
          tombstones.push(entry);
          continue;
        }
        const existing = activeByDate.get(entry.watchedOn);
        if (
          !existing ||
          entry.updatedAt > existing.updatedAt ||
          (entry.updatedAt === existing.updatedAt && entry.id > existing.id)
        ) {
          activeByDate.set(entry.watchedOn, entry);
        }
      }
      const normalized = [...activeByDate.values(), ...tombstones];
      if (normalized.length) {
        out[String(movieId)] = normalized.sort((a, b) => a.id.localeCompare(b.id));
      }
    }
    return out;
  }

  function viewingEntries(history, movieId, options = {}) {
    const entries = normalizeViewingHistory(history)[String(Number(movieId))] || [];
    return entries
      .filter((entry) => options.includeDeleted || !entry.deletedAt)
      .sort(
        (a, b) =>
          a.watchedOn.localeCompare(b.watchedOn) ||
          a.updatedAt.localeCompare(b.updatedAt) ||
          a.id.localeCompare(b.id),
      );
  }

  function latestViewingDate(history, movieId) {
    const entries = viewingEntries(history, movieId);
    if (!entries.length) {
      return null;
    }
    let latest = entries[0].watchedOn;
    for (const entry of entries) {
      if (entry.watchedOn > latest) {
        latest = entry.watchedOn;
      }
    }
    return latest;
  }

  function addViewing(history, movieId, watchedOn, now = new Date(), id = createViewingId(now)) {
    const movie = Number(movieId);
    const date = normalizeDate(watchedOn);
    if (!Number.isInteger(movie) || movie <= 0 || !date || date > today(now) || !id) return history || {};
    const base = normalizeViewingHistory(history);
    const entries = base[String(movie)] || [];
    return { ...base, [String(movie)]: [...entries, { id: String(id), watchedOn: date, updatedAt: now.toISOString() }] };
  }

  function updateViewing(history, movieId, entryId, watchedOn, now = new Date()) {
    const movie = Number(movieId);
    const date = normalizeDate(watchedOn);
    const base = normalizeViewingHistory(history);
    const entries = base[String(movie)] || [];
    if (!date || date > today(now) || !entries.some((entry) => entry.id === entryId && !entry.deletedAt)) return history || {};
    return { ...base, [String(movie)]: entries.map((entry) => entry.id === entryId ? { id: entry.id, watchedOn: date, updatedAt: now.toISOString() } : entry) };
  }

  function removeViewing(history, movieId, entryId, now = new Date()) {
    const movie = Number(movieId);
    const base = normalizeViewingHistory(history);
    const entries = base[String(movie)] || [];
    if (!entries.some((entry) => entry.id === entryId && !entry.deletedAt)) return history || {};
    const stamp = now.toISOString();
    return { ...base, [String(movie)]: entries.map((entry) => entry.id === entryId ? { ...entry, updatedAt: stamp, deletedAt: stamp } : entry) };
  }

  function mergeViewingHistory(a, b) {
    const left = normalizeViewingHistory(a);
    const right = normalizeViewingHistory(b);
    const merged = {};
    for (const movieId of new Set([...Object.keys(left), ...Object.keys(right)])) {
      const byId = new Map();
      for (const entry of [...(left[movieId] || []), ...(right[movieId] || [])]) {
        byId.set(entry.id, chooseEntry(byId.get(entry.id), entry));
      }
      merged[movieId] = [...byId.values()].sort((x, y) => x.id.localeCompare(y.id));
    }
    return normalizeViewingHistory(merged);
  }

  return {
    normalizeDate,
    today,
    createViewingId,
    normalizeViewingHistory,
    viewingEntries,
    latestViewingDate,
    addViewing,
    updateViewing,
    removeViewing,
    mergeViewingHistory,
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
    "watched-asc",
    "watched-desc",
    "year-asc",
    "year-desc",
    "rating-desc",
    "rating-asc",
    "user-rating-desc",
    "user-rating-asc",
    "friend-rating-desc",
    "friend-rating-asc",
    "title-asc",
    "title-desc",
  ]);

  const DEFAULT_SORT = "custom";
  const DEFAULT_PREFERENCE_SORT = "user-rating-desc";
  const MISSING_SORT_HINT = "—";

  const SORT_FIELDS = new Set([
    "added",
    "watched",
    "year",
    "rating",
    "user-rating",
    "friend-rating",
    "title",
  ]);

  const SORT_FIELD_DEFAULTS = {
    added: "added-desc",
    watched: "watched-desc",
    year: "year-desc",
    rating: "rating-desc",
    "user-rating": "user-rating-desc",
    "friend-rating": "friend-rating-desc",
    title: "title-desc",
  };

  const SORT_FIELD_LABELS = {
    "user-rating": "My Rating",
    added: "Date Added",
    watched: "Date Watched",
    year: "Release Year",
    rating: "Fan Rating",
    "friend-rating": "Friend Rating",
    title: "Title",
  };

  const SORT_FIELD_LABELS_SHORT = {
    "user-rating": "My Rating",
    added: "Added",
    watched: "Watched",
    year: "Year",
    rating: "Fan Rating",
    "friend-rating": "Friend Rating",
    title: "Title",
  };

  function getCardHtml() {
    if (typeof appCardHtml !== "undefined") {
      return appCardHtml;
    }
    if (typeof require === "function") {
      return require("./card-html");
    }
    throw new Error("appCardHtml is not available");
  }

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
    if (normalized.startsWith("watched-")) return "watched";
    if (normalized.startsWith("year-")) {
      return "year";
    }
    if (normalized.startsWith("user-rating-")) {
      return "user-rating";
    }
    if (normalized.startsWith("friend-rating-")) {
      return "friend-rating";
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

  function resolveSortMode(mode, { friendView = false } = {}) {
    const normalized = normalizeSort(mode);
    if (!friendView && getSortField(normalized) === "friend-rating") {
      return isSortDescending(normalized) ? "user-rating-desc" : "user-rating-asc";
    }
    return normalized;
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
      case "watched":
        return descending ? "Newest first" : "Oldest first";
      case "year":
        return descending ? "Newest first" : "Oldest first";
      case "rating":
        return descending ? "Highest first" : "Lowest first";
      case "friend-rating":
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
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }
    return getCardHtml().formatRatingLabel(value);
  }

  function formatUserRatingHint(userRating) {
    if (userRating == null || userRating === "") {
      return null;
    }
    return getCardHtml().formatRatingLabel(userRating);
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
    const getFriendRating =
      typeof context.getFriendRating === "function" ? context.getFriendRating : () => null;
    const getAddedAt =
      typeof context.getAddedAt === "function" ? context.getAddedAt : () => null;
    const getWatchedOn =
      typeof context.getWatchedOn === "function" ? context.getWatchedOn : () => null;
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

    if (normalized === "watched-asc" || normalized === "watched-desc") {
      const direction = normalized === "watched-asc" ? "asc" : "desc";
      return copy.sort((a, b) =>
        compareNullableNumber(
          parseAddedTime(getWatchedOn(a)),
          parseAddedTime(getWatchedOn(b)),
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

    if (normalized === "friend-rating-asc" || normalized === "friend-rating-desc") {
      const direction = normalized === "friend-rating-asc" ? "asc" : "desc";
      return copy.sort((a, b) =>
        compareNullableNumber(
          getFriendRating(a),
          getFriendRating(b),
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

    if (normalized === "watched-asc" || normalized === "watched-desc") {
      return formatAddedHint(context.watchedOn) || MISSING_SORT_HINT;
    }

    if (normalized === "rating-asc" || normalized === "rating-desc") {
      return formatFanRating(record.voteAverage) || MISSING_SORT_HINT;
    }

    if (normalized === "user-rating-asc" || normalized === "user-rating-desc") {
      return formatUserRatingHint(context.userRating) || MISSING_SORT_HINT;
    }

    if (normalized === "friend-rating-asc" || normalized === "friend-rating-desc") {
      return formatUserRatingHint(context.friendRating) || MISSING_SORT_HINT;
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
    resolveSortMode,
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

  function getViewingHistory() {
    if (typeof appViewingHistory !== "undefined") return appViewingHistory;
    if (typeof require === "function") return require("./viewing-history");
    throw new Error("appViewingHistory is not available");
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

  function getCustomLists() {
    if (typeof appCustomLists !== "undefined") {
      return appCustomLists;
    }
    if (typeof require === "function") {
      return require("./custom-lists");
    }
    throw new Error("appCustomLists is not available");
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

  function mergePreferences(primary, secondary, customLists) {
    const customListsLib = getCustomLists();
    const primaryPrefs =
      primary?.preferences && typeof primary.preferences === "object"
        ? primary.preferences
        : {};
    const secondaryPrefs =
      secondary?.preferences && typeof secondary.preferences === "object"
        ? secondary.preferences
        : {};

    const primaryPin = customListsLib.normalizePinnedCustomListId(
      primaryPrefs.pinnedCustomListId,
      customLists,
    );
    const secondaryPin = customListsLib.normalizePinnedCustomListId(
      secondaryPrefs.pinnedCustomListId,
      customLists,
    );
    const primaryPinAt = parseStamp(primaryPrefs.pinnedCustomListAt);
    const secondaryPinAt = parseStamp(secondaryPrefs.pinnedCustomListAt);

    let pinnedCustomListId;
    let pinnedCustomListAt;
    if (primaryPinAt != null && (secondaryPinAt == null || primaryPinAt >= secondaryPinAt)) {
      pinnedCustomListId = primaryPin;
      pinnedCustomListAt =
        typeof primaryPrefs.pinnedCustomListAt === "string"
          ? primaryPrefs.pinnedCustomListAt
          : null;
    } else if (secondaryPinAt != null) {
      pinnedCustomListId = secondaryPin;
      pinnedCustomListAt =
        typeof secondaryPrefs.pinnedCustomListAt === "string"
          ? secondaryPrefs.pinnedCustomListAt
          : null;
    } else {
      pinnedCustomListId = primaryPin ?? secondaryPin;
      pinnedCustomListAt = null;
    }

    return {
      ...secondaryPrefs,
      ...primaryPrefs,
      pinnedCustomListId,
      pinnedCustomListAt,
    };
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
      preferences: mergePreferences(primary, secondary, customListState.customLists),
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
      viewingHistory: getViewingHistory().mergeViewingHistory(
        secondary.viewingHistory,
        primary.viewingHistory,
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

/* ===== Add-movie state application (generated from scripts/lib/add-movie.js) ===== */

/* Generated from scripts/lib/add-movie.js — run npm run bundle */

const appAddMovie = (function () {
  /**
   * Apply an add-movie choice to user state: optional preset, custom lists,
   * and Watched-only rating / viewing date.
   *
   * Callers persist. This function does not bump `updatedAt`.
   */

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

  function getAddedAt() {
    if (typeof appAddedAt !== "undefined") {
      return appAddedAt;
    }
    if (typeof require === "function") {
      return require("./added-at");
    }
    throw new Error("appAddedAt is not available");
  }

  function getViewingHistory() {
    if (typeof appViewingHistory !== "undefined") {
      return appViewingHistory;
    }
    if (typeof require === "function") {
      return require("./viewing-history");
    }
    throw new Error("appViewingHistory is not available");
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

  function hasAddMovieDestinations(presetListId, customListIds) {
    if (getLists().isListId(presetListId)) {
      return true;
    }
    return Array.isArray(customListIds) && customListIds.length > 0;
  }

  function applyAddMovie(userState, options = {}, now = new Date()) {
    const empty = { state: userState, cappedCustomLists: [] };
    if (!userState || typeof userState !== "object") {
      return empty;
    }

    const movieId = Number(options.movieId);
    const presetListId = options.presetListId ?? null;
    const customListIds = Array.isArray(options.customListIds)
      ? options.customListIds
      : [];
    const rating = options.rating;
    const watchedOn = options.watchedOn || null;

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return empty;
    }
    if (!hasAddMovieDestinations(presetListId, customListIds)) {
      return empty;
    }

    const listsLib = getLists();
    const customLib = getCustomLists();
    const ratingsLib = getRatings();
    const addedAtLib = getAddedAt();
    const viewingLib = getViewingHistory();
    const syncMerge = getSyncMerge();

    let next = userState;
    let changed = false;
    const cappedCustomLists = [];

    if (listsLib.isListId(presetListId)) {
      const nextLists = listsLib.assignMovieToList(next.lists, presetListId, movieId);
      if (nextLists !== next.lists) {
        changed = true;
        const readded = syncMerge.isRemoved(next.statuses, movieId);
        next = {
          ...next,
          lists: nextLists,
          ratings: ratingsLib.normalizeRatings(
            next.ratings,
            nextLists,
            next.customLists,
          ),
          addedAt: addedAtLib.recordAddedAt(next.addedAt, movieId, now, { readded }),
          statuses: syncMerge.setMovieStatus(
            next.statuses,
            movieId,
            presetListId,
            now,
          ),
        };
      }
    }

    let nextCustomLists = next.customLists;
    for (const listId of customListIds) {
      const list = customLib.findCustomList(nextCustomLists, listId);
      if (
        list &&
        !list.movieIds.includes(movieId) &&
        customLib.isCustomListAtMovieCap(nextCustomLists, listId)
      ) {
        cappedCustomLists.push(list.name);
        continue;
      }
      const updated = customLib.addMovieToCustomList(
        nextCustomLists,
        listId,
        movieId,
        now,
      );
      if (updated !== nextCustomLists) {
        nextCustomLists = updated;
        changed = true;
      }
    }
    if (nextCustomLists !== next.customLists) {
      next = { ...next, customLists: nextCustomLists };
    }

    if (
      presetListId === listsLib.WATCHED_ID &&
      listsLib.isWatched(next.lists, movieId)
    ) {
      if (rating != null) {
        const nextRatings = ratingsLib.setRating(next.ratings, movieId, rating);
        if (nextRatings !== next.ratings) {
          next = { ...next, ratings: nextRatings };
          changed = true;
        }
      }
      if (watchedOn) {
        const nextHistory = viewingLib.addViewing(
          next.viewingHistory,
          movieId,
          watchedOn,
          now,
        );
        if (nextHistory !== next.viewingHistory) {
          next = { ...next, viewingHistory: nextHistory };
          changed = true;
        }
      }
    }

    return {
      state: changed ? next : userState,
      cappedCustomLists,
    };
  }

  return {
    hasAddMovieDestinations,
    applyAddMovie,
  };
})();

/* ===== Shareable movie URLs (generated from scripts/lib/movie-share.js) ===== */

/* Generated from scripts/lib/movie-share.js — run npm run bundle */

const appMovieShare = (function () {
  /**
   * Shareable movie URLs and whether a recipient already has the film.
   *
   * The link is always `#movie/{id}` on the current origin. Membership is any
   * preset list or custom list — custom-list-only still counts as owned.
   */

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

  function movieShareUrl(pageHref, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return "";
    }
    try {
      const url = new URL(pageHref);
      url.hash = `#movie/${id}`;
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function isMovieOwned(lists, customLists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return false;
    }
    if (getLists().findListIdsForMovie(lists, id).length > 0) {
      return true;
    }
    return getCustomLists().customListsForMovie(customLists, id).length > 0;
  }

  return {
    movieShareUrl,
    isMovieOwned,
  };
})();

/* ===== Friend list page helpers (generated from scripts/lib/friend-view.js) ===== */

/* Generated from scripts/lib/friend-view.js — run npm run bundle */

const appFriendView = (function () {
  /**
   * Friend list page: hash routing helpers and overview stats.
   */

  const FRIEND_HASH_RE = /^#friend\/(\d+)$/;
  const FRIENDS_INDEX_HASH = "#friends";

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function parseFriendHash(hash) {
    const match = FRIEND_HASH_RE.exec(hash || "");
    if (!match) {
      return null;
    }
    const userId = Number(match[1]);
    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }
    return { userId };
  }

  function buildFriendHash(userId) {
    const id = Number(userId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid friend user id");
    }
    return `#friend/${id}`;
  }

  function parseFriendsIndexHash(hash) {
    const normalized = hash || "";
    return normalized === FRIENDS_INDEX_HASH || normalized === `${FRIENDS_INDEX_HASH}/`;
  }

  function buildFriendsIndexHash() {
    return FRIENDS_INDEX_HASH;
  }

  function friendListSections(friendState) {
    if (!friendState) {
      return [];
    }
    const lists = getLists();
    const sections = [];
    for (const preset of lists.PRESET_LISTS) {
      const list = lists.findList(friendState.lists, preset.id);
      const movieIds = list?.movieIds || [];
      if (movieIds.length) {
        sections.push({ id: preset.id, name: preset.name, movieIds: [...movieIds] });
      }
    }
    for (const custom of friendState.customLists || []) {
      if (custom.movieIds?.length) {
        sections.push({ id: custom.id, name: custom.name, movieIds: [...custom.movieIds] });
      }
    }
    return sections;
  }

  function friendOverviewStats(friendState, viewerState) {
    const lists = getLists();
    const watched =
      lists.findList(friendState?.lists, lists.WATCHED_ID)?.movieIds || [];
    const watchlist =
      lists.findList(friendState?.lists, lists.WATCHLIST_ID)?.movieIds || [];
    const customLists = friendState?.customLists || [];
    const customListCount = customLists.filter((list) => list.movieIds?.length).length;

    let ratedCount = 0;
    const ratings = friendState?.ratings || {};
    for (const key of Object.keys(ratings)) {
      if (ratings[key] != null) {
        ratedCount += 1;
      }
    }

    const yourWatched = new Set(
      lists.findList(viewerState?.lists, lists.WATCHED_ID)?.movieIds || [],
    );
    let overlapWatched = 0;
    for (const id of watched) {
      if (yourWatched.has(id)) {
        overlapWatched += 1;
      }
    }

    const sections = friendListSections(friendState);
    const totalMovies = new Set(sections.flatMap((section) => section.movieIds)).size;

    return {
      watchedCount: watched.length,
      watchlistCount: watchlist.length,
      customListCount,
      ratedCount,
      overlapWatched,
      totalMovies,
      sectionCount: sections.length,
    };
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

  function getRatings() {
    if (typeof appRatings !== "undefined") {
      return appRatings;
    }
    if (typeof require === "function") {
      return require("./ratings");
    }
    throw new Error("appRatings is not available");
  }

  function getAddedAtLib() {
    if (typeof appAddedAt !== "undefined") {
      return appAddedAt;
    }
    if (typeof require === "function") {
      return require("./added-at");
    }
    throw new Error("appAddedAt is not available");
  }

  function getViewingHistory() {
    if (typeof appViewingHistory !== "undefined") {
      return appViewingHistory;
    }
    if (typeof require === "function") {
      return require("./viewing-history");
    }
    throw new Error("appViewingHistory is not available");
  }

  function friendSortContext(sectionMovieIds, viewerState, _friendState, runtimeContext = {}) {
    const sortLib = getSort();
    const sortMode = runtimeContext.sortMode ?? sortLib.DEFAULT_PREFERENCE_SORT;
    const getRecord =
      typeof runtimeContext.getRecord === "function" ? runtimeContext.getRecord : () => null;
    const ratingsLib = getRatings();
    const addedAtLib = getAddedAtLib();
    const viewingHistoryLib = getViewingHistory();

    const sortContext = {
      getRecord,
      getUserRating: (id) => ratingsLib.getRating(viewerState?.ratings, id),
      getFriendRating: (id) => ratingsLib.getRating(_friendState?.ratings, id),
      getAddedAt: (id) => addedAtLib.getAddedAt(viewerState?.addedAt, id),
      getWatchedOn: (id) => viewingHistoryLib.latestViewingDate(viewerState?.viewingHistory, id),
    };

    const joinOrder = sortLib.buildOrderIndex(sectionMovieIds);
    sortContext.getListJoinIndex = (id) => joinOrder.get(Number(id)) ?? null;

    if (sortLib.getSortField(sortMode) === "watched") {
      const latestByMovie = new Map();
      const normalized = viewingHistoryLib.normalizeViewingHistory(viewerState?.viewingHistory);
      for (const [movieId, entries] of Object.entries(normalized)) {
        let latest = null;
        for (const entry of entries) {
          if (!entry.deletedAt && (!latest || entry.watchedOn > latest)) {
            latest = entry.watchedOn;
          }
        }
        if (latest) {
          latestByMovie.set(Number(movieId), latest);
        }
      }
      sortContext.getWatchedOn = (id) => latestByMovie.get(Number(id)) ?? null;
    }

    return sortContext;
  }

  function friendSectionSortedIds(section, sortMode, viewerState, friendState, runtimeContext = {}) {
    return getSort().sortMovieIds(
      section.movieIds,
      sortMode,
      friendSortContext(section.movieIds, viewerState, friendState, {
        ...runtimeContext,
        sortMode,
      }),
    );
  }

  function friendSectionContainingMovie(sections, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }
    for (const section of sections) {
      if (section.movieIds.includes(id)) {
        return section;
      }
    }
    return null;
  }

  function friendNavigationIds(sections, movieId, options = {}) {
    const sortMode = options.sortMode ?? null;
    const viewerState = options.viewerState ?? null;
    const friendState = options.friendState ?? null;
    const runtimeContext = options.runtimeContext ?? {};

    function idsForSection(section) {
      if (sortMode == null) {
        return [...section.movieIds];
      }
      return friendSectionSortedIds(section, sortMode, viewerState, friendState, runtimeContext);
    }

    if (movieId != null) {
      const section = friendSectionContainingMovie(sections, movieId);
      if (section) {
        return idsForSection(section);
      }
    }
    return sections.flatMap((section) => idsForSection(section));
  }

  function friendListNamesForMovie(friendState, movieId) {
    const id = Number(movieId);
    if (!friendState || !Number.isInteger(id) || id <= 0) {
      return [];
    }
    return friendListSections(friendState)
      .filter((section) => section.movieIds.includes(id))
      .map((section) => section.name);
  }

  return {
    parseFriendHash,
    buildFriendHash,
    parseFriendsIndexHash,
    buildFriendsIndexHash,
    FRIENDS_INDEX_HASH,
    friendListSections,
    friendOverviewStats,
    friendSortContext,
    friendSectionSortedIds,
    friendSectionContainingMovie,
    friendNavigationIds,
    friendListNamesForMovie,
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
   * The account session token lives under its own key and is deliberately absent
   * from this payload so it is never synced to the server doc.
   */

  const USER_STATE_KEY = "moviecollector-user-state";
  /** Payload from just before the last merge, so a bad merge stays recoverable. */
  const USER_STATE_BACKUP_KEY = "moviecollector-user-state-backup";
  const GIST_SYNC_KEY = "moviecollector-gist-sync";
  const TMDB_AUTH_KEY = "moviecollector-tmdb-auth";
  const HOSTED_SESSION_KEY = "moviecollector-hosted-session";
  const ACCOUNT_KEY = "moviecollector-account";
  const USER_STATE_VERSION = 4;

  const VIEW_MODES = new Set(["cards", "detail"]);
  const STORAGE_MODES = new Set(["account"]);

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

  function getViewingHistory() {
    if (typeof appViewingHistory !== "undefined") return appViewingHistory;
    if (typeof require === "function") return require("./viewing-history");
    throw new Error("appViewingHistory is not available");
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
    return {
      viewMode: "cards",
      sort: getSort().DEFAULT_PREFERENCE_SORT,
      customListIndexSort: getCustomLists().DEFAULT_CUSTOM_LIST_INDEX_SORT,
      pinnedCustomListId: null,
      pinnedCustomListAt: null,
      friendFanRatings: false,
    };
  }

  function normalizeIsoStamp(value) {
    const time = Date.parse(value || "");
    return Number.isFinite(time) ? new Date(time).toISOString() : null;
  }

  function defaultUserState() {
    const lists = getLists();
    return {
      version: USER_STATE_VERSION,
      updatedAt: null,
      storageMode: "account",
      lists: lists.defaultLists(),
      activeListId: lists.DEFAULT_LIST_ID,
      preferences: defaultPreferences(),
      ratings: {},
      addedAt: {},
      viewingHistory: {},
      statuses: {},
      customLists: getCustomLists().defaultCustomLists(),
      customListTombstones: getCustomLists().defaultCustomListTombstones(),
    };
  }

  function normalizePreferences(raw, customLists) {
    const base = defaultPreferences();
    if (!raw || typeof raw !== "object") {
      return base;
    }
    let viewMode = raw.viewMode;
    if (viewMode === "list") {
      viewMode = "cards";
    }
    const customListsLib = getCustomLists();
    const lists = customLists ?? customListsLib.defaultCustomLists();
    return {
      viewMode: VIEW_MODES.has(viewMode) ? viewMode : base.viewMode,
      sort: getSort().normalizeWatchedSort(raw.sort, base.sort),
      customListIndexSort: customListsLib.normalizeCustomListIndexSort(
        raw.customListIndexSort ?? base.customListIndexSort,
      ),
      pinnedCustomListId: customListsLib.normalizePinnedCustomListId(
        raw.pinnedCustomListId,
        lists,
      ),
      pinnedCustomListAt: normalizeIsoStamp(raw.pinnedCustomListAt),
      friendFanRatings: raw.friendFanRatings === true,
    };
  }

  function normalizeUserState(raw) {
    const lists = getLists();
    const base = defaultUserState();
    if (!raw || typeof raw !== "object") {
      return base;
    }

    const normalizedLists = lists.normalizeLists(raw.lists);

    const activeListId = raw.activeListId;

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

    const preferences = normalizePreferences(raw.preferences, customLists);

    return {
      version: USER_STATE_VERSION,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
      storageMode: "account",
      lists: normalizedLists,
      activeListId: lists.isListId(activeListId)
        ? activeListId
        : lists.DEFAULT_LIST_ID,
      preferences,
      ratings: getRatings().normalizeRatings(raw.ratings, normalizedLists, customLists),
      addedAt: getAddedAt().normalizeAddedAt(raw.addedAt, normalizedLists),
      viewingHistory: getViewingHistory().normalizeViewingHistory(raw.viewingHistory),
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
      viewingHistory: sortedIdMap(normalized.viewingHistory),
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
    ACCOUNT_KEY,
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

/* ===== Account sync helpers (generated from scripts/lib/account-sync.js) ===== */

/* Generated from scripts/lib/account-sync.js — run npm run bundle */

const appAccountSync = (function () {
  /**
   * Account sync helpers for the CineQueue backend (Cloudflare Worker + D1).
   *
   * Pure config/URL helpers only; the fetch runtime lives in 03-user-state.js.
   * The session token is stored under its own key and never part of the synced
   * payload, same as the Gist token.
   */

  /** Direct Worker URL for local dev; Netlify proxies /api/backend in production. */
  const ACCOUNT_API_DIRECT = "https://cinequeue-api.cinequeue.workers.dev/api";
  const ACCOUNT_API_PROXIED = "/api/backend";
  const TMDB_API_PROXIED = "/api/tmdb";
  const MOVIES_BATCH_PATH = "/movies/batch";

  function resolveAccountApiBase(hostname) {
    const host = String(hostname || "");
    return host === "localhost" || host === "127.0.0.1"
      ? ACCOUNT_API_DIRECT
      : ACCOUNT_API_PROXIED;
  }

  function resolveTmdbApiBase(hostname) {
    const host = String(hostname || "");
    return host === "localhost" || host === "127.0.0.1"
      ? `${ACCOUNT_API_DIRECT}/tmdb`
      : TMDB_API_PROXIED;
  }

  function parseAccountConfig(json) {
    if (json == null || json === "") {
      return null;
    }
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      const token = typeof parsed.token === "string" ? parsed.token.trim() : "";
      const email = typeof parsed.email === "string" ? parsed.email.trim() : "";
      const userId = Number(parsed.userId);
      if (!token || !Number.isInteger(userId)) {
        return null;
      }
      return {
        token,
        email,
        userId,
        displayName:
          typeof parsed.displayName === "string" ? parsed.displayName : "",
      };
    } catch (_) {
      return null;
    }
  }

  function serializeAccountConfig(config) {
    return JSON.stringify({
      token: config.token,
      email: config.email || "",
      userId: config.userId,
      displayName: config.displayName || "",
    });
  }

  function isConnectedAccountConfig(config) {
    return Boolean(config?.token && Number.isInteger(config?.userId));
  }

  return {
    ACCOUNT_API_DIRECT,
    ACCOUNT_API_PROXIED,
    TMDB_API_PROXIED,
    MOVIES_BATCH_PATH,
    resolveAccountApiBase,
    resolveTmdbApiBase,
    parseAccountConfig,
    serializeAccountConfig,
    isConnectedAccountConfig,
  };
})();

/* ===== Movie batch cache helpers (generated from scripts/lib/movie-cache.js) ===== */

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
    return { genre: [], actor: [], director: [], year: [] };
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

  function tokenizeSearchText(text) {
    return String(text || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
  }

  function ensureSearchHaystack(movie) {
    if (!movie || movie._titleTokens) {
      return;
    }
    const year = movieReleaseYear(movie);
    const decade = year != null ? decadeFromYear(year) : "";
    movie._decadeLabel = decade;
    movie._titleTokens = tokenizeSearchText(movie.title);
  }

  function movieMatchesTitleTerms(movie, terms) {
    if (!terms || terms.length === 0) {
      return true;
    }
    ensureSearchHaystack(movie);
    const unused = (movie._titleTokens || []).slice();
    let usedAToken = false;
    for (const term of terms) {
      const tokens = tokenizeSearchText(term);
      if (!tokens.length) {
        continue;
      }
      usedAToken = true;
      for (const token of tokens) {
        const index = unused.findIndex((word) => word.startsWith(token));
        if (index === -1) {
          return false;
        }
        unused.splice(index, 1);
      }
    }
    return usedAToken;
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

  const DIRECTOR_FIELD = {
    key: "director",
    prefix: "director",
    suppressTextOnLiteralPrefix: false,
    chipAriaPrefix: "director",
    labelKey: normalizePersonKey,
    formatQuery(label) {
      return formatFieldSearchQuery("director", label);
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
      const directors = Array.isArray(movie?.directors) ? movie.directors : [];
      return directors.some((name) => this.labelKey(name).includes(term));
    },
    collectValues(movies) {
      const seen = new Set();
      const values = [];
      for (const movie of movies || []) {
        for (const label of Array.isArray(movie?.directors) ? movie.directors : []) {
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

  const SEARCH_FIELD_TYPES = [GENRE_FIELD, ACTOR_FIELD, DIRECTOR_FIELD, YEAR_FIELD];

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
      director: new Set(),
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
    if (field.key === "year" || field.key === "actor" || field.key === "director") {
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
          director: [...(filter.fieldTerms.director || [])],
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

    return movieMatchesTitleTerms(movie, yearDecadeCriteria.otherTextTerms);
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
 * User state runtime: localStorage persistence plus optional account sync.
 *
 * Only the list payload is ever synced. The account session token lives under
 * its own key and is never part of the serialized state.
 */

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

function persistUserState(options = {}) {
  userState = appUserState.touchUserState(userState);
  writeUserStateToStorage();
  if (options.sync !== false && accountSyncEnabled()) {
    queueAccountSync({ push: true });
  }
}

function updateRatings(nextRatings) {
  if (nextRatings === userState.ratings) {
    return false;
  }
  userState = { ...userState, ratings: nextRatings };
  return true;
}

function updateViewingHistory(nextHistory) {
  if (nextHistory === userState.viewingHistory) return false;
  userState = { ...userState, viewingHistory: nextHistory };
  return true;
}

function addMovieViewing(movieId, watchedOn) {
  if (!appLists.isWatched(userState.lists, movieId)) {
    return false;
  }
  return updateViewingHistory(
    appViewingHistory.addViewing(userState.viewingHistory, movieId, watchedOn),
  );
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

function isLayoutLockedToDetail() {
  return isWatchlistActive() || isDiscoverActive();
}

function syncViewModeButton() {
  if (!viewModeCycleBtn) {
    return;
  }
  viewModeCycleBtn.hidden = isLayoutLockedToDetail();
  if (isLayoutLockedToDetail()) {
    return;
  }
  viewModeCycleBtn.dataset.viewMode = gridViewMode;
  viewModeCycleBtn.setAttribute("aria-label", VIEW_MODE_LABELS[gridViewMode]);
}

function refreshViewModeForActiveList() {
  if (isLayoutLockedToDetail()) {
    gridViewMode = "detail";
  } else {
    gridViewMode = userState.preferences.viewMode;
  }
  document.body.classList.toggle("view-mode-cards", gridViewMode === "cards");
  document.body.classList.toggle("view-mode-detail", gridViewMode === "detail");
  syncViewModeButton();
}

function setViewMode(mode) {
  if (isLayoutLockedToDetail()) {
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

/** Adopts a merged payload locally, keeping the previous one as a backup. */
function adoptMergedState(merged) {
  backupUserState(userState);
  userState = { ...merged, storageMode: userState.storageMode };
  gridViewMode = userState.preferences.viewMode;
  writeUserStateToStorage();
}

function mergeIntoUserState(incoming) {
  return appUserState.normalizeUserState(
    appSyncMerge.mergeUserStates(userState, incoming),
  );
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
  if (document.visibilityState !== "visible") {
    return;
  }
  if (accountSyncEnabled()) {
    queueAccountSync();
  }
}

/* --- Account sync (CineQueue backend: Cloudflare Worker + D1) --- */

const ACCOUNT_TIMEOUT_MS = 15000;

let accountConfig = null;

/** Serializes every account read/write pair, same reasoning as queueGistSync. */
let accountSyncChain = Promise.resolve();

function loadAccountConfig() {
  accountConfig = appAccountSync.parseAccountConfig(
    readStorage(appUserState.ACCOUNT_KEY),
  );
  return accountConfig;
}

function saveAccountConfig(config) {
  accountConfig = config;
  if (config) {
    writeStorage(
      appUserState.ACCOUNT_KEY,
      appAccountSync.serializeAccountConfig(config),
    );
  } else {
    removeStorage(appUserState.ACCOUNT_KEY);
  }
}

function accountSyncEnabled() {
  return (
    userState.storageMode === "account" &&
    appAccountSync.isConnectedAccountConfig(accountConfig)
  );
}

async function accountRequest(path, options = {}) {
  const { method = "GET", body, auth = true } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ACCOUNT_TIMEOUT_MS);
  try {
    const headers = {};
    if (auth) {
      headers.authorization = `Bearer ${accountConfig?.token || ""}`;
    }
    if (body) {
      headers["content-type"] = "application/json";
    }
    const base = appAccountSync.resolveAccountApiBase(window.location.hostname);
    const response = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      // An expired or revoked session should read as "logged out", not as an
      // endless string of sync errors.
      if (response.status === 401 && auth) {
        saveAccountConfig(null);
      }
      const error = new Error(
        payload?.error || `Account request failed (${response.status})`,
      );
      error.status = response.status;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

/** Same read-merge-write dance as reconcileWithGist, against /api/data. */
async function reconcileWithAccount(options = {}) {
  if (!accountSyncEnabled()) {
    return { ok: false, reason: "disconnected" };
  }

  let remoteState = null;
  try {
    const body = await accountRequest("/data");
    remoteState = body?.doc
      ? appUserState.parseUserState(JSON.stringify(body.doc))
      : null;
  } catch (error) {
    if (error?.status !== 404) {
      throw error;
    }
    /* 404 just means nothing has been pushed yet. */
  }

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

  if (options.push && mergedSignature !== remoteSignature) {
    userState = appUserState.touchUserState(userState);
    writeUserStateToStorage();
    await accountRequest("/data", {
      method: "PUT",
      body: { doc: JSON.parse(appUserState.serializeUserState(userState)) },
    });
  }

  return { ok: true, localChanged };
}

function queueAccountSync(options = {}) {
  accountSyncChain = accountSyncChain
    .then(() => reconcileWithAccount(options))
    .then((result) => {
      if (!result?.ok) {
        return;
      }
      if (result.localChanged) {
        onRemoteStateAdopted();
      }
      setStatus(
        accountSyncStatus,
        `Synced at ${formatSyncTime(userState.updatedAt)}.`,
        "ok",
      );
    })
    .catch((error) => {
      // Same rule as Gist sync: never blind-write after a failed read.
      setStatus(
        accountSyncStatus,
        error?.status === 401
          ? "Session expired. Log in again to keep syncing."
          : "Could not reach the sync server. Changes are saved on this device and will sync later.",
        "error",
      );
    });
  return accountSyncChain;
}

/**
 * Signup and login share a shape: get a session, then pull remote lists only.
 * Local data is not pushed on connect — export/import CSV to migrate old lists.
 */
async function connectAccount(mode, email, password, inviteCode) {
  try {
    const payload = { email, password };
    if (mode === "signup") {
      payload.inviteCode = inviteCode || "";
    }
    const body = await accountRequest(`/${mode}`, {
      method: "POST",
      auth: false,
      body: payload,
    });
    if (!body?.token || !body?.user?.id) {
      return {
        ok: false,
        error:
          mode === "signup"
            ? "Could not create that account. Try logging in if you already have one."
            : "Could not sign in. Check your email and password.",
      };
    }
    saveAccountConfig({
      token: body.token,
      email: body.user.email,
      userId: body.user.id,
      displayName: body.user.displayName || "",
    });
    backupUserState(userState);
    userState = { ...userState, storageMode: "account" };
    writeUserStateToStorage();
    await queueAccountSync({ push: false });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function disconnectAccount() {
  saveAccountConfig(null);
  userState = { ...userState, storageMode: "account" };
  writeUserStateToStorage();
}

async function deleteRemoteAccount(password) {
  return accountRequest("/account", {
    method: "DELETE",
    body: { password },
  });
}

/* Friends: thin wrappers, the dialog layer owns rendering and status text. */

function fetchFriends() {
  return accountRequest("/friends");
}

function sendFriendRequest(email) {
  return accountRequest("/friends/request", { method: "POST", body: { email } });
}

function acceptFriend(userId) {
  return accountRequest(`/friends/${userId}/accept`, { method: "POST" });
}

function removeFriend(userId) {
  return accountRequest(`/friends/${userId}`, { method: "DELETE" });
}

async function fetchFriendState(userId) {
  const body = await accountRequest(`/friends/${userId}/data`);
  return body?.doc
    ? appUserState.parseUserState(JSON.stringify(body.doc))
    : null;
}

/* ===== TMDB client: credential, Cache API wrapper, hydration pool ===== */

/**
 * TMDB access with a Cache API layer for movie detail responses.
 *
 * Movie detail responses are cached under a synthetic key that omits the
 * credential, so the cache survives a credential change and never stores the
 * secret itself. Cached movies are served immediately; TMDB is checked again
 * only after appTmdbMovieCache.MOVIE_CACHE_REVALIDATE_MS (30 days). Search is
 * transient and only memoized for the session.
 *
 * Ahead of network hydration, committed poster files under data/posters/ are
 * served when data/posters.json lists the id. Movie metadata comes from the
 * account D1 batch cache (POST /api/movies/batch), then per-id TMDB fallback.
 *
 * When logged in, all TMDB traffic goes through the account-gated Worker proxy
 * at /api/tmdb (Netlify redirect in production, direct Worker URL on localhost).
 */

const TMDB_CACHE_NAME = "moviecollector-tmdb-v1";
const CACHE_KEY_ORIGIN = "https://moviecollector.invalid/tmdb";
const REQUEST_TIMEOUT_MS = 12000;
const HYDRATE_CONCURRENCY = 6;
const BATCH_REQUEST_TIMEOUT_MS = 20000;
const POSTER_LOAD_CONCURRENCY = 6;
const POSTER_LAZY_ROOT_MARGIN = "320px 0px";

function isLocalhostHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/** Preview loading UI on localhost: ?slow=2500 (ms) or ?slow=1 (2.5s default). Ignored elsewhere. */
function devArtificialDelayMs() {
  if (!isLocalhostHost()) {
    return 0;
  }
  const raw = new URLSearchParams(window.location.search).get("slow");
  if (raw == null || raw === "") {
    return 0;
  }
  if (raw === "1" || raw === "true") {
    return 2500;
  }
  const ms = Number(raw);
  return Number.isFinite(ms) && ms > 0 ? ms : 0;
}

function devArtificialDelay() {
  const ms = devArtificialDelayMs();
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const searchMemo = new Map();
const discoverMemo = new Map();
const discoverInflight = new Map();

let cachePromise;
let posterCachePromise;
/** Session map from remote poster URL to blob: object URL. */
const posterBlobUrls = new Map();
const posterUrlInflight = new Map();
const posterLoadQueue = [];
let posterLoadsInFlight = 0;
let posterObserver;
/** Poster filenames from data/posters.json, keyed by TMDB id. */
const localPosterById = new Map();
let localPosterSizes = [];
let localPosterGeneratedAt = null;

function hasTmdbAccess() {
  return accountSyncEnabled();
}

function tmdbUrlToProxyRequest(url) {
  const parsed = new URL(String(url));
  const match = /^\/3(\/.+)$/.exec(parsed.pathname);
  const path = match ? match[1] : parsed.pathname;
  const allowed = new Set([
    "query",
    "language",
    "page",
    "include_adult",
    "append_to_response",
    "region",
    "sort_by",
    "include_video",
    "primary_release_date.gte",
    "primary_release_date.lte",
    "release_date.gte",
    "release_date.lte",
    "with_release_type",
    "with_original_language",
    "vote_count.gte",
  ]);
  const searchParams = {};
  for (const [key, value] of parsed.searchParams.entries()) {
    if (allowed.has(key) && value !== "") {
      searchParams[key] = value;
    }
  }
  return { path, searchParams };
}

function buildProxyUrl(path, searchParams) {
  const base = appAccountSync.resolveTmdbApiBase(window.location.hostname);
  const url = base.startsWith("http")
    ? new URL(base)
    : new URL(base, window.location.origin);
  url.searchParams.set("path", path);
  for (const [key, value] of Object.entries(searchParams || {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/* --- Committed poster files --- */

/**
 * Read once at startup. A repo with no manifest yet 404s here, which is not an
 * error condition: posters simply fall back to TMDB's CDN.
 */
async function loadLocalPosterData() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(appLocalData.LOCAL_POSTERS_URL, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return false;
    }
    const data = appLocalData.normalizePostersManifest(await response.json());
    localPosterById.clear();
    for (const [id, poster] of Object.entries(data.posters)) {
      localPosterById.set(Number(id), poster);
    }
    localPosterSizes = data.posterSizes.length
      ? data.posterSizes
      : appLocalData.LOCAL_POSTER_SIZES;
    localPosterGeneratedAt = data.generatedAt;
    return localPosterById.size > 0;
  } catch (_) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function hasLocalPosterData() {
  return localPosterById.size > 0;
}

function localPosterCount() {
  return localPosterById.size;
}

/** Legacy hook; metadata no longer lives in data/. */
function localMovieRecord(_movieId) {
  return null;
}

function localPosterStamp() {
  return localPosterGeneratedAt;
}

/** Metadata requires an account session; local posters only speed up images. */
function hasMovieData() {
  return hasTmdbAccess();
}

/** Null whenever the manifest cannot serve this poster, so callers fall back. */
function localPosterUrlFor(record, size) {
  if (!record) {
    return null;
  }
  const posterFile = localPosterById.get(record.id);
  if (!posterFile) {
    return null;
  }
  const fromPath = appLocalData.posterFileFromPath(record.posterPath);
  if (fromPath && fromPath !== posterFile) {
    return null;
  }
  return appLocalData.localPosterUrl(posterFile, size, localPosterSizes);
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
  discoverMemo.clear();
  discoverInflight.clear();
  posterUrlInflight.clear();
  posterLoadQueue.length = 0;
  posterLoadsInFlight = 0;
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
        appTmdbMovieCache.buildCachedBlobResponse(blob, blob.type || "image/jpeg"),
      );
    }
  } catch (_) {
    /* Cached poster stays on screen. */
  }
}

async function resolvePosterObjectUrl(url) {
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
      if (appTmdbMovieCache.shouldRevalidateCache(cached)) {
        revalidatePoster(url, cache);
      }
      return objectUrl;
    }
  }

  const response = await fetchPoster(url);
  const blob = await response.blob();
  if (cache) {
    await cache.put(
      url,
      appTmdbMovieCache.buildCachedBlobResponse(blob, blob.type || "image/jpeg"),
    );
  }
  const objectUrl = URL.createObjectURL(blob);
  posterBlobUrls.set(url, objectUrl);
  return objectUrl;
}

async function getPosterObjectUrl(url) {
  if (!appPosterCache.isPosterUrl(url)) {
    return url;
  }
  const cachedObjectUrl = posterBlobUrls.get(url);
  if (cachedObjectUrl) {
    return cachedObjectUrl;
  }
  if (posterUrlInflight.has(url)) {
    return posterUrlInflight.get(url);
  }
  const promise = resolvePosterObjectUrl(url);
  posterUrlInflight.set(url, promise);
  try {
    return await promise;
  } finally {
    posterUrlInflight.delete(url);
  }
}

async function attachPosterImage(img) {
  const url = img.getAttribute("data-poster-src");
  if (!url || img.getAttribute("src")) {
    return;
  }
  img.dataset.posterLoading = "true";
  await devArtificialDelay();
  const frame = img.closest(".movie-detail-poster-frame");
  const gridWrap = img.closest(".poster-wrap");
  const markGridPosterReady = () => {
    img.classList.add("is-poster-ready");
  };
  if (frame) {
    img.addEventListener("load", () => frame.classList.add("is-loaded"), { once: true });
    img.addEventListener("error", () => frame.classList.add("is-loaded"), { once: true });
  } else if (gridWrap) {
    img.addEventListener("load", markGridPosterReady, { once: true });
    img.addEventListener("error", markGridPosterReady, { once: true });
  }
  try {
    const displayUrl = await getPosterObjectUrl(url);
    if (img.isConnected && img.getAttribute("data-poster-src") === url) {
      img.src = displayUrl;
      if (img.complete) {
        if (frame) {
          frame.classList.add("is-loaded");
        } else if (gridWrap) {
          markGridPosterReady();
        }
      }
    }
  } catch (_) {
    if (img.isConnected && img.getAttribute("data-poster-src") === url) {
      img.src = url;
      if (img.complete) {
        if (frame) {
          frame.classList.add("is-loaded");
        } else if (gridWrap) {
          markGridPosterReady();
        }
      }
    }
  } finally {
    delete img.dataset.posterLoading;
  }
}

function shouldEagerLoadPoster(img) {
  return Boolean(
    img.closest(
      ".movie-detail-poster-frame, .add-movie-detail-scroll, .add-movie-picked, .search-suggest, .custom-list-card-covers",
    ),
  );
}

function ensurePosterObserver() {
  if (posterObserver || typeof IntersectionObserver === "undefined") {
    return posterObserver;
  }
  posterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        const img = entry.target;
        posterObserver.unobserve(img);
        img.removeAttribute("data-poster-lazy");
        enqueuePosterLoad(img);
      }
    },
    { root: null, rootMargin: POSTER_LAZY_ROOT_MARGIN, threshold: 0.01 },
  );
  return posterObserver;
}

function enqueuePosterLoad(img) {
  if (!(img instanceof HTMLImageElement)) {
    return;
  }
  if (img.getAttribute("src") || img.dataset.posterLoading === "true") {
    return;
  }
  posterLoadQueue.push(img);
  drainPosterLoadQueue();
}

function drainPosterLoadQueue() {
  while (posterLoadsInFlight < POSTER_LOAD_CONCURRENCY && posterLoadQueue.length) {
    const img = posterLoadQueue.shift();
    if (!(img instanceof HTMLImageElement) || !img.isConnected || img.getAttribute("src")) {
      continue;
    }
    posterLoadsInFlight += 1;
    attachPosterImage(img).finally(() => {
      posterLoadsInFlight -= 1;
      drainPosterLoadQueue();
    });
  }
}

function bindPosterImages(root) {
  if (!root) {
    return;
  }
  const observer = ensurePosterObserver();
  for (const img of root.querySelectorAll("img[data-poster-src]:not([src])")) {
    if (shouldEagerLoadPoster(img) || !observer) {
      enqueuePosterLoad(img);
      continue;
    }
    img.setAttribute("data-poster-lazy", "true");
    observer.observe(img);
  }
}

/* --- Requests --- */

async function fetchTmdb(url, options = {}) {
  if (!hasTmdbAccess()) {
    throw new Error("Sign in to search TMDB");
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
    const { path, searchParams } = tmdbUrlToProxyRequest(url);
    const requestUrl = buildProxyUrl(path, searchParams);
    const response = await fetch(requestUrl, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accountConfig?.token || ""}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        saveAccountConfig(null);
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
 * Background refresh when a cache entry is older than the revalidation interval.
 * Failures are intentionally silent: the caller already has a usable record.
 */
async function revalidateMovie(movieId, cacheKey, cache, cachedText, onUpdate) {
  try {
    const response = await fetchTmdb(appTmdb.buildMovieUrl(movieId));
    const text = await response.text();
    if (text === cachedText) {
      if (cache) {
        await cache.put(cacheKey, appTmdbMovieCache.buildCachedMovieResponse(text));
      }
      return;
    }
    const record = parseMovieText(text);
    if (!record) {
      return;
    }
    if (cache) {
      await cache.put(cacheKey, appTmdbMovieCache.buildCachedMovieResponse(text));
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
    await cache.put(cacheKey, appTmdbMovieCache.buildCachedMovieResponse(text));
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
        if (appTmdbMovieCache.shouldRevalidateMovieCache(cached)) {
          revalidateMovie(id, cacheKey, cache, cachedText, options.onUpdate);
        }
        return record;
      }
    }
  }

  return fetchAndCacheMovie(id, cacheKey, cache);
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

async function fetchDiscoverMovies(tab, options = {}) {
  const normalizedTab = appDiscover.normalizeDiscoverTab(tab);
  const page = appDiscover.normalizeDiscoverPage(options.page);
  const memoKey = `${normalizedTab}:p${page}:v${appDiscover.DISCOVER_LIST_CACHE_VERSION}`;
  if (discoverMemo.has(memoKey)) {
    return discoverMemo.get(memoKey);
  }
  if (discoverInflight.has(memoKey)) {
    return discoverInflight.get(memoKey);
  }

  const promise = (async () => {
    const signal = options.signal;
    const buildUrl =
      normalizedTab === "now-playing" ? appTmdb.buildNowPlayingUrl : appTmdb.buildUpcomingUrl;
    const payload = await fetchTmdb(
      buildUrl({ page }),
      { signal },
    ).then((response) => response.json());
    const meta = appDiscover.normalizeDiscoverListMeta(payload);
    const todayIso = appDiscover.todayIsoDate();
    const entries = appDiscover.filterDiscoverPageEntries(
      appTmdb.normalizeSearchResults(payload),
      {
        filterUpcoming: normalizedTab === "upcoming",
        filterNowPlaying: normalizedTab === "now-playing",
        filterNewPremiere: true,
        todayIso,
        nowPlayingWindowDays: appTmdb.DEFAULT_NOW_PLAYING_WINDOW_DAYS,
        maxPremiereLagDays: appDiscover.DISCOVER_MAX_PREMIERE_LAG_DAYS,
        isLastPage: meta.page >= meta.totalPages,
      },
    );
    return { ...meta, entries };
  })();

  discoverInflight.set(memoKey, promise);
  try {
    const entries = await promise;
    discoverMemo.set(memoKey, entries);
    return entries;
  } finally {
    discoverInflight.delete(memoKey);
  }
}

/**
 * Resolve many movies: committed snapshot, then one D1 batch request per chunk,
 * then per-id TMDB fallback for anything still missing.
 */
async function fetchMoviesBatch(ids) {
  const chunks = appMovieCache.chunkIds(ids);
  const merged = {};
  for (const chunk of chunks) {
    if (!chunk.length) {
      continue;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BATCH_REQUEST_TIMEOUT_MS);
    try {
      const base = appAccountSync.resolveAccountApiBase(window.location.hostname);
      const response = await fetch(`${base}${appAccountSync.MOVIES_BATCH_PATH}`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${accountConfig?.token || ""}`,
        },
        body: JSON.stringify({ ids: chunk }),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401) {
          saveAccountConfig(null);
        }
        throw new Error(payload?.error || `Movie batch failed (${response.status})`);
      }
      const parsed = appMovieCache.parseBatchResponse(payload);
      Object.assign(merged, parsed.movies);
    } finally {
      clearTimeout(timer);
    }
  }
  return merged;
}

async function hydrateMovies(ids, handlers = {}) {
  const pending = ids.filter((id) => !appTmdb.isDetailedMovieRecord(movieById.get(id)));
  if (!pending.length) {
    return { hydratedFromNetwork: false };
  }

  if (!hasTmdbAccess()) {
    return { hydratedFromNetwork: false };
  }

  let hydratedFromNetwork = false;
  let stillPending = pending;

  try {
    await devArtificialDelay();
    const batchMovies = await fetchMoviesBatch(stillPending);
    for (const id of Object.keys(batchMovies)) {
      const record = batchMovies[id];
      const movieId = Number(id);
      movieById.set(movieId, record);
      movieErrors.delete(movieId);
      handlers.onRecord?.(movieId, record);
      hydratedFromNetwork = true;
    }
    stillPending = stillPending.filter(
      (id) => !appTmdb.isDetailedMovieRecord(movieById.get(id)),
    );
  } catch (_) {
    /* Fall through to per-id TMDB for remaining ids. */
  }

  if (!stillPending.length) {
    return { hydratedFromNetwork };
  }

  async function worker() {
    while (stillPending.length) {
      const id = stillPending.shift();
      try {
        await devArtificialDelay();
        const record = await getMovie(id, { onUpdate: handlers.onUpdate });
        movieById.set(id, record);
        movieErrors.delete(id);
        handlers.onRecord?.(id, record);
        hydratedFromNetwork = true;
      } catch (_) {
        movieErrors.add(id);
        handlers.onRecord?.(id, null);
      }
    }
  }

  const workerCount = Math.min(HYDRATE_CONCURRENCY, stillPending.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return { hydratedFromNetwork };
}

/* ===== Search box, TMDB autocomplete, and add-to-list ===== */

/**
 * TMDB search and add flow. The floating + button opens a sheet: search first,
 * then pick Watched or Watchlist.
 */

const SEARCH_DEBOUNCE_MS = 300;

let suggestResults = [];
let suggestIndex = -1;
let pendingAddResult = null;
let selectedAddListId = null;
let addMovieWatchDateActive = false;
let addMoviePickTab = "add";
let searchDirectorMode = false;

const ADD_MOVIE_TMDB_URL = "https://www.themoviedb.org/movie/";

const addMovieSearchPicker = appMovieSearchPicker.createMovieSearchPicker({
  search: searchMovies,
  debounceMs: SEARCH_DEBOUNCE_MS,
  onBusy: setSearchBusy,
  onResults(results, query, options) {
    suggestResults = results;
    suggestIndex = -1;
    if (!results.length) {
      const emptyMessage = options.mode === "director"
        ? `No directed movies found for "${query}".`
        : `No movies found for "${query}".`;
      showSuggestMessage(emptyMessage);
      return;
    }
    renderSuggest();
  },
  onError(error) {
    showSuggestMessage(`Search failed. ${error.message}`);
  },
  onClear: hideSuggest,
  onSelect(result) {
    hideSuggest();
    showAddPickStep(result);
  },
});

const addMovieRatingController = appRatingFieldUi.createRatingFieldController(
  {
    field: addMovieRatingField,
    slider: addMovieRatingSlider,
    select: addMovieRatingSelect,
    clear: addMovieRatingClear,
    value: addMovieRatingValue,
  },
  appRatings,
);
addMovieRatingController.initSelect();

function resetAddMovieRatingControls() {
  addMovieRatingController.reset();
}

function resetAddMovieWatchDate() {
  addMovieWatchDateActive = false;
  if (addMovieWatchDate) {
    addMovieWatchDate.value = appViewingHistory.today();
    addMovieWatchDate.max = appViewingHistory.today();
  }
  syncAddMovieWatchDateUi();
}

function showAddMovieRatingAndWatchDate() {
  return selectedAddListId === appLists.WATCHED_ID;
}

function syncAddMovieWatchDateUi() {
  const showWrap = showAddMovieRatingAndWatchDate();
  if (addMovieWatchDateWrap) {
    addMovieWatchDateWrap.hidden = !showWrap;
  }
  if (!showWrap) {
    addMovieWatchDateActive = false;
  }
  if (addMovieWatchDateToggle) {
    addMovieWatchDateToggle.hidden = !showWrap || addMovieWatchDateActive;
  }
  if (addMovieWatchDateField) {
    addMovieWatchDateField.hidden = !showWrap || !addMovieWatchDateActive;
  }
}

function onAddMovieWatchDateToggleClick() {
  addMovieWatchDateActive = true;
  syncAddMovieWatchDateUi();
  addMovieWatchDate?.focus({ preventScroll: true });
}

function clearAddMovieWatchDate() {
  resetAddMovieWatchDate();
}

function syncAddMovieRatingDisplay() {
  addMovieRatingController.syncDisplay();
}

function onAddMovieRatingSliderInput() {
  addMovieRatingController.onSliderInput();
}

function onAddMovieRatingSelectChange() {
  addMovieRatingController.onSelectChange();
}

function clearAddMovieRating() {
  addMovieRatingController.clear();
}

function syncAddMoviePickStep() {
  const showExtras = showAddMovieRatingAndWatchDate();

  addMovieDialog?.classList.toggle("is-watched-selected", showExtras);
  if (addMovieRatingField) {
    addMovieRatingField.hidden = !showExtras;
  }
  if (!showExtras) {
    resetAddMovieRatingControls();
    resetAddMovieWatchDate();
    return;
  }
  syncAddMovieWatchDateUi();
}

function hasAddMovieDestinations() {
  return appAddMovie.hasAddMovieDestinations(
    selectedAddListId,
    [...selectedAddCustomListIds],
  );
}

function syncAddMovieDialogChrome() {
  const customDetail = isCustomListDetailActive();
  const listName = customDetail ? getActiveDisplayContext().listName : "";

  if (addMovieTitle) {
    addMovieTitle.textContent = customDetail ? `Add a movie to ${listName}` : "Add a movie";
  }
  if (addMoviePresetSection) {
    addMoviePresetSection.hidden = customDetail;
  }
  if (addMovieAlsoAddSection) {
    addMovieAlsoAddSection.hidden = !customDetail;
  }
  if (addMoviePresetLabel) {
    addMoviePresetLabel.textContent = "Add to";
  }
  if (addMovieCustomListsLabel) {
    addMovieCustomListsLabel.textContent = customDetail ? "Lists" : "Also add to";
  }
  renderAddMovieCustomListPicker();
  if (addMoviePickTabs && pendingAddResult) {
    addMoviePickTabs.hidden = false;
  }
  addMovieDialog?.classList.toggle("is-custom-list-add", customDetail);
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

function renderSuggest() {
  if (!suggestResults.length) {
    hideSuggest();
    return;
  }

  searchSuggest.innerHTML = appMovieSearchPicker.movieSearchResultsHtml(
    suggestResults,
    {
      activeIndex: suggestIndex,
      escapeHtml: appCardHtml.escapeHtml,
      posterUrl: (result) => appTmdb.buildImageUrl(
        result.posterPath,
        appTmdb.POSTER_SIZES.suggest,
      ),
      meta(result) {
      const year = appCardHtml.formatYear(result.releaseDate);
        const metaParts = [];
        if (year) metaParts.push(year);
        else if (!result.directorHint) metaParts.push("Year unknown");
        if (result.directorHint) metaParts.push(result.directorHint);
        return metaParts.join(" · ");
      },
      badge(result) {
      const statusId = appLists.primaryListIdForMovie(userState.lists, result.id);
      const status = statusId
        ? appLists.findList(userState.lists, statusId)
        : null;
        return status
        ? `<span class="search-suggest-added">In ${appCardHtml.escapeHtml(status.name)}</span>`
        : "";
      },
    },
  );
  searchSuggest.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
  bindPosterImages(searchSuggest);
}

async function runSearch(query) {
  return addMovieSearchPicker.run(query, {
    mode: searchDirectorMode ? "director" : "movie",
  });
}

function onSearchInput() {
  updateSearchClearVisibility();
  const query = searchInput.value.trim();

  if (!query) {
    addMovieSearchPicker.clear();
    return;
  }

  if (!hasTmdbAccess()) {
    showSuggestMessage(ACCOUNT_LOGIN_HINT);
    return;
  }

  addMovieSearchPicker.schedule(query, {
    mode: searchDirectorMode ? "director" : "movie",
  });
}

function clearSearch() {
  searchInput.value = "";
  updateSearchClearVisibility();
  addMovieSearchPicker.clear();
}

function updateAddMovieHint() {
  if (!addMovieHint) {
    return;
  }
  if (!hasTmdbAccess()) {
    addMovieHint.textContent = ACCOUNT_LOGIN_HINT;
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
  resetAddMovieWatchDate();
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
  const selectors = [addMovieListPicker, addMoviePresetChips];
  for (const root of selectors) {
    if (!root) {
      continue;
    }
    root.querySelectorAll("[data-list-id]").forEach((button) => {
      const selected = listId != null && button.dataset.listId === listId;
      button.setAttribute("aria-pressed", String(selected));
    });
  }
  syncAddMoviePickStep();
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
    addMoviePickTabs.hidden = false;
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

  const movieId = pendingAddResult.id;
  const includeExtras = showAddMovieRatingAndWatchDate();
  const { state: next, cappedCustomLists } = appAddMovie.applyAddMovie(userState, {
    movieId,
    presetListId: selectedAddListId,
    customListIds: [...selectedAddCustomListIds],
    rating: includeExtras ? addMovieRatingController.getValue() : null,
    watchedOn:
      includeExtras && addMovieWatchDateActive ? addMovieWatchDate?.value : null,
  });
  if (next === userState) {
    notifyCustomListMovieCaps(cappedCustomLists);
    return;
  }
  notifyCustomListMovieCaps(cappedCustomLists);
  userState = next;
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
  if (!accountSyncEnabled()) {
    openSettings();
    return;
  }
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
  addMovieSearchPicker.select(index);
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
  selectedAddListId = selectedAddListId === listId ? null : listId;
  updateAddListPickerSelection(selectedAddListId);
  syncAddMovieSubmitState();
}

/* ===== Cards, skeletons, and the main grid render ===== */

/**
 * Grid rendering. `render()` writes the whole grid from the active list's ids,
 * emitting skeleton cards for anything not hydrated yet; hydration then
 * patches single rows through applyHydratedRecord() rather than re-rendering.
 */

(function mountWatchConfirmRatingField() {
  const root = document.getElementById("watch-confirm-rating-mount");
  if (root) {
    root.innerHTML = appRatingFieldUi.userRatingFieldHtml({ idPrefix: "watch-confirm-rating" });
  }
})();

const watchConfirmRatingField = document.getElementById("watch-confirm-rating-field");
const watchConfirmRatingSlider = document.getElementById("watch-confirm-rating-slider");
const watchConfirmRatingSelect = document.getElementById("watch-confirm-rating-select");
const watchConfirmRatingClear = document.getElementById("watch-confirm-rating-clear");
const watchConfirmRatingValue = document.getElementById("watch-confirm-rating-value");
const watchConfirmRatingController = appRatingFieldUi.createRatingFieldController(
  {
    field: watchConfirmRatingField,
    slider: watchConfirmRatingSlider,
    select: watchConfirmRatingSelect,
    clear: watchConfirmRatingClear,
    value: watchConfirmRatingValue,
  },
  appRatings,
);
watchConfirmRatingController.initSelect();

function posterWrapOpen(movieId) {
  return `<div class="poster-wrap" style="--poster-bg: ${appPosterGrey.posterGreyForId(movieId)}">`;
}

function discoverPosterPlaceholderHtml(titleText, options = {}) {
  const label = options.error ? "Could not load" : titleText;
  const title = label ? appCardHtml.escapeHtml(label) : "";
  const showTitleOnPoster = gridViewMode !== "detail";
  const titleHtml =
    showTitleOnPoster && title ? `<span class="discover-poster-title">${title}</span>` : "";
  return `<div class="placeholder discover-poster-placeholder">${titleHtml}</div>`;
}

function posterPlaceholderHtml(record, options = {}) {
  if (isDiscoverActive()) {
    return discoverPosterPlaceholderHtml(record?.title || "", options);
  }
  const label = options.error
    ? "Could not load"
    : record
      ? appCardHtml.escapeHtml(record.title)
      : "";
  return `<div class="placeholder">${label}</div>`;
}

function posterHtml(record, size) {
  const remote = record ? appTmdb.buildImageUrl(record.posterPath, size) : null;
  const local = record ? localPosterUrlFor(record, size) : null;
  const url = local || remote;
  if (!url) {
    return posterPlaceholderHtml(record);
  }
  // A snapshot entry whose file has gone missing retries TMDB rather than
  // leaving a hole where the poster was.
  const fallback =
    local && remote ? ` data-poster-fallback="${appCardHtml.escapeHtml(remote)}"` : "";
  return `<img data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy" decoding="async"${fallback}>`;
}

function detailPosterSkeletonHtml() {
  return `<div class="movie-detail-poster-frame"><div class="movie-detail-poster-skeleton" aria-hidden="true"></div></div>`;
}

function discoverDetailPosterEmptyHtml() {
  return `<div class="movie-detail-poster-frame is-loaded discover-detail-poster-empty">
  <div class="discover-detail-poster-mark" aria-hidden="true"></div>
</div>`;
}

function detailPosterFrameHtml(record, size) {
  const remote = record ? appTmdb.buildImageUrl(record.posterPath, size) : null;
  const local = record ? localPosterUrlFor(record, size) : null;
  const url = local || remote;
  const skeleton = `<div class="movie-detail-poster-skeleton" aria-hidden="true"></div>`;
  if (!url) {
    if (isDiscoverActive()) {
      return discoverDetailPosterEmptyHtml();
    }
    return `<div class="movie-detail-poster-frame is-loaded is-empty">${skeleton}</div>`;
  }
  const fallback =
    local && remote ? ` data-poster-fallback="${appCardHtml.escapeHtml(remote)}"` : "";
  const img = `<img data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" decoding="async"${fallback}>`;
  return `<div class="movie-detail-poster-frame">${skeleton}${img}</div>`;
}

function cardMetaHtml(record) {
  if (isDiscoverActive()) {
    const releaseDate = appCardHtml.formatReleaseDate(record.releaseDate);
    return releaseDate
      ? `<span class="card-meta-release-date">${appCardHtml.escapeHtml(releaseDate)}</span>`
      : "";
  }
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

function ratingSegmentHtml(kind, text, empty = false) {
  const labels = {
    fan: "Fan rating",
    mine: "Your rating",
    them: "Friend rating",
  };
  const safe = appCardHtml.escapeHtml(text);
  const emptyClass = empty ? " is-empty" : "";
  const label = labels[kind] || "Rating";
  return `<span class="rating-segment rating-segment--${kind}${emptyClass}" aria-label="${label} ${safe}" title="${label}">${safe}</span>`;
}

function ratingChitHtml(inner, ariaLabel) {
  const content = typeof inner === "string" ? inner.trim() : "";
  if (!content) {
    return "";
  }
  const aria = ariaLabel
    ? ` aria-label="${appCardHtml.escapeHtml(ariaLabel)}"`
    : "";
  return `<div class="rating-chit card-body-ratings"${aria}>${content}</div>`;
}

function cardUserRatingHtml(movieId) {
  return cardUserRatingChipHtml(movieId);
}

function cardFanRatingSegmentHtml(movieId) {
  if (!usesWatchedStyleDisplay() && !isDiscoverActive()) {
    return "";
  }
  const record = movieById.get(movieId);
  if (!record) {
    return "";
  }
  const label = appCardHtml.formatRating(record.voteAverage);
  const text = label || "—";
  return ratingSegmentHtml("fan", text, !label);
}

function cardFanRatingHtml(movieId) {
  const segment = cardFanRatingSegmentHtml(movieId);
  return segment ? ratingChitHtml(segment) : "";
}

function discoverCardPresetButtonHtml(listId, movieId) {
  const isWatchlist = listId === appLists.WATCHLIST_ID;
  const isMember = isWatchlist
    ? appLists.isOnWatchlist(userState.lists, movieId)
    : appLists.isWatched(userState.lists, movieId);
  const label = isWatchlist ? "Watchlist" : "Watched";
  const iconPreset = isWatchlist ? "watchlist" : "watched";
  return `<button type="button" class="discover-card-watchlist-btn discover-card-watchlist-btn--icon-only${isMember ? " is-active" : ""}" data-discover-preset-id="${appCardHtml.escapeHtml(listId)}" aria-label="${label}" title="${label}" aria-pressed="${isMember ? "true" : "false"}">${appCardHtml.addListPresetIconHtml(iconPreset)}</button>`;
}

function discoverCardActionsHtml(movieId) {
  const buttons =
    discoverTab === "now-playing"
      ? `${discoverCardPresetButtonHtml(appLists.WATCHLIST_ID, movieId)}${discoverCardPresetButtonHtml(appLists.WATCHED_ID, movieId)}`
      : discoverCardPresetButtonHtml(appLists.WATCHLIST_ID, movieId);
  return `<div class="card-body-ratings card-body-ratings--interactive discover-card-actions">${buttons}</div>`;
}

function discoverCardTextHtml(movieId, record) {
  const titleRating =
    discoverTab === "now-playing" ? cardFanRatingHtml(movieId) : "";
  return `<div class="card-text discover-card-text">
  <div class="discover-card-title-row">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    ${titleRating}
  </div>
  <div class="card-meta-row">
    <div class="card-meta">${cardMetaHtml(record)}</div>
    ${discoverCardActionsHtml(movieId)}
  </div>
</div>`;
}

function cardDetailRatingsHtml(movieId) {
  if (gridViewMode !== "detail") {
    return "";
  }
  if (isDiscoverActive()) {
    return "";
  }
  if (!usesWatchedStyleDisplay()) {
    return "";
  }
  const fan = cardFanRatingSegmentHtml(movieId);
  const user = cardUserRatingSegmentHtml(movieId);
  const inner = `${fan}${user}`;
  return inner ? ratingChitHtml(inner) : "";
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

function isWatchedSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "watched-asc" || sortMode === "watched-desc";
}

function cardUserRatingSegmentHtml(movieId, { showEmpty = false } = {}) {
  if (isDiscoverActive()) {
    return "";
  }
  const allowed = appRatings.isRatingAllowed(
    userState.lists,
    movieId,
    userState.customLists,
  );
  if (!allowed) {
    if (!showEmpty) {
      return "";
    }
    return ratingSegmentHtml("mine", "—", true);
  }
  const label = appRatings.formatUserRating(
    appRatings.getRating(userState.ratings, movieId),
  );
  if (!label && !showEmpty) {
    return "";
  }
  const text = label || "—";
  return ratingSegmentHtml("mine", text, !label);
}

function cardUserRatingChipHtml(movieId, options) {
  const segment = cardUserRatingSegmentHtml(movieId, options);
  return segment ? ratingChitHtml(segment) : "";
}

function cardReleaseYearFooterHtml(movieId) {
  const record = movieById.get(movieId);
  const year = record ? appCardHtml.formatYear(record.releaseDate) : "";
  const text = year || "—";
  const emptyClass = year ? "" : " is-empty";
  return `<span class="card-footer-main${emptyClass}" aria-label="Release year ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function cardWatchDateFooterHtml(movieId) {
  if (!appLists.isWatched(userState.lists, movieId)) {
    return `<span class="card-footer-main is-empty" aria-label="Date watched —">—</span>`;
  }
  const watchedOn = appViewingHistory.latestViewingDate(userState.viewingHistory, movieId);
  const text = watchedOn || "—";
  const emptyClass = watchedOn ? "" : " is-empty";
  return `<span class="card-footer-main${emptyClass}" aria-label="Date watched ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
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
  if (isWatchedSortMode()) {
    return cardWatchDateFooterHtml(movieId);
  }
  return "";
}

function cardSmallFooterHtml(movieId) {
  if (isDiscoverActive() || gridViewMode !== "cards") {
    return "";
  }

  if (isWatchlistActive()) {
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

function cardSortDimClass(movieId) {
  if (isDiscoverActive() || !usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return "";
  }
  if (isUserRatingSortMode()) {
    if (appRatings.getRating(userState.ratings, movieId) != null) {
      return "";
    }
    return " is-unrated";
  }
  if (isWatchedSortMode()) {
    if (appViewingHistory.latestViewingDate(userState.viewingHistory, movieId)) {
      return "";
    }
    return " is-no-watch-date";
  }
  return "";
}

function cardRemoveIconHtml() {
  return `<svg class="card-remove-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none">
  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
</svg>`;
}

/**
 * Watchlist cards use a dedicated bottom panel: split remove / watched actions.
 */
function watchlistCardPanelHtml(movieId) {
  if (!isWatchlistActive()) {
    return "";
  }
  const record = movieById.get(movieId);
  const titleLabel = record ? appCardHtml.escapeHtml(record.title) : "movie";
  return `<div class="watchlist-card-panel">
  <div class="watchlist-card-actions">
    <button type="button" class="watchlist-action-btn watchlist-action-btn--remove card-remove-btn" aria-label="Remove ${titleLabel}" title="Remove movie">${cardRemoveIconHtml()}</button>
    <button type="button" class="watchlist-action-btn watchlist-action-btn--watch card-watch-btn discover-preset-btn-with-icon" aria-label="Mark as watched" title="Mark as watched">${appCardHtml.discoverPresetButtonInnerHtml("watched", "Watched")}</button>
  </div>
</div>`;
}

function cardPosterOnlyHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = posterPlaceholderHtml(null, { error: failed });
    return `${posterWrapOpen(movieId)}${body}</div>${cardSmallFooterHtml(movieId)}`;
  }
  const grip = listShowsReorderGrip()
    ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  return `${posterWrapOpen(movieId)}${posterHtml(record, appTmdb.POSTER_SIZES.card)}${grip}</div>${cardSmallFooterHtml(movieId)}`;
}

function listShowsReorderGrip() {
  return (
    !isDiscoverActive() &&
    appLists.isListReorderable(userState.activeListId) &&
    reorderModeActive &&
    usesCustomDisplayOrder()
  );
}

const FRIEND_SORT_OPTION_VALUE = "friend-rating";

function syncFriendSortSelectOption() {
  if (!listSortSelect) {
    return;
  }
  let option = listSortSelect.querySelector(`option[value="${FRIEND_SORT_OPTION_VALUE}"]`);
  const showFriendOption =
    isFriendViewActive() &&
    !friendViewLoading &&
    !friendViewError &&
    friendViewSections.some((section) => section.movieIds.length > 0);
  if (showFriendOption) {
    if (!option) {
      option = document.createElement("option");
      option.value = FRIEND_SORT_OPTION_VALUE;
      const userRatingOption = listSortSelect.querySelector('option[value="user-rating"]');
      if (userRatingOption?.nextSibling) {
        listSortSelect.insertBefore(option, userRatingOption.nextSibling);
      } else {
        listSortSelect.appendChild(option);
      }
    }
    return;
  }
  option?.remove();
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
  const showOnMain =
    !isDiscoverActive() &&
    !isFriendViewActive() &&
    usesWatchedStyleDisplay() &&
    activeMovieIds().length > 0 &&
    hasMovieData();
  const showOnFriend =
    isFriendViewActive() &&
    !friendViewLoading &&
    !friendViewError &&
    friendViewSections.some((section) => section.movieIds.length > 0);
  const show = showOnMain || showOnFriend;
  syncFriendSortSelectOption();
  const sort = userState.preferences.sort;
  const sortField = appSort.getSortField(
    isFriendViewActive() ? sort : appSort.resolveSortMode(sort),
  );
  if (sortControl) {
    sortControl.hidden = !show;
  }
  if (listSortSelect) {
    if (show) {
      listSortSelect.value = sortField;
    }
  }
  if (sortReverseBtn) {
    sortReverseBtn.hidden = !show;
    const descending = appSort.isSortDescending(sort);
    sortReverseBtn.classList.toggle("is-descending", descending);
    sortReverseBtn.classList.toggle("is-ascending", !descending);
    const directionLabel = appSort.sortDirectionLabel(sortField, descending);
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
    !isDiscoverActive() &&
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
    const body = posterPlaceholderHtml(null, { error: failed });
    return `${posterWrapOpen(movieId)}${body}</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${failed ? `TMDB #${movieId}` : ""}</div>
    <div class="card-meta">${failed ? "Tap to retry" : ""}</div>
  </div>
</div>`;
  }

  if (!isDiscoverActive() && isWatchlistActive()) {
    return `${posterWrapOpen(movieId)}
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
</div>
<div class="card-body card-body--watchlist">
  ${watchlistCardPanelHtml(movieId)}
</div>`;
  }

  if (isDiscoverActive()) {
    return `${posterWrapOpen(movieId)}
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
</div>
<div class="card-body">
  ${discoverCardTextHtml(movieId, record)}
</div>`;
  }

  return `${posterWrapOpen(movieId)}
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
    !isDiscoverActive() && isWatchlistActive()
      ? " card--watchlist"
      : "";

  return `<article class="card${stateClass}${cardSortDimClass(movieId)}${watchlistCard}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${cardInnerHtml(movieId)}
</article>`;
}

function rowHtml(movieId) {
  return `<div class="movie-row movie-row--card" data-movie-id="${movieId}">${rowInnerHtml(movieId)}</div>`;
}

/** Tabs are the only list switcher, and carry each list's count. */
function renderListTabs() {
  if (!listTabs || isCustomListView() || isDiscoverActive()) {
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
  if (isFriendViewActive()) {
    customListViewTitleEl.textContent = "Friends";
    customListViewTitleEl.hidden = false;
    headerTitleEl.hidden = true;
    return;
  }
  if (isFriendsIndexActive()) {
    customListViewTitleEl.textContent = "Friends";
    customListViewTitleEl.hidden = false;
    headerTitleEl.hidden = true;
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
  if (isDiscoverActive()) {
    headerTitleEl.textContent = "Discover";
    return;
  }
  headerTitleEl.textContent = isCustomListIndexActive() ? "Lists" : SITE_BRAND_NAME;
}

function syncAccountLoginGate() {
  const loggedIn = accountSyncEnabled();
  document.body.classList.toggle("account-login-required", !loggedIn);
  if (searchInput) {
    searchInput.disabled = !loggedIn;
  }
  if (addMovieFab) {
    addMovieFab.disabled = !loggedIn;
  }
  updateAddMovieHint();
}

function updateListHeader() {
  syncHeaderViewTitle();
  const count = isDiscoverActive() ? discoverDisplayIds().length : activeMovieIds().length;
  if (isCustomListIndexActive()) {
    listSubtitleEl.textContent = "Create and manage custom lists";
    return;
  }
  if (isFriendsIndexActive()) {
    listSubtitleEl.textContent = accountSyncEnabled()
      ? "Add friends by email, then open their shared lists"
      : "Sign in to connect with friends";
    return;
  }
  if (isFriendViewActive()) {
    if (friendViewLoading) {
      listSubtitleEl.textContent = "Loading their lists…";
      return;
    }
    if (friendViewError) {
      listSubtitleEl.textContent = "Could not load their lists";
      return;
    }
    if (friendViewSections.length) {
      const sortField = appSort.getSortField(userState.preferences.sort);
      listSubtitleEl.textContent =
        sortField === "custom"
          ? "Tap a movie to open details and add to your lists"
          : "Tap a movie to open details and add to your lists · sorted view";
      return;
    }
    listSubtitleEl.textContent = "No shared lists yet";
    return;
  }
  if (isDiscoverActive()) {
    const tabLabel = discoverTab === "now-playing" ? "Now playing" : "Upcoming";
    if (discoverTotalPages > 1) {
      listSubtitleEl.textContent = `${tabLabel} · Page ${discoverPage} of ${discoverTotalPages}`;
    } else {
      listSubtitleEl.textContent = tabLabel;
    }
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
    listSubtitleEl.textContent = "Sign in to load movie details from TMDB";
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
      : "Sign in via Settings → Account to get started";
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
      isCustomListIndexActive() ||
      isDiscoverActive() ||
      isFriendViewActive() ||
      (count === 0 && !isCustomListDetailActive());
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
      emptyState.innerHTML = `<strong>Sign in to use ${SITE_BRAND_NAME}</strong><p class="empty-state-hint">Open Settings → Account to log in or create an account.</p>`;
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
<p class="empty-state-hint">Try a different title, or director:, genre:, actor:, or year.</p>`;
    return;
  }
  if (!hasTmdbAccess()) {
    emptyState.innerHTML = `<strong>Sign in to use ${SITE_BRAND_NAME}</strong><p class="empty-state-hint">Open Settings → Account to log in or create an account.</p>`;
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
  syncAccountLoginGate();
  if (isFriendViewActive()) {
    syncAppViewChrome();
    renderFriendView();
    return;
  }
  if (isFriendsIndexActive()) {
    renderFriendsIndex();
    return;
  }
  if (isCustomListIndexActive()) {
    syncAppViewChrome();
    renderCustomListsIndex();
    return;
  }
  if (isDiscoverActive()) {
    renderDiscover();
    return;
  }
  const ids = displayMovieIds();
  renderedMovieIds = [...ids];
  disconnectRowHydrateObserver();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  renderListTabs();
  syncReorderModeUi();
  syncListSearchVisibility();
  syncAppViewChrome();
  renderEmptyState(ids.length);
  syncAddMovieFabVisibility(ids.length);
  hydrateActiveList();
}

/** Patches one row after hydration so the rest of the grid stays untouched. */
function applyHydratedRecord(movieId, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  if (isFriendViewActive()) {
    applyFriendHydratedRecord(movieId);
    return;
  }
  const row = grid.querySelector(`.movie-row[data-movie-id="${movieId}"]`);
  if (row) {
    row.innerHTML = rowInnerHtml(movieId);
    bindPosterImages(row);
  }
  if (!opts.skipDetail && detailMovieId === movieId) {
    renderDetail();
  }
}

function needsResortAfterHydration() {
  const field = appSort.getSortField(userState.preferences.sort);
  if (isFriendViewActive()) {
    return field === "title" || field === "year" || field === "rating";
  }
  if (!getActiveDisplayContext().sortable) {
    return false;
  }
  return field === "title" || field === "year" || field === "rating";
}

/** Re-sort visible rows after hydration without rebuilding the grid HTML. */
function reorderGridRows() {
  if (!grid || isCustomListIndexActive() || isDiscoverActive()) {
    return false;
  }
  const ids = displayMovieIds();
  renderedMovieIds = [...ids];
  return appGridReorder.reorderElementsById(
    grid,
    ids,
    appViewportHydration.movieIdFromRowElement,
  );
}

let rowHydrateObserver;
const rowHydrateInflight = new Set();
const rowHydratePendingIds = new Set();
const rowHydratePendingRows = new Map();
let rowHydrateBatchTimer = 0;
let rowHydrateResortTimer;

function flushRowHydrateBatch() {
  rowHydrateBatchTimer = 0;
  if (!rowHydratePendingIds.size) {
    return;
  }
  const ids = [...rowHydratePendingIds];
  const rowsById = new Map(rowHydratePendingRows);
  rowHydratePendingIds.clear();
  rowHydratePendingRows.clear();
  for (const id of ids) {
    rowHydrateInflight.add(id);
  }
  hydrateMovies(ids, {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  })
    .then((result) => {
      if (result?.hydratedFromNetwork) {
        scheduleResortAfterHydration();
      }
    })
    .finally(() => {
      for (const id of ids) {
        rowHydrateInflight.delete(id);
        const row = rowsById.get(id);
        const hydrated = appTmdb.isDetailedMovieRecord(movieById.get(id)) || movieErrors.has(id);
        if (rowHydrateObserver && row?.isConnected && hydrated) {
          rowHydrateObserver.unobserve(row);
        }
      }
    });
}

function scheduleRowHydrateBatch(movieId, row) {
  rowHydratePendingIds.add(movieId);
  rowHydratePendingRows.set(movieId, row);
  if (rowHydrateBatchTimer) {
    return;
  }
  rowHydrateBatchTimer = setTimeout(flushRowHydrateBatch, 50);
}

function disconnectRowHydrateObserver() {
  if (rowHydrateObserver) {
    rowHydrateObserver.disconnect();
    rowHydrateObserver = null;
  }
  rowHydrateInflight.clear();
  rowHydratePendingIds.clear();
  rowHydratePendingRows.clear();
  if (rowHydrateBatchTimer) {
    clearTimeout(rowHydrateBatchTimer);
    rowHydrateBatchTimer = 0;
  }
  if (rowHydrateResortTimer) {
    clearTimeout(rowHydrateResortTimer);
    rowHydrateResortTimer = 0;
  }
}

function scheduleResortAfterHydration() {
  if (!needsResortAfterHydration()) {
    return;
  }
  if (rowHydrateResortTimer) {
    clearTimeout(rowHydrateResortTimer);
  }
  rowHydrateResortTimer = setTimeout(() => {
    rowHydrateResortTimer = 0;
    if (isFriendViewActive()) {
      renderFriendView();
      return;
    }
    reorderGridRows();
  }, 300);
}

function ensureRowHydrateObserver() {
  if (rowHydrateObserver || typeof IntersectionObserver === "undefined") {
    return rowHydrateObserver;
  }
  rowHydrateObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        const row = entry.target;
        const movieId = appViewportHydration.movieIdFromRowElement(row);
        if (!movieId || appTmdb.isDetailedMovieRecord(movieById.get(movieId))) {
          rowHydrateObserver.unobserve(row);
          continue;
        }
        if (rowHydrateInflight.has(movieId) || rowHydratePendingIds.has(movieId)) {
          continue;
        }
        scheduleRowHydrateBatch(movieId, row);
      }
    },
    {
      root: null,
      rootMargin: appViewportHydration.ROW_HYDRATE_ROOT_MARGIN,
      threshold: 0.01,
    },
  );
  return rowHydrateObserver;
}

function bindRowHydrateObserver() {
  if (isCustomListIndexActive() || isDiscoverActive() || !grid) {
    return;
  }
  const observer = ensureRowHydrateObserver();
  if (!observer) {
    return;
  }
  for (const row of grid.querySelectorAll(".movie-row[data-movie-id]")) {
    const movieId = appViewportHydration.movieIdFromRowElement(row);
    if (!movieId || appTmdb.isDetailedMovieRecord(movieById.get(movieId))) {
      continue;
    }
    observer.observe(row);
  }
}

function hydrateActiveList() {
  if (isCustomListIndexActive() || isDiscoverActive()) {
    return Promise.resolve();
  }
  if (needsResortAfterHydration()) {
    reorderGridRows();
  }
  if (typeof IntersectionObserver === "undefined") {
    const ids = renderedMovieIds.length ? renderedMovieIds : displayMovieIds();
    return hydrateMovies(ids, {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    }).then((result) => {
      if (result?.hydratedFromNetwork && needsResortAfterHydration()) {
        reorderGridRows();
      }
    });
  }
  // Visible rows (+ rootMargin prefetch) debounce into one POST /api/movies/batch.
  bindRowHydrateObserver();
  return Promise.resolve();
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
  const placeholder = document.createElement("template");
  placeholder.innerHTML = isDiscoverActive()
    ? discoverPosterPlaceholderHtml(record ? record.title : "")
    : `<div class="placeholder">${record ? appCardHtml.escapeHtml(record.title) : ""}</div>`;
  img.replaceWith(placeholder.content.firstChild);
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

function watchMovie(movieId, watchedOn, rating) {
  const nextLists = appLists.assignMovieToList(
    userState.lists,
    appLists.WATCHED_ID,
    movieId,
  );
  if (!commitListChange(nextLists, { movieId, status: appLists.WATCHED_ID })) {
    return;
  }
  recordAddedAt(movieId);
  if (watchedOn) {
    addMovieViewing(movieId, watchedOn);
  }
  if (rating != null) {
    updateRatings(appRatings.setRating(userState.ratings, movieId, rating));
  }
  if (detailMovieId === movieId && !activeMovieIds().includes(movieId)) {
    dismissDetailOverlay();
  }
  render();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function resetWatchConfirmWatchDate() {
  watchConfirmWatchDateActive = false;
  if (watchConfirmDate) {
    watchConfirmDate.value = appViewingHistory.today();
    watchConfirmDate.max = appViewingHistory.today();
  }
  syncWatchConfirmWatchDateUi();
}

function resetWatchConfirmRatingControls() {
  watchConfirmRatingController.reset();
}

function onWatchConfirmRatingSliderInput() {
  watchConfirmRatingController.onSliderInput();
}

function onWatchConfirmRatingSelectChange() {
  watchConfirmRatingController.onSelectChange();
}

function clearWatchConfirmRating() {
  watchConfirmRatingController.clear();
}

function syncWatchConfirmWatchDateUi() {
  if (watchConfirmDateToggle) {
    watchConfirmDateToggle.hidden = watchConfirmWatchDateActive;
  }
  if (watchConfirmDateField) {
    watchConfirmDateField.hidden = !watchConfirmWatchDateActive;
  }
}

function onWatchConfirmDateToggleClick() {
  watchConfirmWatchDateActive = true;
  syncWatchConfirmWatchDateUi();
  watchConfirmDate?.focus({ preventScroll: true });
}

function clearWatchConfirmWatchDate() {
  resetWatchConfirmWatchDate();
}

function requestWatchMovie(movieId, options = {}) {
  pendingWatchMovieId = Number(movieId);
  const record = movieById.get(pendingWatchMovieId);
  const title = record?.title || `Movie ${pendingWatchMovieId}`;
  watchConfirmMessage.textContent = options.fromDiscover || !appLists.isOnWatchlist(userState.lists, pendingWatchMovieId)
    ? `Mark “${title}” as watched? It will be added to your Watched list.`
    : `Mark “${title}” as watched? It will move to your Watched list.`;
  resetWatchConfirmWatchDate();
  resetWatchConfirmRatingControls();
  watchConfirmDialog.hidden = false;
  watchConfirmCancel.focus({ preventScroll: true });
}

function closeWatchConfirm() {
  pendingWatchMovieId = null;
  watchConfirmWatchDateActive = false;
  resetWatchConfirmRatingControls();
  watchConfirmDialog.hidden = true;
}

function confirmWatchMovie() {
  const movieId = pendingWatchMovieId;
  const watchedOn =
    watchConfirmWatchDateActive && watchConfirmDate?.value ? watchConfirmDate.value : null;
  const rating = watchConfirmRatingController.getValue();
  closeWatchConfirm();
  if (movieId == null) {
    return;
  }
  watchMovie(movieId, watchedOn, rating);
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
    dismissDetailOverlay();
  }
  render();
}

function refreshMovieRating(movieId) {
  applyHydratedRecord(movieId, { skipDetail: true });
  if (isUserRatingSortMode()) {
    reorderGridRows();
  }
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
 * Next/previous movie pushes a history entry; back returns to the previous
 * movie, then to the list underneath.
 */

const TMDB_MOVIE_URL = "https://www.themoviedb.org/movie/";

function detailShareButtonHtml() {
  return `<button type="button" id="movie-detail-share" class="icon-btn movie-detail-share-btn" aria-label="Share movie" title="Share">
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none">
    <circle cx="14.5" cy="4.5" r="2.25" stroke="currentColor" stroke-width="1.75" />
    <circle cx="14.5" cy="15.5" r="2.25" stroke="currentColor" stroke-width="1.75" />
    <circle cx="5.5" cy="10" r="2.25" stroke="currentColor" stroke-width="1.75" />
    <path d="M7.4 9.1 12.6 5.9M7.4 10.9 12.6 14.1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
  </svg>
</button>`;
}

function detailTitleRowHtml(titleText) {
  return `<div class="movie-detail-title-row">
  <h2 class="movie-detail-title" id="movie-detail-title">${titleText}</h2>
  ${detailShareButtonHtml()}
</div>`;
}

/* --- Detail overlay --- */

function detailMetaChips(record) {
  const chips = [];
  if (isDiscoverActive()) {
    const releaseDate = appCardHtml.formatReleaseDate(record.releaseDate);
    if (releaseDate) {
      chips.push(`<span class="meta-chip">${appCardHtml.escapeHtml(releaseDate)}</span>`);
    }
  } else {
    const year = appCardHtml.formatYear(record.releaseDate);
    const runtime = appCardHtml.formatRuntime(record.runtime);

    if (year) {
      chips.push(`<span class="meta-chip">${year}</span>`);
    }
    if (runtime) {
      chips.push(`<span class="meta-chip">${runtime}</span>`);
    }
  }
  const rating = appCardHtml.formatRating(record.voteAverage);

  if (rating) {
    chips.push(`<span class="meta-chip">★ ${rating}</span>`);
  }
  for (const genre of Array.isArray(record.genres) ? record.genres : []) {
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
  if (isDiscoverActive()) {
    return false;
  }
  return (
    detailMovieId != null &&
    appRatings.isRatingAllowed(
      userState.lists,
      detailMovieId,
      userState.customLists,
    )
  );
}

function detailPresetListAllowed(listId) {
  if (!appLists.isListId(listId)) {
    return false;
  }
  if (listId === appLists.WATCHED_ID && isDiscoverActive() && discoverTab !== "now-playing") {
    return false;
  }
  return true;
}

function detailDiscoverPresetBtnHtml(listId, movieId) {
  const preset = appLists.PRESET_LISTS.find((entry) => entry.id === listId);
  if (!preset) {
    return "";
  }
  const isMember =
    listId === appLists.WATCHED_ID
      ? appLists.isWatched(userState.lists, movieId)
      : appLists.isOnWatchlist(userState.lists, movieId);
  const label = preset.name;
  const iconPreset = listId === appLists.WATCHLIST_ID ? "watchlist" : "watched";
  return `<button type="button" class="action-btn detail-discover-preset-btn discover-preset-btn-with-icon${isMember ? " is-active" : ""}" data-discover-preset-id="${appCardHtml.escapeHtml(listId)}" aria-pressed="${isMember ? "true" : "false"}">${appCardHtml.discoverPresetButtonInnerHtml(iconPreset, label)}</button>`;
}

function discoverDetailPresetActionsHtml(movieId) {
  const buttons = [];
  if (discoverTab === "now-playing") {
    buttons.push(detailDiscoverPresetBtnHtml(appLists.WATCHED_ID, movieId));
  }
  buttons.push(detailDiscoverPresetBtnHtml(appLists.WATCHLIST_ID, movieId));
  return buttons.filter(Boolean).join("");
}

function detailWatchBtnHtml() {
  return `<button type="button" class="action-btn detail-watch-btn" id="detail-watch" aria-label="Mark as watched" title="Mark as watched"><span class="detail-action-icon" aria-hidden="true">✓</span><span class="detail-action-label">Watched</span></button>`;
}

function detailShouldShowWatchButton(movieId) {
  if (isDiscoverActive() || appLists.isWatched(userState.lists, movieId)) {
    return false;
  }
  if (isCustomListDetailActive()) {
    return activeMovieIds().includes(movieId);
  }
  return appLists.findListIdsForMovie(userState.lists, movieId).length > 0;
}

function discoverPresetMembership(listId, movieId) {
  return listId === appLists.WATCHED_ID
    ? appLists.isWatched(userState.lists, movieId)
    : appLists.isOnWatchlist(userState.lists, movieId);
}

function discoverAddConfirmCopy(listId, title) {
  const quotedTitle = `“${title}”`;
  if (listId === appLists.WATCHED_ID) {
    return {
      title: "Mark as watched",
      message: `Mark ${quotedTitle} as watched? It will be added to your Watched list.`,
      okLabel: "Mark watched",
    };
  }
  return {
    title: "Add to watchlist",
    message: `Add ${quotedTitle} to your watchlist?`,
    okLabel: "Add to watchlist",
  };
}

function addDiscoverPresetMembership(listId, movieId) {
  const nextLists = appLists.assignMovieToList(userState.lists, listId, movieId);
  if (!commitListChange(nextLists, { movieId, status: listId })) {
    return;
  }
  recordAddedAt(movieId);
  renderDiscover();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function removeDiscoverPresetMembership(listId, movieId) {
  const nextLists = appLists.removeMovie(userState.lists, movieId);
  if (!commitListChange(nextLists, { movieId, status: appSyncMerge.REMOVED_STATUS })) {
    return;
  }
  renderDiscover();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function toggleDiscoverPresetMembership(listId, movieId) {
  if (!isDiscoverActive() || !detailPresetListAllowed(listId)) {
    return;
  }
  if (discoverPresetMembership(listId, movieId)) {
    removeDiscoverPresetMembership(listId, movieId);
  } else {
    addDiscoverPresetMembership(listId, movieId);
  }
}

function requestDiscoverPresetMembership(listId, movieId) {
  if (!isDiscoverActive() || !detailPresetListAllowed(listId)) {
    return;
  }
  if (discoverPresetMembership(listId, movieId)) {
    removeDiscoverPresetMembership(listId, movieId);
    return;
  }
  if (listId === appLists.WATCHED_ID) {
    requestWatchMovie(Number(movieId), { fromDiscover: true });
    return;
  }
  pendingDiscoverAddMovieId = Number(movieId);
  pendingDiscoverAddListId = listId;
  const record = movieById.get(pendingDiscoverAddMovieId);
  const title = record?.title || `Movie ${pendingDiscoverAddMovieId}`;
  const copy = discoverAddConfirmCopy(listId, title);
  discoverAddConfirmTitle.textContent = copy.title;
  discoverAddConfirmMessage.textContent = copy.message;
  discoverAddConfirmOk.textContent = copy.okLabel;
  discoverAddConfirmDialog.hidden = false;
  discoverAddConfirmCancel.focus({ preventScroll: true });
}

function closeDiscoverAddConfirm() {
  pendingDiscoverAddMovieId = null;
  pendingDiscoverAddListId = null;
  discoverAddConfirmDialog.hidden = true;
}

function confirmDiscoverPresetAdd() {
  const movieId = pendingDiscoverAddMovieId;
  const listId = pendingDiscoverAddListId;
  closeDiscoverAddConfirm();
  if (movieId == null || listId == null) {
    return;
  }
  addDiscoverPresetMembership(listId, movieId);
}

function requestDiscoverDetailPreset(listId) {
  if (detailMovieId == null) {
    return;
  }
  requestDiscoverPresetMembership(listId, detailMovieId);
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

function detailListsEditorBodyHtml(movieId) {
  return detailAddToListPickerHtml(movieId);
}

function detailListsEditorUsesOverlay() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function renderDetailListsOverlay() {
  if (!detailListsDialogBody || detailMovieId == null) {
    return;
  }
  detailListsDialogBody.innerHTML = detailListsEditorBodyHtml(detailMovieId);
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
      ${detailListsEditorBodyHtml(movieId)}
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
  let customChanged = false;
  const cappedListNames = [];

  for (const list of userState.customLists || []) {
    const isMember = list.movieIds.includes(movieId);
    const shouldBeMember = detailListPickerSelectedIds.has(list.id);
    if (shouldBeMember && !isMember) {
      if (appCustomLists.isCustomListAtMovieCap(nextLists, list.id)) {
        cappedListNames.push(list.name);
        continue;
      }
      const updated = appCustomLists.addMovieToCustomList(nextLists, list.id, movieId);
      if (updated !== nextLists) {
        nextLists = updated;
        customChanged = true;
      }
    } else if (!shouldBeMember && isMember) {
      const updated = appCustomLists.removeMovieFromCustomList(nextLists, list.id, movieId);
      if (updated !== nextLists) {
        nextLists = updated;
        customChanged = true;
      }
    }
  }

  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();

  if (customChanged) {
    persistCustomLists(nextLists);
  }
  notifyCustomListMovieCaps(cappedListNames);

  if (customChanged) {
    if (isCustomListDetailActive() && !activeMovieIds().includes(movieId)) {
      dismissDetailOverlay();
      if (isDiscoverActive()) {
        renderDiscover();
      } else {
        render();
      }
      return;
    }
    if (isDiscoverActive()) {
      renderDiscover();
    } else {
      render();
    }
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
    const list = appCustomLists.findCustomList(userState.customLists, listId);
    if (
      detailMovieId != null &&
      list &&
      !list.movieIds.includes(detailMovieId) &&
      appCustomLists.isCustomListAtMovieCap(userState.customLists, listId)
    ) {
      notifyCustomListMovieCapReached(list.name);
      return;
    }
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
  if (isDiscoverActive()) {
    return "";
  }
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
      <span class="detail-rating-scale" aria-hidden="true">1.0</span>
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

function formatViewingDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })
    : value;
}

function detailViewingSummaryText(count) {
  if (count === 0) {
    return "No viewings recorded";
  }
  if (count === 1) {
    return "Viewed once";
  }
  return `Viewed ${count} times`;
}

function detailViewingHistoryHtml(movieId) {
  if (!appLists.isWatched(userState.lists, movieId)) {
    return `<p class="detail-viewing-empty">Viewing history is available for movies in your Watched list.</p>`;
  }
  const entries = appViewingHistory.viewingEntries(userState.viewingHistory, movieId);
  const rows = entries.map((entry) => `<li class="detail-viewing-row">
    <span class="detail-viewing-date">${appCardHtml.viewingDateIconHtml()}${appCardHtml.escapeHtml(formatViewingDate(entry.watchedOn))}</span>
    <button type="button" data-viewing-remove-id="${appCardHtml.escapeHtml(entry.id)}" aria-label="Remove viewing on ${appCardHtml.escapeHtml(formatViewingDate(entry.watchedOn))}">Remove</button>
  </li>`).join("");
  const listHtml = rows ? `<ul>${rows}</ul>` : "";
  const summary = appCardHtml.escapeHtml(detailViewingSummaryText(entries.length));
  return `<section class="detail-viewing-history">
    <div class="detail-viewing-head">
      <p class="detail-viewing-summary">${summary}</p>
    </div>
    ${listHtml}
    <div class="detail-viewing-add">
      <input type="date" id="detail-viewing-new-date" value="${appViewingHistory.today()}" max="${appViewingHistory.today()}" aria-label="New viewing date">
      <button type="button" id="detail-viewing-add">Add viewing</button>
    </div>
  </section>`;
}

function detailOverviewPanelHtml(movieId, record) {
  const tagline = record.tagline
    ? `<p class="movie-detail-tagline">${appCardHtml.escapeHtml(record.tagline)}</p>`
    : "";
  const overview = `<p class="movie-detail-overview">${appCardHtml.escapeHtml(record.overview || "No overview available.")}</p>
<div class="movie-detail-credits">${detailCreditsHtml(record)}</div>`;
  if (shouldShowDetailAddForm(movieId)) {
    return `${tagline}<div class="movie-detail-meta">${detailMetaChips(record)}</div>
${overview}
${detailAddBlockHtml(movieId)}`;
  }
  return `${tagline}<div class="movie-detail-meta">${detailMetaChips(record)}</div>
${detailUserRatingBlockHtml(movieId)}
${overview}
${detailListsBlockHtml(movieId)}`;
}

function detailConfigSearchUsesOverlay() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function isDetailConfigSearchOpen() {
  return Boolean(detailConfigSearchDialog && !detailConfigSearchDialog.hidden);
}

function detailConfigPanelHtml(movieId) {
  const candidate = detailRemapCandidateId == null
    ? null
    : movieById.get(detailRemapCandidateId);
  const candidateHtml = candidate
    ? `<div class="detail-config-candidate">
        <div><strong>${appCardHtml.escapeHtml(candidate.title)}</strong><span>${appCardHtml.escapeHtml(appCardHtml.formatYear(candidate.releaseDate) || "Year unknown")}</span></div>
        <button type="button" id="detail-remap-confirm">Use this movie</button>
      </div>`
    : "";
  const findHtml = detailConfigSearchUsesOverlay()
    ? `<button type="button" class="detail-config-search-open" id="detail-remap-open-search">${candidate ? "Search again" : "Search"}</button>`
    : `<div class="detail-config-find">
      <input id="detail-remap-query" type="search" value="${appCardHtml.escapeHtml(detailRemapQuery)}" placeholder="Search by movie title." aria-label="Search by movie title." autocomplete="off" aria-controls="detail-config-results" aria-expanded="false">
      <span class="search-spinner" id="detail-remap-spinner" hidden aria-hidden="true"></span>
    </div>`;
  return `<section class="detail-config">
    <h3>Linked movie</h3>
    <p>Replace TMDB movie <strong>#${movieId}</strong> while keeping its lists, rating, and viewing history.</p>
    ${findHtml}
    <p class="detail-config-status" id="detail-remap-status" aria-live="polite"></p>
    ${candidateHtml}
  </section>`;
}

function detailConfigResultsHtml() {
  return appMovieSearchPicker.movieSearchResultsHtml(detailRemapResults, {
    escapeHtml: appCardHtml.escapeHtml,
    dataName: "detail-remap-result-id",
    dataValue: (result) => result.id,
    posterUrl: (result) => appTmdb.buildImageUrl(result.posterPath, appTmdb.POSTER_SIZES.suggest),
    meta: (result) => appCardHtml.formatYear(result.releaseDate) || "Year unknown",
    badge(result) {
      const statusId = appLists.primaryListIdForMovie(userState.lists, result.id);
      const status = statusId ? appLists.findList(userState.lists, statusId) : null;
      return status
        ? `<span class="search-suggest-added">In ${appCardHtml.escapeHtml(status.name)}</span>`
        : "";
    },
  });
}

function hideDetailConfigResults() {
  if (detailConfigResultsEl) {
    detailConfigResultsEl.hidden = true;
    detailConfigResultsEl.innerHTML = "";
  }
  document.getElementById("detail-remap-query")?.setAttribute("aria-expanded", "false");
}

function hideDetailConfigSearchResults() {
  if (!detailConfigSearchResults) return;
  detailConfigSearchResults.hidden = true;
  detailConfigSearchResults.innerHTML = "";
  detailConfigSearchQuery?.setAttribute("aria-expanded", "false");
}

function positionDetailConfigResults() {
  if (detailConfigSearchUsesOverlay()) return;
  const list = detailConfigResultsEl;
  const anchor = document.querySelector(".detail-config-find");
  if (!list || list.hidden || !anchor) return;
  const rect = anchor.getBoundingClientRect();
  const gap = 6;
  const spaceBelow = window.innerHeight - rect.bottom - 12;
  const maxHeight = Math.min(360, Math.max(120, spaceBelow));
  list.style.top = `${Math.round(rect.bottom + gap)}px`;
  list.style.left = `${Math.round(rect.left)}px`;
  list.style.width = `${Math.round(rect.width)}px`;
  list.style.maxHeight = `${maxHeight}px`;
}

function fillDetailConfigResultList(list, input) {
  if (!list) return;
  const show =
    detailMovieId != null &&
    detailBodyTab === "config" &&
    detailRemapCandidateId == null &&
    detailRemapResults.length > 0 &&
    detailMovieAllowsConfig(detailMovieId);
  if (!show) {
    list.hidden = true;
    list.innerHTML = "";
    input?.setAttribute("aria-expanded", "false");
    return;
  }
  list.innerHTML = detailConfigResultsHtml();
  list.hidden = false;
  input?.setAttribute("aria-expanded", "true");
  bindPosterImages(list);
}

function syncDetailConfigSearchOverlayResults() {
  fillDetailConfigResultList(detailConfigSearchResults, detailConfigSearchQuery);
}

function syncDetailConfigResults() {
  if (detailConfigSearchUsesOverlay()) {
    hideDetailConfigResults();
    if (isDetailConfigSearchOpen()) {
      syncDetailConfigSearchOverlayResults();
    }
    return;
  }
  hideDetailConfigSearchResults();
  if (!detailConfigResultsEl) return;
  fillDetailConfigResultList(
    detailConfigResultsEl,
    document.getElementById("detail-remap-query"),
  );
  positionDetailConfigResults();
}

function setDetailConfigSearchStatus(message) {
  if (detailConfigSearchStatus) {
    detailConfigSearchStatus.textContent = message || "";
  }
  const inlineStatus = document.getElementById("detail-remap-status");
  if (inlineStatus && !isDetailConfigSearchOpen()) {
    inlineStatus.textContent = message || "";
  }
}

function openDetailConfigSearch() {
  if (
    !detailConfigSearchUsesOverlay() ||
    detailMovieId == null ||
    !detailMovieAllowsConfig(detailMovieId) ||
    !detailConfigSearchDialog
  ) {
    return;
  }
  if (detailConfigSearchQuery) {
    detailConfigSearchQuery.value = detailRemapQuery;
  }
  detailConfigSearchDialog.hidden = false;
  syncDetailConfigSearchOverlayResults();
  detailConfigSearchQuery?.focus({ preventScroll: true });
}

function closeDetailConfigSearch() {
  if (!detailConfigSearchDialog || detailConfigSearchDialog.hidden) {
    return;
  }
  detailConfigSearchDialog.hidden = true;
  hideDetailConfigSearchResults();
  setDetailConfigSearchStatus("");
}

function detailMovieAllowsConfig(movieId) {
  return appLists.isWatched(userState.lists, movieId);
}

function detailHistoryTabButtonHtml(selected, countBadge, entryCount) {
  const countLabel = entryCount > 0 ? `, ${entryCount} entries` : "";
  return `<button type="button" class="detail-body-tab" role="tab" id="detail-tab-viewing-history" data-detail-body-tab="viewing-history" aria-selected="${selected ? "true" : "false"}" tabindex="${selected ? "0" : "-1"}" aria-label="Viewing history${countLabel}">
    <span class="detail-body-tab-label detail-body-tab-label--long">Viewing history</span>
    <span class="detail-body-tab-label detail-body-tab-label--short">History</span>${countBadge}
  </button>`;
}

function detailBodyTabsHtml(movieId, record) {
  if (isDiscoverActive()) {
    return detailOverviewPanelHtml(movieId, record);
  }
  const showExtraTabs = detailMovieAllowsConfig(movieId);
  if (!showExtraTabs && (detailBodyTab === "viewing-history" || detailBodyTab === "config")) {
    detailBodyTab = "overview";
  }
  if (!showExtraTabs) {
    return detailOverviewPanelHtml(movieId, record);
  }
  const entries = appViewingHistory.viewingEntries(userState.viewingHistory, movieId);
  const countBadge =
    entries.length > 0
      ? `<span class="detail-body-tab-count">${entries.length}</span>`
      : "";
  const overviewSelected = detailBodyTab === "overview";
  const historySelected = detailBodyTab === "viewing-history";
  const configSelected = detailBodyTab === "config";
  return `<nav class="detail-body-tabs" role="tablist" aria-label="Movie detail sections">
  <button type="button" class="detail-body-tab" role="tab" id="detail-tab-overview" data-detail-body-tab="overview" aria-selected="${overviewSelected ? "true" : "false"}" tabindex="${overviewSelected ? "0" : "-1"}">Overview</button>
  ${detailHistoryTabButtonHtml(historySelected, countBadge, entries.length)}
  <button type="button" class="detail-body-tab" role="tab" id="detail-tab-config" data-detail-body-tab="config" aria-selected="${configSelected ? "true" : "false"}" tabindex="${configSelected ? "0" : "-1"}">Config</button>
</nav>
<div class="detail-body-tabpanel" role="tabpanel" id="detail-panel-overview" aria-labelledby="detail-tab-overview"${overviewSelected ? "" : " hidden"}>
${detailOverviewPanelHtml(movieId, record)}
</div>
<div class="detail-body-tabpanel" role="tabpanel" id="detail-panel-viewing-history" aria-labelledby="detail-tab-viewing-history"${historySelected ? "" : " hidden"}>
${detailViewingHistoryHtml(movieId)}
</div>
<div class="detail-body-tabpanel" role="tabpanel" id="detail-panel-config" aria-labelledby="detail-tab-config"${configSelected ? "" : " hidden"}>
${detailConfigPanelHtml(movieId)}
</div>`;
}

function setDetailBodyTab(tab) {
  if (isDiscoverActive()) {
    return;
  }
  const next = tab === "viewing-history" || tab === "config" ? tab : "overview";
  if (
    (next === "viewing-history" || next === "config") &&
    (detailMovieId == null || !detailMovieAllowsConfig(detailMovieId))
  ) {
    return;
  }
  if (detailBodyTab === next) {
    return;
  }
  if (next === "viewing-history" && detailRatingEditorOpen) {
    cancelDetailRatingEditor();
  }
  detailBodyTab = next;
  if (next !== "config") {
    detailRemapCandidateId = null;
    closeDetailConfigSearch();
  }
  renderDetail();
}

const detailRemapSearchPicker = appMovieSearchPicker.createMovieSearchPicker({
  search: searchMovies,
  debounceMs: SEARCH_DEBOUNCE_MS,
  onBusy(busy) {
    const inlineSpinner = document.getElementById("detail-remap-spinner");
    if (inlineSpinner) inlineSpinner.hidden = !busy;
    if (detailConfigSearchSpinner) detailConfigSearchSpinner.hidden = !busy;
    if (busy) setDetailConfigSearchStatus("Searching TMDB…");
  },
  onResults(results) {
    if (detailMovieId == null) return;
    detailRemapResults = results
      .filter((result) => result.id !== detailMovieId)
      .slice(0, 8);
    syncDetailConfigResults();
    setDetailConfigSearchStatus(
      detailRemapResults.length ? "" : "No TMDB movies matched that title.",
    );
  },
  onError() {
    setDetailConfigSearchStatus("TMDB search failed. Try again.");
  },
});

function onDetailRemapQueryInput(event) {
  if (event.target.id !== "detail-remap-query" && event.target.id !== "detail-config-search-query") {
    return;
  }
  if (detailMovieId == null || !detailMovieAllowsConfig(detailMovieId)) return;
  const query = event.target.value.trim();
  detailRemapQuery = event.target.value;
  if (!query) {
    detailRemapSearchPicker.clear();
    detailRemapResults = [];
    hideDetailConfigResults();
    hideDetailConfigSearchResults();
    setDetailConfigSearchStatus("");
    return;
  }
  if (!hasTmdbAccess()) {
    setDetailConfigSearchStatus("Add a TMDB credential in Settings to search.");
    return;
  }
  detailRemapSearchPicker.schedule(query);
}

function selectDetailRemapCandidate(movieId) {
  if (detailMovieId == null || !detailMovieAllowsConfig(detailMovieId)) return;
  const candidate = detailRemapResults.find((result) => result.id === Number(movieId));
  if (!candidate) return;
  detailRemapCandidateId = candidate.id;
  if (!movieById.has(candidate.id)) {
    movieById.set(candidate.id, candidate);
  }
  closeDetailConfigSearch();
  renderDetail();
}

function confirmDetailRemap() {
  if (detailMovieId == null || detailRemapCandidateId == null) return;
  if (!detailMovieAllowsConfig(detailMovieId)) return;
  const fromId = detailMovieId;
  const toId = detailRemapCandidateId;
  try {
    backupUserState(userState);
    userState = appMovieRemap.remapMovieState(userState, fromId, toId);
    persistUserState();
    detailMovieId = toId;
    detailRemapCandidateId = null;
    detailRemapQuery = "";
    detailRemapResults = [];
    detailRemapSearchPicker.clear();
    closeDetailConfigSearch();
    renderedMovieIds = renderedMovieIds.map((id) => id === fromId ? toId : id);
    history.replaceState(
      { ...history.state, detailMovieId: toId },
      "",
      `#movie/${toId}`,
    );
    render();
    renderDetail();
    hydrateMovies([toId], {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
  } catch (error) {
    const status = document.getElementById("detail-remap-status");
    if (status) status.textContent = error.message || "Could not replace the linked movie.";
  }
}

function addDetailViewing() {
  const input = document.getElementById("detail-viewing-new-date");
  if (detailMovieId == null || !input?.value) return;
  if (!appLists.isWatched(userState.lists, detailMovieId)) return;
  if (!addMovieViewing(detailMovieId, input.value)) return;
  detailBodyTab = "viewing-history";
  persistUserState();
  render();
  renderDetail();
}

function requestRemoveDetailViewing(entryId) {
  if (detailMovieId == null) return;
  const entries = appViewingHistory.viewingEntries(userState.viewingHistory, detailMovieId);
  const entry = entries.find((item) => item.id === entryId);
  if (!entry) return;
  pendingViewingRemoveEntryId = entryId;
  viewingRemoveConfirmMessage.textContent = `Remove viewing on ${formatViewingDate(entry.watchedOn)}?`;
  viewingRemoveConfirmDialog.hidden = false;
  viewingRemoveConfirmCancel.focus({ preventScroll: true });
}

function closeViewingRemoveConfirm() {
  pendingViewingRemoveEntryId = null;
  viewingRemoveConfirmDialog.hidden = true;
}

function confirmRemoveDetailViewing() {
  const entryId = pendingViewingRemoveEntryId;
  closeViewingRemoveConfirm();
  if (!entryId) return;
  removeDetailViewing(entryId);
}

function removeDetailViewing(entryId) {
  if (detailMovieId == null) return;
  const next = appViewingHistory.removeViewing(userState.viewingHistory, detailMovieId, entryId);
  if (!updateViewingHistory(next)) return;
  persistUserState();
  render();
  renderDetail();
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
  if (detailMovieId == null || !detailRatingEditorOpen) {
    return false;
  }
  const current = appRatings.getRating(userState.ratings, detailMovieId);
  if (current === detailRatingEditorSnapshot) {
    return false;
  }
  persistUserState();
  refreshMovieRating(detailMovieId);
  return true;
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

const detailAddRatingRefs = {
  field: null,
  slider: null,
  select: null,
  clear: null,
  value: null,
};
let detailAddRatingController = null;

function shouldShowDetailAddForm(movieId) {
  if (isDiscoverActive() || movieId == null || !userState) {
    return false;
  }
  return !appMovieShare.isMovieOwned(
    userState.lists,
    userState.customLists,
    movieId,
  );
}

function resetDetailAddFormState() {
  detailAddListId = null;
  detailAddCustomListIds = new Set();
  detailAddRating = null;
  detailAddWatchDateActive = false;
  detailAddWatchDate = "";
  detailAddRatingController?.reset();
}

function detailAddHasDestinations() {
  return appAddMovie.hasAddMovieDestinations(
    detailAddListId,
    [...detailAddCustomListIds],
  );
}

function detailAddPresetOptionHtml(listId, name, iconPreset) {
  const pressed = detailAddListId === listId;
  return `<button type="button" class="add-list-option" data-detail-add-list-id="${appCardHtml.escapeHtml(listId)}" aria-pressed="${pressed}">${appCardHtml.addListPresetIconHtml(iconPreset)}<span class="add-list-name">${appCardHtml.escapeHtml(name)}</span></button>`;
}

function detailAddCustomListsHtml() {
  const lists = userState.customLists || [];
  if (!lists.length) {
    return `<p class="detail-add-to-list-hint"><a href="#lists" class="detail-add-to-list-link">Create lists…</a></p>`;
  }
  return `<p class="add-movie-pick-label">Also add to</p>
<div class="add-custom-list-picker" id="detail-add-custom-list-picker">${lists
    .map((list) => {
      const selected = detailAddCustomListIds.has(list.id);
      return `<button type="button" class="add-custom-list-chip" data-detail-add-custom-list-id="${appCardHtml.escapeHtml(list.id)}" aria-pressed="${selected}">${appCardHtml.escapeHtml(list.name)}</button>`;
    })
    .join("")}</div>`;
}

function detailAddBlockHtml() {
  const watchedSelected = detailAddListId === appLists.WATCHED_ID;
  const extrasHidden = watchedSelected ? "" : " hidden";
  const submitDisabled = detailAddHasDestinations() ? "" : " disabled";
  return `<section class="detail-add-block" id="detail-add-block">
  <p class="add-movie-pick-label">Add to</p>
  <div class="add-list-picker" id="detail-add-list-picker" role="group" aria-label="Choose a list">
    ${detailAddPresetOptionHtml(appLists.WATCHED_ID, "Watched", "watched")}
    ${detailAddPresetOptionHtml(appLists.WATCHLIST_ID, "Watchlist", "watchlist")}
  </div>
  <div id="detail-add-watched-extras"${extrasHidden}>
    ${appRatingFieldUi.userRatingFieldHtml({ idPrefix: "detail-add-rating" })}
    <div class="add-movie-watch-date-wrap" id="detail-add-watch-date-wrap">
      ${appCardHtml.viewingDatePickerHtml({
        toggleId: "detail-add-watch-date-toggle",
        fieldId: "detail-add-watch-date-field",
        inputId: "detail-add-watch-date",
        clearId: "detail-add-watch-date-clear",
        toggleClass: "ghost-btn add-movie-watch-date-toggle",
        fieldClass: "add-movie-watch-date",
      })}
    </div>
  </div>
  <div class="add-movie-custom-lists" id="detail-add-custom-lists-section">
    ${detailAddCustomListsHtml()}
  </div>
  <div class="add-movie-pick-actions add-movie-pick-actions--end">
    <button type="button" class="primary-btn" id="detail-add-submit"${submitDisabled}>Add</button>
  </div>
</section>`;
}

function ensureDetailAddRatingController() {
  if (!detailAddRatingController) {
    detailAddRatingController = appRatingFieldUi.createRatingFieldController(
      detailAddRatingRefs,
      appRatings,
    );
  }
  return detailAddRatingController;
}

function syncDetailAddWatchDateUi() {
  const watchedSelected = detailAddListId === appLists.WATCHED_ID;
  const extras = document.getElementById("detail-add-watched-extras");
  if (extras) {
    extras.hidden = !watchedSelected;
  }
  if (!watchedSelected) {
    detailAddWatchDateActive = false;
  }
  const toggle = document.getElementById("detail-add-watch-date-toggle");
  const field = document.getElementById("detail-add-watch-date-field");
  if (toggle) {
    toggle.hidden = !watchedSelected || detailAddWatchDateActive;
  }
  if (field) {
    field.hidden = !watchedSelected || !detailAddWatchDateActive;
  }
}

function syncDetailAddFormUi() {
  const root = document.getElementById("detail-add-block");
  if (!root) {
    return;
  }
  const watchedSelected = detailAddListId === appLists.WATCHED_ID;
  root.querySelectorAll("[data-detail-add-list-id]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.detailAddListId === detailAddListId),
    );
  });
  root.querySelectorAll("[data-detail-add-custom-list-id]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(detailAddCustomListIds.has(button.dataset.detailAddCustomListId)),
    );
  });
  if (!watchedSelected) {
    detailAddRating = null;
    detailAddWatchDate = "";
    detailAddRatingController?.reset();
  }
  syncDetailAddWatchDateUi();
  const submit = document.getElementById("detail-add-submit");
  if (submit) {
    submit.disabled = !detailAddHasDestinations();
  }
}

function bindDetailAddForm() {
  if (!document.getElementById("detail-add-block")) {
    return;
  }
  detailAddRatingRefs.field = document.getElementById("detail-add-rating-field");
  detailAddRatingRefs.slider = document.getElementById("detail-add-rating-slider");
  detailAddRatingRefs.select = document.getElementById("detail-add-rating-select");
  detailAddRatingRefs.clear = document.getElementById("detail-add-rating-clear");
  detailAddRatingRefs.value = document.getElementById("detail-add-rating-value");
  const controller = ensureDetailAddRatingController();
  controller.initSelect();
  if (detailAddRating != null) {
    controller.setValue(detailAddRating);
  } else {
    controller.reset();
  }
  const dateInput = document.getElementById("detail-add-watch-date");
  if (dateInput) {
    dateInput.value = detailAddWatchDate || appViewingHistory.today();
    dateInput.max = appViewingHistory.today();
  }
  syncDetailAddFormUi();
}

function onDetailAddListOptionClick(listId) {
  if (listId !== appLists.WATCHED_ID && listId !== appLists.WATCHLIST_ID) {
    return;
  }
  detailAddListId = detailAddListId === listId ? null : listId;
  syncDetailAddFormUi();
}

function onDetailAddCustomListClick(listId) {
  if (!appCustomLists.isCustomListId(listId)) {
    return;
  }
  if (detailAddCustomListIds.has(listId)) {
    detailAddCustomListIds.delete(listId);
  } else {
    const list = appCustomLists.findCustomList(userState.customLists, listId);
    if (
      detailMovieId != null &&
      list &&
      !list.movieIds.includes(detailMovieId) &&
      appCustomLists.isCustomListAtMovieCap(userState.customLists, listId)
    ) {
      notifyCustomListMovieCapReached(list.name);
      return;
    }
    detailAddCustomListIds.add(listId);
  }
  syncDetailAddFormUi();
}

function onDetailAddWatchDateToggleClick() {
  if (detailAddListId !== appLists.WATCHED_ID) {
    return;
  }
  detailAddWatchDateActive = true;
  if (!detailAddWatchDate) {
    detailAddWatchDate = appViewingHistory.today();
  }
  syncDetailAddWatchDateUi();
  document.getElementById("detail-add-watch-date")?.focus({ preventScroll: true });
}

function clearDetailAddWatchDate() {
  detailAddWatchDateActive = false;
  detailAddWatchDate = "";
  const dateInput = document.getElementById("detail-add-watch-date");
  if (dateInput) {
    dateInput.value = appViewingHistory.today();
  }
  syncDetailAddWatchDateUi();
}

function onDetailAddRatingSliderInput() {
  ensureDetailAddRatingController().onSliderInput();
  detailAddRating = detailAddRatingController.getValue();
}

function onDetailAddRatingSelectChange() {
  ensureDetailAddRatingController().onSelectChange();
  detailAddRating = detailAddRatingController.getValue();
}

function clearDetailAddRating() {
  ensureDetailAddRatingController().clear();
  detailAddRating = null;
}

function confirmDetailAddMovie() {
  if (detailMovieId == null || !shouldShowDetailAddForm(detailMovieId)) {
    return;
  }
  const includeExtras = detailAddListId === appLists.WATCHED_ID;
  const dateInput = document.getElementById("detail-add-watch-date");
  const { state: next, cappedCustomLists } = appAddMovie.applyAddMovie(userState, {
    movieId: detailMovieId,
    presetListId: detailAddListId,
    customListIds: [...detailAddCustomListIds],
    rating: includeExtras
      ? (detailAddRatingController?.getValue() ?? detailAddRating)
      : null,
    watchedOn:
      includeExtras && detailAddWatchDateActive
        ? dateInput?.value || detailAddWatchDate
        : null,
  });
  if (next === userState) {
    notifyCustomListMovieCaps(cappedCustomLists);
    return;
  }
  notifyCustomListMovieCaps(cappedCustomLists);
  userState = next;
  persistUserState();
  resetDetailAddFormState();
  if (isCustomListIndexActive()) {
    renderCustomListsIndex();
  } else if (isDiscoverActive()) {
    renderDiscover();
  } else {
    render();
  }
  renderDetail();
  hydrateMovies([detailMovieId], {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
}

function setMovieShareStatus(message) {
  if (movieShareStatus) {
    movieShareStatus.textContent = message || "";
  }
}

function closeMovieShareDialog() {
  if (movieShareDialog) {
    movieShareDialog.hidden = true;
  }
  setMovieShareStatus("");
}

function openMovieShareDialog() {
  if (detailMovieId == null || !movieShareDialog || !movieShareUrlInput) {
    return;
  }
  movieShareUrlInput.value = appMovieShare.movieShareUrl(
    window.location.href,
    detailMovieId,
  );
  setMovieShareStatus("");
  movieShareDialog.hidden = false;
  movieShareUrlInput.focus({ preventScroll: true });
  movieShareUrlInput.select();
}

async function copyMovieShareUrl() {
  const url = movieShareUrlInput?.value || "";
  if (!url) {
    return;
  }
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("clipboard unavailable");
    }
    await navigator.clipboard.writeText(url);
    setMovieShareStatus("Copied.");
  } catch (_) {
    movieShareUrlInput?.select();
    setMovieShareStatus("Select the link and copy it.");
  }
}

function renderDetail() {
  if (detailMovieId == null) {
    return;
  }

  const ids = detailNavigationIds();
  const index = ids.indexOf(detailMovieId);
  const record = movieById.get(detailMovieId);

  detailEyebrow.textContent =
    index >= 0 ? `${index + 1} of ${ids.length}` : "Not in this list";
  const navigable = index >= 0;
  detailPrevBtn.hidden = !navigable;
  detailNextBtn.hidden = !navigable;
  if (navigable) {
    detailPrevBtn.disabled = index <= 0;
    detailNextBtn.disabled = index >= ids.length - 1;
  }

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
    detailPoster.innerHTML = detailPosterSkeletonHtml();
    const addForm = shouldShowDetailAddForm(detailMovieId)
      ? detailAddBlockHtml()
      : "";
    detailBody.innerHTML = `${detailTitleRowHtml(heading)}
<p class="movie-detail-overview">${note}</p>${friendDetailNoteHtml(detailMovieId)}${addForm}`;
  } else {
    detailPoster.innerHTML = detailPosterFrameHtml(record, appTmdb.POSTER_SIZES.detail);
    bindPosterImages(detailPoster);
    detailBody.innerHTML = `${detailTitleRowHtml(appCardHtml.escapeHtml(record.title))}
${friendDetailNoteHtml(detailMovieId)}
${detailBodyTabsHtml(detailMovieId, record)}`;
  }

  const leftActions = [];
  let removeBtn = "";

  if (isDiscoverActive()) {
    leftActions.push(discoverDetailPresetActionsHtml(detailMovieId));
  } else if (isCustomListDetailActive()) {
    if (detailShouldShowWatchButton(detailMovieId)) {
      leftActions.push(detailWatchBtnHtml());
    }
    if (activeMovieIds().includes(detailMovieId)) {
      removeBtn = `<button type="button" class="action-btn detail-remove-btn" id="detail-remove-from-list">Remove from list</button>`;
    }
  } else {
    const inCollection = appLists.findListIdsForMovie(userState.lists, detailMovieId).length > 0;

    if (detailShouldShowWatchButton(detailMovieId)) {
      leftActions.push(detailWatchBtnHtml());
    }

    if (inCollection) {
      removeBtn = `<button type="button" class="action-btn detail-remove-btn" id="detail-remove" aria-label="Remove movie"><span class="detail-remove-label-full">Remove movie</span><span class="detail-remove-label-short">Remove</span></button>`;
    }
  }

  if (removeBtn) {
    leftActions.push(removeBtn);
  }

  detailActions.innerHTML = `<div class="detail-actions-left">${leftActions.join("")}</div>
<div class="detail-actions-right">
<a class="detail-link" href="${TMDB_MOVIE_URL}${detailMovieId}" target="_blank" rel="noopener noreferrer">View on TMDB</a></div>`;
  if (record) {
    syncDetailRatingDisplay(appRatings.getRating(userState.ratings, detailMovieId));
    syncDetailRatingEditorVisibility();
  }
  bindDetailAddForm();
  syncDetailConfigResults();
}

function captureUnderlayScroll() {
  underlayScrollY = window.scrollY;
}

function restoreUnderlayScroll() {
  const y = underlayScrollY;
  window.scrollTo(0, y);
  requestAnimationFrame(() => window.scrollTo(0, y));
}

function detailHistoryState(movieId) {
  return {
    detailMovieId: movieId,
    appView,
    activeCustomListId,
    activeFriendId: isFriendViewActive() ? activeFriendId : null,
    friendViewName: isFriendViewActive() ? friendViewName : null,
    discoverTab: isDiscoverActive() ? discoverTab : null,
    discoverPage: isDiscoverActive() ? discoverPage : null,
  };
}

function movieHash(id) {
  return `#movie/${id}`;
}

const MAIN_HISTORY_PLACEHOLDER_HASH = "#_";

function pushMovieHistory(id) {
  const hash = movieHash(id);
  const state = detailHistoryState(id);
  const path = window.location.pathname + window.location.search;
  if (window.location.hash === hash) {
    history.replaceState(state, "", path + hash);
    markProgrammaticLocation();
    return;
  }
  // iOS Safari records two entries when pushState first introduces a hash.
  // Seed a placeholder hash on the current list entry, then push the movie.
  if (!window.location.hash) {
    const underlayState =
      history.state && typeof history.state === "object" ? history.state : { appView };
    history.replaceState(underlayState, "", path + MAIN_HISTORY_PLACEHOLDER_HASH);
  }
  history.pushState(state, "", path + hash);
  markProgrammaticLocation();
}

function stripMainHistoryPlaceholder() {
  if (window.location.hash !== MAIN_HISTORY_PLACEHOLDER_HASH) {
    return;
  }
  history.replaceState(
    history.state,
    "",
    window.location.pathname + window.location.search,
  );
  markProgrammaticLocation();
}

function underlayHistoryEntry() {
  const path = window.location.pathname + window.location.search;
  if (isDiscoverActive()) {
    const hash = appDiscover.buildDiscoverHash(discoverTab, discoverPage);
    return {
      state: { appView: "discover", discoverTab, discoverPage },
      url: path + hash,
    };
  }
  if (isCustomListDetailActive() && activeCustomListId) {
    const hash = `#lists/${encodeURIComponent(activeCustomListId)}`;
    return {
      state: { appView: "customDetail", activeCustomListId },
      url: path + hash,
    };
  }
  if (isFriendViewActive() && activeFriendId) {
    return {
      state: { appView: "friend", activeFriendId, friendViewName },
      url: path + appFriendView.buildFriendHash(activeFriendId),
    };
  }
  if (isCustomListIndexActive()) {
    return {
      state: { appView: "customIndex" },
      url: path + "#lists",
    };
  }
  return {
    state: { appView: "main" },
    url: path,
  };
}

/** Close the overlay in place; sync the URL without history.back(). */
function dismissDetailOverlay() {
  if (detailMovieId == null) {
    return;
  }
  closeDetail({ popHistory: false });
  restoreUnderlayScroll();
  const { state, url } = underlayHistoryEntry();
  history.replaceState(state, "", url);
  markProgrammaticLocation();
  detailClosedMovieId = null;
}

function openDetail(movieId, options = {}) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  const openingOverUnderlay = detailDialog.hidden && options.pushHistory !== false;
  if (openingOverUnderlay) {
    captureUnderlayScroll();
  }

  detailMovieId = id;
  detailBodyTab = "overview";
  detailRemapCandidateId = null;
  detailRemapQuery = "";
  detailRemapResults = [];
  detailRemapSearchPicker.clear();
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  resetDetailAddFormState();
  closeMovieShareDialog();
  closeDetailListsOverlay();
  closeDetailConfigSearch();
  detailDialog.hidden = false;
  document.body.classList.add("movie-detail-open");
  persistViewRestoreContext();
  renderDetail();
  detailCloseBtn.focus({ preventScroll: true });

  if (options.pushHistory !== false) {
    pushMovieHistory(id);
  }
  if (openingOverUnderlay) {
    restoreUnderlayScroll();
  }

  if (!appTmdb.isDetailedMovieRecord(movieById.get(id))) {
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
  const closingId = detailMovieId;
  const hadHistoryEntry = history.state?.detailMovieId != null;
  detailMovieId = null;
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  resetDetailAddFormState();
  closeMovieShareDialog();
  closeDetailListsOverlay();
  hideDetailConfigResults();
  closeDetailConfigSearch();
  detailDialog.hidden = true;
  document.body.classList.remove("movie-detail-open");

  if (options.popHistory !== false && hadHistoryEntry) {
    detailCloseNavigationPending = true;
    detailClosedMovieId = closingId;
    history.back();
  } else {
    detailClosedMovieId = null;
  }
}

function stepDetail(delta) {
  const ids = detailNavigationIds();
  const index = ids.indexOf(detailMovieId);
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return;
  }
  commitDetailRating();
  openDetail(ids[nextIndex]);
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

function accountDisplayInitial(config) {
  const source = String(config?.displayName || config?.email || "?").trim();
  return source.charAt(0).toUpperCase() || "?";
}

let accountAuthMode = "login";
let settingsTab = "account";

function setSettingsTab(tab) {
  settingsTab = tab === "config" ? tab : "account";
  const accountSelected = settingsTab === "account";
  const configSelected = settingsTab === "config";

  settingsTabAccount.setAttribute("aria-selected", accountSelected ? "true" : "false");
  settingsTabAccount.tabIndex = accountSelected ? 0 : -1;
  settingsTabConfig.setAttribute("aria-selected", configSelected ? "true" : "false");
  settingsTabConfig.tabIndex = configSelected ? 0 : -1;

  settingsPanelAccount.hidden = !accountSelected;
  settingsPanelConfig.hidden = !configSelected;
}

function setAccountAuthMode(mode) {
  accountAuthMode = mode === "signup" ? "signup" : "login";
  const loginSelected = accountAuthMode === "login";
  accountAuthTabLogin.setAttribute("aria-selected", loginSelected ? "true" : "false");
  accountAuthTabLogin.tabIndex = loginSelected ? 0 : -1;
  accountAuthTabSignup.setAttribute("aria-selected", loginSelected ? "false" : "true");
  accountAuthTabSignup.tabIndex = loginSelected ? -1 : 0;
  accountAuthForm?.setAttribute(
    "aria-labelledby",
    loginSelected ? "account-auth-tab-login" : "account-auth-tab-signup",
  );
  accountSubmitBtn.textContent = loginSelected ? "Log in" : "Create account";
  accountAuthTitle.textContent = loginSelected
    ? `Sign in to use ${SITE_BRAND_NAME}`
    : "Create an account";
  accountPasswordInput.placeholder = loginSelected ? "Your password" : "At least 8 characters";
  accountPasswordInput.autocomplete = loginSelected ? "current-password" : "new-password";
  if (accountInviteField) {
    accountInviteField.hidden = loginSelected;
  }
}

function refreshSettings() {
  refreshAccountSection();
  syncFriendFanRatingsUi();
  setStatus(cacheStatus, "");
  refreshCollectionTransferStatus();
}

function openSettings() {
  refreshSettings();
  setSettingsTab("account");
  settingsDialog.hidden = false;
  settingsBtn.setAttribute("aria-expanded", "true");
  if (accountSyncEnabled()) {
    settingsClose.focus({ preventScroll: true });
  } else {
    accountEmailInput.focus({ preventScroll: true });
  }
}

function closeSettings() {
  settingsDialog.hidden = true;
  settingsBtn.setAttribute("aria-expanded", "false");
}

function openFriends() {
  navigateToFriendsIndex();
}

function closeFriends() {
  if (isFriendsIndexActive()) {
    navigateToMain();
  }
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
 * Titles and release years are for reading the export; hydrateMovies fills gaps
 * from the account batch cache when a token is available.
 */
function csvRecordFor(movieId) {
  const record = movieById.get(movieId) || localMovieRecord(movieId);
  return {
    title: record?.title || "",
    releaseDate: record?.releaseDate || "",
  };
}

async function onExportCsv() {
  const previewRows = appListCsv.listCsvRows(userState, csvRecordFor);
  if (!previewRows.length) {
    setStatus(exportCsvStatus, "Nothing to export", null);
    return;
  }
  exportCsvBtn.disabled = true;
  setStatus(exportCsvStatus, "Preparing export…", null);
  try {
    const missingIds = previewRows
      .map((row) => row.id)
      .filter((id) => !movieById.has(id) && !localMovieRecord(id));
    if (missingIds.length && hasTmdbAccess()) {
      await hydrateMovies(missingIds);
    }
    const rows = appListCsv.listCsvRows(userState, csvRecordFor);
    const blob = new Blob([appListCsv.buildListCsv(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = appListCsv.CSV_FILENAME;
    link.click();
    URL.revokeObjectURL(objectUrl);
    const movieCount = new Set(rows.map((row) => row.id)).size;
    setStatus(
      exportCsvStatus,
      `Exported backup (${movieCount} movie${movieCount === 1 ? "" : "s"}, ${rows.length} row${rows.length === 1 ? "" : "s"}).`,
      "ok",
    );
  } catch (_) {
    setStatus(exportCsvStatus, "Export failed.", "error");
  } finally {
    exportCsvBtn.disabled = false;
  }
}

/* --- Account & friends --- */

function refreshAccountSection() {
  const connected = appAccountSync.isConnectedAccountConfig(accountConfig);
  accountAuthFields.hidden = connected;
  accountSessionCard.hidden = !connected;
  accountFriendsSection.hidden = !connected;
  settingsFriendsSignin.hidden = connected;
  if (connected) {
    const displayName =
      accountConfig.displayName || accountConfig.email.split("@")[0] || "Account";
    accountAvatar.textContent = accountDisplayInitial(accountConfig);
    accountSessionName.textContent = displayName;
    accountSessionEmail.textContent = accountConfig.email || "";
    setStatus(accountStatus, "", null);
    refreshFriendsList();
  } else {
    setAccountAuthMode("login");
    setStatus(accountStatus, "", null);
    setStatus(accountSyncStatus, "", null);
    friendsList.innerHTML = "";
  }
}

async function onAccountAuth() {
  const mode = accountAuthMode;
  const email = accountEmailInput.value.trim();
  const password = accountPasswordInput.value;
  if (!email) {
    setStatus(accountStatus, "Enter your email first.", "error");
    accountEmailInput.focus({ preventScroll: true });
    return;
  }
  if (!password) {
    setStatus(accountStatus, "Enter your password first.", "error");
    accountPasswordInput.focus({ preventScroll: true });
    return;
  }
  if (mode === "signup" && !accountInviteInput.value.trim()) {
    setStatus(accountStatus, "Enter the invite code you were given.", "error");
    accountInviteInput.focus({ preventScroll: true });
    return;
  }
  setStatus(accountStatus, mode === "signup" ? "Creating account…" : "Logging in…", null);
  accountSubmitBtn.disabled = true;
  accountAuthTabLogin.disabled = true;
  accountAuthTabSignup.disabled = true;
  try {
    const result = await connectAccount(
      mode,
      email,
      password,
      mode === "signup" ? accountInviteInput.value.trim() : "",
    );
    if (!result.ok) {
      const message =
        mode === "signup" && /already have one/i.test(result.error)
          ? `${result.error} Switch to Log in above.`
          : result.error;
      setStatus(accountStatus, message, "error");
      return;
    }
    accountPasswordInput.value = "";
    if (accountInviteInput) {
      accountInviteInput.value = "";
    }
    refreshSettings();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
  } finally {
    accountSubmitBtn.disabled = false;
    accountAuthTabLogin.disabled = false;
    accountAuthTabSignup.disabled = false;
  }
}

function onAccountLogout() {
  disconnectAccount();
  refreshSettings();
  refreshViewModeForActiveList();
  render();
  hydrateActiveList();
}

function openAccountDeleteConfirm() {
  accountDeletePassword.value = "";
  setStatus(accountDeleteStatus, "", null);
  accountDeleteDialog.hidden = false;
  accountDeletePassword.focus({ preventScroll: true });
}

function closeAccountDeleteConfirm() {
  accountDeleteDialog.hidden = true;
  accountDeletePassword.value = "";
  setStatus(accountDeleteStatus, "", null);
}

async function onAccountDeleteConfirm() {
  const password = accountDeletePassword.value;
  if (!password) {
    setStatus(accountDeleteStatus, "Enter your password to confirm.", "error");
    accountDeletePassword.focus({ preventScroll: true });
    return;
  }
  accountDeleteOk.disabled = true;
  setStatus(accountDeleteStatus, "Deleting account…", null);
  try {
    await deleteRemoteAccount(password);
    closeAccountDeleteConfirm();
    disconnectAccount();
    refreshSettings();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
    setStatus(accountStatus, "Account deleted. Your lists are still on this device.", "ok");
  } catch (error) {
    setStatus(accountDeleteStatus, error.message, "error");
  } finally {
    accountDeleteOk.disabled = false;
  }
}

function friendDisplayName(friend) {
  return friend.displayName || friend.email;
}

function friendInitial(friend) {
  const name = friendDisplayName(friend).trim();
  return (name[0] || "?").toUpperCase();
}

function friendRosterItemHtml(friend) {
  const name = appCardHtml.escapeHtml(friendDisplayName(friend));
  const initial = appCardHtml.escapeHtml(friendInitial(friend));
  const pending = friend.status === "pending";
  const incoming = pending && friend.direction === "incoming";
  const outgoing = pending && friend.direction === "outgoing";
  const itemClass = pending ? " friends-roster-item--pending" : "";
  const chipClass = pending ? " friends-roster-chip--pending" : "";

  if (incoming) {
    return `<li class="friends-roster-item${itemClass}">
  <span class="friends-roster-chip${chipClass}">
    <span class="friends-roster-avatar" aria-hidden="true">${initial}</span>
    <span class="friends-roster-name">${name}</span>
    <span class="friends-roster-tag">Incoming</span>
  </span>
  <button type="button" class="friends-roster-action" data-friend-action="accept" data-friend-id="${friend.id}">Accept</button>
  <button type="button" class="friends-roster-icon-btn" data-friend-action="remove" data-friend-id="${friend.id}" aria-label="Decline ${name}">×</button>
</li>`;
  }

  if (outgoing) {
    return `<li class="friends-roster-item${itemClass}">
  <span class="friends-roster-chip${chipClass}">
    <span class="friends-roster-avatar" aria-hidden="true">${initial}</span>
    <span class="friends-roster-name">${name}</span>
    <span class="friends-roster-tag">Pending</span>
  </span>
  <button type="button" class="friends-roster-icon-btn" data-friend-action="remove" data-friend-id="${friend.id}" aria-label="Cancel request for ${name}">×</button>
</li>`;
  }

  return `<li class="friends-roster-item">
  <button type="button" class="friends-roster-chip" data-friend-action="view" data-friend-id="${friend.id}" data-friend-name="${name}" aria-label="Open ${name}'s lists">
    <span class="friends-roster-avatar" aria-hidden="true">${initial}</span>
    <span class="friends-roster-name">${name}</span>
  </button>
  <button type="button" class="friends-roster-icon-btn" data-friend-action="remove" data-friend-id="${friend.id}" data-friend-name="${name}" aria-label="Remove ${name}">×</button>
</li>`;
}

async function refreshFriendsList() {
  friendsList.innerHTML = '<li class="friends-roster-empty">Loading friends…</li>';
  try {
    const body = await fetchFriends();
    const friends = body?.friends || [];
    friendsList.innerHTML = friends.length
      ? friends.map(friendRosterItemHtml).join("")
      : '<li class="friends-roster-empty">No friends yet. Add someone by email above.</li>';
    setStatus(friendsStatus, "", null);
  } catch (error) {
    friendsList.innerHTML = "";
    setStatus(friendsStatus, error.message, "error");
    if (error?.status === 401) {
      refreshAccountSection();
    }
  }
}

async function onAddFriend() {
  const email = friendEmailInput.value.trim();
  if (!email) {
    setStatus(friendsStatus, "Enter your friend's account email first.", "error");
    return;
  }
  friendAddBtn.disabled = true;
  setStatus(friendsStatus, "Sending request…", null);
  try {
    const body = await sendFriendRequest(email);
    friendEmailInput.value = "";
    setStatus(
      friendsStatus,
      "Request sent. They can accept it from their Friends page.",
      "ok",
    );
    refreshFriendsList();
  } catch (error) {
    setStatus(friendsStatus, error.message, "error");
  } finally {
    friendAddBtn.disabled = false;
  }
}

function requestRemoveFriendConfirm(friendId, name) {
  pendingFriendRemoveId = friendId;
  friendRemoveConfirmMessage.textContent = `Remove ${name} as a friend? You can send a new request later.`;
  friendRemoveConfirmDialog.hidden = false;
  friendRemoveConfirmCancel.focus({ preventScroll: true });
}

function closeFriendRemoveConfirm() {
  pendingFriendRemoveId = null;
  friendRemoveConfirmDialog.hidden = true;
}

async function confirmRemoveFriend() {
  const friendId = pendingFriendRemoveId;
  closeFriendRemoveConfirm();
  if (!friendId) {
    return;
  }
  try {
    await removeFriend(friendId);
    if (isFriendViewActive() && activeFriendId === friendId) {
      navigateFromFriendView();
    }
    refreshFriendsList();
  } catch (error) {
    setStatus(friendsStatus, error.message, "error");
  }
}

async function onFriendsListClick(event) {
  const button = event.target.closest("[data-friend-action]");
  if (!button) {
    return;
  }
  const friendId = Number(button.dataset.friendId);
  const action = button.dataset.friendAction;
  try {
    if (action === "accept") {
      await acceptFriend(friendId);
      refreshFriendsList();
    } else if (action === "remove") {
      if (button.closest(".friends-roster-item--pending")) {
        await removeFriend(friendId);
        refreshFriendsList();
      } else {
        requestRemoveFriendConfirm(friendId, button.dataset.friendName || "this friend");
      }
    } else if (action === "view") {
      navigateToFriendView(friendId, button.dataset.friendName || "Friend");
    }
  } catch (error) {
    setStatus(friendsStatus, error.message, "error");
  }
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

function listSearchFilterSignature() {
  return JSON.stringify(getListSearchFilter());
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
  const showFilter =
    appView === "main" &&
    !isCustomListView() &&
    !isDiscoverActive() &&
    isWatchedListActive() &&
    activeMovieIds().length > 0 &&
    hasMovieData();
  listSearchRow.hidden = !showFilter;
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
      const before = listSearchFilterSignature();
      absorbListSearchInputTokens();
      hideListSearchSuggest();
      updateListSearchClearVisibility();
      if (listSearchFilterSignature() !== before) {
        listSearchRenderNow();
      }
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
  const discoverMatch = appDiscover.parseDiscoverHash(hash);
  if (discoverMatch) {
    return { kind: "discover", tab: discoverMatch.tab, page: discoverMatch.page };
  }
  const friendMatch = appFriendView.parseFriendHash(hash);
  if (friendMatch) {
    return { kind: "friend", userId: friendMatch.userId };
  }
  if (appFriendView.parseFriendsIndexHash(hash)) {
    return { kind: "friendsIndex" };
  }
  return { kind: "main" };
}

const VIEW_RESTORE_KEY = "moviecollector-view-restore";

function persistViewRestoreContext() {
  try {
    sessionStorage.setItem(
      VIEW_RESTORE_KEY,
      JSON.stringify({
        appView,
        discoverTab: isDiscoverActive() ? discoverTab : null,
        discoverPage: isDiscoverActive() ? discoverPage : null,
        activeCustomListId: isCustomListDetailActive() ? activeCustomListId : null,
        activeFriendId: isFriendViewActive() ? activeFriendId : null,
        friendViewName: isFriendViewActive() ? friendViewName : null,
      }),
    );
  } catch (_) {
    /* Private browsing may refuse storage. */
  }
}

function readViewRestoreContext() {
  try {
    const text = sessionStorage.getItem(VIEW_RESTORE_KEY);
    if (!text) {
      return null;
    }
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_) {
    return null;
  }
}

function clearViewRestoreContext() {
  try {
    sessionStorage.removeItem(VIEW_RESTORE_KEY);
  } catch (_) {
    /* Ignore storage failures. */
  }
}

function applyRestoredViewContext(restored) {
  if (!restored) {
    return false;
  }
  if (restored.appView === "discover") {
    appView = "discover";
    activeCustomListId = null;
    if (restored.discoverTab) {
      discoverTab = appDiscover.normalizeDiscoverTab(restored.discoverTab);
    }
    if (restored.discoverPage) {
      discoverPage = appDiscover.normalizeDiscoverPage(restored.discoverPage);
    }
    return true;
  }
  if (restored.appView === "customDetail" && restored.activeCustomListId) {
    const list = appCustomLists.findCustomList(userState.customLists, restored.activeCustomListId);
    if (list) {
      appView = "customDetail";
      activeCustomListId = restored.activeCustomListId;
      return true;
    }
  }
  if (restored.appView === "customIndex") {
    appView = "customIndex";
    activeCustomListId = null;
    return true;
  }
  if (restored.appView === "friendsIndex") {
    appView = "friendsIndex";
    activeCustomListId = null;
    return true;
  }
  if (restored.appView === "friend" && restored.activeFriendId) {
    appView = "friend";
    activeCustomListId = null;
    activeFriendId = restored.activeFriendId;
    friendViewName = restored.friendViewName || "Friend";
    return true;
  }
  return false;
}

function syncHeaderNavUi() {
  let activeNav = null;
  if (isDiscoverActive()) {
    activeNav = "discover";
  } else if (isFriendsIndexActive() || isFriendViewActive()) {
    activeNav = "friends";
  } else if (isCustomListView()) {
    activeNav = "lists";
  }

  discoverEntryBtn?.classList.toggle("is-active", activeNav === "discover");
  friendsEntryBtn?.classList.toggle("is-active", activeNav === "friends");
  listsNavBtn?.classList.toggle("is-active", activeNav === "lists");

  discoverEntryBtn?.setAttribute("aria-current", activeNav === "discover" ? "page" : "false");
  friendsEntryBtn?.setAttribute("aria-current", activeNav === "friends" ? "page" : "false");
  listsNavBtn?.setAttribute("aria-current", activeNav === "lists" ? "page" : "false");
}

function syncAppViewChrome() {
  document.body.classList.toggle("view-custom-index", isCustomListIndexActive());
  document.body.classList.toggle("view-custom-detail", isCustomListDetailActive());
  document.body.classList.toggle("view-discover", isDiscoverActive());
  document.body.classList.toggle("view-friends-index", isFriendsIndexActive());
  document.body.classList.toggle("view-friend", isFriendViewActive());
  if (customListsIndex) {
    customListsIndex.hidden = !isCustomListIndexActive();
  }
  if (friendsIndexEl) {
    friendsIndexEl.hidden = !isFriendsIndexActive();
  }
  if (friendViewEl) {
    friendViewEl.hidden = !isFriendViewActive();
  }
  if (grid) {
    grid.hidden = isFriendViewActive() || isFriendsIndexActive();
  }
  if (listTabs) {
    listTabs.hidden =
      isCustomListView() || isDiscoverActive() || isFriendViewActive() || isFriendsIndexActive();
  }
  if (discoverTabs) {
    discoverTabs.hidden = !isDiscoverActive();
  }
  if (customListBackBtn) {
    customListBackBtn.hidden =
      !isCustomListView() &&
      !isDiscoverActive() &&
      !isFriendViewActive() &&
      !isFriendsIndexActive();
  }
  if (customListBackLabel) {
    if (isFriendViewActive()) {
      customListBackLabel.textContent = "Friends";
    } else if (isFriendsIndexActive() || isDiscoverActive()) {
      customListBackLabel.textContent = "Collection";
    } else {
      customListBackLabel.textContent = isCustomListIndexActive() ? "Collection" : "All lists";
    }
  }
  if (customListsIndexActions) {
    customListsIndexActions.hidden = !isCustomListIndexActive();
  }
  if (addMovieFab) {
    addMovieFab.hidden =
      isCustomListIndexActive() ||
      isDiscoverActive() ||
      isFriendViewActive() ||
      isFriendsIndexActive();
  }
  updateListHeader();
  syncHeaderNavUi();
  syncListSearchVisibility();
  syncReorderModeUi();
}

function navigateToMain(options = {}) {
  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
  appView = "main";
  activeCustomListId = null;
  clearViewRestoreContext();
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
  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
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
  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
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
  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
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

function appViewMatchesLocation(parsed) {
  if (parsed.kind === "main") {
    return appView === "main";
  }
  if (parsed.kind === "customIndex") {
    return appView === "customIndex";
  }
  if (parsed.kind === "customDetail") {
    return appView === "customDetail" && activeCustomListId === parsed.listId;
  }
  if (parsed.kind === "discover") {
    return (
      appView === "discover" &&
      discoverTab === appDiscover.normalizeDiscoverTab(parsed.tab) &&
      discoverPage === appDiscover.normalizeDiscoverPage(parsed.page)
    );
  }
  if (parsed.kind === "friendsIndex") {
    return appView === "friendsIndex";
  }
  if (parsed.kind === "friend") {
    return appView === "friend" && activeFriendId === parsed.userId;
  }
  return false;
}

function movieUnderlayMatchesHistoryState() {
  const state = history.state;
  if (!state?.appView) {
    return appView === "main" || isCustomListView() || isDiscoverActive();
  }
  if (state.appView !== appView) {
    return false;
  }
  if (state.appView === "customDetail") {
    return activeCustomListId === (state.activeCustomListId ?? null);
  }
  if (state.appView === "discover") {
    const tab = state.discoverTab
      ? appDiscover.normalizeDiscoverTab(state.discoverTab)
      : discoverTab;
    const page =
      state.discoverPage != null
        ? appDiscover.normalizeDiscoverPage(state.discoverPage)
        : discoverPage;
    return tab === discoverTab && page === discoverPage;
  }
  if (state.appView === "friendsIndex") {
    return appView === "friendsIndex";
  }
  if (state.appView === "friend") {
    return activeFriendId === (state.activeFriendId ?? null);
  }
  return true;
}

function paintLocationUnderlay() {
  syncAppViewChrome();
  refreshViewModeForActiveList();
  if (isCustomListIndexActive()) {
    renderCustomListsIndex();
    return;
  }
  if (isFriendsIndexActive()) {
    renderFriendsIndex();
    return;
  }
  if (isDiscoverActive()) {
    const needsLoad =
      !discoverMovieIds.length && !discoverLoading && !discoverLoadError;
    if (needsLoad) {
      loadDiscoverTab(discoverTab, { page: discoverPage, pushHistory: false });
    } else {
      renderDiscover();
    }
    return;
  }
  if (isFriendViewActive()) {
    if (friendViewLoadedId === activeFriendId && friendViewState) {
      renderFriendView();
    } else if (!friendViewLoading) {
      loadFriendView(activeFriendId);
    }
    return;
  }
  render();
  hydrateActiveList();
}

function syncViewFromLocation(options = {}) {
  const parsed = parseLocationHash();
  const fromPopState = Boolean(options.fromPopState);

  if (parsed.kind !== "movie") {
    const dismissOverlayOnly =
      (detailMovieId != null || detailCloseNavigationPending) &&
      appViewMatchesLocation(parsed);
    detailCloseNavigationPending = false;
    closeDetail({ popHistory: false });
    detailClosedMovieId = null;
    if (dismissOverlayOnly) {
      restoreUnderlayScroll();
      stripMainHistoryPlaceholder();
      return;
    }
  } else {
    const id = movieIdFromHash();
    if (fromPopState && detailMovieId != null && id === detailMovieId) {
      window.setTimeout(() => history.back(), 0);
      return;
    }
    if (detailCloseNavigationPending && id === detailClosedMovieId) {
      window.setTimeout(() => history.back(), 0);
      return;
    }
    detailClosedMovieId = null;
    const keepUnderlay =
      detailMovieId != null || detailCloseNavigationPending;
    detailCloseNavigationPending = false;
    if (keepUnderlay && movieUnderlayMatchesHistoryState()) {
      syncDetailFromLocation();
      return;
    }
    const state = history.state;
    if (state?.appView) {
      appView = state.appView;
      activeCustomListId = state.activeCustomListId ?? null;
      if (state.appView === "friend") {
        activeFriendId = state.activeFriendId ?? null;
        friendViewName = state.friendViewName || "Friend";
      } else if (state.appView === "friendsIndex") {
        if (typeof clearFriendViewState === "function") {
          clearFriendViewState();
        }
      }
      if (state.discoverTab) {
        discoverTab = appDiscover.normalizeDiscoverTab(state.discoverTab);
      }
      if (state.discoverPage != null) {
        discoverPage = appDiscover.normalizeDiscoverPage(state.discoverPage);
      }
    } else if (!applyRestoredViewContext(readViewRestoreContext())) {
      if (!isCustomListView() && !isDiscoverActive()) {
        appView = "main";
        activeCustomListId = null;
      }
    }
    paintLocationUnderlay();
    syncDetailFromLocation();
    return;
  }

  if (parsed.kind === "customIndex") {
    appView = "customIndex";
    activeCustomListId = null;
    if (typeof clearFriendViewState === "function") {
      clearFriendViewState();
    }
    syncAppViewChrome();
    renderCustomListsIndex();
    return;
  }

  if (parsed.kind === "customDetail") {
    const list = appCustomLists.findCustomList(userState.customLists, parsed.listId);
    if (list) {
      appView = "customDetail";
      activeCustomListId = parsed.listId;
      if (typeof clearFriendViewState === "function") {
        clearFriendViewState();
      }
      syncAppViewChrome();
      refreshViewModeForActiveList();
      render();
      hydrateActiveList();
      return;
    }
    navigateToCustomListsIndex({ pushHistory: false });
    return;
  }

  if (parsed.kind === "discover") {
    appView = "discover";
    activeCustomListId = null;
    if (typeof clearFriendViewState === "function") {
      clearFriendViewState();
    }
    syncAppViewChrome();
    refreshViewModeForActiveList();
    const tab = appDiscover.normalizeDiscoverTab(parsed.tab);
    const page = appDiscover.normalizeDiscoverPage(parsed.page);
    const needsLoad =
      tab !== discoverTab ||
      page !== discoverPage ||
      (!discoverMovieIds.length && !discoverLoading && !discoverLoadError);
    if (needsLoad) {
      loadDiscoverTab(tab, { page, pushHistory: false });
    } else {
      discoverTab = tab;
      discoverPage = page;
      renderDiscover();
    }
    return;
  }

  if (parsed.kind === "friendsIndex") {
    appView = "friendsIndex";
    activeCustomListId = null;
    if (typeof clearFriendViewState === "function") {
      clearFriendViewState();
    }
    syncAppViewChrome();
    renderFriendsIndex();
    return;
  }

  if (parsed.kind === "friend") {
    appView = "friend";
    activeCustomListId = null;
    activeFriendId = parsed.userId;
    const state = history.state;
    if (state?.friendViewName) {
      friendViewName = state.friendViewName;
    } else if (friendViewLoadedId !== parsed.userId) {
      friendViewName = "Friend";
    }
    syncAppViewChrome();
    if (friendViewLoadedId === parsed.userId && friendViewState) {
      renderFriendView();
    } else {
      loadFriendView(parsed.userId);
    }
    return;
  }

  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
  appView = "main";
  activeCustomListId = null;
  clearViewRestoreContext();
  syncAppViewChrome();
  refreshViewModeForActiveList();
  render();
  hydrateActiveList();
}

function onListsNavClick() {
  navigateToCustomListsIndex();
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

function syncCustomListIndexSortFromState() {
  customListIndexSort = appCustomLists.normalizeCustomListIndexSort(
    userState.preferences?.customListIndexSort,
  );
}

function pinnedCustomListId() {
  return userState.preferences?.pinnedCustomListId ?? null;
}

function persistPinnedCustomListId(nextPin) {
  userState = {
    ...userState,
    preferences: {
      ...userState.preferences,
      pinnedCustomListId: nextPin,
      pinnedCustomListAt: new Date().toISOString(),
    },
  };
  persistUserState();
}

function customListPinButtonHtml(listId, isPinned) {
  const label = isPinned ? "Unpin list" : "Pin list to top";
  const pressed = isPinned ? "true" : "false";
  const pinnedClass = isPinned ? " is-pinned" : "";
  return `<button type="button" class="custom-list-card-pin${pinnedClass}" data-pin-custom-list="${appCardHtml.escapeHtml(listId)}" aria-label="${label}" title="${label}" aria-pressed="${pressed}">
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor"><path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/></svg>
</button>`;
}

function renderCustomListsIndex(options = {}) {
  if (!customListsRows) {
    return;
  }
  const pinId = pinnedCustomListId();
  const lists = appCustomLists.sortCustomListsForIndex(
    userState.customLists || [],
    customListIndexSort,
    pinId,
  );
  const atMax = (userState.customLists || []).length >= appCustomLists.MAX_CUSTOM_LISTS;
  if (customListCreateBtn) {
    customListCreateBtn.disabled = atMax;
    customListCreateBtn.title = atMax ? `Maximum of ${appCustomLists.MAX_CUSTOM_LISTS} lists` : "";
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
  const coverIds = customListIndexCoverIds(lists);
  customListsRows.innerHTML = lists
    .map((list) => {
      const renaming = pendingCustomListRenameId === list.id;
      const countLabel = `${list.movieIds.length} ${list.movieIds.length === 1 ? "movie" : "movies"}`;
      if (renaming) {
        return `<li class="custom-list-card is-renaming" data-custom-list-id="${appCardHtml.escapeHtml(list.id)}">
  <div class="custom-list-card-main">
    <input type="text" class="custom-list-rename-input" data-rename-input="${appCardHtml.escapeHtml(list.id)}" value="${appCardHtml.escapeHtml(list.name)}" maxlength="${appCustomLists.MAX_NAME_LENGTH}" aria-label="Rename list">
  </div>
  <div class="custom-list-card-actions">
    <button type="button" class="custom-list-card-btn" data-rename-custom-list="${appCardHtml.escapeHtml(list.id)}">Save</button>
    <button type="button" class="custom-list-card-btn custom-list-card-btn--danger" data-delete-custom-list="${appCardHtml.escapeHtml(list.id)}">Delete</button>
  </div>
</li>`;
      }
      const isPinned = list.id === pinId;
      const cardClass = isPinned ? "custom-list-card is-pinned" : "custom-list-card";
      return `<li class="${cardClass}" data-custom-list-id="${appCardHtml.escapeHtml(list.id)}">
  <button type="button" class="custom-list-card-open" data-open-custom-list="${appCardHtml.escapeHtml(list.id)}">
    <div class="custom-list-card-covers">${customListIndexCoversHtml(list)}</div>
    <div class="custom-list-card-body">
      <span class="custom-list-card-name">${appCardHtml.escapeHtml(list.name)}</span>
      <span class="custom-list-card-count">${countLabel}</span>
    </div>
  </button>
  ${customListPinButtonHtml(list.id, isPinned)}
  <div class="custom-list-card-actions">
    <button type="button" class="custom-list-card-btn" data-rename-custom-list="${appCardHtml.escapeHtml(list.id)}">Rename</button>
    <button type="button" class="custom-list-card-btn custom-list-card-btn--danger" data-delete-custom-list="${appCardHtml.escapeHtml(list.id)}">Delete</button>
  </div>
</li>`;
    })
    .join("");

  bindPosterImages(customListsRows);
  if (!options.skipHydrate) {
    hydrateCustomListIndexCovers(lists);
  }

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
  userState = {
    ...userState,
    preferences: {
      ...userState.preferences,
      customListIndexSort,
    },
  };
  persistUserState();
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
  if ((userState.customLists || []).length >= appCustomLists.MAX_CUSTOM_LISTS) {
    notifyCustomListsCapReached();
    return;
  }
  const next = appCustomLists.createCustomList(userState.customLists, trimmed);
  if (next === userState.customLists) {
    window.alert("Could not create list. Check the name length and that it is unique.");
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

function togglePinCustomList(listId) {
  if (!appCustomLists.isCustomListId(listId)) {
    return;
  }
  const nextPin = appCustomLists.togglePinnedCustomListId(
    pinnedCustomListId(),
    listId,
    userState.customLists,
  );
  persistPinnedCustomListId(nextPin);
  renderCustomListsIndex();
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
  const wasPinned = pinnedCustomListId() === listId;
  const nextPin = wasPinned
    ? null
    : appCustomLists.normalizePinnedCustomListId(pinnedCustomListId(), customLists);
  userState = {
    ...userState,
    customLists,
    customListTombstones: tombstones,
    preferences: {
      ...userState.preferences,
      pinnedCustomListId: nextPin,
      pinnedCustomListAt: wasPinned
        ? new Date().toISOString()
        : userState.preferences?.pinnedCustomListAt ?? null,
    },
    ratings: appRatings.normalizeRatings(userState.ratings, userState.lists, customLists),
  };
  persistUserState();
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
    dismissDetailOverlay();
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
      const locked = isCustomListDetailActive() && list.id === activeCustomListId;
      if (locked) {
        return `<span class="add-custom-list-chip is-member is-locked">${appCardHtml.escapeHtml(list.name)}</span>`;
      }
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
  if (addMovieSubmit) {
    addMovieSubmit.disabled = !hasAddMovieDestinations();
  }
}

function customListIndexCoverHtml(movieId) {
  const record = movieById.get(movieId) ?? localMovieRecord(movieId);
  const inner = record
    ? posterHtml(record, appTmdb.POSTER_SIZES.card)
    : `<div class="placeholder custom-list-card-cover-placeholder" aria-hidden="true"></div>`;
  const loadingClass = record ? "" : " is-loading";
  return `<div class="custom-list-card-cover${loadingClass}" data-movie-id="${movieId}">${inner}</div>`;
}

function customListIndexCoversHtml(list) {
  const ids = list.movieIds.slice(0, 4);
  const cells = [];
  for (let index = 0; index < 4; index += 1) {
    const id = ids[index];
    cells.push(id != null ? customListIndexCoverHtml(id) : `<div class="custom-list-card-cover is-empty" aria-hidden="true"></div>`);
  }
  return cells.join("");
}

function customListIndexCoverIds(lists) {
  const ids = [];
  const seen = new Set();
  for (const list of lists) {
    for (const id of list.movieIds.slice(0, 4)) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
}

function patchCustomListIndexCover(movieId) {
  if (!customListsRows || movieId == null) {
    return;
  }
  const id = Number(movieId);
  const record = movieById.get(id) ?? localMovieRecord(id);
  if (!record) {
    return;
  }
  const cells = customListsRows.querySelectorAll(
    `.custom-list-card-cover[data-movie-id="${CSS.escape(String(id))}"]`,
  );
  if (!cells.length) {
    return;
  }
  const html = posterHtml(record, appTmdb.POSTER_SIZES.card);
  for (const cell of cells) {
    cell.innerHTML = html;
    cell.classList.remove("is-loading");
  }
  bindPosterImages(customListsRows);
}

function hydrateCustomListIndexCovers(lists) {
  const ids = customListIndexCoverIds(lists);
  const missing = ids.filter((id) => !movieById.has(id));
  if (!missing.length || !hasTmdbAccess()) {
    return;
  }
  hydrateMovies(missing, {
    onRecord: (id) => {
      if (isCustomListIndexActive()) {
        patchCustomListIndexCover(id);
      }
    },
    onUpdate: (id) => {
      if (isCustomListIndexActive()) {
        patchCustomListIndexCover(id);
      }
    },
  });
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
  const activeList = appCustomLists.findCustomList(userState.customLists, activeCustomListId);
  let nextLists = userState.customLists;
  let added = 0;
  let skipped = 0;
  for (const id of watchedPickerSelectedIds) {
    const before = nextLists;
    nextLists = appCustomLists.addMovieToCustomList(nextLists, activeCustomListId, id);
    const listBefore = appCustomLists.findCustomList(before, activeCustomListId);
    if (nextLists !== before) {
      added += 1;
    } else if (!listBefore?.movieIds.includes(id)) {
      skipped += 1;
    }
  }
  if (skipped > 0) {
    notifyCustomListMovieCapReached(activeList?.name);
  }
  if (added === 0) {
    return;
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
  const pinBtn = event.target.closest("[data-pin-custom-list]");
  if (pinBtn) {
    event.preventDefault();
    event.stopPropagation();
    togglePinCustomList(pinBtn.dataset.pinCustomList);
    return;
  }
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
  if (isCustomListDetailActive() && listId === activeCustomListId) {
    return;
  }
  if (selectedAddCustomListIds.has(listId)) {
    selectedAddCustomListIds.delete(listId);
  } else {
    const list = appCustomLists.findCustomList(userState.customLists, listId);
    if (
      list &&
      pendingAddResult &&
      !list.movieIds.includes(pendingAddResult.id) &&
      appCustomLists.isCustomListAtMovieCap(userState.customLists, listId)
    ) {
      notifyCustomListMovieCapReached(list.name);
      return;
    }
    selectedAddCustomListIds.add(listId);
  }
  if (isCustomListDetailActive() && activeCustomListId) {
    selectedAddCustomListIds.add(activeCustomListId);
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
  syncCustomListIndexSortFromState();
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

/* ===== TMDB discover browse (upcoming and now playing) ===== */

/**
 * TMDB discover browse: upcoming and now playing lists.
 */

let discoverTab = appDiscover.DEFAULT_DISCOVER_TAB;
let discoverPage = appDiscover.DISCOVER_DEFAULT_PAGE;
let discoverTotalPages = 1;
let discoverMovieIds = [];
let discoverLoading = false;
let discoverLoadError = null;
let discoverLoadToken = 0;

function isDiscoverActive() {
  return appView === "discover";
}

function discoverDisplayIds() {
  return discoverMovieIds;
}

function detailNavigationIds() {
  if (isDiscoverActive()) {
    return discoverDisplayIds();
  }
  if (isFriendViewActive()) {
    return appFriendView.friendNavigationIds(
      friendViewSections,
      detailMovieId,
      friendViewNavigationOptions(),
    );
  }
  return renderedMovieIds.length ? renderedMovieIds : displayMovieIds();
}

function syncDiscoverTabUi() {
  if (!discoverTabs) {
    return;
  }
  for (const tabBtn of discoverTabs.querySelectorAll("[data-discover-tab]")) {
    const active = tabBtn.dataset.discoverTab === discoverTab;
    tabBtn.setAttribute("aria-selected", active ? "true" : "false");
    tabBtn.tabIndex = active ? 0 : -1;
  }
}

function syncDiscoverPaginationUi() {
  const pageLabel =
    discoverTotalPages > 1 ? `Page ${discoverPage} of ${discoverTotalPages}` : `Page ${discoverPage}`;
  const show = isDiscoverActive();
  const prevDisabled = discoverLoading || discoverPage <= 1;
  const nextDisabled = discoverLoading || discoverPage >= discoverTotalPages;

  if (discoverPagination) {
    discoverPagination.hidden = !show;
  }
  if (discoverPrevBtn) {
    discoverPrevBtn.disabled = prevDisabled;
  }
  if (discoverNextBtn) {
    discoverNextBtn.disabled = nextDisabled;
  }
  if (discoverPageLabel) {
    discoverPageLabel.textContent = pageLabel;
  }

  if (discoverPaginationBottom) {
    discoverPaginationBottom.hidden = !show;
  }
  if (discoverPrevBottomBtn) {
    discoverPrevBottomBtn.disabled = prevDisabled;
  }
  if (discoverNextBottomBtn) {
    discoverNextBottomBtn.disabled = nextDisabled;
  }
  if (discoverPageLabelBottom) {
    discoverPageLabelBottom.textContent = pageLabel;
  }
}

function renderDiscoverEmptyState(count) {
  if (count) {
    emptyState.hidden = true;
    emptyState.innerHTML = "";
    return;
  }
  emptyState.hidden = false;
  if (!hasTmdbAccess()) {
    emptyState.innerHTML = `<strong>Sign in to use Discover</strong><p class="empty-state-hint">Open Settings → Account to log in or create an account.</p>`;
    return;
  }
  if (discoverLoading) {
    emptyState.innerHTML = `<strong>Loading releases…</strong>`;
    return;
  }
  if (discoverLoadError) {
    emptyState.innerHTML = `<strong>Could not load releases</strong><p class="empty-state-hint">Check your connection, then try again.</p>`;
    return;
  }
  emptyState.innerHTML = `<strong>No releases to show</strong>`;
}

function renderDiscover() {
  const ids = discoverDisplayIds();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  syncDiscoverTabUi();
  syncDiscoverPaginationUi();
  syncAppViewChrome();
  renderDiscoverEmptyState(ids.length);
  syncAddMovieFabVisibility(ids.length);
  updateListHeader();
}

function seedDiscoverMovieStubs(entries) {
  if (!Array.isArray(entries)) {
    return;
  }
  for (const entry of entries) {
    const id = Number(entry?.id);
    if (!Number.isInteger(id) || id <= 0) {
      continue;
    }
    if (appTmdb.isDetailedMovieRecord(movieById.get(id))) {
      continue;
    }
    movieById.set(id, entry);
    movieErrors.delete(id);
  }
}

function renderDiscoverAfterLoad() {
  renderDiscover();
  if (detailMovieId != null) {
    renderDetail();
  }
}

async function loadDiscoverTab(tab, options = {}) {
  discoverTab = appDiscover.normalizeDiscoverTab(tab);
  if (options.resetPage) {
    discoverPage = appDiscover.DISCOVER_DEFAULT_PAGE;
  } else if (options.page != null) {
    discoverPage = appDiscover.normalizeDiscoverPage(options.page);
  }
  discoverLoading = true;
  discoverLoadError = null;
  discoverMovieIds = [];
  const token = ++discoverLoadToken;
  renderDiscover();

  if (!hasTmdbAccess()) {
    discoverLoading = false;
    renderDiscover();
    return;
  }

  try {
    const result = await fetchDiscoverMovies(discoverTab, { page: discoverPage });
    if (token !== discoverLoadToken) {
      return;
    }
    discoverPage = result.page;
    discoverTotalPages = result.totalPages;
    discoverMovieIds = result.entries.map((entry) => entry.id);
    seedDiscoverMovieStubs(result.entries);
    discoverLoading = false;
    renderDiscoverAfterLoad();
  } catch (_) {
    if (token !== discoverLoadToken) {
      return;
    }
    discoverLoadError = true;
    discoverMovieIds = [];
    discoverLoading = false;
    renderDiscoverAfterLoad();
  }
}

function navigateDiscoverPage(delta) {
  const nextPage = discoverPage + delta;
  if (nextPage < 1 || nextPage > discoverTotalPages) {
    return;
  }
  discoverPage = nextPage;
  const hash = appDiscover.buildDiscoverHash(discoverTab, discoverPage);
  history.pushState({ appView: "discover", discoverTab, discoverPage }, "", hash);
  loadDiscoverTab(discoverTab, { page: discoverPage, pushHistory: false });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function onDiscoverPrevClick() {
  navigateDiscoverPage(-1);
}

function onDiscoverNextClick() {
  navigateDiscoverPage(1);
}

function navigateToDiscover(tab, options = {}) {
  if (typeof closeAddMovieDialog === "function") {
    closeAddMovieDialog();
  }
  closeDetail({ popHistory: false });
  discoverTab = appDiscover.normalizeDiscoverTab(tab);
  discoverPage = appDiscover.DISCOVER_DEFAULT_PAGE;
  appView = "discover";
  activeCustomListId = null;
  if (options.pushHistory !== false) {
    history.pushState(
      { appView: "discover", discoverTab, discoverPage: 1 },
      "",
      appDiscover.buildDiscoverHash(discoverTab, 1),
    );
  }
  syncAppViewChrome();
  refreshViewModeForActiveList();
  loadDiscoverTab(discoverTab, { resetPage: true, pushHistory: false });
}

function onDiscoverTabClick(event) {
  const tabBtn = event.target.closest("[data-discover-tab]");
  if (!tabBtn) {
    return;
  }
  const tab = tabBtn.dataset.discoverTab;
  if (tab === discoverTab) {
    return;
  }
  history.pushState(
    { appView: "discover", discoverTab: tab, discoverPage: 1 },
    "",
    appDiscover.buildDiscoverHash(tab, 1),
  );
  loadDiscoverTab(tab, { resetPage: true, pushHistory: false });
}

function openDiscover() {
  if (!accountSyncEnabled()) {
    openSettings();
    return;
  }
  navigateToDiscover(appDiscover.DEFAULT_DISCOVER_TAB);
}

/* ===== Collection backup CSV import ===== */

/* --- Collection backup import --- */

let collectionImportRows = null;

function syncCollectionImportFileLabel() {
  if (!collectionImportFileName) {
    return;
  }
  const file = collectionImportFile?.files?.[0];
  collectionImportFileName.textContent = file ? file.name : "Choose CSV…";
  collectionImportFileName.classList.toggle("is-empty", !file);
  if (collectionImportRead) {
    collectionImportRead.disabled = !file;
  }
}

function collectionExportMovieCount() {
  const rows = appListCsv.listCsvRows(userState, () => ({ title: "", releaseDate: "" }));
  return new Set(rows.map((row) => row.id)).size;
}

function refreshCollectionTransferStatus() {
  const movieCount = collectionExportMovieCount();
  setStatus(
    exportCsvStatus,
    movieCount
      ? `${movieCount} movie${movieCount === 1 ? "" : "s"} to export`
      : "Nothing to export",
    movieCount ? "ok" : null,
  );
  if (exportCsvBtn) {
    exportCsvBtn.disabled = !movieCount;
  }
  setStatus(collectionImportStatus, "");
  syncCollectionImportFileLabel();
}

function formatCollectionImportSummary(summary) {
  const parts = [
    `${summary.movies} movie${summary.movies === 1 ? "" : "s"}`,
    `${summary.rows} row${summary.rows === 1 ? "" : "s"}`,
    `${summary.watched} watched`,
    `${summary.watchlist} watchlist`,
  ];
  if (summary.customRows) {
    parts.push(`${summary.customRows} custom list row${summary.customRows === 1 ? "" : "s"}`);
  }
  if (summary.ratings) {
    parts.push(`${summary.ratings} rating${summary.ratings === 1 ? "" : "s"}`);
  }
  if (summary.viewings) {
    parts.push(`${summary.viewings} viewing date${summary.viewings === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}

function openCollectionImportConfirm(summary) {
  collectionImportMessage.textContent =
    `Replace your lists, ratings, and viewing history with this backup (${formatCollectionImportSummary(summary)})? Movies not in the file will be removed. Custom lists in the file are restored; others are cleared.`;
  collectionImportDialog.hidden = false;
  collectionImportCancel.focus({ preventScroll: true });
}

function closeCollectionImportConfirm() {
  collectionImportDialog.hidden = true;
  settingsBtn.focus({ preventScroll: true });
}

async function onReviewCollectionImport() {
  const file = collectionImportFile.files?.[0];
  if (!file) {
    setStatus(collectionImportStatus, "Choose a backup CSV first.", "error");
    return;
  }
  collectionImportRead.disabled = true;
  setStatus(collectionImportStatus, "Reading backup…", null);
  try {
    const text = await file.text();
    const rows = appListCsv.parseCollectionCsv(text);
    if (!rows.length) {
      throw new Error("That file does not contain any collection rows.");
    }
    collectionImportRows = rows;
    openCollectionImportConfirm(appListCsv.summarizeCollectionImport(rows));
    setStatus(collectionImportStatus, "Review the import confirmation.", null);
  } catch (error) {
    collectionImportRows = null;
    setStatus(collectionImportStatus, error.message || "Could not read that backup.", "error");
  } finally {
    collectionImportRead.disabled = false;
  }
}

function onConfirmCollectionImport() {
  if (!collectionImportRows?.length) {
    closeCollectionImportConfirm();
    return;
  }
  collectionImportOk.disabled = true;
  try {
    const before = userState;
    const result = appListCsv.applyCollectionImport(before, collectionImportRows, {
      mode: "replace",
    });
    backupUserState(before);
    userState = result.state;
    persistUserState();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
    collectionImportRows = null;
    collectionImportFile.value = "";
    syncCollectionImportFileLabel();
    closeCollectionImportConfirm();
    refreshCollectionTransferStatus();
    setStatus(
      collectionImportStatus,
      `Imported backup: ${formatCollectionImportSummary(result.summary)}.`,
      "ok",
    );
  } catch (error) {
    setStatus(collectionImportStatus, error.message || "The import could not be saved.", "error");
  } finally {
    collectionImportOk.disabled = false;
  }
}

/* ===== Friend list page with overview ===== */

/**
 * Friend list page: fetch, overview, stacked section grids.
 */

function friendViewShowsFanRatings() {
  return userState?.preferences?.friendFanRatings === true;
}

function friendRatingSegmentHtml(kind, text, empty) {
  return ratingSegmentHtml(kind, text, empty);
}

function friendRatingChitClassHtml(inner, ariaLabel, extraClass) {
  const html = ratingChitHtml(inner, ariaLabel);
  if (!html || !extraClass) {
    return html;
  }
  return html.replace(
    'class="rating-chit card-body-ratings"',
    `class="rating-chit card-body-ratings ${extraClass}"`,
  );
}

function friendRatingValues(movieId) {
  const record = movieById.get(movieId) ?? localMovieRecord(movieId);
  const friendRating = friendViewState?.ratings
    ? appRatings.getRating(friendViewState.ratings, movieId)
    : null;
  const themText = friendRating != null ? appRatings.formatUserRating(friendRating) : "-";
  const myRating = appRatings.getRating(userState.ratings, movieId);
  const mineText = myRating != null ? appRatings.formatUserRating(myRating) : "-";
  const fanLabel = record ? appCardHtml.formatRating(record.voteAverage) : "";
  const fanText = fanLabel || "-";
  return { friendRating, themText, mineText, fanLabel, fanText };
}

function friendActiveRatingSegmentKind() {
  const field = appSort.getSortField(userState.preferences.sort);
  if (field === "user-rating") {
    return "mine";
  }
  if (field === "friend-rating") {
    return "them";
  }
  if (field === "rating") {
    return "fan";
  }
  return null;
}

function friendRatingChitFullHtml(movieId) {
  const { friendRating, themText, mineText, fanLabel, fanText } = friendRatingValues(movieId);
  const showFan = friendViewShowsFanRatings();
  const ariaLabel = showFan
    ? `Ratings friend ${themText}, yours ${mineText}, fan ${fanText}`
    : `Ratings friend ${themText}, yours ${mineText}`;
  const fanSegment = showFan ? friendRatingSegmentHtml("fan", fanText, !fanLabel) : "";
  return friendRatingChitClassHtml(
    `${friendRatingSegmentHtml("them", themText, friendRating == null)}${friendRatingSegmentHtml("mine", mineText, false)}${fanSegment}`,
    ariaLabel,
    "rating-chit--all",
  );
}

function friendRatingChitSortHtml(movieId) {
  const kind = friendActiveRatingSegmentKind();
  if (!kind || (kind === "fan" && !friendViewShowsFanRatings())) {
    return "";
  }
  const { friendRating, themText, mineText, fanLabel, fanText } = friendRatingValues(movieId);
  const labels = {
    them: "Friend rating",
    mine: "Your rating",
    fan: "Fan rating",
  };
  let segment = "";
  if (kind === "them") {
    segment = friendRatingSegmentHtml("them", themText, friendRating == null);
  } else if (kind === "mine") {
    segment = friendRatingSegmentHtml("mine", mineText, false);
  } else {
    segment = friendRatingSegmentHtml("fan", fanText, !fanLabel);
  }
  const value = kind === "them" ? themText : kind === "mine" ? mineText : fanText;
  return friendRatingChitClassHtml(segment, `${labels[kind]} ${value}`, "rating-chit--sort");
}

function friendRatingChitHtml(movieId) {
  const sortChit = friendRatingChitSortHtml(movieId);
  const fullChit = friendRatingChitFullHtml(movieId);
  return `${sortChit}${fullChit}`;
}

function friendIsRatingSortField(field) {
  return field === "user-rating" || field === "friend-rating" || field === "rating";
}

function friendShowsRatingChit() {
  const field = appSort.getSortField(userState.preferences.sort);
  return (
    friendIsRatingSortField(field) ||
    field === "custom" ||
    field === "title" ||
    field === "added"
  );
}

function friendReleaseYearFooterHtml(movieId) {
  const record = movieById.get(movieId) ?? localMovieRecord(movieId);
  const year = record ? appCardHtml.formatYear(record.releaseDate) : "";
  const text = year || "—";
  const emptyClass = year ? "" : " is-empty";
  return `<span class="card-footer-main${emptyClass}" aria-label="Release year ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function friendSortFooterContentHtml(movieId) {
  if (friendShowsRatingChit()) {
    return friendRatingChitHtml(movieId);
  }
  const field = appSort.getSortField(userState.preferences.sort);
  if (field === "year") {
    return friendReleaseYearFooterHtml(movieId);
  }
  if (field === "watched") {
    return cardWatchDateFooterHtml(movieId);
  }
  return friendRatingChitHtml(movieId);
}

function friendCardDetailTrailingHtml(movieId) {
  return friendRatingChitHtml(movieId);
}

function friendCardFooterHtml(movieId) {
  if (gridViewMode !== "cards") {
    return "";
  }
  const content = friendSortFooterContentHtml(movieId);
  if (!content) {
    return "";
  }
  if (friendShowsRatingChit()) {
    return `<div class="card-footer card-footer--friend">${content}</div>`;
  }
  return `<div class="card-footer card-footer--sort card-footer--friend"><div class="card-footer-sort">${content}</div></div>`;
}

function friendCardInnerHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = posterPlaceholderHtml(null, { error: failed });
    return `${posterWrapOpen(movieId)}${body}</div>${friendCardFooterHtml(movieId)}`;
  }
  if (gridViewMode === "cards") {
    return `${posterWrapOpen(movieId)}${posterHtml(record, appTmdb.POSTER_SIZES.card)}</div>${friendCardFooterHtml(movieId)}`;
  }
  const ratings = friendCardDetailTrailingHtml(movieId);
  return `${posterWrapOpen(movieId)}
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta-row"><div class="card-meta">${cardMetaHtml(record)}</div>${ratings}</div>
  </div>
</div>`;
}

function friendMovieHighlightSeen(movieId) {
  if (!isFriendViewActive()) {
    return false;
  }
  const watchedSection = friendViewSections.find((entry) => entry.id === appLists.WATCHED_ID);
  if (!watchedSection || !watchedSection.movieIds.includes(movieId)) {
    return false;
  }
  return appLists.isWatched(userState.lists, movieId);
}

function friendRowInnerHtml(movieId) {
  const record = movieById.get(movieId);
  const stateClass = record
    ? ""
    : movieErrors.has(movieId)
      ? " is-error"
      : " is-skeleton";
  const seenClass = friendMovieHighlightSeen(movieId) ? " is-seen-by-you" : "";
  const title = record ? appCardHtml.escapeHtml(record.title) : `Movie ${movieId}`;
  return `<article class="card card--friend${stateClass}${seenClass}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${friendCardInnerHtml(movieId)}
</article>`;
}

function friendMovieRowHtml(movieId) {
  return `<div class="movie-row movie-row--card" data-movie-id="${movieId}">${friendRowInnerHtml(movieId)}</div>`;
}

function friendRatingLegendChitHtml() {
  const showFan = friendViewShowsFanRatings();
  const fanSegment = showFan
    ? ratingSegmentHtml("fan", "6.2", false)
    : "";
  return `<div class="rating-chit rating-chit--legend" aria-hidden="true">
        ${ratingSegmentHtml("them", "8.0", false)}
        ${ratingSegmentHtml("mine", "7.5", false)}
        ${fanSegment}
      </div>`;
}

function friendRatingLegendText() {
  return friendViewShowsFanRatings() ? "Friend · Yours · Fan" : "Friend · Yours";
}

function friendRatingLegendHtml() {
  const showFan = friendViewShowsFanRatings();
  return `<div class="friend-view-rating-legend" aria-label="Rating legend">
    <div class="friend-view-rating-legend-main">
      <span class="friend-view-rating-legend-label">Ratings</span>
      <div class="friend-view-rating-legend-row">
        ${friendRatingLegendChitHtml()}
        <span class="friend-view-rating-legend-text">${friendRatingLegendText()}</span>
      </div>
    </div>
    <label class="friend-fan-ratings-toggle" for="friend-fan-ratings-toggle">
      <span class="friend-fan-ratings-toggle-label">Fan ratings</span>
      <span class="toggle-switch">
        <input
          type="checkbox"
          id="friend-fan-ratings-toggle"
          aria-label="Show fan ratings"
          ${showFan ? "checked" : ""}
        />
        <span class="toggle-switch-track" aria-hidden="true"></span>
      </span>
    </label>
  </div>`;
}

function setFriendFanRatings(enabled) {
  if (!userState) {
    return;
  }
  const next = enabled === true;
  if (next === friendViewShowsFanRatings()) {
    return;
  }
  userState = {
    ...userState,
    preferences: {
      ...userState.preferences,
      friendFanRatings: next,
    },
  };
  persistUserState();
  syncFriendFanRatingsUi();
}

function syncFriendFanRatingsUi() {
  const showFan = friendViewShowsFanRatings();
  if (settingsFriendFanRatingsToggle) {
    settingsFriendFanRatingsToggle.checked = showFan;
  }
  if (!isFriendViewActive()) {
    return;
  }
  renderFriendView();
  if (detailMovieId != null) {
    renderDetail();
  }
}

function toggleFriendFanRatings() {
  setFriendFanRatings(!friendViewShowsFanRatings());
}

function friendOverviewHtml(stats, name) {
  const safeName = appCardHtml.escapeHtml(name || "Friend");
  return `<div class="friend-view-hero">
    <h2 class="friend-view-name">${safeName}'s collection</h2>
    <p class="friend-view-lead">${stats.totalMovies} ${stats.totalMovies === 1 ? "movie" : "movies"} across ${stats.sectionCount} ${stats.sectionCount === 1 ? "list" : "lists"}</p>
  </div>
  <dl class="friend-view-stats">
    <div class="friend-view-stat"><dt>Watched</dt><dd>${stats.watchedCount}</dd></div>
    <div class="friend-view-stat"><dt>Watchlist</dt><dd>${stats.watchlistCount}</dd></div>
    <div class="friend-view-stat"><dt>Custom lists</dt><dd>${stats.customListCount}</dd></div>
    <div class="friend-view-stat"><dt>Rated</dt><dd>${stats.ratedCount}</dd></div>
  </dl>
  ${friendRatingLegendHtml()}`;
}

function friendViewSortRuntime() {
  return {
    getRecord: (id) => movieById.get(id) ?? localMovieRecord(id),
    sortMode: userState.preferences.sort,
  };
}

function friendViewNavigationOptions() {
  return {
    sortMode: userState.preferences.sort,
    viewerState: userState,
    friendState: friendViewState,
    runtimeContext: friendViewSortRuntime(),
  };
}

function friendDisplayIdsForSection(section) {
  return appFriendView.friendSectionSortedIds(
    section,
    userState.preferences.sort,
    userState,
    friendViewState,
    friendViewSortRuntime(),
  );
}

function friendWatchedOverlapHtml(stats) {
  if (!stats || stats.overlapWatched <= 0) {
    return "";
  }
  return `<span class="friend-view-list-overlap">${stats.overlapWatched} in common</span>`;
}

function friendSectionHtml(section, stats) {
  const isWatched = section.id === appLists.WATCHED_ID;
  const overlapHtml = isWatched ? friendWatchedOverlapHtml(stats) : "";
  const barClass = overlapHtml ? " friend-view-list-bar--has-overlap" : "";
  const collapsed = friendViewCollapsedSections.has(section.id);
  const bodyId = `friend-section-body-${section.id}`;
  const displayIds = friendDisplayIdsForSection(section);
  const rows = displayIds.map((id) => friendMovieRowHtml(id)).join("");
  return `<section class="friend-view-section" id="friend-section-${appCardHtml.escapeHtml(section.id)}" data-friend-section-id="${appCardHtml.escapeHtml(section.id)}">
    <div class="friend-view-list-card${collapsed ? " is-collapsed" : ""}">
      <div class="friend-view-list-bar${barClass}">
        <button
          type="button"
          class="friend-view-list-toggle"
          aria-expanded="${collapsed ? "false" : "true"}"
          aria-controls="${appCardHtml.escapeHtml(bodyId)}"
        >
          <span class="friend-view-list-chevron" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
              <path d="M7.5 5 12.5 10 7.5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="friend-view-list-title">${appCardHtml.escapeHtml(section.name)}</span>
          <span class="friend-view-list-count">${displayIds.length}</span>
        </button>
        ${overlapHtml}
      </div>
      <div class="friend-view-list-body" id="${appCardHtml.escapeHtml(bodyId)}">
        <div class="grid friend-view-grid">${rows}</div>
      </div>
    </div>
  </section>`;
}

function syncFriendSectionCollapse(sectionId) {
  const section = friendViewSectionsEl?.querySelector(
    `[data-friend-section-id="${CSS.escape(String(sectionId))}"]`,
  );
  if (!section) {
    return;
  }
  const collapsed = friendViewCollapsedSections.has(sectionId);
  section.querySelector(".friend-view-list-card")?.classList.toggle("is-collapsed", collapsed);
  const toggle = section.querySelector(".friend-view-list-toggle");
  if (toggle) {
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
}

function toggleFriendSectionCollapse(sectionId) {
  if (friendViewCollapsedSections.has(sectionId)) {
    friendViewCollapsedSections.delete(sectionId);
  } else {
    friendViewCollapsedSections.add(sectionId);
  }
  syncFriendSectionCollapse(sectionId);
}

function clearFriendViewState() {
  activeFriendId = null;
  friendViewName = "";
  friendViewState = null;
  friendViewSections = [];
  friendViewLoadedId = null;
  friendViewError = null;
  friendViewLoading = false;
  friendViewCollapsedSections.clear();
}

function navigateToFriendView(userId, name, options = {}) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }
  closeDetail({ popHistory: false });
  if (typeof closeSettings === "function" && !settingsDialog.hidden) {
    closeSettings();
  }
  appView = "friend";
  activeCustomListId = null;
  activeFriendId = id;
  friendViewName = String(name || "Friend").trim() || "Friend";
  friendViewState = null;
  friendViewSections = [];
  friendViewLoadedId = null;
  friendViewError = null;
  friendViewLoading = true;
  if (options.pushHistory !== false) {
    history.pushState(
      { appView: "friend", activeFriendId: id, friendViewName },
      "",
      appFriendView.buildFriendHash(id),
    );
    markProgrammaticLocation();
  }
  syncAppViewChrome();
  loadFriendView(id);
}

function navigateFromFriendView(options = {}) {
  navigateToFriendsIndex(options);
}

async function loadFriendView(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0 || activeFriendId !== id) {
    return;
  }
  friendViewLoading = true;
  friendViewError = null;
  renderFriendView();
  try {
    const state = await fetchFriendState(id);
    if (activeFriendId !== id) {
      return;
    }
    friendViewState = state;
    friendViewSections = state ? appFriendView.friendListSections(state) : [];
    friendViewLoadedId = id;
    friendViewLoading = false;
    friendViewError = null;
    renderFriendView();
    hydrateFriendView();
  } catch (error) {
    if (activeFriendId !== id) {
      return;
    }
    friendViewLoading = false;
    friendViewError = error?.message || "Could not load their lists.";
    friendViewState = null;
    friendViewSections = [];
    renderFriendView();
  }
}

function hydrateFriendView() {
  const ids = appFriendView.friendNavigationIds(
    friendViewSections,
    null,
    friendViewNavigationOptions(),
  );
  if (!ids.length) {
    return;
  }
  hydrateMovies(ids, {
    onRecord: applyFriendHydratedRecord,
    onUpdate: applyFriendHydratedRecord,
  });
}

function applyFriendHydratedRecord(movieId) {
  if (!isFriendViewActive()) {
    return;
  }
  const rows = friendViewSectionsEl?.querySelectorAll(`.movie-row[data-movie-id="${movieId}"]`);
  if (rows?.length) {
    for (const row of rows) {
      row.innerHTML = friendRowInnerHtml(movieId);
    }
    bindPosterImages(friendViewSectionsEl);
  }
  if (detailMovieId === movieId) {
    renderDetail();
  }
  if (typeof scheduleResortAfterHydration === "function") {
    scheduleResortAfterHydration();
  }
}

function renderFriendView() {
  if (!friendViewOverview || !friendViewSectionsEl) {
    return;
  }
  syncAppViewChrome();
  if (friendViewLoading) {
    friendViewOverview.innerHTML = '<p class="friend-view-message">Loading…</p>';
    friendViewSectionsEl.innerHTML = "";
    return;
  }
  if (friendViewError) {
    friendViewOverview.innerHTML = `<p class="friend-view-message friend-view-message--error">${appCardHtml.escapeHtml(friendViewError)}</p>`;
    friendViewSectionsEl.innerHTML = "";
    return;
  }
  if (!friendViewState) {
    friendViewOverview.innerHTML =
      '<p class="friend-view-message">They have not synced any lists yet.</p>';
    friendViewSectionsEl.innerHTML = "";
    return;
  }
  if (!friendViewSections.length) {
    friendViewOverview.innerHTML = `<p class="friend-view-message">${appCardHtml.escapeHtml(friendViewName)}'s lists are empty so far.</p>`;
    friendViewSectionsEl.innerHTML = "";
    return;
  }
  const stats = appFriendView.friendOverviewStats(friendViewState, userState);
  friendViewOverview.innerHTML = friendOverviewHtml(stats, friendViewName);
  friendViewSectionsEl.innerHTML = friendViewSections
    .map((section) => friendSectionHtml(section, stats))
    .join("");
  bindPosterImages(friendViewSectionsEl);
  syncSortControlUi();
}

function friendDetailNoteHtml(movieId) {
  if (!isFriendViewActive() || !friendViewState) {
    return "";
  }
  const friendRating = friendViewState.ratings
    ? appRatings.getRating(friendViewState.ratings, movieId)
    : null;
  const ratingText =
    friendRating != null ? appRatings.formatUserRating(friendRating) : "-";
  return `<div class="friend-detail-note">
    <span class="friend-detail-note-label">Friend rating</span>
    ${friendRatingSegmentHtml("them", ratingText, friendRating == null)}
  </div>`;
}

function onFriendFanRatingsToggleChange(event) {
  if (event.target.id === "friend-fan-ratings-toggle") {
    if (isFriendViewActive()) {
      setFriendFanRatings(event.target.checked);
    }
    return;
  }
  if (event.target.id === "settings-friend-fan-ratings") {
    setFriendFanRatings(event.target.checked);
  }
}

function onFriendViewSectionsClick(event) {
  if (!isFriendViewActive()) {
    return;
  }
  const toggle = event.target.closest(".friend-view-list-toggle");
  if (toggle && friendViewSectionsEl?.contains(toggle)) {
    const sectionId = toggle.closest("[data-friend-section-id]")?.dataset.friendSectionId;
    if (sectionId) {
      toggleFriendSectionCollapse(sectionId);
    }
    return;
  }
  const card = event.target.closest(".card[data-movie-id]");
  if (!card || !friendViewSectionsEl?.contains(card)) {
    return;
  }
  openDetail(Number(card.dataset.movieId));
}

function onFriendViewSectionsKeydown(event) {
  if (!isFriendViewActive() || event.key !== "Enter") {
    return;
  }
  const card = event.target.closest(".card[data-movie-id]");
  if (!card || !friendViewSectionsEl?.contains(card)) {
    return;
  }
  event.preventDefault();
  openDetail(Number(card.dataset.movieId));
}

/* ===== Friends index page ===== */

/**
 * Friends index page (#friends): compact roster and add-friend form.
 */

function renderFriendsIndex() {
  if (!isFriendsIndexActive()) {
    return;
  }
  syncAppViewChrome();
  refreshAccountSection();
  if (accountSyncEnabled()) {
    refreshFriendsList();
  }
  if (friendsIndexEmptyEl) {
    friendsIndexEmptyEl.hidden = !accountSyncEnabled();
  }
}

function onFriendsInviteSubmit(event) {
  event.preventDefault();
  onAddFriend();
}

function navigateToFriendsIndex(options = {}) {
  closeDetail({ popHistory: false });
  if (typeof closeSettings === "function" && !settingsDialog.hidden) {
    closeSettings();
  }
  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
  appView = "friendsIndex";
  activeCustomListId = null;
  if (options.pushHistory !== false) {
    history.pushState({ appView: "friendsIndex" }, "", appFriendView.buildFriendsIndexHash());
    markProgrammaticLocation();
  }
  renderFriendsIndex();
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

discoverEntryBtn?.addEventListener("click", openDiscover);
friendsEntryBtn?.addEventListener("click", () => {
  navigateToFriendsIndex();
});

discoverTabs?.addEventListener("click", onDiscoverTabClick);
discoverPrevBtn?.addEventListener("click", onDiscoverPrevClick);
discoverNextBtn?.addEventListener("click", onDiscoverNextClick);
discoverPrevBottomBtn?.addEventListener("click", onDiscoverPrevClick);
discoverNextBottomBtn?.addEventListener("click", onDiscoverNextClick);

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
addMoviePresetChips?.addEventListener("click", onAddListOptionClick);
addMovieSubmit.addEventListener("click", confirmAddMovie);
bindRangeSliderLiveInput(addMovieRatingSlider, onAddMovieRatingSliderInput);
addMovieRatingSelect?.addEventListener("change", onAddMovieRatingSelectChange);
addMovieRatingClear?.addEventListener("click", clearAddMovieRating);
addMovieWatchDateToggle?.addEventListener("click", onAddMovieWatchDateToggleClick);
addMovieWatchDateClear?.addEventListener("click", clearAddMovieWatchDate);

/* --- Grid --- */

grid.addEventListener("click", (event) => {
  const discoverPresetBtn = event.target.closest("[data-discover-preset-id]");
  if (discoverPresetBtn && isDiscoverActive()) {
    event.stopPropagation();
    const movieId = Number(discoverPresetBtn.closest("[data-movie-id]")?.dataset.movieId);
    if (Number.isInteger(movieId) && movieId > 0) {
      requestDiscoverPresetMembership(discoverPresetBtn.dataset.discoverPresetId, movieId);
    }
    return;
  }
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
  if (isLayoutLockedToDetail()) {
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

detailCloseBtn.addEventListener("click", () => dismissDetailOverlay());
movieShareCloseBtn?.addEventListener("click", closeMovieShareDialog);
movieShareCopyBtn?.addEventListener("click", () => copyMovieShareUrl());
movieShareDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-movie-share")) {
    closeMovieShareDialog();
  }
});
movieShareUrlInput?.addEventListener("focus", () => movieShareUrlInput.select());
detailPrevBtn.addEventListener("click", () => stepDetail(-1));
detailNextBtn.addEventListener("click", () => stepDetail(1));
detailDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-detail")) {
    dismissDetailOverlay();
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
  const detailBodyTabBtn = event.target.closest("[data-detail-body-tab]");
  if (detailBodyTabBtn) {
    setDetailBodyTab(detailBodyTabBtn.dataset.detailBodyTab);
    return;
  }
  if (event.target.closest("#detail-remap-open-search")) {
    openDetailConfigSearch();
    return;
  }
  const remapResult = event.target.closest("[data-detail-remap-result-id]");
  if (remapResult) {
    selectDetailRemapCandidate(remapResult.dataset.detailRemapResultId);
    return;
  }
  if (event.target.closest("#detail-remap-confirm")) {
    confirmDetailRemap();
    return;
  }
  if (event.target.closest("#detail-viewing-add")) {
    addDetailViewing();
    return;
  }
  const removeViewingBtn = event.target.closest("[data-viewing-remove-id]");
  if (removeViewingBtn) {
    requestRemoveDetailViewing(removeViewingBtn.dataset.viewingRemoveId);
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
  if (event.target.closest("#detail-add-submit")) {
    confirmDetailAddMovie();
    return;
  }
  const addListOption = event.target.closest("[data-detail-add-list-id]");
  if (addListOption) {
    onDetailAddListOptionClick(addListOption.dataset.detailAddListId);
    return;
  }
  const addCustomListChip = event.target.closest("[data-detail-add-custom-list-id]");
  if (addCustomListChip) {
    onDetailAddCustomListClick(addCustomListChip.dataset.detailAddCustomListId);
    return;
  }
  if (event.target.closest("#detail-add-watch-date-toggle")) {
    onDetailAddWatchDateToggleClick();
    return;
  }
  if (event.target.closest("#detail-add-watch-date-clear")) {
    clearDetailAddWatchDate();
    return;
  }
  if (event.target.closest("#detail-add-rating-clear")) {
    clearDetailAddRating();
    return;
  }
  if (event.target.closest("#movie-detail-share")) {
    openMovieShareDialog();
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
detailDialog.addEventListener("input", onDetailRemapQueryInput);
detailDialog.addEventListener("input", (event) => {
  if (event.target.id === "detail-add-watch-date") {
    detailAddWatchDate = event.target.value;
  }
});
detailConfigSearchClose?.addEventListener("click", closeDetailConfigSearch);
detailConfigSearchDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-detail-config-search")) {
    closeDetailConfigSearch();
    return;
  }
  const remapResult = event.target.closest("[data-detail-remap-result-id]");
  if (remapResult) {
    selectDetailRemapCandidate(remapResult.dataset.detailRemapResultId);
  }
});
detailConfigSearchDialog?.addEventListener("input", onDetailRemapQueryInput);
detailScroll?.addEventListener("scroll", positionDetailConfigResults, { passive: true });
window.addEventListener("resize", positionDetailConfigResults);
window.matchMedia("(max-width: 640px)").addEventListener("change", () => {
  if (!detailConfigSearchUsesOverlay()) {
    closeDetailConfigSearch();
  }
  if (detailMovieId != null && detailBodyTab === "config") {
    renderDetail();
  }
});
delegateRangeSliderLiveInput(detailDialog, "detail-rating-slider", onDetailRatingSliderInput);
delegateRangeSliderLiveInput(detailDialog, "detail-add-rating-slider", onDetailAddRatingSliderInput);
detailDialog.addEventListener("change", (event) => {
  if (event.target.id === "detail-rating-slider") {
    commitDetailRating();
    return;
  }
  if (event.target.id === "detail-rating-select") {
    onDetailRatingSelectChange(event);
    commitDetailRating();
    return;
  }
  if (event.target.id === "detail-add-rating-select") {
    onDetailAddRatingSelectChange();
    return;
  }
  if (event.target.id === "detail-add-watch-date") {
    detailAddWatchDate = event.target.value;
  }
});
detailActions.addEventListener("click", (event) => {
  const discoverPresetBtn = event.target.closest("[data-discover-preset-id]");
  if (discoverPresetBtn) {
    requestDiscoverDetailPreset(discoverPresetBtn.dataset.discoverPresetId);
    return;
  }
  if (event.target.closest("#detail-remove-from-list")) {
    requestRemoveFromCustomList(detailMovieId);
    return;
  }
  if (event.target.closest("#detail-remove")) {
    requestRemoveMovie(detailMovieId);
    return;
  }
  if (event.target.closest("#detail-watch")) {
    requestWatchMovie(detailMovieId);
    return;
  }
});

watchConfirmCancel.addEventListener("click", () => closeWatchConfirm());
watchConfirmOk.addEventListener("click", () => confirmWatchMovie());
bindRangeSliderLiveInput(watchConfirmRatingSlider, onWatchConfirmRatingSliderInput);
watchConfirmRatingSelect?.addEventListener("change", onWatchConfirmRatingSelectChange);
watchConfirmRatingClear?.addEventListener("click", clearWatchConfirmRating);
watchConfirmDateToggle?.addEventListener("click", onWatchConfirmDateToggleClick);
watchConfirmDateClear?.addEventListener("click", clearWatchConfirmWatchDate);
watchConfirmDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-watch-confirm")) {
    closeWatchConfirm();
  }
});

discoverAddConfirmCancel.addEventListener("click", () => closeDiscoverAddConfirm());
discoverAddConfirmOk.addEventListener("click", () => confirmDiscoverPresetAdd());
discoverAddConfirmDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-discover-add-confirm")) {
    closeDiscoverAddConfirm();
  }
});

removeConfirmCancel.addEventListener("click", () => closeRemoveConfirm());
removeConfirmOk.addEventListener("click", () => confirmRemoveMovie());
removeConfirmDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-remove-confirm")) {
    closeRemoveConfirm();
  }
});
viewingRemoveConfirmCancel.addEventListener("click", () => closeViewingRemoveConfirm());
viewingRemoveConfirmOk.addEventListener("click", () => confirmRemoveDetailViewing());
viewingRemoveConfirmDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-viewing-remove-confirm")) {
    closeViewingRemoveConfirm();
  }
});

let lastLocationNavigationKey = null;
let ignoreHashChange = false;

function markProgrammaticLocation() {
  lastLocationNavigationKey = window.location.href;
  ignoreHashChange = true;
  window.setTimeout(() => {
    ignoreHashChange = false;
  }, 50);
}

function onLocationNavigation(event) {
  if (event?.type === "hashchange" && ignoreHashChange) {
    lastLocationNavigationKey = window.location.href;
    return;
  }
  const fromPopState = event?.type === "popstate";
  if (fromPopState) {
    ignoreHashChange = true;
    window.setTimeout(() => {
      ignoreHashChange = false;
    }, 50);
  } else if (window.location.href === lastLocationNavigationKey) {
    return;
  }
  lastLocationNavigationKey = window.location.href;
  syncViewFromLocation({ fromPopState });
}

window.addEventListener("popstate", onLocationNavigation);
window.addEventListener("hashchange", onLocationNavigation);

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
friendRemoveConfirmCancel?.addEventListener("click", closeFriendRemoveConfirm);
friendRemoveConfirmOk?.addEventListener("click", () => {
  confirmRemoveFriend();
});
friendRemoveConfirmDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-friend-remove-confirm")) {
    closeFriendRemoveConfirm();
  }
});
customListBackBtn?.addEventListener("click", () => {
  if (isFriendViewActive()) {
    navigateFromFriendView();
  } else if (isFriendsIndexActive()) {
    navigateToMain();
  } else if (isDiscoverActive()) {
    navigateToMain();
  } else if (isCustomListIndexActive()) {
    navigateToMain();
  } else {
    navigateToCustomListsIndex();
  }
});
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
settingsTabAccount.addEventListener("click", () => setSettingsTab("account"));
settingsTabConfig.addEventListener("click", () => setSettingsTab("config"));
settingsDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-settings")) {
    closeSettings();
  }
});
cacheClearBtn.addEventListener("click", onClearCache);
settingsFriendFanRatingsToggle?.addEventListener("change", onFriendFanRatingsToggleChange);
exportCsvBtn.addEventListener("click", onExportCsv);
collectionImportRead?.addEventListener("click", onReviewCollectionImport);
collectionImportFile?.addEventListener("change", syncCollectionImportFileLabel);
collectionImportOk?.addEventListener("click", onConfirmCollectionImport);
collectionImportCancel?.addEventListener("click", closeCollectionImportConfirm);
collectionImportDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-collection-import")) closeCollectionImportConfirm();
});
accountAuthTabLogin.addEventListener("click", () => setAccountAuthMode("login"));
accountAuthTabSignup.addEventListener("click", () => setAccountAuthMode("signup"));
accountSubmitBtn.addEventListener("click", onAccountAuth);
accountPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    onAccountAuth();
  }
});
accountLogoutBtn.addEventListener("click", onAccountLogout);
accountDeleteBtn.addEventListener("click", openAccountDeleteConfirm);
accountDeleteCancel.addEventListener("click", closeAccountDeleteConfirm);
accountDeleteOk.addEventListener("click", onAccountDeleteConfirm);
accountDeleteDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-account-delete")) {
    closeAccountDeleteConfirm();
  }
});
accountDeletePassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    onAccountDeleteConfirm();
  }
});
friendAddBtn?.addEventListener("click", onAddFriend);
document.getElementById("friends-invite-form")?.addEventListener("submit", onFriendsInviteSubmit);
document.getElementById("friends-signin-btn")?.addEventListener("click", openSettings);
friendsList?.addEventListener("click", onFriendsListClick);
friendViewOverview?.addEventListener("change", onFriendFanRatingsToggleChange);
friendViewSectionsEl?.addEventListener("click", onFriendViewSectionsClick);
friendViewSectionsEl?.addEventListener("keydown", onFriendViewSectionsKeydown);

aboutBtn.addEventListener("click", openAbout);
aboutClose.addEventListener("click", closeAbout);
aboutDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-about")) {
    closeAbout();
  }
});

/* --- Logo: single click home --- */

headerLogo.addEventListener("click", () => {
  navigateHomeToWatched();
});

/* --- Global keys --- */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!collectionImportDialog.hidden) {
      closeCollectionImportConfirm();
      return;
    }
    if (!customListDeleteDialog.hidden) {
      closeCustomListDeleteConfirm();
      return;
    }
    if (!viewingRemoveConfirmDialog.hidden) {
      closeViewingRemoveConfirm();
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
    if (!discoverAddConfirmDialog.hidden) {
      closeDiscoverAddConfirm();
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
    if (detailConfigSearchDialog && !detailConfigSearchDialog.hidden) {
      closeDetailConfigSearch();
      return;
    }
    if (movieShareDialog && !movieShareDialog.hidden) {
      closeMovieShareDialog();
      return;
    }
    if (detailMovieId != null) {
      if (detailRatingEditorOpen) {
        cancelDetailRatingEditor();
        return;
      }
      dismissDetailOverlay();
    }
    return;
  }

  if (detailMovieId == null || event.target === searchInput || event.target === detailConfigSearchQuery) {
    return;
  }
  if (isDetailConfigSearchOpen()) {
    return;
  }
  if (movieShareDialog && !movieShareDialog.hidden) {
    return;
  }
  if (event.target.closest("#detail-add-block")) {
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
  loadAccountConfig();
  loadUserState();
  syncCustomListIndexSortFromState();
  refreshViewModeForActiveList();
  updateSearchClearVisibility();
  syncAccountLoginGate();

  // One static file, read before the first paint. When it covers the list that
  // paint shows real cards instead of skeletons, which is the whole point.
  await loadLocalPosterData();

  try {
    history.scrollRestoration = "manual";
  } catch (_) {
    /* Older browsers may not expose scrollRestoration. */
  }

  syncViewFromLocation();
  lastLocationNavigationKey = window.location.href;

  // Reconcile on startup when logged in so this tab picks up remote changes.
  if (accountSyncEnabled()) {
    queueAccountSync();
  }

  if (!accountSyncEnabled()) {
    openSettings();
  }
}

startApp();
})();
