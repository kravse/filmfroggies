/**
 * TMDB search and add flow. The floating + button opens a sheet: search first,
 * then pick Watched or Watchlist.
 */

const SEARCH_DEBOUNCE_MS = 300;

let searchDebounceTimer = null;
let searchController = null;
let suggestResults = [];
let suggestIndex = -1;
/** Guards against a slow response overwriting a newer one. */
let suggestRequestToken = 0;
let pendingAddResult = null;
let selectedAddListId = null;
let pendingAddRating = null;
let addMovieRatingTouched = false;
let addMoviePickTab = "add";
let searchDirectorMode = false;

const ADD_MOVIE_TMDB_URL = "https://www.themoviedb.org/movie/";

function resetAddMovieRatingControls() {
  pendingAddRating = null;
  addMovieRatingTouched = false;
  addMovieRatingSlider.value = String(appRatings.DEFAULT_SLIDER_VALUE);
  if (addMovieRatingSelect) {
    addMovieRatingSelect.value = "";
  }
  if (addMovieRatingClear) {
    addMovieRatingClear.hidden = true;
  }
  addMovieRatingValue.textContent = "—";
  addMovieRatingValue.classList.add("is-empty");
  addMovieRatingField?.classList.remove("is-active");
}

function syncAddMovieRatingDisplay() {
  if (!addMovieRatingTouched) {
    addMovieRatingValue.textContent = "—";
    addMovieRatingValue.classList.add("is-empty");
    addMovieRatingField?.classList.remove("is-active");
    pendingAddRating = null;
    addMovieRatingSlider.value = String(appRatings.DEFAULT_SLIDER_VALUE);
    if (addMovieRatingSelect) {
      addMovieRatingSelect.value = "";
    }
    if (addMovieRatingClear) {
      addMovieRatingClear.hidden = true;
    }
    return;
  }
  addMovieRatingField?.classList.add("is-active");
  if (addMovieRatingClear) {
    addMovieRatingClear.hidden = false;
  }
  const rating =
    pendingAddRating ?? appRatings.ratingFromSliderValue(Number(addMovieRatingSlider.value));
  pendingAddRating = rating;
  addMovieRatingValue.textContent = appRatings.formatUserRating(rating);
  addMovieRatingValue.classList.remove("is-empty");
  addMovieRatingSlider.value = String(appRatings.sliderValueFromRating(rating));
  if (addMovieRatingSelect) {
    addMovieRatingSelect.value = appRatings.formatUserRating(rating);
  }
}

function onAddMovieRatingSliderInput() {
  addMovieRatingTouched = true;
  pendingAddRating = appRatings.ratingFromSliderValue(Number(addMovieRatingSlider.value));
  syncAddMovieRatingDisplay();
}

function onAddMovieRatingSelectChange() {
  if (!addMovieRatingSelect) {
    return;
  }
  if (addMovieRatingSelect.value === "") {
    resetAddMovieRatingControls();
    return;
  }
  addMovieRatingTouched = true;
  pendingAddRating = appRatings.normalizeRating(addMovieRatingSelect.value);
  syncAddMovieRatingDisplay();
}

function clearAddMovieRating() {
  resetAddMovieRatingControls();
}

function initAddMovieRatingSelect() {
  if (!addMovieRatingSelect) {
    return;
  }
  addMovieRatingSelect.innerHTML = appRatings.ratingSelectInnerHtml(null, { includeUnrated: true });
}

