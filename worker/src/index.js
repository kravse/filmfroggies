/**
 * CineQueue backend: accounts, per-user data doc, friends.
 * Auth: HMAC-signed bearer token with { uid, jti, exp } plus D1 session rows for revocation.
 */

import {
  buildProxiedTmdbUrl,
  parseProxyRequestQuery,
  TMDB_REQUEST_TIMEOUT_MS,
  tmdbCacheControl,
} from "./tmdb-proxy.js";
import { rateLimit, rateLimitBlocked } from "./rate-limit.js";
import { handleMoviesBatch } from "./movies-cache.js";
import {
  linkInviteCodeToUser,
  normalizeInviteCode,
  releaseInviteCode,
  reserveInviteCode,
} from "./invite-codes.js";
import { handleAdminRoutes } from "./admin.js";
import { handleListRoutes } from "./list-routes.js";
import {
  createSessionToken,
  verifySessionToken,
  generateJti,
  insertSession,
  sessionIsActive,
  revokeSession,
  revokeOtherUserSessions,
} from "./sessions.js";
import { describeProxySignature, netlifyProxyTrusted } from "./proxy-signature.js";
import { resolveFriendShareLink, rotateFriendShareLink } from "./friend-share-links.js";
import { friendActivityItems, normalizeActivityLimit } from "./lib/friend-activity.js";
import {
  displayNameError,
  normalizeDisplayName,
  resolveDisplayName,
} from "./lib/display-name.js";

export { rateLimit, rateLimitBlocked, createSessionToken, verifySessionToken };

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
// ponytail: 100k PBKDF2 iterations fits the free plan's 10ms CPU budget in
// practice (native WebCrypto); bump iterations or move to paid if CF starts
// killing login requests for CPU.
const PBKDF2_ITERATIONS = 100_000;
const MAX_DOC_BYTES = 200_000;

/** Neutral copy for responses that must not reveal whether an email is registered. */
const FRIEND_REQUEST_ACK = { status: "pending" };
const SIGNUP_ACK = { status: "ok" };
const STORED_DOC_CORRUPT_ERROR = "Stored data is corrupt";

/** Fixed-window auth rate limits. IP limits count every attempt; email counts failed logins only. */
export const AUTH_RATE_LIMITS = {
  signupIp: { limit: 5, windowMs: 60 * 60 * 1000 },
  loginIp: { limit: 15, windowMs: 15 * 60 * 1000 },
  loginEmailFail: { limit: 5, windowMs: 15 * 60 * 1000 },
};

/** Per-user and per-IP caps on proxied TMDB reads. */
export const TMDB_RATE_LIMITS = {
  user: { limit: 120, windowMs: 15 * 60 * 1000 },
  ip: { limit: 120, windowMs: 15 * 60 * 1000 },
};

const FRIEND_LINK_RATE_LIMIT = { limit: 20, windowMs: 60 * 60 * 1000 };

const RATE_LIMIT_ERROR = "Too many attempts. Try again later.";

/** Matches server.js default PORT and account-sync localhost dev hosts. */
const LOCAL_DEV_PORT = 8743;

export const DEFAULT_ALLOWED_ORIGINS = [
  "https://filmfroggies.com",
  "https://www.filmfroggies.com",
  `http://localhost:${LOCAL_DEV_PORT}`,
  `http://127.0.0.1:${LOCAL_DEV_PORT}`,
];

const enc = new TextEncoder();

export function allowedOrigins(env) {
  const set = new Set(DEFAULT_ALLOWED_ORIGINS);
  const extra = env?.ALLOWED_ORIGINS;
  if (extra) {
    for (const part of String(extra).split(",")) {
      const origin = part.trim();
      if (origin) {
        set.add(origin);
      }
    }
  }
  return set;
}

/** Reflect allowlisted Origin only; omit ACAO for unknown cross-origin callers. */
export function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const headers = { vary: "Origin" };
  if (origin && allowedOrigins(env).has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-headers"] = "authorization, content-type";
    headers["access-control-allow-methods"] = "GET, PUT, POST, DELETE, OPTIONS";
  }
  return headers;
}

function responseHeaders(request, env) {
  return {
    "content-type": "application/json; charset=utf-8",
    ...corsHeaders(request, env),
  };
}

