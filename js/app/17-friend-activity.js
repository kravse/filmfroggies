const FRIEND_ACTIVITY_COLLAPSED_KEY = "moviecollector-friend-activity-collapsed";
const FRIEND_ACTIVITY_COLLAPSED_EXPLICIT_KEY = "moviecollector-friend-activity-collapsed-explicit";
const FRIEND_ACTIVITY_POLL_MS = 60_000;
let friendActivityHeaderObserver = null;
let friendActivityPollTimer = null;
let friendActivityNavigateKey = null;

function friendActivityCollapsedExplicit() {
  try {
    return localStorage.getItem(FRIEND_ACTIVITY_COLLAPSED_EXPLICIT_KEY) === "1";
  } catch (_) {
    return false;
  }
}

function readInitialFriendActivityCollapsed() {
  try {
    const stored = localStorage.getItem(FRIEND_ACTIVITY_COLLAPSED_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch (_) {}
  return window.matchMedia("(max-width: 900px)").matches;
}

function setFriendActivityCollapsed(collapsed, options = {}) {
  friendActivityCollapsed = collapsed;
  try {
    localStorage.setItem(FRIEND_ACTIVITY_COLLAPSED_KEY, collapsed ? "1" : "0");
    if (options.explicit) {
      localStorage.setItem(FRIEND_ACTIVITY_COLLAPSED_EXPLICIT_KEY, "1");
    }
  } catch (_) {}
  renderFriendActivity();
}

function maybeCollapseEmptyFriendActivity() {
  if (friendActivityCollapsedExplicit() || isFriendsIndexActive()) return;
  if (friendActivityLoaded && !friendActivityItems.length) {
    friendActivityCollapsed = true;
  }
}

function positionFriendActivityPanel() {
  if (!friendActivityEl) return;

  if (isFriendsIndexActive()) {
    const dock = document.querySelector(".friends-dock");
    if (!dock) return;
    const dockRect = dock.getBoundingClientRect();
    friendActivityEl.style.setProperty("--friend-activity-top", `${Math.round(dockRect.top)}px`);
    friendActivityEl.style.setProperty(
      "--friend-activity-bottom",
      `${Math.round(window.innerHeight - dockRect.bottom)}px`,
    );
    return;
  }

  const header = document.querySelector("body > header");
  if (!header || typeof header.getBoundingClientRect !== "function") return;
  const bottom = Math.max(0, header.getBoundingClientRect()?.bottom || 0);
  friendActivityEl.style.setProperty("--friend-activity-top", `${Math.round(bottom + 12)}px`);
  friendActivityEl.style.removeProperty("--friend-activity-bottom");
}

function friendActivityDateLabel(value) {
  return appFriendActivity.formatActivityDateLabel(value);
}

function friendActivityPoster(movie) {
  const src = appTmdb.buildImageUrl(movie?.posterPath, "w185");
  if (!src) return `<span class="friend-activity-poster-empty" aria-hidden="true"></span>`;
  return `<img src="${appCardHtml.escapeHtml(src)}" alt="" loading="lazy" />`;
}

/** The rail hides plus-addressed test accounts, so its roster count must too. */
function acceptedActivityFriends(friends) {
  return (friends || []).filter(
    (friend) =>
      friend.status === "accepted" &&
      appFriendActivity.isVisibleActivityFriend(accountConfig?.email, friend.email),
  );
}

function resolvedFriendActivityAcceptedCount() {
  if (Number.isInteger(friendActivityAcceptedCount) && friendActivityAcceptedCount >= 0) {
    return friendActivityAcceptedCount;
  }
  if (typeof cachedFriendsRoster === "function") {
    const roster = cachedFriendsRoster();
    if (roster) {
      return acceptedActivityFriends(roster).length;
    }
  }
  return null;
}

function friendActivityEmptyStatusHtml() {
  return "When friends log watch dates, they&rsquo;ll show up here.";
}

function isFriendActivityPresetListView() {
  return isWatchedListActive() || isWatchlistActive();
}

function friendActivityDocked() {
  return isFriendsIndexActive();
}

function friendActivityVisible() {
  if (!accountSyncEnabled()) return false;
  if (document.body.classList.contains("view-splash")) return false;
  if (isFriendViewActive()) return false;
  if (isAdminViewActive()) return false;
  // Discover keeps the last preset activeListId, so the preset check below
  // would otherwise let the rail through.
  if (isDiscoverActive()) return false;
  if (!isFriendsIndexActive() && !isFriendActivityPresetListView()) return false;
  const count = resolvedFriendActivityAcceptedCount();
  if (count == null || count === 0) return false;
  return true;
}

function friendActivityRatingHtml(rating) {
  const normalized = appRatings.normalizeRating(rating);
  if (normalized == null) return "";
  const text = appRatings.formatUserRating(normalized);
  return `<span class="friend-activity-rating">${ratingChitHtml(
    ratingSegmentHtml("them", text, false),
    `Friend rating ${text}`,
  )}</span>`;
}

function friendActivityDetailNoteHtml() {
  const ctx = detailFriendActivityContext;
  if (!ctx) return "";
  const date = friendActivityDateLabel(ctx.watchedOn);
  const rating = appRatings.normalizeRating(ctx.rating);
  const ratingHtml = rating == null ? "" : friendActivityRatingHtml(rating);
  return `<p class="friend-activity-detail-note"><span>${appCardHtml.escapeHtml(ctx.displayName)} watched · ${appCardHtml.escapeHtml(date)}</span>${ratingHtml}</p>`;
}

function renderFriendActivity() {
  if (!friendActivityEl) return;
  const visible = friendActivityVisible();
  const docked = visible && friendActivityDocked();
  const open = visible && (docked || !friendActivityCollapsed);
  friendActivityEl.hidden = !visible;
  friendActivityEl.classList.toggle("is-docked", docked);
  document.body.classList.toggle("friend-activity-expanded", open);
  if (!visible) {
    friendActivityEl.classList.remove("is-collapsed");
    return;
  }
  if (docked) {
    friendActivityCollapsed = false;
    friendActivityEl.classList.remove("is-collapsed");
    if (friendActivityToggle) {
      friendActivityToggle.hidden = true;
    }
    if (friendActivityClose) {
      friendActivityClose.hidden = true;
    }
  } else {
    friendActivityEl.classList.toggle("is-collapsed", friendActivityCollapsed);
    if (friendActivityToggle) {
      friendActivityToggle.hidden = !friendActivityCollapsed;
      friendActivityToggle.setAttribute("aria-expanded", String(!friendActivityCollapsed));
      friendActivityToggle.setAttribute(
        "aria-label",
        `${friendActivityCollapsed ? "Show" : "Hide"} friend activity`,
      );
    }
    if (friendActivityClose) {
      friendActivityClose.hidden = friendActivityCollapsed;
    }
  }
  positionFriendActivityPanel();

  if (friendActivityLoading && !friendActivityLoaded) {
    friendActivityStatus.hidden = false;
    friendActivityStatus.textContent = "Loading activity…";
    friendActivityList.innerHTML = "";
    return;
  }
  if (friendActivityError && !friendActivityLoaded) {
    friendActivityStatus.hidden = false;
    friendActivityStatus.innerHTML = `Couldn&rsquo;t load activity. <button type="button" data-friend-activity-retry>Try again</button>`;
    friendActivityList.innerHTML = "";
    return;
  }
  if (!friendActivityItems.length) {
    friendActivityStatus.hidden = false;
    friendActivityStatus.innerHTML = friendActivityEmptyStatusHtml();
    friendActivityList.innerHTML = "";
    return;
  }
  friendActivityStatus.hidden = true;
  friendActivityList.innerHTML = friendActivityItems.map((item) => {
    const movie = movieById.get(item.movieId);
    const title = movie?.title || `Movie #${item.movieId}`;
    const rating = appRatings.normalizeRating(item.rating);
    const friendName = appCardHtml.escapeHtml(item.friend.displayName);
    const dateLabel = appCardHtml.escapeHtml(friendActivityDateLabel(item.watchedOn));
    return `<li><div class="friend-activity-item" data-friend-activity-movie-id="${item.movieId}" data-friend-activity-friend-id="${item.friend.id}" data-friend-activity-friend-name="${friendName}" data-friend-activity-watched-on="${appCardHtml.escapeHtml(item.watchedOn)}" data-friend-activity-rating="${rating ?? ""}" aria-label="${appCardHtml.escapeHtml(title)}">
      <div class="friend-activity-poster-wrap">
        <span class="friend-activity-poster">${friendActivityPoster(movie)}</span>
      </div>
      <span class="friend-activity-copy">
        <strong class="friend-activity-title">${appCardHtml.escapeHtml(title)}</strong>
        <span class="friend-activity-meta">
          <button type="button" class="friend-activity-friend-link" data-friend-id="${item.friend.id}" data-friend-name="${friendName}">${friendName}</button>
          <span class="friend-activity-date">${dateLabel}</span>
        </span>
      </span>
      ${rating == null ? "" : friendActivityRatingHtml(rating)}
    </div></li>`;
  }).join("");
}

async function loadFriendActivityRosterCount() {
  try {
    if (typeof cachedFriendsRoster === "function") {
      const cached = cachedFriendsRoster();
      if (cached) {
        friendActivityAcceptedCount = acceptedActivityFriends(cached).length;
        return;
      }
    }
    const body = await fetchFriends();
    const friends = body?.friends || [];
    if (typeof setFriendsNavData === "function") {
      setFriendsNavData(friends);
    }
    friendActivityAcceptedCount = acceptedActivityFriends(friends).length;
  } catch (_) {
    friendActivityAcceptedCount = null;
  }
}

function friendDocFromWire(doc) {
  return doc ? appUserState.parseUserState(JSON.stringify(doc)) : null;
}

/** When the activity route is missing, rebuild from one bulk friends read. */
async function aggregateFriendActivityLocally(limit) {
  await loadFriendActivityRosterCount();
  const body = await fetchFriendsBulkData();
  const friends = (body?.friends || []).map((friend) => ({
    id: friend.id,
    displayName: friend.displayName,
    email: friend.email,
    doc: friendDocFromWire(friend.doc),
  }));
  return {
    items: appFriendActivity.friendActivityItems(friends, {
      limit,
      viewerEmail: accountConfig?.email,
    }),
  };
}

async function fetchFriendActivityBody(limit = 20) {
  try {
    return await fetchFriendsActivity(limit);
  } catch (error) {
    // Localhost used to be the only place with this fallback; production showed
    // an error when the Worker was not deployed yet or the route 404'd.
    if (error?.status !== 404) {
      throw error;
    }
    return aggregateFriendActivityLocally(limit);
  }
}

async function refreshFriendActivity(options = {}) {
  const background = options.background === true;
  if (!accountSyncEnabled()) {
    renderFriendActivity();
    return;
  }
  if (friendActivityLoading) {
    if (options.force) {
      friendActivityForcePending = true;
    }
    if (!background) {
      renderFriendActivity();
    }
    return;
  }
  if (friendActivityLoaded && !options.force) {
    renderFriendActivity();
    return;
  }

  const showLoading = !background || !friendActivityLoaded;
  if (showLoading) {
    friendActivityLoading = true;
    friendActivityError = null;
    renderFriendActivity();
  }
  try {
    const body = await fetchFriendActivityBody(20);
    if (!Number.isInteger(friendActivityAcceptedCount)) {
      await loadFriendActivityRosterCount();
    }
    friendActivityItems = Array.isArray(body?.items) ? body.items : [];
    friendActivityLoaded = true;
    maybeCollapseEmptyFriendActivity();
    renderFriendActivity();
    const ids = [...new Set(friendActivityItems.map((item) => Number(item.movieId)).filter(Number.isInteger))];
    await hydrateMovies(ids, { onRecord: () => renderFriendActivity() });
  } catch (error) {
    if (showLoading && (friendActivityVisible() || isFriendsIndexActive())) {
      friendActivityError = error;
    }
  } finally {
    if (showLoading) {
      friendActivityLoading = false;
    }
    if (friendActivityVisible()) {
      const key = friendActivityNavigateRefreshKey();
      if (friendActivityNavigateKey == null) {
        friendActivityNavigateKey = key;
      }
    }
    renderFriendActivity();
    if (friendActivityForcePending) {
      friendActivityForcePending = false;
      refreshFriendActivity({ force: true, background: !friendActivityVisible() });
    }
  }
}

function friendActivityNavigateRefreshKey() {
  const listId = userState?.activeListId ?? "";
  return `${appView}:${listId}`;
}

function refreshFriendActivityOnNavigate() {
  if (!accountSyncEnabled()) {
    return;
  }
  const key = friendActivityNavigateRefreshKey();
  if (!friendActivityVisible()) {
    friendActivityNavigateKey = null;
    return;
  }
  if (key === friendActivityNavigateKey) {
    return;
  }
  friendActivityNavigateKey = key;
  refreshFriendActivity({ force: true, background: true });
}

function pollFriendActivity() {
  if (!accountSyncEnabled() || document.visibilityState !== "visible") {
    return;
  }
  refreshFriendActivity({ force: true, background: true });
}

function startFriendActivityPolling() {
  stopFriendActivityPolling();
  if (!accountSyncEnabled()) {
    return;
  }
  friendActivityPollTimer = setInterval(pollFriendActivity, FRIEND_ACTIVITY_POLL_MS);
}

function stopFriendActivityPolling() {
  if (friendActivityPollTimer != null) {
    clearInterval(friendActivityPollTimer);
    friendActivityPollTimer = null;
  }
}

function resetFriendActivity() {
  friendActivityItems = [];
  friendActivityLoaded = false;
  friendActivityError = null;
  friendActivityLoading = false;
  friendActivityForcePending = false;
  friendActivityAcceptedCount = null;
  friendActivityNavigateKey = null;
  stopFriendActivityPolling();
  renderFriendActivity();
}

function toggleFriendActivity() {
  setFriendActivityCollapsed(!friendActivityCollapsed, { explicit: true });
}

function initFriendActivity() {
  friendActivityCollapsed = readInitialFriendActivityCollapsed();
  friendActivityToggle?.addEventListener("click", toggleFriendActivity);
  friendActivityClose?.addEventListener("click", () => setFriendActivityCollapsed(true, { explicit: true }));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || friendActivityCollapsed || !friendActivityVisible() || friendActivityDocked()) {
      return;
    }
    setFriendActivityCollapsed(true, { explicit: true });
  });
  friendActivityList?.addEventListener("click", (event) => {
    const friendLink = event.target.closest(".friend-activity-friend-link");
    if (friendLink) {
      event.stopPropagation();
      if (typeof navigateToFriendView === "function") {
        navigateToFriendView(
          Number(friendLink.dataset.friendId),
          friendLink.dataset.friendName || "Friend",
        );
      }
      return;
    }
    const item = event.target.closest(".friend-activity-item");
    if (!item) return;
    const ratingRaw = item.dataset.friendActivityRating;
    const parsedRating = ratingRaw === "" ? null : Number(ratingRaw);
    openDetail(Number(item.dataset.friendActivityMovieId), {
      friendActivity: {
        friendId: Number(item.dataset.friendActivityFriendId),
        displayName: item.dataset.friendActivityFriendName || "Friend",
        watchedOn: item.dataset.friendActivityWatchedOn || "",
        rating: Number.isFinite(parsedRating) ? parsedRating : null,
      },
    });
  });
  friendActivityStatus?.addEventListener("click", (event) => {
    if (event.target.closest("[data-friend-activity-retry]")) {
      refreshFriendActivity({ force: true });
    }
  });
  positionFriendActivityPanel();
  const header = document.querySelector("body > header");
  const dock = document.querySelector(".friends-dock");
  if (typeof ResizeObserver === "function") {
    friendActivityHeaderObserver = new ResizeObserver(positionFriendActivityPanel);
    if (header) friendActivityHeaderObserver.observe(header);
    if (dock) friendActivityHeaderObserver.observe(dock);
  }
  window.addEventListener("resize", positionFriendActivityPanel);
  window.addEventListener("scroll", positionFriendActivityPanel, { passive: true });
  renderFriendActivity();
}
