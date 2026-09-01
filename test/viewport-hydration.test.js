const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  ROW_HYDRATE_ROOT_MARGIN,
  HYDRATE_MAX_ATTEMPTS,
  movieIdFromRowElement,
  shouldRetryHydrate,
  hydrateRetryDelayMs,
} = require("../scripts/lib/viewport-hydration");

test("movieIdFromRowElement reads data-movie-id", () => {
  assert.equal(movieIdFromRowElement({ dataset: { movieId: "603" } }), 603);
  assert.equal(
    movieIdFromRowElement({ getAttribute: (name) => (name === "data-movie-id" ? "550" : null) }),
    550,
  );
  assert.equal(movieIdFromRowElement({ dataset: { movieId: "0" } }), null);
  assert.equal(movieIdFromRowElement(null), null);
});

test("ROW_HYDRATE_ROOT_MARGIN matches poster lazy margin", () => {
  assert.equal(ROW_HYDRATE_ROOT_MARGIN, "320px 0px");
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
