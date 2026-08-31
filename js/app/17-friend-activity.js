const FRIEND_ACTIVITY_COLLAPSED_KEY = "moviecollector-friend-activity-collapsed";
let friendActivityHeaderObserver = null;

function positionFriendActivityBelowHeader() {
  const header = document.querySelector("body > header");
  if (!header || !friendActivityEl || typeof header.getBoundingClientRect !== "function") return;
  const bottom = Math.max(0, header.getBoundingClientRect()?.bottom || 0);
  friendActivityEl.style.setProperty("--friend-activity-top", `${Math.round(bottom + 12)}px`);
}

function friendActivityDateLabel(value) {
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function friendActivityPoster(movie) {
  const src = appTmdb.buildImageUrl(movie?.posterPath, "w185");
  if (!src) return `<span class="friend-activity-poster-empty" aria-hidden="true"></span>`;
  return `<img src="${appCardHtml.escapeHtml(src)}" alt="" loading="lazy" />`;
}

function renderFriendActivity() {
  if (!friendActivityEl) return;
  const visible = accountSyncEnabled() && appView !== "admin" && document.body.classList.contains("view-splash") === false;
  friendActivityEl.hidden = !visible;
  document.body.classList.toggle("friend-activity-expanded", visible && !friendActivityCollapsed);
  if (!visible) return;
  friendActivityEl.classList.toggle("is-collapsed", friendActivityCollapsed);
  friendActivityToggle.setAttribute("aria-expanded", String(!friendActivityCollapsed));
  friendActivityToggle.setAttribute("aria-label", `${friendActivityCollapsed ? "Expand" : "Collapse"} friends activity`);
  friendActivityToggle.querySelector(".friend-activity-chevron").textContent = "›";

  if (friendActivityLoading && !friendActivityLoaded) {
    friendActivityStatus.hidden = false;
    friendActivityStatus.textContent = "Loading activity…";
    friendActivityList.innerHTML = "";
    return;
  }
  if (friendActivityError && !friendActivityLoaded) {
    friendActivityStatus.hidden = false;
    friendActivityStatus.innerHTML = `Couldn’t load activity. <button type="button" data-friend-activity-retry>Try again</button>`;
    friendActivityList.innerHTML = "";
    return;
  }
  if (!friendActivityItems.length) {
    friendActivityStatus.hidden = false;
    friendActivityStatus.textContent = "No dated friend viewings yet.";
    friendActivityList.innerHTML = "";
    return;
  }
  friendActivityStatus.hidden = true;
  friendActivityList.innerHTML = friendActivityItems.map((item) => {
    const movie = movieById.get(item.movieId);
    const title = movie?.title || `Movie #${item.movieId}`;
    const rating = appRatings.normalizeRating(item.rating);
    return `<li><button type="button" class="friend-activity-item" data-friend-activity-movie-id="${item.movieId}">
      <span class="friend-activity-poster">${friendActivityPoster(movie)}</span>
      <span class="friend-activity-copy">
        <strong>${appCardHtml.escapeHtml(title)}</strong>
        <span>${appCardHtml.escapeHtml(item.friend.displayName)} · ${appCardHtml.escapeHtml(friendActivityDateLabel(item.watchedOn))}</span>
      </span>
      ${rating == null ? "" : `<span class="rating-chit friend-activity-rating">${appCardHtml.escapeHtml(appRatings.formatUserRating(rating))}</span>`}
    </button></li>`;
  }).join("");
}

async function refreshFriendActivity(options = {}) {
  if (!accountSyncEnabled() || friendActivityLoading) {
    renderFriendActivity();
    return;
  }
  if (friendActivityLoaded && !options.force) {
    renderFriendActivity();
    return;
  }
  friendActivityLoading = true;
  friendActivityError = null;
  renderFriendActivity();
  try {
    let body;
    try {
      body = await fetchFriendsActivity(20);
    } catch (error) {
      const localDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (!localDev || error?.status !== 404) throw error;
      const roster = await fetchFriends();
      const accepted = (roster?.friends || []).filter((friend) => friend.status === "accepted");
      const friends = await Promise.all(accepted.map(async (friend) => ({
        id: friend.id,
        displayName: friend.displayName || friend.email?.split("@")[0] || "Friend",
        doc: await fetchFriendState(friend.id),
      })));
      body = { items: appFriendActivity.friendActivityItems(friends, { limit: 20 }) };
    }
    friendActivityItems = Array.isArray(body?.items) ? body.items : [];
    friendActivityLoaded = true;
    renderFriendActivity();
    const ids = [...new Set(friendActivityItems.map((item) => Number(item.movieId)).filter(Number.isInteger))];
    await hydrateMovies(ids, { onRecord: () => renderFriendActivity() });
  } catch (error) {
    friendActivityError = error;
  } finally {
    friendActivityLoading = false;
    renderFriendActivity();
  }
}

function resetFriendActivity() {
  friendActivityItems = [];
  friendActivityLoaded = false;
  friendActivityError = null;
  friendActivityLoading = false;
  renderFriendActivity();
}

function toggleFriendActivity() {
  friendActivityCollapsed = !friendActivityCollapsed;
  try { localStorage.setItem(FRIEND_ACTIVITY_COLLAPSED_KEY, friendActivityCollapsed ? "1" : "0"); } catch (_) {}
  renderFriendActivity();
}

function initFriendActivity() {
  try { friendActivityCollapsed = localStorage.getItem(FRIEND_ACTIVITY_COLLAPSED_KEY) === "1"; } catch (_) {}
  friendActivityToggle?.addEventListener("click", toggleFriendActivity);
  friendActivityRefresh?.addEventListener("click", () => refreshFriendActivity({ force: true }));
  friendActivityList?.addEventListener("click", (event) => {
    const item = event.target.closest("[data-friend-activity-movie-id]");
    if (item) openDetail(Number(item.dataset.friendActivityMovieId));
  });
  friendActivityStatus?.addEventListener("click", (event) => {
    if (event.target.closest("[data-friend-activity-retry]")) refreshFriendActivity({ force: true });
  });
  positionFriendActivityBelowHeader();
  const header = document.querySelector("body > header");
  if (header && typeof ResizeObserver === "function") {
    friendActivityHeaderObserver = new ResizeObserver(positionFriendActivityBelowHeader);
    friendActivityHeaderObserver.observe(header);
  }
  window.addEventListener("resize", positionFriendActivityBelowHeader);
  renderFriendActivity();
}
