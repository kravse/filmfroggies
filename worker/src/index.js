/**
 * CineQueue backend: accounts, per-user data doc, friends.
 * Auth mirrors scripts/lib/hosted-session.js: HMAC-signed bearer token,
 * payload now carries { uid, exp }. Secret: SESSION_SECRET (wrangler secret).
 */

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
// ponytail: 100k PBKDF2 iterations fits the free plan's 10ms CPU budget in
// practice (native WebCrypto); bump iterations or move to paid if CF starts
// killing login requests for CPU.
const PBKDF2_ITERATIONS = 100_000;
const MAX_DOC_BYTES = 200_000;
const MAX_DISPLAY_NAME_LENGTH = 64;

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

const RATE_LIMIT_ERROR = "Too many attempts. Try again later.";

/** Matches server.js default PORT and account-sync localhost dev hosts. */
const LOCAL_DEV_PORT = 8743;

export const DEFAULT_ALLOWED_ORIGINS = [
  "https://cinequeue.org",
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

function timingSafeEqualString(a, b) {
  const left = enc.encode(String(a ?? ""));
  const right = enc.encode(String(b ?? ""));
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqualBytes(left, right);
}

/** Signup is allowed only when SIGNUP_INVITE_CODE is set and the caller supplies a match. */
export function verifySignupInviteCode(env, provided) {
  const expected = env?.SIGNUP_INVITE_CODE;
  if (!expected) {
    return { ok: false, reason: "disabled" };
  }
  const code = String(provided ?? "");
  if (!code) {
    return { ok: false, reason: "missing" };
  }
  return {
    ok: timingSafeEqualString(code, expected),
    reason: timingSafeEqualString(code, expected) ? "ok" : "mismatch",
  };
}

async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export async function createSessionToken(secret, uid, expiresAtMs) {
  const payload = toB64url(enc.encode(JSON.stringify({ uid, exp: expiresAtMs })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload));
  return `${payload}.${toB64url(sig)}`;
}

export async function verifySessionToken(secret, token, nowMs) {
  if (!secret || !token) return null;
  const parts = String(token).split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  let expected;
  try {
    expected = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload));
  } catch (_) {
    return null;
  }
  try {
    if (!timingSafeEqualBytes(fromB64url(sig), new Uint8Array(expected))) return null;
    const parsed = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (!Number.isInteger(parsed.uid) || !Number.isFinite(parsed.exp) || parsed.exp <= nowMs) return null;
    return { uid: parsed.uid, exp: parsed.exp };
  } catch (_) {
    return null;
  }
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

/** Prefer forwarded client IP (Netlify proxy); fall back to Cloudflare connecting IP. */
export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first.slice(0, 64);
    }
  }
  const connecting = request.headers.get("CF-Connecting-IP");
  if (connecting) {
    return connecting.trim().slice(0, 64);
  }
  return "unknown";
}

/**
 * Increment a fixed-window counter and report whether this attempt is allowed.
 * A new window starts when none exists or the previous window expired.
 */
export async function rateLimit(env, key, { limit, windowMs }, nowMs = Date.now()) {
  const row = await env.DB.prepare(
    "SELECT count, window_start FROM rate_limits WHERE key = ?1",
  )
    .bind(key)
    .first();

  if (!row || nowMs - row.window_start >= windowMs) {
    await env.DB.prepare(
      "INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2) ON CONFLICT (key) DO UPDATE SET count = 1, window_start = ?2",
    )
      .bind(key, nowMs)
      .run();
    return { allowed: true, retryAfterSec: 0 };
  }

  if (row.count >= limit) {
    const retryAfterSec = Math.ceil((row.window_start + windowMs - nowMs) / 1000);
    return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  await env.DB.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?1").bind(key).run();
  return { allowed: true, retryAfterSec: 0 };
}

/** Check the counter without incrementing (used before login to honor prior failures). */
export async function rateLimitBlocked(env, key, { limit, windowMs }, nowMs = Date.now()) {
  const row = await env.DB.prepare(
    "SELECT count, window_start FROM rate_limits WHERE key = ?1",
  )
    .bind(key)
    .first();

  if (!row || nowMs - row.window_start >= windowMs) {
    return { blocked: false, retryAfterSec: 0 };
  }
  if (row.count < limit) {
    return { blocked: false, retryAfterSec: 0 };
  }
  const retryAfterSec = Math.ceil((row.window_start + windowMs - nowMs) / 1000);
  return { blocked: true, retryAfterSec: Math.max(retryAfterSec, 1) };
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
  return verifySessionToken(env.SESSION_SECRET, readBearerToken(request), Date.now());
}

function normalizeEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

export function normalizeDisplayName(raw, email) {
  const fallback = String(email || "").split("@")[0] || "User";
  const trimmed = String(raw || "").trim();
  const name = trimmed || fallback;
  return name.slice(0, MAX_DISPLAY_NAME_LENGTH);
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
  const exp = Date.now() + SESSION_LIFETIME_MS;
  return { token: await createSessionToken(env.SESSION_SECRET, uid, exp), expiresAt: exp };
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch (_) {
    return null;
  }
}

function publicUser(row) {
  return { id: row.id, email: row.email, displayName: row.display_name };
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

/** Remove a user and all server-side rows that reference them. */
export async function deleteUserAccount(env, uid) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM friends WHERE user_id = ?1 OR friend_id = ?1").bind(uid),
    env.DB.prepare("DELETE FROM user_data WHERE user_id = ?1").bind(uid),
    env.DB.prepare("DELETE FROM users WHERE id = ?1").bind(uid),
  ]);
}

async function handleAuth(request, env, path, res) {
  const body = await readJsonBody(request);
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || "");
  if (!email) return res.json(400, { error: "Valid email required" });

  const ip = clientIp(request);

  if (path === "/api/signup") {
    const invite = verifySignupInviteCode(env, body?.inviteCode);
    if (invite.reason === "disabled") {
      return res.json(503, { error: "Signups are not available" });
    }
    if (!invite.ok) {
      return res.json(201, SIGNUP_ACK);
    }
    if (password.length < 8) return res.json(400, { error: "Password must be at least 8 characters" });
    const limited = await enforceRateLimit(env, `signup:ip:${ip}`, AUTH_RATE_LIMITS.signupIp, res);
    if (limited) return limited;
    const hash = await hashPassword(password);
    const displayName = normalizeDisplayName(body?.displayName, email);
    let result;
    try {
      result = await env.DB.prepare(
        "INSERT INTO users (email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?) RETURNING id, email, display_name"
      ).bind(email, hash, displayName, Date.now()).first();
    } catch (_) {
      return res.json(201, SIGNUP_ACK);
    }
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

async function handleFriends(request, env, session, path, res) {
  const uid = session.uid;

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

export default {
  async fetch(request, env) {
    const res = makeResponder(request, env);
    if (request.method === "OPTIONS") {
      return res.preflight();
    }
    const path = new URL(request.url).pathname;
    if (!env.SESSION_SECRET) {
      return res.json(503, { error: "Backend is not configured" });
    }

    if ((path === "/api/signup" || path === "/api/login") && request.method === "POST") {
      return handleAuth(request, env, path, res);
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

    return res.json(404, { error: "Not found" });
  },
};
