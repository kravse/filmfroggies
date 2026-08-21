/* Generated from scripts/lib/brand.js — run npm run bundle */

const appBrand = (function () {
  /** Site wordmark: "film" in body text color, "froggies" in accent green. */

  const BRAND_NAME = "filmfroggies";

  function brandNameHtml() {
    return '<span class="brand-word"><span class="brand-word-film">film</span>froggies</span>';
  }

  return {
    BRAND_NAME,
    brandNameHtml,
  };
})();
