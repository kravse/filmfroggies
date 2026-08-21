const { test } = require("node:test");
const assert = require("node:assert/strict");

const { BRAND_NAME, brandNameHtml } = require("../scripts/lib/brand");

test("brand name is filmfroggies", () => {
  assert.equal(BRAND_NAME, "filmfroggies");
});

test("brandNameHtml splits film and froggies for styling", () => {
  const html = brandNameHtml();
  assert.match(html, /class="brand-word"/);
  assert.match(html, /class="brand-word-film">film</);
  assert.match(html, />froggies</);
});
