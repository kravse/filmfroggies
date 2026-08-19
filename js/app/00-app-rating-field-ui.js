/* Generated from scripts/lib/rating-field-ui.js — run npm run bundle */

const appRatingFieldUi = (function () {
  /**
   * Shared optional user-rating field markup and interaction for sheets/dialogs.
   */

  function getCardHtml() {
    if (typeof appCardHtml !== "undefined") {
      return appCardHtml;
    }
    if (typeof require === "function") {
      return require("./card-html");
    }
    throw new Error("appCardHtml is not available");
  }

  function getRatings() {
    if (typeof appRatings !== "undefined") {
      return appRatings;
    }
    if (typeof require === "function") {
      return require("./ratings");
    }
    throw new Error("appRatings is not available");
  }

  function userRatingFieldHtml(options = {}) {
    const prefix = String(options.idPrefix || "user-rating");
    const fieldId = `${prefix}-field`;
    const valueId = `${prefix}-value`;
    const sliderId = `${prefix}-slider`;
    const selectId = `${prefix}-select`;
    const clearId = `${prefix}-clear`;
    const activeClass = options.startActive ? " is-active" : "";
    const clearHidden = options.startActive ? "" : " hidden";
    return `<div class="user-rating-field${activeClass}" id="${getCardHtml().escapeHtml(fieldId)}">
    <div class="user-rating-header">
      <span class="user-rating-label">Your rating</span>
      <output class="user-rating-value is-empty" id="${getCardHtml().escapeHtml(valueId)}" for="${getCardHtml().escapeHtml(sliderId)}">—</output>
    </div>
    <div class="user-rating-slider-wrap">
      <span class="user-rating-scale" aria-hidden="true">1.0</span>
      <div class="rating-control">
        <input
          type="range"
          class="user-rating-slider rating-control-slider"
          id="${getCardHtml().escapeHtml(sliderId)}"
          min="0"
          max="90"
          step="1"
          value="60"
          aria-label="Your rating from 1 to 10 (optional)"
        />
        <select
          class="user-rating-select rating-control-select"
          id="${getCardHtml().escapeHtml(selectId)}"
          aria-label="Your rating from 1 to 10 (optional)"
        ></select>
      </div>
      <span class="user-rating-scale" aria-hidden="true">10</span>
    </div>
    <button type="button" class="user-rating-clear-btn" id="${getCardHtml().escapeHtml(clearId)}"${clearHidden}>Clear rating</button>
  </div>`;
  }

  function createRatingFieldController(refs, ratingsLib = getRatings()) {
    let touched = false;
    let pending = null;

    function reset() {
      touched = false;
      pending = null;
      if (refs.slider) {
        refs.slider.value = String(ratingsLib.DEFAULT_SLIDER_VALUE);
      }
      if (refs.select) {
        refs.select.value = "";
      }
      if (refs.clear) {
        refs.clear.hidden = true;
      }
      if (refs.value) {
        refs.value.textContent = "—";
        refs.value.classList.add("is-empty");
      }
      refs.field?.classList.remove("is-active");
    }

    function syncDisplay() {
      if (!touched) {
        reset();
        return;
      }
      refs.field?.classList.add("is-active");
      if (refs.clear) {
        refs.clear.hidden = false;
      }
      const rating =
        pending ?? ratingsLib.ratingFromSliderValue(Number(refs.slider?.value));
      pending = rating;
      if (refs.value) {
        refs.value.textContent = ratingsLib.formatUserRating(rating);
        refs.value.classList.remove("is-empty");
      }
      if (refs.slider) {
        refs.slider.value = String(ratingsLib.sliderValueFromRating(rating));
      }
      if (refs.select) {
        refs.select.value = ratingsLib.formatUserRating(rating);
      }
    }

    function onSliderInput() {
      if (!refs.slider) {
        return;
      }
      touched = true;
      pending = ratingsLib.ratingFromSliderValue(Number(refs.slider.value));
      syncDisplay();
    }

    function onSelectChange() {
      if (!refs.select) {
        return;
      }
      if (refs.select.value === "") {
        reset();
        return;
      }
      touched = true;
      pending = ratingsLib.normalizeRating(refs.select.value);
      syncDisplay();
    }

    function initSelect() {
      if (!refs.select) {
        return;
      }
      refs.select.innerHTML = ratingsLib.ratingSelectInnerHtml(null, { includeUnrated: true });
    }

    function getValue() {
      return touched ? pending : null;
    }

    return {
      reset,
      syncDisplay,
      onSliderInput,
      onSelectChange,
      initSelect,
      getValue,
      clear: reset,
    };
  }

  return {
    userRatingFieldHtml,
    createRatingFieldController,
  };
})();
