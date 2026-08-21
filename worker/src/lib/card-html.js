/* Generated from scripts/lib/card-html.js — run npm run sync-worker-lib */

/** Formatting helpers shared by cards, suggestions, and the detail overlay. */

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  if (value == null) {
    return "";
  }
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** TMDB release dates are `YYYY-MM-DD`; anything else yields no year. */
function formatYear(releaseDate) {
  const match = /^(\d{4})/.exec(String(releaseDate || "").trim());
  return match ? match[1] : "";
}

/** Full calendar date for discover cards, e.g. `August 26, 2026`. */
function formatReleaseDate(releaseDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(releaseDate || "").trim());
  if (!match) {
    return "";
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRuntime(minutes) {
  const total = Number(minutes);
  if (!Number.isFinite(total) || total <= 0) {
    return "";
  }
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) {
    return `${rest}m`;
  }
  if (!rest) {
    return `${hours}h`;
  }
  return `${hours}h ${rest}m`;
}

/** One decimal for ratings; 10 alone drops the fraction (0 → "0.0"). */
function formatRatingLabel(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return null;
  }
  const rounded = Math.round(num * 10) / 10;
  if (rounded === 10) {
    return "10";
  }
  return rounded.toFixed(1);
}

function formatRating(voteAverage) {
  if (voteAverage == null || voteAverage === "") {
    return "";
  }
  const value = Number(voteAverage);
  if (!Number.isFinite(value) || value < 0) {
    return "";
  }
  const label = formatRatingLabel(value);
  return label == null ? "" : label;
}

function joinNames(names, limit) {
  if (!Array.isArray(names)) {
    return "";
  }
  const cleaned = names
    .map((name) => String(name || "").trim())
    .filter(Boolean);
  const capped =
    typeof limit === "number" && limit > 0 ? cleaned.slice(0, limit) : cleaned;
  return capped.join(", ");
}

const WATCHLIST_PRESET_ICON_SVG =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>';

const VIEWING_DATE_ICON_SVG =
  '<svg class="viewing-date-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none"><path d="M7.5 8 5.5 3M12.5 8 14.5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="3.5" y="8" width="13" height="8.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/><rect x="5.25" y="9.75" width="9.5" height="5" rx="0.5" stroke="currentColor" stroke-width="1.25"/><path d="M6.25 16.5v1.25M13.75 16.5v1.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

function viewingDateIconHtml() {
  return VIEWING_DATE_ICON_SVG;
}

function viewingDatePickerHtml(options = {}) {
  const toggleId = String(options.toggleId || "viewing-date-toggle");
  const fieldId = String(options.fieldId || "viewing-date-field");
  const inputId = String(options.inputId || "viewing-date-input");
  const clearId = String(options.clearId || "viewing-date-clear");
  const toggleClass = escapeHtml(
    String(options.toggleClass || "ghost-btn viewing-date-picker-toggle"),
  );
  const fieldClass = escapeHtml(String(options.fieldClass || "viewing-date-picker-field"));
  const icon = viewingDateIconHtml();
  return `<button type="button" class="${toggleClass}" id="${escapeHtml(toggleId)}">${icon}Add viewing date</button>
<div class="${fieldClass}" id="${escapeHtml(fieldId)}" hidden>
  <div class="viewing-date-input-row">${icon}<input type="date" id="${escapeHtml(inputId)}" aria-label="Date watched" /></div>
  <button type="button" class="user-rating-clear-btn" id="${escapeHtml(clearId)}">Clear viewing date</button>
</div>`;
}

/** Same square icons as the add-movie list picker (`watched` | `watchlist`). */
function addListPresetIconHtml(preset) {
  if (preset === "watchlist") {
    return `<span class="add-list-icon add-list-icon-watchlist" aria-hidden="true">${WATCHLIST_PRESET_ICON_SVG}</span>`;
  }
  return `<span class="add-list-icon" aria-hidden="true">✓</span>`;
}

function discoverPresetButtonInnerHtml(preset, label) {
  return `${addListPresetIconHtml(preset)}<span class="discover-preset-btn-label">${escapeHtml(label)}</span>`;
}

export { escapeHtml, formatYear, formatReleaseDate, formatRuntime, formatRatingLabel, formatRating, joinNames, addListPresetIconHtml, discoverPresetButtonInnerHtml, viewingDateIconHtml, viewingDatePickerHtml };
