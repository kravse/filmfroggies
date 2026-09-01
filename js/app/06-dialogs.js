/**
 * Detail overlay, settings, and about dialogs.
 *
 * The overlay is the only routed surface: it deep-links as `#movie/{id}` and
 * is driven by history state, so back and forward behave as expected.
 * Next/previous movie pushes a history entry; back returns to the previous
 * movie, then to the list underneath.
 */

const TMDB_MOVIE_URL = "https://www.themoviedb.org/movie/";

function detailShareButtonHtml() {
  return `<button type="button" id="movie-detail-share" class="icon-btn movie-detail-share-btn" aria-label="Share movie" title="Share">
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none">
    <circle cx="14.5" cy="4.5" r="2.25" stroke="currentColor" stroke-width="1.75" />
    <circle cx="14.5" cy="15.5" r="2.25" stroke="currentColor" stroke-width="1.75" />
    <circle cx="5.5" cy="10" r="2.25" stroke="currentColor" stroke-width="1.75" />
    <path d="M7.4 9.1 12.6 5.9M7.4 10.9 12.6 14.1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
  </svg>
</button>`;
}

function detailTitleRowHtml(titleText) {
  return `<div class="movie-detail-title-row">
  <h2 class="movie-detail-title" id="movie-detail-title">${titleText}</h2>
  ${detailShareButtonHtml()}
</div>`;
}

/* --- Detail overlay --- */

function detailMetaChips(record) {
  const chips = [];
  if (isDiscoverActive()) {
    const releaseDate = appCardHtml.formatReleaseDate(record.releaseDate);
    if (releaseDate) {
      chips.push(`<span class="meta-chip">${appCardHtml.escapeHtml(releaseDate)}</span>`);
    }
  } else {
    const year = appCardHtml.formatYear(record.releaseDate);
    const runtime = appCardHtml.formatRuntime(record.runtime);

    if (year) {
      chips.push(`<span class="meta-chip">${year}</span>`);
    }
    if (runtime) {
      chips.push(`<span class="meta-chip">${runtime}</span>`);
    }
  }
  const rating = appCardHtml.formatRating(record.voteAverage);

  if (rating) {
    chips.push(`<span class="meta-chip">★ ${rating}</span>`);
  }
  for (const genre of Array.isArray(record.genres) ? record.genres : []) {
    chips.push(`<span class="meta-chip">${appCardHtml.escapeHtml(genre)}</span>`);
  }
  return chips.join("");
}

function detailCreditsHtml(record) {
  const rows = [];
  const directors = appCardHtml.joinNames(record.directors);
  const cast = appCardHtml.joinNames(record.cast);

  if (directors) {
    rows.push(
      `<div><strong>${record.directors.length > 1 ? "Directors" : "Director"}:</strong> ${appCardHtml.escapeHtml(directors)}</div>`,
    );
  }
  if (cast) {
    rows.push(`<div><strong>Cast:</strong> ${appCardHtml.escapeHtml(cast)}</div>`);
  }
  return rows.join("");
}

function detailMovieAllowsRating() {
  return (
    detailMovieId != null &&
    appRatings.isRatingAllowed(
      userState.lists,
      detailMovieId,
      userState.customLists,
    )
  );
}

function discoverPresetMembership(listId, movieId) {
  return listId === appLists.WATCHED_ID
    ? appLists.isWatched(userState.lists, movieId)
    : appLists.isOnWatchlist(userState.lists, movieId);
}

function detailPresetStatusForMovie(movieId) {
  if (appLists.isWatched(userState.lists, movieId)) {
    return { state: "watched", label: "In Watched", removable: true };
  }
  if (appLists.isOnWatchlist(userState.lists, movieId)) {
    return { state: "watchlist", label: "In Watchlist", removable: true };
  }
  return { state: "none", label: "Not collected", removable: false };
}

function detailPresetStatusIndicatorHtml(movieId) {
  if (movieId == null || !userState) {
    return "";
  }
  const { state, label, removable } = detailPresetStatusForMovie(movieId);
  const iconHtml = `<span class="detail-preset-status-icon">${appCardHtml.detailPresetStatusIconHtml(state)}</span>`;
  const labelHtml = `<span class="detail-preset-status-label">${appCardHtml.escapeHtml(label)}</span>`;
  if (removable) {
    const removeLabel = state === "watched" ? "Remove from watched" : "Remove from watchlist";
    return `<button type="button" class="detail-preset-status detail-preset-status--${state}" id="detail-preset-remove" aria-label="${appCardHtml.escapeHtml(removeLabel)}">
  ${iconHtml}
  <span class="detail-preset-status-label">${appCardHtml.escapeHtml(label)}</span>
  <span class="detail-preset-status-label detail-preset-status-label--remove" aria-hidden="true">${appCardHtml.escapeHtml(removeLabel)}</span>
</button>`;
  }
  return `<div class="detail-preset-status detail-preset-status--${state}" role="status">
  ${iconHtml}
  ${labelHtml}
</div>`;
}

function discoverAddConfirmCopy(listId, title) {
  const quotedTitle = `“${title}”`;
  if (listId === appLists.WATCHED_ID) {
    return {
      title: "Mark as watched",
      message: `Mark ${quotedTitle} as watched? It will be added to your Watched list.`,
      okLabel: "Mark watched",
    };
  }
  return {
    title: "Add to watchlist",
    message: `Add ${quotedTitle} to your watchlist?`,
    okLabel: "Add to watchlist",
  };
}

function addDiscoverPresetMembership(listId, movieId) {
  const nextLists = appLists.assignMovieToList(userState.lists, listId, movieId);
  if (!commitListChange(nextLists, { movieId, status: listId })) {
    return;
  }
  recordAddedAt(movieId);
  refreshViewsAfterListMembershipChange({ movieId });
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function removeDiscoverPresetMembership(listId, movieId) {
  const nextLists = appLists.removeMovie(userState.lists, movieId);
  if (!commitListChange(nextLists, { movieId, status: appSyncMerge.REMOVED_STATUS })) {
    return;
  }
  refreshViewsAfterListMembershipChange({ movieId });
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function toggleDiscoverPresetMembership(listId, movieId) {
  if (!isDiscoverActive() || !appLists.isListId(listId)) {
    return;
  }
  if (discoverPresetMembership(listId, movieId)) {
    removeDiscoverPresetMembership(listId, movieId);
  } else {
    addDiscoverPresetMembership(listId, movieId);
  }
}

function discoverRemoveConfirmCopy(listId, title) {
  const quotedTitle = `“${title}”`;
  if (listId === appLists.WATCHED_ID) {
    return {
      title: "Remove from watched",
      message: `Remove ${quotedTitle} from your watched list?`,
      okLabel: "Remove from watched",
    };
  }
  return {
    title: "Remove from watchlist",
    message: `Remove ${quotedTitle} from your watchlist?`,
    okLabel: "Remove from watchlist",
  };
}

function openDiscoverPresetConfirm(listId, movieId, { remove = false } = {}) {
  pendingDiscoverAddMovieId = Number(movieId);
  pendingDiscoverAddListId = listId;
  pendingDiscoverConfirmRemove = remove;
  const record = movieById.get(pendingDiscoverAddMovieId);
  const title = record?.title || `Movie ${pendingDiscoverAddMovieId}`;
  const copy = remove
    ? discoverRemoveConfirmCopy(listId, title)
    : discoverAddConfirmCopy(listId, title);
  discoverAddConfirmTitle.textContent = copy.title;
  discoverAddConfirmMessage.textContent = copy.message;
  discoverAddConfirmOk.textContent = copy.okLabel;
  discoverAddConfirmOk.classList.toggle("confirm-danger", remove);
  discoverAddConfirmDialog.hidden = false;
  discoverAddConfirmCancel.focus({ preventScroll: true });
}

function requestDiscoverPresetMembership(listId, movieId) {
  if (!isDiscoverActive() || !appLists.isListId(listId)) {
    return;
  }
  if (discoverPresetMembership(listId, movieId)) {
    openDiscoverPresetConfirm(listId, movieId, { remove: true });
    return;
  }
  if (listId === appLists.WATCHED_ID) {
    requestWatchMovie(Number(movieId), { fromDiscover: true });
    return;
  }
  openDiscoverPresetConfirm(listId, movieId);
}

function closeDiscoverAddConfirm() {
  pendingDiscoverAddMovieId = null;
  pendingDiscoverAddListId = null;
  pendingDiscoverConfirmRemove = false;
  discoverAddConfirmOk?.classList.remove("confirm-danger");
  discoverAddConfirmDialog.hidden = true;
}

function confirmDiscoverPresetAdd() {
  const movieId = pendingDiscoverAddMovieId;
  const listId = pendingDiscoverAddListId;
  const removing = pendingDiscoverConfirmRemove;
  closeDiscoverAddConfirm();
  if (movieId == null || listId == null) {
    return;
  }
  if (removing) {
    removeDiscoverPresetMembership(listId, movieId);
    return;
  }
  addDiscoverPresetMembership(listId, movieId);
}

function detailListMembershipChipsHtml(movieId) {
  return appCustomLists
    .customListsForMovie(userState.customLists, movieId)
    .map(
      (list) =>
        `<button type="button" class="add-custom-list-chip is-member" data-detail-list-nav-id="${appCardHtml.escapeHtml(list.id)}">${appCardHtml.escapeHtml(list.name)}</button>`,
    )
    .join("");
}

function syncDetailListPickerSelection(movieId) {
  detailListPickerSelectedIds = new Set(
    appCustomLists.customListsForMovie(userState.customLists, movieId).map((list) => list.id),
  );
}

function detailAddToListPickerHtml(movieId) {
  const allLists = userState.customLists || [];
  if (!allLists.length) {
    return `<p class="detail-add-to-list-hint"><a href="#lists" class="detail-add-to-list-link">Create lists…</a></p>`;
  }
  return `<div class="add-custom-list-picker detail-custom-list-picker">${allLists
    .map((list) => {
      const selected = detailListPickerSelectedIds.has(list.id);
      return `<button type="button" class="add-custom-list-chip" data-detail-list-toggle-id="${appCardHtml.escapeHtml(list.id)}" aria-pressed="${selected}">${appCardHtml.escapeHtml(list.name)}</button>`;
    })
    .join("")}</div>`;
}

function detailListsEditorBodyHtml(movieId) {
  return detailAddToListPickerHtml(movieId);
}

function detailListsEditorUsesOverlay() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function renderDetailListsOverlay() {
  if (!detailListsDialogBody || detailMovieId == null) {
    return;
  }
  detailListsDialogBody.innerHTML = detailListsEditorBodyHtml(detailMovieId);
}

function openDetailListsOverlay() {
  renderDetailListsOverlay();
  if (detailListsDialog) {
    detailListsDialog.hidden = false;
  }
}

function closeDetailListsOverlay() {
  if (detailListsDialog) {
    detailListsDialog.hidden = true;
  }
}

function syncDetailListsPickerUi() {
  if (detailListPickerOpen && detailListsEditorUsesOverlay()) {
    renderDetailListsOverlay();
    return;
  }
  renderDetail();
}

function detailListsBlockHtml(movieId) {
  const membership = detailListMembershipChipsHtml(movieId);
  const membershipHtml = membership
    ? membership
    : `<span class="detail-lists-empty">Not on any lists</span>`;
  const inlineEditorOpen = detailListPickerOpen && !detailListsEditorUsesOverlay();

  return `<div class="detail-lists-block${inlineEditorOpen ? " is-editing" : ""}" id="detail-lists-block">
  <div class="detail-lists-panel"${inlineEditorOpen ? " hidden" : ""} id="detail-lists-summary">
    <span class="detail-lists-panel-title">Lists</span>
    <div class="detail-list-chips">${membershipHtml}</div>
    <button
      type="button"
      class="detail-lists-edit-btn"
      id="detail-lists-edit"
      aria-expanded="${detailListPickerOpen}"
      aria-controls="detail-lists-editor"
    >Edit</button>
  </div>
  <div class="detail-lists-editor" id="detail-lists-editor"${inlineEditorOpen ? "" : " hidden"}>
    <div class="detail-lists-editor-head">
      <span class="detail-lists-editor-title">Lists</span>
    </div>
    <div class="detail-lists-editor-body">
      ${detailListsEditorBodyHtml(movieId)}
    </div>
    <div class="detail-lists-editor-actions">
      <button type="button" class="detail-lists-save-btn" id="detail-lists-save">Save</button>
    </div>
  </div>
</div>`;
}

function saveDetailListPicker() {
  if (detailMovieId == null) {
    return;
  }
  const movieId = detailMovieId;
  let nextLists = userState.customLists;
  let customChanged = false;
  const cappedListNames = [];

  for (const list of userState.customLists || []) {
    const isMember = list.movieIds.includes(movieId);
    const shouldBeMember = detailListPickerSelectedIds.has(list.id);
    if (shouldBeMember && !isMember) {
      if (appCustomLists.isCustomListAtMovieCap(nextLists, list.id)) {
        cappedListNames.push(list.name);
        continue;
      }
      const updated = appCustomLists.addMovieToCustomList(nextLists, list.id, movieId);
      if (updated !== nextLists) {
        nextLists = updated;
        customChanged = true;
      }
    } else if (!shouldBeMember && isMember) {
      const updated = appCustomLists.removeMovieFromCustomList(nextLists, list.id, movieId);
      if (updated !== nextLists) {
        nextLists = updated;
        customChanged = true;
      }
    }
  }

  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();

  if (customChanged) {
    persistCustomLists(nextLists);
  }
  notifyCustomListMovieCaps(cappedListNames);

  if (customChanged) {
    if (isCustomListDetailActive() && !activeMovieIds().includes(movieId)) {
      dismissDetailOverlay();
      refreshViewsAfterListMembershipChange({ movieId });
      return;
    }
    refreshViewsAfterListMembershipChange({ movieId });
  }
  renderDetail();
}

function toggleDetailListPickerChip(listId) {
  if (!appCustomLists.isCustomListId(listId)) {
    return;
  }
  if (detailListPickerSelectedIds.has(listId)) {
    detailListPickerSelectedIds.delete(listId);
  } else {
    const list = appCustomLists.findCustomList(userState.customLists, listId);
    if (
      detailMovieId != null &&
      list &&
      !list.movieIds.includes(detailMovieId) &&
      appCustomLists.isCustomListAtMovieCap(userState.customLists, listId)
    ) {
      notifyCustomListMovieCapReached(list.name);
      return;
    }
    detailListPickerSelectedIds.add(listId);
  }
  syncDetailListsPickerUi();
}

function closeDetailListPicker() {
  if (!detailListPickerOpen) {
    return;
  }
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();
  renderDetail();
}

function toggleDetailListPicker() {
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  if (detailListPickerOpen) {
    closeDetailListPicker();
    return;
  }
  if (detailMovieId != null) {
    syncDetailListPickerSelection(detailMovieId);
  }
  detailListPickerOpen = true;
  if (detailListsEditorUsesOverlay()) {
    openDetailListsOverlay();
    renderDetail();
    return;
  }
  renderDetail();
}

function detailUserRatingBlockHtml(movieId) {
  if (!appRatings.isRatingAllowed(userState.lists, movieId, userState.customLists)) {
    return "";
  }

  const rating = appRatings.getRating(userState.ratings, movieId);
  const valueText = rating == null ? "—" : appRatings.formatUserRating(rating);
  const sliderValue = appRatings.sliderValueFromRating(rating);
  const editorOpen = detailRatingEditorOpen;
  const editorValueClass =
    rating == null ? "detail-rating-editor-value is-empty" : "detail-rating-editor-value";

  return `<div class="detail-rating-block${editorOpen ? " is-editing" : ""}" id="detail-rating-block">
  <div class="detail-rating-row"${editorOpen ? " hidden" : ""} id="detail-rating-summary-row">
    <span class="detail-rating-label">My Rating:</span>
    <button
      type="button"
      class="detail-rating-chip meta-chip${rating == null ? "" : " is-rated"}"
      id="detail-rating-summary"
      aria-expanded="${editorOpen}"
      aria-controls="detail-rating-editor"
      title="Edit my rating"
    >★ <span id="detail-rating-summary-value">${appCardHtml.escapeHtml(valueText)}</span></button>
  </div>
  <div class="detail-rating-editor" id="detail-rating-editor"${editorOpen ? "" : " hidden"}>
    <div class="detail-rating-editor-head">
      <span class="detail-rating-editor-title">My rating</span>
      <span class="${editorValueClass}" id="detail-rating-editor-value">${appCardHtml.escapeHtml(valueText)}</span>
    </div>
    <div class="detail-rating-slider-wrap">
      <span class="detail-rating-scale" aria-hidden="true">1.0</span>
      <div class="rating-control">
        <input
          type="range"
          class="detail-rating-slider rating-control-slider"
          id="detail-rating-slider"
          min="0"
          max="90"
          step="1"
          value="${sliderValue}"
          aria-label="My rating from 1 to 10"
          aria-valuetext="${rating == null ? "Not rated" : appRatings.formatUserRating(rating)}"
        />
        <select
          class="detail-rating-select rating-control-select"
          id="detail-rating-select"
          aria-label="My rating from 1 to 10"
        >${appRatings.ratingSelectInnerHtml(rating)}</select>
      </div>
      <span class="detail-rating-scale" aria-hidden="true">10</span>
    </div>
    <div class="detail-rating-editor-actions">
      <button type="button" class="detail-rating-btn detail-rating-btn--clear" id="detail-rating-clear"${rating == null ? " hidden" : ""}>Clear rating</button>
      <div class="detail-rating-editor-actions-main">
        <button type="button" class="detail-rating-btn detail-rating-btn--ghost" id="detail-rating-cancel">Cancel</button>
        <button type="button" class="detail-rating-btn detail-rating-btn--primary" id="detail-rating-done">Done</button>
      </div>
    </div>
  </div>
</div>`;
}

function formatViewingDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })
    : value;
}

