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
addMovieFavouriteToggle.addEventListener("click", onAddMovieFavouriteToggleClick);
addMovieSubmit.addEventListener("click", confirmAddMovie);
initAddMovieRatingSelect();
bindRangeSliderLiveInput(addMovieRatingSlider, onAddMovieRatingSliderInput);
addMovieRatingSelect?.addEventListener("change", onAddMovieRatingSelectChange);
addMovieRatingClear?.addEventListener("click", clearAddMovieRating);

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

viewModeCycleBtn.addEventListener("click", () => {
  setViewMode(nextViewMode(gridViewMode));
  persistUserState();
  render();
});
reorderModeBtn?.addEventListener("click", toggleReorderMode);

/* --- Detail overlay --- */

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
