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

async function copyFriendShareUrl(url) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const input = document.createElement("textarea");
  input.value = url;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Could not copy friend link");
}

async function onCopyFriendShareLink() {
  if (!accountSyncEnabled() || !friendShareCopyBtn) return;
  friendShareCopyBtn.disabled = true;
  try {
    const body = await createFriendShareLink();
    const url = `${window.location.origin}${window.location.pathname}#add-friend/${body.token}`;
    await copyFriendShareUrl(url);
    setStatus(friendsStatus, "Friend link copied. Creating another link will revoke this one.", "ok");
  } catch (error) {
    setStatus(friendsStatus, error.message || "Could not copy friend link", "error");
  } finally {
    friendShareCopyBtn.disabled = false;
  }
}

function closeFriendLink() {
  pendingFriendLinkToken = null;
  if (friendLinkDialog) friendLinkDialog.hidden = true;
  setStatus(friendLinkStatus, "", null);
}

async function openFriendLink(token) {
  pendingFriendLinkToken = token;
  if (!accountSyncEnabled()) {
    openLogin();
    setStatus(accountStatus, "Log in to review this friend request.", null);
    return;
  }
  friendLinkDialog.hidden = false;
  friendLinkConfirm.disabled = true;
  friendLinkMessage.textContent = "Checking friend link…";
  setStatus(friendLinkStatus, "", null);
  try {
    const body = await previewFriendShareLink(token);
    const name = body?.friend?.displayName || "this person";
    if (body.state === "self") {
      friendLinkMessage.textContent = "This is your own friend link.";
    } else if (body.state === "accepted") {
      friendLinkMessage.textContent = `You and ${name} are already friends.`;
    } else if (body.state === "pending") {
      friendLinkMessage.textContent = `A friend request with ${name} is already pending.`;
    } else {
      friendLinkMessage.textContent = `Send ${name} a friend request?`;
      friendLinkConfirm.disabled = false;
    }
  } catch (error) {
    friendLinkMessage.textContent = "This friend link is invalid or has expired.";
    setStatus(friendLinkStatus, error.message, "error");
  }
  friendLinkCancel.focus({ preventScroll: true });
}

async function confirmFriendLink() {
  if (!pendingFriendLinkToken) return;
  friendLinkConfirm.disabled = true;
  setStatus(friendLinkStatus, "Sending request…", null);
  try {
    await requestFriendFromShareLink(pendingFriendLinkToken);
    setStatus(friendLinkStatus, "Request sent. They can accept it from their Friends page.", "ok");
    friendLinkMessage.textContent = "Friend request pending.";
    refreshFriendsList({ force: true });
    refreshFriendActivity({ force: true });
  } catch (error) {
    setStatus(friendLinkStatus, error.message, "error");
    friendLinkConfirm.disabled = false;
  }
}

function resumePendingFriendLink() {
  if (pendingFriendLinkToken && accountSyncEnabled()) openFriendLink(pendingFriendLinkToken);
}

function setFriendsNavData(friends) {
  lastFriendsList = friends || [];
  friendsRosterLoaded = true;
  syncFriendsNavBadge(lastFriendsList);
  friendActivityAcceptedCount = acceptedActivityFriends(lastFriendsList).length;
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
    refreshFriendsList({ force: true }).then(() => {
      if (typeof refreshFriendActivity === "function") {
        refreshFriendActivity({
          force: true,
          background: friendActivityLoaded || friendActivityHiddenOnFriendsIndexMobile(),
        });
      }
    });
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
