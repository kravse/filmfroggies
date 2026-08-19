const { test } = require("node:test");
const assert = require("node:assert/strict");

const { POSTER_GREYS, posterGreyForId } = require("../scripts/lib/poster-grey");

test("posterGreyForId picks from the fixed palette", () => {
  assert.equal(POSTER_GREYS.includes(posterGreyForId(603)), true);
  assert.equal(posterGreyForId(603), posterGreyForId(603));
});

test("posterGreyForId varies across ids", () => {
  const colors = new Set([603, 604, 1891, 42].map(posterGreyForId));
  assert.ok(colors.size > 1);
});

test("posterGreyForId falls back for invalid ids", () => {
  assert.equal(posterGreyForId(null), POSTER_GREYS[0]);
  assert.equal(posterGreyForId(-1), POSTER_GREYS[0]);
});
