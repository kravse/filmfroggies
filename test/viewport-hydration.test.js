const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  ROW_HYDRATE_ROOT_MARGIN,
  ROW_HYDRATE_DEBOUNCE_MS,
  HYDRATE_MAX_ATTEMPTS,
  movieIdFromRowElement,
  rowRenderState,
  rowNeedsRepaint,
  shouldRetryHydrate,
  hydrateRetryDelayMs,
} = require("../scripts/lib/viewport-hydration");

/** Minimal stand-in for a `.movie-row` holding one card with these classes. */
function stubRow(classes) {
  if (classes == null) {
    return { querySelector: () => null };
  }
  const card = { classList: { contains: (name) => classes.includes(name) } };
  return { querySelector: (selector) => (selector === ".card" ? card : null) };
}

test("movieIdFromRowElement reads data-movie-id", () => {
  assert.equal(movieIdFromRowElement({ dataset: { movieId: "603" } }), 603);
  assert.equal(
    movieIdFromRowElement({ getAttribute: (name) => (name === "data-movie-id" ? "550" : null) }),
    550,
  );
  assert.equal(movieIdFromRowElement({ dataset: { movieId: "0" } }), null);
  assert.equal(movieIdFromRowElement(null), null);
});

test("rowRenderState reads the card state out of the row markup", () => {
  assert.equal(rowRenderState(stubRow(["card", "is-skeleton"])), "skeleton");
  assert.equal(rowRenderState(stubRow(["card", "is-error"])), "error");
  assert.equal(rowRenderState(stubRow(["card"])), "record");
  assert.equal(rowRenderState(stubRow(null)), null);
  assert.equal(rowRenderState(null), null);
  assert.equal(rowRenderState({}), null);
});

test("rowNeedsRepaint catches a row still showing a skeleton over a held record", () => {
  // The bug this guards: friend activity (and other non-grid hydration paths)
  // fill movieById, so the grid's observer saw a resolved id and unobserved the
  // row without ever repainting it, stranding the skeleton for the session.
  assert.equal(rowNeedsRepaint("skeleton", { hasRecord: true }), true);
  assert.equal(rowNeedsRepaint("error", { hasRecord: true }), true);
  assert.equal(rowNeedsRepaint("record", { hasRecord: true }), false);
});

test("rowNeedsRepaint repaints a skeleton once the id is known to have failed", () => {
  assert.equal(rowNeedsRepaint("skeleton", { hasError: true }), true);
  assert.equal(rowNeedsRepaint("error", { hasError: true }), false);
  // A record wins over a stale failure flag.
  assert.equal(rowNeedsRepaint("record", { hasRecord: true, hasError: true }), false);
});

test("rowNeedsRepaint leaves rows alone when nothing is known or the row is gone", () => {
  assert.equal(rowNeedsRepaint("skeleton"), false);
  assert.equal(rowNeedsRepaint(null, { hasRecord: true }), false);
  assert.equal(rowNeedsRepaint(rowRenderState(null), { hasRecord: true }), false);
});

test("ROW_HYDRATE_ROOT_MARGIN matches poster lazy margin", () => {
  assert.equal(ROW_HYDRATE_ROOT_MARGIN, "320px 0px");
});

test("ROW_HYDRATE_DEBOUNCE_MS coalesces several grid rows per request", () => {
  // The timer does not extend on new ids, so this is the request cadence during a
  // scroll. Below ~100ms each request carries a single grid row, which is what made
  // one pass over a collection cost dozens of requests.
  assert.equal(ROW_HYDRATE_DEBOUNCE_MS, 200);
  assert.ok(ROW_HYDRATE_DEBOUNCE_MS >= 100, "too short to coalesce a scroll");
  assert.ok(ROW_HYDRATE_DEBOUNCE_MS <= 400, "long enough to be felt as lag");
});

test("isHydrationQuiescent is true only when nothing is queued or in flight", () => {
  const { isHydrationQuiescent } = require("../scripts/lib/viewport-hydration");
  assert.equal(isHydrationQuiescent(), true);
  assert.equal(isHydrationQuiescent({ batchTimer: 1 }), false);
  assert.equal(isHydrationQuiescent({ inflightCount: 2 }), false);
  assert.equal(isHydrationQuiescent({ pendingCount: 1 }), false);
  assert.equal(
    isHydrationQuiescent({ batchTimer: 0, inflightCount: 0, pendingCount: 0 }),
    true,
  );
});

test("isHydrationQuiescent counts rows waiting on a hydrate retry", () => {
  const { isHydrationQuiescent } = require("../scripts/lib/viewport-hydration");
  assert.equal(isHydrationQuiescent({ retryCount: 1 }), false);
  assert.equal(isHydrationQuiescent({ retryCount: 0 }), true);
});

test("shouldRetryHydrate spends a bounded budget", () => {
  assert.equal(shouldRetryHydrate(1), true);
  assert.equal(shouldRetryHydrate(HYDRATE_MAX_ATTEMPTS - 1), true);
  assert.equal(shouldRetryHydrate(HYDRATE_MAX_ATTEMPTS), false);
  assert.equal(shouldRetryHydrate(HYDRATE_MAX_ATTEMPTS + 1), false);
  assert.equal(shouldRetryHydrate(0), false);
});

test("hydrateRetryDelayMs backs off, and waits longer when rate limited", () => {
  assert.equal(hydrateRetryDelayMs(1), 500);
  assert.equal(hydrateRetryDelayMs(2), 1000);
  assert.equal(hydrateRetryDelayMs(3), 2000);
  assert.equal(hydrateRetryDelayMs(1, { rateLimited: true }), 4000);
  assert.equal(hydrateRetryDelayMs(3, { rateLimited: true }), 16000);
});

test("hydrateRetryDelayMs caps the wait so a stalled row still recovers", () => {
  assert.equal(hydrateRetryDelayMs(99, { rateLimited: true }), 20000);
  assert.equal(hydrateRetryDelayMs(99), 20000);
});
