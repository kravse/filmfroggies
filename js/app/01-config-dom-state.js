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
const addMovieRatingSelect = document.getElementById("add-movie-rating-select");
const addMovieRatingClear = document.getElementById("add-movie-rating-clear");
const addMovieRatingValue = document.getElementById("add-movie-rating-value");
const addMovieRatingField = document.getElementById("add-movie-rating-field");
const addMovieWatchedOptions = document.getElementById("add-movie-watched-options");
const addMovieFavouriteToggle = document.getElementById("add-movie-favourite-toggle");
const addMovieBack = document.getElementById("add-movie-back");

const viewModeCycleBtn = document.getElementById("view-mode-cycle");
const reorderModeBtn = document.getElementById("reorder-mode-btn");
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
let reorderModeActive = false;
let detailMovieId = null;
let detailRatingEditorOpen = false;
/** Rating saved when the editor opens; Cancel restores this value. */
let detailRatingEditorSnapshot = null;
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
