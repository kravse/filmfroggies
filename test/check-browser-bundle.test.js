const test = require("node:test");
const assert = require("node:assert/strict");
const {
  findUnsafeRequires,
  assertBrowserSafeSource,
} = require("../scripts/check-browser-bundle");

test("findUnsafeRequires flags top-level require", () => {
  const source = [
    "const x = require('./foo');",
    "function getFoo() {",
    "  if (typeof require === 'function') {",
    "    return require('./foo');",
    "  }",
    "}",
  ].join("\n");
  const hits = findUnsafeRequires(source, "sample.js");
  assert.equal(hits.length, 1);
  assert.match(hits[0].text, /require\(/);
});

test("assertBrowserSafeSource allows guarded require", () => {
  const source = [
    "function getFoo() {",
    "  if (typeof require === 'function') {",
    "    return require('./foo');",
    "  }",
    "}",
  ].join("\n");
  assert.doesNotThrow(() => assertBrowserSafeSource(source, "sample.js"));
});

test("checkBrowserBundle passes on the current bundle", () => {
  const { checkBrowserBundle } = require("../scripts/check-browser-bundle");
  assert.doesNotThrow(() => checkBrowserBundle());
});

test("custom-list browser module exports the collection import helper", () => {
  const { APP_SYNC_ENTRIES } = require("../scripts/app-sync-config");
  const entry = APP_SYNC_ENTRIES.find((candidate) => candidate.target === "00-app-custom-lists.js");
  assert.ok(entry);
  assert.ok(entry.exports.includes("ensureCustomListsFromImport"));
});

test("movie remap helper is exported to the browser bundle", () => {
  const { APP_SYNC_ENTRIES } = require("../scripts/app-sync-config");
  const { PARTS } = require("../scripts/bundle-app-js");
  const entry = APP_SYNC_ENTRIES.find((candidate) => candidate.target === "00-app-movie-remap.js");
  assert.ok(entry);
  assert.ok(entry.exports.includes("remapMovieState"));
  assert.ok(PARTS.some((part) => part.file === entry.target));
});

test("movie search picker is exported and included in the browser bundle", () => {
  const { APP_SYNC_ENTRIES } = require("../scripts/app-sync-config");
  const { PARTS } = require("../scripts/bundle-app-js");
  const entry = APP_SYNC_ENTRIES.find((candidate) => candidate.target === "00-app-movie-search-picker.js");
  assert.ok(entry);
  assert.ok(entry.exports.includes("createMovieSearchPicker"));
  assert.ok(PARTS.some((part) => part.file === entry.target));
});

test("share and add-movie helpers are exported to the browser bundle", () => {
  const { APP_SYNC_ENTRIES } = require("../scripts/app-sync-config");
  const { PARTS } = require("../scripts/bundle-app-js");
  const share = APP_SYNC_ENTRIES.find((candidate) => candidate.target === "00-app-movie-share.js");
  const addMovie = APP_SYNC_ENTRIES.find((candidate) => candidate.target === "00-app-add-movie.js");
  assert.ok(share);
  assert.ok(addMovie);
  assert.ok(share.exports.includes("movieShareUrl"));
  assert.ok(share.exports.includes("isMovieOwned"));
  assert.ok(addMovie.exports.includes("applyAddMovie"));
  assert.ok(PARTS.some((part) => part.file === share.target));
  assert.ok(PARTS.some((part) => part.file === addMovie.target));
});