function detailViewingSummaryText(count) {
  if (count === 0) {
    return "No viewings recorded";
  }
  if (count === 1) {
    return "Viewed once";
  }
  return `Viewed ${count} times`;
}

function detailViewingHistoryPanelHtml(movieId) {
  const entries = detailViewingEntriesForDisplay(movieId);
  const rows = entries.map((entry) => {
    const removeButton = entry.pending
      ? `<button type="button" data-viewing-remove-pending-date="${appCardHtml.escapeHtml(entry.watchedOn)}" aria-label="Remove viewing on ${appCardHtml.escapeHtml(formatViewingDate(entry.watchedOn))}">Remove</button>`
      : `<button type="button" data-viewing-remove-id="${appCardHtml.escapeHtml(entry.id)}" aria-label="Remove viewing on ${appCardHtml.escapeHtml(formatViewingDate(entry.watchedOn))}">Remove</button>`;
    const pendingClass = entry.pending ? " detail-viewing-row--pending" : "";
    return `<li class="detail-viewing-row${pendingClass}">
    <span class="detail-viewing-date">${appCardHtml.viewingDateIconHtml()}${appCardHtml.escapeHtml(formatViewingDate(entry.watchedOn))}</span>
    ${removeButton}
  </li>`;
  }).join("");
  const listHtml = rows ? `<ul>${rows}</ul>` : "";
  const summary = appCardHtml.escapeHtml(detailViewingSummaryText(entries.length));
  return `<section class="detail-viewing-history">
    <div class="detail-viewing-head">
      <p class="detail-viewing-summary">${summary}</p>
    </div>
    ${listHtml}
    <div class="detail-viewing-add">
      <input type="date" id="detail-viewing-new-date" value="${appViewingHistory.today()}" max="${appViewingHistory.today()}" aria-label="New viewing date">
      <button type="button" id="detail-viewing-add">Add viewing</button>
    </div>
  </section>`;
}

function detailViewingHistoryHtml(movieId) {
  if (!appLists.isWatched(userState.lists, movieId)) {
    return `<p class="detail-viewing-empty">Viewing history is available for movies in your Watched list.</p>`;
  }
  return detailViewingHistoryPanelHtml(movieId);
}

function detailOverviewPanelHtml(movieId, record) {
  const tagline = record.tagline
    ? `<p class="movie-detail-tagline">${appCardHtml.escapeHtml(record.tagline)}</p>`
    : "";
  const overview = `<p class="movie-detail-overview">${appCardHtml.escapeHtml(record.overview || "No overview available.")}</p>
<div class="movie-detail-credits">${detailCreditsHtml(record)}</div>`;
  if (shouldShowDetailAddForm(movieId)) {
    return `${tagline}<div class="movie-detail-meta">${detailMetaChips(record)}</div>
${overview}
${detailAddBlockHtml(movieId)}`;
  }
  return `${tagline}<div class="movie-detail-meta">${detailMetaChips(record)}</div>
${detailUserRatingBlockHtml(movieId)}
${overview}
${detailListsBlockHtml(movieId)}`;
}

function detailConfigSearchUsesOverlay() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function isDetailConfigSearchOpen() {
  return Boolean(detailConfigSearchDialog && !detailConfigSearchDialog.hidden);
}

function detailConfigPanelHtml(movieId) {
  const candidate = detailRemapCandidateId == null
    ? null
    : movieById.get(detailRemapCandidateId);
  const candidateHtml = candidate
    ? `<div class="detail-config-candidate">
        <div><strong>${appCardHtml.escapeHtml(candidate.title)}</strong><span>${appCardHtml.escapeHtml(appCardHtml.formatYear(candidate.releaseDate) || "Year unknown")}</span></div>
        <button type="button" id="detail-remap-confirm">Use this movie</button>
      </div>`
    : "";
  const findHtml = detailConfigSearchUsesOverlay()
    ? `<button type="button" class="detail-config-search-open" id="detail-remap-open-search">${candidate ? "Search again" : "Search"}</button>`
    : `<div class="detail-config-find">
      <input id="detail-remap-query" type="search" value="${appCardHtml.escapeHtml(detailRemapQuery)}" placeholder="Search by movie title." aria-label="Search by movie title." autocomplete="off" aria-controls="detail-config-results" aria-expanded="false">
      <span class="search-spinner" id="detail-remap-spinner" hidden aria-hidden="true"></span>
    </div>`;
  return `<section class="detail-config">
    <h3>Linked movie</h3>
    <p>Replace TMDB movie <strong>#${movieId}</strong> while keeping its lists, rating, and viewing history.</p>
    ${findHtml}
    <p class="detail-config-status" id="detail-remap-status" aria-live="polite"></p>
    ${candidateHtml}
  </section>`;
}

function detailConfigResultsHtml() {
  return appMovieSearchPicker.movieSearchResultsHtml(detailRemapResults, {
    escapeHtml: appCardHtml.escapeHtml,
    dataName: "detail-remap-result-id",
    dataValue: (result) => result.id,
    posterUrl: (result) => appTmdb.buildImageUrl(result.posterPath, appTmdb.POSTER_SIZES.suggest),
    meta: (result) => appCardHtml.formatYear(result.releaseDate) || "Year unknown",
    badge(result) {
      const statusId = appLists.primaryListIdForMovie(userState.lists, result.id);
      const status = statusId ? appLists.findList(userState.lists, statusId) : null;
      return status
        ? `<span class="search-suggest-added">In ${appCardHtml.escapeHtml(status.name)}</span>`
        : "";
    },
  });
}

function hideDetailConfigResults() {
  if (detailConfigResultsEl) {
    detailConfigResultsEl.hidden = true;
    detailConfigResultsEl.innerHTML = "";
  }
  document.getElementById("detail-remap-query")?.setAttribute("aria-expanded", "false");
}

function hideDetailConfigSearchResults() {
  if (!detailConfigSearchResults) return;
  detailConfigSearchResults.hidden = true;
  detailConfigSearchResults.innerHTML = "";
  detailConfigSearchQuery?.setAttribute("aria-expanded", "false");
}

