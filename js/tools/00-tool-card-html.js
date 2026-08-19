/* Generated from scripts/lib/card-html.js — run npm run bundle:letterboxd */

const appCardHtml = (function () {
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

  return {
    escapeHtml,
    formatRatingLabel,
  };
})();
