(function () {
  "use strict";

/* Opens the shared IIFE scope for every partial. Closed by 08-init.js. */

const ACCOUNT_LOGIN_HINT =
  "Sign in via Settings → Account to search TMDB and sync your lists.";

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

const friendViewDialog = document.getElementById("friend-view-dialog");
const friendViewTitle = document.getElementById("friend-view-title");
const friendViewContent = document.getElementById("friend-view-content");
const friendViewClose = document.getElementById("friend-view-close");

const cacheClearBtn = document.getElementById("cache-clear");
const cacheStatus = document.getElementById("cache-status");
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
let tmdbCredential = "";

/** "main" | "customIndex" | "customDetail" | "discover" */
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