function positionDetailConfigResults() {
  if (detailConfigSearchUsesOverlay()) return;
  const list = detailConfigResultsEl;
  const anchor = document.querySelector(".detail-config-find");
  if (!list || list.hidden || !anchor) return;
  const rect = anchor.getBoundingClientRect();
  const gap = 6;
  const spaceBelow = window.innerHeight - rect.bottom - 12;
  const maxHeight = Math.min(360, Math.max(120, spaceBelow));
  list.style.top = `${Math.round(rect.bottom + gap)}px`;
  list.style.left = `${Math.round(rect.left)}px`;
  list.style.width = `${Math.round(rect.width)}px`;
  list.style.maxHeight = `${maxHeight}px`;
}

function fillDetailConfigResultList(list, input) {
  if (!list) return;
  const show =
    detailMovieId != null &&
    detailBodyTab === "config" &&
    detailRemapCandidateId == null &&
    detailRemapResults.length > 0 &&
    detailMovieAllowsConfig(detailMovieId);
  if (!show) {
    list.hidden = true;
    list.innerHTML = "";
    input?.setAttribute("aria-expanded", "false");
    return;
  }
  list.innerHTML = detailConfigResultsHtml();
  list.hidden = false;
  input?.setAttribute("aria-expanded", "true");
  bindPosterImages(list);
}

function syncDetailConfigSearchOverlayResults() {
  fillDetailConfigResultList(detailConfigSearchResults, detailConfigSearchQuery);
}

function syncDetailConfigResults() {
  if (detailConfigSearchUsesOverlay()) {
    hideDetailConfigResults();
    if (isDetailConfigSearchOpen()) {
      syncDetailConfigSearchOverlayResults();
    }
    return;
  }
  hideDetailConfigSearchResults();
  if (!detailConfigResultsEl) return;
  fillDetailConfigResultList(
    detailConfigResultsEl,
    document.getElementById("detail-remap-query"),
  );
  positionDetailConfigResults();
}

function setDetailConfigSearchStatus(message) {
  if (detailConfigSearchStatus) {
    detailConfigSearchStatus.textContent = message || "";
  }
  const inlineStatus = document.getElementById("detail-remap-status");
  if (inlineStatus && !isDetailConfigSearchOpen()) {
    inlineStatus.textContent = message || "";
  }
}

function openDetailConfigSearch() {
  if (
    !detailConfigSearchUsesOverlay() ||
    detailMovieId == null ||
    !detailMovieAllowsConfig(detailMovieId) ||
    !detailConfigSearchDialog
  ) {
    return;
  }
  if (detailConfigSearchQuery) {
    detailConfigSearchQuery.value = detailRemapQuery;
  }
  detailConfigSearchDialog.hidden = false;
  syncDetailConfigSearchOverlayResults();
  detailConfigSearchQuery?.focus({ preventScroll: true });
}

function closeDetailConfigSearch() {
  if (!detailConfigSearchDialog || detailConfigSearchDialog.hidden) {
    return;
  }
  detailConfigSearchDialog.hidden = true;
  hideDetailConfigSearchResults();
  setDetailConfigSearchStatus("");
}

function detailMovieAllowsConfig(movieId) {
  return appLists.isWatched(userState.lists, movieId);
}

function detailHistoryTabButtonHtml(selected, countBadge, entryCount) {
  const countLabel = entryCount > 0 ? `, ${entryCount} entries` : "";
  return `<button type="button" class="detail-body-tab" role="tab" id="detail-tab-viewing-history" data-detail-body-tab="viewing-history" aria-selected="${selected ? "true" : "false"}" tabindex="${selected ? "0" : "-1"}" aria-label="Viewing history${countLabel}">
    <span class="detail-body-tab-label detail-body-tab-label--long">Viewing history</span>
    <span class="detail-body-tab-label detail-body-tab-label--short">History</span>${countBadge}
  </button>`;
}

function detailBodyTabsHtml(movieId, record) {
  if (shouldShowDetailAddForm(movieId)) {
    return detailOverviewPanelHtml(movieId, record);
  }
  const showExtraTabs = detailMovieAllowsConfig(movieId);
  if (!showExtraTabs && (detailBodyTab === "viewing-history" || detailBodyTab === "config")) {
    detailBodyTab = "overview";
  }
  if (!showExtraTabs) {
    return detailOverviewPanelHtml(movieId, record);
  }
  const entries = appViewingHistory.viewingEntries(userState.viewingHistory, movieId);
  const countBadge =
    entries.length > 0
      ? `<span class="detail-body-tab-count">${entries.length}</span>`
      : "";
  const overviewSelected = detailBodyTab === "overview";
  const historySelected = detailBodyTab === "viewing-history";
  const configSelected = detailBodyTab === "config";
  return `<nav class="detail-body-tabs" role="tablist" aria-label="Movie detail sections">
  <button type="button" class="detail-body-tab" role="tab" id="detail-tab-overview" data-detail-body-tab="overview" aria-selected="${overviewSelected ? "true" : "false"}" tabindex="${overviewSelected ? "0" : "-1"}">Overview</button>
  ${detailHistoryTabButtonHtml(historySelected, countBadge, entries.length)}
  <button type="button" class="detail-body-tab" role="tab" id="detail-tab-config" data-detail-body-tab="config" aria-selected="${configSelected ? "true" : "false"}" tabindex="${configSelected ? "0" : "-1"}">Config</button>
</nav>
<div class="detail-body-tabpanel" role="tabpanel" id="detail-panel-overview" aria-labelledby="detail-tab-overview"${overviewSelected ? "" : " hidden"}>
${detailOverviewPanelHtml(movieId, record)}
</div>
<div class="detail-body-tabpanel" role="tabpanel" id="detail-panel-viewing-history" aria-labelledby="detail-tab-viewing-history"${historySelected ? "" : " hidden"}>
${detailViewingHistoryHtml(movieId)}
</div>
<div class="detail-body-tabpanel" role="tabpanel" id="detail-panel-config" aria-labelledby="detail-tab-config"${configSelected ? "" : " hidden"}>
${detailConfigPanelHtml(movieId)}
</div>`;
}

function setDetailBodyTab(tab) {
  const next = tab === "viewing-history" || tab === "config" ? tab : "overview";
  if (
    (next === "viewing-history" || next === "config") &&
    (detailMovieId == null || !detailMovieAllowsConfig(detailMovieId))
  ) {
    return;
  }
  if (detailBodyTab === next) {
    return;
  }
  if (next === "viewing-history" && detailRatingEditorOpen) {
    cancelDetailRatingEditor();
  }
  detailBodyTab = next;
  if (next !== "config") {
    detailRemapCandidateId = null;
    closeDetailConfigSearch();
  }
  renderDetail();
}

const detailRemapSearchPicker = appMovieSearchPicker.createMovieSearchPicker({
  search: searchMovies,
  debounceMs: SEARCH_DEBOUNCE_MS,
  onBusy(busy) {
    const inlineSpinner = document.getElementById("detail-remap-spinner");
    if (inlineSpinner) inlineSpinner.hidden = !busy;
    if (detailConfigSearchSpinner) detailConfigSearchSpinner.hidden = !busy;
    if (busy) setDetailConfigSearchStatus("Searching TMDB…");
  },
  onResults(results) {
    if (detailMovieId == null) return;
    detailRemapResults = results
      .filter((result) => result.id !== detailMovieId)
      .slice(0, 8);
    syncDetailConfigResults();
    setDetailConfigSearchStatus(
      detailRemapResults.length ? "" : "No TMDB movies matched that title.",
    );
  },
  onError() {
    setDetailConfigSearchStatus("TMDB search failed. Try again.");
  },
});

function onDetailRemapQueryInput(event) {
  if (event.target.id !== "detail-remap-query" && event.target.id !== "detail-config-search-query") {
    return;
  }
  if (detailMovieId == null || !detailMovieAllowsConfig(detailMovieId)) return;
  const query = event.target.value.trim();
  detailRemapQuery = event.target.value;
  if (!query) {
    detailRemapSearchPicker.clear();
    detailRemapResults = [];
    hideDetailConfigResults();
    hideDetailConfigSearchResults();
    setDetailConfigSearchStatus("");
    return;
  }
  if (!hasTmdbAccess()) {
    setDetailConfigSearchStatus("Log in to search TMDB.");
    return;
  }
  detailRemapSearchPicker.schedule(query);
}

function selectDetailRemapCandidate(movieId) {
  if (detailMovieId == null || !detailMovieAllowsConfig(detailMovieId)) return;
  const candidate = detailRemapResults.find((result) => result.id === Number(movieId));
  if (!candidate) return;
  detailRemapCandidateId = candidate.id;
  if (!movieById.has(candidate.id)) {
    movieById.set(candidate.id, candidate);
  }
  closeDetailConfigSearch();
  renderDetail();
}

