/**
 * Display-only sort for the Watched list. Stored `movieIds` order is untouched;
 * Watchlist always uses stored order (drag reorder). Watched never uses custom sort.
 */

const SORT_MODES = new Set([
  "custom",
  "added-asc",
  "added-desc",
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
const DEFAULT_PREFERENCE_SORT = "user-rating-desc";
const MISSING_SORT_HINT = "—";

const SORT_FIELDS = new Set(["added", "year", "rating", "user-rating", "title"]);

const SORT_FIELD_DEFAULTS = {
  added: "added-desc",
  year: "year-desc",
  rating: "rating-desc",
  "user-rating": "user-rating-desc",
  title: "title-desc",
};

const SORT_FIELD_LABELS = {
  "user-rating": "My Rating",
  added: "Date Added",
  year: "Release Year",
  rating: "Fan Rating",
  title: "Title",
};

const SORT_FIELD_LABELS_SHORT = {
  "user-rating": "My Rating",
  added: "Added",
  year: "Year",
  rating: "Fan Rating",
  title: "Title",
};

function getSortFieldLabel(field, short = false) {
  const labels = short ? SORT_FIELD_LABELS_SHORT : SORT_FIELD_LABELS;
  return labels[field] || SORT_FIELD_LABELS.title;
}

function getSortField(mode) {
  const normalized = normalizeSort(mode);
  if (normalized === "custom") {
    return "custom";
  }
  if (normalized.startsWith("added-")) {
    return "added";
  }
  if (normalized.startsWith("year-")) {
    return "year";
  }
  if (normalized.startsWith("user-rating-")) {
    return "user-rating";
  }
  if (normalized.startsWith("rating-")) {
    return "rating";
  }
  if (normalized.startsWith("title-")) {
    return "title";
  }
  return "custom";
}

function isSortDescending(mode) {
  const normalized = normalizeSort(mode);
  return normalized.endsWith("-desc");
}

function toggleSortDirection(mode) {
  const normalized = normalizeSort(mode);
  if (normalized === "custom") {
    return normalized;
  }
  if (normalized.endsWith("-asc")) {
    return normalized.replace(/-asc$/, "-desc");
  }
  if (normalized.endsWith("-desc")) {
    return normalized.replace(/-desc$/, "-asc");
  }
  return normalized;
}

function sortModeForField(field, currentMode) {
  if (!field || !SORT_FIELDS.has(field)) {
    return DEFAULT_PREFERENCE_SORT;
  }
  const normalized = normalizeSort(currentMode);
  if (getSortField(normalized) === field) {
    return normalized;
  }
  return SORT_FIELD_DEFAULTS[field] || DEFAULT_PREFERENCE_SORT;
}

/** Watched preferences never keep custom; watchlist ignores sort entirely. */
function normalizeWatchedSort(raw, fallback = DEFAULT_PREFERENCE_SORT) {
  const normalized = normalizeSort(raw, fallback);
  if (normalized === DEFAULT_SORT) {
    return fallback;
  }
  return normalized;
}

/** Human label for the active sort direction (toolbar state). */
function sortDirectionLabel(field, descending) {
  switch (field) {
    case "added":
      return descending ? "Newest first" : "Oldest first";
    case "year":
      return descending ? "Newest first" : "Oldest first";
    case "rating":
      return descending ? "Highest first" : "Lowest first";
    case "user-rating":
      return descending ? "Highest first" : "Lowest first";
    case "title":
      return descending ? "Z to A" : "A to Z";
    default:
      return descending ? "Descending" : "Ascending";
  }
}

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

function parseAddedTime(iso) {
  const time = Date.parse(iso || "");
  return Number.isFinite(time) ? time : null;
}

/** Card hint: ISO calendar date from an addedAt stamp. */
function formatAddedHint(iso) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(iso || "").trim());
  return match ? match[1] : null;
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
  const getAddedAt =
    typeof context.getAddedAt === "function" ? context.getAddedAt : () => null;
  const tiebreak = (a, b) => compareOrderTiebreak(a, b, orderIndex);
  const copy = [...movieIds];

  if (normalized === "added-asc" || normalized === "added-desc") {
    const direction = normalized === "added-asc" ? "asc" : "desc";
    return copy.sort((a, b) =>
      compareNullableNumber(
        parseAddedTime(getAddedAt(a)),
        parseAddedTime(getAddedAt(b)),
        direction,
        () => tiebreak(a, b),
      ),
    );
  }

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

  if (normalized === "added-asc" || normalized === "added-desc") {
    return formatAddedHint(context.addedAt) || MISSING_SORT_HINT;
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

module.exports = {
  SORT_MODES,
  SORT_FIELDS,
  SORT_FIELD_DEFAULTS,
  DEFAULT_SORT,
  DEFAULT_PREFERENCE_SORT,
  normalizeSort,
  normalizeWatchedSort,
  isCustomSort,
  getSortField,
  isSortDescending,
  toggleSortDirection,
  sortModeForField,
  sortDirectionLabel,
  getSortFieldLabel,
  parseYear,
  parseAddedTime,
  formatAddedHint,
  buildOrderIndex,
  compareOrderTiebreak,
  sortMovieIds,
  formatSortCardHint,
};
