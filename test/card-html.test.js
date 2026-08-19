const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  escapeHtml,
  formatYear,
  formatReleaseDate,
  formatRuntime,
  formatRatingLabel,
  formatRating,
  joinNames,
  addListPresetIconHtml,
  discoverPresetButtonInnerHtml,
} = require("../scripts/lib/card-html");

test("escapeHtml neutralizes markup in untrusted API text", () => {
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)">'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
  );
});

test("escapeHtml escapes ampersands and apostrophes", () => {
  assert.equal(escapeHtml("Tom & Jerry's"), "Tom &amp; Jerry&#39;s");
});

test("escapeHtml renders null and undefined as empty strings", () => {
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
});

test("formatYear takes the year from a TMDB release date", () => {
  assert.equal(formatYear("1999-03-30"), "1999");
});

test("formatYear returns empty for missing or malformed dates", () => {
  assert.equal(formatYear(""), "");
  assert.equal(formatYear(null), "");
  assert.equal(formatYear("soon"), "");
});

test("formatReleaseDate renders a full calendar date", () => {
  assert.equal(formatReleaseDate("2026-08-26"), "August 26, 2026");
});

test("formatReleaseDate returns empty for missing or malformed dates", () => {
  assert.equal(formatReleaseDate(""), "");
  assert.equal(formatReleaseDate(null), "");
  assert.equal(formatReleaseDate("2026-08"), "");
  assert.equal(formatReleaseDate("2026-13-40"), "");
});

test("formatRuntime renders hours and minutes", () => {
  assert.equal(formatRuntime(139), "2h 19m");
});

test("formatRuntime omits an empty half", () => {
  assert.equal(formatRuntime(120), "2h");
  assert.equal(formatRuntime(45), "45m");
});

test("formatRuntime returns empty for missing or zero runtimes", () => {
  assert.equal(formatRuntime(0), "");
  assert.equal(formatRuntime(null), "");
  assert.equal(formatRuntime("abc"), "");
});

test("formatRatingLabel shows one decimal except 10", () => {
  assert.equal(formatRatingLabel(8), "8.0");
  assert.equal(formatRatingLabel(7.256), "7.3");
  assert.equal(formatRatingLabel(10), "10");
  assert.equal(formatRatingLabel(0), "0.0");
});

test("formatRating renders fan ratings with the shared label rules", () => {
  assert.equal(formatRating(8), "8.0");
  assert.equal(formatRating(7.256), "7.3");
  assert.equal(formatRating(10), "10");
  assert.equal(formatRating(0), "0.0");
});

test("formatRating returns empty for missing or negative values", () => {
  assert.equal(formatRating(null), "");
  assert.equal(formatRating(-1), "");
});

test("joinNames joins and can cap the list", () => {
  assert.equal(joinNames(["A", "B", "C"]), "A, B, C");
  assert.equal(joinNames(["A", "B", "C"], 2), "A, B");
});

test("joinNames drops blank entries and tolerates non-arrays", () => {
  assert.equal(joinNames(["A", "", null, "B"]), "A, B");
  assert.equal(joinNames(null), "");
});

test("addListPresetIconHtml matches add-movie list picker icons", () => {
  assert.match(addListPresetIconHtml("watched"), /class="add-list-icon"[^>]*>✓<\/span>/);
  assert.match(addListPresetIconHtml("watchlist"), /add-list-icon-watchlist/);
  assert.match(addListPresetIconHtml("watchlist"), /M12 2C6\.48 2/);
});

test("discoverPresetButtonInnerHtml wraps icon and escaped label", () => {
  assert.match(
    discoverPresetButtonInnerHtml("watchlist", 'Sci-Fi &amp; Fantasy'),
    /discover-preset-btn-label">Sci-Fi &amp;amp; Fantasy<\/span>/,
  );
});
