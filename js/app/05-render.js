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
  if (gridViewMode !== "detail") {
    return "";
  }
  const label = appRatings.formatUserRating(
    appRatings.getRating(userState.ratings, movieId),
  );
  if (!label) {
    return "";
  }
  return `<span class="card-user-rating" aria-label="Your rating ${appCardHtml.escapeHtml(label)}">${appCardHtml.escapeHtml(label)}</span>`;
}

/**
 * Watchlist gets a Watch button; watched movies get a star toggle. Nothing else
 * moves movies between lists from the card.
 */
function cardActionsHtml(movieId) {
  if (gridViewMode === "cards") {
    return "";
  }
  if (userState.activeListId === appLists.WATCHLIST_ID) {
    return `<div class="card-actions"><button type="button" class="card-watch-btn" aria-label="Mark as watched" title="Mark as watched">&#10003;</button></div>`;
  }
  if (
    userState.activeListId === appLists.WATCHED_ID ||
    userState.activeListId === appLists.FAVOURITES_ID
  ) {
    const active = appLists.isFavourited(userState.lists, movieId);
    const label = active ? "Remove from favourites" : "Add to favourites";
    return `<div class="card-actions"><button type="button" class="card-favourite-btn${active ? " is-active" : ""}" aria-label="${label}" title="${label}" aria-pressed="${active}">&#9733;</button></div>`;
  }
  return "";
}

function cardPosterOnlyHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = failed
      ? `<div class="placeholder">Could not load</div>`
      : `<div class="placeholder"></div>`;
    return `<div class="poster-wrap">${body}</div>`;
  }
  const grip = listShowsReorderGrip()
    ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  return `<div class="poster-wrap">${posterHtml(record, appTmdb.POSTER_SIZES.card)}${grip}</div>`;
}

function listShowsReorderGrip() {
  return appLists.isListReorderable(userState.activeListId) && reorderModeActive;
}

function syncReorderModeUi() {
  const canReorder =
    appLists.isListReorderable(userState.activeListId) && activeMovieIds().length > 0;
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
  ${cardUserRatingHtml(movieId)}
  ${listShowsReorderGrip() ? `<button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>` : ""}
  <button type="button" class="card-remove" aria-label="Remove ${appCardHtml.escapeHtml(record.title)}" title="Remove movie">&times;</button>
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta">${cardMetaText(record)}</div>
  </div>
  ${cardActionsHtml(movieId)}
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
    if (userState.activeListId === appLists.WATCHED_ID) {
      listSubtitleEl.textContent =
        gridViewMode === "cards"
          ? "+ Add a movie · tap a poster for details"
          : "+ Add a movie · sorted by date added";
    } else if (reorderModeActive) {
      listSubtitleEl.textContent = "+ Add a movie · drag to reorder";
    } else {
      listSubtitleEl.textContent =
        gridViewMode === "cards"
          ? "+ Add a movie · tap a poster for details"
          : "+ Add a movie · tap a card for details";
    }
  } else {
    listSubtitleEl.textContent = "Tap + Add a movie to start this list";
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

function renderEmptyState(count) {
  if (count) {
    emptyState.hidden = true;
    emptyState.innerHTML = "";
    return;
  }
  emptyState.hidden = false;
  const listName = activeList()?.name || "this list";
  emptyState.innerHTML = hasTmdbAccess()
    ? `<strong>Nothing in ${appCardHtml.escapeHtml(listName)} yet</strong>Tap <strong>+ Add a movie</strong> to search and add one here.`
    : `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to search and load movies.`;
}

function render() {
  const ids = activeMovieIds();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  renderListTabs();
  updateListHeader();
  syncReorderModeUi();
  renderEmptyState(ids.length);
}

/** Patches one row after hydration so the rest of the grid stays untouched. */
function applyHydratedRecord(movieId, options = {}) {
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
  return hydrateMovies(activeMovieIds(), {
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

function toggleFavouriteMovie(movieId) {
  if (!commitListChange(appLists.toggleFavourite(userState.lists, movieId))) {
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
