import test from "node:test";
import assert from "node:assert/strict";
import { handleFriends, parseStoredDoc } from "./src/index.js";

test("parseStoredDoc accepts objects and rejects bad JSON", () => {
  assert.deepEqual(parseStoredDoc('{"lists":[]}'), { lists: [] });
  assert.equal(parseStoredDoc(null), null);
  assert.equal(parseStoredDoc(""), null);
  assert.equal(parseStoredDoc("not-json"), null);
  assert.equal(parseStoredDoc("[]"), null);
  assert.equal(parseStoredDoc("42"), null);
});

test("friends activity falls back to the email local part when no display name is set", async () => {
  const env = {
    DB: {
      prepare() {
        return {
          bind: () => ({
            all: async () => ({ results: [{
              id: 2,
              display_name: null,
              email: "sam.jones@mail.com",
              viewer_email: "me@mail.com",
              doc: JSON.stringify({
                lists: [{ id: "watched", movieIds: [10] }, { id: "watchlist", movieIds: [] }],
                viewingHistory: { 10: [{ id: "a", watchedOn: "2026-08-20", updatedAt: "2026-08-20T12:00:00Z" }] },
              }),
            }] }),
          }),
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
  assert.deepEqual(response.body.items.map((item) => item.friend), [
    { id: 2, displayName: "sam.jones" },
  ]);
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
                    lists: [{ id: "watched", movieIds: [10] }, { id: "watchlist", movieIds: [] }],
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

test("friends activity hides plus-test accounts from a real viewer", async () => {
  const activityRows = (viewerEmail) => [
    {
      id: 2,
      display_name: "Sam",
      email: "sam@mail.com",
      viewer_email: viewerEmail,
      doc: JSON.stringify({
        lists: [{ id: "watched", movieIds: [10] }, { id: "watchlist", movieIds: [] }],
        viewingHistory: { 10: [{ id: "sam", watchedOn: "2026-08-20", updatedAt: "2026-08-20T12:00:00Z" }] },
      }),
    },
    {
      id: 3,
      display_name: "Tester",
      email: "jared987+test@gmail.com",
      viewer_email: viewerEmail,
      doc: JSON.stringify({
        lists: [{ id: "watched", movieIds: [20] }, { id: "watchlist", movieIds: [] }],
        viewingHistory: { 20: [{ id: "test", watchedOn: "2026-08-21", updatedAt: "2026-08-21T12:00:00Z" }] },
      }),
    },
  ];
  const res = { json: (status, body) => ({ status, body }) };
  const activityFriendIds = async (viewerEmail) => {
    const env = {
      DB: {
        prepare() {
          return { bind: () => ({ all: async () => ({ results: activityRows(viewerEmail) }) }) };
        },
      },
    };
    const response = await handleFriends(
      new Request("https://example.com/api/friends/activity?limit=20"),
      env,
      { uid: 1 },
      "/api/friends/activity",
      res,
    );
    return response.body.items.map((item) => item.friend.id);
  };
  assert.deepEqual(await activityFriendIds("jared987@gmail.com"), [2]);
  assert.deepEqual(await activityFriendIds("jared987+test@gmail.com"), [3, 2]);
});
