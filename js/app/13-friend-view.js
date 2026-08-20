/**
 * Friend list page: fetch, overview, stacked section grids.
 */

function friendViewShowsFanRatings() {
  return userState?.preferences?.friendFanRatings === true;
}

function friendRatingSegmentHtml(kind, text, empty) {
  return ratingSegmentHtml(kind, text, empty);
}

function friendRatingChitHtml(movieId) {
  const record = movieById.get(movieId) ?? localMovieRecord(movieId);
  const friendRating = friendViewState?.ratings
    ? appRatings.getRating(friendViewState.ratings, movieId)
    : null;
  const themText = friendRating != null ? appRatings.formatUserRating(friendRating) : "-";
  const myRating = appRatings.getRating(userState.ratings, movieId);
  const mineText = myRating != null ? appRatings.formatUserRating(myRating) : "-";
  const showFan = friendViewShowsFanRatings();
  const fanLabel = record ? appCardHtml.formatRating(record.voteAverage) : "";
  const fanText = fanLabel || "-";
  const ariaLabel = showFan
    ? `Ratings friend ${themText}, yours ${mineText}, fan ${fanText}`
    : `Ratings friend ${themText}, yours ${mineText}`;
  const fanSegment = showFan ? friendRatingSegmentHtml("fan", fanText, !fanLabel) : "";
  return ratingChitHtml(
    `${friendRatingSegmentHtml("them", themText, friendRating == null)}${friendRatingSegmentHtml("mine", mineText, false)}${fanSegment}`,
    ariaLabel,
  );
}

function friendIsRatingSortField(field) {
  return field === "user-rating" || field === "friend-rating" || field === "rating";
}

function friendShowsRatingChit() {
  const field = appSort.getSortField(userState.preferences.sort);
  return (
    friendIsRatingSortField(field) ||
    field === "custom" ||
    field === "title" ||
    field === "added"
  );
}

function friendReleaseYearFooterHtml(movieId) {
  const record = movieById.get(movieId) ?? localMovieRecord(movieId);
  const year = record ? appCardHtml.formatYear(record.releaseDate) : "";
  const text = year || "—";
  const emptyClass = year ? "" : " is-empty";
  return `<span class="card-footer-main${emptyClass}" aria-label="Release year ${appCardHtml.escapeHtml(text)}">${appCardHtml.escapeHtml(text)}</span>`;
}

function friendSortFooterContentHtml(movieId) {
  if (friendShowsRatingChit()) {
    return friendRatingChitHtml(movieId);
  }
  const field = appSort.getSortField(userState.preferences.sort);
  if (field === "year") {
    return friendReleaseYearFooterHtml(movieId);
  }
  if (field === "watched") {
    return cardWatchDateFooterHtml(movieId);
  }
  return friendRatingChitHtml(movieId);
}

function friendCardDetailTrailingHtml(movieId) {
  return friendRatingChitHtml(movieId);
}

function friendCardFooterHtml(movieId) {
  if (gridViewMode !== "cards") {
    return "";
  }
  const content = friendSortFooterContentHtml(movieId);
  if (!content) {
    return "";
  }
  if (friendShowsRatingChit()) {
    return `<div class="card-footer card-footer--friend">${content}</div>`;
  }
  return `<div class="card-footer card-footer--sort card-footer--friend"><div class="card-footer-sort">${content}</div></div>`;
}

function friendCardInnerHtml(movieId) {
  const record = movieById.get(movieId);
  if (!record) {
    const failed = movieErrors.has(movieId);
    const body = posterPlaceholderHtml(null, { error: failed });
    return `${posterWrapOpen(movieId)}${body}</div>${friendCardFooterHtml(movieId)}`;
  }
  if (gridViewMode === "cards") {
    return `${posterWrapOpen(movieId)}${posterHtml(record, appTmdb.POSTER_SIZES.card)}</div>${friendCardFooterHtml(movieId)}`;
  }
  const ratings = friendCardDetailTrailingHtml(movieId);
  return `${posterWrapOpen(movieId)}
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    <div class="card-meta-row"><div class="card-meta">${cardMetaHtml(record)}</div>${ratings}</div>
  </div>
</div>`;
}

function friendMovieHighlightSeen(movieId) {
  if (!isFriendViewActive()) {
    return false;
  }
  const watchedSection = friendViewSections.find((entry) => entry.id === appLists.WATCHED_ID);
  if (!watchedSection || !watchedSection.movieIds.includes(movieId)) {
    return false;
  }
  return appLists.isWatched(userState.lists, movieId);
}

