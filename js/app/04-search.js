/**
 * TMDB search and add flow. The floating + button opens a sheet: search first,
 * then pick Watched or Watchlist.
 */

const SEARCH_DEBOUNCE_MS = 300;

let suggestResults = [];
let suggestIndex = -1;
let pendingAddResult = null;
let selectedAddListId = null;
let addMovieWatchDateActive = false;
let addMoviePickTab = "add";
let searchDirectorMode = false;

const ADD_MOVIE_TMDB_URL = "https://www.themoviedb.org/movie/";

const addMovieSearchPicker = appMovieSearchPicker.createMovieSearchPicker({
  search: searchMovies,
  debounceMs: SEARCH_DEBOUNCE_MS,
  onBusy: setSearchBusy,
  onResults(results, query, options) {
    suggestResults = results;
    suggestIndex = -1;
    if (!results.length) {
      const emptyMessage = options.mode === "director"
        ? `No directed movies found for "${query}".`
        : `No movies found for "${query}".`;
      showSuggestMessage(emptyMessage);
      return;
    }
    renderSuggest();
  },
  onError(error) {
    showSuggestMessage(`Search failed. ${error.message}`);
  },
  onClear: hideSuggest,
  onSelect(result) {
    hideSuggest();
    showAddPickStep(result);
  },
});

const addMovieRatingController = appRatingFieldUi.createRatingFieldController(
  {
    field: addMovieRatingField,
    slider: addMovieRatingSlider,
    select: addMovieRatingSelect,
    clear: addMovieRatingClear,
    value: addMovieRatingValue,
  },
  appRatings,
);
addMovieRatingController.initSelect();

function resetAddMovieRatingControls() {
  addMovieRatingController.reset();
}

function resetAddMovieWatchDate() {
  addMovieWatchDateActive = false;
  if (addMovieWatchDate) {
    addMovieWatchDate.value = appViewingHistory.today();
    addMovieWatchDate.max = appViewingHistory.today();
  }
  syncAddMovieWatchDateUi();
}

function showAddMovieRatingAndWatchDate() {
  return selectedAddListId === appLists.WATCHED_ID;
}

function syncAddMovieWatchDateUi() {
  const showWrap = showAddMovieRatingAndWatchDate();
  if (addMovieWatchDateWrap) {
    addMovieWatchDateWrap.hidden = !showWrap;
  }
  if (!showWrap) {
    addMovieWatchDateActive = false;
  }
  if (addMovieWatchDateToggle) {
    addMovieWatchDateToggle.hidden = !showWrap || addMovieWatchDateActive;
  }
  if (addMovieWatchDateField) {
    addMovieWatchDateField.hidden = !showWrap || !addMovieWatchDateActive;
  }
}

function onAddMovieWatchDateToggleClick() {
  addMovieWatchDateActive = true;
  syncAddMovieWatchDateUi();
  addMovieWatchDate?.focus({ preventScroll: true });
}

function clearAddMovieWatchDate() {
  resetAddMovieWatchDate();
}

function syncAddMovieRatingDisplay() {
  addMovieRatingController.syncDisplay();
}

function onAddMovieRatingSliderInput() {
  addMovieRatingController.onSliderInput();
}

function onAddMovieRatingSelectChange() {
  addMovieRatingController.onSelectChange();
}

function clearAddMovieRating() {
  addMovieRatingController.clear();
}

function syncAddMoviePickStep() {
  const showExtras = showAddMovieRatingAndWatchDate();

  addMovieDialog?.classList.toggle("is-watched-selected", showExtras);
  if (addMovieRatingField) {
    addMovieRatingField.hidden = !showExtras;
  }
  if (!showExtras) {
    resetAddMovieRatingControls();
    resetAddMovieWatchDate();
    return;
  }
  syncAddMovieWatchDateUi();
}

function hasAddMovieDestinations() {
  return appAddMovie.hasAddMovieDestinations(
    selectedAddListId,
    [...selectedAddCustomListIds],
  );
}