function confirmDetailRemap() {
  if (detailMovieId == null || detailRemapCandidateId == null) return;
  if (!detailMovieAllowsConfig(detailMovieId)) return;
  const fromId = detailMovieId;
  const toId = detailRemapCandidateId;
  try {
    backupUserState(userState);
    userState = appMovieRemap.remapMovieState(userState, fromId, toId);
    persistUserState();
    detailMovieId = toId;
    detailRemapCandidateId = null;
    detailRemapQuery = "";
    detailRemapResults = [];
    detailRemapSearchPicker.clear();
    closeDetailConfigSearch();
    renderedMovieIds = renderedMovieIds.map((id) => id === fromId ? toId : id);
    history.replaceState(
      { ...history.state, detailMovieId: toId },
      "",
      `#movie/${toId}`,
    );
    render();
    renderDetail();
    hydrateMovies([toId], {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
  } catch (error) {
    const status = document.getElementById("detail-remap-status");
    if (status) status.textContent = error.message || "Could not replace the linked movie.";
  }
}

function ensureDetailAddDraftReady() {
  if (detailMovieId == null || !shouldShowDetailAddForm(detailMovieId)) {
    return false;
  }
  if (detailAddDraftMovieId !== detailMovieId) {
    initDetailAddDraft(detailMovieId);
  }
  return detailAddDraft != null;
}

function addDetailViewing() {
  const input = document.getElementById("detail-viewing-new-date");
  if (detailMovieId == null || !input?.value) return;
  if (!detailAddDraftIsWatchedSelected()) return;
  if (detailViewingDateIsTaken(detailMovieId, input.value)) {
    notifyDuplicateViewingDate(input.value);
    return;
  }
  if (ensureDetailAddDraftReady() && shouldShowDetailAddForm(detailMovieId)) {
    detailAddDraft.pendingViewingDates.add(input.value);
    syncDetailAddSaveUi();
    renderDetail();
    return;
  }
  if (!addMovieViewing(detailMovieId, input.value)) return;
  if (!shouldShowDetailAddForm(detailMovieId)) {
    detailBodyTab = "viewing-history";
    render();
  }
  persistUserState();
  renderDetail();
}

function requestRemoveDetailViewing(entryId) {
  if (detailMovieId == null) return;
  const entries = appViewingHistory.viewingEntries(userState.viewingHistory, detailMovieId);
  const entry = entries.find((item) => item.id === entryId);
  if (!entry) return;
  pendingViewingRemoveEntryId = entryId;
  viewingRemoveConfirmMessage.textContent = `Remove viewing on ${formatViewingDate(entry.watchedOn)}?`;
  viewingRemoveConfirmDialog.hidden = false;
  viewingRemoveConfirmCancel.focus({ preventScroll: true });
}

function closeViewingRemoveConfirm() {
  pendingViewingRemoveEntryId = null;
  viewingRemoveConfirmDialog.hidden = true;
}

function confirmRemoveDetailViewing() {
  const entryId = pendingViewingRemoveEntryId;
  closeViewingRemoveConfirm();
  if (!entryId) return;
  removeDetailViewing(entryId);
}

function removeDetailViewing(entryId) {
  if (detailMovieId == null) return;
  if (detailAddFormUsesDraft()) {
    detailAddDraft.pendingViewingRemoves.add(entryId);
    syncDetailAddSaveUi();
    renderDetail();
    return;
  }
  const next = appViewingHistory.removeViewing(userState.viewingHistory, detailMovieId, entryId);
  if (!updateViewingHistory(next)) return;
  persistUserState();
  render();
  renderDetail();
}

function removeDetailPendingViewing(watchedOn) {
  if (detailMovieId == null || !detailAddDraft) return;
  detailAddDraft.pendingViewingDates.delete(watchedOn);
  syncDetailAddSaveUi();
  renderDetail();
}

function syncDetailRatingDisplay(rating) {
  const chipValue = document.getElementById("detail-rating-summary-value");
  if (chipValue) {
    chipValue.textContent = rating == null ? "—" : appRatings.formatUserRating(rating);
  }

  const editorValue = document.getElementById("detail-rating-editor-value");
  if (editorValue) {
    editorValue.textContent = rating == null ? "—" : appRatings.formatUserRating(rating);
    editorValue.classList.toggle("is-empty", rating == null);
  }

  const slider = document.getElementById("detail-rating-slider");
  if (slider) {
    slider.value = String(
      rating == null
        ? appRatings.DEFAULT_SLIDER_VALUE
        : appRatings.sliderValueFromRating(rating),
    );
    slider.setAttribute(
      "aria-valuetext",
      rating == null ? "Not rated" : appRatings.formatUserRating(rating),
    );
  }

  const select = document.getElementById("detail-rating-select");
  if (select) {
    select.value = appRatings.ratingSelectDisplayValue(rating);
  }

  const clearBtn = document.getElementById("detail-rating-clear");
  if (clearBtn) {
    clearBtn.hidden = rating == null;
  }

  const summary = document.getElementById("detail-rating-summary");
  if (summary) {
    summary.classList.toggle("is-rated", rating != null);
  }
}

function syncDetailRatingEditorVisibility() {
  const block = document.getElementById("detail-rating-block");
  const summaryRow = document.getElementById("detail-rating-summary-row");
  const summary = document.getElementById("detail-rating-summary");
  const editor = document.getElementById("detail-rating-editor");
  if (!summary || !editor) {
    return;
  }
  block?.classList.toggle("is-editing", detailRatingEditorOpen);
  if (summaryRow) {
    summaryRow.hidden = detailRatingEditorOpen;
  }
  summary.setAttribute("aria-expanded", String(detailRatingEditorOpen));
  editor.hidden = !detailRatingEditorOpen;
}

function openDetailRatingEditor() {
  if (detailMovieId == null || !detailMovieAllowsRating()) {
    return;
  }
  detailRatingEditorSnapshot = appRatings.getRating(userState.ratings, detailMovieId);
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  closeDetailListsOverlay();
  detailRatingEditorOpen = true;
  renderDetail();
  focusDetailRatingControl();
}

function focusDetailRatingControl() {
  const mobile = window.matchMedia("(max-width: 640px)").matches;
  const select = document.getElementById("detail-rating-select");
  const slider = document.getElementById("detail-rating-slider");
  (mobile ? select : slider)?.focus({ preventScroll: true });
}

function closeDetailRatingEditor() {
  commitDetailRating();
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  syncDetailRatingEditorVisibility();
}

function cancelDetailRatingEditor() {
  if (detailMovieId == null) {
    return;
  }
  const snapshot = detailRatingEditorSnapshot;
  const current = appRatings.getRating(userState.ratings, detailMovieId);
  if (snapshot !== current) {
    const nextRatings =
      snapshot == null
        ? appRatings.removeRating(userState.ratings, detailMovieId)
        : appRatings.setRating(userState.ratings, detailMovieId, snapshot);
    updateRatings(nextRatings);
    persistUserState();
    refreshMovieRating(detailMovieId);
  }
  syncDetailRatingDisplay(snapshot);
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  syncDetailRatingEditorVisibility();
}

function toggleDetailRatingEditor() {
  if (detailRatingEditorOpen) {
    closeDetailRatingEditor();
    return;
  }
  openDetailRatingEditor();
}

function commitDetailRating() {
  if (detailMovieId == null || !detailRatingEditorOpen) {
    return false;
  }
  const current = appRatings.getRating(userState.ratings, detailMovieId);
  if (current === detailRatingEditorSnapshot) {
    return false;
  }
  persistUserState();
  refreshMovieRating(detailMovieId);
  return true;
}

function onDetailRatingSliderInput(event) {
  if (detailMovieId == null || !detailMovieAllowsRating()) {
    return;
  }
  const rating = appRatings.ratingFromSliderValue(Number(event.target.value));
  if (!updateRatings(appRatings.setRating(userState.ratings, detailMovieId, rating))) {
    return;
  }
  syncDetailRatingDisplay(rating);
}

function onDetailRatingSelectChange(event) {
  if (detailMovieId == null || !detailMovieAllowsRating()) {
    return;
  }
  const rating = appRatings.normalizeRating(event.target.value);
  if (!updateRatings(appRatings.setRating(userState.ratings, detailMovieId, rating))) {
    return;
  }
  syncDetailRatingDisplay(rating);
}

function clearDetailRating() {
  if (detailMovieId == null || !detailMovieAllowsRating()) {
    return;
  }
  if (!updateRatings(appRatings.removeRating(userState.ratings, detailMovieId))) {
    return;
  }
  persistUserState();
  refreshMovieRating(detailMovieId);
  syncDetailRatingDisplay(null);
}

const detailAddRatingRefs = {
  field: null,
  slider: null,
  select: null,
  clear: null,
  value: null,
};
let detailAddRatingController = null;

function detailAddWatchDateFieldHtml(movieId) {
  const icon = appCardHtml.viewingDateIconHtml();
  return `<button type="button" class="ghost-btn add-movie-watch-date-toggle" id="detail-add-watch-date-toggle">${icon}Add viewing date</button>
<div id="detail-add-watch-date-panel" hidden>
${detailViewingHistoryPanelHtml(movieId)}
</div>`;
}

function detailAddRatingFieldHtml() {
  return `<div class="user-rating-field" id="detail-add-rating-field">
  <div class="user-rating-header">
    <span class="user-rating-label">Your rating</span>
    <output class="user-rating-value is-empty" id="detail-add-rating-value" for="detail-add-rating-slider">—</output>
  </div>
  <div class="user-rating-slider-wrap">
    <span class="user-rating-scale" aria-hidden="true">1.0</span>
    <div class="rating-control">
      <input
        type="range"
        class="user-rating-slider rating-control-slider"
        id="detail-add-rating-slider"
        min="0"
        max="90"
        step="1"
        value="60"
        aria-label="Your rating from 1 to 10 (optional)"
      />
      <select
        class="user-rating-select rating-control-select"
        id="detail-add-rating-select"
        aria-label="Your rating from 1 to 10 (optional)"
      ></select>
    </div>
    <span class="user-rating-scale" aria-hidden="true">10</span>
  </div>
  <button type="button" class="user-rating-clear-btn" id="detail-add-rating-clear" hidden>Clear rating</button>
</div>`;
}

function shouldShowDetailAddForm(movieId) {
  if (movieId == null || !userState) {
    return false;
  }
  return !appLists.isWatched(userState.lists, movieId);
}

function resetDetailAddFormState() {
  detailAddWatchDateActive = false;
  detailAddRatingController?.reset();
  resetDetailAddDraft();
}

function resetDetailAddDraft() {
  detailAddDraft = null;
  detailAddSavedSnapshot = null;
  detailAddDraftMovieId = null;
}

function detailAddSavedPresetListId(movieId) {
  if (appLists.isWatched(userState.lists, movieId)) {
    return appLists.WATCHED_ID;
  }
  if (appLists.isOnWatchlist(userState.lists, movieId)) {
    return appLists.WATCHLIST_ID;
  }
  return null;
}

function captureDetailAddSavedSnapshot(movieId) {
  const viewingEntries = appViewingHistory.viewingEntries(userState.viewingHistory, movieId);
  return {
    presetListId: detailAddSavedPresetListId(movieId),
    customListIds: new Set(
      appCustomLists.customListsForMovie(userState.customLists, movieId).map((list) => list.id),
    ),
    rating: appRatings.getRating(userState.ratings, movieId),
    viewingDates: new Set(viewingEntries.map((entry) => entry.watchedOn)),
  };
}

function initDetailAddDraft(movieId) {
  detailAddDraftMovieId = movieId;
  detailAddSavedSnapshot = captureDetailAddSavedSnapshot(movieId);
  detailAddDraft = {
    presetListId: detailAddSavedSnapshot.presetListId,
    customListIds: new Set(detailAddSavedSnapshot.customListIds),
    ratingTouched: false,
    pendingViewingDates: new Set(),
    pendingViewingRemoves: new Set(),
  };
}

function detailAddFormUsesDraft() {
  return (
    detailAddDraft != null &&
    detailAddSavedSnapshot != null &&
    detailMovieId != null &&
    detailAddDraftMovieId === detailMovieId &&
    shouldShowDetailAddForm(detailMovieId)
  );
}

function detailAddDraftPresetListId(movieId) {
  if (detailAddFormUsesDraft() && detailMovieId === movieId) {
    return detailAddDraft.presetListId;
  }
  return detailAddSavedPresetListId(movieId);
}

function detailAddDraftIsWatchedSelected() {
  if (detailMovieId == null) {
    return false;
  }
  return detailAddDraftPresetListId(detailMovieId) === appLists.WATCHED_ID;
}

function detailViewingEntriesForDisplay(movieId) {
  let entries = appViewingHistory.viewingEntries(userState.viewingHistory, movieId);
  if (detailAddFormUsesDraft() && detailMovieId === movieId) {
    entries = entries.filter((entry) => !detailAddDraft.pendingViewingRemoves.has(entry.id));
    for (const watchedOn of detailAddDraft.pendingViewingDates) {
      entries.push({ id: `pending:${watchedOn}`, watchedOn, pending: true });
    }
    entries.sort(
      (a, b) =>
        a.watchedOn.localeCompare(b.watchedOn) ||
        String(a.id).localeCompare(String(b.id)),
    );
  }
  return entries;
}

function detailViewingDateIsTaken(movieId, watchedOn) {
  return detailViewingEntriesForDisplay(movieId).some((entry) => entry.watchedOn === watchedOn);
}

function detailAddDraftCustomListIsActive(listId) {
  if (detailAddFormUsesDraft()) {
    return detailAddDraft.customListIds.has(listId);
  }
  const list = appCustomLists.findCustomList(userState.customLists, listId);
  return Boolean(list?.movieIds.includes(detailMovieId));
}

function detailAddDraftRatingValue() {
  if (!detailAddFormUsesDraft()) {
    return detailMovieId != null ? appRatings.getRating(userState.ratings, detailMovieId) : null;
  }
  if (!detailAddDraft.ratingTouched) {
    return detailAddSavedSnapshot.rating;
  }
  return detailAddRatingController?.getValue() ?? null;
}

function setsEqual(a, b) {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
}

function isDetailAddFormDirty() {
  if (!detailAddFormUsesDraft()) {
    return false;
  }
  if (detailAddDraft.presetListId !== detailAddSavedSnapshot.presetListId) {
    return true;
  }
  if (!setsEqual(detailAddDraft.customListIds, detailAddSavedSnapshot.customListIds)) {
    return true;
  }
  if (detailAddDraft.ratingTouched && detailAddDraftRatingValue() !== detailAddSavedSnapshot.rating) {
    return true;
  }
  if (detailAddDraft.pendingViewingDates.size > 0 || detailAddDraft.pendingViewingRemoves.size > 0) {
    return true;
  }
  return false;
}

function syncDetailAddSaveUi() {
  const saveBtn = document.getElementById("detail-add-submit");
  if (!saveBtn) return;
  const show =
    detailMovieId != null &&
    shouldShowDetailAddForm(detailMovieId) &&
    isDetailAddFormDirty();
  const wasIdle = saveBtn.classList.contains("detail-add-submit--idle");
  saveBtn.classList.toggle("detail-add-submit--idle", !show);
  if (show && wasIdle) {
    saveBtn.classList.remove("detail-add-submit--enter");
    void saveBtn.offsetWidth;
    saveBtn.classList.add("detail-add-submit--enter");
  } else if (!show) {
    saveBtn.classList.remove("detail-add-submit--enter");
  }
  saveBtn.setAttribute("aria-hidden", show ? "false" : "true");
  saveBtn.tabIndex = show ? 0 : -1;
}

function detailAddPresetIsActive(listId, movieId) {
  return detailAddDraftPresetListId(movieId) === listId;
}

function detailAddPresetOptionHtml(listId, name, iconPreset, movieId) {
  const pressed = detailAddPresetIsActive(listId, movieId);
  return `<button type="button" class="add-list-option" data-detail-add-list-id="${appCardHtml.escapeHtml(listId)}" aria-pressed="${pressed}">${appCardHtml.addListPresetIconHtml(iconPreset)}<span class="add-list-name">${appCardHtml.escapeHtml(name)}</span></button>`;
}

function detailAddCustomListsHtml(movieId) {
  const lists = userState.customLists || [];
  if (!lists.length) {
    return `<p class="detail-add-to-list-hint"><a href="#lists" class="detail-add-to-list-link">Create lists…</a></p>`;
  }
  return `<p class="add-movie-pick-label">Also add to</p>
<div class="add-custom-list-picker" id="detail-add-custom-list-picker">${lists
    .map((list) => {
      const selected = detailAddDraftCustomListIsActive(list.id);
      return `<button type="button" class="add-custom-list-chip" data-detail-add-custom-list-id="${appCardHtml.escapeHtml(list.id)}" aria-pressed="${selected}">${appCardHtml.escapeHtml(list.name)}</button>`;
    })
    .join("")}</div>`;
}

function detailAddBlockHtml(movieId) {
  const savedOnWatchlist = appLists.isOnWatchlist(userState.lists, movieId);
  const watchedSelected = detailAddDraftIsWatchedSelected();
  const extrasHidden = watchedSelected ? "" : " hidden";
  const watchlistOption = savedOnWatchlist
    ? ""
    : detailAddPresetOptionHtml(appLists.WATCHLIST_ID, "Watchlist", "watchlist", movieId);
  return `<section class="detail-add-block" id="detail-add-block">
  <p class="add-movie-pick-label">Add to</p>
  <div class="add-list-picker" id="detail-add-list-picker" role="group" aria-label="Choose a list">
    ${watchlistOption}${detailAddPresetOptionHtml(appLists.WATCHED_ID, "Watched", "watched", movieId)}
  </div>
  <div id="detail-add-watched-extras"${extrasHidden}>
    ${detailAddRatingFieldHtml()}
    <div class="add-movie-watch-date-wrap" id="detail-add-watch-date-wrap">
      ${detailAddWatchDateFieldHtml(movieId)}
    </div>
  </div>
  <div class="add-movie-custom-lists" id="detail-add-custom-lists-section">
    ${detailAddCustomListsHtml(movieId)}
  </div>
</section>`;
}

function ensureDetailAddRatingController() {
  if (!detailAddRatingController) {
    detailAddRatingController = appRatingFieldUi.createRatingFieldController(
      detailAddRatingRefs,
      appRatings,
    );
  }
  return detailAddRatingController;
}

function syncDetailAddWatchDateUi() {
  const movieId = detailMovieId;
  const watchedSelected = detailAddDraftIsWatchedSelected();
  const extras = document.getElementById("detail-add-watched-extras");
  if (extras) {
    extras.hidden = !watchedSelected;
  }
  if (!watchedSelected) {
    detailAddWatchDateActive = false;
  }
  const toggle = document.getElementById("detail-add-watch-date-toggle");
  const panel = document.getElementById("detail-add-watch-date-panel");
  if (toggle) {
    toggle.hidden = !watchedSelected || detailAddWatchDateActive;
  }
  if (panel) {
    panel.hidden = !watchedSelected || !detailAddWatchDateActive;
  }
}

function syncDetailAddFormUi() {
  const root = document.getElementById("detail-add-block");
  const movieId = detailMovieId;
  if (!root || movieId == null) {
    return;
  }
  root.querySelectorAll("[data-detail-add-list-id]").forEach((button) => {
    const listId = button.dataset.detailAddListId;
    button.setAttribute("aria-pressed", String(detailAddPresetIsActive(listId, movieId)));
  });
  root.querySelectorAll("[data-detail-add-custom-list-id]").forEach((button) => {
    const listId = button.dataset.detailAddCustomListId;
    button.setAttribute(
      "aria-pressed",
      String(detailAddDraftCustomListIsActive(listId)),
    );
  });
  syncDetailAddWatchDateUi();
  syncDetailAddSaveUi();
}

function bindDetailAddForm() {
  if (!document.getElementById("detail-add-block")) {
    return;
  }
  const movieId = detailMovieId;
  if (movieId != null && detailAddDraftMovieId !== movieId) {
    initDetailAddDraft(movieId);
  }
  detailAddRatingRefs.field = document.getElementById("detail-add-rating-field");
  detailAddRatingRefs.slider = document.getElementById("detail-add-rating-slider");
  detailAddRatingRefs.select = document.getElementById("detail-add-rating-select");
  detailAddRatingRefs.clear = document.getElementById("detail-add-rating-clear");
  detailAddRatingRefs.value = document.getElementById("detail-add-rating-value");
  const controller = ensureDetailAddRatingController();
  controller.initSelect();
  const draftRating = detailAddDraftRatingValue();
  if (draftRating != null) {
    controller.setValue(draftRating);
  } else {
    controller.reset();
  }
  if (detailAddDraft?.ratingTouched && draftRating == null) {
    controller.clear();
  }
  syncDetailAddFormUi();
}

function prepareDetailForPresetRemove() {
  detailAddSessionActive = true;
  detailBodyTab = "overview";
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailAddWatchDateActive = false;
  if (detailMovieId != null) {
    initDetailAddDraft(detailMovieId);
  }
  detailAddRatingController?.reset();
}

function detailRemoveFromCollection(movieId) {
  return removeMoviePresetMembership(movieId);
}

function detailAssignPresetList(listId, movieId) {
  const nextLists = appLists.assignMovieToList(userState.lists, listId, movieId);
  if (!commitListChange(nextLists, { movieId, status: listId })) {
    return false;
  }
  recordAddedAt(movieId);
  return true;
}

function onDetailAddListOptionClick(listId) {
  if (detailMovieId == null || !shouldShowDetailAddForm(detailMovieId)) {
    return;
  }
  if (detailAddDraftMovieId !== detailMovieId) {
    initDetailAddDraft(detailMovieId);
  }
  if (listId !== appLists.WATCHED_ID && listId !== appLists.WATCHLIST_ID) {
    return;
  }
  detailAddSessionActive = true;
  if (detailAddDraft.presetListId === listId) {
    detailAddDraft.presetListId = null;
    if (listId === appLists.WATCHED_ID) {
      detailAddDraft.ratingTouched = false;
      detailAddDraft.pendingViewingDates.clear();
      detailAddDraft.pendingViewingRemoves.clear();
      detailAddRatingController?.reset();
      detailAddWatchDateActive = false;
    }
  } else {
    detailAddDraft.presetListId = listId;
  }
  renderDetail();
}

function onDetailAddCustomListClick(listId) {
  if (detailMovieId == null || !appCustomLists.isCustomListId(listId) || !shouldShowDetailAddForm(detailMovieId)) {
    return;
  }
  if (detailAddDraftMovieId !== detailMovieId) {
    initDetailAddDraft(detailMovieId);
  }
  const list = appCustomLists.findCustomList(userState.customLists, listId);
  if (!list) {
    return;
  }
  if (detailAddDraft.customListIds.has(listId)) {
    detailAddDraft.customListIds.delete(listId);
  } else {
    if (appCustomLists.isCustomListAtMovieCap(userState.customLists, listId)) {
      notifyCustomListMovieCapReached(list.name);
      return;
    }
    detailAddDraft.customListIds.add(listId);
  }
  syncDetailAddFormUi();
}

function onDetailAddWatchDateToggleClick() {
  if (detailMovieId == null || !detailAddDraftIsWatchedSelected()) {
    return;
  }
  detailAddWatchDateActive = true;
  syncDetailAddWatchDateUi();
  document.getElementById("detail-viewing-new-date")?.focus({ preventScroll: true });
}

function onDetailAddRatingSliderInput() {
  if (!ensureDetailAddDraftReady()) {
    return;
  }
  ensureDetailAddRatingController().onSliderInput();
  detailAddDraft.ratingTouched = true;
  syncDetailAddSaveUi();
}

function onDetailAddRatingSelectChange() {
  if (!ensureDetailAddDraftReady()) {
    return;
  }
  ensureDetailAddRatingController().onSelectChange();
  detailAddDraft.ratingTouched = true;
  syncDetailAddSaveUi();
}

function clearDetailAddRating() {
  if (!ensureDetailAddDraftReady()) {
    return;
  }
  ensureDetailAddRatingController().clear();
  detailAddDraft.ratingTouched = true;
  syncDetailAddSaveUi();
}

function saveDetailAddForm() {
  if (detailMovieId == null || !detailAddFormUsesDraft() || !isDetailAddFormDirty()) {
    return false;
  }
  const movieId = detailMovieId;
  const saved = detailAddSavedSnapshot;
  const draft = detailAddDraft;
  const cappedListNames = [];

  if (draft.presetListId !== saved.presetListId) {
    if (draft.presetListId == null) {
      if (!removeMoviePresetMembership(movieId)) {
        return false;
      }
    } else if (!detailAssignPresetList(draft.presetListId, movieId)) {
      return false;
    }
  }

  if (draft.presetListId === appLists.WATCHED_ID && draft.ratingTouched) {
    setMovieRating(movieId, detailAddRatingController?.getValue() ?? null);
  }

  for (const entryId of draft.pendingViewingRemoves) {
    const next = appViewingHistory.removeViewing(userState.viewingHistory, movieId, entryId);
    updateViewingHistory(next);
  }
  for (const watchedOn of draft.pendingViewingDates) {
    addMovieViewing(movieId, watchedOn);
  }

  let nextCustomLists = userState.customLists;
  for (const list of userState.customLists) {
    const wasMember = saved.customListIds.has(list.id);
    const shouldMember = draft.customListIds.has(list.id);
    if (shouldMember && !wasMember) {
      if (appCustomLists.isCustomListAtMovieCap(nextCustomLists, list.id)) {
        cappedListNames.push(list.name);
        continue;
      }
      nextCustomLists = appCustomLists.addMovieToCustomList(nextCustomLists, list.id, movieId);
    } else if (!shouldMember && wasMember) {
      nextCustomLists = appCustomLists.removeMovieFromCustomList(nextCustomLists, list.id, movieId);
    }
  }
  if (nextCustomLists !== userState.customLists) {
    persistCustomLists(nextCustomLists);
  }

  persistUserState();
  notifyCustomListMovieCaps(cappedListNames);
  refreshViewsAfterListMembershipChange({ movieId });
  detailAddSessionActive = false;
  detailAddWatchDateActive = false;
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailBodyTab = "overview";
  if (appLists.isWatched(userState.lists, movieId)) {
    resetDetailAddDraft();
  } else {
    initDetailAddDraft(movieId);
  }
  renderDetail();
  return true;
}

function detailAddDiscardMovieTitle() {
  const record = detailMovieId != null ? movieById.get(detailMovieId) : null;
  return record?.title ? `“${record.title}”` : "This movie";
}

function detailAddDiscardChangeSummaries() {
  if (!detailAddFormUsesDraft()) {
    return [];
  }
  const saved = detailAddSavedSnapshot;
  const draft = detailAddDraft;
  const title = detailAddDiscardMovieTitle();
  const lines = [];

  if (draft.presetListId !== saved.presetListId) {
    if (draft.presetListId === appLists.WATCHLIST_ID) {
      lines.push(`Added ${title} to your watchlist`);
    } else if (draft.presetListId === appLists.WATCHED_ID) {
      lines.push(`Marked ${title} as watched`);
    } else if (saved.presetListId === appLists.WATCHLIST_ID) {
      lines.push(`Removed ${title} from your watchlist`);
    } else if (saved.presetListId === appLists.WATCHED_ID) {
      lines.push(`Removed ${title} from watched`);
    }
  }

  for (const listId of draft.customListIds) {
    if (!saved.customListIds.has(listId)) {
      const list = appCustomLists.findCustomList(userState.customLists, listId);
      lines.push(`Added ${title} to ${list?.name ? `“${list.name}”` : "a list"}`);
    }
  }
  for (const listId of saved.customListIds) {
    if (!draft.customListIds.has(listId)) {
      const list = appCustomLists.findCustomList(userState.customLists, listId);
      lines.push(`Removed ${title} from ${list?.name ? `“${list.name}”` : "a list"}`);
    }
  }

  if (draft.ratingTouched && detailAddDraftRatingValue() !== saved.rating) {
    const rating = detailAddDraftRatingValue();
    if (rating != null) {
      lines.push(`Set your rating to ${appRatings.formatUserRating(rating)}`);
    } else {
      lines.push("Cleared your rating");
    }
  }

  if (draft.pendingViewingDates.size === 1) {
    lines.push("Added a viewing date");
  } else if (draft.pendingViewingDates.size > 1) {
    lines.push(`Added ${draft.pendingViewingDates.size} viewing dates`);
  }
  if (draft.pendingViewingRemoves.size === 1) {
    lines.push("Removed a viewing date");
  } else if (draft.pendingViewingRemoves.size > 1) {
    lines.push(`Removed ${draft.pendingViewingRemoves.size} viewing dates`);
  }

  return lines;
}

function detailAddDiscardMessageText() {
  const lines = detailAddDiscardChangeSummaries();
  if (!lines.length) {
    return "You have unsaved changes. Save before you leave?";
  }
  return `${lines.join(". ")}. Save before you leave?`;
}

function syncDetailAddDiscardDialog() {
  if (detailAddDiscardMessage) {
    detailAddDiscardMessage.textContent = detailAddDiscardMessageText();
  }
}

function closeDetailAddDiscardConfirm() {
  detailAddDiscardPendingAction = null;
  if (detailAddDiscardDialog) {
    detailAddDiscardDialog.hidden = true;
  }
}

function requestDetailAddDiscard(action) {
  if (!isDetailAddFormDirty()) {
    executeDetailAddDiscardAction(action);
    return;
  }
  detailAddDiscardPendingAction = action;
  syncDetailAddDiscardDialog();
  if (detailAddDiscardDialog) {
    detailAddDiscardDialog.hidden = false;
    detailAddDiscardSave?.focus({ preventScroll: true });
  }
}

function confirmDetailAddDiscard() {
  const action = detailAddDiscardPendingAction;
  closeDetailAddDiscardConfirm();
  resetDetailAddDraft();
  executeDetailAddDiscardAction(action);
}

function confirmDetailAddSaveAndLeave() {
  const action = detailAddDiscardPendingAction;
  if (!saveDetailAddForm()) {
    return;
  }
  closeDetailAddDiscardConfirm();
  executeDetailAddDiscardAction(action);
}

function executeDetailAddDiscardAction(action) {
  if (!action) {
    return;
  }
  if (action.type === "dismiss") {
    dismissDetailOverlayNow();
    return;
  }
  if (action.type === "close") {
    closeDetailNow(action.options || {});
    return;
  }
  if (action.type === "step") {
    stepDetailNow(action.delta);
    return;
  }
  if (action.type === "open") {
    openDetailNow(action.movieId, action.options || {});
    return;
  }
  if (action.type === "sync") {
    if (action.targetId == null) {
      closeDetailNow({ popHistory: false });
      return;
    }
    openDetailNow(action.targetId, { pushHistory: false });
  }
}

function setMovieShareStatus(message) {
  if (movieShareStatus) {
    movieShareStatus.textContent = message || "";
  }
}

function closeMovieShareDialog() {
  if (movieShareDialog) {
    movieShareDialog.hidden = true;
  }
  setMovieShareStatus("");
}

function openMovieShareDialog() {
  if (detailMovieId == null || !movieShareDialog || !movieShareUrlInput) {
    return;
  }
  movieShareUrlInput.value = appMovieShare.movieShareUrl(
    window.location.href,
    detailMovieId,
  );
  setMovieShareStatus("");
  movieShareDialog.hidden = false;
  movieShareUrlInput.focus({ preventScroll: true });
  movieShareUrlInput.select();
}

async function copyMovieShareUrl() {
  const url = movieShareUrlInput?.value || "";
  if (!url) {
    return;
  }
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("clipboard unavailable");
    }
    await navigator.clipboard.writeText(url);
    setMovieShareStatus("Copied.");
  } catch (_) {
    movieShareUrlInput?.select();
    setMovieShareStatus("Select the link and copy it.");
  }
}

