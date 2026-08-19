/* Watched list metadata filter — chips, field autocomplete, compound query */

const listSearchRow = document.getElementById("list-search-row");
const listSearchInput = document.getElementById("list-search");
const listSearchChips = document.getElementById("list-search-chips");
const listSearchFieldSuggest = document.getElementById("list-search-suggest");
const listSearchClearBtn = document.getElementById("list-search-clear");

/** @type {{ type: string, label: string }[]} */
const listSearchFilterChips = [];
let listSearchSuggestIndex = -1;
let listSearchRenderTimer = null;

function getActiveListSuggestField() {
  if (appListSearch.getYearSuggestDraft(listSearchInput.value)) {
    return appListSearch.getFieldByKey("year");
  }
  return appListSearch.getActiveDraftField(listSearchInput.value);
}

function getListFieldDraftForSuggest(field) {
  if (field?.key === "year") {
    return appListSearch.getYearSuggestDraft(listSearchInput.value);
  }
  return appListSearch.parseFieldDraftInput(listSearchInput.value, field);
}

function watchedMoviesForListSearch() {
  const list = appLists.findList(userState.lists, appLists.WATCHED_ID);
  const ids = list?.movieIds || [];
  return ids
    .map((id) => movieById.get(id))
    .filter(Boolean);
}

function getKnownListFieldValues(fieldKey) {
  const field = appListSearch.getFieldByKey(fieldKey);
  if (!field) {
    return [];
  }
  const scopedMovies = appListSearch.filterMoviesMatchingFieldTerms(
    watchedMoviesForListSearch(),
    appListSearch.chipsToFieldTermsPartial(listSearchFilterChips, fieldKey),
  );
  return field.collectValues(scopedMovies);
}

function getListSearchFilter() {
  return appListSearch.buildSearchFilter(
    listSearchFilterChips,
    listSearchInput.value,
  );
}

function hasActiveListSearch() {
  if (listSearchFilterChips.length > 0) {
    return true;
  }
  const draft = listSearchInput.value.trim();
  if (!draft || appListSearch.isSearchDraftBlockingText(draft)) {
    return false;
  }
  const filter = appListSearch.buildSearchFilter([], draft);
  return appListSearch.hasAnyFilterTerms(filter);
}

function updateListSearchClearVisibility() {
  if (listSearchClearBtn) {
    listSearchClearBtn.hidden = !hasActiveListSearch();
  }
}

function listSearchRenderNow() {
  if (listSearchRenderTimer) {
    clearTimeout(listSearchRenderTimer);
    listSearchRenderTimer = null;
  }
  render();
}

function debouncedListSearchRender() {
  if (listSearchRenderTimer) {
    clearTimeout(listSearchRenderTimer);
  }
  listSearchRenderTimer = setTimeout(() => {
    listSearchRenderTimer = null;
    render();
  }, 200);
}

function renderListSearchChips() {
  if (!listSearchChips) {
    return;
  }
  listSearchChips.innerHTML = listSearchFilterChips
    .map((chip, index) => {
      const field = appListSearch.getFieldByKey(chip.type);
      const safe = appCardHtml.escapeHtml(chip.label);
      const ariaPrefix = field?.chipAriaPrefix || chip.type;
      return `<span class="search-field-chip search-field-chip--${chip.type}"><span class="search-field-chip-label">${safe}</span><button type="button" class="search-field-chip-remove" data-list-search-chip-index="${index}" aria-label="Remove ${ariaPrefix} ${safe}">&times;</button></span>`;
    })
    .join("");
}

function hideListSearchSuggest() {
  listSearchSuggestIndex = -1;
  if (!listSearchFieldSuggest || !listSearchInput) {
    return;
  }
  listSearchFieldSuggest.hidden = true;
  listSearchFieldSuggest.innerHTML = "";
  listSearchInput.setAttribute("aria-expanded", "false");
}

function getListSuggestItems() {
  const field = getActiveListSuggestField();
  if (!field) {
    return [];
  }
  const draft = getListFieldDraftForSuggest(field);
  if (!draft) {
    return [];
  }
  const exclude = listSearchFilterChips
    .filter((chip) => chip.type === field.key)
    .map((chip) => chip.label);
  return appListSearch.filterFieldSuggestions(
    draft.partial,
    field,
    getKnownListFieldValues(field.key),
    { exclude },
  );
}

