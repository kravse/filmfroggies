/**
 * Viewport-scoped list hydration helpers. Movie rows hydrate when they enter
 * (or neared) the viewport instead of fetching the entire list upfront.
 *
 * rootMargin expands the observer root so the first batch covers visible rows
 * plus a short prefetch band (e.g. ~20 on screen → ~25–35 in one POST).
 */

const ROW_HYDRATE_ROOT_MARGIN = "320px 0px";

/**
 * How long ids collect before one POST goes out. The timer does not extend when
 * more ids arrive, so this is the coalescing granularity, not a settle delay:
 * a scroll emits one request per window for as long as it lasts, carrying only
 * the rows that crossed the boundary in that slice. Too short and each request
 * carries a single grid row, which is what turned one pass over a collection
 * into dozens of requests. The rootMargin prefetch band is what pays for the
 * wait — rows are requested well before they are visible, so coalescing several
 * grid rows per request costs no perceived latency.
 */
const ROW_HYDRATE_DEBOUNCE_MS = 200;

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

/**
 * Card state a grid row currently shows: `"record"`, `"skeleton"`, `"error"`, or
 * null when the element holds no card.
 *
 * Row markup, not movieById, is what says whether a row rendered its record. A
 * record can land from a path that never touches the grid — the friend activity
 * rail, custom list covers, the watched picker, CSV export — so a row painted
 * before that landed still shows a skeleton with the record sitting in memory.
 */
function rowRenderState(row) {
  if (!row || typeof row.querySelector !== "function") {
    return null;
  }
  const card = row.querySelector(".card");
  if (!card) {
    return null;
  }
  if (card.classList?.contains("is-skeleton")) {
    return "skeleton";
  }
  if (card.classList?.contains("is-error")) {
    return "error";
  }
  return "record";
}

/** Whether a row's markup disagrees with the record state now held in memory. */
function rowNeedsRepaint(state, { hasRecord = false, hasError = false } = {}) {
  if (state == null) {
    return false;
  }
  if (hasRecord) {
    return state !== "record";
  }
  if (hasError) {
    return state !== "error";
  }
  return false;
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

module.exports = {
  ROW_HYDRATE_ROOT_MARGIN,
  ROW_HYDRATE_DEBOUNCE_MS,
  HYDRATE_MAX_ATTEMPTS,
  movieIdFromRowElement,
  rowRenderState,
  rowNeedsRepaint,
  isHydrationQuiescent,
  shouldRetryHydrate,
  hydrateRetryDelayMs,
};
