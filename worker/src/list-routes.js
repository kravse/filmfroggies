/**
 * GET /api/lists/* and GET /api/friends/:id/lists/* — sorted id arrays.
 */

import { rateLimit } from "./rate-limit.js";
import {
  loadMoviesFromD1,
  fetchMoviesWithConcurrency,
  upsertMovies,
} from "./movies-cache.js";
import {
  sortedListIds,
  sortNeedsMovieMetadata,
  listMovieIds,
  resolveListSort,
} from "./lib/list-query.js";

export const LIST_RATE_LIMITS = {
  user: { limit: 60, windowMs: 15 * 60 * 1000 },
  ip: { limit: 120, windowMs: 15 * 60 * 1000 },
};

const STORED_DOC_CORRUPT_ERROR = "Stored data is corrupt";

async function enforceRateLimit(env, key, config, res) {
  const result = await rateLimit(env, key, config);
  if (!result.allowed) {
    return res.jsonRateLimited(result.retryAfterSec);
  }
  return null;
}

function parseListPath(path) {
  const ownMatch = /^\/api\/lists\/(watched|watchlist)(?:\/|$)/.exec(path);
  if (ownMatch) {
    return { listId: ownMatch[1], friendId: null };
  }

  const ownCustomMatch = /^\/api\/lists\/custom\/([^/]+)$/.exec(path);
  if (ownCustomMatch) {
    return { listId: ownCustomMatch[1], friendId: null };
  }

  const friendMatch = /^\/api\/friends\/(\d+)\/lists\/(watched|watchlist)(?:\/|$)/.exec(path);
  if (friendMatch) {
    return { listId: friendMatch[2], friendId: Number(friendMatch[1]) };
  }

  const friendCustomMatch = /^\/api\/friends\/(\d+)\/lists\/custom\/([^/]+)$/.exec(path);
  if (friendCustomMatch) {
    return { listId: friendCustomMatch[2], friendId: Number(friendCustomMatch[1]) };
  }

  return null;
}

async function buildMovieLookup(env, ids, sortMode) {
  const records = await loadMoviesFromD1(env, ids);
  if (sortNeedsMovieMetadata(sortMode)) {
    const missing = ids.filter((id) => !records.has(Number(id)));
    if (missing.length) {
      const fetched = await fetchMoviesWithConcurrency(missing, env);
      const fresh = [...fetched.values()];
      if (fresh.length) {
        await upsertMovies(env, fresh);
      }
      for (const [id, record] of fetched) {
        records.set(id, record);
      }
    }
  }
  return (id) => records.get(Number(id)) || null;
}

export async function handleListRoutes(request, env, session, path, res, ip, deps = {}) {
  if (request.method !== "GET") {
    return res.json(405, { error: "Method not allowed" });
  }

  const parsed = parseListPath(path);
  if (!parsed) {
    return null;
  }

  const ipLimited = await enforceRateLimit(env, `lists:ip:${ip}`, LIST_RATE_LIMITS.ip, res);
  if (ipLimited) {
    return ipLimited;
  }
  const userLimited = await enforceRateLimit(
    env,
    `lists:uid:${session.uid}`,
    LIST_RATE_LIMITS.user,
    res,
  );
  if (userLimited) {
    return userLimited;
  }

  const parseStoredDoc = deps.parseStoredDoc;
  const areFriends = deps.areFriends;
  if (typeof parseStoredDoc !== "function" || typeof areFriends !== "function") {
    return res.json(500, { error: "List routes are not configured" });
  }

  const url = new URL(request.url);
  const sortParam = url.searchParams.get("sort");

  let ownerUid = session.uid;
  let viewerDoc = null;

  if (parsed.friendId != null) {
    if (!(await areFriends(env, session.uid, parsed.friendId))) {
      return res.json(403, { error: "Not friends with that user" });
    }
    ownerUid = parsed.friendId;
    const viewerRow = await env.DB.prepare(
      "SELECT doc FROM user_data WHERE user_id = ?",
    )
      .bind(session.uid)
      .first();
    viewerDoc = viewerRow ? parseStoredDoc(viewerRow.doc) : null;
    if (viewerRow && !viewerDoc) {
      return res.json(500, { error: STORED_DOC_CORRUPT_ERROR });
    }
  }

  const ownerRow = await env.DB.prepare("SELECT doc FROM user_data WHERE user_id = ?")
    .bind(ownerUid)
    .first();
  if (!ownerRow) {
    return res.json(404, { error: "No data yet" });
  }
  const ownerDoc = parseStoredDoc(ownerRow.doc);
  if (!ownerDoc) {
    return res.json(500, { error: STORED_DOC_CORRUPT_ERROR });
  }

  const sortMode = resolveListSort(ownerDoc, parsed.listId, sortParam || undefined);
  const movieIds = listMovieIds(ownerDoc, parsed.listId);
  const getMovieRecord = await buildMovieLookup(env, movieIds, sortMode);

  const result = sortedListIds({
    userDoc: ownerDoc,
    ownerDoc,
    viewerDoc: viewerDoc || ownerDoc,
    listId: parsed.listId,
    sort: sortParam || undefined,
    friendView: parsed.friendId != null,
    getMovieRecord,
  });

  return res.json(200, result);
}
