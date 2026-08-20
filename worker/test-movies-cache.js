import test from "node:test";
import assert from "node:assert/strict";
import {
  BATCH_MAX_IDS,
  STALE_MS,
  normalizeBatchIds,
  loadMoviesFromD1,
  upsertMovies,
  handleMoviesBatch,
} from "./src/movies-cache.js";
import { normalizeMovie, parseStoredMovieDoc } from "./src/movie-normalize.js";

test("normalizeBatchIds dedupes, filters invalid, and caps length", () => {
  assert.deepEqual(normalizeBatchIds([1, 1, 2, -1, "3", 0]).ids, [1, 2, 3]);
  const many = Array.from({ length: 120 }, (_, i) => i + 1);
  const capped = normalizeBatchIds(many);
  assert.equal(capped.ids.length, BATCH_MAX_IDS);
  assert.equal(capped.truncated, true);
  assert.deepEqual(normalizeBatchIds(null).ids, []);
});

test("normalizeMovie matches app record shape", () => {
  const record = normalizeMovie({
    id: 550,
    title: " Fight Club ",
    release_date: "1999-10-15",
    runtime: 139,
    vote_average: 8.4,
    poster_path: "/abc.jpg",
    genres: [{ name: "Drama" }],
    credits: { crew: [{ job: "Director", name: "David Fincher" }], cast: [{ name: "Brad Pitt" }] },
  });
  assert.equal(record.id, 550);
  assert.equal(record.title, "Fight Club");
  assert.deepEqual(record.genres, ["Drama"]);
  assert.deepEqual(record.directors, ["David Fincher"]);
});

test("parseStoredMovieDoc reads normalized docs written to D1", () => {
  const stored = normalizeMovie({
    id: 550,
    title: "Fight Club",
    poster_path: "/abc.jpg",
    genres: [{ name: "Drama" }],
  });
  const parsed = parseStoredMovieDoc(JSON.stringify(stored));
  assert.equal(parsed.posterPath, "/abc.jpg");
  assert.equal(parsed.title, "Fight Club");
});

function createMovieDb(rows = new Map()) {
  return {
    rows,
    batchCalls: [],
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, " ").trim();
      return {
        bind(...args) {
          return {
            async all() {
              if (normalized.includes("FROM movies WHERE tmdb_id IN")) {
                const ids = args;
                const results = ids
                  .map((id) => rows.get(id))
                  .filter(Boolean);
                return { results };
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
    async batch(stmts) {
      this.batchCalls.push(stmts.length);
      for (const stmt of stmts) {
        await stmt.run();
      }
    },
  };
}

test("loadMoviesFromD1 skips stale rows", async () => {
  const now = Date.now();
  const fresh = normalizeMovie({ id: 1, title: "A", genres: [] });
  const stale = normalizeMovie({ id: 2, title: "B", genres: [] });
  const db = createMovieDb(
    new Map([
      [1, { tmdb_id: 1, doc: JSON.stringify(fresh), fetched_at: now }],
      [2, { tmdb_id: 2, doc: JSON.stringify(stale), fetched_at: now - STALE_MS - 1 }],
    ]),
  );
  const loaded = await loadMoviesFromD1({ DB: db }, [1, 2], now);
  assert.equal(loaded.size, 1);
  assert.equal(loaded.get(1).title, "A");
});

function createRateLimitDb(movieRows = new Map()) {
  const rateRows = new Map();
  const db = createMovieDb(movieRows);
  const basePrepare = db.prepare.bind(db);
  db.prepare = function prepare(sql) {
    const normalized = sql.replace(/\s+/g, " ").trim();
    if (normalized.startsWith("SELECT count, window_start FROM rate_limits")) {
      return {
        bind(key) {
          return {
            async first() {
              return rateRows.get(key) || null;
            },
            async run() {
              const now = Date.now();
              rateRows.set(key, { count: 1, window_start: now });
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    }
    if (normalized.startsWith("UPDATE rate_limits SET count")) {
      return {
        bind(key) {
          return {
            async run() {
              const row = rateRows.get(key);
              if (row) {
                row.count += 1;
              }
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    }
    if (normalized.includes("INSERT INTO rate_limits")) {
      return {
        bind(key, windowStart) {
          return {
            async run() {
              rateRows.set(key, { count: 1, window_start: windowStart });
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    }
    return basePrepare(sql);
  };
  return db;
}

test("handleMoviesBatch returns cached hits and fetches misses", async () => {
  const now = Date.now();
  const cached = normalizeMovie({ id: 42, title: "Cached", genres: ["Drama"] });
  const db = createRateLimitDb(
    new Map([[42, { tmdb_id: 42, doc: JSON.stringify(cached), fetched_at: now }]]),
  );
  db.prepare = function prepare(sql) {
    const normalized = sql.replace(/\s+/g, " ").trim();
    if (normalized.startsWith("SELECT count, window_start FROM rate_limits")) {
      return {
        bind() {
          return {
            async first() {
              return null;
            },
            async run() {
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    }
    return createRateLimitDb(db.rows).prepare(sql);
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("/movie/99")) {
      return new Response(
        JSON.stringify({ id: 99, title: "Fetched", genres: [{ name: "Comedy" }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  const waitUntilTasks = [];
  const ctx = {
    waitUntil(promise) {
      waitUntilTasks.push(promise);
    },
  };

  const request = new Request("https://example.com/api/movies/batch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: [42, 99] }),
  });

  const res = makeResponder(request);
  const response = await handleMoviesBatch(
    request,
    { DB: db, TMDB_READ_TOKEN: "eyJh.a.b" },
    { uid: 1 },
    ctx,
    res,
    () => "127.0.0.1",
  );

  globalThis.fetch = originalFetch;
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.movies["42"].title, "Cached");
  assert.equal(body.movies["99"].title, "Fetched");
  await Promise.all(waitUntilTasks);
  assert.equal(db.batchCalls.length, 1);
});

function makeResponder(request) {
  return {
    json(status, body) {
      return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    },
    jsonRateLimited(retryAfterSec) {
      const headers = { "content-type": "application/json; charset=utf-8" };
      if (retryAfterSec > 0) {
        headers["retry-after"] = String(retryAfterSec);
      }
      return new Response(JSON.stringify({ error: "Too many attempts. Try again later." }), {
        status: 429,
        headers,
      });
    },
  };
}

test("handleMoviesBatch rejects empty ids", async () => {
  const db = createRateLimitDb();
  const request = new Request("https://example.com/api/movies/batch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: [] }),
  });
  const res = makeResponder(request);
  const response = await handleMoviesBatch(
    request,
    { DB: db, TMDB_READ_TOKEN: "eyJh.a.b" },
    { uid: 1 },
    null,
    res,
    () => "127.0.0.1",
  );
  assert.equal(response.status, 400);
});

test("upsertMovies writes batch statements", async () => {
  const db = createMovieDb();
  const record = normalizeMovie({ id: 7, title: "Seven", genres: [] });
  await upsertMovies({ DB: db }, [record], 123);
  assert.equal(db.batchCalls.length, 1);
});
