/* Generated from scripts/lib/sort.js — run npm run bundle */

const appSort = (function () {
  /**
   * Display-only sort for the Watched list. Stored `movieIds` order is untouched;
   * custom order matches storage and is the only mode compatible with drag reorder.
   */

  const SORT_MODES = new Set([
    "custom",
    "year-asc",
    "year-desc",
    "rating-desc",
    "rating-asc",
    "user-rating-desc",
    "user-rating-asc",
    "title-asc",
    "title-desc",
  ]);

  const DEFAULT_SORT = "custom";
  const MISSING_SORT_HINT = "—";

  function formatFanRating(voteAverage) {
    const value = Number(voteAverage);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return value.toFixed(1);
  }

  function formatUserRatingHint(userRating) {
    if (userRating == null || userRating === "") {
      return null;
    }
    const value = Number(userRating);
    if (!Number.isFinite(value)) {
      return null;
    }
    if (Number.isInteger(value)) {
      return String(value);
    }
    return value.toFixed(1);
  }

  function normalizeSort(raw, fallback = DEFAULT_SORT) {
    if (raw && SORT_MODES.has(raw)) {
      return raw;
    }
    return fallback;
  }

  function isCustomSort(mode) {
    return normalizeSort(mode) === DEFAULT_SORT;
  }

  function parseYear(releaseDate) {
    if (!releaseDate) {
      return null;
    }
    const match = String(releaseDate).match(/\d{4}/);
    return match ? match[0] : null;
  }

  function buildOrderIndex(movieIds) {
    return new Map(movieIds.map((id, index) => [Number(id), index]));
  }

  function compareOrderTiebreak(a, b, orderIndex) {
    const indexA = orderIndex.has(a) ? orderIndex.get(a) : a;
    const indexB = orderIndex.has(b) ? orderIndex.get(b) : b;
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    return a - b;
  }

  function compareNullableNumber(a, b, direction, tiebreak) {
    const aMissing = a == null;
    const bMissing = b == null;
    if (aMissing && bMissing) {
      return tiebreak();
    }
    if (aMissing) {
      return 1;
    }
    if (bMissing) {
      return -1;
    }
    if (a !== b) {
      return direction === "asc" ? a - b : b - a;
    }
    return tiebreak();
  }

  function compareYear(a, b, direction, orderIndex, getRecord) {
    const yearA = parseYear(getRecord(a)?.releaseDate);
    const yearB = parseYear(getRecord(b)?.releaseDate);
    if (yearA == null && yearB == null) {
      return compareOrderTiebreak(a, b, orderIndex);
    }
    if (yearA == null) {
      return 1;
    }
    if (yearB == null) {
      return -1;
    }
    if (yearA !== yearB) {
      return direction === "asc" ? yearA.localeCompare(yearB) : yearB.localeCompare(yearA);
    }
    return compareOrderTiebreak(a, b, orderIndex);
  }

  function sortMovieIds(movieIds, mode, context = {}) {
    const normalized = normalizeSort(mode);
    if (normalized === DEFAULT_SORT) {
      return [...movieIds];
    }

    const orderIndex = buildOrderIndex(movieIds);
    const getRecord = typeof context.getRecord === "function" ? context.getRecord : () => null;
    const getUserRating =
      typeof context.getUserRating === "function" ? context.getUserRating : () => null;
    const tiebreak = (a, b) => compareOrderTiebreak(a, b, orderIndex);
    const copy = [...movieIds];

    if (normalized === "title-asc" || normalized === "title-desc") {
      return copy.sort((a, b) => {
        const cmp = (getRecord(a)?.title || "").localeCompare(getRecord(b)?.title || "");
        if (cmp !== 0) {
          return normalized === "title-asc" ? cmp : -cmp;
        }
        return tiebreak(a, b);
      });
    }

    if (normalized === "year-asc" || normalized === "year-desc") {
      const direction = normalized === "year-asc" ? "asc" : "desc";
      return copy.sort((a, b) => compareYear(a, b, direction, orderIndex, getRecord));
    }

    if (normalized === "rating-asc" || normalized === "rating-desc") {
      const direction = normalized === "rating-asc" ? "asc" : "desc";
      return copy.sort((a, b) =>
        compareNullableNumber(
          getRecord(a)?.voteAverage,
          getRecord(b)?.voteAverage,
          direction,
          () => tiebreak(a, b),
        ),
      );
    }

    if (normalized === "user-rating-asc" || normalized === "user-rating-desc") {
      const direction = normalized === "user-rating-asc" ? "asc" : "desc";
      return copy.sort((a, b) =>
        compareNullableNumber(
          getUserRating(a),
          getUserRating(b),
          direction,
          () => tiebreak(a, b),
        ),
      );
    }

    return copy;
  }

  /** Short label for small-card view when Watched is sorted (not custom order). */
  function formatSortCardHint(mode, context = {}) {
    const normalized = normalizeSort(mode);
    if (normalized === DEFAULT_SORT) {
      return null;
    }

    const record = context.record;
    if (!record) {
      return null;
    }

    if (normalized === "year-asc" || normalized === "year-desc") {
      return parseYear(record.releaseDate) || MISSING_SORT_HINT;
    }

    if (normalized === "rating-asc" || normalized === "rating-desc") {
      return formatFanRating(record.voteAverage) || MISSING_SORT_HINT;
    }

    if (normalized === "user-rating-asc" || normalized === "user-rating-desc") {
      return formatUserRatingHint(context.userRating) || MISSING_SORT_HINT;
    }

    if (normalized === "title-asc" || normalized === "title-desc") {
      const title = String(record.title || "").trim();
      return title || MISSING_SORT_HINT;
    }

    return null;
  }

  return {
    SORT_MODES,
    DEFAULT_SORT,
    normalizeSort,
    isCustomSort,
    parseYear,
    buildOrderIndex,
    compareOrderTiebreak,
    sortMovieIds,
    formatSortCardHint,
  };
})();
