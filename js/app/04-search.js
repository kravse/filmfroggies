/**
 * TMDB search box and autocomplete. Search finds movies to add; it never
 * filters the list you already have.
 */

const SEARCH_DEBOUNCE_MS = 300;

let searchDebounceTimer = null;
let searchController = null;
let suggestResults = [];
let suggestIndex = -1;
/** Guards against a slow response overwriting a newer one. */
let suggestRequestToken = 0;

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
  return `<img class="search-suggest-poster" src="${url}" alt="" loading="lazy">`;
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
      // Show the movie's status rather than a bare "added" flag. Favourited
      // outranks watched, so the badge names the most specific one.
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

  if (!hasCredential()) {
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

/** Adds to the active list, moving the movie out of another list if needed. */
function addMovieFromSuggestion(result) {
  const nextLists = appLists.assignMovieToList(
    userState.lists,
    userState.activeListId,
    result.id,
  );
  if (!updateLists(nextLists)) {
    return;
  }
  persistUserState();
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
  addMovieFromSuggestion(result);
  renderSuggest();
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
  const isOpen = !searchSuggest.hidden && suggestResults.length > 0;

  if (event.key === "Escape") {
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
