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
