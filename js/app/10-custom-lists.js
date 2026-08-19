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
  return false;
}

function syncAppViewChrome() {
  document.body.classList.toggle("view-custom-index", isCustomListIndexActive());
  document.body.classList.toggle("view-custom-detail", isCustomListDetailActive());
  document.body.classList.toggle("view-discover", isDiscoverActive());
  if (customListsIndex) {
    customListsIndex.hidden = !isCustomListIndexActive();
  }
  if (listTabs) {
    listTabs.hidden = isCustomListView() || isDiscoverActive();
  }
  if (discoverTabs) {
    discoverTabs.hidden = !isDiscoverActive();
  }
  if (discoverEntryBtn) {
    discoverEntryBtn.hidden = isCustomListView() || isDiscoverActive();
  }
  if (listsNavBtn) {
    listsNavBtn.hidden = isCustomListView() || isDiscoverActive();
  }
  if (customListBackBtn) {
    customListBackBtn.hidden = !isCustomListView() && !isDiscoverActive();
  }
  if (customListBackLabel) {
    if (isDiscoverActive()) {
      customListBackLabel.textContent = "Collection";
    } else {
      customListBackLabel.textContent = isCustomListIndexActive() ? "Collection" : "All lists";
    }
  }
  if (customListsIndexActions) {
    customListsIndexActions.hidden = !isCustomListIndexActive();
  }
  if (addMovieFab) {
    addMovieFab.hidden = isCustomListIndexActive() || isDiscoverActive();
  }
  updateListHeader();
  syncListSearchVisibility();
  syncReorderModeUi();
}

function navigateToMain(options = {}) {
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
      if (state.discoverTab) {
        discoverTab = appDiscover.normalizeDiscoverTab(state.discoverTab);
      }
      if (state.discoverPage) {
        discoverPage = appDiscover.normalizeDiscoverPage(state.discoverPage);
      }
    } else if (!applyRestoredViewContext(readViewRestoreContext())) {
      if (!isCustomListView() && !isDiscoverActive()) {
        appView = "main";
        activeCustomListId = null;
      }
    }
    syncAppViewChrome();
    refreshViewModeForActiveList();
    if (isCustomListIndexActive()) {
      renderCustomListsIndex();
    } else if (isDiscoverActive()) {
      const needsLoad =
        !discoverMovieIds.length && !discoverLoading && !discoverLoadError;
      if (needsLoad) {
        loadDiscoverTab(discoverTab, { page: discoverPage, pushHistory: false });
      } else {
        renderDiscover();
      }
    } else if (isCustomListDetailActive()) {
      render();
      hydrateActiveList();
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

  if (parsed.kind === "discover") {
    appView = "discover";
    activeCustomListId = null;
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

function pinnedCustomListId() {
  return userState.preferences?.pinnedCustomListId ?? null;
}

function persistPinnedCustomListId(nextPin) {
  userState = {
    ...userState,
    preferences: {
      ...userState.preferences,
      pinnedCustomListId: nextPin,
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
  const coverIds = customListIndexCoverIds(lists);
  primeMovieRecords(coverIds);
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
  const nextPin =
    pinnedCustomListId() === listId
      ? null
      : appCustomLists.normalizePinnedCustomListId(pinnedCustomListId(), customLists);
  userState = {
    ...userState,
    customLists,
    customListTombstones: tombstones,
    preferences: {
      ...userState.preferences,
      pinnedCustomListId: nextPin,
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
