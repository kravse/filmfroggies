const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isPosterUrl, POSTER_HOST } = require("../scripts/lib/poster-cache");

test("isPosterUrl accepts TMDB image CDN URLs", () => {
  assert.equal(
    isPosterUrl("https://image.tmdb.org/t/p/w342/poster.jpg"),
    true,
  );
});

test("isPosterUrl rejects non-TMDB hosts and schemes", () => {
  assert.equal(isPosterUrl("http://image.tmdb.org/t/p/w342/poster.jpg"), false);
  assert.equal(isPosterUrl("https://evil.example/poster.jpg"), false);
  assert.equal(isPosterUrl("javascript:alert(1)"), false);
  assert.equal(isPosterUrl(""), false);
  assert.equal(isPosterUrl(null), false);
});

test("POSTER_HOST matches TMDB CDN", () => {
  assert.equal(POSTER_HOST, "image.tmdb.org");
});
