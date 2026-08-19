/**
 * Grid rendering. `render()` writes the whole grid from the active list's ids,
 * emitting skeleton cards for anything not hydrated yet; hydration then
 * patches single rows through applyHydratedRecord() rather than re-rendering.
 */

(function mountWatchConfirmRatingField() {
  const root = document.getElementById("watch-confirm-rating-mount");
  if (root) {
    root.innerHTML = appRatingFieldUi.userRatingFieldHtml({ idPrefix: "watch-confirm-rating" });
  }
})();

const watchConfirmRatingField = document.getElementById("watch-confirm-rating-field");
const watchConfirmRatingSlider = document.getElementById("watch-confirm-rating-slider");
const watchConfirmRatingSelect = document.getElementById("watch-confirm-rating-select");
const watchConfirmRatingClear = document.getElementById("watch-confirm-rating-clear");
const watchConfirmRatingValue = document.getElementById("watch-confirm-rating-value");
const watchConfirmRatingController = appRatingFieldUi.createRatingFieldController(
  {
    field: watchConfirmRatingField,
    slider: watchConfirmRatingSlider,
    select: watchConfirmRatingSelect,
    clear: watchConfirmRatingClear,
    value: watchConfirmRatingValue,
  },
  appRatings,
);
watchConfirmRatingController.initSelect();

function posterWrapOpen(movieId) {
  return `<div class="poster-wrap" style="--poster-bg: ${appPosterGrey.posterGreyForId(movieId)}">`;
}

function discoverPosterPlaceholderHtml(titleText, options = {}) {
  const label = options.error ? "Could not load" : titleText;
  const title = label ? appCardHtml.escapeHtml(label) : "";
  const showTitleOnPoster = gridViewMode !== "detail";
  const titleHtml =
    showTitleOnPoster && title ? `<span class="discover-poster-title">${title}</span>` : "";
  return `<div class="placeholder discover-poster-placeholder">${titleHtml}</div>`;
}

function posterPlaceholderHtml(record, options = {}) {
  if (isDiscoverActive()) {
    return discoverPosterPlaceholderHtml(record?.title || "", options);
  }
  const label = options.error
    ? "Could not load"
    : record
      ? appCardHtml.escapeHtml(record.title)
      : "";
  return `<div class="placeholder">${label}</div>`;
}

function posterHtml(record, size) {
  const remote = record ? appTmdb.buildImageUrl(record.posterPath, size) : null;
  const local = record ? localPosterUrlFor(record, size) : null;
  const url = local || remote;
  if (!url) {
    return posterPlaceholderHtml(record);
  }
  // A snapshot entry whose file has gone missing retries TMDB rather than
  // leaving a hole where the poster was.
  const fallback =
    local && remote ? ` data-poster-fallback="${appCardHtml.escapeHtml(remote)}"` : "";
  return `<img data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy" decoding="async"${fallback}>`;
}

function detailPosterSkeletonHtml() {
  return `<div class="movie-detail-poster-frame"><div class="movie-detail-poster-skeleton" aria-hidden="true"></div></div>`;
}

function discoverDetailPosterEmptyHtml() {
  return `<div class="movie-detail-poster-frame is-loaded discover-detail-poster-empty">
  <div class="discover-detail-poster-mark" aria-hidden="true"></div>
</div>`;
}

function detailPosterFrameHtml(record, size) {
  const remote = record ? appTmdb.buildImageUrl(record.posterPath, size) : null;
  const local = record ? localPosterUrlFor(record, size) : null;
  const url = local || remote;
  const skeleton = `<div class="movie-detail-poster-skeleton" aria-hidden="true"></div>`;
  if (!url) {
    if (isDiscoverActive()) {
      return discoverDetailPosterEmptyHtml();
    }
    return `<div class="movie-detail-poster-frame is-loaded is-empty">${skeleton}</div>`;
  }
  const fallback =
    local && remote ? ` data-poster-fallback="${appCardHtml.escapeHtml(remote)}"` : "";
  const img = `<img data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" decoding="async"${fallback}>`;
  return `<div class="movie-detail-poster-frame">${skeleton}${img}</div>`;
}

