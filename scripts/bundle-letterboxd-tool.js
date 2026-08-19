#!/usr/bin/env node
/**
 * Builds js/tools/letterboxd-tool-bundle.js for the local Letterboxd import tool.
 */
const fs = require("fs");
const path = require("path");

const { syncAppModule } = require("./sync-app-module");
const { assertBrowserSafeSource } = require("./check-browser-bundle");
const { LETTERBOXD_TOOL_SYNC_ENTRIES } = require("./letterboxd-tool-sync-config");

const ROOT = path.join(__dirname, "..");
const TOOL_DIR = path.join(ROOT, "js", "tools");
const UI_FILE = path.join(TOOL_DIR, "letterboxd-ui.js");
const BUNDLE_FILE = path.join(TOOL_DIR, "letterboxd-tool-bundle.js");

function syncToolModules() {
  fs.mkdirSync(TOOL_DIR, { recursive: true });
  for (const entry of LETTERBOXD_TOOL_SYNC_ENTRIES) {
    syncAppModule(entry, TOOL_DIR);
  }
}

function writeBundle() {
  const parts = [
    ...LETTERBOXD_TOOL_SYNC_ENTRIES.map((entry) => path.join(TOOL_DIR, entry.target)),
    UI_FILE,
  ];
  const missing = parts.filter((file) => !fs.existsSync(file));
  if (missing.length) {
    throw new Error(`Missing Letterboxd tool partials: ${missing.map((file) => path.basename(file)).join(", ")}`);
  }
  const bundle = parts
    .map((file) => fs.readFileSync(file, "utf8").trimEnd())
    .join("\n\n");
  fs.writeFileSync(BUNDLE_FILE, `${bundle}\n`);
  assertBrowserSafeSource(fs.readFileSync(BUNDLE_FILE, "utf8"), "letterboxd-tool-bundle.js");
}

function bundleLetterboxdTool() {
  syncToolModules();
  writeBundle();
}

if (require.main === module) {
  bundleLetterboxdTool();
  console.log(`Wrote ${LETTERBOXD_TOOL_SYNC_ENTRIES.length + 1} files under js/tools/`);
}

module.exports = { bundleLetterboxdTool, TOOL_DIR, BUNDLE_FILE };
