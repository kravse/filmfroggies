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
  if (isDiscoverActive()) {
    return false;
  }
  return (
    detailMovieId != null &&
    appRatings.isRatingAllowed(
      userState.lists,
      detailMovieId,
      userState.customLists,
    )
  );
}

function detailPresetListAllowed(listId) {
  if (!appLists.isListId(listId)) {
    return false;
  }
  if (listId === appLists.WATCHED_ID && isDiscoverActive() && discoverTab !== "now-playing") {
    return false;
  }
  return true;
}

function detailDiscoverPresetBtnHtml(listId, movieId) {
  const preset = appLists.PRESET_LISTS.find((entry) => entry.id === listId);
  if (!preset) {
    return "";
  }
  const isMember =
    listId === appLists.WATCHED_ID
      ? appLists.isWatched(userState.lists, movieId)
      : appLists.isOnWatchlist(userState.lists, movieId);
  const label = preset.name;
  const iconPreset = listId === appLists.WATCHLIST_ID ? "watchlist" : "watched";
  return `<button type="button" class="action-btn detail-discover-preset-btn discover-preset-btn-with-icon${isMember ? " is-active" : ""}" data-discover-preset-id="${appCardHtml.escapeHtml(listId)}" aria-pressed="${isMember ? "true" : "false"}">${appCardHtml.discoverPresetButtonInnerHtml(iconPreset, label)}</button>`;
}

function discoverDetailPresetActionsHtml(movieId) {
  const buttons = [];
  if (discoverTab === "now-playing") {
    buttons.push(detailDiscoverPresetBtnHtml(appLists.WATCHED_ID, movieId));
  }
  buttons.push(detailDiscoverPresetBtnHtml(appLists.WATCHLIST_ID, movieId));
  return buttons.filter(Boolean).join("");
}

function detailWatchBtnHtml() {
  return `<button type="button" class="action-btn detail-watch-btn" id="detail-watch" aria-label="Mark as watched" title="Mark as watched"><span class="detail-action-icon" aria-hidden="true">✓</span><span class="detail-action-label">Watched</span></button>`;
}

function detailShouldShowWatchButton(movieId) {
  if (isDiscoverActive() || appLists.isWatched(userState.lists, movieId)) {
    return false;
  }
  if (isCustomListDetailActive()) {
    return activeMovieIds().includes(movieId);
  }
  return appLists.findListIdsForMovie(userState.lists, movieId).length > 0;
}

