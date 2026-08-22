import test from "node:test";
import assert from "node:assert/strict";
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
  generateJti,
  insertAdminSession,
  adminSessionIsActive,
  revokeAdminSession,
} from "./src/admin-sessions.js";

function mockDb() {
  const sessions = new Map();

  return {
    env: {
      DB: {
        batch(stmts) {
          for (const stmt of stmts) {
            if (stmt.sql.includes("DELETE FROM admin_sessions WHERE expires_at")) {
              const cutoff = stmt.args[0];
              for (const [jti, row] of sessions) {
                if (row.expires_at <= cutoff) sessions.delete(jti);
              }
            } else if (stmt.sql.includes("INSERT INTO admin_sessions")) {
              const [jti, expiresAt, createdAt] = stmt.args;
              sessions.set(jti, { jti, expires_at: expiresAt, created_at: createdAt });
            }
          }
          return Promise.resolve([]);
        },
        prepare(sql) {
          return {
            bind(...args) {
              return {
                sql,
                args,
                async first() {
                  if (sql.includes("SELECT 1 AS ok FROM admin_sessions")) {
                    const [jti, nowMs] = args;
                    const row = sessions.get(jti);
                    if (row && row.expires_at > nowMs) {
                      return { ok: 1 };
                    }
                    return null;
                  }
                  return null;
                },
                async run() {
                  if (sql.includes("DELETE FROM admin_sessions WHERE jti")) {
                    sessions.delete(args[0]);
                  }
                  return { meta: { changes: 1 } };
                },
              };
            },
          };
        },
      },
    },
    sessions,
  };
}

test("admin session token roundtrip with jti", async () => {
  const jti = generateJti();
  const exp = Date.now() + 60_000;
  const token = await createAdminSessionToken("secret", jti, exp);
  assert.deepEqual(await verifyAdminSessionToken("secret", token, Date.now()), { jti, exp });
});

test("verifyAdminSessionToken rejects missing jti", async () => {
  const enc = new TextEncoder();
  const payload = btoa(JSON.stringify({ adm: 1, exp: Date.now() + 60_000 }))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode("secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  assert.equal(await verifyAdminSessionToken("secret", `${payload}.${sigB64}`, Date.now()), null);
});

test("insertAdminSession cleans expired rows and inserts active session", async () => {
  const { env, sessions } = mockDb();
  const nowMs = 1_000_000;
  sessions.set("old", { jti: "old", expires_at: nowMs - 1, created_at: 0 });

  await insertAdminSession(env, { jti: "new", expiresAtMs: nowMs + 1000 }, nowMs);

  assert.equal(sessions.has("old"), false);
  assert.equal(sessions.has("new"), true);
});

test("adminSessionIsActive and revokeAdminSession", async () => {
  const { env } = mockDb();
  const nowMs = Date.now();
  const jti = generateJti();
  await insertAdminSession(env, { jti, expiresAtMs: nowMs + 60_000 }, nowMs);

  assert.equal(await adminSessionIsActive(env, { jti }, nowMs), true);
  await revokeAdminSession(env, jti);
  assert.equal(await adminSessionIsActive(env, { jti }, nowMs), false);
});
