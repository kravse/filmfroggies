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

function closePosterWrap(_movieId, innerHtml, extras = "") {
  return `${innerHtml}${extras}</div>`;
}

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

function ratingSegmentHtml(kind, text, empty = false) {
  const labels = {
    fan: "Fan rating",
    mine: "Your rating",
    them: "Friend rating",
  };
  const safe = appCardHtml.escapeHtml(text);
  const emptyClass = empty ? " is-empty" : "";
  const label = labels[kind] || "Rating";
  return `<span class="rating-segment rating-segment--${kind}${emptyClass}" aria-label="${label} ${safe}" title="${label}">${safe}</span>`;
}

function ratingChitHtml(inner, ariaLabel) {
  const content = typeof inner === "string" ? inner.trim() : "";
  if (!content) {
    return "";
  }
  const aria = ariaLabel
    ? ` aria-label="${appCardHtml.escapeHtml(ariaLabel)}"`
    : "";
  return `<div class="rating-chit card-body-ratings"${aria}>${content}</div>`;
}

function cardUserRatingHtml(movieId) {
  return cardUserRatingChipHtml(movieId);
}

function cardFanRatingSegmentHtml(movieId) {
  if (!usesWatchedStyleDisplay() && !isDiscoverActive()) {
    return "";
  }
  const record = movieById.get(movieId);
  if (!record) {
    return ratingSegmentHtml("fan", "—", true);
  }
  const label = appCardHtml.formatRating(record.voteAverage);
  const text = label || "—";
  return ratingSegmentHtml("fan", text, !label);
}

function cardFanRatingHtml(movieId) {
  const segment = cardFanRatingSegmentHtml(movieId);
  return segment ? ratingChitHtml(segment) : "";
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

/** Patch discover preset buttons on one card without rebuilding the grid. */
function syncDiscoverCardMembershipUi(movieId) {
  if (!isDiscoverActive() || !grid) {
    return false;
  }
  const row = grid.querySelector(`.movie-row[data-movie-id="${movieId}"]`);
  if (!row) {
    return false;
  }
  const actions = row.querySelector(".discover-card-actions");
  if (!actions) {
    return false;
  }
  actions.outerHTML = discoverCardActionsHtml(movieId);
  return true;
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
  const fan = cardFanRatingSegmentHtml(movieId);
  const user = cardUserRatingSegmentHtml(movieId);
  const inner = `${fan}${user}`;
  return inner ? ratingChitHtml(inner) : "";
}

function watchedListSortField() {
  if (!usesWatchedStyleDisplay() || usesCustomDisplayOrder()) {
    return null;
  }
  const sort = userState?.preferences?.sort;
  if (!sort) {
    return null;
  }
  const resolved = isFriendViewActive()
    ? appSort.resolveSortMode(sort, { friendView: true })
    : appSort.resolveSortMode(sort);
  return appSort.getSortField(resolved);
}

function isUserRatingSortMode() {
  return watchedListSortField() === "user-rating";
}

function isFanRatingSortMode() {
  return watchedListSortField() === "rating";
}

function isYearSortMode() {
  return watchedListSortField() === "year";
}

function isTitleSortMode() {
  return watchedListSortField() === "title";
}

function isAddedSortMode() {
  return watchedListSortField() === "added";
}

function isWatchedSortMode() {
  return watchedListSortField() === "watched";
}

/** Keep small-card sort footers in sync when sort UI updates without a full render. */
function syncWatchedCardSortFooters() {
  if (
    !grid ||
    isDiscoverActive() ||
    gridViewMode !== "cards" ||
    !usesWatchedStyleDisplay() ||
    usesCustomDisplayOrder()
  ) {
    return;
  }
  for (const row of grid.querySelectorAll(".movie-row[data-movie-id]")) {
    const movieId = Number(row.dataset.movieId);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      continue;
    }
    const card = row.querySelector(".card");
    if (!card) {
      continue;
    }
    const dimClass = cardSortDimClass(movieId);
    card.classList.remove("is-unrated", "is-no-watch-date");
    if (dimClass.includes("is-unrated")) {
      card.classList.add("is-unrated");
    }
    if (dimClass.includes("is-no-watch-date")) {
      card.classList.add("is-no-watch-date");
    }
    const existing = card.querySelector(".card-footer--sort");
    const next = cardSmallFooterHtml(movieId);
    if (next) {
      if (existing) {
        existing.outerHTML = next;
      } else {
        card.insertAdjacentHTML("beforeend", next);
      }
    } else if (existing) {
      existing.remove();
    }
  }
}