function friendRowInnerHtml(movieId) {
  const record = movieById.get(movieId);
  const stateClass = record
    ? ""
    : movieErrors.has(movieId)
      ? " is-error"
      : " is-skeleton";
  const seenClass = friendMovieHighlightSeen(movieId) ? " is-seen-by-you" : "";
  const title = record ? appCardHtml.escapeHtml(record.title) : `Movie ${movieId}`;
  return `<article class="card card--friend${stateClass}${seenClass}" data-movie-id="${movieId}" tabindex="0" role="button" aria-label="${title}">
${friendCardInnerHtml(movieId)}
</article>`;
}

function friendMovieRowHtml(movieId) {
  return `<div class="movie-row movie-row--card" data-movie-id="${movieId}">${friendRowInnerHtml(movieId)}</div>`;
}

function friendRatingLegendChitHtml() {
  const showFan = friendViewShowsFanRatings();
  const fanSegment = showFan
    ? ratingSegmentHtml("fan", "6.2", false)
    : "";
  return `<div class="rating-chit rating-chit--legend" aria-hidden="true">
        ${ratingSegmentHtml("them", "8.0", false)}
        ${ratingSegmentHtml("mine", "7.5", false)}
        ${fanSegment}
      </div>`;
}

function friendRatingLegendText() {
  return friendViewShowsFanRatings() ? "Friend · Yours · Fan" : "Friend · Yours";
}

function friendRatingLegendHtml() {
  const showFan = friendViewShowsFanRatings();
  return `<div class="friend-view-rating-legend" aria-label="Rating legend">
    <div class="friend-view-rating-legend-main">
      <span class="friend-view-rating-legend-label">Ratings</span>
      <div class="friend-view-rating-legend-row">
        ${friendRatingLegendChitHtml()}
        <span class="friend-view-rating-legend-text">${friendRatingLegendText()}</span>
      </div>
    </div>
    <label class="friend-fan-ratings-toggle" for="friend-fan-ratings-toggle">
      <span class="friend-fan-ratings-toggle-label">Fan ratings</span>
      <span class="toggle-switch">
        <input
          type="checkbox"
          id="friend-fan-ratings-toggle"
          aria-label="Show fan ratings"
          ${showFan ? "checked" : ""}
        />
        <span class="toggle-switch-track" aria-hidden="true"></span>
      </span>
    </label>
  </div>`;
}

function setFriendFanRatings(enabled) {
  if (!userState) {
    return;
  }
  const next = enabled === true;
  if (next === friendViewShowsFanRatings()) {
    return;
  }
  userState = {
    ...userState,
    preferences: {
      ...userState.preferences,
      friendFanRatings: next,
    },
  };
  persistUserState();
  syncFriendFanRatingsUi();
}

function syncFriendFanRatingsUi() {
  const showFan = friendViewShowsFanRatings();
  if (settingsFriendFanRatingsToggle) {
    settingsFriendFanRatingsToggle.checked = showFan;
  }
  if (!isFriendViewActive()) {
    return;
  }
  renderFriendView();
  if (detailMovieId != null) {
    renderDetail();
  }
}

function toggleFriendFanRatings() {
  setFriendFanRatings(!friendViewShowsFanRatings());
}

function friendOverviewHtml(stats, name) {
  const safeName = appCardHtml.escapeHtml(name || "Friend");
  return `<div class="friend-view-hero">
    <h2 class="friend-view-name">${safeName}'s collection</h2>
    <p class="friend-view-lead">${stats.totalMovies} ${stats.totalMovies === 1 ? "movie" : "movies"} across ${stats.sectionCount} ${stats.sectionCount === 1 ? "list" : "lists"}</p>
  </div>
  <dl class="friend-view-stats">
    <div class="friend-view-stat"><dt>Watched</dt><dd>${stats.watchedCount}</dd></div>
    <div class="friend-view-stat"><dt>Watchlist</dt><dd>${stats.watchlistCount}</dd></div>
    <div class="friend-view-stat"><dt>Custom lists</dt><dd>${stats.customListCount}</dd></div>
    <div class="friend-view-stat"><dt>Rated</dt><dd>${stats.ratedCount}</dd></div>
  </dl>
  ${friendRatingLegendHtml()}`;
}

function friendViewSortRuntime() {
  return {
    getRecord: (id) => movieById.get(id) ?? localMovieRecord(id),
    sortMode: userState.preferences.sort,
  };
}

function friendViewNavigationOptions() {
  return {
    sortMode: userState.preferences.sort,
    viewerState: userState,
    friendState: friendViewState,
    runtimeContext: friendViewSortRuntime(),
  };
}

