/**
 * Friends index page (#friends): compact roster and add-friend form.
 */

function countIncomingFriendRequests(friends) {
  return (friends || []).filter(
    (friend) => friend.status === "pending" && friend.direction === "incoming",
  ).length;
}

function syncFriendsNavBadge(friends) {
  if (!friendsEntryBtn) {
    return;
  }
  const count = countIncomingFriendRequests(friends);
  const show = count > 0 && accountSyncEnabled() && !isFriendsIndexActive();
  if (friendsNavBadge) {
    friendsNavBadge.hidden = !show;
  }
  const label =
    count === 1
      ? "Friends, 1 pending request"
      : `Friends, ${count} pending requests`;
  friendsEntryBtn.setAttribute("aria-label", show ? label : "Friends");
  friendsEntryBtn.title = show
    ? count === 1
      ? "1 pending friend request"
      : `${count} pending friend requests`
    : "Friends";
}

let lastFriendsList = [];
let friendsRosterLoaded = false;

function setFriendsNavData(friends) {
  lastFriendsList = friends || [];
  friendsRosterLoaded = true;
  syncFriendsNavBadge(lastFriendsList);
  friendActivityAcceptedCount = lastFriendsList.filter((friend) => friend.status === "accepted").length;
  if (typeof renderFriendActivity === "function") {
    renderFriendActivity();
  }
}

/** Logging out or losing the read drops the cache so the next open really loads. */
function clearFriendsNavData() {
  lastFriendsList = [];
  friendsRosterLoaded = false;
  syncFriendsNavBadge(lastFriendsList);
  friendActivityAcceptedCount = null;
  if (typeof renderFriendActivity === "function") {
    renderFriendActivity();
  }
}

/** Null until a read succeeds, which is what separates "empty" from "unknown". */
function cachedFriendsRoster() {
  return friendsRosterLoaded ? lastFriendsList : null;
}

function refreshFriendsNavFromCache() {
  syncFriendsNavBadge(lastFriendsList);
}

/**
 * The badge needs the same roster the page renders, so it shares that loader and
 * its in-flight dedupe instead of issuing a second read.
 */
async function refreshFriendsNavBadge(options = {}) {
  if (!accountSyncEnabled()) {
    clearFriendsNavData();
    stopFriendsNavPolling();
    return;
  }
  await refreshFriendsList(options);
}

/** How often to re-check for incoming friend requests while the tab is visible. */
const FRIENDS_NAV_POLL_MS = 60_000;

let friendsNavPollTimer = null;

function startFriendsNavPolling() {
  stopFriendsNavPolling();
  if (!accountSyncEnabled()) {
    return;
  }
  friendsNavPollTimer = setInterval(pollFriendsNavBadge, FRIENDS_NAV_POLL_MS);
}

function stopFriendsNavPolling() {
  if (friendsNavPollTimer != null) {
    clearInterval(friendsNavPollTimer);
    friendsNavPollTimer = null;
  }
}

/** Background badge check: no roster paint unless the friends page is open. */
function pollFriendsNavBadge() {
  if (!accountSyncEnabled() || document.visibilityState !== "visible") {
    return;
  }
  if (isFriendsIndexActive()) {
    return;
  }
  refreshFriendsNavBadge({ quiet: true });
}

function renderFriendsIndex() {
  if (!isFriendsIndexActive()) {
    return;
  }
  syncAppViewChrome();
  refreshAccountSection();
  if (accountSyncEnabled()) {
    refreshFriendsList();
    if (typeof refreshFriendActivity === "function") {
      refreshFriendActivity({ force: true, background: friendActivityLoaded });
    }
  }
}

function onFriendsInviteSubmit(event) {
  event.preventDefault();
  onAddFriend();
}

function navigateToFriendsIndex(options = {}) {
  closeDetail({ popHistory: false });
  if (typeof closeSettings === "function" && !settingsDialog.hidden) {
    closeSettings();
  }
  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
  appView = "friendsIndex";
  activeCustomListId = null;
  if (options.pushHistory !== false) {
    history.pushState({ appView: "friendsIndex" }, "", appFriendView.buildFriendsIndexHash());
    markProgrammaticLocation();
  }
  renderFriendsIndex();
}
