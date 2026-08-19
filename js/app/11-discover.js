/**
 * TMDB discover browse: upcoming and now playing lists.
 */

let discoverTab = appDiscover.DEFAULT_DISCOVER_TAB;
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
  return displayMovieIds();
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

function renderDiscoverEmptyState(count) {
  if (count) {
    emptyState.hidden = true;
    emptyState.innerHTML = "";
    return;
  }
  emptyState.hidden = false;
  if (!hasTmdbAccess()) {
    emptyState.innerHTML = `<strong>Add your TMDB token</strong>Open Settings and paste your TMDB API Read Access Token to browse new releases.`;
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
  syncAppViewChrome();
  renderDiscoverEmptyState(ids.length);
  syncAddMovieFabVisibility(ids.length);
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
    const entries = await fetchDiscoverMovies(discoverTab);
    if (token !== discoverLoadToken) {
      return;
    }
    discoverMovieIds = entries.map((entry) => entry.id);
    seedDiscoverMovieStubs(entries);
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

function navigateToDiscover(tab, options = {}) {
  if (typeof closeAddMovieDialog === "function") {
    closeAddMovieDialog();
  }
  closeDetail({ popHistory: false });
  discoverTab = appDiscover.normalizeDiscoverTab(tab);
  appView = "discover";
  activeCustomListId = null;
  if (options.pushHistory !== false) {
    history.pushState({ appView: "discover", discoverTab }, "", `#discover/${discoverTab}`);
  }
  syncAppViewChrome();
  refreshViewModeForActiveList();
  loadDiscoverTab(discoverTab, { pushHistory: false });
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
  history.pushState({ appView: "discover", discoverTab: tab }, "", `#discover/${tab}`);
  loadDiscoverTab(tab, { pushHistory: false });
}

function openDiscover() {
  navigateToDiscover(appDiscover.DEFAULT_DISCOVER_TAB);
}

function addDiscoverMovieToPreset(presetListId) {
  if (detailMovieId == null || !isDiscoverActive()) {
    return;
  }
  if (presetListId === appLists.WATCHED_ID && discoverTab !== "now-playing") {
    return;
  }
  const movieId = detailMovieId;
  const nextLists = appLists.assignMovieToList(userState.lists, presetListId, movieId);
  if (!updateLists(nextLists)) {
    return;
  }
  recordAddedAt(movieId);
  recordMovieStatus(movieId, presetListId);
  persistUserState();
  renderDiscover();
  renderDetail();
}

function toggleDiscoverCustomListMembership(listId) {
  if (detailMovieId == null || !isDiscoverActive()) {
    return;
  }
  const movieId = detailMovieId;
  const list = appCustomLists.findCustomList(userState.customLists, listId);
  if (!list) {
    return;
  }
  const isMember = list.movieIds.includes(movieId);
  const nextLists = isMember
    ? appCustomLists.removeMovieFromCustomList(userState.customLists, listId, movieId)
    : appCustomLists.addMovieToCustomList(userState.customLists, listId, movieId);
  if (nextLists === userState.customLists) {
    return;
  }
  userState = {
    ...userState,
    customLists: nextLists,
    ratings: appRatings.normalizeRatings(userState.ratings, userState.lists, nextLists),
  };
  persistUserState();
  renderDiscover();
  renderDetail();
}
