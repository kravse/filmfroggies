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
  const removePendingViewingBtn = event.target.closest("[data-viewing-remove-pending-date]");
  if (removePendingViewingBtn) {
    removeDetailPendingViewing(removePendingViewingBtn.dataset.viewingRemovePendingDate);
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
  if (event.target.closest("#detail-add-submit")) {
    saveDetailAddForm();
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
});
detailActions.addEventListener("click", (event) => {
  if (event.target.closest("#detail-preset-remove")) {
    requestDetailPresetRemove(detailMovieId);
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
detailAddDiscardLeave?.addEventListener("click", () => confirmDetailAddDiscard());
detailAddDiscardSave?.addEventListener("click", () => confirmDetailAddSaveAndLeave());
detailAddDiscardDialog?.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-detail-add-discard")) {
    closeDetailAddDiscardConfirm();
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
  } else if (isFriendsIndexActive() || isAdminViewActive()) {
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

/* --- Login, settings, and about --- */

splashEl?.addEventListener("click", onSplashClick);
loginBtn.addEventListener("click", () => openLogin());
loginClose.addEventListener("click", closeLogin);
loginDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-login")) {
    closeLogin();
  }
});
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
accountChangePasswordBtn.addEventListener("click", openAccountPasswordChange);
accountPasswordCancel.addEventListener("click", closeAccountPasswordChange);
accountPasswordOk.addEventListener("click", onAccountPasswordChangeConfirm);
accountPasswordDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-account-password")) {
    closeAccountPasswordChange();
  }
});
accountPasswordConfirm.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    onAccountPasswordChangeConfirm();
  }
});
accountDisplayNameEditBtn.addEventListener("click", openAccountDisplayName);
accountDisplayNameCancel.addEventListener("click", closeAccountDisplayName);
accountDisplayNameOk.addEventListener("click", onAccountDisplayNameConfirm);
accountDisplayNameDialog.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-account-display-name")) {
    closeAccountDisplayName();
  }
});
accountDisplayNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    onAccountDisplayNameConfirm();
  }
});
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
document.getElementById("friends-signin-btn")?.addEventListener("click", () => openLogin());
friendsList?.addEventListener("click", onFriendsListClick);
friendViewOverview?.addEventListener("change", onFriendFanRatingsToggleChange);
friendViewOverview?.addEventListener("click", onFriendViewOverviewClick);
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
    if (detailAddDiscardDialog && !detailAddDiscardDialog.hidden) {
      closeDetailAddDiscardConfirm();
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
    if (
      friendActivityEl &&
      !friendActivityEl.hidden &&
      friendActivityCollapsed &&
      typeof toggleFriendActivity === "function"
    ) {
      toggleFriendActivity();
      return;
    }
    if (!settingsDialog.hidden) {
      closeSettings();
      return;
    }
    if (!loginDialog.hidden) {
      closeLogin();
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
  initFriendActivity();
  syncCustomListIndexSortFromState();
  refreshViewModeForActiveList();
  updateSearchClearVisibility();
  syncAccountLoginGate();

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
    refreshFriendsNavBadge();
    startFriendsNavPolling();
    startFriendActivityPolling();
    refreshFriendActivity();
  }
}

startApp();
})();
