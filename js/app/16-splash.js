/* --- Logged-out splash --- */

/**
 * The marketing page for visitors with no session. Tiles come from the curated
 * titles and poster paths in appSplash, rendered off TMDB's image CDN, so
 * nothing here needs a token or a network round trip to build the markup.
 */

const SPLASH_POSTER_SIZE = "w342";

let splashPainted = false;

/** Admin has its own password gate, so it still owns the page when logged out. */
function isSplashActive() {
  return !accountSyncEnabled() && !isAdminViewActive();
}

function splashPosterUrl(movieId) {
  return appTmdb.buildImageUrl(appSplash.splashMovie(movieId)?.posterPath, SPLASH_POSTER_SIZE);
}

/** Paints every mount once; an empty pass leaves the page for the next sync. */
function renderSplash() {
  if (!splashEl || splashPainted) {
    return;
  }
  let painted = 0;
  for (const mount of splashEl.querySelectorAll("[data-splash-group]")) {
    const tiles = appSplash.splashTiles(mount.dataset.splashGroup, {
      posterUrl: splashPosterUrl,
    });
    mount.innerHTML = appSplash.splashTilesHtml(
      tiles,
      mount.dataset.splashVariant || "titled",
      mount === splashMarqueeTrack ? 2 : 1,
    );
    painted += tiles.length;
  }
  splashPainted = painted > 0;
}

function syncSplashUi() {
  const active = isSplashActive();
  document.body.classList.toggle("view-splash", active);
  if (splashEl) {
    splashEl.hidden = !active;
  }
  if (active) {
    renderSplash();
  }
}

function onSplashClick(event) {
  const trigger = event.target.closest("[data-splash-action]");
  if (!trigger) {
    return;
  }
  openLogin({ mode: trigger.dataset.splashAction === "signup" ? "signup" : "login" });
}
