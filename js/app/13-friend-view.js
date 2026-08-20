/**
 * Friend list page: fetch, overview, stacked section grids.
 */

function friendCardRatingChipHtml(movieId) {
  if (!friendViewState?.ratings) {
    return "";
  }
  const rating = appRatings.getRating(friendViewState.ratings, movieId);
  if (rating == null) {
    return "";
  }
  const text = appRatings.formatUserRating(rating);
  return `<span class="card-friend-rating" aria-label="Friend rating ${appCardHtml.escapeHtml(text)}" title="Friend">★ ${appCardHtml.escapeHtml(text)}</span>`;
}

function friendMyRatingChipHtml(movieId) {
  const rating = appRatings.getRating(userState.ratings, movieId);
  if (rating == null) {
    return "";
  }
  const text = appRatings.formatUserRating(rating);
  return `<span class="card-user-rating" aria-label="Your rating ${appCardHtml.escapeHtml(text)}" title="You">${appCardHtml.escapeHtml(text)}</span>`;
}

function friendCardRatingsHtml(movieId) {
  const friend = friendCardRatingChipHtml(movieId);
  const mine = friendMyRatingChipHtml(movieId);
  if (!friend && !mine) {
    return "";
  }
  return `<div class="card-body-ratings card-body-ratings--friend">${friend}${mine}</div>`;
}

function friendCardFooterHtml(movieId) {
  if (gridViewMode !== "cards") {
    return "";
  }
  const ratings = friendCardRatingsHtml(movieId);
  if (!ratings) {
    return "";
  }
  return `<div class="card-footer card-footer--friend">${ratings}</div>`;
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
  const ratings = friendCardRatingsHtml(movieId);
  return `${posterWrapOpen(movieId)}
  ${posterHtml(record, appTmdb.POSTER_SIZES.detailGrid)}
</div>
<div class="card-body">
  <div class="card-text">
    <div class="card-title">${appCardHtml.escapeHtml(record.title)}</div>
    ${
      ratings
        ? `<div class="card-meta-row"><div class="card-meta">${cardMetaHtml(record)}</div>${ratings}</div>`
        : `<div class="card-meta">${cardMetaHtml(record)}</div>`
    }
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

function friendRatingLegendHtml() {
  return `<div class="friend-view-rating-legend" aria-label="Rating legend">
    <span class="friend-view-rating-legend-label">Ratings</span>
    <ul class="friend-view-rating-legend-items">
      <li class="friend-view-rating-legend-item">
        <span class="friend-view-rating-legend-chip friend-view-rating-legend-chip--friend">★ 8.0</span>
        <span class="friend-view-rating-legend-text">Their rating</span>
      </li>
      <li class="friend-view-rating-legend-item">
        <span class="friend-view-rating-legend-chip friend-view-rating-legend-chip--mine">8.0</span>
        <span class="friend-view-rating-legend-text">Your rating</span>
      </li>
    </ul>
  </div>`;
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
  const rows = section.movieIds.map((id) => friendMovieRowHtml(id)).join("");
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
          <span class="friend-view-list-count">${section.movieIds.length}</span>
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
  if (typeof closeFriends === "function" && !friendsDialog.hidden) {
    closeFriends();
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
  clearFriendViewState();
  navigateToMain(options);
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
  const ids = appFriendView.friendNavigationIds(friendViewSections, null);
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
  const names = appFriendView.friendListNamesForMovie(friendViewState, movieId);
  const rating = appRatings.getRating(friendViewState.ratings, movieId);
  const parts = [];
  if (names.length) {
    parts.push(`On their ${names.join(", ")}`);
  }
  if (rating != null) {
    parts.push(`Friend rated ★ ${appRatings.formatUserRating(rating)}`);
  }
  const myRating = appRatings.getRating(userState.ratings, movieId);
  if (myRating != null) {
    parts.push(`You rated ★ ${appRatings.formatUserRating(myRating)}`);
  }
  if (!parts.length) {
    return "";
  }
  return `<p class="friend-detail-note">${appCardHtml.escapeHtml(parts.join(" · "))}</p>`;
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