function cardUserRatingSegmentHtml(movieId, { showEmpty = false } = {}) {
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
    return ratingSegmentHtml("mine", "—", true);
  }
  const label = appRatings.formatUserRating(
    appRatings.getRating(userState.ratings, movieId),
  );
  if (!label && !showEmpty) {
    return "";
  }
  const text = label || "—";
  return ratingSegmentHtml("mine", text, !label);
}

function cardUserRatingChipHtml(movieId, options) {
  const segment = cardUserRatingSegmentHtml(movieId, options);
  return segment ? ratingChitHtml(segment) : "";
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
    return "";
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

function cardPosterOnlyHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = posterPlaceholderHtml(null, { error: failed });
    return `${posterWrapOpen(movieId)}${closePosterWrap(movieId, body)}${cardSmallFooterHtml(movieId)}`;
  }
  const grip = listShowsReorderGrip()
    ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  return `${posterWrapOpen(movieId)}${closePosterWrap(movieId, posterHtml(record, appTmdb.POSTER_SIZES.card), grip)}${cardSmallFooterHtml(movieId)}`;
}

function cardPosterOnlySkeletonHtml(movieId) {
  const body = posterPlaceholderHtml(null, {});
  return `${posterWrapOpen(movieId)}${closePosterWrap(movieId, body)}${cardSmallFooterHtml(movieId)}`;
}

function skeletonCardInnerHtml(movieId) {
  if (gridViewMode === "cards") {
    return cardPosterOnlySkeletonHtml(movieId);
  }
  const body = posterPlaceholderHtml(null, {});
  return `${posterWrapOpen(movieId)}${closePosterWrap(movieId, body)}
<div class="card-body">
  <div class="card-text">
    <div class="card-title"></div>
    <div class="card-meta"></div>
  </div>
</div>`;
}

function skeletonRowHtml(movieId) {
  const title = `Movie ${movieId}`;
  return `<div class="movie-row movie-row--card" data-movie-id="${movieId}"><article class="card is-skeleton${cardSortDimClass(movieId)}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${skeletonCardInnerHtml(movieId)}
</article></div>`;
}

function listShowsReorderGrip() {
  return (
    !isDiscoverActive() &&
    appLists.isListReorderable(userState.activeListId) &&
    reorderModeActive &&
    usesCustomDisplayOrder()
  );
}

const FRIEND_SORT_OPTION_VALUE = "friend-rating";

function syncFriendSortSelectOption() {
  if (!listSortSelect) {
    return;
  }
  let option = listSortSelect.querySelector(`option[value="${FRIEND_SORT_OPTION_VALUE}"]`);
  const showFriendOption =
    isFriendViewActive() &&
    !friendViewLoading &&
    !friendViewError &&
    friendViewSections.some((section) => section.movieIds.length > 0);
  if (showFriendOption) {
    if (!option) {
      option = document.createElement("option");
      option.value = FRIEND_SORT_OPTION_VALUE;
      const userRatingOption = listSortSelect.querySelector('option[value="user-rating"]');
      if (userRatingOption?.nextSibling) {
        listSortSelect.insertBefore(option, userRatingOption.nextSibling);
      } else {
        listSortSelect.appendChild(option);
      }
    }
    return;
  }
  option?.remove();
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
  const showOnMain =
    !isDiscoverActive() &&
    !isAdminViewActive() &&
    !isFriendsIndexActive() &&
    !isFriendViewActive() &&
    usesWatchedStyleDisplay() &&
    activeMovieIds().length > 0 &&
    hasMovieData();
  const showOnFriend =
    isFriendViewActive() &&
    !friendViewLoading &&
    !friendViewError &&
    friendViewSections.some((section) => section.movieIds.length > 0);
  const show = showOnMain || showOnFriend;
  syncFriendSortSelectOption();
  const sort = userState.preferences.sort;
  const sortField = appSort.getSortField(
    isFriendViewActive() ? sort : appSort.resolveSortMode(sort),
  );
  if (sortControl) {
    sortControl.hidden = !show;
  }
  if (listSortSelect) {
    if (show) {
      listSortSelect.value = sortField;
    }
  }
  if (sortReverseBtn) {
    sortReverseBtn.hidden = !show;
    const descending = appSort.isSortDescending(sort);
    sortReverseBtn.classList.toggle("is-descending", descending);
    sortReverseBtn.classList.toggle("is-ascending", !descending);
    const directionLabel = appSort.sortDirectionLabel(sortField, descending);
    sortReverseBtn.title = `${directionLabel} · click to reverse`;
    sortReverseBtn.setAttribute(
      "aria-label",
      `Sort order: ${directionLabel}. Reverse.`,
    );
  }
  syncSortSelectLabels();
  syncWatchedCardSortFooters();
}