function syncAddMoviePickStep() {
  const watched = selectedAddListId === appLists.WATCHED_ID;
  if (addMovieRatingField) {
    addMovieRatingField.hidden = !watched;
  }
  if (!watched) {
    resetAddMovieRatingControls();
  }
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

function suggestPosterHtml(result) {
  const url = appTmdb.buildImageUrl(result.posterPath, appTmdb.POSTER_SIZES.suggest);
  if (!url) {
    return `<span class="search-suggest-poster search-suggest-poster--empty"></span>`;
  }
  return `<img class="search-suggest-poster" data-poster-src="${appCardHtml.escapeHtml(url)}" alt="" loading="lazy">`;
}

function renderSuggest() {
  if (!suggestResults.length) {
    hideSuggest();
    return;
  }

  searchSuggest.innerHTML = suggestResults
    .map((result, index) => {
      const year = appCardHtml.formatYear(result.releaseDate);
      const active = index === suggestIndex ? " active" : "";
      const statusId = appLists.primaryListIdForMovie(userState.lists, result.id);
      const status = statusId
        ? appLists.findList(userState.lists, statusId)
        : null;
      const added = status
        ? `<span class="search-suggest-added">In ${appCardHtml.escapeHtml(status.name)}</span>`
        : "";
      const metaParts = [];
      if (year) {
        metaParts.push(year);
      } else if (!result.directorHint) {
        metaParts.push("Year unknown");
      }
      if (result.directorHint) {
        metaParts.push(result.directorHint);
      }
      const meta = metaParts.join(" · ");
      return `<li class="search-suggest-item${active}" role="option" data-suggest-index="${index}" aria-selected="${index === suggestIndex}">
  ${suggestPosterHtml(result)}
  <span class="search-suggest-text">
    <span class="search-suggest-title">${appCardHtml.escapeHtml(result.title)}</span>
    <span class="search-suggest-meta">${appCardHtml.escapeHtml(meta)}</span>
  </span>
  ${added}
</li>`;
    })
    .join("");
  searchSuggest.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
  bindPosterImages(searchSuggest);
}

async function runSearch(query) {
  if (searchController) {
    searchController.abort();
  }
  searchController = new AbortController();
  const token = ++suggestRequestToken;

  setSearchBusy(true);
  try {
    const results = await searchMovies(query, {
      signal: searchController.signal,
      mode: searchDirectorMode ? "director" : "movie",
    });
    if (token !== suggestRequestToken) {
      return;
    }
    suggestResults = results;
    suggestIndex = -1;
    if (!results.length) {
      const emptyMessage = searchDirectorMode
        ? `No directed movies found for "${query}".`
        : `No movies found for "${query}".`;
      showSuggestMessage(emptyMessage);
      return;
    }
    renderSuggest();
  } catch (error) {
    if (error.name === "AbortError" || token !== suggestRequestToken) {
      return;
    }
    showSuggestMessage(`Search failed. ${error.message}`);
  } finally {
    if (token === suggestRequestToken) {
      setSearchBusy(false);
    }
  }
}

function onSearchInput() {
  updateSearchClearVisibility();
  const query = searchInput.value.trim();

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }

  if (!query) {
    suggestRequestToken += 1;
    setSearchBusy(false);
    hideSuggest();
    return;
  }

  if (!hasTmdbAccess()) {
    showSuggestMessage("Add a TMDB credential in Settings to search.");
    return;
  }

  searchDebounceTimer = setTimeout(() => {
    searchDebounceTimer = null;
    runSearch(query);
  }, SEARCH_DEBOUNCE_MS);
}

function clearSearch() {
  searchInput.value = "";
  updateSearchClearVisibility();
  suggestRequestToken += 1;
  setSearchBusy(false);
  hideSuggest();
}

function updateAddMovieHint() {
  if (!addMovieHint) {
    return;
  }
  if (!hasTmdbAccess()) {
    addMovieHint.textContent = "Add a TMDB credential in Settings to search.";
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
  setAddMoviePickTab("add");
  if (addMoviePickTabs) {
    addMoviePickTabs.hidden = true;
  }
  addMovieDialog?.classList.remove("is-pick-step");
  addMovieSearchStep.hidden = false;
  addMoviePickStep.hidden = true;
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
  addMovieListPicker.querySelectorAll(".add-list-option").forEach((button) => {
    const selected = listId != null && button.dataset.listId === listId;
    button.setAttribute("aria-pressed", String(selected));
  });
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
  setAddMoviePickTab("add");
  addMovieSearchStep.hidden = true;
  addMoviePickStep.hidden = false;
  renderAddMoviePicked(result);
  updateAddListPickerSelection(selectedAddListId);
  syncAddMoviePickStep();
  syncAddMovieSubmitState();
  prefetchAddMovieDetail(result.id);
  addMovieSubmit.focus({ preventScroll: true });
}

function confirmAddMovie() {
  if (!pendingAddResult) {
    return;
  }
  const hasPreset = selectedAddListId != null;
  const hasCustom = selectedAddCustomListIds.size > 0;
  if (!hasPreset && !hasCustom) {
    return;
  }

  const movieId = pendingAddResult.id;
  let changed = false;

  if (hasPreset) {
    const nextLists = appLists.assignMovieToList(userState.lists, selectedAddListId, movieId);
    if (updateLists(nextLists)) {
      changed = true;
    }
    if (selectedAddListId === appLists.WATCHED_ID && pendingAddRating != null) {
      if (
        updateRatings(appRatings.setRating(userState.ratings, movieId, pendingAddRating))
      ) {
        changed = true;
      }
    }
    if (changed) {
      recordAddedAt(movieId);
      recordMovieStatus(movieId, selectedAddListId);
    }
  }

  let nextCustomLists = userState.customLists;
  for (const listId of selectedAddCustomListIds) {
    const updated = appCustomLists.addMovieToCustomList(nextCustomLists, listId, movieId);
    if (updated !== nextCustomLists) {
      nextCustomLists = updated;
      changed = true;
    }
  }
  if (nextCustomLists !== userState.customLists) {
    userState = { ...userState, customLists: nextCustomLists };
  }

  if (!changed) {
    return;
  }
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
}

function openAddMovieDialog() {
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
  const result = suggestResults[index];
  if (!result) {
    return;
  }
  hideSuggest();
  showAddPickStep(result);
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
  syncAddMoviePickStep();
  syncAddMovieSubmitState();
}
