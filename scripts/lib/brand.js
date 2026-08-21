/** Site wordmark: "film" in body text color, "froggies" in accent green. */

const BRAND_NAME = "filmfroggies";

function brandNameHtml() {
  return '<span class="brand-word"><span class="brand-word-film">film</span>froggies</span>';
}

module.exports = {
  BRAND_NAME,
  brandNameHtml,
};
