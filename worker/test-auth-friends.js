import test from "node:test";
import assert from "node:assert/strict";
import { handleFriends, normalizeDisplayName, parseStoredDoc } from "./src/index.js";

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

test("friends activity returns only the aggregated public fields", async () => {
  let sql = "";
  const env = {
    DB: {
      prepare(value) {
        sql = value;
        return {
          bind() {
            return {
              async all() {
                return { results: [{
                  id: 2,
                  display_name: "Sam",
                  doc: JSON.stringify({
                    ratings: { 10: 8.5 },
                    viewingHistory: { 10: [{ id: "private-entry", watchedOn: "2026-08-20", updatedAt: "2026-08-20T12:00:00Z" }] },
                  }),
                }] };
              },
            };
          },
        };
      },
    },
  };
  const res = { json: (status, body) => ({ status, body }) };
  const response = await handleFriends(
    new Request("https://example.com/api/friends/activity?limit=20"),
    env,
    { uid: 1 },
    "/api/friends/activity",
    res,
  );
  assert.match(sql, /f\.status = 'accepted'/);
  assert.deepEqual(response, { status: 200, body: { items: [{
    movieId: 10,
    watchedOn: "2026-08-20",
    friend: { id: 2, displayName: "Sam" },
    rating: 8.5,
  }] } });
});