function friendDisplayIdsForSection(section) {
  return appFriendView.friendSectionSortedIds(
    section,
    userState.preferences.sort,
    userState,
    friendViewState,
    friendViewSortRuntime(),
  );
}

function friendWatchedOverlapHtml(stats) {
  if (!stats || stats.overlapWatched <= 0) {
    return "";
  }
  return `<span class="friend-view-list-overlap">${stats.overlapWatched} in common with your Watched</span>`;
}

function friendSectionHtml(section, stats) {
  const isWatched = section.id === appLists.WATCHED_ID;
  const overlapHtml = isWatched ? friendWatchedOverlapHtml(stats) : "";
  const barClass = overlapHtml ? " friend-view-list-bar--has-overlap" : "";
  const collapsed = friendViewCollapsedSections.has(section.id);
  const bodyId = `friend-section-body-${section.id}`;
  const displayIds = friendDisplayIdsForSection(section);
  const rows = displayIds.map((id) => friendMovieRowHtml(id)).join("");
  return `<section class="friend-view-section" id="friend-section-${appCardHtml.escapeHtml(section.id)}" data-friend-section-id="${appCardHtml.escapeHtml(section.id)}">
    <div class="friend-view-list-card${collapsed ? " is-collapsed" : ""}">
      <div class="friend-view-list-bar${barClass}">
        <button
          type="button"
          class="friend-view-list-toggle"
          aria-expanded="${collapsed ? "false" : "true"}"
          aria-controls="${appCardHtml.escapeHtml(bodyId)}"
        >
          <span class="friend-view-list-chevron" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
              <path d="M7.5 5 12.5 10 7.5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="friend-view-list-title">${appCardHtml.escapeHtml(section.name)}</span>
          <span class="friend-view-list-count">${displayIds.length}</span>
        </button>
        ${overlapHtml}
      </div>
      <div class="friend-view-list-body" id="${appCardHtml.escapeHtml(bodyId)}">
        <div class="grid friend-view-grid">${rows}</div>
      </div>
    </div>
  </section>`;
}

function syncFriendSectionCollapse(sectionId) {
  const section = friendViewSectionsEl?.querySelector(
    `[data-friend-section-id="${CSS.escape(String(sectionId))}"]`,
  );
  if (!section) {
    return;
  }
  const collapsed = friendViewCollapsedSections.has(sectionId);
  section.querySelector(".friend-view-list-card")?.classList.toggle("is-collapsed", collapsed);
  const toggle = section.querySelector(".friend-view-list-toggle");
  if (toggle) {
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
}

function toggleFriendSectionCollapse(sectionId) {
  if (friendViewCollapsedSections.has(sectionId)) {
    friendViewCollapsedSections.delete(sectionId);
  } else {
    friendViewCollapsedSections.add(sectionId);
  }
  syncFriendSectionCollapse(sectionId);
}

function clearFriendViewState() {
  activeFriendId = null;
  friendViewName = "";
  friendViewState = null;
  friendViewSections = [];
  friendViewLoadedId = null;
  friendViewError = null;
  friendViewLoading = false;
  friendViewCollapsedSections.clear();
}

function navigateToFriendView(userId, name, options = {}) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }
  closeDetail({ popHistory: false });
  if (typeof closeSettings === "function" && !settingsDialog.hidden) {
    closeSettings();
  }
  appView = "friend";
  activeCustomListId = null;
  activeFriendId = id;
  friendViewName = String(name || "Friend").trim() || "Friend";
  friendViewState = null;
  friendViewSections = [];
  friendViewLoadedId = null;
  friendViewError = null;
  friendViewLoading = true;
  if (options.pushHistory !== false) {
    history.pushState(
      { appView: "friend", activeFriendId: id, friendViewName },
      "",
      appFriendView.buildFriendHash(id),
    );
    markProgrammaticLocation();
  }
  syncAppViewChrome();
  loadFriendView(id);
}

function navigateFromFriendView(options = {}) {
  navigateToFriendsIndex(options);
}

async function loadFriendView(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0 || activeFriendId !== id) {
    return;
  }
  friendViewLoading = true;
  friendViewError = null;
  renderFriendView();
  try {
    const state = await fetchFriendState(id);
    if (activeFriendId !== id) {
      return;
    }
    friendViewState = state;
    friendViewSections = state ? appFriendView.friendListSections(state) : [];
    friendViewLoadedId = id;
    friendViewLoading = false;
    friendViewError = null;
    renderFriendView();
    hydrateFriendView();
  } catch (error) {
    if (activeFriendId !== id) {
      return;
    }
    friendViewLoading = false;
    friendViewError = error?.message || "Could not load their lists.";
    friendViewState = null;
    friendViewSections = [];
    renderFriendView();
  }
}

