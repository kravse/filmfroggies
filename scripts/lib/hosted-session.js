/**
 * Opaque session tokens for hosted TMDB access. Signed with HOSTED_SITE_PASSWORD
 * (server-side only); the browser stores the token, never the password.
 */

const crypto = require("node:crypto");

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64url")
    .replace(/=+$/, "");
}

function decodePayload(encoded) {
  if (!encoded || typeof encoded !== "string") {
    return null;
  }
  try {
    const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64url").toString("utf8"));
  } catch (_) {
    return null;
  }
}

function signPayload(secret, encodedPayload) {
  return crypto.createHmac("sha256", String(secret)).update(encodedPayload).digest("base64url");
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function createSessionToken(secret, expiresAtMs = Date.now() + SESSION_LIFETIME_MS) {
  if (!secret) {
    throw new Error("Session secret is required");
  }
  const exp = Number(expiresAtMs);
  if (!Number.isFinite(exp) || exp <= Date.now()) {
    throw new Error("Invalid session expiry");
  }
  const encoded = encodePayload({ exp });
  const signature = signPayload(secret, encoded);
  return `${encoded}.${signature}`;
}

function verifySessionToken(secret, token, nowMs = Date.now()) {
  if (!secret || !token) {
    return { ok: false, reason: "missing" };
  }
  const parts = String(token).split(".");
  if (parts.length !== 2) {
    return { ok: false, reason: "malformed" };
  }
  const [encoded, signature] = parts;
  const expected = signPayload(secret, encoded);
  if (!safeEqual(signature, expected)) {
    return { ok: false, reason: "invalid" };
  }
  const payload = decodePayload(encoded);
  if (!payload || !Number.isFinite(Number(payload.exp))) {
    return { ok: false, reason: "malformed" };
  }
  if (Number(payload.exp) <= nowMs) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true, exp: Number(payload.exp) };
}

function sessionExpiresAtMs(secret, token) {
  const result = verifySessionToken(secret, token);
  return result.ok ? result.exp : null;
}

module.exports = {
  SESSION_LIFETIME_MS,
  createSessionToken,
  verifySessionToken,
  sessionExpiresAtMs,
};
