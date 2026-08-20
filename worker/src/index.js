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

const RATE_WINDOW_MS = 60_000;
const SIGNUP_LIMIT = 3;
const LOGIN_LIMIT = 6;

const enc = new TextEncoder();

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, PUT, POST, DELETE, OPTIONS",
};

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

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function tooManyRequests() {
  return new Response(
    JSON.stringify({ error: "Too many attempts. Wait a minute and try again." }),
    { status: 429, headers: { ...JSON_HEADERS, "retry-after": "60" } },
  );
}

function clientIp(request) {
  return request.headers.get("cf-connecting-ip") || "unknown";
}

/**
 * Fixed window: the first attempt in a window starts the clock, and everything
 * inside that window shares the budget. Decided separately from the storage so
 * the rule itself is testable without a database.
 */
export function rateLimitDecision(row, nowMs, limit, periodMs) {
  if (!row || nowMs - row.window_start >= periodMs) {
    return { blocked: false, startNewWindow: true };
  }
  return { blocked: row.count >= limit, startNewWindow: false };
}

/**
 * Reads before writing so a blocked caller costs a read and no write. That
 * matters under exactly the abuse this exists to stop: D1's free tier allows
 * 5M reads a day but only 100k writes, so counting every rejected attempt
 * would hand an attacker a cheap way to exhaust the database for the day.
 *
 * ponytail: two concurrent attempts can read the same count and both pass,
 * letting a few extra through. Fine for throttling; needs a transaction only
 * if this ever guards something that must be exact.
 */
async function enforceRateLimit(env, key, limit, periodMs) {
  const now = Date.now();
  const row = await env.DB.prepare(
    "SELECT count, window_start FROM auth_attempts WHERE key = ?",
  ).bind(key).first();

  const { blocked, startNewWindow } = rateLimitDecision(row, now, limit, periodMs);
  if (blocked) {
    return true;
  }

  if (startNewWindow) {
    await env.DB.prepare(
      "INSERT INTO auth_attempts (key, count, window_start) VALUES (?1, 1, ?2) ON CONFLICT(key) DO UPDATE SET count = 1, window_start = ?2",
    ).bind(key, now).run();
    // ponytail: opportunistic sweep, no cron. Keys rotate only when an attacker
    // rotates addresses; swap in a scheduled cleanup if the table ever grows.
    if (Math.random() < 0.01) {
      await env.DB.prepare("DELETE FROM auth_attempts WHERE window_start < ?")
        .bind(now - 3_600_000)
        .run();
    }
  } else {
    await env.DB.prepare("UPDATE auth_attempts SET count = count + 1 WHERE key = ?")
      .bind(key)
      .run();
  }
  return false;
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

async function handleAuth(request, env, path) {
  const isSignup = path === "/api/signup";
  const limit = isSignup ? SIGNUP_LIMIT : LOGIN_LIMIT;

  // Throttle on the address before touching the body: hashing a password is
  // the expensive part of both endpoints, so the cheap check has to come first.
  if (await enforceRateLimit(env, `${path}:${clientIp(request)}`, limit, RATE_WINDOW_MS)) {
    return tooManyRequests();
  }

  const body = await readJsonBody(request);
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || "");
  if (!email) return json(400, { error: "Valid email required" });

  // A second bucket per account, so guessing one password from many addresses
  // is throttled even though each address stays under its own limit.
  if (!isSignup && (await enforceRateLimit(env, `login:${email}`, LOGIN_LIMIT, RATE_WINDOW_MS))) {
    return tooManyRequests();
  }

  if (isSignup) {
    if (password.length < 8) return json(400, { error: "Password must be at least 8 characters" });
    const hash = await hashPassword(password);
    let result;
    try {
      result = await env.DB.prepare(
        "INSERT INTO users (email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?) RETURNING id, email, display_name"
      ).bind(email, hash, String(body?.displayName || "").trim() || email.split("@")[0], Date.now()).first();
    } catch (_) {
      return json(409, { error: "An account with that email already exists" });
    }
    return json(201, { user: publicUser(result), ...(await issueToken(env, result.id)) });
  }

  // /api/login
  const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
    return json(401, { error: "Invalid email or password" });
  }
  return json(200, { user: publicUser(user), ...(await issueToken(env, user.id)) });
}

