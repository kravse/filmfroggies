const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isBlockedStaticPath,
} = require("../scripts/lib/static-guard");

test("isBlockedStaticPath blocks /plans", () => {
  assert.equal(isBlockedStaticPath("/plans"), true);
  assert.equal(isBlockedStaticPath("/plans/replace-scrape-with-tmdb-cache.md"), true);
  assert.equal(isBlockedStaticPath("/index.html"), false);
  assert.equal(isBlockedStaticPath("/data/movies.json"), false);
});