function hydrateFriendView() {
  const ids = appFriendView.friendNavigationIds(
    friendViewSections,
    null,
    friendViewNavigationOptions(),
  );
  if (!ids.length) {
    return;
  }
  hydrateMovies(ids, {
    onRecord: applyFriendHydratedRecord,
    onUpdate: applyFriendHydratedRecord,
  });
}

function applyFriendHydratedRecord(movieId) {
  if (!isFriendViewActive()) {
    return;
  }
  const rows = friendViewSectionsEl?.querySelectorAll(`.movie-row[data-movie-id="${movieId}"]`);
  if (rows?.length) {
    for (const row of rows) {
      row.innerHTML = friendRowInnerHtml(movieId);
    }
    bindPosterImages(friendViewSectionsEl);
  }
  if (detailMovieId === movieId) {
    renderDetail();
  }
  if (typeof scheduleResortAfterHydration === "function") {
    scheduleResortAfterHydration();
  }
}

function renderFriendView() {
  if (!friendViewOverview || !friendViewSectionsEl) {
    return;
  }
  syncAppViewChrome();
  if (friendViewLoading) {
    friendViewOverview.innerHTML = '<p class="friend-view-message">Loading…</p>';
    friendViewSectionsEl.innerHTML = "";
    return;
  }
  if (friendViewError) {
    friendViewOverview.innerHTML = `<p class="friend-view-message friend-view-message--error">${appCardHtml.escapeHtml(friendViewError)}</p>`;
    friendViewSectionsEl.innerHTML = "";
    return;
  }
  if (!friendViewState) {
    friendViewOverview.innerHTML =
      '<p class="friend-view-message">They have not synced any lists yet.</p>';
    friendViewSectionsEl.innerHTML = "";
    return;
  }
  if (!friendViewSections.length) {
    friendViewOverview.innerHTML = `<p class="friend-view-message">${appCardHtml.escapeHtml(friendViewName)}'s lists are empty so far.</p>`;
    friendViewSectionsEl.innerHTML = "";
    return;
  }
  const stats = appFriendView.friendOverviewStats(friendViewState, userState);
  friendViewOverview.innerHTML = friendOverviewHtml(stats, friendViewName);
  friendViewSectionsEl.innerHTML = friendViewSections
    .map((section) => friendSectionHtml(section, stats))
    .join("");
  bindPosterImages(friendViewSectionsEl);
}

function friendDetailNoteHtml(movieId) {
  if (!isFriendViewActive() || !friendViewState) {
    return "";
  }
  const friendRating = friendViewState.ratings
    ? appRatings.getRating(friendViewState.ratings, movieId)
    : null;
  const ratingText =
    friendRating != null ? appRatings.formatUserRating(friendRating) : "-";
  return `<div class="friend-detail-note">
    <span class="friend-detail-note-label">Friend rating</span>
    ${friendRatingSegmentHtml("them", ratingText, friendRating == null)}
  </div>`;
}

function onFriendFanRatingsToggleChange(event) {
  if (event.target.id === "friend-fan-ratings-toggle") {
    if (isFriendViewActive()) {
      setFriendFanRatings(event.target.checked);
    }
    return;
  }
  if (event.target.id === "settings-friend-fan-ratings") {
    setFriendFanRatings(event.target.checked);
  }
}

function onFriendViewSectionsClick(event) {
  if (!isFriendViewActive()) {
    return;
  }
  const toggle = event.target.closest(".friend-view-list-toggle");
  if (toggle && friendViewSectionsEl?.contains(toggle)) {
    const sectionId = toggle.closest("[data-friend-section-id]")?.dataset.friendSectionId;
    if (sectionId) {
      toggleFriendSectionCollapse(sectionId);
    }
    return;
  }
  const card = event.target.closest(".card[data-movie-id]");
  if (!card || !friendViewSectionsEl?.contains(card)) {
    return;
  }
  openDetail(Number(card.dataset.movieId));
}

function onFriendViewSectionsKeydown(event) {
  if (!isFriendViewActive() || event.key !== "Enter") {
    return;
  }
  const card = event.target.closest(".card[data-movie-id]");
  if (!card || !friendViewSectionsEl?.contains(card)) {
    return;
  }
  event.preventDefault();
  openDetail(Number(card.dataset.movieId));
}
