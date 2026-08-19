/**
 * Grid rendering. `render()` writes the whole grid from the active list's ids,
 * emitting skeleton cards for anything not hydrated yet; hydration then
 * patches single rows through applyHydratedRecord() rather than re-rendering.
 */

function posterHtml(record, size) {
  const remote = record ? appTmdb.buildImageUrl(record.posterPath, size) : null;
  const local = record ? localPosterUrlFor(record, size) : null;
  const url = local || remote;
  if (!url) {
    const label = record ? appCardHtml.escapeHtml(record.title) : "";
    return `<div class="placeholder">${label}</div>`;
  }
  // A snapshot entry whose file has gone missing retries TMDB rather than
  // leaving a hole where the poster was.
  const fallback =
    local && remote ? ` data-poster-fallback="${appCardHtml.escapeHtml(remote)}"` : "";
  return `<img data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy" decoding="async"${fallback}>`;
}

function cardMetaText(record) {
  const parts = [
    appCardHtml.formatYear(record.releaseDate),
    appCardHtml.formatRuntime(record.runtime),
  ].filter(Boolean);
  return parts.join(" · ");
}

function cardUserRatingHtml(movieId) {
  const label = appRatings.formatUserRating(
    appRatings.getRating(userState.ratings, movieId),
  );
  if (!label) {
    return "";
  }
  return `<span class="card-user-rating" aria-label="Your rating ${appCardHtml.escapeHtml(label)}">${appCardHtml.escapeHtml(label)}</span>`;
}

function isFanRatingSortMode() {
  const sortMode = userState?.preferences.sort;
  return sortMode === "rating-asc" || sortMode === "rating-desc";
}