function renderListSearchSuggest() {
  const field = getActiveListSuggestField();
  const items = getListSuggestItems();
  if (!field || !items.length || !listSearchFieldSuggest || !listSearchInput) {
    hideListSearchSuggest();
    return;
  }

  listSearchFieldSuggest.innerHTML = items
    .map((label, index) => {
      const safe = appCardHtml.escapeHtml(label);
      const activeClass = index === listSearchSuggestIndex ? " active" : "";
      return `<li class="search-field-suggest-item search-field-suggest-item--${field.key}${activeClass}" role="option" data-list-suggest-index="${index}" aria-selected="${index === listSearchSuggestIndex}">${safe}</li>`;
    })
    .join("");
  listSearchFieldSuggest.hidden = false;
  listSearchInput.setAttribute("aria-expanded", "true");
}

function updateListSearchSuggest() {
  if (!getActiveListSuggestField()) {
    hideListSearchSuggest();
    return;
  }
  if (listSearchSuggestIndex >= getListSuggestItems().length) {
    listSearchSuggestIndex = -1;
  }
  renderListSearchSuggest();
}

function addListSearchChip(fieldKey, label, options = {}) {
  const field = appListSearch.getFieldByKey(fieldKey);
  if (!field) {
    return false;
  }
  const known = getKnownListFieldValues(fieldKey);
  const canonical = field.formatLabel(label, known);
  if (!canonical) {
    return false;
  }
  if (
    listSearchFilterChips.some(
      (chip) =>
        chip.type === fieldKey &&
        field.labelKey(chip.label) === field.labelKey(canonical),
    )
  ) {
    return false;
  }
  listSearchFilterChips.push({ type: fieldKey, label: canonical });
  renderListSearchChips();
  if (!options.silent) {
    updateListSearchClearVisibility();
    updateListSearchSuggest();
    debouncedListSearchRender();
  }
  return true;
}

function removeListSearchChipAt(index) {
  if (index < 0 || index >= listSearchFilterChips.length) {
    return;
  }
  listSearchFilterChips.splice(index, 1);
  renderListSearchChips();
  updateListSearchClearVisibility();
  updateListSearchSuggest();
  listSearchRenderNow();
}

function absorbListSearchInputTokens() {
  const trimmed = listSearchInput.value.trim();
  const activeField = appListSearch.getActiveDraftField(trimmed);

  if (activeField && activeField.key !== "year") {
    const draftAbsorbed = appListSearch.absorbFieldDraftInput(
      trimmed,
      activeField,
      getKnownListFieldValues(activeField.key),
    );
    if (draftAbsorbed) {
      if (draftAbsorbed.chipLabel) {
        addListSearchChip(activeField.key, draftAbsorbed.chipLabel, { silent: true });
      }
      listSearchInput.value = draftAbsorbed.remainder;
      return;
    }
  }

  const parsed = appListSearch.parseCompoundSearchQuery(listSearchInput.value);
  const unknownParts = [];

  for (const field of appListSearch.SEARCH_FIELD_TYPES) {
    if (field.key === "year") {
      continue;
    }
    const known = getKnownListFieldValues(field.key);
    for (const term of parsed.fieldTerms[field.key] || []) {
      const label = appListSearch.resolveKnownFieldLabel(term, field, known);
      if (label) {
        addListSearchChip(field.key, label, { silent: true });
      } else {
        unknownParts.push(field.formatQuery(term));
      }
    }
  }

  listSearchInput.value = [...unknownParts, ...parsed.textTerms].join(" ").trim();
}

function pickListSearchSuggestion(index) {
  const field = getActiveListSuggestField();
  const items = getListSuggestItems();
  const label = items[index];
  if (!field || !label) {
    return;
  }
  const draft = getListFieldDraftForSuggest(field);
  const prefix = draft?.prefix?.trim() || "";
  addListSearchChip(field.key, label, { silent: true });
  listSearchInput.value = prefix;
  hideListSearchSuggest();
  updateListSearchClearVisibility();
  listSearchRenderNow();
}