function cardMetaHtml(record) {
  if (isDiscoverActive()) {
    const releaseDate = appCardHtml.formatReleaseDate(record.releaseDate);
    return releaseDate
      ? `<span class="card-meta-release-date">${appCardHtml.escapeHtml(releaseDate)}</span>`
      : "";
  }
  const year = appCardHtml.formatYear(record.releaseDate);
  const runtime = appCardHtml.formatRuntime(record.runtime);
  const yearHtml = year
    ? `<span class="card-meta-year">${appCardHtml.escapeHtml(year)}</span>`
    : "";
  const runtimeHtml = runtime
    ? `<span class="card-meta-runtime">${appCardHtml.escapeHtml(runtime)}</span>`
    : "";
  return `${yearHtml}${runtimeHtml}`;
}

function cardUserRatingHtml(movieId) {
  return cardUserRatingChipHtml(movieId);
}

function cardFanRatingHtml(movieId) {
  if (!usesWatchedStyleDisplay() && !isDiscoverActive()) {
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

function discoverCardPresetButtonHtml(listId, movieId) {
  const isWatchlist = listId === appLists.WATCHLIST_ID;
  const isMember = isWatchlist
    ? appLists.isOnWatchlist(userState.lists, movieId)
    : appLists.isWatched(userState.lists, movieId);
  const label = isWatchlist ? "Watchlist" : "Watched";
  const iconPreset = isWatchlist ? "watchlist" : "watched";
  return `<button type="button" class="discover-card-watchlist-btn discover-card-watchlist-btn--icon-only${isMember ? " is-active" : ""}" data-discover-preset-id="${appCardHtml.escapeHtml(listId)}" aria-label="${label}" title="${label}" aria-pressed="${isMember ? "true" : "false"}">${appCardHtml.addListPresetIconHtml(iconPreset)}</button>`;
}

function discoverCardActionsHtml(movieId) {
  const buttons =
    discoverTab === "now-playing"
      ? `${discoverCardPresetButtonHtml(appLists.WATCHLIST_ID, movieId)}${discoverCardPresetButtonHtml(appLists.WATCHED_ID, movieId)}`
      : discoverCardPresetButtonHtml(appLists.WATCHLIST_ID, movieId);
  return `<div class="card-body-ratings card-body-ratings--interactive discover-card-actions">${buttons}</div>`;
}

function discoverCardTextHtml(movieId, record) {
  const titleRating =
    discoverTab === "now-playing" ? cardFanRatingHtml(movieId) : "";
  return `<div class="card-text discover-card-text">
  <div class="discover-card-title-row">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    ${titleRating}
  </div>
  <div class="card-meta-row">
    <div class="card-meta">${cardMetaHtml(record)}</div>
    ${discoverCardActionsHtml(movieId)}
  </div>
</div>`;
}

function cardDetailRatingsHtml(movieId) {
  if (gridViewMode !== "detail") {
    return "";
  }
  if (isDiscoverActive()) {
    return "";
  }
  if (!usesWatchedStyleDisplay()) {
    return "";
  }
  const fan = cardFanRatingHtml(movieId);
  const user = cardUserRatingHtml(movieId);
  return `<div class="card-body-ratings">${fan}${user}</div>`;
}

function isUserRatingSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "user-rating-asc" || sortMode === "user-rating-desc";
}

function isFanRatingSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "rating-asc" || sortMode === "rating-desc";
}

function isYearSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "year-asc" || sortMode === "year-desc";
}

function isTitleSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "title-asc" || sortMode === "title-desc";
}

function isAddedSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "added-asc" || sortMode === "added-desc";
}

function isWatchedSortMode() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return false;
  }
  const sortMode = userState?.preferences.sort;
  return sortMode === "watched-asc" || sortMode === "watched-desc";
}

