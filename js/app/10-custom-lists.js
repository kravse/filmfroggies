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
  if (parseAdminHash(hash)) {
    return { kind: "admin" };
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
  refreshFriendsNavFromCache();
}

function syncAppViewChrome() {
  syncSplashUi();
  document.body.classList.toggle("view-custom-index", isCustomListIndexActive());
  document.body.classList.toggle("view-custom-detail", isCustomListDetailActive());
  document.body.classList.toggle("view-discover", isDiscoverActive());
  document.body.classList.toggle("view-friends-index", isFriendsIndexActive());
  document.body.classList.toggle("view-friend", isFriendViewActive());
  document.body.classList.toggle("view-admin", isAdminViewActive());
  if (customListsIndex) {
    customListsIndex.hidden = !isCustomListIndexActive();
  }
  if (friendsIndexEl) {
    friendsIndexEl.hidden = !isFriendsIndexActive();
  }
  if (friendViewEl) {
    friendViewEl.hidden = !isFriendViewActive();
  }
  if (adminPageEl) {
    adminPageEl.hidden = !isAdminViewActive();
  }
  if (grid) {
    grid.hidden = isFriendViewActive() || isFriendsIndexActive() || isAdminViewActive();
  }
  if (listTabs) {
    listTabs.hidden =
      isCustomListView() ||
      isDiscoverActive() ||
      isFriendViewActive() ||
      isFriendsIndexActive() ||
      isAdminViewActive();
  }
  if (discoverTabs) {
    discoverTabs.hidden = !isDiscoverActive();
  }
  if (customListBackBtn) {
    customListBackBtn.hidden =
      !isCustomListView() &&
      !isDiscoverActive() &&
      !isFriendViewActive() &&
      !isFriendsIndexActive() &&
      !isAdminViewActive();
  }
  if (customListBackLabel) {
    if (isFriendViewActive()) {
      customListBackLabel.textContent = "Friends";
    } else if (isFriendsIndexActive() || isDiscoverActive() || isAdminViewActive()) {
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
      isFriendsIndexActive() ||
      isAdminViewActive();
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
  if (parsed.kind === "admin") {
    return appView === "admin";
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
  if (state.appView === "admin") {
    return appView === "admin";
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
  if (isAdminViewActive()) {
    renderAdminView();
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

  if (parsed.kind === "admin") {
    appView = "admin";
    activeCustomListId = null;
    reorderModeActive = false;
    if (typeof clearFriendViewState === "function") {
      clearFriendViewState();
    }
    syncAppViewChrome();
    renderAdminView();
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
