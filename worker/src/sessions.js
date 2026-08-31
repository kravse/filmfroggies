/**
 * User session tokens: HMAC-signed bearer payload { uid, jti, exp } plus D1 rows for revocation.
 */

const enc = new TextEncoder();

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

let cachedHmacKey = null;
let cachedHmacSecret = "";

async function hmacKey(secret) {
  if (cachedHmacSecret === secret && cachedHmacKey) {
    return cachedHmacKey;
  }
  cachedHmacSecret = secret;
  cachedHmacKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return cachedHmacKey;
}

export function generateJti() {
  return crypto.randomUUID();
}

export async function createSessionToken(secret, uid, jti, expiresAtMs) {
  const payload = toB64url(enc.encode(JSON.stringify({ uid, jti, exp: expiresAtMs })));
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
    const jti = typeof parsed.jti === "string" ? parsed.jti.trim() : "";
    if (!Number.isInteger(parsed.uid) || !jti || !Number.isFinite(parsed.exp) || parsed.exp <= nowMs) {
      return null;
    }
    return { uid: parsed.uid, jti, exp: parsed.exp };
  } catch (_) {
    return null;
  }
}

export async function insertSession(env, { jti, userId, expiresAtMs }, nowMs) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?1").bind(nowMs),
    env.DB.prepare(
      "INSERT INTO sessions (jti, user_id, expires_at, created_at) VALUES (?1, ?2, ?3, ?4)",
    ).bind(jti, userId, expiresAtMs, nowMs),
  ]);
}

export async function sessionIsActive(env, { jti, userId, uid }, nowMs) {
  const resolvedUserId = userId ?? uid;
  if (!jti || !Number.isInteger(resolvedUserId)) {
    return false;
  }
  const row = await env.DB.prepare(
    "SELECT 1 AS ok FROM sessions WHERE jti = ?1 AND user_id = ?2 AND expires_at > ?3",
  )
    .bind(jti, resolvedUserId, nowMs)
    .first();
  return Boolean(row);
}

export async function revokeSession(env, jti) {
  await env.DB.prepare("DELETE FROM sessions WHERE jti = ?1").bind(jti).run();
}

export async function revokeAllUserSessions(env, userId) {
  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?1").bind(userId).run();
}

export async function revokeOtherUserSessions(env, userId, keepJti) {
  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?1 AND jti != ?2")
    .bind(userId, keepJti)
    .run();
}