function detailPosterWithTmdbLinkHtml(posterInnerHtml, movieId) {
  const link =
    movieId != null
      ? `<a class="detail-link detail-poster-link" href="${TMDB_MOVIE_URL}${movieId}" target="_blank" rel="noopener noreferrer">View on TMDB</a>`
      : "";
  return `<div class="movie-detail-poster-stack">${posterInnerHtml}${link}</div>`;
}

function renderDetail() {
  if (detailMovieId == null) {
    return;
  }

  const ids = detailNavigationIds();
  const index = ids.indexOf(detailMovieId);
  const record = movieById.get(detailMovieId);

  detailEyebrow.textContent =
    index >= 0 ? `${index + 1} of ${ids.length}` : "Not in this list";
  const navigable = index >= 0;
  detailPrevBtn.hidden = !navigable;
  detailNextBtn.hidden = !navigable;
  if (navigable) {
    detailPrevBtn.disabled = index <= 0;
    detailNextBtn.disabled = index >= ids.length - 1;
  }

  if (!record) {
    let heading = "Loading…";
    let note = "";
    if (!hasTmdbAccess()) {
      heading = "Log in to see this movie";
      note = "Log in or sign up to load details from TMDB.";
    } else if (movieErrors.has(detailMovieId)) {
      heading = "Could not load this movie";
      note = "TMDB did not return details. Check your credential and connection.";
    }
    detailPoster.innerHTML = detailPosterWithTmdbLinkHtml(
      detailPosterSkeletonHtml(),
      detailMovieId
    );
    const addForm = shouldShowDetailAddForm(detailMovieId)
      ? detailAddBlockHtml(detailMovieId)
      : "";
    detailBody.innerHTML = `${detailTitleRowHtml(heading)}
<p class="movie-detail-overview">${note}</p>${friendDetailNoteHtml(detailMovieId)}${typeof friendActivityDetailNoteHtml === "function" ? friendActivityDetailNoteHtml() : ""}${addForm}`;
  } else {
    detailPoster.innerHTML = detailPosterWithTmdbLinkHtml(
      detailPosterFrameHtml(record, appTmdb.POSTER_SIZES.detail),
      detailMovieId
    );
    bindPosterImages(detailPoster);
    detailBody.innerHTML = `${detailTitleRowHtml(appCardHtml.escapeHtml(record.title))}
${friendDetailNoteHtml(detailMovieId)}${typeof friendActivityDetailNoteHtml === "function" ? friendActivityDetailNoteHtml() : ""}
${detailBodyTabsHtml(detailMovieId, record)}`;
  }

  const statusIndicator = detailPresetStatusIndicatorHtml(detailMovieId);
  const leftActions = statusIndicator ? [statusIndicator] : [];
  const saveBtnHtml = shouldShowDetailAddForm(detailMovieId)
    ? `<button type="button" class="primary-btn detail-add-submit detail-add-submit--idle" id="detail-add-submit" aria-hidden="true" tabindex="-1">Save</button>`
    : "";

  detailActions.innerHTML = `<div class="detail-actions-left">${leftActions.join("")}</div>
<div class="detail-actions-right">${saveBtnHtml}</div>`;
  if (record) {
    syncDetailRatingDisplay(appRatings.getRating(userState.ratings, detailMovieId));
    syncDetailRatingEditorVisibility();
  }
  bindDetailAddForm();
  syncDetailAddSaveUi();
  syncDetailConfigResults();
}