function isUserRatingSortMode() {
  if (!isWatchedListActive() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "user-rating-asc" || sortMode === "user-rating-desc";
}

function cardUnratedClass(movieId) {
  if (!isUserRatingSortMode()) {
    return "";
  }
  if (appRatings.getRating(userState.ratings, movieId) != null) {
    return "";
  }
  return " is-unrated";
}

function cardFanRatingHtml(movieId) {
  if (!isWatchedListActive() || usesCustomDisplayOrder() || !isFanRatingSortMode()) {
    return "";
  }
  const record = movieById.get(movieId);
  if (!record) {
    return "";
  }
  const label = appCardHtml.formatRating(record.voteAverage);
  const text = label || "—";
  const emptyClass = label ? "" : " is-empty";
  return `<span class="card-fan-rating${emptyClass}" aria-label="Fan rating ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function cardDetailRatingsHtml(movieId) {
  if (gridViewMode !== "detail") {
    return "";
  }
  const fan = cardFanRatingHtml(movieId);
  const user = cardUserRatingHtml(movieId);
  if (!fan && !user) {
    return "";
  }
  return `<div class="card-body-ratings">${fan}${user}</div>`;
}

function cardRemoveIconHtml() {
  return `<svg class="card-remove-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none">
  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
</svg>`;
}

/**
 * Watchlist cards use a dedicated bottom panel: title text, then split actions.
 */
function watchlistCardPanelHtml(movieId) {
  if (userState.activeListId !== appLists.WATCHLIST_ID) {
    return "";
  }
  const record = movieById.get(movieId);
  const title = record ? appCardHtml.escapeHtml(record.title) : "";
  const titleLabel = record ? appCardHtml.escapeHtml(record.title) : "movie";
  return `<div class="watchlist-card-panel">
  <div class="watchlist-card-text"><span class="watchlist-card-title">${title}</span></div>
  <div class="watchlist-card-actions">
    <button type="button" class="watchlist-action-btn watchlist-action-btn--remove card-remove-btn" aria-label="Remove ${titleLabel}" title="Remove movie">${cardRemoveIconHtml()}</button>
    <button type="button" class="watchlist-action-btn watchlist-action-btn--watch card-watch-btn" aria-label="Mark as watched" title="Mark as watched">&#10003;</button>
  </div>
</div>`;
}

function cardSmallFooterYearText(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    return "";
  }
  return appCardHtml.formatYear(record.releaseDate);
}

function cardSmallFooterHtml(movieId) {
  if (gridViewMode !== "cards") {
    return "";
  }

  if (userState.activeListId === appLists.WATCHLIST_ID) {
    const panel = watchlistCardPanelHtml(movieId);
    return panel ? `<div class="card-footer card-footer--watchlist">${panel}</div>` : "";
  }

  let mainClass = "card-footer-main";
  let mainText = "";

  if (isWatchedListActive() && !usesCustomDisplayOrder()) {
    const sortMode = userState.preferences.sort;
    const userRating = appRatings.getRating(userState.ratings, movieId);
    const isUserRatingSort = isUserRatingSortMode();

    if (!isUserRatingSort && !isFanRatingSortMode()) {
      const hint = appSort.formatSortCardHint(sortMode, {
        record: movieById.get(movieId),
        userRating,
        addedAt: appAddedAt.getAddedAt(userState.addedAt, movieId),
      });
      if (hint) {
        mainText = hint;
      }
    }
  }

  if (!mainText) {
    mainText = cardSmallFooterYearText(movieId);
  }

  const fanChip = cardFanRatingHtml(movieId);
  const userChip = cardUserRatingHtml(movieId);
  const ratingChips =
    fanChip || userChip
      ? `<div class="card-footer-ratings">${fanChip}${userChip}</div>`
      : "";
  return `<div class="card-footer"><div class="${mainClass}">${appCardHtml.escapeHtml(mainText)}</div>${ratingChips}</div>`;
}

function cardPosterOnlyHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = failed
      ? `<div class="placeholder">Could not load</div>`
      : `<div class="placeholder"></div>`;
    return `<div class="poster-wrap">${body}</div>${cardSmallFooterHtml(movieId)}`;
  }
  const grip = listShowsReorderGrip()
    ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  return `<div class="poster-wrap">${posterHtml(record, appTmdb.POSTER_SIZES.card)}${grip}</div>${cardSmallFooterHtml(movieId)}`;
}

function listShowsReorderGrip() {
  return (
    appLists.isListReorderable(userState.activeListId) &&
    reorderModeActive &&
    usesCustomDisplayOrder()
  );
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
  const show =
    isWatchedListActive() && activeMovieIds().length > 0 && hasMovieData();
  const sort = userState.preferences.sort;
  const custom = appSort.isCustomSort(sort);
  if (sortControl) {
    sortControl.hidden = !show;
  }
  if (listSortSelect) {
    if (show) {
      listSortSelect.value = appSort.getSortField(sort);
    }
  }
  if (sortReverseBtn) {
    sortReverseBtn.hidden = !show || custom;
    const descending = appSort.isSortDescending(sort);
    const field = appSort.getSortField(sort);
    sortReverseBtn.classList.toggle("is-descending", descending);
    sortReverseBtn.classList.toggle("is-ascending", !descending);
    const directionLabel = appSort.sortDirectionLabel(field, descending);
    sortReverseBtn.title = `${directionLabel} · click to reverse`;
    sortReverseBtn.setAttribute(
      "aria-label",
      `Sort order: ${directionLabel}. Reverse.`,
    );
  }
  document.body.classList.toggle(
    "sort-added",
    isWatchedListActive() && appSort.getSortField(sort) === "added",
  );
  syncSortSelectLabels();
}

function syncReorderModeUi() {
  const canReorder =
    appLists.isListReorderable(userState.activeListId) &&
    activeMovieIds().length > 0 &&
    usesCustomDisplayOrder();
  if (!canReorder) {
    reorderModeActive = false;
  }
  const orderLocked = !reorderModeActive;
  const showInToolbar = canReorder && isWatchlistActive();
  const showInBar =
    canReorder &&
    isWatchedListActive() &&
    appSort.isCustomSort(userState.preferences.sort);
  if (reorderModeControl) {
    if (showInToolbar && reorderToolbarSlot) {
      reorderToolbarSlot.appendChild(reorderModeControl);
      reorderModeControl.hidden = false;
    } else if (showInBar && reorderBarSlot) {
      reorderBarSlot.appendChild(reorderModeControl);
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
  if (!appSort.isCustomSort(next)) {
    reorderModeActive = false;
  }
  persistUserState();
  render();
}

function setSortField(field) {
  setSortMode(appSort.sortModeForField(field, userState.preferences.sort));
}

function toggleSortOrder() {
  if (appSort.isCustomSort(userState.preferences.sort)) {
    return;
  }
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
    const body = failed
      ? `<div class="placeholder">Could not load</div>`
      : `<div class="placeholder"></div>`;
    return `<div class="poster-wrap">${body}</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${failed ? `TMDB #${movieId}` : ""}</div>
    <div class="card-meta">${failed ? "Tap to retry" : ""}</div>
  </div>
</div>`;
  }

  if (userState.activeListId === appLists.WATCHLIST_ID) {
    return `<div class="poster-wrap">
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
</div>
<div class="card-body card-body--watchlist">
  ${watchlistCardPanelHtml(movieId)}
</div>`;
  }

  return `<div class="poster-wrap">
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta-row">
      <div class="card-meta">${cardMetaText(record)}</div>
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
    userState.activeListId === appLists.WATCHLIST_ID ? " card--watchlist" : "";

  return `<article class="card${stateClass}${cardUnratedClass(movieId)}${watchlistCard}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${cardInnerHtml(movieId)}
</article>`;
}

function rowHtml(movieId) {
  return `<div class="movie-row movie-row--card" data-movie-id="${movieId}">${rowInnerHtml(movieId)}</div>`;
}

/** Tabs are the only list switcher, and carry each list's count. */
function renderListTabs() {
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

function updateListHeader() {
  const count = activeMovieIds().length;
  if (count && !hasMovieData()) {
    listSubtitleEl.textContent = "Add a TMDB credential in Settings to load details";
  } else if (count) {
    if (reorderModeActive) {
      listSubtitleEl.textContent = "+ Add a movie · drag to reorder";
    } else if (!usesCustomDisplayOrder()) {
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
      : "Add a TMDB credential in Settings to get started";
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
    addMovieFab.hidden = count === 0;
  }
}

function renderEmptyState(count) {
  if (count) {
    emptyState.hidden = true;
    emptyState.innerHTML = "";
    return;
  }
  emptyState.hidden = false;
  const listName = activeList()?.name || "this list";
  if (!hasTmdbAccess()) {
    emptyState.innerHTML = `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to search and load movies.`;
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
  refreshViewModeForActiveList();
  syncDetailFromLocation();
  render();
  hydrateActiveList();
}

function render() {
  const ids = displayMovieIds();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  renderListTabs();
  updateListHeader();
  syncReorderModeUi();
  renderEmptyState(ids.length);
  syncAddMovieFabVisibility(ids.length);
}

/** Patches one row after hydration so the rest of the grid stays untouched. */
function applyHydratedRecord(movieId, options = {}) {
  if (isWatchedListActive() && !usesCustomDisplayOrder()) {
    render();
    if (!options.skipDetail && detailMovieId === movieId) {
      renderDetail();
    }
    return;
  }
  const row = grid.querySelector(`.movie-row[data-movie-id="${movieId}"]`);
  if (!row) {
    return;
  }
  row.innerHTML = rowInnerHtml(movieId);
  bindPosterImages(row);
  if (!options.skipDetail && detailMovieId === movieId) {
    renderDetail();
  }
}

function hydrateActiveList() {
  return hydrateMovies(displayMovieIds(), {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
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
  const placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  placeholder.textContent = record ? record.title : "";
  img.replaceWith(placeholder);
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

function watchMovie(movieId) {
  const nextLists = appLists.assignMovieToList(
    userState.lists,
    appLists.WATCHED_ID,
    movieId,
  );
  if (!commitListChange(nextLists, { movieId, status: appLists.WATCHED_ID })) {
    return;
  }
  if (detailMovieId === movieId && !activeMovieIds().includes(movieId)) {
    closeDetail();
  }
  render();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function requestWatchMovie(movieId) {
  pendingWatchMovieId = Number(movieId);
  const record = movieById.get(pendingWatchMovieId);
  const title = record?.title || `Movie ${pendingWatchMovieId}`;
  watchConfirmMessage.textContent = `Mark “${title}” as watched? It will move to your Watched list.`;
  watchConfirmDialog.hidden = false;
  watchConfirmCancel.focus({ preventScroll: true });
}

function closeWatchConfirm() {
  pendingWatchMovieId = null;
  watchConfirmDialog.hidden = true;
}

function confirmWatchMovie() {
  const movieId = pendingWatchMovieId;
  closeWatchConfirm();
  if (movieId == null) {
    return;
  }
  watchMovie(movieId);
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
    closeDetail();
  }
  render();
}

function refreshMovieRating(movieId) {
  if (isWatchedListActive() && !usesCustomDisplayOrder()) {
    render();
    if (detailMovieId === movieId) {
      syncDetailRatingDisplay(appRatings.getRating(userState.ratings, movieId));
    }
    return;
  }
  applyHydratedRecord(movieId, { skipDetail: true });
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
  removeMovieFromCollection(movieId);
}
