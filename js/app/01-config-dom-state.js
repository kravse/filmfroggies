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