function captureUnderlayScroll() {
  underlayScrollY = window.scrollY;
}

function restoreUnderlayScroll() {
  const y = underlayScrollY;
  window.scrollTo(0, y);
  requestAnimationFrame(() => window.scrollTo(0, y));
}

function detailHistoryState(movieId) {
  return {
    detailMovieId: movieId,
    appView,
    activeCustomListId,
    activeFriendId: isFriendViewActive() ? activeFriendId : null,
    friendViewName: isFriendViewActive() ? friendViewName : null,
    discoverTab: isDiscoverActive() ? discoverTab : null,
    discoverPage: isDiscoverActive() ? discoverPage : null,
  };
}

function movieHash(id) {
  return `#movie/${id}`;
}

const MAIN_HISTORY_PLACEHOLDER_HASH = "#_";

function pushMovieHistory(id) {
  const hash = movieHash(id);
  const state = detailHistoryState(id);
  const path = window.location.pathname + window.location.search;
  if (window.location.hash === hash) {
    history.replaceState(state, "", path + hash);
    markProgrammaticLocation();
    return;
  }
  // iOS Safari records two entries when pushState first introduces a hash.
  // Seed a placeholder hash on the current list entry, then push the movie.
  if (!window.location.hash) {
    const underlayState =
      history.state && typeof history.state === "object" ? history.state : { appView };
    history.replaceState(underlayState, "", path + MAIN_HISTORY_PLACEHOLDER_HASH);
  }
  history.pushState(state, "", path + hash);
  markProgrammaticLocation();
}

function stripMainHistoryPlaceholder() {
  if (window.location.hash !== MAIN_HISTORY_PLACEHOLDER_HASH) {
    return;
  }
  history.replaceState(
    history.state,
    "",
    window.location.pathname + window.location.search,
  );
  markProgrammaticLocation();
}

function underlayHistoryEntry() {
  const path = window.location.pathname + window.location.search;
  if (isDiscoverActive()) {
    const hash = appDiscover.buildDiscoverHash(discoverTab, discoverPage);
    return {
      state: { appView: "discover", discoverTab, discoverPage },
      url: path + hash,
    };
  }
  if (isCustomListDetailActive() && activeCustomListId) {
    const hash = `#lists/${encodeURIComponent(activeCustomListId)}`;
    return {
      state: { appView: "customDetail", activeCustomListId },
      url: path + hash,
    };
  }
  if (isFriendViewActive() && activeFriendId) {
    return {
      state: { appView: "friend", activeFriendId, friendViewName },
      url: path + appFriendView.buildFriendHash(activeFriendId),
    };
  }
  if (isCustomListIndexActive()) {
    return {
      state: { appView: "customIndex" },
      url: path + "#lists",
    };
  }
  return {
    state: { appView: "main" },
    url: path,
  };
}

/** Close the overlay in place; sync the URL without history.back(). */
function dismissDetailOverlay() {
  if (detailMovieId == null) {
    return;
  }
  if (isDetailAddFormDirty()) {
    requestDetailAddDiscard({ type: "dismiss" });
    return;
  }
  dismissDetailOverlayNow();
}

function dismissDetailOverlayNow() {
  if (detailMovieId == null) {
    return;
  }
  closeDetail({ popHistory: false });
  restoreUnderlayScroll();
  const { state, url } = underlayHistoryEntry();
  history.replaceState(state, "", url);
  markProgrammaticLocation();
  detailClosedMovieId = null;
}

function openDetail(movieId, options = {}) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  if (detailMovieId != null && detailMovieId !== id && isDetailAddFormDirty()) {
    requestDetailAddDiscard({ type: "open", movieId: id, options });
    return;
  }

  if (detailMovieId != null && detailMovieId !== id) {
    detailListPickerOpen = false;
    detailListPickerSelectedIds.clear();
    closeDetailListsOverlay();
  }

  openDetailNow(id, options);
}

