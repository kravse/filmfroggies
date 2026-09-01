import { resolveDisplayName } from "./lib/display-name.js";

const TOKEN_BYTES = 24;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function createFriendShareToken() {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export function normalizeFriendShareToken(value) {
  const token = String(value || "").trim();
  return TOKEN_PATTERN.test(token) ? token : null;
}

export async function hashFriendShareToken(value) {
  const token = normalizeFriendShareToken(value);
  if (!token) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function rotateFriendShareLink(env, userId) {
  const token = createFriendShareToken();
  const tokenHash = await hashFriendShareToken(token);
  await env.DB.prepare(
    `INSERT INTO friend_share_links (user_id, token_hash, updated_at)
     VALUES (?1, ?2, ?3)
     ON CONFLICT (user_id) DO UPDATE SET token_hash = ?2, updated_at = ?3`,
  ).bind(userId, tokenHash, Date.now()).run();
  return token;
}

export async function resolveFriendShareLink(env, value) {
  const tokenHash = await hashFriendShareToken(value);
  if (!tokenHash) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.display_name
     FROM friend_share_links l JOIN users u ON u.id = l.user_id
     WHERE l.token_hash = ?`,
  ).bind(tokenHash).first();
  return row ? { id: Number(row.id), displayName: resolveDisplayName(row) } : null;
}
