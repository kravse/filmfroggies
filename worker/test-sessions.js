import test from "node:test";
import assert from "node:assert/strict";
import {
  createSessionToken,
  verifySessionToken,
  generateJti,
  insertSession,
  sessionIsActive,
  revokeSession,
  revokeAllUserSessions,
} from "./src/sessions.js";

function mockDb() {
  const sessions = new Map();
  const statements = [];

  return {
    statements,
    env: {
      DB: {
        batch(stmts) {
          statements.push(...stmts);
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
                  if (sql.includes("DELETE FROM sessions WHERE jti")) {
                    sessions.delete(args[0]);
                  } else if (sql.includes("DELETE FROM sessions WHERE user_id")) {
                    for (const [jti, row] of sessions) {
                      if (row.user_id === args[0]) sessions.delete(jti);
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
    sessions,
  };
}

test("generateJti returns a non-empty UUID-shaped string", () => {
  const jti = generateJti();
  assert.match(jti, /^[0-9a-f-]{36}$/i);
});

test("session token roundtrip with jti", async () => {
  const jti = generateJti();
  const exp = Date.now() + 60_000;
  const token = await createSessionToken("secret", 42, jti, exp);
  const session = await verifySessionToken("secret", token, Date.now());
  assert.deepEqual(session, { uid: 42, jti, exp });
});

test("verifySessionToken rejects missing jti", async () => {
  const enc = new TextEncoder();
  const payload = btoa(JSON.stringify({ uid: 1, exp: Date.now() + 60_000 }))
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
  const token = `${payload}.${sigB64}`;
  assert.equal(await verifySessionToken("secret", token, Date.now()), null);
});

test("insertSession cleans expired rows and inserts active session", async () => {
  const { env, statements, sessions } = mockDb();
  const nowMs = 1_000_000;
  sessions.set("old", { jti: "old", user_id: 1, expires_at: nowMs - 1, created_at: 0 });

  await insertSession(env, { jti: "new", userId: 42, expiresAtMs: nowMs + 1000 }, nowMs);

  assert.equal(statements.length, 2);
  assert.match(statements[0].sql, /DELETE FROM sessions WHERE expires_at/);
  assert.match(statements[1].sql, /INSERT INTO sessions/);
  assert.equal(sessions.has("old"), false);
  assert.equal(sessions.has("new"), true);
});

test("sessionIsActive and revokeSession", async () => {
  const { env } = mockDb();
  const nowMs = Date.now();
  const jti = generateJti();
  await insertSession(env, { jti, userId: 7, expiresAtMs: nowMs + 60_000 }, nowMs);

  assert.equal(await sessionIsActive(env, { jti, userId: 7 }, nowMs), true);
  assert.equal(await sessionIsActive(env, { jti, userId: 8 }, nowMs), false);

  await revokeSession(env, jti);
  assert.equal(await sessionIsActive(env, { jti, userId: 7 }, nowMs), false);
});

test("sessionIsActive accepts uid from verifySessionToken shape", async () => {
  const { env } = mockDb();
  const nowMs = Date.now();
  const jti = generateJti();
  await insertSession(env, { jti, userId: 9, expiresAtMs: nowMs + 60_000 }, nowMs);

  assert.equal(await sessionIsActive(env, { uid: 9, jti, exp: nowMs + 60_000 }, nowMs), true);
  assert.equal(await sessionIsActive(env, { uid: 9, jti: "" }, nowMs), false);
});

test("revokeAllUserSessions removes all rows for user", async () => {
  const { env } = mockDb();
  const nowMs = Date.now();
  await insertSession(env, { jti: "a", userId: 3, expiresAtMs: nowMs + 60_000 }, nowMs);
  await insertSession(env, { jti: "b", userId: 3, expiresAtMs: nowMs + 60_000 }, nowMs);
  await insertSession(env, { jti: "c", userId: 4, expiresAtMs: nowMs + 60_000 }, nowMs);

  await revokeAllUserSessions(env, 3);

  assert.equal(await sessionIsActive(env, { jti: "a", userId: 3 }, nowMs), false);
  assert.equal(await sessionIsActive(env, { jti: "b", userId: 3 }, nowMs), false);
  assert.equal(await sessionIsActive(env, { jti: "c", userId: 4 }, nowMs), true);
});