function clearListSearchState() {
  listSearchFilterChips.length = 0;
  listSearchInput.value = "";
  renderListSearchChips();
  hideListSearchSuggest();
  updateListSearchClearVisibility();
}

function clearListSearchAll() {
  clearListSearchState();
  listSearchRenderNow();
}

function syncListSearchVisibility() {
  if (!listSearchRow) {
    return;
  }
  const showFilter =
    appView === "main" &&
    !isCustomListView() &&
    !isDiscoverActive() &&
    isWatchedListActive() &&
    activeMovieIds().length > 0 &&
    hasMovieData();
  listSearchRow.hidden = !showFilter;
}

function onListSearchInput() {
  updateListSearchClearVisibility();
  updateListSearchSuggest();
  debouncedListSearchRender();
}

function onListSearchCommit() {
  absorbListSearchInputTokens();
  hideListSearchSuggest();
  updateListSearchClearVisibility();
  listSearchRenderNow();
}

if (listSearchChips) {
  listSearchChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-list-search-chip-index]");
    if (!button) {
      return;
    }
    removeListSearchChipAt(Number(button.dataset.listSearchChipIndex));
  });
}

if (listSearchFieldSuggest) {
  listSearchFieldSuggest.addEventListener("mousedown", (event) => {
    const item = event.target.closest("[data-list-suggest-index]");
    if (!item) {
      return;
    }
    event.preventDefault();
    pickListSearchSuggestion(Number(item.dataset.listSuggestIndex));
  });
}

if (listSearchInput) {
  listSearchInput.addEventListener("keydown", (event) => {
    const items = getListSuggestItems();
    const suggestOpen = items.length > 0 && !listSearchFieldSuggest.hidden;
    const activeField = getActiveListSuggestField();

    if (event.key === "Backspace" && !listSearchInput.value && listSearchFilterChips.length) {
      removeListSearchChipAt(listSearchFilterChips.length - 1);
      return;
    }

    if (event.key === " " && !suggestOpen && activeField && activeField.key !== "year") {
      const draft = appListSearch.parseFieldDraftInput(
        listSearchInput.value.trim(),
        activeField,
      );
      if (draft?.partial) {
        const label = appListSearch.resolveKnownFieldLabel(
          draft.partial,
          activeField,
          getKnownListFieldValues(activeField.key),
        );
        if (label) {
          event.preventDefault();
          addListSearchChip(activeField.key, label, { silent: true });
          listSearchInput.value = draft.prefix?.trim() || "";
          updateListSearchClearVisibility();
          updateListSearchSuggest();
          listSearchRenderNow();
        }
      }
      return;
    }

    if (!suggestOpen) {
      if (event.key === "Escape") {
        hideListSearchSuggest();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      listSearchSuggestIndex = (listSearchSuggestIndex + 1) % items.length;
      renderListSearchSuggest();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      listSearchSuggestIndex =
        listSearchSuggestIndex <= 0 ? items.length - 1 : listSearchSuggestIndex - 1;
      renderListSearchSuggest();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (listSearchSuggestIndex >= 0) {
        pickListSearchSuggestion(listSearchSuggestIndex);
      } else {
        onListSearchCommit();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      hideListSearchSuggest();
    }
  });

  listSearchInput.addEventListener("blur", () => {
    window.setTimeout(() => {
      absorbListSearchInputTokens();
      hideListSearchSuggest();
      updateListSearchClearVisibility();
      listSearchRenderNow();
    }, 120);
  });

  listSearchInput.addEventListener("input", onListSearchInput);
  listSearchInput.addEventListener("search", onListSearchCommit);
  listSearchInput.addEventListener("change", onListSearchCommit);
}

if (listSearchClearBtn) {
  listSearchClearBtn.addEventListener("click", () => {
    clearListSearchAll();
    listSearchInput.focus();
  });
}

document.addEventListener("click", (event) => {
  if (
    listSearchFieldSuggest &&
    !listSearchFieldSuggest.hidden &&
    !event.target.closest(".list-search-wrap")
  ) {
    hideListSearchSuggest();
  }
});
