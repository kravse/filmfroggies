/* --- Logged-out splash --- */

/**
 * The marketing page for visitors with no session. Tiles come from committed
 * posters plus the curated titles in appSplash, so nothing here needs a token.
 */

const SPLASH_POSTER_SIZE = "w342";

let splashPainted = false;

/** Admin has its own password gate, so it still owns the page when logged out. */
function isSplashActive() {
  return !accountSyncEnabled() && !isAdminViewActive();
}

function splashPosterUrl(movieId) {
  return localPosterUrlFor({ id: movieId }, SPLASH_POSTER_SIZE);
}

/**
 * Paints every mount once. Nothing is painted until the poster manifest has
 * loaded, so an empty pass leaves the page unpainted and the next sync retries.
 */
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
