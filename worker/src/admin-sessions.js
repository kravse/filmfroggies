/**
 * Admin session tokens: HMAC-signed bearer payload { adm, jti, exp } plus D1 rows
 * for revocation — same pattern as user sessions in sessions.js, without a user id.
 */

import { generateJti } from "./sessions.js";

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

async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export { generateJti };

export async function createAdminSessionToken(secret, jti, expiresAtMs) {
  const payload = toB64url(enc.encode(JSON.stringify({ adm: 1, jti, exp: expiresAtMs })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload));
  return `${payload}.${toB64url(sig)}`;
}

export async function verifyAdminSessionToken(secret, token, nowMs) {
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
    if (parsed.adm !== 1 || !jti || !Number.isFinite(parsed.exp) || parsed.exp <= nowMs) {
      return null;
    }
    return { jti, exp: parsed.exp };
  } catch (_) {
    return null;
  }
}

export async function insertAdminSession(env, { jti, expiresAtMs }, nowMs) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?1").bind(nowMs),
    env.DB.prepare(
      "INSERT INTO admin_sessions (jti, expires_at, created_at) VALUES (?1, ?2, ?3)",
    ).bind(jti, expiresAtMs, nowMs),
  ]);
}

export async function adminSessionIsActive(env, { jti }, nowMs) {
  if (!jti) {
    return false;
  }
  const row = await env.DB.prepare(
    "SELECT 1 AS ok FROM admin_sessions WHERE jti = ?1 AND expires_at > ?2",
  )
    .bind(jti, nowMs)
    .first();
  return Boolean(row);
}

export async function revokeAdminSession(env, jti) {
  await env.DB.prepare("DELETE FROM admin_sessions WHERE jti = ?1").bind(jti).run();
}