function syncAddMovieDialogChrome() {
  const customDetail = isCustomListDetailActive();
  const listName = customDetail ? getActiveDisplayContext().listName : "";

  if (addMovieTitle) {
    addMovieTitle.textContent = customDetail ? `Add a movie to ${listName}` : "Add a movie";
  }
  if (addMoviePresetSection) {
    addMoviePresetSection.hidden = customDetail;
  }
  if (addMovieAlsoAddSection) {
    addMovieAlsoAddSection.hidden = !customDetail;
  }
  if (addMoviePresetLabel) {
    addMoviePresetLabel.textContent = "Add to";
  }
  if (addMovieCustomListsLabel) {
    addMovieCustomListsLabel.textContent = customDetail ? "Lists" : "Also add to";
  }
  renderAddMovieCustomListPicker();
  if (addMoviePickTabs && pendingAddResult) {
    addMoviePickTabs.hidden = false;
  }
  addMovieDialog?.classList.toggle("is-custom-list-add", customDetail);
  syncAddMoviePickStep();
}

function isAddMovieDialogOpen() {
  return addMovieDialog && !addMovieDialog.hidden;
}

function setSearchBusy(busy) {
  searchSpinner.hidden = !busy;
}

function updateSearchClearVisibility() {
  searchClearBtn.hidden = !searchInput.value;
}

function hideSuggest() {
  suggestResults = [];
  suggestIndex = -1;
  searchSuggest.hidden = true;
  searchSuggest.innerHTML = "";
  searchInput.setAttribute("aria-expanded", "false");
}

function showSuggestMessage(message) {
  suggestResults = [];
  suggestIndex = -1;
  searchSuggest.innerHTML = `<li class="search-suggest-empty" role="option" aria-disabled="true">${appCardHtml.escapeHtml(message)}</li>`;
  searchSuggest.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
}

function renderSuggest() {
  if (!suggestResults.length) {
    hideSuggest();
    return;
  }

  searchSuggest.innerHTML = appMovieSearchPicker.movieSearchResultsHtml(
    suggestResults,
    {
      activeIndex: suggestIndex,
      escapeHtml: appCardHtml.escapeHtml,
      posterUrl: (result) => appTmdb.buildImageUrl(
        result.posterPath,
        appTmdb.POSTER_SIZES.suggest,
      ),
      meta(result) {
      const year = appCardHtml.formatYear(result.releaseDate);
        const metaParts = [];
        if (year) metaParts.push(year);
        else if (!result.directorHint) metaParts.push("Year unknown");
        if (result.directorHint) metaParts.push(result.directorHint);
        return metaParts.join(" · ");
      },
      badge(result) {
      const statusId = appLists.primaryListIdForMovie(userState.lists, result.id);
      const status = statusId
        ? appLists.findList(userState.lists, statusId)
        : null;
        return status
        ? `<span class="search-suggest-added">In ${appCardHtml.escapeHtml(status.name)}</span>`
        : "";
      },
    },
  );
  searchSuggest.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
  bindPosterImages(searchSuggest);
}

async function runSearch(query) {
  return addMovieSearchPicker.run(query, {
    mode: searchDirectorMode ? "director" : "movie",
  });
}

function onSearchInput() {
  updateSearchClearVisibility();
  const query = searchInput.value.trim();

  if (!query) {
    addMovieSearchPicker.clear();
    return;
  }

  if (!hasTmdbAccess()) {
    showSuggestMessage(ACCOUNT_LOGIN_HINT);
    return;
  }

  addMovieSearchPicker.schedule(query, {
    mode: searchDirectorMode ? "director" : "movie",
  });
}

function clearSearch() {
  searchInput.value = "";
  updateSearchClearVisibility();
  addMovieSearchPicker.clear();
}

function updateAddMovieHint() {
  if (!addMovieHint) {
    return;
  }
  if (!hasTmdbAccess()) {
    addMovieHint.textContent = ACCOUNT_LOGIN_HINT;
    return;
  }
  addMovieHint.textContent = searchDirectorMode
    ? "Search by director name."
    : "Search by movie title.";
}