function openDetailNow(movieId, options = {}) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  const openingOverUnderlay = detailDialog.hidden && options.pushHistory !== false;
  if (openingOverUnderlay) {
    captureUnderlayScroll();
  }

  const previousDetailMovieId = detailMovieId;
  detailMovieId = id;
  detailBodyTab = "overview";
  detailRemapCandidateId = null;
  detailRemapQuery = "";
  detailRemapResults = [];
  detailRemapSearchPicker.clear();
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  const sameMovie = previousDetailMovieId === id;
  const keepAddSession = sameMovie && detailAddSessionActive;
  resetDetailAddFormState();
  detailAddSessionActive = keepAddSession || !appLists.isWatched(userState.lists, id);
  detailFriendActivityContext = options.friendActivity || null;
  closeMovieShareDialog();
  closeDetailListsOverlay();
  closeDetailConfigSearch();
  detailDialog.hidden = false;
  document.body.classList.add("movie-detail-open");
  persistViewRestoreContext();
  renderDetail();
  detailCloseBtn.focus({ preventScroll: true });

  if (options.pushHistory !== false) {
    pushMovieHistory(id);
  }
  if (openingOverUnderlay) {
    restoreUnderlayScroll();
  }

  if (!appTmdb.isDetailedMovieRecord(movieById.get(id))) {
    hydrateMovies([id], {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
  }
}

function closeDetail(options = {}) {
  if (detailMovieId == null) {
    return;
  }
  if (isDetailAddFormDirty()) {
    requestDetailAddDiscard({ type: "close", options });
    return;
  }
  closeDetailNow(options);
}

function closeDetailNow(options = {}) {
  if (detailMovieId == null) {
    return;
  }
  commitDetailRating();
  const closingId = detailMovieId;
  const hadHistoryEntry = history.state?.detailMovieId != null;
  detailMovieId = null;
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  resetDetailAddFormState();
  detailAddSessionActive = false;
  detailFriendActivityContext = null;
  closeMovieShareDialog();
  closeDetailListsOverlay();
  hideDetailConfigResults();
  closeDetailConfigSearch();
  detailDialog.hidden = true;
  document.body.classList.remove("movie-detail-open");
  flushUnderlayAfterDetailClose();

  if (options.popHistory !== false && hadHistoryEntry) {
    detailCloseNavigationPending = true;
    detailClosedMovieId = closingId;
    history.back();
  } else {
    detailClosedMovieId = null;
  }
}

function stepDetail(delta) {
  const ids = detailNavigationIds();
  const index = ids.indexOf(detailMovieId);
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return;
  }
  if (isDetailAddFormDirty()) {
    requestDetailAddDiscard({ type: "step", delta });
    return;
  }
  stepDetailNow(delta);
}

function stepDetailNow(delta) {
  const ids = detailNavigationIds();
  const index = ids.indexOf(detailMovieId);
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return;
  }
  commitDetailRating();
  openDetail(ids[nextIndex]);
}

function movieIdFromHash() {
  const match = /^#movie\/(\d+)$/.exec(window.location.hash || "");
  return match ? Number(match[1]) : null;
}

/** Single source of truth for the overlay on load, back, and forward. */
function syncDetailFromLocation() {
  const id = movieIdFromHash();
  if (id == null) {
    if (isDetailAddFormDirty()) {
      requestDetailAddDiscard({ type: "sync", targetId: null });
      return;
    }
    closeDetail({ popHistory: false });
    return;
  }
  if (id !== detailMovieId) {
    if (isDetailAddFormDirty()) {
      requestDetailAddDiscard({ type: "sync", targetId: id });
      return;
    }
    openDetail(id, { pushHistory: false });
  }
}

/* --- Settings --- */

function accountDisplayInitial(config) {
  const source = config ? appDisplayName.resolveDisplayName(config) : "?";
  return source.charAt(0).toUpperCase() || "?";
}

let accountAuthMode = "login";
let settingsTab = "account";

function setSettingsTab(tab) {
  settingsTab = tab === "config" ? tab : "account";
  const accountSelected = settingsTab === "account";
  const configSelected = settingsTab === "config";

  settingsTabAccount.setAttribute("aria-selected", accountSelected ? "true" : "false");
  settingsTabAccount.tabIndex = accountSelected ? 0 : -1;
  settingsTabConfig.setAttribute("aria-selected", configSelected ? "true" : "false");
  settingsTabConfig.tabIndex = configSelected ? 0 : -1;

  settingsPanelAccount.hidden = !accountSelected;
  settingsPanelConfig.hidden = !configSelected;
}

function setAccountAuthMode(mode) {
  accountAuthMode = mode === "signup" ? "signup" : "login";
  const loginSelected = accountAuthMode === "login";
  accountAuthTabLogin.setAttribute("aria-selected", loginSelected ? "true" : "false");
  accountAuthTabLogin.tabIndex = loginSelected ? 0 : -1;
  accountAuthTabSignup.setAttribute("aria-selected", loginSelected ? "false" : "true");
  accountAuthTabSignup.tabIndex = loginSelected ? -1 : 0;
  accountAuthForm?.setAttribute(
    "aria-labelledby",
    loginSelected ? "account-auth-tab-login" : "account-auth-tab-signup",
  );
  accountSubmitBtn.textContent = loginSelected ? "Log in" : "Create account";
  if (loginTitle) {
    loginTitle.textContent = loginSelected ? "Log in" : "Sign up";
  }
  accountAuthTitle.textContent = loginSelected
    ? `Log in to ${SITE_BRAND_NAME}`
    : `Create your ${SITE_BRAND_NAME} account`;
  if (accountAuthNote) {
    accountAuthNote.textContent = loginSelected
      ? "Log in to pick up your lists on this device. Friends can browse them when you both agree."
      : "You need an invite code to sign up. Your lists follow you to every device you log in on.";
  }
  accountPasswordInput.placeholder = loginSelected ? "Your password" : "At least 8 characters";
  accountPasswordInput.autocomplete = loginSelected ? "current-password" : "new-password";
  if (accountInviteField) {
    accountInviteField.hidden = loginSelected;
  }
}

function refreshSettings() {
  refreshAccountSection();
  syncFriendFanRatingsUi();
  setStatus(cacheStatus, "");
  refreshCollectionTransferStatus();
}

// Settings holds nothing a logged-out visitor can act on, so every entry point
// lands on the login dialog until there is an account.
function openSettings() {
  if (!accountSyncEnabled()) {
    openLogin();
    return;
  }
  refreshSettings();
  setSettingsTab("account");
  settingsDialog.hidden = false;
  settingsBtn.setAttribute("aria-expanded", "true");
  settingsClose.focus({ preventScroll: true });
}

function closeSettings() {
  settingsDialog.hidden = true;
  settingsBtn.setAttribute("aria-expanded", "false");
}

function openLogin(options = {}) {
  refreshAccountSection();
  if (options.mode === "signup") {
    setAccountAuthMode("signup");
  }
  loginDialog.hidden = false;
  loginBtn.setAttribute("aria-expanded", "true");
  accountEmailInput.focus({ preventScroll: true });
}

function closeLogin() {
  loginDialog.hidden = true;
  loginBtn.setAttribute("aria-expanded", "false");
}

function openFriends() {
  navigateToFriendsIndex();
}

function closeFriends() {
  if (isFriendsIndexActive()) {
    navigateToMain();
  }
}

async function onClearCache() {
  const cleared = await clearMovieCache();
  movieById.clear();
  movieErrors.clear();
  setStatus(
    cacheStatus,
    cleared ? "Cache cleared. Reloading movie data…" : "Nothing cached.",
    "ok",
  );
  render();
  hydrateActiveList();
}

/**
 * Titles and release years are for reading the export; hydrateMovies fills gaps
 * from the account batch cache when a token is available.
 */
function csvRecordFor(movieId) {
  const record = movieById.get(movieId);
  return {
    title: record?.title || "",
    releaseDate: record?.releaseDate || "",
  };
}

