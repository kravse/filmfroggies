const test = require("node:test");
const assert = require("node:assert/strict");
const {
  friendActivityItems,
  normalizeActivityLimit,
  isTestAccountEmail,
  isVisibleActivityFriend,
} = require("../scripts/lib/friend-activity");

test("friend activity is newest first, rated, deduplicated by movie/date, and limited", () => {
  const items = friendActivityItems([
    {
      id: 2,
      displayName: "Sam",
      doc: {
        lists: [
          { id: "watched", movieIds: [20] },
          { id: "watchlist", movieIds: [] },
        ],
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

test("isTestAccountEmail only matches a plus tag starting with test", () => {
  assert.equal(isTestAccountEmail("jared987+test@gmail.com"), true);
  assert.equal(isTestAccountEmail("Jared987+Test2@gmail.com"), true);
  assert.equal(isTestAccountEmail("jared987@gmail.com"), false);
  assert.equal(isTestAccountEmail("jared987+beta@gmail.com"), false);
  assert.equal(isTestAccountEmail("jared987+footest@gmail.com"), false);
  assert.equal(isTestAccountEmail(""), false);
});

test("isVisibleActivityFriend hides test accounts from real accounts only", () => {
  assert.equal(isVisibleActivityFriend("me@mail.com", "sam+test@mail.com"), false);
  assert.equal(isVisibleActivityFriend("me+test@mail.com", "sam+test@mail.com"), true);
  assert.equal(isVisibleActivityFriend("me+test@mail.com", "sam@mail.com"), true);
  assert.equal(isVisibleActivityFriend("me@mail.com", "sam@mail.com"), true);
  assert.equal(isVisibleActivityFriend(undefined, undefined), true);
});

test("friend activity drops test-account friends unless the viewer is one", () => {
  const lists = [{ id: "watched", movieIds: [10] }, { id: "watchlist", movieIds: [] }];
  const friends = [
    {
      id: 2,
      displayName: "Sam",
      email: "sam@mail.com",
      doc: {
        lists,
        viewingHistory: { 10: [{ id: "a", watchedOn: "2026-08-20", updatedAt: "2026-08-20T12:00:00Z" }] },
      },
    },
    {
      id: 3,
      displayName: "Tester",
      email: "jared987+test@gmail.com",
      doc: {
        lists: [{ id: "watched", movieIds: [20] }, { id: "watchlist", movieIds: [] }],
        viewingHistory: { 20: [{ id: "b", watchedOn: "2026-08-21", updatedAt: "2026-08-21T12:00:00Z" }] },
      },
    },
  ];
  const asReal = friendActivityItems(friends, { today: "2026-08-31", viewerEmail: "jared987@gmail.com" });
  assert.deepEqual(asReal.map((item) => item.friend.id), [2]);
  const asTester = friendActivityItems(friends, { today: "2026-08-31", viewerEmail: "jared987+test@gmail.com" });
  assert.deepEqual(asTester.map((item) => item.friend.id), [3, 2]);
});

test("friend activity rejects impossible and future viewing dates", () => {
  const items = friendActivityItems([{ id: 2, displayName: "Sam", doc: {
    lists: [{ id: "watched", movieIds: [10] }, { id: "watchlist", movieIds: [] }],
    viewingHistory: {
    10: [
      { id: "impossible", watchedOn: "2026-02-30", updatedAt: "2026-01-01T00:00:00Z" },
      { id: "future", watchedOn: "2026-09-01", updatedAt: "2026-01-01T00:00:00Z" },
    ],
  } } }], { today: "2026-08-31" });
  assert.deepEqual(items, []);
});

test("friend activity ignores viewing history for fully removed movies", () => {
  const items = friendActivityItems([{
    id: 2,
    displayName: "Sam",
    doc: {
      lists: [{ id: "watched", movieIds: [20] }, { id: "watchlist", movieIds: [] }],
      viewingHistory: {
        10: [{ id: "removed", watchedOn: "2026-08-30", updatedAt: "2026-08-30T12:00:00Z" }],
        20: [{ id: "kept", watchedOn: "2026-08-20", updatedAt: "2026-08-20T12:00:00Z" }],
      },
    },
  }], { today: "2026-08-31" });
  assert.deepEqual(items.map((item) => item.movieId), [20]);
});

test("friend activity shows watch dates for movies still on watchlist or custom lists", () => {
  const history = {
    10: [{ id: "a", watchedOn: "2026-08-20", updatedAt: "2026-08-20T12:00:00Z" }],
    20: [{ id: "b", watchedOn: "2026-08-19", updatedAt: "2026-08-19T12:00:00Z" }],
    30: [{ id: "c", watchedOn: "2026-08-18", updatedAt: "2026-08-18T12:00:00Z" }],
  };
  const items = friendActivityItems([{
    id: 2,
    displayName: "Sam",
    doc: {
      lists: [{ id: "watched", movieIds: [] }, { id: "watchlist", movieIds: [10, 20] }],
      customLists: [{ id: "custom-favorites", movieIds: [30] }],
      viewingHistory: history,
    },
  }], { today: "2026-08-31" });
  assert.deepEqual(items.map((item) => item.movieId), [10, 20, 30]);
});
