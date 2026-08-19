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
