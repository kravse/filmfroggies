const { test } = require("node:test");
const assert = require("node:assert/strict");

const fs = require("node:fs");
const path = require("node:path");

const {
  POSTER_GREYS,
  posterGreyForId,
  posterGreyIndexForId,
  posterGreyClassForId,
} = require("../scripts/lib/poster-grey");

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

test("posterGreyClassForId matches the palette index", () => {
  assert.equal(posterGreyClassForId(603), `poster-grey-${posterGreyIndexForId(603)}`);
  assert.equal(posterGreyClassForId(null), "poster-grey-0");
  for (const id of [603, 604, 1891, 42]) {
    assert.equal(POSTER_GREYS[posterGreyIndexForId(id)], posterGreyForId(id));
  }
});

// The class carries the colour so no inline style attribute is needed, which is
// what lets the CSP drop style-src 'unsafe-inline'.
test("css/cards.css defines every palette entry", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "css", "cards.css"), "utf8");
  POSTER_GREYS.forEach((color, index) => {
    const rule = new RegExp(
      `\\.poster-wrap\\.poster-grey-${index}\\s*\\{\\s*--poster-bg:\\s*${color}\\s*;`,
      "i",
    );
    assert.match(css, rule, `missing rule for poster-grey-${index}`);
  });
});
