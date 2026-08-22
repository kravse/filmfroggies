import test from "node:test";
import assert from "node:assert/strict";
import { changeAccountPassword, hashPassword, verifyPassword } from "./src/index.js";
import { insertSession, sessionIsActive } from "./src/sessions.js";

function mockUserDb(initialHash) {
  let passwordHash = initialHash;
  const sessions = new Map();

  return {
    env: {
      DB: {
        batch(stmts) {
          for (const stmt of stmts) {
            if (stmt.sql.includes("DELETE FROM sessions WHERE expires_at")) {
              const cutoff = stmt.args[0];
              for (const [jti, row] of sessions) {
                if (row.expires_at <= cutoff) sessions.delete(jti);
              }
            } else if (stmt.sql.includes("INSERT INTO sessions")) {
              const [jti, userId, expiresAt, createdAt] = stmt.args;
              sessions.set(jti, { jti, user_id: userId, expires_at: expiresAt, created_at: createdAt });
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
                  if (sql.includes("SELECT password_hash FROM users")) {
                    return passwordHash ? { password_hash: passwordHash } : null;
                  }
                  if (sql.includes("SELECT 1 AS ok FROM sessions")) {
                    const [jti, userId, nowMs] = args;
                    const row = sessions.get(jti);
                    if (row && row.user_id === userId && row.expires_at > nowMs) {
                      return { ok: 1 };
                    }
                    return null;
                  }
                  return null;
                },
                async run() {
                  if (sql.includes("UPDATE users SET password_hash")) {
                    passwordHash = args[0];
                  } else if (sql.includes("DELETE FROM sessions WHERE user_id = ?1 AND jti != ?2")) {
                    const [userId, keepJti] = args;
                    for (const [jti, row] of sessions) {
                      if (row.user_id === userId && jti !== keepJti) {
                        sessions.delete(jti);
                      }
                    }
                  }
                  return { meta: { changes: 1 } };
                },
              };
            },
          };
        },
      },
    },
    getPasswordHash() {
      return passwordHash;
    },
    sessions,
  };
}

test("changeAccountPassword rejects weak and wrong passwords", async () => {
  const hash = await hashPassword("old-password");
  const { env } = mockUserDb(hash);

  const weak = await changeAccountPassword(env, 1, "old-password", "short", "keep");
  assert.equal(weak.ok, false);
  assert.equal(weak.status, 400);

  const wrong = await changeAccountPassword(env, 1, "wrong-password", "new-password-1", "keep");
  assert.equal(wrong.ok, false);
  assert.equal(wrong.status, 403);
});

test("changeAccountPassword updates hash and revokes other sessions", async () => {
  const hash = await hashPassword("old-password");
  const { env, getPasswordHash, sessions } = mockUserDb(hash);
  const nowMs = Date.now();
  await insertSession(env, { jti: "keep", userId: 1, expiresAtMs: nowMs + 60_000 }, nowMs);
  await insertSession(env, { jti: "drop", userId: 1, expiresAtMs: nowMs + 60_000 }, nowMs);

  const result = await changeAccountPassword(env, 1, "old-password", "new-password-1", "keep");
  assert.equal(result.ok, true);
  assert.notEqual(getPasswordHash(), hash);
  assert.equal(await verifyPassword("new-password-1", getPasswordHash()), true);
  assert.equal(await sessionIsActive(env, { jti: "keep", userId: 1 }, nowMs), true);
  assert.equal(await sessionIsActive(env, { jti: "drop", userId: 1 }, nowMs), false);
  assert.equal(sessions.has("keep"), true);
  assert.equal(sessions.has("drop"), false);
});
