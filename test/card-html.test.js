const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  escapeHtml,
  formatYear,
  formatRuntime,
  formatRating,
  joinNames,
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

test("formatRating renders one decimal place", () => {
  assert.equal(formatRating(8), "8.0");
  assert.equal(formatRating(7.256), "7.3");
});

test("formatRating returns empty for unrated movies", () => {
  assert.equal(formatRating(0), "");
  assert.equal(formatRating(null), "");
});

test("joinNames joins and can cap the list", () => {
  assert.equal(joinNames(["A", "B", "C"]), "A, B, C");
  assert.equal(joinNames(["A", "B", "C"], 2), "A, B");
});

test("joinNames drops blank entries and tolerates non-arrays", () => {
  assert.equal(joinNames(["A", "", null, "B"]), "A, B");
  assert.equal(joinNames(null), "");
});