function discoverPresetMembership(listId, movieId) {
  return listId === appLists.WATCHED_ID
    ? appLists.isWatched(userState.lists, movieId)
    : appLists.isOnWatchlist(userState.lists, movieId);
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
  renderDiscover();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function removeDiscoverPresetMembership(listId, movieId) {
  const nextLists = appLists.removeMovie(userState.lists, movieId);
  if (!commitListChange(nextLists, { movieId, status: appSyncMerge.REMOVED_STATUS })) {
    return;
  }
  renderDiscover();
  if (detailMovieId === movieId) {
    renderDetail();
  }
}

function toggleDiscoverPresetMembership(listId, movieId) {
  if (!isDiscoverActive() || !detailPresetListAllowed(listId)) {
    return;
  }
  if (discoverPresetMembership(listId, movieId)) {
    removeDiscoverPresetMembership(listId, movieId);
  } else {
    addDiscoverPresetMembership(listId, movieId);
  }
}

function requestDiscoverPresetMembership(listId, movieId) {
  if (!isDiscoverActive() || !detailPresetListAllowed(listId)) {
    return;
  }
  if (discoverPresetMembership(listId, movieId)) {
    removeDiscoverPresetMembership(listId, movieId);
    return;
  }
  if (listId === appLists.WATCHED_ID) {
    requestWatchMovie(Number(movieId), { fromDiscover: true });
    return;
  }
  pendingDiscoverAddMovieId = Number(movieId);
  pendingDiscoverAddListId = listId;
  const record = movieById.get(pendingDiscoverAddMovieId);
  const title = record?.title || `Movie ${pendingDiscoverAddMovieId}`;
  const copy = discoverAddConfirmCopy(listId, title);
  discoverAddConfirmTitle.textContent = copy.title;
  discoverAddConfirmMessage.textContent = copy.message;
  discoverAddConfirmOk.textContent = copy.okLabel;
  discoverAddConfirmDialog.hidden = false;
  discoverAddConfirmCancel.focus({ preventScroll: true });
}

function closeDiscoverAddConfirm() {
  pendingDiscoverAddMovieId = null;
  pendingDiscoverAddListId = null;
  discoverAddConfirmDialog.hidden = true;
}

function confirmDiscoverPresetAdd() {
  const movieId = pendingDiscoverAddMovieId;
  const listId = pendingDiscoverAddListId;
  closeDiscoverAddConfirm();
  if (movieId == null || listId == null) {
    return;
  }
  addDiscoverPresetMembership(listId, movieId);
}

function requestDiscoverDetailPreset(listId) {
  if (detailMovieId == null) {
    return;
  }
  requestDiscoverPresetMembership(listId, detailMovieId);
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

  for (const list of userState.customLists || []) {
    const isMember = list.movieIds.includes(movieId);
    const shouldBeMember = detailListPickerSelectedIds.has(list.id);
    if (shouldBeMember && !isMember) {
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

  if (customChanged) {
    if (isCustomListDetailActive() && !activeMovieIds().includes(movieId)) {
      closeDetail();
      if (isDiscoverActive()) {
        renderDiscover();
      } else {
        render();
      }
      return;
    }
    if (isDiscoverActive()) {
      renderDiscover();
    } else {
      render();
    }
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
  if (isDiscoverActive()) {
    return "";
  }
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

function detailViewingHistoryHtml(movieId) {
  if (!appLists.isWatched(userState.lists, movieId)) {
    return `<p class="detail-viewing-empty">Viewing history is available for movies in your Watched list.</p>`;
  }
  const entries = appViewingHistory.viewingEntries(userState.viewingHistory, movieId);
  const rows = entries.map((entry) => `<li class="detail-viewing-row">
    <span class="detail-viewing-date">${appCardHtml.viewingDateIconHtml()}${appCardHtml.escapeHtml(formatViewingDate(entry.watchedOn))}</span>
    <button type="button" data-viewing-remove-id="${appCardHtml.escapeHtml(entry.id)}" aria-label="Remove viewing on ${appCardHtml.escapeHtml(formatViewingDate(entry.watchedOn))}">Remove</button>
  </li>`).join("");
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

function detailBodyTabsHtml(movieId, record) {
  if (isDiscoverActive()) {
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
  <button type="button" class="detail-body-tab" role="tab" id="detail-tab-viewing-history" data-detail-body-tab="viewing-history" aria-selected="${historySelected ? "true" : "false"}" tabindex="${historySelected ? "0" : "-1"}">Viewing history${countBadge}</button>
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
  if (isDiscoverActive()) {
    return;
  }
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
    setDetailConfigSearchStatus("Add a TMDB credential in Settings to search.");
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

function addDetailViewing() {
  const input = document.getElementById("detail-viewing-new-date");
  if (detailMovieId == null || !input?.value) return;
  if (!appLists.isWatched(userState.lists, detailMovieId)) return;
  if (!addMovieViewing(detailMovieId, input.value)) return;
  detailBodyTab = "viewing-history";
  persistUserState();
  render();
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
  const next = appViewingHistory.removeViewing(userState.viewingHistory, detailMovieId, entryId);
  if (!updateViewingHistory(next)) return;
  persistUserState();
  render();
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

function shouldShowDetailAddForm(movieId) {
  if (isDiscoverActive() || movieId == null || !userState) {
    return false;
  }
  return !appMovieShare.isMovieOwned(
    userState.lists,
    userState.customLists,
    movieId,
  );
}

function resetDetailAddFormState() {
  detailAddListId = null;
  detailAddCustomListIds = new Set();
  detailAddRating = null;
  detailAddWatchDateActive = false;
  detailAddWatchDate = "";
  detailAddRatingController?.reset();
}

function detailAddHasDestinations() {
  return appAddMovie.hasAddMovieDestinations(
    detailAddListId,
    [...detailAddCustomListIds],
  );
}

function detailAddPresetOptionHtml(listId, name, iconPreset) {
  const pressed = detailAddListId === listId;
  return `<button type="button" class="add-list-option" data-detail-add-list-id="${appCardHtml.escapeHtml(listId)}" aria-pressed="${pressed}">${appCardHtml.addListPresetIconHtml(iconPreset)}<span class="add-list-name">${appCardHtml.escapeHtml(name)}</span></button>`;
}

function detailAddCustomListsHtml() {
  const lists = userState.customLists || [];
  if (!lists.length) {
    return `<p class="detail-add-to-list-hint"><a href="#lists" class="detail-add-to-list-link">Create lists…</a></p>`;
  }
  return `<p class="add-movie-pick-label">Also add to</p>
<div class="add-custom-list-picker" id="detail-add-custom-list-picker">${lists
    .map((list) => {
      const selected = detailAddCustomListIds.has(list.id);
      return `<button type="button" class="add-custom-list-chip" data-detail-add-custom-list-id="${appCardHtml.escapeHtml(list.id)}" aria-pressed="${selected}">${appCardHtml.escapeHtml(list.name)}</button>`;
    })
    .join("")}</div>`;
}

function detailAddBlockHtml() {
  const watchedSelected = detailAddListId === appLists.WATCHED_ID;
  const extrasHidden = watchedSelected ? "" : " hidden";
  const submitDisabled = detailAddHasDestinations() ? "" : " disabled";
  return `<section class="detail-add-block" id="detail-add-block">
  <p class="add-movie-pick-label">Add to</p>
  <div class="add-list-picker" id="detail-add-list-picker" role="group" aria-label="Choose a list">
    ${detailAddPresetOptionHtml(appLists.WATCHED_ID, "Watched", "watched")}
    ${detailAddPresetOptionHtml(appLists.WATCHLIST_ID, "Watchlist", "watchlist")}
  </div>
  <div id="detail-add-watched-extras"${extrasHidden}>
    ${appRatingFieldUi.userRatingFieldHtml({ idPrefix: "detail-add-rating" })}
    <div class="add-movie-watch-date-wrap" id="detail-add-watch-date-wrap">
      ${appCardHtml.viewingDatePickerHtml({
        toggleId: "detail-add-watch-date-toggle",
        fieldId: "detail-add-watch-date-field",
        inputId: "detail-add-watch-date",
        clearId: "detail-add-watch-date-clear",
        toggleClass: "ghost-btn add-movie-watch-date-toggle",
        fieldClass: "add-movie-watch-date",
      })}
    </div>
  </div>
  <div class="add-movie-custom-lists" id="detail-add-custom-lists-section">
    ${detailAddCustomListsHtml()}
  </div>
  <div class="add-movie-pick-actions add-movie-pick-actions--end">
    <button type="button" class="primary-btn" id="detail-add-submit"${submitDisabled}>Add</button>
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
  const watchedSelected = detailAddListId === appLists.WATCHED_ID;
  const extras = document.getElementById("detail-add-watched-extras");
  if (extras) {
    extras.hidden = !watchedSelected;
  }
  if (!watchedSelected) {
    detailAddWatchDateActive = false;
  }
  const toggle = document.getElementById("detail-add-watch-date-toggle");
  const field = document.getElementById("detail-add-watch-date-field");
  if (toggle) {
    toggle.hidden = !watchedSelected || detailAddWatchDateActive;
  }
  if (field) {
    field.hidden = !watchedSelected || !detailAddWatchDateActive;
  }
}

function syncDetailAddFormUi() {
  const root = document.getElementById("detail-add-block");
  if (!root) {
    return;
  }
  const watchedSelected = detailAddListId === appLists.WATCHED_ID;
  root.querySelectorAll("[data-detail-add-list-id]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.detailAddListId === detailAddListId),
    );
  });
  root.querySelectorAll("[data-detail-add-custom-list-id]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(detailAddCustomListIds.has(button.dataset.detailAddCustomListId)),
    );
  });
  if (!watchedSelected) {
    detailAddRating = null;
    detailAddWatchDate = "";
    detailAddRatingController?.reset();
  }
  syncDetailAddWatchDateUi();
  const submit = document.getElementById("detail-add-submit");
  if (submit) {
    submit.disabled = !detailAddHasDestinations();
  }
}

function bindDetailAddForm() {
  if (!document.getElementById("detail-add-block")) {
    return;
  }
  detailAddRatingRefs.field = document.getElementById("detail-add-rating-field");
  detailAddRatingRefs.slider = document.getElementById("detail-add-rating-slider");
  detailAddRatingRefs.select = document.getElementById("detail-add-rating-select");
  detailAddRatingRefs.clear = document.getElementById("detail-add-rating-clear");
  detailAddRatingRefs.value = document.getElementById("detail-add-rating-value");
  const controller = ensureDetailAddRatingController();
  controller.initSelect();
  if (detailAddRating != null) {
    controller.setValue(detailAddRating);
  } else {
    controller.reset();
  }
  const dateInput = document.getElementById("detail-add-watch-date");
  if (dateInput) {
    dateInput.value = detailAddWatchDate || appViewingHistory.today();
    dateInput.max = appViewingHistory.today();
  }
  syncDetailAddFormUi();
}

function onDetailAddListOptionClick(listId) {
  if (listId !== appLists.WATCHED_ID && listId !== appLists.WATCHLIST_ID) {
    return;
  }
  detailAddListId = detailAddListId === listId ? null : listId;
  syncDetailAddFormUi();
}

function onDetailAddCustomListClick(listId) {
  if (!appCustomLists.isCustomListId(listId)) {
    return;
  }
  if (detailAddCustomListIds.has(listId)) {
    detailAddCustomListIds.delete(listId);
  } else {
    detailAddCustomListIds.add(listId);
  }
  syncDetailAddFormUi();
}

function onDetailAddWatchDateToggleClick() {
  if (detailAddListId !== appLists.WATCHED_ID) {
    return;
  }
  detailAddWatchDateActive = true;
  if (!detailAddWatchDate) {
    detailAddWatchDate = appViewingHistory.today();
  }
  syncDetailAddWatchDateUi();
  document.getElementById("detail-add-watch-date")?.focus({ preventScroll: true });
}

function clearDetailAddWatchDate() {
  detailAddWatchDateActive = false;
  detailAddWatchDate = "";
  const dateInput = document.getElementById("detail-add-watch-date");
  if (dateInput) {
    dateInput.value = appViewingHistory.today();
  }
  syncDetailAddWatchDateUi();
}

function onDetailAddRatingSliderInput() {
  ensureDetailAddRatingController().onSliderInput();
  detailAddRating = detailAddRatingController.getValue();
}

function onDetailAddRatingSelectChange() {
  ensureDetailAddRatingController().onSelectChange();
  detailAddRating = detailAddRatingController.getValue();
}

function clearDetailAddRating() {
  ensureDetailAddRatingController().clear();
  detailAddRating = null;
}

function confirmDetailAddMovie() {
  if (detailMovieId == null || !shouldShowDetailAddForm(detailMovieId)) {
    return;
  }
  const includeExtras = detailAddListId === appLists.WATCHED_ID;
  const dateInput = document.getElementById("detail-add-watch-date");
  const next = appAddMovie.applyAddMovie(userState, {
    movieId: detailMovieId,
    presetListId: detailAddListId,
    customListIds: [...detailAddCustomListIds],
    rating: includeExtras
      ? (detailAddRatingController?.getValue() ?? detailAddRating)
      : null,
    watchedOn:
      includeExtras && detailAddWatchDateActive
        ? dateInput?.value || detailAddWatchDate
        : null,
  });
  if (next === userState) {
    return;
  }
  userState = next;
  persistUserState();
  resetDetailAddFormState();
  if (isCustomListIndexActive()) {
    renderCustomListsIndex();
  } else if (isDiscoverActive()) {
    renderDiscover();
  } else {
    render();
  }
  renderDetail();
  hydrateMovies([detailMovieId], {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
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
      heading = "No TMDB credential";
      note = "Open Settings and paste your TMDB credential to load this movie.";
    } else if (movieErrors.has(detailMovieId)) {
      heading = "Could not load this movie";
      note = "TMDB did not return details. Check your credential and connection.";
    }
    detailPoster.innerHTML = detailPosterSkeletonHtml();
    const addForm = shouldShowDetailAddForm(detailMovieId)
      ? detailAddBlockHtml()
      : "";
    detailBody.innerHTML = `${detailTitleRowHtml(heading)}
<p class="movie-detail-overview">${note}</p>${addForm}`;
  } else {
    detailPoster.innerHTML = detailPosterFrameHtml(record, appTmdb.POSTER_SIZES.detail);
    bindPosterImages(detailPoster);
    detailBody.innerHTML = `${detailTitleRowHtml(appCardHtml.escapeHtml(record.title))}
${detailBodyTabsHtml(detailMovieId, record)}`;
  }

  const leftActions = [];
  let removeBtn = "";

  if (isDiscoverActive()) {
    leftActions.push(discoverDetailPresetActionsHtml(detailMovieId));
  } else if (isCustomListDetailActive()) {
    if (detailShouldShowWatchButton(detailMovieId)) {
      leftActions.push(detailWatchBtnHtml());
    }
    if (activeMovieIds().includes(detailMovieId)) {
      removeBtn = `<button type="button" class="action-btn detail-remove-btn" id="detail-remove-from-list">Remove from list</button>`;
    }
  } else {
    const inCollection = appLists.findListIdsForMovie(userState.lists, detailMovieId).length > 0;

    if (detailShouldShowWatchButton(detailMovieId)) {
      leftActions.push(detailWatchBtnHtml());
    }

    if (inCollection) {
      removeBtn = `<button type="button" class="action-btn detail-remove-btn" id="detail-remove" aria-label="Remove movie"><span class="detail-remove-label-full">Remove movie</span><span class="detail-remove-label-short">Remove</span></button>`;
    }
  }

  if (removeBtn) {
    leftActions.push(removeBtn);
  }

  detailActions.innerHTML = `<div class="detail-actions-left">${leftActions.join("")}</div>
<div class="detail-actions-right">
<a class="detail-link" href="${TMDB_MOVIE_URL}${detailMovieId}" target="_blank" rel="noopener noreferrer">View on TMDB</a></div>`;
  if (record) {
    syncDetailRatingDisplay(appRatings.getRating(userState.ratings, detailMovieId));
    syncDetailRatingEditorVisibility();
  }
  bindDetailAddForm();
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

function openDetail(movieId, options = {}) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  const openingOverUnderlay = detailDialog.hidden && options.pushHistory !== false;
  if (openingOverUnderlay) {
    captureUnderlayScroll();
  }

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
  resetDetailAddFormState();
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
  commitDetailRating();
  const closingId = detailMovieId;
  const hadHistoryEntry = history.state?.detailMovieId != null;
  detailMovieId = null;
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailListPickerOpen = false;
  detailListPickerSelectedIds.clear();
  resetDetailAddFormState();
  closeMovieShareDialog();
  closeDetailListsOverlay();
  hideDetailConfigResults();
  closeDetailConfigSearch();
  detailDialog.hidden = true;
  document.body.classList.remove("movie-detail-open");

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
    closeDetail({ popHistory: false });
    return;
  }
  if (id !== detailMovieId) {
    openDetail(id, { pushHistory: false });
  }
}

/* --- Settings --- */

let pendingBackupRestoreFilename = null;

function formatSnapshotLabel(iso) {
  const time = Date.parse(iso || "");
  if (!Number.isFinite(time)) {
    return iso || "Unknown time";
  }
  return new Date(time).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function refreshGistBackupList() {
  if (!gistBackupSection || !gistBackupList) {
    return;
  }
  if (!gistSyncEnabled()) {
    gistBackupSection.hidden = true;
    gistBackupList.innerHTML = "";
    setStatus(gistBackupStatus, "", null);
    return;
  }
  gistBackupSection.hidden = false;
  gistBackupList.innerHTML =
    '<li class="gist-backup-empty">Loading snapshots…</li>';
  try {
    const snapshots = await listGistSnapshots();
    if (!snapshots.length) {
      gistBackupList.innerHTML =
        '<li class="gist-backup-empty">No snapshots yet. The first one is written on load when sync is active.</li>';
      setStatus(gistBackupStatus, "", null);
      return;
    }
    gistBackupList.innerHTML = snapshots
      .slice()
      .reverse()
      .map((entry) => {
        const label = formatSnapshotLabel(entry.at);
        const safeLabel = appCardHtml.escapeHtml(label);
        return `<li class="gist-backup-item"><button type="button" class="gist-backup-restore-btn" data-backup-at="${entry.at}" data-backup-label="${safeLabel}">Restore ${safeLabel}</button></li>`;
      })
      .join("");
    setStatus(
      gistBackupStatus,
      `${snapshots.length} snapshot${snapshots.length === 1 ? "" : "s"} stored (max ${appGistBackup.MAX_SNAPSHOTS}).`,
      "ok",
    );
  } catch (_) {
    gistBackupList.innerHTML =
      '<li class="gist-backup-empty">Could not load snapshots.</li>';
    setStatus(gistBackupStatus, "Could not reach the backup Gist.", "error");
  }
}

function openBackupRestoreConfirm(at, label) {
  pendingBackupRestoreFilename = at;
  backupRestoreMessage.textContent = `Restore your lists from the snapshot taken ${label}? Your current lists will be replaced and synced to GitHub.`;
  backupRestoreDialog.hidden = false;
}

function closeBackupRestoreConfirm() {
  pendingBackupRestoreFilename = null;
  backupRestoreDialog.hidden = true;
}

async function onConfirmBackupRestore() {
  const at = pendingBackupRestoreFilename;
  closeBackupRestoreConfirm();
  if (!at) {
    return;
  }
  setStatus(gistBackupStatus, "Restoring snapshot…", null);
  backupRestoreOk.disabled = true;
  try {
    const result = await restoreGistSnapshot(at);
    if (!result.ok) {
      setStatus(gistBackupStatus, result.error, "error");
      return;
    }
    closeSettings();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
  } finally {
    backupRestoreOk.disabled = false;
  }
}

function onGistBackupListClick(event) {
  const button = event.target.closest("[data-backup-at]");
  if (!button) {
    return;
  }
  openBackupRestoreConfirm(
    button.dataset.backupAt,
    button.dataset.backupLabel || "at that time",
  );
}

function refreshSettings() {
  tmdbKeyInput.value = "";
  setStatus(
    tmdbKeyStatus,
    hasCredential() ? "Read access token saved." : "No token saved.",
    hasCredential() ? "ok" : null,
  );

  const usingGist = userState.storageMode === "gist";
  storageModeLocal.checked = !usingGist;
  storageModeGist.checked = usingGist;
  gistFields.hidden = !usingGist;
  gistTokenInput.value = "";
  setStatus(
    gistStatus,
    appGistSync.isConnectedGistConfig(gistConfig)
      ? `Connected to Gist ${gistConfig.gistId.slice(0, 8)}…`
      : "Not connected.",
    appGistSync.isConnectedGistConfig(gistConfig) ? "ok" : null,
  );
  setStatus(cacheStatus, "");
  refreshCollectionTransferStatus();
}

function openSettings() {
  refreshSettings();
  refreshGistBackupList();
  settingsDialog.hidden = false;
  settingsBtn.setAttribute("aria-expanded", "true");
  tmdbKeyInput.focus({ preventScroll: true });
}

function closeSettings() {
  settingsDialog.hidden = true;
  settingsBtn.setAttribute("aria-expanded", "false");
}

async function onSaveCredential() {
  const value = tmdbKeyInput.value.trim();

  // Reject the wrong credential shape before storing it, so a mistyped or v3
  // value never becomes the reason every later request fails.
  const problem = appTmdb.describeCredentialProblem(value);
  if (problem) {
    setStatus(tmdbKeyStatus, problem, "error");
    return;
  }

  saveCredential(value);
  refreshSettings();
  render();
  setStatus(tmdbKeyStatus, "Checking with TMDB…", null);
  tmdbKeySave.disabled = true;

  try {
    await verifyCredential();
    refreshSettings();
    hydrateActiveList();
  } catch (error) {
    // The credential stays saved so it can be corrected rather than retyped.
    setStatus(tmdbKeyStatus, `Saved, but TMDB rejected it. ${error.message}`, "error");
  } finally {
    tmdbKeySave.disabled = false;
  }
}

function onClearCredential() {
  saveCredential("");
  movieById.clear();
  movieErrors.clear();
  refreshSettings();
  render();
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
 * Titles and release years are for reading the committed file; only the ids drive
 * the scrape. The snapshot is the second source because only the active list gets
 * hydrated.
 */
function csvRecordFor(movieId) {
  const record = movieById.get(movieId) || localMovieRecord(movieId);
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
      .filter((id) => !movieById.has(id) && !localMovieRecord(id));
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

function onStorageModeChange(mode) {
  if (mode === "gist") {
    userState = { ...userState, storageMode: "gist" };
    gistFields.hidden = false;
    persistUserState({ sync: false });
    refreshSettings();
    return;
  }
  disconnectGist();
  gistFields.hidden = true;
  refreshSettings();
}

async function onConnectGist() {
  const token = gistTokenInput.value.trim();
  setStatus(gistStatus, "Connecting to GitHub…", null);
  gistConnectBtn.disabled = true;
  try {
    const result = await connectGist(token);
    if (!result.ok) {
      setStatus(gistStatus, result.error, "error");
      return;
    }
    setStatus(
      gistStatus,
      result.action === "adopt"
        ? "Connected. Loaded the lists already in your Gist."
        : "Connected. Created a new private Gist for your lists.",
      "ok",
    );
    gistTokenInput.value = "";
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
    refreshGistBackupList();
  } finally {
    gistConnectBtn.disabled = false;
  }
}

function onDisconnectGist() {
  disconnectGist();
  refreshSettings();
  refreshGistBackupList();
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

/* --- Hosted unlock (hidden) --- */

function openHostedUnlockDialog() {
  hostedUnlockInput.value = "";
  setStatus(hostedUnlockStatus, "");
  hostedUnlockDialog.hidden = false;
  hostedUnlockInput.focus({ preventScroll: true });
}

function closeHostedUnlockDialog() {
  hostedUnlockDialog.hidden = true;
  hostedUnlockInput.value = "";
  setStatus(hostedUnlockStatus, "");
}

async function submitHostedUnlock() {
  const password = hostedUnlockInput.value;
  setStatus(hostedUnlockStatus, "Checking…", null);
  hostedUnlockSubmit.disabled = true;
  try {
    await unlockHostedAccess(password);
    closeHostedUnlockDialog();
    render();
    hydrateActiveList();
  } catch (error) {
    setStatus(hostedUnlockStatus, error.message, "error");
  } finally {
    hostedUnlockSubmit.disabled = false;
  }
}

function openHostedLockDialog() {
  hostedLockDialog.hidden = false;
  hostedLockCancel.focus({ preventScroll: true });
}

function closeHostedLockDialog() {
  hostedLockDialog.hidden = true;
}

function confirmHostedLock() {
  lockHostedAccess();
  closeHostedLockDialog();
  render();
}