function syncReorderModeUi() {
  const canReorder =
    !isDiscoverActive() &&
    !isAdminViewActive() &&
    !isFriendsIndexActive() &&
    !isFriendViewActive() &&
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
    return `${posterWrapOpen(movieId)}${closePosterWrap(movieId, body)}
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${failed ? `TMDB #${movieId}` : ""}</div>
    <div class="card-meta">${failed ? "Tap to retry" : ""}</div>
  </div>
</div>`;
  }

  const grip = listShowsReorderGrip()
    ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";

  if (isDiscoverActive()) {
    return `${posterWrapOpen(movieId)}${closePosterWrap(movieId, posterHtml(record, appTmdb.POSTER_SIZES.detailGrid))}
<div class="card-body">
  ${discoverCardTextHtml(movieId, record)}
</div>`;
  }

  return `${posterWrapOpen(movieId)}${closePosterWrap(movieId, posterHtml(record, appTmdb.POSTER_SIZES.detailGrid), grip)}
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

  return `<article class="card${stateClass}${cardSortDimClass(movieId)}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${cardInnerHtml(movieId)}
</article>`;
}

function rowHtml(movieId) {
  return `<div class="movie-row movie-row--card" data-movie-id="${movieId}">${rowInnerHtml(movieId)}</div>`;
}

let serverSortFetchGeneration = 0;
let serverSortCacheKey = "";
let serverSortCachedIds = null;

function serverSortCacheToken() {
  const ctx = getActiveDisplayContext();
  const sort = appSort.resolveSortMode(userState.preferences.sort);
  const searchKey =
    ctx.searchable && typeof hasActiveListSearch === "function" && hasActiveListSearch()
      ? getListSearchFilter()
      : "";
  return `${ctx.listId}:${sort}:${searchKey}`;
}

function usesServerSortedIds() {
  if (!hasTmdbAccess()) {
    return false;
  }
  if (isWatchlistActive()) {
    return false;
  }
  if (isFriendViewActive()) {
    const field = appSort.getSortField(userState.preferences.sort);
    return field !== "custom";
  }
  return getActiveDisplayContext().sortable;
}

function applyDisplayListFilters(ids) {
  const ctx = getActiveDisplayContext();
  if (ctx.searchable && typeof hasActiveListSearch === "function" && hasActiveListSearch()) {
    return appListSearch.filterMovieIds(ids, getListSearchFilter(), (id) =>
      movieById.get(id) ?? localMovieRecord(id),
    );
  }
  return ids;
}

function invalidateServerSortCache() {
  serverSortCacheKey = "";
  serverSortCachedIds = null;
}

