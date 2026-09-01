/* Generated from scripts/lib/viewport-hydration.js — run npm run bundle */

const appViewportHydration = (function () {
  /**
   * Viewport-scoped list hydration helpers. Movie rows hydrate when they enter
   * (or neared) the viewport instead of fetching the entire list upfront.
   *
   * rootMargin expands the observer root so the first batch covers visible rows
   * plus a short prefetch band (e.g. ~20 on screen → ~25–35 in one POST).
   */

  const ROW_HYDRATE_ROOT_MARGIN = "320px 0px";

  /**
   * Retry budget for a batch that came back with neither a record nor an error.
   * A row that stays on screen never re-fires the observer, so an unresolved id
   * has to re-queue itself or it renders as a skeleton for the rest of the
   * session. Rate limiting is the common cause, hence the much longer base wait.
   */
  const HYDRATE_MAX_ATTEMPTS = 4;
  const HYDRATE_RETRY_BASE_MS = 500;
  const HYDRATE_RETRY_RATE_LIMITED_MS = 4000;
  const HYDRATE_RETRY_MAX_MS = 20000;

  function movieIdFromRowElement(element) {
    if (!element || typeof element !== "object") {
      return null;
    }
    const raw =
      element.dataset?.movieId ??
      (typeof element.getAttribute === "function" ? element.getAttribute("data-movie-id") : null);
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  /** True when no viewport hydration batches are queued, in flight, or awaiting retry. */
  function isHydrationQuiescent({
    batchTimer = 0,
    inflightCount = 0,
    pendingCount = 0,
    retryCount = 0,
  } = {}) {
    return !batchTimer && inflightCount === 0 && pendingCount === 0 && retryCount === 0;
  }

  /** Whether an id that failed to resolve has retries left. */
  function shouldRetryHydrate(attempt, maxAttempts = HYDRATE_MAX_ATTEMPTS) {
    return Number.isInteger(attempt) && attempt > 0 && attempt < maxAttempts;
  }

  /** Exponential backoff for the next retry, capped so a stalled row still recovers. */
  function hydrateRetryDelayMs(attempt, { rateLimited = false } = {}) {
    const step = Number.isInteger(attempt) && attempt > 0 ? attempt : 1;
    const base = rateLimited ? HYDRATE_RETRY_RATE_LIMITED_MS : HYDRATE_RETRY_BASE_MS;
    return Math.min(base * 2 ** (step - 1), HYDRATE_RETRY_MAX_MS);
  }

  return {
    ROW_HYDRATE_ROOT_MARGIN,
    HYDRATE_MAX_ATTEMPTS,
    movieIdFromRowElement,
    isHydrationQuiescent,
    shouldRetryHydrate,
    hydrateRetryDelayMs,
  };
})();
