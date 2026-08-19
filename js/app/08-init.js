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
  const detailBodyTabBtn = event.target.closest("[data-detail-body-tab]");
  if (detailBodyTabBtn) {
    setDetailBodyTab(detailBodyTabBtn.dataset.detailBodyTab);
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
customListBackBtn?.addEventListener("click", () => {
  if (isDiscoverActive()) {
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
collectionImportRead?.addEventListener("click", onReviewCollectionImport);
collectionImportFile?.addEventListener("change", syncCollectionImportFileLabel);
collectionImportOk?.addEventListener("click", onConfirmCollectionImport);
collectionImportCancel?.addEventListener("click", closeCollectionImportConfirm);
collectionImportDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-collection-import")) closeCollectionImportConfirm();
});
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
    if (!collectionImportDialog.hidden) {
      closeCollectionImportConfirm();
      return;
    }
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
