const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeRating,
  formatUserRating,
  ratingFromSliderValue,
  sliderValueFromRating,
  normalizeRatings,
  getRating,
  setRating,
  removeRating,
  DEFAULT_SLIDER_VALUE,
} = require("../scripts/lib/ratings");

const sampleLists = [
  { id: "favourites", name: "Favourites", movieIds: [1, 2] },
  { id: "watchlist", name: "Watchlist", movieIds: [3] },
  { id: "watched", name: "Watched", movieIds: [1, 2] },
];

test("normalizeRating clamps to one decimal between 1 and 10", () => {
  assert.equal(normalizeRating(7), 7);
  assert.equal(normalizeRating(7.34), 7.3);
  assert.equal(normalizeRating(7.36), 7.4);
  assert.equal(normalizeRating(0.5), 1);
  assert.equal(normalizeRating(11), 10);
  assert.equal(normalizeRating("8.25"), 8.3);
  assert.equal(normalizeRating("bad"), null);
});

test("formatUserRating drops trailing zero for whole numbers", () => {
  assert.equal(formatUserRating(7), "7");
  assert.equal(formatUserRating(7.3), "7.3");
  assert.equal(formatUserRating(10), "10");
});

test("slider helpers round-trip ratings", () => {
  assert.equal(ratingFromSliderValue(0), 1);
  assert.equal(ratingFromSliderValue(90), 10);
  assert.equal(ratingFromSliderValue(60), 7);
  assert.equal(sliderValueFromRating(7.3), 63);
  assert.equal(sliderValueFromRating(null), DEFAULT_SLIDER_VALUE);
});

test("normalizeRatings keeps only valid ratings for movies in lists", () => {
  const normalized = normalizeRatings(
    { 1: 8.5, 2: "7", 3: 11, 4: 6, 5: 2.25 },
    sampleLists,
  );
  assert.deepEqual(normalized, { 1: 8.5, 2: 7, 3: 10 });
});

test("setRating and removeRating are immutable no-ops when unchanged", () => {
  const base = { 1: 7.5 };
  assert.equal(setRating(base, 1, 7.5), base);
  const unchanged = { 2: 8 };
  assert.equal(removeRating(unchanged, 9), unchanged);
});

test("setRating updates and removeRating deletes entries", () => {
  const first = setRating({}, 42, 9.2);
  assert.deepEqual(first, { 42: 9.2 });
  assert.equal(getRating(first, 42), 9.2);

  const second = setRating(first, 42, 9.4);
  assert.deepEqual(second, { 42: 9.4 });

  const cleared = removeRating(second, 42);
  assert.deepEqual(cleared, {});
});
