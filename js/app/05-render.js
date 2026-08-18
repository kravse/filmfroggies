/**
 * Grid rendering. `render()` writes the whole grid from the active list's ids,
 * emitting skeleton cards for anything not hydrated yet; hydration then
 * patches single rows through applyHydratedRecord() rather than re-rendering.
 */

function posterHtml(record, size) {
  const url = record ? appTmdb.buildImageUrl(record.posterPath, size) : null;
  if (!url) {
    const label = record ? appCardHtml.escapeHtml(record.title) : "";
    return `<div class="placeholder">${label}</div>`;
  }
  return `<img data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy" decoding="async">`;
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

function cardPosterRatingsHtml(movieId) {
  if (gridViewMode !== "detail") {
    return "";
  }
  const fan = cardFanRatingHtml(movieId);
  const user = cardUserRatingHtml(movieId);
  if (!fan && !user) {
    return "";
  }
  return `<div class="card-poster-ratings">${fan}${user}</div>`;
}

/**
 * Watchlist gets a checkmark on the poster. Nothing else moves movies between
 * lists from the card.
 */
function watchlistWatchBtnHtml() {
  if (userState.activeListId !== appLists.WATCHLIST_ID) {
    return "";
  }
  return `<button type="button" class="card-watch-btn" aria-label="Mark as watched" title="Mark as watched">&#10003;</button>`;
}

function cardSortHintHtml(movieId) {
  if (
    gridViewMode !== "cards" ||
    !isWatchedListActive() ||
    usesCustomDisplayOrder()
  ) {
    return "";
  }
  const sortMode = userState.preferences.sort;
  const userRating = appRatings.getRating(userState.ratings, movieId);
  const hint = appSort.formatSortCardHint(sortMode, {
    record: movieById.get(movieId),
    userRating,
  });
  if (!hint) {
    return "";
  }
  const isUserRatingSort =
    sortMode === "user-rating-asc" || sortMode === "user-rating-desc";
  const isFanRatingSort = isFanRatingSortMode();
  let className = "card-sort-hint";
  if (isUserRatingSort) {
    className += " is-user-rating";
    if (userRating == null) {
      className += " is-empty";
    }
  } else if (isFanRatingSort) {
    className += " is-fan-rating";
  }
  return `<div class="${className}">${appCardHtml.escapeHtml(hint)}</div>`;
}

function cardPosterOnlyHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = failed
      ? `<div class="placeholder">Could not load</div>`
      : `<div class="placeholder"></div>`;
    return `<div class="poster-wrap">${body}</div>${cardSortHintHtml(movieId)}`;
  }
  const grip = listShowsReorderGrip()
    ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  return `<div class="poster-wrap">${posterHtml(record, appTmdb.POSTER_SIZES.card)}${grip}${watchlistWatchBtnHtml()}</div>${cardSortHintHtml(movieId)}`;
}

function listShowsReorderGrip() {
  return (
    appLists.isListReorderable(userState.activeListId) &&
    reorderModeActive &&
    usesCustomDisplayOrder()
  );
}

function syncSortControlUi() {
  const show =
    isWatchedListActive() && activeMovieIds().length > 0 && hasTmdbAccess();
  if (sortControl) {
    sortControl.hidden = !show;
  }
  if (listSortSelect) {
    if (show) {
      listSortSelect.value = userState.preferences.sort;
      listSortSelect.disabled = reorderModeActive;
    }
  }
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
  if (reorderModeBtn) {
    reorderModeBtn.hidden = !canReorder;
    reorderModeBtn.setAttribute("aria-pressed", String(orderLocked));
    reorderModeBtn.classList.toggle("is-order-locked", orderLocked);
    reorderModeBtn.classList.toggle("is-order-unlocked", !orderLocked);
    const lockLabel = orderLocked ? "Reorder locked" : "Reorder unlocked";
    const hint = orderLocked
      ? " Tap to unlock and reorder."
      : " Tap to lock order.";
    reorderModeBtn.setAttribute("aria-label", `${lockLabel}.${hint}`);
    reorderModeBtn.title = orderLocked
      ? "Tap to unlock list order"
      : "Tap to lock list order";
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

function toggleReorderMode() {
  setReorderMode(!reorderModeActive);
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

  return `<div class="poster-wrap">
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
  ${cardPosterRatingsHtml(movieId)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
  ${watchlistWatchBtnHtml()}
  <button type="button" class="card-remove" aria-label="Remove ${appCardHtml.escapeHtml(record.title)}" title="Remove movie">&times;</button>
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta">${cardMetaText(record)}</div>
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

  return `<article class="card${stateClass}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
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
  if (count && !hasTmdbAccess()) {
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
  const card = img.closest(".card");
  const movieId = Number(card?.dataset.movieId);
  const record = movieById.get(movieId);
  const placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  placeholder.textContent = record ? record.title : "";
  img.replaceWith(placeholder);
}

function commitListChange(nextLists) {
  if (!updateLists(nextLists)) {
    return false;
  }
  persistUserState();
  return true;
}

function watchMovie(movieId) {
  if (!commitListChange(appLists.assignMovieToList(userState.lists, appLists.WATCHED_ID, movieId))) {
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

function removeMovieFromCollection(movieId) {
  const nextLists = appLists.removeMovie(userState.lists, movieId);
  if (!updateLists(nextLists)) {
    return;
  }
  updateRatings(appRatings.removeRating(userState.ratings, movieId));
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

function requestRemoveMovie(movieId) {
  pendingRemoveMovieId = Number(movieId);
  const record = movieById.get(pendingRemoveMovieId);
  const title = record?.title || `Movie ${pendingRemoveMovieId}`;
  removeConfirmMessage.textContent = `Remove “${title}” from your collection? This cannot be undone.`;
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