function makeResponder(request, env) {
  return {
    json(status, body) {
      return new Response(JSON.stringify(body), { status, headers: responseHeaders(request, env) });
    },
    jsonRateLimited(retryAfterSec) {
      const headers = responseHeaders(request, env);
      if (retryAfterSec > 0) {
        headers["retry-after"] = String(retryAfterSec);
      }
      return new Response(JSON.stringify({ error: RATE_LIMIT_ERROR }), { status: 429, headers });
    },
    preflight() {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    },
  };
}

function toB64url(bytes) {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromB64url(str) {
  const padded = str.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (str.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function timingSafeEqualBytes(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `${PBKDF2_ITERATIONS}.${toB64url(salt)}.${toB64url(bits)}`;
}

export async function verifyPassword(password, stored) {
  const parts = String(stored || "").split(".");
  if (parts.length !== 3) return false;
  const iterations = Number(parts[0]);
  if (!Number.isInteger(iterations) || iterations < 1) return false;
  const bits = await pbkdf2(password, fromB64url(parts[1]), iterations);
  return timingSafeEqualBytes(new Uint8Array(bits), fromB64url(parts[2]));
}

/**
 * Client IP for rate limits. CF-Connecting-IP is set by Cloudflare and cannot be
 * spoofed on direct Worker traffic. X-Forwarded-For carries the real user IP for
 * Netlify-proxied requests, where CF-Connecting-IP is Netlify's edge — but it is
 * caller-settable, so it is only believed when trustForwardedFor is true (see
 * netlifyProxyTrusted). Otherwise a direct caller could pick its own limit key.
 */
export function clientIp(request, trustForwardedFor = false) {
  const cf = request.headers.get("CF-Connecting-IP")?.trim();
  const firstForwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (trustForwardedFor && firstForwarded) {
    return firstForwarded.slice(0, 64);
  }
  if (cf) {
    return cf.slice(0, 64);
  }
  return "unknown";
}

/** Bind the per-request trust decision so handlers keep a sync clientIp(request). */
function makeClientIp(trustForwardedFor) {
  return (request) => clientIp(request, trustForwardedFor);
}

async function enforceRateLimit(env, key, config, res) {
  const result = await rateLimit(env, key, config);
  if (!result.allowed) {
    return res.jsonRateLimited(result.retryAfterSec);
  }
  return null;
}

async function enforceRateLimitBlocked(env, key, config, res) {
  const result = await rateLimitBlocked(env, key, config);
  if (result.blocked) {
    return res.jsonRateLimited(result.retryAfterSec);
  }
  return null;
}

function readBearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") || "");
  return match ? match[1].trim() : "";
}

async function requireUser(request, env) {
  const nowMs = Date.now();
  const session = await verifySessionToken(env.SESSION_SECRET, readBearerToken(request), nowMs);
  if (!session) return null;
  if (!(await sessionIsActive(env, { jti: session.jti, userId: session.uid }, nowMs))) return null;
  return session;
}

function normalizeEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

/** Parse a JSON doc column; returns null when missing, invalid, or non-object. */
export function parseStoredDoc(jsonText) {
  if (jsonText == null || jsonText === "") {
    return null;
  }
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

async function issueToken(env, uid) {
  const nowMs = Date.now();
  const exp = nowMs + SESSION_LIFETIME_MS;
  const jti = generateJti();
  await insertSession(env, { jti, userId: uid, expiresAtMs: exp }, nowMs);
  return { token: await createSessionToken(env.SESSION_SECRET, uid, jti, exp), expiresAt: exp };
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch (_) {
    return null;
  }
}

// displayName is the raw stored name, empty when unset; callers hold the email
// and resolve the fallback themselves.
function publicUser(row) {
  return { id: row.id, email: row.email, displayName: row.display_name || "" };
}

// Friendship is one row; either endpoint of an accepted row is a friend.
async function areFriends(env, a, b) {
  const row = await env.DB.prepare(
    "SELECT 1 FROM friends WHERE status = 'accepted' AND ((user_id = ?1 AND friend_id = ?2) OR (user_id = ?2 AND friend_id = ?1))"
  ).bind(a, b).first();
  return Boolean(row);
}

async function findFriendship(env, userId, friendId) {
  const row = await env.DB.prepare(
    "SELECT status, user_id FROM friends WHERE (user_id = ?1 AND friend_id = ?2) OR (user_id = ?2 AND friend_id = ?1)"
  ).bind(userId, friendId).first();
  if (!row) {
    return null;
  }
  return {
    status: row.status,
    direction: row.user_id === userId ? "outgoing" : "incoming",
  };
}

/** One read for all accepted friends' list docs — shared by activity and bulk-data. */
export async function loadAcceptedFriendsWithDocs(env, uid) {
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.display_name, u.email, d.doc
     FROM friends f
     JOIN users u ON u.id = CASE WHEN f.user_id = ?1 THEN f.friend_id ELSE f.user_id END
     LEFT JOIN user_data d ON d.user_id = u.id
     WHERE (f.user_id = ?1 OR f.friend_id = ?1) AND f.status = 'accepted'`,
  ).bind(uid).all();
  return results.map((row) => ({
    id: row.id,
    displayName: resolveDisplayName(row),
    email: row.email,
    doc: parseStoredDoc(row.doc),
  }));
}

/** Same friends read as activity, with viewer email in one round trip. */
async function loadAcceptedFriendsForActivity(env, uid) {
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.display_name, u.email, d.doc,
            (SELECT email FROM users WHERE id = ?1) AS viewer_email
     FROM friends f
     JOIN users u ON u.id = CASE WHEN f.user_id = ?1 THEN f.friend_id ELSE f.user_id END
     LEFT JOIN user_data d ON d.user_id = u.id
     WHERE (f.user_id = ?1 OR f.friend_id = ?1) AND f.status = 'accepted'`,
  ).bind(uid).all();
  return {
    viewerEmail: results[0]?.viewer_email || "",
    friends: results.map((row) => ({
      id: row.id,
      displayName: resolveDisplayName(row),
      email: row.email,
      doc: parseStoredDoc(row.doc),
    })),
  };
}

function mapFriendActivityItems(friends, options) {
  return friendActivityItems(friends, options).map(({ movieId, watchedOn, friend, rating }) => ({
    movieId,
    watchedOn,
    friend,
    rating,
  }));
}

/** Verify the current password and store a new hash; other sessions are revoked. */
export async function changeAccountPassword(env, uid, currentPassword, newPassword, keepJti) {
  if (newPassword.length < 8) {
    return { ok: false, status: 400, error: "Password must be at least 8 characters" };
  }
  const user = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(uid).first();
  if (!user?.password_hash || !(await verifyPassword(currentPassword, user.password_hash))) {
    return { ok: false, status: 403, error: "Invalid password" };
  }
  const hash = await hashPassword(newPassword);
  await env.DB.prepare("UPDATE users SET password_hash = ?1 WHERE id = ?2").bind(hash, uid).run();
  if (keepJti) {
    await revokeOtherUserSessions(env, uid, keepJti);
  }
  return { ok: true };
}

/** Store a vanity display name, or clear it back to the email-derived fallback. */
export async function setAccountDisplayName(env, uid, rawDisplayName) {
  const raw = String(rawDisplayName || "").trim();
  const displayName = raw ? normalizeDisplayName(raw) : null;
  if (raw && !displayName) {
    return { ok: false, status: 400, error: displayNameError(raw) };
  }
  let user;
  try {
    user = await env.DB.prepare(
      "UPDATE users SET display_name = ?1 WHERE id = ?2 RETURNING id, email, display_name"
    ).bind(displayName, uid).first();
  } catch (_) {
    // users_display_name_unique is the only constraint on this write, and it is
    // the guard: two simultaneous claims cannot both succeed.
    return { ok: false, status: 409, error: "That display name is taken" };
  }
  if (!user) {
    return { ok: false, status: 401, error: "Account no longer exists" };
  }
  return { ok: true, user };
}

/** Remove a user and all server-side rows that reference them. */
export async function deleteUserAccount(env, uid) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?1").bind(uid),
    env.DB.prepare("DELETE FROM friend_share_links WHERE user_id = ?1").bind(uid),
    env.DB.prepare("DELETE FROM friends WHERE user_id = ?1 OR friend_id = ?1").bind(uid),
    env.DB.prepare("DELETE FROM user_data WHERE user_id = ?1").bind(uid),
    env.DB.prepare("DELETE FROM users WHERE id = ?1").bind(uid),
  ]);
}