function cardUserRatingChipHtml(movieId, { showEmpty = false } = {}) {
  if (isDiscoverActive()) {
    return "";
  }
  const allowed = appRatings.isRatingAllowed(
    userState.lists,
    movieId,
    userState.customLists,
  );
  if (!allowed) {
    if (!showEmpty) {
      return "";
    }
    return `<span class="card-user-rating is-empty" aria-label="Your rating —">—</span>`;
  }
  const label = appRatings.formatUserRating(
    appRatings.getRating(userState.ratings, movieId),
  );
  if (!label && !showEmpty) {
    return "";
  }
  const text = label || "—";
  const emptyClass = label ? "" : " is-empty";
  return `<span class="card-user-rating${emptyClass}" aria-label="Your rating ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function cardReleaseYearFooterHtml(movieId) {
  const record = movieById.get(movieId);
  const year = record ? appCardHtml.formatYear(record.releaseDate) : "";
  const text = year || "—";
  const emptyClass = year ? "" : " is-empty";
  return `<span class="card-footer-main${emptyClass}" aria-label="Release year ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function cardWatchDateFooterHtml(movieId) {
  if (!appLists.isWatched(userState.lists, movieId)) {
    return `<span class="card-footer-main is-empty" aria-label="Date watched —">—</span>`;
  }
  const watchedOn = appViewingHistory.latestViewingDate(userState.viewingHistory, movieId);
  const text = watchedOn || "—";
  const emptyClass = watchedOn ? "" : " is-empty";
  return `<span class="card-footer-main${emptyClass}" aria-label="Date watched ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function cardSmallWatchedFooterContentHtml(movieId) {
  if (isTitleSortMode() || isAddedSortMode()) {
    return "";
  }
  if (isUserRatingSortMode()) {
    return cardUserRatingChipHtml(movieId, { showEmpty: true });
  }
  if (isFanRatingSortMode()) {
    return cardFanRatingHtml(movieId);
  }
  if (isYearSortMode()) {
    return cardReleaseYearFooterHtml(movieId);
  }
  if (isWatchedSortMode()) {
    return cardWatchDateFooterHtml(movieId);
  }
  return "";
}

function cardSmallFooterHtml(movieId) {
  if (isDiscoverActive() || gridViewMode !== "cards") {
    return "";
  }

  if (isWatchlistActive()) {
    const panel = watchlistCardPanelHtml(movieId);
    return panel ? `<div class="card-footer card-footer--watchlist">${panel}</div>` : "";
  }

  if (!usesWatchedStyleDisplay()) {
    return "";
  }

  const content = cardSmallWatchedFooterContentHtml(movieId);
  if (!content) {
    return "";
  }
  return `<div class="card-footer card-footer--sort"><div class="card-footer-sort">${content}</div></div>`;
}

function cardSortDimClass(movieId) {
  if (isDiscoverActive() || !usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return "";
  }
  if (isUserRatingSortMode()) {
    if (appRatings.getRating(userState.ratings, movieId) != null) {
      return "";
    }
    return " is-unrated";
  }
  if (isWatchedSortMode()) {
    if (appViewingHistory.latestViewingDate(userState.viewingHistory, movieId)) {
      return "";
    }
    return " is-no-watch-date";
  }
  return "";
}

function cardRemoveIconHtml() {
  return `<svg class="card-remove-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none">
  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
</svg>`;
}

/**
 * Watchlist cards use a dedicated bottom panel: split remove / watched actions.
 */
function watchlistCardPanelHtml(movieId) {
  if (!isWatchlistActive()) {
    return "";
  }
  const record = movieById.get(movieId);
  const titleLabel = record ? appCardHtml.escapeHtml(record.title) : "movie";
  return `<div class="watchlist-card-panel">
  <div class="watchlist-card-actions">
    <button type="button" class="watchlist-action-btn watchlist-action-btn--remove card-remove-btn" aria-label="Remove ${titleLabel}" title="Remove movie">${cardRemoveIconHtml()}</button>
    <button type="button" class="watchlist-action-btn watchlist-action-btn--watch card-watch-btn discover-preset-btn-with-icon" aria-label="Mark as watched" title="Mark as watched">${appCardHtml.discoverPresetButtonInnerHtml("watched", "Watched")}</button>
  </div>
</div>`;
}

function cardPosterOnlyHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = posterPlaceholderHtml(null, { error: failed });
    return `${posterWrapOpen(movieId)}${body}</div>${cardSmallFooterHtml(movieId)}`;
  }
  const grip = listShowsReorderGrip()
    ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  return `${posterWrapOpen(movieId)}${posterHtml(record, appTmdb.POSTER_SIZES.card)}${grip}</div>${cardSmallFooterHtml(movieId)}`;
}

function listShowsReorderGrip() {
  return (
    !isDiscoverActive() &&
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
    !isDiscoverActive() &&
    usesWatchedStyleDisplay() &&
    activeMovieIds().length > 0 &&
    hasMovieData();
  const sort = userState.preferences.sort;
  if (sortControl) {
    sortControl.hidden = !show;
  }
  if (listSortSelect) {
    if (show) {
      listSortSelect.value = appSort.getSortField(sort);
    }
  }
  if (sortReverseBtn) {
    sortReverseBtn.hidden = !show;
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
  syncSortSelectLabels();
}

function syncReorderModeUi() {
  const canReorder =
    !isDiscoverActive() &&
    isWatchlistActive() &&
    appLists.isListReorderable(userState.activeListId) &&
    activeMovieIds().length > 0;
  if (!canReorder) {
    reorderModeActive = false;
  }
  const orderLocked = !reorderModeActive;
  if (reorderModeControl) {
    if (canReorder && reorderToolbarSlot) {
      reorderToolbarSlot.appendChild(reorderModeControl);
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
  persistUserState();
  render();
}

function setSortField(field) {
  setSortMode(appSort.sortModeForField(field, userState.preferences.sort));
}

function toggleSortOrder() {
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
    const body = posterPlaceholderHtml(null, { error: failed });
    return `${posterWrapOpen(movieId)}${body}</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${failed ? `TMDB #${movieId}` : ""}</div>
    <div class="card-meta">${failed ? "Tap to retry" : ""}</div>
  </div>
</div>`;
  }

  if (!isDiscoverActive() && isWatchlistActive()) {
    return `${posterWrapOpen(movieId)}
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
</div>
<div class="card-body card-body--watchlist">
  ${watchlistCardPanelHtml(movieId)}
</div>`;
  }

  if (isDiscoverActive()) {
    return `${posterWrapOpen(movieId)}
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
</div>
<div class="card-body">
  ${discoverCardTextHtml(movieId, record)}
</div>`;
  }

  return `${posterWrapOpen(movieId)}
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta-row">
      <div class="card-meta">${cardMetaHtml(record)}</div>
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
    !isDiscoverActive() && isWatchlistActive()
      ? " card--watchlist"
      : "";

  return `<article class="card${stateClass}${cardSortDimClass(movieId)}${watchlistCard}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${cardInnerHtml(movieId)}
</article>`;
}

