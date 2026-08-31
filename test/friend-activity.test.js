const test = require("node:test");
const assert = require("node:assert/strict");
const { friendActivityItems, normalizeActivityLimit } = require("../scripts/lib/friend-activity");

test("friend activity is newest first, rated, deduplicated by movie/date, and limited", () => {
  const items = friendActivityItems([
    {
      id: 2,
      displayName: "Sam",
      doc: {
        ratings: { 10: 8.5 },
        viewingHistory: {
          10: [
            { id: "old", watchedOn: "2026-08-01", updatedAt: "2026-08-01T12:00:00Z" },
            { id: "new", watchedOn: "2026-08-01", updatedAt: "2026-08-02T12:00:00Z" },
            { id: "deleted", watchedOn: "2026-08-30", updatedAt: "2026-08-30T12:00:00Z", deletedAt: "2026-08-30T12:00:00Z" },
          ],
          20: [{ id: "latest", watchedOn: "2026-08-20", updatedAt: "2026-08-20T12:00:00Z" }],
        },
      },
    },
  ], { limit: 1, today: "2026-08-31" });
  assert.deepEqual(items, [{
    entryId: "latest",
    watchedOn: "2026-08-20",
    updatedAt: "2026-08-20T12:00:00.000Z",
    movieId: 20,
    friend: { id: 2, displayName: "Sam" },
    rating: null,
  }]);
});

test("friend activity ignores malformed friends and entries", () => {
  assert.deepEqual(friendActivityItems([null, { id: 3, displayName: "", doc: {} }]), []);
  assert.equal(normalizeActivityLimit("999"), 50);
  assert.equal(normalizeActivityLimit("nope"), 20);
});

test("formatActivityDateLabel uses relative labels and falls back to calendar dates", () => {
  const { formatActivityDateLabel } = require("../scripts/lib/friend-activity");
  assert.equal(formatActivityDateLabel("2026-08-31", { today: "2026-08-31" }), "Today");
  assert.equal(formatActivityDateLabel("2026-08-30", { today: "2026-08-31" }), "Yesterday");
  assert.equal(formatActivityDateLabel("2026-08-28", { today: "2026-08-31" }), "3 days ago");
  assert.equal(formatActivityDateLabel("2026-08-20", { today: "2026-08-31" }), "Last week");
  assert.match(formatActivityDateLabel("2025-12-25", { today: "2026-08-31" }), /Dec/);
});

test("friend activity rejects impossible and future viewing dates", () => {
  const items = friendActivityItems([{ id: 2, displayName: "Sam", doc: { viewingHistory: {
    10: [
      { id: "impossible", watchedOn: "2026-02-30", updatedAt: "2026-01-01T00:00:00Z" },
      { id: "future", watchedOn: "2026-09-01", updatedAt: "2026-01-01T00:00:00Z" },
    ],
  } } }], { today: "2026-08-31" });
  assert.deepEqual(items, []);
});