async function handleAuth(request, env, path, res, ip) {
  const body = await readJsonBody(request);
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || "");
  if (!email) return res.json(400, { error: "Valid email required" });


  if (path === "/api/signup") {
    const inviteCode = normalizeInviteCode(body?.inviteCode);
    if (!inviteCode) {
      return res.json(201, SIGNUP_ACK);
    }
    if (password.length < 8) return res.json(400, { error: "Password must be at least 8 characters" });
    const limited = await enforceRateLimit(env, `signup:ip:${ip}`, AUTH_RATE_LIMITS.signupIp, res);
    if (limited) return limited;

    const invite = await reserveInviteCode(env, inviteCode);
    if (!invite.ok) {
      return res.json(201, SIGNUP_ACK);
    }

    const hash = await hashPassword(password);
    let result;
    try {
      // display_name stays NULL until the account picks one in Settings.
      result = await env.DB.prepare(
        "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?) RETURNING id, email, display_name"
      ).bind(email, hash, Date.now()).first();
    } catch (_) {
      await releaseInviteCode(env, invite.codeHash, invite.reservedAt);
      return res.json(201, SIGNUP_ACK);
    }
    await linkInviteCodeToUser(env, invite.codeHash, result.id);
    return res.json(201, { ...SIGNUP_ACK, user: publicUser(result), ...(await issueToken(env, result.id)) });
  }

  // /api/login
  const ipLimited = await enforceRateLimit(env, `login:ip:${ip}`, AUTH_RATE_LIMITS.loginIp, res);
  if (ipLimited) return ipLimited;
  const emailLimited = await enforceRateLimitBlocked(
    env,
    `login:email:${email}`,
    AUTH_RATE_LIMITS.loginEmailFail,
    res,
  );
  if (emailLimited) return emailLimited;

  const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
    await rateLimit(env, `login:email:${email}`, AUTH_RATE_LIMITS.loginEmailFail);
    return res.json(401, { error: "Invalid email or password" });
  }
  return res.json(200, { user: publicUser(user), ...(await issueToken(env, user.id)) });
}

