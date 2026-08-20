#!/usr/bin/env node
/**
 * Concatenates js/app/ partials into js/app-bundle.js for a single script tag.
 *
 * Load order matters: every partial shares one IIFE scope opened by
 * 01-config-dom-state.js and closed by 08-init.js. Generated 00-* modules must
 * come before the partials that read them.
 */
const fs = require("fs");
const path = require("path");
const { syncAllAppModules } = require("./sync-app-module");
const { checkBrowserBundle } = require("./check-browser-bundle");

const ROOT = path.join(__dirname, "..");
const APP_DIR = path.join(ROOT, "js", "app");

const PARTS = [
  {
    file: "01-config-dom-state.js",
    title: "Configuration, DOM references, and mutable state",
  },
  {
    file: "00-app-card-html.js",
    title: "Card HTML helpers (generated from scripts/lib/card-html.js)",
  },
  {
    file: "00-app-movie-search-picker.js",
    title: "Shared movie search picker (generated from scripts/lib/movie-search-picker.js)",
  },
  {
    file: "00-app-movie-remap.js",
    title: "Movie link remapping (generated from scripts/lib/movie-remap.js)",
  },
  {
    file: "01b-viewing-date-picker-dom.js",
    title: "Shared viewing date picker mounts",
  },
  {
    file: "00-app-poster-grey.js",
    title: "Grid poster greys (generated from scripts/lib/poster-grey.js)",
  },
  {
    file: "00-app-tmdb.js",
    title: "TMDB request and response helpers (generated from scripts/lib/tmdb.js)",
  },
  {
    file: "00-app-discover.js",
    title: "Discover browse helpers (generated from scripts/lib/discover.js)",
  },
  {
    file: "00-app-poster-cache.js",
    title: "Poster cache helpers (generated from scripts/lib/poster-cache.js)",
  },
  {
    file: "00-app-local-data.js",
    title: "Committed data/ snapshot (generated from scripts/lib/local-data.js)",
  },
  {
    file: "00-app-lists.js",
    title: "List operations (generated from scripts/lib/lists.js)",
  },
  {
    file: "00-app-custom-lists.js",
    title: "Custom lists (generated from scripts/lib/custom-lists.js)",
  },
  {
    file: "00-app-list-csv.js",
    title: "Collection backup CSV (generated from scripts/lib/list-csv.js)",
  },
  {
    file: "00-app-ratings.js",
    title: "User movie ratings (generated from scripts/lib/ratings.js)",
  },
  {
    file: "00-app-rating-field-ui.js",
    title: "Shared rating field UI (generated from scripts/lib/rating-field-ui.js)",
  },
  {
    file: "00-app-added-at.js",
    title: "Date added stamps (generated from scripts/lib/added-at.js)",
  },
  {
    file: "00-app-viewing-history.js",
    title: "Per-movie viewing history (generated from scripts/lib/viewing-history.js)",
  },
  {
    file: "00-app-sort.js",
    title: "Watched list display sort (generated from scripts/lib/sort.js)",
  },
  {
    file: "00-app-sync-merge.js",
    title: "Sync merge and tombstones (generated from scripts/lib/sync-merge.js)",
  },
  {
    file: "00-app-add-movie.js",
    title: "Add-movie state application (generated from scripts/lib/add-movie.js)",
  },
  {
    file: "00-app-movie-share.js",
    title: "Shareable movie URLs (generated from scripts/lib/movie-share.js)",
  },
  {
    file: "00-app-custom-list-merge.js",
    title: "Custom list Gist merge (generated from scripts/lib/custom-list-merge.js)",
  },
  {
    file: "00-app-user-state.js",
    title: "User state persistence (generated from scripts/lib/user-state.js)",
  },
  {
    file: "00-app-gist-sync.js",
    title: "GitHub Gist sync helpers (generated from scripts/lib/gist-sync.js)",
  },
  {
    file: "00-app-gist-backup.js",
    title: "GitHub Gist snapshot backups (generated from scripts/lib/gist-backup.js)",
  },
  {
    file: "00-app-reorder.js",
    title: "Reorder and overlap math (generated from scripts/lib/reorder.js)",
  },
  {
    file: "00-app-pointer-reorder.js",
    title: "Pointer drag helpers (generated from scripts/lib/pointer-reorder.js)",
  },
  {
    file: "00-app-list-search.js",
    title: "Watched list metadata search (generated from scripts/lib/list-search.js)",
  },
  {
    file: "03-user-state.js",
    title: "User state runtime, localStorage, and Gist storage mode",
  },
  {
    file: "03-tmdb-client.js",
    title: "TMDB client: credential, Cache API wrapper, hydration pool",
  },
  {
    file: "04-search.js",
    title: "Search box, TMDB autocomplete, and add-to-list",
  },
  {
    file: "05-render.js",
    title: "Cards, skeletons, and the main grid render",
  },
  {
    file: "06-dialogs.js",
    title: "Detail overlay, settings, and about dialogs",
  },
  {
    file: "07-reorder.js",
    title: "Drag reorder for list rows and grid cards",
  },
  {
    file: "09-list-search.js",
    title: "Watched list filter search chips and suggestions",
  },
  {
    file: "10-custom-lists.js",
    title: "Custom lists routing, index CRUD, and watchlist picker",
  },
  {
    file: "11-discover.js",
    title: "TMDB discover browse (upcoming and now playing)",
  },
  {
    file: "12-data-import.js",
    title: "Collection backup CSV import",
  },
  {
    file: "08-init.js",
    title: "Event wiring and startup",
  },
];

function writeBundle() {
  const ordered = PARTS.map((part) => path.join(APP_DIR, part.file));
  const missing = ordered.filter((file) => !fs.existsSync(file));
  if (missing.length) {
    throw new Error(
      `Missing app partials: ${missing.map((file) => path.basename(file)).join(", ")}`,
    );
  }
  const bundle = PARTS.map((part, index) => {
    const source = fs.readFileSync(ordered[index], "utf8").trimEnd();
    return `/* ===== ${part.title} ===== */\n\n${source}`;
  }).join("\n\n");
  fs.writeFileSync(path.join(ROOT, "js", "app-bundle.js"), `${bundle}\n`);
}

function bundleAppJs() {
  syncAllAppModules();
  writeBundle();
  checkBrowserBundle();
}

if (require.main === module) {
  bundleAppJs();
  console.log(`Wrote ${PARTS.length} files under js/app/ and js/app-bundle.js`);
}

module.exports = { bundleAppJs, PARTS, writeBundle };