async function renderServerSortedGrid() {
  const ctx = getActiveDisplayContext();
  const sort = appSort.resolveSortMode(userState.preferences.sort);
  const cacheKey = serverSortCacheToken();
  const generation = (serverSortFetchGeneration += 1);
  const initialIds =
    cacheKey === serverSortCacheKey && serverSortCachedIds ? serverSortCachedIds : ctx.movieIds;

  paintMovieGrid(applyDisplayListFilters(initialIds));

  try {
    const ids = await fetchSortedListIds(ctx.listId, sort);
    if (generation !== serverSortFetchGeneration) {
      return;
    }
    serverSortCacheKey = cacheKey;
    serverSortCachedIds = ids;
    paintMovieGrid(applyDisplayListFilters(ids));
  } catch (_) {
    if (generation !== serverSortFetchGeneration) {
      return;
    }
    paintMovieGrid(displayMovieIds());
  }
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
  if (isFriendViewActive()) {
    customListViewTitleEl.textContent = "Friends";
    customListViewTitleEl.hidden = false;
    headerTitleEl.hidden = true;
    return;
  }
  if (isFriendsIndexActive()) {
    customListViewTitleEl.textContent = "Friends";
    customListViewTitleEl.hidden = false;
    headerTitleEl.hidden = true;
    return;
  }
  if (isAdminViewActive()) {
    customListViewTitleEl.textContent = "Admin";
    customListViewTitleEl.hidden = false;
    headerTitleEl.hidden = true;
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
  headerTitleEl.textContent = isCustomListIndexActive() ? "Lists" : SITE_BRAND_NAME;
}

function syncAccountLoginGate() {
  const loggedIn = accountSyncEnabled();
  document.body.classList.toggle("account-login-required", !loggedIn);
  settingsBtn.hidden = !loggedIn;
  loginBtn.hidden = loggedIn;
  if (searchInput) {
    searchInput.disabled = !loggedIn;
  }
  if (addMovieFab) {
    addMovieFab.disabled = !loggedIn;
  }
  updateAddMovieHint();
}

function updateListHeader() {
  syncHeaderViewTitle();
  const count = isDiscoverActive() ? discoverDisplayIds().length : activeMovieIds().length;
  if (isCustomListIndexActive()) {
    listSubtitleEl.textContent = "Create and manage custom lists";
    return;
  }
  if (isFriendsIndexActive()) {
    listSubtitleEl.textContent = accountSyncEnabled()
      ? "Add friends by email, then open their shared lists"
      : "Log in to connect with friends";
    return;
  }
  if (isAdminViewActive()) {
    listSubtitleEl.textContent = "User management and invite codes";
    return;
  }
  if (isFriendViewActive()) {
    if (friendViewLoading) {
      listSubtitleEl.textContent = "Loading their lists…";
      return;
    }
    if (friendViewError) {
      listSubtitleEl.textContent = "Could not load their lists";
      return;
    }
    if (friendViewSections.length) {
      const sortField = appSort.getSortField(userState.preferences.sort);
      listSubtitleEl.textContent =
        sortField === "custom"
          ? "Tap a movie to open details and add to your lists"
          : "Tap a movie to open details and add to your lists · sorted view";
      return;
    }
    listSubtitleEl.textContent = "No shared lists yet";
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
    listSubtitleEl.textContent = "Sign in to load movie details from TMDB";
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
      : "Log in to get started";
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
      isFriendViewActive() ||
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
      emptyState.innerHTML = `<strong>Log in to use ${SITE_BRAND_NAME}</strong><p class="empty-state-hint">Log in or sign up to start your collection.</p>`;
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
<p class="empty-state-hint">Try a different title, or director:, genre:, actor:, or year.</p>`;
    return;
  }
  if (!hasTmdbAccess()) {
    emptyState.innerHTML = `<strong>Log in to use ${SITE_BRAND_NAME}</strong><p class="empty-state-hint">Log in or sign up to start your collection.</p>`;
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
  syncAccountLoginGate();
  if (isFriendViewActive()) {
    syncAppViewChrome();
    renderFriendView();
    if (usesServerSortedIds() && activeFriendId && friendViewSections.length) {
      prefetchFriendServerSorts(activeFriendId);
    }
    return;
  }
  if (isFriendsIndexActive()) {
    renderFriendsIndex();
    return;
  }
  if (isCustomListIndexActive()) {
    syncAppViewChrome();
    renderCustomListsIndex();
    return;
  }
  if (isDiscoverActive()) {
    renderDiscover();
    return;
  }
  if (usesServerSortedIds()) {
    renderServerSortedGrid();
    return;
  }
  serverSortFetchGeneration += 1;
  paintMovieGrid(displayMovieIds());
}

function syncMovieListChrome(ids) {
  renderListTabs();
  syncReorderModeUi();
  syncListSearchVisibility();
  syncAppViewChrome();
  renderEmptyState(ids.length);
  syncAddMovieFabVisibility(ids.length);
}

function paintMovieGrid(ids) {
  renderedMovieIds = [...ids];
  disconnectRowHydrateObserver();
  grid.removeAttribute("aria-busy");
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  syncMovieListChrome(ids);
  hydrateActiveList();
}

function applyHydratedRecord(movieId, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  if (isFriendViewActive()) {
    applyFriendHydratedRecord(movieId);
    return;
  }
  const row = grid.querySelector(`.movie-row[data-movie-id="${movieId}"]`);
  if (row) {
    row.innerHTML = rowInnerHtml(movieId);
    bindPosterImages(row);
  }
  if (!opts.skipDetail && detailMovieId === movieId) {
    renderDetail();
  }
}

/** Re-sort visible rows after hydration without rebuilding the grid HTML. */
function reorderGridRows() {
  if (!grid || isCustomListIndexActive() || isDiscoverActive()) {
    return false;
  }
  const ids = displayMovieIds();
  renderedMovieIds = [...ids];
  return appGridReorder.reorderElementsById(
    grid,
    ids,
    appViewportHydration.movieIdFromRowElement,
  );
}

let rowHydrateObserver;
const rowHydrateInflight = new Set();
const rowHydratePendingIds = new Set();
const rowHydratePendingRows = new Map();
let rowHydrateBatchTimer = 0;
let rowHydrateResortTimer;

function flushRowHydrateBatch() {
  rowHydrateBatchTimer = 0;
  if (!rowHydratePendingIds.size) {
    return;
  }
  const ids = [...rowHydratePendingIds];
  const rowsById = new Map(rowHydratePendingRows);
  rowHydratePendingIds.clear();
  rowHydratePendingRows.clear();
  for (const id of ids) {
    rowHydrateInflight.add(id);
  }
  hydrateMovies(ids, {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  }).finally(() => {
      for (const id of ids) {
        rowHydrateInflight.delete(id);
        const row = rowsById.get(id);
        const hydrated = appTmdb.isDetailedMovieRecord(movieById.get(id)) || movieErrors.has(id);
        if (rowHydrateObserver && row?.isConnected && hydrated) {
          rowHydrateObserver.unobserve(row);
        }
      }
    });
}

function scheduleRowHydrateBatch(movieId, row) {
  rowHydratePendingIds.add(movieId);
  rowHydratePendingRows.set(movieId, row);
  if (rowHydrateBatchTimer) {
    return;
  }
  rowHydrateBatchTimer = setTimeout(flushRowHydrateBatch, 50);
}

function disconnectRowHydrateObserver() {
  if (rowHydrateObserver) {
    rowHydrateObserver.disconnect();
    rowHydrateObserver = null;
  }
  rowHydrateInflight.clear();
  rowHydratePendingIds.clear();
  rowHydratePendingRows.clear();
  if (rowHydrateBatchTimer) {
    clearTimeout(rowHydrateBatchTimer);
    rowHydrateBatchTimer = 0;
  }
  if (rowHydrateResortTimer) {
    clearTimeout(rowHydrateResortTimer);
    rowHydrateResortTimer = 0;
  }
}

function scheduleResortAfterHydration() {
  if (!isFriendViewActive() || usesServerSortedIds()) {
    return;
  }
  if (rowHydrateResortTimer) {
    clearTimeout(rowHydrateResortTimer);
  }
  rowHydrateResortTimer = setTimeout(() => {
    rowHydrateResortTimer = 0;
    if (!appViewportHydration.isHydrationQuiescent({
      batchTimer: rowHydrateBatchTimer,
      inflightCount: rowHydrateInflight.size,
      pendingCount: rowHydratePendingIds.size,
    })) {
      scheduleResortAfterHydration();
      return;
    }
    renderFriendView();
  }, 300);
}

function ensureRowHydrateObserver() {
  if (rowHydrateObserver || typeof IntersectionObserver === "undefined") {
    return rowHydrateObserver;
  }
  rowHydrateObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        const row = entry.target;
        const movieId = appViewportHydration.movieIdFromRowElement(row);
        if (!movieId || appTmdb.isDetailedMovieRecord(movieById.get(movieId))) {
          rowHydrateObserver.unobserve(row);
          continue;
        }
        if (rowHydrateInflight.has(movieId) || rowHydratePendingIds.has(movieId)) {
          continue;
        }
        scheduleRowHydrateBatch(movieId, row);
      }
    },
    {
      root: null,
      rootMargin: appViewportHydration.ROW_HYDRATE_ROOT_MARGIN,
      threshold: 0.01,
    },
  );
  return rowHydrateObserver;
}

function bindRowHydrateObserver() {
  if (isCustomListIndexActive() || isDiscoverActive() || !grid) {
    return;
  }
  const observer = ensureRowHydrateObserver();
  if (!observer) {
    return;
  }
  for (const row of grid.querySelectorAll(".movie-row[data-movie-id]")) {
    const movieId = appViewportHydration.movieIdFromRowElement(row);
    if (!movieId || appTmdb.isDetailedMovieRecord(movieById.get(movieId))) {
      continue;
    }
    observer.observe(row);
  }
}

function hydrateActiveList() {
  if (isCustomListIndexActive() || isDiscoverActive()) {
    return Promise.resolve();
  }
  if (typeof IntersectionObserver === "undefined") {
    const ids = renderedMovieIds.length ? renderedMovieIds : displayMovieIds();
    return hydrateMovies(ids, {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
  }
  // Visible rows (+ rootMargin prefetch) debounce into one POST /api/movies/batch.
  bindRowHydrateObserver();
  return Promise.resolve();
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

/** Re-render grids after list membership changes; defer while detail overlay is open. */
function renderActiveUnderlayView() {
  if (isCustomListIndexActive()) {
    renderCustomListsIndex();
  } else if (isDiscoverActive()) {
    renderDiscover();
  } else if (isFriendViewActive()) {
    renderFriendView();
  } else {
    render();
  }
}

function refreshViewsAfterListMembershipChange(options = {}) {
  const movieId = Number(options.movieId);
  const patchMovieId = Number.isInteger(movieId) && movieId > 0 ? movieId : null;
  if (detailMovieId != null) {
    detailUnderlayRenderPending = true;
    detailUnderlayPatchMovieId = patchMovieId;
    return;
  }
  if (patchMovieId != null && syncDiscoverCardMembershipUi(patchMovieId)) {
    return;
  }
  renderActiveUnderlayView();
}

function flushUnderlayAfterDetailClose() {
  if (!detailUnderlayRenderPending) {
    return;
  }
  const patchMovieId = detailUnderlayPatchMovieId;
  detailUnderlayRenderPending = false;
  detailUnderlayPatchMovieId = null;
  if (patchMovieId != null && syncDiscoverCardMembershipUi(patchMovieId)) {
    return;
  }
  renderActiveUnderlayView();
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
    if (appViewingHistory.hasActiveViewingOnDate(userState.viewingHistory, movieId, watchedOn)) {
      notifyDuplicateViewingDate(watchedOn);
    } else {
      addMovieViewing(movieId, watchedOn);
    }
  }
  if (rating != null) {
    updateRatings(appRatings.setRating(userState.ratings, movieId, rating));
  }
  if (detailMovieId === movieId && !activeMovieIds().includes(movieId) && !detailAddSessionActive) {
    dismissDetailOverlay();
    return;
  }
  refreshViewsAfterListMembershipChange({ movieId });
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

function removeMoviePresetMembership(movieId) {
  const nextLists = appLists.removeMovie(userState.lists, movieId);
  if (!updateLists(nextLists)) {
    return false;
  }
  updateRatings(appRatings.removeRating(userState.ratings, movieId));
  updateAddedAt(appAddedAt.removeAddedAt(userState.addedAt, movieId));
  recordMovieStatus(movieId, appSyncMerge.REMOVED_STATUS);
  persistUserState();
  refreshViewsAfterListMembershipChange({ movieId });
  return true;
}

function removeMovieFromCollection(movieId) {
  if (!removeMoviePresetMembership(movieId)) {
    return;
  }
  if (detailMovieId === movieId) {
    prepareDetailForPresetRemove();
    renderDetail();
    return;
  }
  render();
}

function refreshMovieRating(movieId) {
  applyHydratedRecord(movieId, { skipDetail: true });
  if (isUserRatingSortMode()) {
    if (usesServerSortedIds()) {
      invalidateServerSortCache();
      render();
    } else {
      reorderGridRows();
    }
  }
  if (detailMovieId === movieId) {
    syncDetailRatingDisplay(appRatings.getRating(userState.ratings, movieId));
  }
}

function detailPresetRemoveConfirmCopy(movieId) {
  const record = movieById.get(movieId);
  const title = record?.title || `Movie ${movieId}`;
  if (appLists.isWatched(userState.lists, movieId)) {
    return {
      title: "Remove from watched?",
      message: `Remove “${title}” from your watched list?`,
    };
  }
  return {
    title: "Remove from watchlist?",
    message: `Really remove “${title}” from your watchlist?`,
  };
}

function requestDetailPresetRemove(movieId) {
  pendingRemoveMovieId = Number(movieId);
  if (!Number.isInteger(pendingRemoveMovieId) || pendingRemoveMovieId <= 0) {
    pendingRemoveMovieId = null;
    return;
  }
  const copy = detailPresetRemoveConfirmCopy(pendingRemoveMovieId);
  if (removeConfirmTitle) {
    removeConfirmTitle.textContent = copy.title;
  }
  removeConfirmMessage.textContent = copy.message;
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
