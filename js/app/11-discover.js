/**
 * TMDB discover browse: upcoming and now playing lists.
 */

let discoverTab = appDiscover.DEFAULT_DISCOVER_TAB;
let discoverPage = appDiscover.DISCOVER_DEFAULT_PAGE;
let discoverTotalPages = 1;
let discoverMovieIds = [];
let discoverLoading = false;
let discoverLoadError = null;
let discoverLoadToken = 0;

function isDiscoverActive() {
  return appView === "discover";
}

function discoverDisplayIds() {
  return discoverMovieIds;
}

function detailNavigationIds() {
  if (isDiscoverActive()) {
    return discoverDisplayIds();
  }
  return renderedMovieIds.length ? renderedMovieIds : displayMovieIds();
}

function syncDiscoverTabUi() {
  if (!discoverTabs) {
    return;
  }
  for (const tabBtn of discoverTabs.querySelectorAll("[data-discover-tab]")) {
    const active = tabBtn.dataset.discoverTab === discoverTab;
    tabBtn.setAttribute("aria-selected", active ? "true" : "false");
    tabBtn.tabIndex = active ? 0 : -1;
  }
}

function syncDiscoverPaginationUi() {
  const pageLabel =
    discoverTotalPages > 1 ? `Page ${discoverPage} of ${discoverTotalPages}` : `Page ${discoverPage}`;
  const show = isDiscoverActive();
  const prevDisabled = discoverLoading || discoverPage <= 1;
  const nextDisabled = discoverLoading || discoverPage >= discoverTotalPages;

  if (discoverPagination) {
    discoverPagination.hidden = !show;
  }
  if (discoverPrevBtn) {
    discoverPrevBtn.disabled = prevDisabled;
  }
  if (discoverNextBtn) {
    discoverNextBtn.disabled = nextDisabled;
  }
  if (discoverPageLabel) {
    discoverPageLabel.textContent = pageLabel;
  }

  if (discoverPaginationBottom) {
    discoverPaginationBottom.hidden = !show;
  }
  if (discoverPrevBottomBtn) {
    discoverPrevBottomBtn.disabled = prevDisabled;
  }
  if (discoverNextBottomBtn) {
    discoverNextBottomBtn.disabled = nextDisabled;
  }
  if (discoverPageLabelBottom) {
    discoverPageLabelBottom.textContent = pageLabel;
  }
}

function renderDiscoverEmptyState(count) {
  if (count) {
    emptyState.hidden = true;
    emptyState.innerHTML = "";
    return;
  }
  emptyState.hidden = false;
  if (!hasTmdbAccess()) {
    emptyState.innerHTML = `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to use Discover.`;
    return;
  }
  if (discoverLoading) {
    emptyState.innerHTML = `<strong>Loading releases…</strong>`;
    return;
  }
  if (discoverLoadError) {
    emptyState.innerHTML = `<strong>Could not load releases</strong><p class="empty-state-hint">Check your credential and connection, then try again.</p>`;
    return;
  }
  emptyState.innerHTML = `<strong>No releases to show</strong>`;
}

function renderDiscover() {
  const ids = discoverDisplayIds();
  grid.innerHTML = ids.map((id) => rowHtml(id)).join("");
  bindPosterImages(grid);
  syncDiscoverTabUi();
  syncDiscoverPaginationUi();
  syncAppViewChrome();
  renderDiscoverEmptyState(ids.length);
  syncAddMovieFabVisibility(ids.length);
  updateListHeader();
}

function seedDiscoverMovieStubs(entries) {
  if (!Array.isArray(entries)) {
    return;
  }
  for (const entry of entries) {
    const id = Number(entry?.id);
    if (!Number.isInteger(id) || id <= 0) {
      continue;
    }
    if (appTmdb.isDetailedMovieRecord(movieById.get(id))) {
      continue;
    }
    movieById.set(id, entry);
    movieErrors.delete(id);
  }
}

function renderDiscoverAfterLoad() {
  renderDiscover();
  if (detailMovieId != null) {
    renderDetail();
  }
}

async function loadDiscoverTab(tab, options = {}) {
  discoverTab = appDiscover.normalizeDiscoverTab(tab);
  if (options.resetPage) {
    discoverPage = appDiscover.DISCOVER_DEFAULT_PAGE;
  } else if (options.page != null) {
    discoverPage = appDiscover.normalizeDiscoverPage(options.page);
  }
  discoverLoading = true;
  discoverLoadError = null;
  discoverMovieIds = [];
  const token = ++discoverLoadToken;
  renderDiscover();

  if (!hasTmdbAccess()) {
    discoverLoading = false;
    renderDiscover();
    return;
  }

  try {
    const result = await fetchDiscoverMovies(discoverTab, { page: discoverPage });
    if (token !== discoverLoadToken) {
      return;
    }
    discoverPage = result.page;
    discoverTotalPages = result.totalPages;
    discoverMovieIds = result.entries.map((entry) => entry.id);
    seedDiscoverMovieStubs(result.entries);
    discoverLoading = false;
    renderDiscoverAfterLoad();
  } catch (_) {
    if (token !== discoverLoadToken) {
      return;
    }
    discoverLoadError = true;
    discoverMovieIds = [];
    discoverLoading = false;
    renderDiscoverAfterLoad();
  }
}

function navigateDiscoverPage(delta) {
  const nextPage = discoverPage + delta;
  if (nextPage < 1 || nextPage > discoverTotalPages) {
    return;
  }
  discoverPage = nextPage;
  const hash = appDiscover.buildDiscoverHash(discoverTab, discoverPage);
  history.pushState({ appView: "discover", discoverTab, discoverPage }, "", hash);
  loadDiscoverTab(discoverTab, { page: discoverPage, pushHistory: false });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function onDiscoverPrevClick() {
  navigateDiscoverPage(-1);
}

function onDiscoverNextClick() {
  navigateDiscoverPage(1);
}

function navigateToDiscover(tab, options = {}) {
  if (typeof closeAddMovieDialog === "function") {
    closeAddMovieDialog();
  }
  closeDetail({ popHistory: false });
  discoverTab = appDiscover.normalizeDiscoverTab(tab);
  discoverPage = appDiscover.DISCOVER_DEFAULT_PAGE;
  appView = "discover";
  activeCustomListId = null;
  if (options.pushHistory !== false) {
    history.pushState(
      { appView: "discover", discoverTab, discoverPage: 1 },
      "",
      appDiscover.buildDiscoverHash(discoverTab, 1),
    );
  }
  syncAppViewChrome();
  refreshViewModeForActiveList();
  loadDiscoverTab(discoverTab, { resetPage: true, pushHistory: false });
}

function onDiscoverTabClick(event) {
  const tabBtn = event.target.closest("[data-discover-tab]");
  if (!tabBtn) {
    return;
  }
  const tab = tabBtn.dataset.discoverTab;
  if (tab === discoverTab) {
    return;
  }
  history.pushState(
    { appView: "discover", discoverTab: tab, discoverPage: 1 },
    "",
    appDiscover.buildDiscoverHash(tab, 1),
  );
  loadDiscoverTab(tab, { resetPage: true, pushHistory: false });
}

function openDiscover() {
  navigateToDiscover(appDiscover.DEFAULT_DISCOVER_TAB);
}
