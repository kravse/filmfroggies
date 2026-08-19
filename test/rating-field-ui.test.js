const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  userRatingFieldHtml,
  createRatingFieldController,
} = require("../scripts/lib/rating-field-ui");
const appRatings = require("../scripts/lib/ratings");

test("userRatingFieldHtml renders prefixed rating controls", () => {
  const html = userRatingFieldHtml({ idPrefix: "watch-confirm-rating" });
  assert.match(html, /id="watch-confirm-rating-field"/);
  assert.match(html, /id="watch-confirm-rating-slider"/);
  assert.match(html, /user-rating-slider-wrap/);
  assert.match(html, />1\.0</);
  assert.match(html, /Your rating/);
});

test("createRatingFieldController tracks optional ratings", () => {
  const state = { field: { classList: { add() {}, remove() {} } }, slider: { value: "60" } };
  const controller = createRatingFieldController(state, appRatings);
  controller.initSelect();
  assert.equal(controller.getValue(), null);
  controller.onSliderInput();
  assert.equal(controller.getValue(), 7);
  controller.clear();
  assert.equal(controller.getValue(), null);
});
