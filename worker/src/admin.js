/**
 * Admin API: password gate (ADMIN_PASSWORD secret), short-lived bearer sessions,
 * user management, and one-time invite code generation.
 */

import { createInviteCodes } from "./invite-codes.js";
import { rateLimit, rateLimitBlocked } from "./rate-limit.js";
import { countCollectionMoviesFromJson } from "./user-doc-stats.js";
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
  generateJti,
  insertAdminSession,
  adminSessionIsActive,
  revokeAdminSession,
} from "./admin-sessions.js";

export { createAdminSessionToken, verifyAdminSessionToken } from "./admin-sessions.js";

export const ADMIN_SESSION_LIFETIME_MS = 60 * 60 * 1000;
/** Failed login attempts only — successful login does not consume quota. */
export const ADMIN_LOGIN_RATE_LIMITS = {
  ip: { limit: 3, windowMs: 60 * 60 * 1000 },
  global: { limit: 8, windowMs: 60 * 60 * 1000 },
};
export const MAX_ADMIN_INVITE_BATCH = 20;

const enc = new TextEncoder();

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

export function verifyAdminPassword(env, password) {
  const expected = env.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }
  return timingSafeEqualString(password, expected);
}

export function adminAuthConfigured(env) {
  return Boolean(env.ADMIN_PASSWORD && env.ADMIN_SESSION_SECRET);
}

function readBearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") || "");
  return match ? match[1].trim() : "";
}

async function requireAdmin(request, env) {
  const nowMs = Date.now();
  const session = await verifyAdminSessionToken(
    env.ADMIN_SESSION_SECRET,
    readBearerToken(request),
    nowMs,
  );
  if (!session) {
    return null;
  }
  if (!(await adminSessionIsActive(env, session, nowMs))) {
    return null;
  }
  return session;
}

export function publicAdminUser(row) {
  const savedAt = Number(row.updated_at);
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name || "",
    createdAt: row.created_at,
    movieCount: countCollectionMoviesFromJson(row.doc),
    savedAt: Number.isFinite(savedAt) && savedAt > 0 ? savedAt : null,
  };
}

export async function handleAdminRoutes(request, env, path, res, deps) {
  const { clientIp, readJsonBody, deleteUserAccount } = deps;

  if (path === "/api/admin/login" && request.method === "POST") {
    if (!adminAuthConfigured(env)) {
      return res.json(503, { error: "Admin is not configured" });
    }
    const ip = clientIp(request);
    const ipBlocked = await rateLimitBlocked(env, `admin:ip:${ip}`, ADMIN_LOGIN_RATE_LIMITS.ip);
    if (ipBlocked.blocked) {
      return res.jsonRateLimited(ipBlocked.retryAfterSec);
    }
    const globalBlocked = await rateLimitBlocked(env, "admin:global", ADMIN_LOGIN_RATE_LIMITS.global);
    if (globalBlocked.blocked) {
      return res.jsonRateLimited(globalBlocked.retryAfterSec);
    }

    const body = await readJsonBody(request);
    const password = String(body?.password || "");
    if (!verifyAdminPassword(env, password)) {
      await rateLimit(env, `admin:ip:${ip}`, ADMIN_LOGIN_RATE_LIMITS.ip);
      await rateLimit(env, "admin:global", ADMIN_LOGIN_RATE_LIMITS.global);
      return res.json(401, { error: "Invalid password" });
    }

    const nowMs = Date.now();
    const exp = nowMs + ADMIN_SESSION_LIFETIME_MS;
    const jti = generateJti();
    await insertAdminSession(env, { jti, expiresAtMs: exp }, nowMs);
    const token = await createAdminSessionToken(env.ADMIN_SESSION_SECRET, jti, exp);
    return res.json(200, { token, expiresAt: exp });
  }

  if (!adminAuthConfigured(env)) {
    return res.json(503, { error: "Admin is not configured" });
  }

  const session = await requireAdmin(request, env);
  if (!session) {
    return res.json(401, { error: "Admin login required" });
  }

  if (path === "/api/admin/logout" && request.method === "POST") {
    await revokeAdminSession(env, session.jti);
    return res.json(200, { status: "ok" });
  }

  if (path === "/api/admin/stats" && request.method === "GET") {
    const userRow = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first();
    const inviteRow = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM invite_codes WHERE used_at IS NULL",
    ).first();
    return res.json(200, {
      userCount: Number(userRow?.count) || 0,
      unusedInviteCount: Number(inviteRow?.count) || 0,
      rateLimitIp: clientIp(request),
      proxySignature: deps.proxySignature || null,
    });
  }

  if (path === "/api/admin/users" && request.method === "GET") {
    const result = await env.DB.prepare(
      `SELECT u.id, u.email, u.display_name, u.created_at, d.doc, d.updated_at
       FROM users u
       LEFT JOIN user_data d ON d.user_id = u.id
       ORDER BY u.created_at DESC`,
    ).all();
    const users = (result.results || []).map(publicAdminUser);
    return res.json(200, { users });
  }

  const deleteMatch = /^\/api\/admin\/users\/(\d+)$/.exec(path);
  if (deleteMatch && request.method === "DELETE") {
    const userId = Number(deleteMatch[1]);
    if (!Number.isInteger(userId) || userId < 1) {
      return res.json(400, { error: "Invalid user id" });
    }
    const row = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
    if (!row) {
      return res.json(404, { error: "User not found" });
    }
    await deleteUserAccount(env, userId);
    return res.json(200, { status: "deleted" });
  }

  if (path === "/api/admin/invite-codes" && request.method === "POST") {
    const body = await readJsonBody(request);
    const count = Number(body?.count);
    if (!Number.isInteger(count) || count < 1 || count > MAX_ADMIN_INVITE_BATCH) {
      return res.json(400, {
        error: `count must be an integer from 1 to ${MAX_ADMIN_INVITE_BATCH}`,
      });
    }
    const codes = await createInviteCodes(env, count);
    return res.json(200, { codes });
  }

  return res.json(404, { error: "Not found" });
}
