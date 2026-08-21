import test from "node:test";
import assert from "node:assert/strict";
import { handleListRoutes } from "./src/list-routes.js";
import { parseStoredDoc } from "./src/index.js";
import { normalizeMovie } from "./src/movie-normalize.js";

function makeResponder() {
  return {
    json(status, body) {
      return { status, body };
    },
    jsonRateLimited(retryAfterSec) {
      return { status: 429, retryAfterSec };
    },
  };
}

function movieRow(id, title, year) {
  const record = normalizeMovie({
    id,
    title,
    release_date: `${year}-01-01`,
    vote_average: id,
    poster_path: null,
    genres: [],
    credits: { crew: [], cast: [] },
  });
  return {
    tmdb_id: id,
    doc: JSON.stringify(record),
    poster_path: null,
    fetched_at: Date.now(),
  };
}

function createEnv({ ownerDoc, viewerDoc, movies = new Map(), friends = true }) {
  return {
    DB: {
      prepare(sql) {
        const normalized = sql.replace(/\s+/g, " ").trim();
        return {
          bind(...args) {
            return {
              async first() {
                if (normalized.includes("FROM user_data WHERE user_id = ?")) {
                  const uid = args[0];
                  if (uid === 1) {
                    return ownerDoc ? { doc: JSON.stringify(ownerDoc) } : null;
                  }
                  if (uid === 2) {
                    return viewerDoc ? { doc: JSON.stringify(viewerDoc) } : null;
                  }
                }
                if (normalized.includes("FROM friends WHERE")) {
                  return friends ? { 1: 1 } : null;
                }
                return null;
              },
              async all() {
                if (normalized.includes("FROM movies WHERE tmdb_id IN")) {
                  const ids = args;
                  return {
                    results: ids.map((id) => movies.get(id)).filter(Boolean),
                  };
                }
                return { results: [] };
              },
              async run() {
                return { meta: { changes: 1 } };
              },
            };
          },
        };
      },
      async batch() {},
    },
  };
}

test("GET /api/lists/watched returns title-sorted ids", async () => {
  const ownerDoc = {
    lists: [
      { id: "watched", name: "Watched", movieIds: [1, 2, 3] },
      { id: "watchlist", name: "Watchlist", movieIds: [] },
    ],
    preferences: { sort: "title-desc" },
  };
  const movies = new Map([
    [1, movieRow(1, "Charlie", 2020)],
    [2, movieRow(2, "Alpha", 2019)],
    [3, movieRow(3, "Bravo", 2021)],
  ]);
  const env = createEnv({ ownerDoc, movies });
  const request = new Request("https://example.com/api/lists/watched?sort=title-asc");
  const res = makeResponder();
  const response = await handleListRoutes(
    request,
    env,
    { uid: 1 },
    "/api/lists/watched",
    res,
    "127.0.0.1",
    {
      parseStoredDoc,
      areFriends: async () => true,
    },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.ids, [2, 3, 1]);
  assert.equal(response.body.listId, "watched");
  assert.equal(response.body.sort, "title-asc");
});

test("GET /api/lists/watchlist ignores sort param", async () => {
  const ownerDoc = {
    lists: [
      { id: "watched", name: "Watched", movieIds: [] },
      { id: "watchlist", name: "Watchlist", movieIds: [5, 4] },
    ],
    preferences: { sort: "title-asc" },
  };
  const env = createEnv({ ownerDoc, movies: new Map() });
  const request = new Request("https://example.com/api/lists/watchlist?sort=title-asc");
  const res = makeResponder();
  const response = await handleListRoutes(
    request,
    env,
    { uid: 1 },
    "/api/lists/watchlist",
    res,
    "127.0.0.1",
    { parseStoredDoc, areFriends: async () => true },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.ids, [5, 4]);
  assert.equal(response.body.sort, "custom");
});

test("GET /api/friends/:id/lists/watched requires friendship", async () => {
  const ownerDoc = {
    lists: [{ id: "watched", name: "Watched", movieIds: [1] }],
    preferences: { sort: "user-rating-desc" },
    ratings: { 1: 8 },
  };
  const viewerDoc = {
    lists: [{ id: "watched", name: "Watched", movieIds: [] }],
    preferences: { sort: "user-rating-desc" },
    ratings: {},
  };
  const env = createEnv({ ownerDoc, viewerDoc, movies: new Map([[1, movieRow(1, "A", 2020)]]), friends: false });
  const request = new Request("https://example.com/api/friends/1/lists/watched");
  const res = makeResponder();
  const response = await handleListRoutes(
    request,
    env,
    { uid: 2 },
    "/api/friends/1/lists/watched",
    res,
    "127.0.0.1",
    { parseStoredDoc, areFriends: async () => false },
  );
  assert.equal(response.status, 403);
});

test("unmatched list path returns null", async () => {
  const request = new Request("https://example.com/api/lists/nope");
  const res = makeResponder();
  const response = await handleListRoutes(
    request,
    createEnv({ ownerDoc: { lists: [] } }),
    { uid: 1 },
    "/api/lists/nope",
    res,
    "127.0.0.1",
    { parseStoredDoc, areFriends: async () => true },
  );
  assert.equal(response, null);
});