async function handleFriends(request, env, session, path) {
  const uid = session.uid;

  if (path === "/api/friends" && request.method === "GET") {
    const { results } = await env.DB.prepare(
      `SELECT u.id, u.email, u.display_name, f.status,
              CASE WHEN f.user_id = ?1 THEN 'outgoing' ELSE 'incoming' END AS direction
       FROM friends f JOIN users u ON u.id = CASE WHEN f.user_id = ?1 THEN f.friend_id ELSE f.user_id END
       WHERE f.user_id = ?1 OR f.friend_id = ?1`
    ).bind(uid).all();
    return json(200, {
      friends: results.map((r) => ({ ...publicUser(r), status: r.status, direction: r.direction })),
    });
  }

  if (path === "/api/friends/request" && request.method === "POST") {
    const body = await readJsonBody(request);
    const email = normalizeEmail(body?.email);
    if (!email) return json(400, { error: "Valid email required" });
    const target = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (!target || target.id === uid) return json(404, { error: "No user with that email" });
    if (await areFriends(env, uid, target.id)) return json(409, { error: "Already friends" });
    // If they already requested us, treat this as an accept.
    const incoming = await env.DB.prepare(
      "SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending'"
    ).bind(target.id, uid).first();
    if (incoming) {
      await env.DB.prepare("UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ?")
        .bind(target.id, uid).run();
      return json(200, { status: "accepted" });
    }
    await env.DB.prepare(
      "INSERT OR IGNORE INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'pending', ?)"
    ).bind(uid, target.id, Date.now()).run();
    return json(201, { status: "pending" });
  }

  const acceptMatch = /^\/api\/friends\/(\d+)\/accept$/.exec(path);
  if (acceptMatch && request.method === "POST") {
    const requesterId = Number(acceptMatch[1]);
    const { meta } = await env.DB.prepare(
      "UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ? AND status = 'pending'"
    ).bind(requesterId, uid).run();
    return meta.changes ? json(200, { status: "accepted" }) : json(404, { error: "No pending request from that user" });
  }

  const idMatch = /^\/api\/friends\/(\d+)$/.exec(path);
  if (idMatch && request.method === "DELETE") {
    const otherId = Number(idMatch[1]);
    await env.DB.prepare(
      "DELETE FROM friends WHERE (user_id = ?1 AND friend_id = ?2) OR (user_id = ?2 AND friend_id = ?1)"
    ).bind(uid, otherId).run();
    return json(200, { status: "removed" });
  }

  const dataMatch = /^\/api\/friends\/(\d+)\/data$/.exec(path);
  if (dataMatch && request.method === "GET") {
    const friendId = Number(dataMatch[1]);
    if (!(await areFriends(env, uid, friendId))) return json(403, { error: "Not friends with that user" });
    const row = await env.DB.prepare("SELECT doc, updated_at FROM user_data WHERE user_id = ?").bind(friendId).first();
    if (!row) return json(404, { error: "No data yet" });
    return json(200, { doc: JSON.parse(row.doc), updatedAt: row.updated_at });
  }

  return json(404, { error: "Not found" });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
    const path = new URL(request.url).pathname;
    if (!env.SESSION_SECRET) return json(503, { error: "Backend is not configured" });

    if ((path === "/api/signup" || path === "/api/login") && request.method === "POST") {
      return handleAuth(request, env, path);
    }

    const session = await requireUser(request, env);
    if (!session) return json(401, { error: "Not logged in" });

    if (path === "/api/me" && request.method === "GET") {
      const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(session.uid).first();
      return user ? json(200, { user: publicUser(user) }) : json(401, { error: "Account no longer exists" });
    }

    if (path === "/api/data" && request.method === "GET") {
      const row = await env.DB.prepare("SELECT doc, updated_at FROM user_data WHERE user_id = ?").bind(session.uid).first();
      if (!row) return json(404, { error: "No data yet" });
      return json(200, { doc: JSON.parse(row.doc), updatedAt: row.updated_at });
    }

    if (path === "/api/data" && request.method === "PUT") {
      const body = await readJsonBody(request);
      if (!body || typeof body.doc === "undefined") return json(400, { error: "Body must be { doc }" });
      const doc = JSON.stringify(body.doc);
      if (enc.encode(doc).length > MAX_DOC_BYTES) return json(413, { error: "Document too large" });
      const now = Date.now();
      await env.DB.prepare(
        "INSERT INTO user_data (user_id, doc, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT (user_id) DO UPDATE SET doc = ?2, updated_at = ?3"
      ).bind(session.uid, doc, now).run();
      return json(200, { updatedAt: now });
    }

    if (path.startsWith("/api/friends")) {
      return handleFriends(request, env, session, path);
    }

    return json(404, { error: "Not found" });
  },
};