function syncSearchDirectorToggle() {
  if (!searchDirectorToggle) {
    return;
  }
  searchDirectorToggle.checked = searchDirectorMode;
  if (searchInput) {
    searchInput.placeholder = searchDirectorMode ? "Search directors…" : "Search movies…";
    searchInput.setAttribute(
      "aria-label",
      searchDirectorMode ? "Search directors to add movies" : "Search movies to add",
    );
  }
  updateAddMovieHint();
}

function setSearchDirectorMode(active) {
  searchDirectorMode = Boolean(active);
  syncSearchDirectorToggle();
  const query = searchInput?.value.trim();
  if (query && hasTmdbAccess()) {
    runSearch(query);
  } else {
    hideSuggest();
  }
}

function onSearchDirectorToggleChange() {
  setSearchDirectorMode(searchDirectorToggle?.checked ?? false);
}

function showAddSearchStep() {
  pendingAddResult = null;
  selectedAddListId = null;
  resetAddMovieCustomListSelection();
  resetAddMovieRatingControls();
  resetAddMovieWatchDate();
  setAddMoviePickTab("add");
  if (addMoviePickTabs) {
    addMoviePickTabs.hidden = true;
  }
  addMovieDialog?.classList.remove("is-pick-step");
  if (addMovieBack) {
    addMovieBack.hidden = true;
  }
  addMovieSearchStep.hidden = false;
  addMoviePickStep.hidden = true;
  syncAddMovieDialogChrome();
}

function syncAddMoviePickTabs() {
  const onAdd = addMoviePickTab === "add";
  addMovieTabAdd?.setAttribute("aria-selected", String(onAdd));
  addMovieTabDetail?.setAttribute("aria-selected", String(!onAdd));
  addMovieTabAdd?.setAttribute("tabindex", onAdd ? "0" : "-1");
  addMovieTabDetail?.setAttribute("tabindex", onAdd ? "-1" : "0");
  addMovieDialog?.classList.toggle("is-detail-tab", !onAdd);
  if (addMovieAddPanel) {
    addMovieAddPanel.hidden = !onAdd;
  }
  if (addMovieDetailPanel) {
    addMovieDetailPanel.hidden = onAdd;
  }
}

function setAddMoviePickTab(tab) {
  addMoviePickTab = tab === "detail" ? "detail" : "add";
  syncAddMoviePickTabs();
  if (addMoviePickTab === "detail") {
    renderAddMovieDetail();
    addMovieTabDetail?.focus({ preventScroll: true });
  } else {
    addMovieTabAdd?.focus({ preventScroll: true });
  }
}

function onAddMoviePickTabClick(event) {
  const tab = event.target.closest(".add-movie-pick-tab");
  if (!tab || !pendingAddResult) {
    return;
  }
  if (tab.id === "add-movie-tab-detail") {
    setAddMoviePickTab("detail");
  } else if (tab.id === "add-movie-tab-add") {
    setAddMoviePickTab("add");
  }
}

function prefetchAddMovieDetail(movieId) {
  if (!Number.isInteger(movieId) || movieId <= 0 || movieById.has(movieId)) {
    return;
  }
  if (!hasTmdbAccess()) {
    return;
  }
  hydrateMovies([movieId], {
    onRecord: (id, record) => {
      if (pendingAddResult?.id === id && addMoviePickTab === "detail") {
        renderAddMovieDetail();
      }
    },
  });
}

function addMovieDetailPosterHtml(record) {
  const url = appTmdb.buildImageUrl(record.posterPath, appTmdb.POSTER_SIZES.card);
  if (!url) {
    return `<div class="add-movie-detail-poster add-movie-detail-poster--empty"></div>`;
  }
  return `<img class="add-movie-detail-poster" data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy">`;
}

