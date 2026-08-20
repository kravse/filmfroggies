import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDisplayName, parseStoredDoc } from "./src/index.js";

test("parseStoredDoc accepts objects and rejects bad JSON", () => {
  assert.deepEqual(parseStoredDoc('{"lists":[]}'), { lists: [] });
  assert.equal(parseStoredDoc(null), null);
  assert.equal(parseStoredDoc(""), null);
  assert.equal(parseStoredDoc("not-json"), null);
  assert.equal(parseStoredDoc("[]"), null);
  assert.equal(parseStoredDoc("42"), null);
});

test("normalizeDisplayName trims, falls back, and caps length", () => {
  assert.equal(normalizeDisplayName("  Alex  ", "a@b.co"), "Alex");
  assert.equal(normalizeDisplayName("", "alex@example.com"), "alex");
  const long = "x".repeat(80);
  assert.equal(normalizeDisplayName(long, "a@b.co").length, 64);
});