export async function handleFriends(request, env, session, path, res) {
  const uid = session.uid;

  if (path === "/api/friends/share-link" && request.method === "POST") {
    const token = await rotateFriendShareLink(env, uid);
    return res.json(201, { token });
  }

  if (path === "/api/friends/share-link/preview" && request.method === "POST") {
    const body = await readJsonBody(request);
    const target = await resolveFriendShareLink(env, body?.token);
    if (!target) return res.json(404, { error: "Friend link is invalid or expired" });
    const existing = target.id === uid ? null : await findFriendship(env, uid, target.id);
    const state = target.id === uid ? "self" : existing?.status || "available";
    return res.json(200, { friend: target, state });
  }

  if (path === "/api/friends/share-link/request" && request.method === "POST") {
    const limited = await enforceRateLimit(env, `friend-link:uid:${uid}`, FRIEND_LINK_RATE_LIMIT, res);
    if (limited) return limited;
    const body = await readJsonBody(request);
    const target = await resolveFriendShareLink(env, body?.token);
    if (!target) return res.json(404, { error: "Friend link is invalid or expired" });
    if (target.id === uid) return res.json(200, { status: "self" });
    const existing = await findFriendship(env, uid, target.id);
    if (existing) return res.json(200, { status: existing.status });
    await env.DB.prepare(
      "INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'pending', ?)",
    ).bind(uid, target.id, Date.now()).run();
    return res.json(201, { status: "pending" });
  }

  if (path === "/api/friends/activity" && request.method === "GET") {
    const limit = normalizeActivityLimit(new URL(request.url).searchParams.get("limit"));
    try {
      const { friends, viewerEmail } = await loadAcceptedFriendsForActivity(env, uid);
      const items = mapFriendActivityItems(friends, { limit, viewerEmail });
      return res.json(200, { items });
    } catch (_) {
      return res.json(200, { items: [] });
    }
  }

  if (path === "/api/friends/bulk-data" && request.method === "GET") {
    const friends = await loadAcceptedFriendsWithDocs(env, uid);
    return res.json(200, {
      friends: friends.map(({ id, displayName, email, doc }) => ({
        id,
        displayName,
        email,
        doc: doc
          ? {
              lists: doc.lists,
              customLists: doc.customLists,
              statuses: doc.statuses,
              ratings: doc.ratings,
              viewingHistory: doc.viewingHistory,
            }
          : null,
      })),
    });
  }

  if (path === "/api/friends" && request.method === "GET") {
    const { results } = await env.DB.prepare(
      `SELECT u.id, u.email, u.display_name, f.status,
              CASE WHEN f.user_id = ?1 THEN 'outgoing' ELSE 'incoming' END AS direction
       FROM friends f JOIN users u ON u.id = CASE WHEN f.user_id = ?1 THEN f.friend_id ELSE f.user_id END
       WHERE f.user_id = ?1 OR f.friend_id = ?1`
    ).bind(uid).all();
    return res.json(200, {
      friends: results.map((r) => ({ ...publicUser(r), status: r.status, direction: r.direction })),
    });
  }

  if (path === "/api/friends/request" && request.method === "POST") {
    const body = await readJsonBody(request);
    const email = normalizeEmail(body?.email);
    if (!email) return res.json(400, { error: "Valid email required" });

    const self = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(uid).first();
    if (!self || email === normalizeEmail(self.email)) {
      return res.json(201, FRIEND_REQUEST_ACK);
    }

    const target = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (!target || target.id === uid) {
      return res.json(201, FRIEND_REQUEST_ACK);
    }

    const existing = await findFriendship(env, uid, target.id);
    if (existing?.status === "accepted") {
      return res.json(201, FRIEND_REQUEST_ACK);
    }
    if (existing?.status === "pending") {
      return res.json(201, FRIEND_REQUEST_ACK);
    }

    await env.DB.prepare(
      "INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'pending', ?)"
    ).bind(uid, target.id, Date.now()).run();
    return res.json(201, FRIEND_REQUEST_ACK);
  }

  const acceptMatch = /^\/api\/friends\/(\d+)\/accept$/.exec(path);
  if (acceptMatch && request.method === "POST") {
    const requesterId = Number(acceptMatch[1]);
    const { meta } = await env.DB.prepare(
      "UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ? AND status = 'pending'"
    ).bind(requesterId, uid).run();
    return meta.changes ? res.json(200, { status: "accepted" }) : res.json(404, { error: "No pending request from that user" });
  }

  const idMatch = /^\/api\/friends\/(\d+)$/.exec(path);
  if (idMatch && request.method === "DELETE") {
    const otherId = Number(idMatch[1]);
    await env.DB.prepare(
      "DELETE FROM friends WHERE (user_id = ?1 AND friend_id = ?2) OR (user_id = ?2 AND friend_id = ?1)"
    ).bind(uid, otherId).run();
    return res.json(200, { status: "removed" });
  }

  const dataMatch = /^\/api\/friends\/(\d+)\/data$/.exec(path);
  if (dataMatch && request.method === "GET") {
    const friendId = Number(dataMatch[1]);
    if (!(await areFriends(env, uid, friendId))) return res.json(403, { error: "Not friends with that user" });
    const row = await env.DB.prepare("SELECT doc, updated_at FROM user_data WHERE user_id = ?").bind(friendId).first();
    if (!row) return res.json(404, { error: "No data yet" });
    const doc = parseStoredDoc(row.doc);
    if (!doc) return res.json(500, { error: STORED_DOC_CORRUPT_ERROR });
    return res.json(200, { doc, updatedAt: row.updated_at });
  }

  return res.json(404, { error: "Not found" });
}

