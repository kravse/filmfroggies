/**
 * D1-backed batch movie metadata cache with server-side TMDB miss fill.
 */

import { rateLimit } from "./rate-limit.js";
import {
  isDetailedMovieRecord,
  normalizeMovie,
  parseStoredMovieDoc,
} from "./movie-normalize.js";
import { TMDB_API_BASE, TMDB_REQUEST_TIMEOUT_MS } from "./tmdb-proxy.js";

export const BATCH_MAX_IDS = 100;
export const STALE_MS = 30 * 24 * 60 * 60 * 1000;
export const TMDB_FETCH_CONCURRENCY = 4;
/** Workers Free allows 50 external subrequests; leave headroom for other work. */
export const TMDB_FETCH_MAX_PER_REQUEST = 40;
/** SQLite bind limit is 999; chunk IN queries below that. */
export const D1_IN_CHUNK_SIZE = 400;

/**
 * Capacity caps, not a security control — the endpoint already requires a session.
 *
 * Viewport hydration fires one batch per 50ms debounce window, so scrolling a large
 * collection is tens of requests in a minute. A 15-minute window turned that into a
 * 15-minute lockout, well past any client backoff, which stranded rows as skeletons.
 * Short windows keep retry-after inside the client's retry budget. The IP cap is 4x
 * the user cap so a shared or proxied IP (see proxy-signature.js) does not 429
 * everyone behind it.
 */
export const BATCH_RATE_LIMITS = {
  user: { limit: 120, windowMs: 60 * 1000 },
  ip: { limit: 480, windowMs: 60 * 1000 },
};

const TMDB_MOVIE_APPEND = "append_to_response=credits&language=en-US";
const TMDB_MOVIE_LITE = "language=en-US";

/** Dedupe positive integer ids, preserve first-seen order, cap length. */
export function normalizeBatchIds(raw, max = BATCH_MAX_IDS) {
  if (!Array.isArray(raw)) {
    return { ids: [], truncated: false };
  }
  const seen = new Set();
  const ids = [];
  let truncated = false;
  for (const value of raw) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    if (ids.length >= max) {
      truncated = true;
      break;
    }
    ids.push(id);
  }
  return { ids, truncated };
}

function buildInClause(ids) {
  const placeholders = ids.map((_, index) => `?${index + 1}`).join(", ");
  return { sql: `SELECT tmdb_id, doc, poster_path, fetched_at FROM movies WHERE tmdb_id IN (${placeholders})`, binds: ids };
}

export async function loadMoviesFromD1(env, ids, nowMs = Date.now()) {
  if (!ids.length) {
    return new Map();
  }
  const freshBefore = nowMs - STALE_MS;
  const out = new Map();
  for (let offset = 0; offset < ids.length; offset += D1_IN_CHUNK_SIZE) {
    const chunk = ids.slice(offset, offset + D1_IN_CHUNK_SIZE);
    const { sql, binds } = buildInClause(chunk);
    const result = await env.DB.prepare(sql).bind(...binds).all();
    for (const row of result.results || []) {
      if (!row || row.fetched_at < freshBefore) {
        continue;
      }
      const record = parseStoredMovieDoc(row.doc);
      if (record) {
        out.set(record.id, record);
      }
    }
  }
  return out;
}

export async function fetchMovieFromTmdb(id, env, options = {}) {
  const token = String(env.TMDB_READ_TOKEN || "").trim();
  if (!token) {
    throw new Error("TMDB not configured");
  }
  const query = options.lite ? TMDB_MOVIE_LITE : TMDB_MOVIE_APPEND;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TMDB_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${TMDB_API_BASE}/movie/${id}?${query}`, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`TMDB request failed (${response.status})`);
    }
    const payload = await response.json();
    return normalizeMovie(payload);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchMoviesWithConcurrency(ids, env, options = {}) {
  const concurrency = options.concurrency ?? TMDB_FETCH_CONCURRENCY;
  const maxFetches = options.max ?? TMDB_FETCH_MAX_PER_REQUEST;
  const lite = options.lite === true;
  const queue = ids.slice(0, maxFetches);
  const results = new Map();
  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      try {
        const record = await fetchMovieFromTmdb(id, env, { lite });
        if (record) {
          results.set(id, record);
        }
      } catch (_) {
        /* Omit failed ids; caller lists them in missing. */
      }
    }
  }
  const workers = Math.min(concurrency, queue.length || 1);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}

export async function upsertMovies(env, records, nowMs = Date.now()) {
  if (!records.length) {
    return;
  }
  const stmt = env.DB.prepare(
    "INSERT INTO movies (tmdb_id, doc, poster_path, fetched_at, refreshed_at) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT (tmdb_id) DO UPDATE SET doc = ?2, poster_path = ?3, fetched_at = ?4, refreshed_at = ?5",
  );
  const batch = [];
  for (const record of records) {
    if (!isDetailedMovieRecord(record)) {
      continue;
    }
    const doc = JSON.stringify(record);
    batch.push(
      stmt.bind(
        record.id,
        doc,
        record.posterPath || null,
        nowMs,
        nowMs,
      ),
    );
  }
  if (batch.length) {
    await env.DB.batch(batch);
  }
}

async function enforceRateLimit(env, key, config, res) {
  const result = await rateLimit(env, key, config);
  if (!result.allowed) {
    return res.jsonRateLimited(result.retryAfterSec);
  }
  return null;
}

export async function handleMoviesBatch(request, env, session, ctx, res, clientIp) {
  if (request.method !== "POST") {
    return res.json(405, { error: "Method not allowed" });
  }

  const tmdbToken = String(env.TMDB_READ_TOKEN || "").trim();
  if (!tmdbToken) {
    return res.json(503, { error: "TMDB is not configured" });
  }

  const ip = clientIp(request);
  const ipLimited = await enforceRateLimit(env, `movies:ip:${ip}`, BATCH_RATE_LIMITS.ip, res);
  if (ipLimited) {
    return ipLimited;
  }
  const userLimited = await enforceRateLimit(
    env,
    `movies:uid:${session.uid}`,
    BATCH_RATE_LIMITS.user,
    res,
  );
  if (userLimited) {
    return userLimited;
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return res.json(400, { error: "Invalid JSON body" });
  }

  const { ids, truncated } = normalizeBatchIds(body?.ids);
  if (!ids.length) {
    return res.json(400, { error: "Body must include ids: positive integers" });
  }

  const nowMs = Date.now();
  const cached = await loadMoviesFromD1(env, ids, nowMs);
  const movies = {};
  for (const [id, record] of cached) {
    movies[String(id)] = record;
  }

  const missIds = ids.filter((id) => !cached.has(id));
  const fetched = await fetchMoviesWithConcurrency(missIds, env);
  const toUpsert = [];
  const missing = [];

  for (const id of missIds) {
    const record = fetched.get(id);
    if (record) {
      movies[String(id)] = record;
      toUpsert.push(record);
    } else {
      missing.push(id);
    }
  }

  const responseBody = { movies };
  if (missing.length) {
    responseBody.missing = missing;
  }
  if (truncated || missIds.length > fetched.size) {
    responseBody.partial = true;
  }

  const response = res.json(200, responseBody);
  if (ctx?.waitUntil && toUpsert.length) {
    ctx.waitUntil(upsertMovies(env, toUpsert, nowMs));
  } else if (toUpsert.length) {
    await upsertMovies(env, toUpsert, nowMs);
  }
  return response;
}
