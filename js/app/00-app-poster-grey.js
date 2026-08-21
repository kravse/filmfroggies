/* Generated from scripts/lib/poster-grey.js — run npm run bundle */

const appPosterGrey = (function () {
  /**
   * Deterministic grey fills for grid poster slots when the image is missing or
   * still loading. Chosen from a fixed palette so tiles vary but stay neutral.
   */

  const POSTER_GREYS = [
    "#13161c",
    "#1a1f28",
    "#1e2430",
    "#222830",
    "#1c1a1e",
    "#242428",
    "#2a3038",
    "#2e3640",
    "#323840",
    "#28302c",
    "#2c2a34",
    "#363c44",
  ];

  function posterGreyIndexForId(movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return 0;
    }
    return ((id % POSTER_GREYS.length) + POSTER_GREYS.length) % POSTER_GREYS.length;
  }

  function posterGreyForId(movieId) {
    return POSTER_GREYS[posterGreyIndexForId(movieId)];
  }

  /**
   * Class name instead of an inline style attribute: the palette lives in
   * css/cards.css so the page needs no style-src 'unsafe-inline'.
   */
  function posterGreyClassForId(movieId) {
    return `poster-grey-${posterGreyIndexForId(movieId)}`;
  }

  return {
    POSTER_GREYS,
    posterGreyIndexForId,
    posterGreyForId,
    posterGreyClassForId,
  };
})();