function renderAddMovieDetail() {
  if (!pendingAddResult || !addMovieDetailContent) {
    return;
  }

  const movieId = pendingAddResult.id;
  const record = movieById.get(movieId);
  const canLoad = hasTmdbAccess();

  if (!record) {
    const year = appCardHtml.formatYear(pendingAddResult.releaseDate);
    let statusText;
    if (movieErrors.has(movieId)) {
      statusText = "Could not load details. Check your credential and connection.";
    } else if (canLoad) {
      statusText = "Loading details…";
    } else {
      statusText = "Add a TMDB credential in Settings to load details.";
    }
    addMovieDetailContent.innerHTML = `<div class="add-movie-detail-layout">
  ${addMovieDetailPosterHtml(pendingAddResult)}
  <div class="add-movie-detail-body">
    <h3 class="add-movie-detail-title">${appCardHtml.escapeHtml(pendingAddResult.title)}</h3>
    ${year ? `<p class="add-movie-detail-tagline">${year}</p>` : ""}
    <p class="add-movie-detail-status">${appCardHtml.escapeHtml(statusText)}</p>
  </div>
</div>`;
    bindPosterImages(addMovieDetailContent);
    if (canLoad) {
      prefetchAddMovieDetail(movieId);
    }
    return;
  }

  const tagline = record.tagline
    ? `<p class="add-movie-detail-tagline">${appCardHtml.escapeHtml(record.tagline)}</p>`
    : "";

  addMovieDetailContent.innerHTML = `<div class="add-movie-detail-layout">
  ${addMovieDetailPosterHtml(record)}
  <div class="add-movie-detail-body">
    <h3 class="add-movie-detail-title">${appCardHtml.escapeHtml(record.title)}</h3>
    ${tagline}
    <div class="add-movie-detail-meta">${detailMetaChips(record)}</div>
    <p class="add-movie-detail-overview">${appCardHtml.escapeHtml(record.overview || "No overview available.")}</p>
    <div class="add-movie-detail-credits">${detailCreditsHtml(record)}</div>
    <a class="add-movie-detail-link" href="${ADD_MOVIE_TMDB_URL}${movieId}" target="_blank" rel="noopener noreferrer">View on TMDB</a>
  </div>
</div>`;
  bindPosterImages(addMovieDetailContent);
}

function pickedPosterHtml(result) {
  const url = appTmdb.buildImageUrl(result.posterPath, appTmdb.POSTER_SIZES.suggest);
  if (!url) {
    return `<span class="add-movie-picked-poster add-movie-picked-poster--empty"></span>`;
  }
  return `<img class="add-movie-picked-poster" data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy">`;
}

function renderAddMoviePicked(result) {
  const year = appCardHtml.formatYear(result.releaseDate);
  addMoviePicked.innerHTML = `${pickedPosterHtml(result)}
<div class="add-movie-picked-text">
  <span class="add-movie-picked-title">${appCardHtml.escapeHtml(result.title)}</span>
  <span class="add-movie-picked-meta">${year || "Year unknown"}</span>
</div>`;
  bindPosterImages(addMoviePicked);
}

function updateAddListPickerSelection(listId) {
  const selectors = [addMovieListPicker, addMoviePresetChips];
  for (const root of selectors) {
    if (!root) {
      continue;
    }
    root.querySelectorAll("[data-list-id]").forEach((button) => {
      const selected = listId != null && button.dataset.listId === listId;
      button.setAttribute("aria-pressed", String(selected));
    });
  }
  syncAddMoviePickStep();
}

function showAddPickStep(result) {
  pendingAddResult = result;
  selectedAddListId =
    !isCustomListView() && appLists.isListId(userState.activeListId)
      ? userState.activeListId
      : null;
  resetAddMovieRatingControls();
  resetAddMovieCustomListSelection();
  if (addMoviePickTabs) {
    addMoviePickTabs.hidden = false;
  }
  addMovieDialog?.classList.add("is-pick-step");
  if (addMovieBack) {
    addMovieBack.hidden = false;
  }
  setAddMoviePickTab("add");
  addMovieSearchStep.hidden = true;
  addMoviePickStep.hidden = false;
  renderAddMoviePicked(result);
  updateAddListPickerSelection(selectedAddListId);
  syncAddMovieDialogChrome();
  syncAddMovieSubmitState();
  prefetchAddMovieDetail(result.id);
  addMovieSubmit.focus({ preventScroll: true });
}

