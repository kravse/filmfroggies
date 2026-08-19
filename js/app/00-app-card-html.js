/* Generated from scripts/lib/card-html.js — run npm run bundle */

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

  return {
    escapeHtml,
    formatYear,
    formatRuntime,
    formatRatingLabel,
    formatRating,
    joinNames,
  };
})();
