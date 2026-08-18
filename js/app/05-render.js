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
  return `<img src="${url}" alt="" loading="lazy" decoding="async">`;
}

function cardMetaText(record) {
  const parts = [
    appCardHtml.formatYear(record.releaseDate),
    appCardHtml.formatRuntime(record.runtime),
  ].filter(Boolean);
  return parts.join(" · ");
}

/**
 * Watchlist gets a Watch button; watched movies get a star toggle. Nothing else
 * moves movies between lists from the card.
 */
function cardActionsHtml(movieId) {
  if (userState.activeListId === appLists.WATCHLIST_ID) {
    return `<div class="card-actions"><button type="button" class="card-watch-btn">Watch</button></div>`;
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

function cardInnerHtml(movieId) {
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
  ${posterHtml(record, appTmdb.POSTER_SIZES.card)}
  <button type="button" class="card-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>
  <button type="button" class="card-remove" aria-label="Remove ${appCardHtml.escapeHtml(record.title)}" title="Remove movie">&times;</button>
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta">${appCardHtml.escapeHtml(cardMetaText(record))}</div>
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
  const grip = record
    ? `<button type="button" class="row-grip" aria-label="Drag to reorder" title="Drag to reorder">&#8942;&#8942;</button>`
    : "";
  const title = record ? appCardHtml.escapeHtml(record.title) : `Movie ${movieId}`;

  return `${grip}<article class="card${stateClass}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${cardInnerHtml(movieId)}
</article>`;
}

function rowHtml(movieId) {
  const modifier = gridViewMode === "list" ? "" : " movie-row--card";
  return `<div class="movie-row${modifier}" data-movie-id="${movieId}">${rowInnerHtml(movieId)}</div>`;
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
  if (count && !hasCredential()) {
    listSubtitleEl.textContent = "Add a TMDB credential in Settings to load details";
  } else if (count) {
    listSubtitleEl.textContent = "Search to add · drag to reorder";
  } else {
    listSubtitleEl.textContent = "Search TMDB to add a movie to this list";
  }
}

function setActiveList(listId) {
  if (!appLists.isListId(listId) || listId === userState.activeListId) {
    return;
  }
  userState = { ...userState, activeListId: listId };
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
  emptyState.innerHTML = hasCredential()
    ? `<strong>Nothing in ${appCardHtml.escapeHtml(listName)} yet</strong>Search for a movie above to add it here.`
    : `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to search and load movies.`;
}

function render() {
  const ids = activeMovieIds();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  renderListTabs();
  updateListHeader();
  renderEmptyState(ids.length);
}

/** Patches one row after hydration so the rest of the grid stays untouched. */
function applyHydratedRecord(movieId) {
  const row = grid.querySelector(`.movie-row[data-movie-id="${movieId}"]`);
  if (!row) {
    return;
  }
  row.innerHTML = rowInnerHtml(movieId);
  if (detailMovieId === movieId) {
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
  if (!commitListChange(appLists.removeMovie(userState.lists, movieId))) {
    return;
  }
  if (detailMovieId === movieId) {
    closeDetail();
  }
  render();
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