async function onExportCsv() {
  const previewRows = appListCsv.listCsvRows(userState, csvRecordFor);
  if (!previewRows.length) {
    setStatus(exportCsvStatus, "Nothing to export", null);
    return;
  }
  exportCsvBtn.disabled = true;
  setStatus(exportCsvStatus, "Preparing export…", null);
  try {
    const missingIds = previewRows
      .map((row) => row.id)
      .filter((id) => !movieById.has(id));
    if (missingIds.length && hasTmdbAccess()) {
      await hydrateMovies(missingIds);
    }
    const rows = appListCsv.listCsvRows(userState, csvRecordFor);
    const blob = new Blob([appListCsv.buildListCsv(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = appListCsv.CSV_FILENAME;
    link.click();
    URL.revokeObjectURL(objectUrl);
    const movieCount = new Set(rows.map((row) => row.id)).size;
    setStatus(
      exportCsvStatus,
      `Exported backup (${movieCount} movie${movieCount === 1 ? "" : "s"}, ${rows.length} row${rows.length === 1 ? "" : "s"}).`,
      "ok",
    );
  } catch (_) {
    setStatus(exportCsvStatus, "Export failed.", "error");
  } finally {
    exportCsvBtn.disabled = false;
  }
}

/* --- Account & friends --- */

function refreshAccountSection() {
  const connected = appAccountSync.isConnectedAccountConfig(accountConfig);
  accountAuthFields.hidden = connected;
  accountSessionCard.hidden = !connected;
  accountFriendsSection.hidden = !connected;
  settingsFriendsSignin.hidden = connected;
  if (connected) {
    accountAvatar.textContent = accountDisplayInitial(accountConfig);
    accountSessionName.textContent = appDisplayName.resolveDisplayName(accountConfig);
    accountSessionEmail.textContent = accountConfig.email || "";
    setStatus(accountStatus, "", null);
  } else {
    setAccountAuthMode("login");
    setStatus(accountStatus, "", null);
    setStatus(accountSyncStatus, "", null);
    friendsList.innerHTML = "";
    clearFriendsNavData();
  }
}

async function onAccountAuth() {
  const mode = accountAuthMode;
  const email = accountEmailInput.value.trim();
  const password = accountPasswordInput.value;
  if (!email) {
    setStatus(accountStatus, "Enter your email first.", "error");
    accountEmailInput.focus({ preventScroll: true });
    return;
  }
  if (!password) {
    setStatus(accountStatus, "Enter your password first.", "error");
    accountPasswordInput.focus({ preventScroll: true });
    return;
  }
  if (mode === "signup" && !accountInviteInput.value.trim()) {
    setStatus(accountStatus, "Enter the invite code you were given.", "error");
    accountInviteInput.focus({ preventScroll: true });
    return;
  }
  setStatus(accountStatus, mode === "signup" ? "Creating account…" : "Logging in…", null);
  accountSubmitBtn.disabled = true;
  accountAuthTabLogin.disabled = true;
  accountAuthTabSignup.disabled = true;
  try {
    const result = await connectAccount(
      mode,
      email,
      password,
      mode === "signup" ? accountInviteInput.value.trim() : "",
    );
    if (!result.ok) {
      const message =
        mode === "signup" && /already have one/i.test(result.error)
          ? `${result.error} Switch to Log in above.`
          : result.error;
      setStatus(accountStatus, message, "error");
      return;
    }
    accountPasswordInput.value = "";
    if (accountInviteInput) {
      accountInviteInput.value = "";
    }
    closeLogin();
    refreshSettings();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
    refreshFriendsNavBadge();
    startFriendsNavPolling();
    startFriendActivityPolling();
    refreshFriendActivity({ force: true });
  } finally {
    accountSubmitBtn.disabled = false;
    accountAuthTabLogin.disabled = false;
    accountAuthTabSignup.disabled = false;
  }
}

/** Logging out lands on the splash rather than a modal asking you back in. */
async function onAccountLogout() {
  accountLogoutBtn.disabled = true;
  try {
    await logoutAccount();
    resetFriendActivity();
    refreshSettings();
    closeSettings();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
  } finally {
    accountLogoutBtn.disabled = false;
  }
}

function openAccountDeleteConfirm() {
  accountDeletePassword.value = "";
  setStatus(accountDeleteStatus, "", null);
  accountDeleteDialog.hidden = false;
  accountDeletePassword.focus({ preventScroll: true });
}

function closeAccountDeleteConfirm() {
  accountDeleteDialog.hidden = true;
  accountDeletePassword.value = "";
  setStatus(accountDeleteStatus, "", null);
}

function openAccountPasswordChange() {
  accountPasswordCurrent.value = "";
  accountPasswordNew.value = "";
  accountPasswordConfirm.value = "";
  setStatus(accountPasswordStatus, "", null);
  accountPasswordDialog.hidden = false;
  accountPasswordCurrent.focus({ preventScroll: true });
}

function closeAccountPasswordChange() {
  accountPasswordDialog.hidden = true;
  accountPasswordCurrent.value = "";
  accountPasswordNew.value = "";
  accountPasswordConfirm.value = "";
  setStatus(accountPasswordStatus, "", null);
}

async function onAccountPasswordChangeConfirm() {
  const currentPassword = accountPasswordCurrent.value;
  const newPassword = accountPasswordNew.value;
  const confirmPassword = accountPasswordConfirm.value;
  if (!currentPassword) {
    setStatus(accountPasswordStatus, "Enter your current password.", "error");
    accountPasswordCurrent.focus({ preventScroll: true });
    return;
  }
  if (newPassword.length < 8) {
    setStatus(accountPasswordStatus, "New password must be at least 8 characters.", "error");
    accountPasswordNew.focus({ preventScroll: true });
    return;
  }
  if (newPassword !== confirmPassword) {
    setStatus(accountPasswordStatus, "New passwords do not match.", "error");
    accountPasswordConfirm.focus({ preventScroll: true });
    return;
  }
  accountPasswordOk.disabled = true;
  setStatus(accountPasswordStatus, "Saving…", null);
  try {
    await changeRemoteAccountPassword(currentPassword, newPassword);
    closeAccountPasswordChange();
    setStatus(accountSyncStatus, "Password updated.", "ok");
  } catch (error) {
    setStatus(accountPasswordStatus, error.message, "error");
  } finally {
    accountPasswordOk.disabled = false;
  }
}

// Prefilled with the stored name only, so opening the dialog on an unset account
// does not offer the email-derived name as something to claim.
function openAccountDisplayName() {
  accountDisplayNameInput.value = appDisplayName.storedDisplayName(accountConfig);
  setStatus(accountDisplayNameStatus, "", null);
  accountDisplayNameDialog.hidden = false;
  accountDisplayNameInput.focus({ preventScroll: true });
  accountDisplayNameInput.select();
}

function closeAccountDisplayName() {
  accountDisplayNameDialog.hidden = true;
  accountDisplayNameInput.value = "";
  setStatus(accountDisplayNameStatus, "", null);
}

async function onAccountDisplayNameConfirm() {
  const value = accountDisplayNameInput.value.trim();
  if (value) {
    const problem = appDisplayName.displayNameError(value);
    if (problem) {
      setStatus(accountDisplayNameStatus, problem, "error");
      accountDisplayNameInput.focus({ preventScroll: true });
      return;
    }
  }
  accountDisplayNameOk.disabled = true;
  setStatus(accountDisplayNameStatus, "Saving…", null);
  try {
    await setRemoteDisplayName(value);
    closeAccountDisplayName();
    refreshAccountSection();
    setStatus(
      accountSyncStatus,
      value ? "Display name updated." : "Display name cleared.",
      "ok",
    );
  } catch (error) {
    setStatus(accountDisplayNameStatus, error.message, "error");
  } finally {
    accountDisplayNameOk.disabled = false;
  }
}

async function onAccountDeleteConfirm() {
  const password = accountDeletePassword.value;
  if (!password) {
    setStatus(accountDeleteStatus, "Enter your password to confirm.", "error");
    accountDeletePassword.focus({ preventScroll: true });
    return;
  }
  accountDeleteOk.disabled = true;
  setStatus(accountDeleteStatus, "Deleting account…", null);
  try {
    await deleteRemoteAccount(password);
    closeAccountDeleteConfirm();
    disconnectAccount();
    refreshSettings();
    closeSettings();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
    // The login dialog is the only surface left that can carry the outcome.
    openLogin();
    setStatus(accountStatus, "Account deleted. Your lists are still on this device.", "ok");
  } catch (error) {
    setStatus(accountDeleteStatus, error.message, "error");
  } finally {
    accountDeleteOk.disabled = false;
  }
}

function friendDisplayName(friend) {
  return appDisplayName.resolveDisplayName(friend);
}

function friendInitial(friend) {
  const name = friendDisplayName(friend).trim();
  return (name[0] || "?").toUpperCase();
}

/**
 * The roster is the one place that shows both identities: the chosen name over
 * the email. Without a chosen name the email stands alone, since the derived
 * name is just that email with the domain cut off.
 */
function friendRosterIdentityHtml(friend) {
  const email = appCardHtml.escapeHtml(friend.email || "");
  if (!appDisplayName.hasCustomDisplayName(friend)) {
    return `<span class="friends-roster-name">${email}</span>`;
  }
  return `<span class="friends-roster-name">${appCardHtml.escapeHtml(friendDisplayName(friend))}</span>
      <span class="friends-roster-email">${email}</span>`;
}

function friendRosterItemHtml(friend) {
  const name = appCardHtml.escapeHtml(friendDisplayName(friend));
  const initial = appCardHtml.escapeHtml(friendInitial(friend));
  const pending = friend.status === "pending";
  const incoming = pending && friend.direction === "incoming";
  const outgoing = pending && friend.direction === "outgoing";
  const itemClass = pending ? " friends-roster-item--pending" : "";
  const tag = incoming ? "Incoming request" : outgoing ? "Pending" : "";

  const main = `<div class="friends-roster-main">
    <span class="friends-roster-avatar" aria-hidden="true">${initial}</span>
    <div class="friends-roster-info">
      ${friendRosterIdentityHtml(friend)}
      ${tag ? `<span class="friends-roster-tag">${tag}</span>` : ""}
    </div>
  </div>`;

  let actions = "";
  if (incoming) {
    actions = `<button type="button" class="friends-roster-btn friends-roster-btn--accept" data-friend-action="accept" data-friend-id="${friend.id}">Accept</button>
  <button type="button" class="friends-roster-btn friends-roster-btn--danger" data-friend-action="remove" data-friend-id="${friend.id}">Decline</button>`;
  } else if (outgoing) {
    actions = `<button type="button" class="friends-roster-btn friends-roster-btn--danger" data-friend-action="remove" data-friend-id="${friend.id}">Cancel</button>`;
  } else {
    actions = `<button type="button" class="friends-roster-btn" data-friend-action="view" data-friend-id="${friend.id}" data-friend-name="${name}">View</button>
  <button type="button" class="friends-roster-btn friends-roster-btn--danger" data-friend-action="remove" data-friend-id="${friend.id}" data-friend-name="${name}">Delete</button>`;
  }

  return `<li class="friends-roster-item${itemClass}">
  ${main}
  <div class="friends-roster-actions">${actions}</div>
</li>`;
}

function renderFriendsRoster() {
  const cached = cachedFriendsRoster();
  if (!cached) {
    friendsList.innerHTML = '<li class="friends-roster-empty">Loading friends…</li>';
    return;
  }
  friendsList.innerHTML = cached.length
    ? cached.map(friendRosterItemHtml).join("")
    : '<li class="friends-roster-empty">No friends yet. Add someone by email above.</li>';
  if (typeof positionFriendActivityPanel === "function") {
    positionFriendActivityPanel();
  }
}

let friendsRosterChain = Promise.resolve();
let friendsRosterInFlight = 0;

/**
 * Paints the cached roster first so reopening the page does not flash a spinner,
 * then revalidates. Repeat renders share the in-flight read; membership changes
 * pass force to queue a fresh one behind it.
 */
function refreshFriendsList(options = {}) {
  if (!options.quiet) {
    renderFriendsRoster();
  }
  if (friendsRosterInFlight > 0 && !options.force) {
    return friendsRosterChain;
  }
  friendsRosterInFlight += 1;
  friendsRosterChain = friendsRosterChain
    .then(() => loadFriendsRoster(options))
    .finally(() => {
      friendsRosterInFlight -= 1;
    });
  return friendsRosterChain;
}

/** Never rejects, so the roster chain cannot be poisoned by one failed read. */
async function loadFriendsRoster(options = {}) {
  const onFriendsPage = isFriendsIndexActive();
  try {
    const body = await fetchFriends();
    setFriendsNavData(body?.friends || []);
    if (!options.quiet || onFriendsPage) {
      renderFriendsRoster();
    }
    if (!options.quiet && onFriendsPage) {
      setStatus(friendsStatus, "", null);
    }
  } catch (error) {
    // A failed refresh keeps whatever roster is already on screen.
    if (!cachedFriendsRoster()) {
      friendsList.innerHTML = "";
    }
    if (!options.quiet && onFriendsPage) {
      setStatus(friendsStatus, error.message, "error");
    }
    if (error?.status === 401) {
      refreshAccountSection();
    }
  }
}

async function onAddFriend() {
  const email = friendEmailInput.value.trim();
  if (!email) {
    setStatus(friendsStatus, "Enter your friend's account email first.", "error");
    return;
  }
  friendAddBtn.disabled = true;
  setStatus(friendsStatus, "Sending request…", null);
  try {
    const body = await sendFriendRequest(email);
    friendEmailInput.value = "";
    setStatus(
      friendsStatus,
      "Request sent. They can accept it from their Friends page.",
      "ok",
    );
    refreshFriendsList({ force: true });
    refreshFriendActivity({ force: true });
  } catch (error) {
    setStatus(friendsStatus, error.message, "error");
  } finally {
    friendAddBtn.disabled = false;
  }
}

function requestRemoveFriendConfirm(friendId, name) {
  pendingFriendRemoveId = friendId;
  friendRemoveConfirmMessage.textContent = `Remove ${name} as a friend? You can send a new request later.`;
  friendRemoveConfirmDialog.hidden = false;
  friendRemoveConfirmCancel.focus({ preventScroll: true });
}

function closeFriendRemoveConfirm() {
  pendingFriendRemoveId = null;
  friendRemoveConfirmDialog.hidden = true;
}

async function confirmRemoveFriend() {
  const friendId = pendingFriendRemoveId;
  closeFriendRemoveConfirm();
  if (!friendId) {
    return;
  }
  try {
    await removeFriend(friendId);
    if (isFriendViewActive() && activeFriendId === friendId) {
      navigateFromFriendView();
    }
    refreshFriendsList({ force: true });
    refreshFriendActivity({ force: true });
  } catch (error) {
    setStatus(friendsStatus, error.message, "error");
  }
}

async function onFriendsListClick(event) {
  const button = event.target.closest("[data-friend-action]");
  if (!button) {
    return;
  }
  const friendId = Number(button.dataset.friendId);
  const action = button.dataset.friendAction;
  try {
    if (action === "accept") {
      await acceptFriend(friendId);
      refreshFriendsList({ force: true });
      refreshFriendActivity({ force: true });
    } else if (action === "remove") {
      if (button.closest(".friends-roster-item--pending")) {
        await removeFriend(friendId);
        refreshFriendsList({ force: true });
        refreshFriendActivity({ force: true });
      } else {
        requestRemoveFriendConfirm(friendId, button.dataset.friendName || "this friend");
      }
    } else if (action === "view") {
      navigateToFriendView(friendId, button.dataset.friendName || "Friend");
    }
  } catch (error) {
    setStatus(friendsStatus, error.message, "error");
  }
}

/* --- About --- */

function openAbout() {
  aboutDialog.hidden = false;
  aboutBtn.setAttribute("aria-expanded", "true");
  aboutClose.focus({ preventScroll: true });
}

function closeAbout() {
  aboutDialog.hidden = true;
  aboutBtn.setAttribute("aria-expanded", "false");
}