async function handleTmdb(request, env, session, res, ip) {
  if (request.method !== "GET") {
    return res.json(405, { error: "Method not allowed" });
  }

  const tmdbToken = String(env.TMDB_READ_TOKEN || "").trim();
  if (!tmdbToken) {
    return res.json(503, { error: "TMDB proxy is not configured" });
  }

  const ipLimited = await enforceRateLimit(env, `tmdb:ip:${ip}`, TMDB_RATE_LIMITS.ip, res);
  if (ipLimited) return ipLimited;
  const userLimited = await enforceRateLimit(
    env,
    `tmdb:uid:${session.uid}`,
    TMDB_RATE_LIMITS.user,
    res,
  );
  if (userLimited) return userLimited;

  let proxiedUrl;
  let pathname;
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams.entries());
    const parsed = parseProxyRequestQuery(query);
    pathname = parsed.pathname;
    proxiedUrl = buildProxiedTmdbUrl(pathname, parsed.searchParams);
  } catch (error) {
    return res.json(400, { error: error.message || "Bad request" });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TMDB_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(proxiedUrl, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${tmdbToken}`,
      },
      signal: controller.signal,
    });
    const text = await response.text();
    const headers = responseHeaders(request, env);
    const cacheControl = tmdbCacheControl(pathname);
    if (cacheControl) {
      headers["cache-control"] = cacheControl;
    }
    return new Response(text, { status: response.status, headers });
  } catch (error) {
    const message =
      error.name === "AbortError" ? "Upstream request timed out" : "Upstream request failed";
    return res.json(502, { error: message });
  } finally {
    clearTimeout(timer);
  }
}

export default {
  async fetch(request, env, ctx) {
    const res = makeResponder(request, env);
    if (request.method === "OPTIONS") {
      return res.preflight();
    }
    const path = new URL(request.url).pathname;
    if (!env.SESSION_SECRET) {
      return res.json(503, { error: "Backend is not configured" });
    }

    // x-forwarded-for is only believed when Netlify signed the proxied request,
    // so a direct caller cannot choose its own rate-limit bucket.
    const proxyTrusted = await netlifyProxyTrusted(env, request);
    const ipOf = makeClientIp(proxyTrusted);
    const ip = ipOf(request);

    if ((path === "/api/signup" || path === "/api/login") && request.method === "POST") {
      return handleAuth(request, env, path, res, ip);
    }

    if (path.startsWith("/api/admin")) {
      return handleAdminRoutes(request, env, path, res, {
        clientIp: ipOf,
        readJsonBody,
        deleteUserAccount,
        proxySignature: describeProxySignature(env, request, proxyTrusted),
      });
    }

    const session = await requireUser(request, env);
    if (!session) {
      return res.json(401, { error: "Not logged in" });
    }

    if (path === "/api/me" && request.method === "GET") {
      const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(session.uid).first();
      return user
        ? res.json(200, { user: publicUser(user) })
        : res.json(401, { error: "Account no longer exists" });
    }

    if (path === "/api/logout" && request.method === "POST") {
      await revokeSession(env, session.jti);
      return res.json(200, { status: "ok" });
    }

    if (path === "/api/account/password" && request.method === "POST") {
      const body = await readJsonBody(request);
      const currentPassword = String(body?.currentPassword || "");
      const newPassword = String(body?.newPassword || "");
      if (!currentPassword || !newPassword) {
        return res.json(400, { error: "Current and new password required" });
      }
      const result = await changeAccountPassword(
        env,
        session.uid,
        currentPassword,
        newPassword,
        session.jti,
      );
      if (!result.ok) {
        return res.json(result.status, { error: result.error });
      }
      return res.json(200, { status: "ok" });
    }

    if (path === "/api/account/display-name" && request.method === "POST") {
      const body = await readJsonBody(request);
      const result = await setAccountDisplayName(env, session.uid, body?.displayName);
      if (!result.ok) {
        return res.json(result.status, { error: result.error });
      }
      return res.json(200, { user: publicUser(result.user) });
    }

    if (path === "/api/account" && request.method === "DELETE") {
      const body = await readJsonBody(request);
      const password = String(body?.password || "");
      if (!password) {
        return res.json(400, { error: "Password required" });
      }
      const user = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(session.uid).first();
      if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) {
        return res.json(403, { error: "Invalid password" });
      }
      await deleteUserAccount(env, session.uid);
      return res.json(200, { status: "deleted" });
    }

    if (path === "/api/data" && request.method === "GET") {
      const row = await env.DB.prepare("SELECT doc, updated_at FROM user_data WHERE user_id = ?").bind(session.uid).first();
      if (!row) return res.json(404, { error: "No data yet" });
      const doc = parseStoredDoc(row.doc);
      if (!doc) return res.json(500, { error: STORED_DOC_CORRUPT_ERROR });
      return res.json(200, { doc, updatedAt: row.updated_at });
    }

    if (path === "/api/data" && request.method === "PUT") {
      const body = await readJsonBody(request);
      if (!body || typeof body.doc === "undefined") {
        return res.json(400, { error: "Body must be { doc }" });
      }
      const doc = JSON.stringify(body.doc);
      if (enc.encode(doc).length > MAX_DOC_BYTES) {
        return res.json(413, { error: "Document too large" });
      }
      const now = Date.now();
      await env.DB.prepare(
        "INSERT INTO user_data (user_id, doc, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT (user_id) DO UPDATE SET doc = ?2, updated_at = ?3"
      ).bind(session.uid, doc, now).run();
      return res.json(200, { updatedAt: now });
    }

    if (path.startsWith("/api/friends")) {
      return handleFriends(request, env, session, path, res);
    }

    if (path === "/api/tmdb") {
      return handleTmdb(request, env, session, res, ip);
    }

    if (path === "/api/movies/batch") {
      return handleMoviesBatch(request, env, session, ctx, res, ipOf);
    }

    const listResponse = await handleListRoutes(request, env, session, path, res, ip, {
      parseStoredDoc,
      areFriends,
    }, ctx);
    if (listResponse) {
      return listResponse;
    }

    return res.json(404, { error: "Not found" });
  },
};
