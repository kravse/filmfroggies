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
      return `<li class="search-suggest-item${active}" role="option" data-suggest-index="${index}" aria-selected="${index === suggestIndex}">
  ${suggestPosterHtml(result)}
  <span class="search-suggest-text">
    <span class="search-suggest-title">${appCardHtml.escapeHtml(result.title)}</span>
    <span class="search-suggest-meta">${year || "Year unknown"}</span>
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
    const results = await searchMovies(query, { signal: searchController.signal });
    if (token !== suggestRequestToken) {
      return;
    }
    suggestResults = results;
    suggestIndex = -1;
    if (!results.length) {
      showSuggestMessage(`No movies found for "${query}".`);
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
  addMovieHint.textContent = hasTmdbAccess()
    ? "Search TMDB to find a movie to add."
    : "Add a TMDB credential in Settings to search.";
}

function showAddSearchStep() {
  pendingAddResult = null;
  selectedAddListId = null;
  resetAddMovieRatingControls();
  addMovieSearchStep.hidden = false;
  addMoviePickStep.hidden = true;
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
    const selected = button.dataset.listId === listId;
    button.setAttribute("aria-pressed", String(selected));
  });
}

function showAddPickStep(result) {
  pendingAddResult = result;
  selectedAddListId = appLists.DEFAULT_LIST_ID;
  resetAddMovieRatingControls();
  addMovieSearchStep.hidden = true;
  addMoviePickStep.hidden = false;
  renderAddMoviePicked(result);
  updateAddListPickerSelection(selectedAddListId);
  syncAddMoviePickStep();
  addMovieSubmit.focus({ preventScroll: true });
}

function confirmAddMovie() {
  if (!pendingAddResult || !selectedAddListId) {
    return;
  }
  const rating =
    selectedAddListId === appLists.WATCHED_ID ? pendingAddRating : null;
  addMovieToList(pendingAddResult, selectedAddListId, rating);
}

function openAddMovieDialog() {
  updateAddMovieHint();
  showAddSearchStep();
  clearSearch();
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
  selectedAddListId = listId;
  updateAddListPickerSelection(listId);
  syncAddMoviePickStep();
}