function confirmAddMovie() {
  if (!pendingAddResult) {
    return;
  }

  const movieId = pendingAddResult.id;
  const includeExtras = showAddMovieRatingAndWatchDate();
  const { state: next, cappedCustomLists } = appAddMovie.applyAddMovie(userState, {
    movieId,
    presetListId: selectedAddListId,
    customListIds: [...selectedAddCustomListIds],
    rating: includeExtras ? addMovieRatingController.getValue() : null,
    watchedOn:
      includeExtras && addMovieWatchDateActive ? addMovieWatchDate?.value : null,
  });
  if (next === userState) {
    notifyCustomListMovieCaps(cappedCustomLists);
    return;
  }
  notifyCustomListMovieCaps(cappedCustomLists);
  userState = next;
  persistUserState();
  closeAddMovieDialog();
  if (isCustomListIndexActive()) {
    renderCustomListsIndex();
  } else {
    render();
  }
  hydrateMovies([movieId], {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
}

function syncAddMovieFromWatchedSection() {
  if (addMovieFromWatchedSection) {
    addMovieFromWatchedSection.hidden = !isCustomListDetailActive();
  }
  syncAddMovieDialogChrome();
}

function openAddMovieDialog() {
  if (!accountSyncEnabled()) {
    openSettings();
    return;
  }
  setSearchDirectorMode(false);
  showAddSearchStep();
  clearSearch();
  syncAddMovieFromWatchedSection();
  addMovieDialog.hidden = false;
  searchInput.focus();
}

function closeAddMovieDialog() {
  addMovieDialog.hidden = true;
  pendingAddResult = null;
  clearSearch();
  showAddSearchStep();
}

function addMovieToList(result, listId, rating) {
  const nextLists = appLists.assignMovieToList(userState.lists, listId, result.id);
  const listsChanged = updateLists(nextLists);
  let ratingsChanged = false;
  if (rating != null) {
    ratingsChanged = updateRatings(
      appRatings.setRating(userState.ratings, result.id, rating),
    );
  }
  if (!listsChanged && !ratingsChanged) {
    return;
  }
  recordAddedAt(result.id);
  recordMovieStatus(result.id, listId);
  persistUserState();
  closeAddMovieDialog();
  render();
  hydrateMovies([result.id], {
    onRecord: applyHydratedRecord,
    onUpdate: applyHydratedRecord,
  });
}

function pickSuggestion(index) {
  addMovieSearchPicker.select(index);
}

function moveSuggestSelection(delta) {
  if (!suggestResults.length) {
    return;
  }
  const count = suggestResults.length;
  if (suggestIndex < 0) {
    suggestIndex = delta > 0 ? 0 : count - 1;
  } else {
    suggestIndex = (suggestIndex + delta + count) % count;
  }
  renderSuggest();
  searchSuggest
    .querySelector(`[data-suggest-index="${suggestIndex}"]`)
    ?.scrollIntoView({ block: "nearest" });
}

function onSearchKeydown(event) {
  if (!isAddMovieDialogOpen() || addMovieSearchStep.hidden) {
    return;
  }

  const isOpen = !searchSuggest.hidden && suggestResults.length > 0;

  if (event.key === "Escape") {
    event.stopPropagation();
    if (isOpen) {
      event.preventDefault();
      hideSuggest();
    } else if (searchInput.value) {
      event.preventDefault();
      clearSearch();
    }
    return;
  }

  if (!isOpen) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveSuggestSelection(1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveSuggestSelection(-1);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    pickSuggestion(suggestIndex >= 0 ? suggestIndex : 0);
  }
}

function onAddListOptionClick(event) {
  const button = event.target.closest(".add-list-option");
  if (!button || !pendingAddResult) {
    return;
  }
  const listId = button.dataset.listId;
  if (listId !== appLists.WATCHED_ID && listId !== appLists.WATCHLIST_ID) {
    return;
  }
  selectedAddListId = selectedAddListId === listId ? null : listId;
  updateAddListPickerSelection(selectedAddListId);
  syncAddMovieSubmitState();
}