function rowHtml(movieId) {
  return `<div class="movie-row movie-row--card" data-movie-id="${movieId}">${rowInnerHtml(movieId)}</div>`;
}

/** Tabs are the only list switcher, and carry each list's count. */
function renderListTabs() {
  if (!listTabs || isCustomListView() || isDiscoverActive()) {
    return;
  }
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

function syncHeaderViewTitle() {
  if (!headerTitleEl || !customListViewTitleEl) {
    return;
  }
  if (isCustomListDetailActive()) {
    customListViewTitleEl.textContent = getActiveDisplayContext().listName;
    customListViewTitleEl.hidden = false;
    headerTitleEl.hidden = true;
    return;
  }
  customListViewTitleEl.hidden = true;
  headerTitleEl.hidden = false;
  if (isDiscoverActive()) {
    headerTitleEl.textContent = "Discover";
    return;
  }
  headerTitleEl.textContent = isCustomListIndexActive() ? "Lists" : "CineQueue";
}

function updateListHeader() {
  syncHeaderViewTitle();
  const count = isDiscoverActive() ? discoverDisplayIds().length : activeMovieIds().length;
  if (isCustomListIndexActive()) {
    listSubtitleEl.textContent = "Create and manage custom lists";
    return;
  }
  if (isDiscoverActive()) {
    const tabLabel = discoverTab === "now-playing" ? "Now playing" : "Upcoming";
    if (discoverTotalPages > 1) {
      listSubtitleEl.textContent = `${tabLabel} · Page ${discoverPage} of ${discoverTotalPages}`;
    } else {
      listSubtitleEl.textContent = tabLabel;
    }
    return;
  }
  if (isCustomListDetailActive()) {
    if (count) {
      listSubtitleEl.textContent = `${count} ${count === 1 ? "movie" : "movies"}`;
    } else {
      listSubtitleEl.textContent = "Add movies from Watched or search";
    }
    return;
  }
  if (count && !hasMovieData()) {
    listSubtitleEl.textContent = "Add a TMDB credential in Settings to load details";
  } else if (count) {
    if (reorderModeActive) {
      listSubtitleEl.textContent = "+ Add a movie · drag to reorder";
    } else if (isWatchedListActive()) {
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
    addMovieFab.hidden =
      isCustomListIndexActive() ||
      isDiscoverActive() ||
      (count === 0 && !isCustomListDetailActive());
  }
}

function renderEmptyState(count) {
  const totalCount = activeMovieIds().length;
  if (count) {
    emptyState.hidden = true;
    emptyState.innerHTML = "";
    return;
  }
  emptyState.hidden = false;
  if (isCustomListDetailActive()) {
    if (!hasTmdbAccess()) {
      emptyState.innerHTML = `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to search and load movies.`;
      return;
    }
    emptyState.innerHTML = `<strong>This list is empty</strong>
<p class="empty-state-hint">Add movies from Watched or search TMDB.</p>
<button type="button" class="empty-state-add-btn">
  <span class="empty-state-add-icon" aria-hidden="true">+</span>
  Add a movie
</button>`;
    return;
  }
  const listName = getActiveDisplayContext().listName || "this list";
  if (
    totalCount > 0 &&
    typeof hasActiveListSearch === "function" &&
    hasActiveListSearch()
  ) {
    emptyState.innerHTML = `<strong>No matches</strong>
<p class="empty-state-hint">Try a different title, director, genre, actor, or year.</p>`;
    return;
  }
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
  onRemoteCustomListsAdopted();
  refreshViewModeForActiveList();
  syncViewFromLocation();
}

function render() {
  if (isCustomListIndexActive()) {
    syncAppViewChrome();
    renderCustomListsIndex();
    return;
  }
  if (isDiscoverActive()) {
    renderDiscover();
    return;
  }
  const ids = displayMovieIds();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  renderListTabs();
  syncReorderModeUi();
  syncListSearchVisibility();
  syncAppViewChrome();
  renderEmptyState(ids.length);
  syncAddMovieFabVisibility(ids.length);
}

/** Patches one row after hydration so the rest of the grid stays untouched. */
function applyHydratedRecord(movieId, options = {}) {
  const row = grid.querySelector(`.movie-row[data-movie-id="${movieId}"]`);
  if (row) {
    row.innerHTML = rowInnerHtml(movieId);
    bindPosterImages(row);
  }
  if (!options.skipDetail && detailMovieId === movieId) {
    renderDetail();
  }
}

function needsResortAfterHydration() {
  if (!getActiveDisplayContext().sortable) {
    return false;
  }
  const field = appSort.getSortField(userState.preferences.sort);
  return field === "title" || field === "year" || field === "rating";
}

function hydrateActiveList() {
  return hydrateMovies(displayMovieIds(), {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  }).then((result) => {
    if (result?.hydratedFromNetwork && needsResortAfterHydration()) {
      render();
    }
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
  const placeholder = document.createElement("template");
  placeholder.innerHTML = isDiscoverActive()
    ? discoverPosterPlaceholderHtml(record ? record.title : "")
    : `<div class="placeholder">${record ? appCardHtml.escapeHtml(record.title) : ""}</div>`;
  img.replaceWith(placeholder.content.firstChild);
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

function watchMovie(movieId, watchedOn, rating) {
  const nextLists = appLists.assignMovieToList(
    userState.lists,
    appLists.WATCHED_ID,
    movieId,
  );
  if (!commitListChange(nextLists, { movieId, status: appLists.WATCHED_ID })) {
    return;
  }
  recordAddedAt(movieId);
  if (watchedOn) {
    addMovieViewing(movieId, watchedOn);
  }
  if (rating != null) {
    updateRatings(appRatings.setRating(userState.ratings, movieId, rating));
  }
  if (detailMovieId === movieId && !activeMovieIds().includes(movieId)) {
    closeDetail();
  }
  render();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function resetWatchConfirmWatchDate() {
  watchConfirmWatchDateActive = false;
  if (watchConfirmDate) {
    watchConfirmDate.value = appViewingHistory.today();
    watchConfirmDate.max = appViewingHistory.today();
  }
  syncWatchConfirmWatchDateUi();
}

function resetWatchConfirmRatingControls() {
  watchConfirmRatingController.reset();
}

function onWatchConfirmRatingSliderInput() {
  watchConfirmRatingController.onSliderInput();
}

function onWatchConfirmRatingSelectChange() {
  watchConfirmRatingController.onSelectChange();
}

function clearWatchConfirmRating() {
  watchConfirmRatingController.clear();
}

function syncWatchConfirmWatchDateUi() {
  if (watchConfirmDateToggle) {
    watchConfirmDateToggle.hidden = watchConfirmWatchDateActive;
  }
  if (watchConfirmDateField) {
    watchConfirmDateField.hidden = !watchConfirmWatchDateActive;
  }
}

function onWatchConfirmDateToggleClick() {
  watchConfirmWatchDateActive = true;
  syncWatchConfirmWatchDateUi();
  watchConfirmDate?.focus({ preventScroll: true });
}

function clearWatchConfirmWatchDate() {
  resetWatchConfirmWatchDate();
}

function requestWatchMovie(movieId, options = {}) {
  pendingWatchMovieId = Number(movieId);
  const record = movieById.get(pendingWatchMovieId);
  const title = record?.title || `Movie ${pendingWatchMovieId}`;
  watchConfirmMessage.textContent = options.fromDiscover || !appLists.isOnWatchlist(userState.lists, pendingWatchMovieId)
    ? `Mark “${title}” as watched? It will be added to your Watched list.`
    : `Mark “${title}” as watched? It will move to your Watched list.`;
  resetWatchConfirmWatchDate();
  resetWatchConfirmRatingControls();
  watchConfirmDialog.hidden = false;
  watchConfirmCancel.focus({ preventScroll: true });
}

function closeWatchConfirm() {
  pendingWatchMovieId = null;
  watchConfirmWatchDateActive = false;
  resetWatchConfirmRatingControls();
  watchConfirmDialog.hidden = true;
}

function confirmWatchMovie() {
  const movieId = pendingWatchMovieId;
  const watchedOn =
    watchConfirmWatchDateActive && watchConfirmDate?.value ? watchConfirmDate.value : null;
  const rating = watchConfirmRatingController.getValue();
  closeWatchConfirm();
  if (movieId == null) {
    return;
  }
  watchMovie(movieId, watchedOn, rating);
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
  if (usesWatchedStyleDisplay()) {
    render();
    if (detailMovieId === movieId) {
      renderDetail();
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
  if (isCustomListDetailActive()) {
    removeMovieFromCustomListView(movieId);
    return;
  }
  removeMovieFromCollection(movieId);
}
