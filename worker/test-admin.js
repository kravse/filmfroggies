import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_SESSION_LIFETIME_MS,
  ADMIN_LOGIN_RATE_LIMITS,
  createAdminSessionToken,
  verifyAdminSessionToken,
  verifyAdminPassword,
  adminAuthConfigured,
  handleAdminRoutes,
  MAX_ADMIN_INVITE_BATCH,
} from "./src/admin.js";
import {
  generateJti,
  insertAdminSession,
} from "./src/admin-sessions.js";
import { createInviteCodes } from "./src/invite-codes.js";
import {
  countCollectionMovies,
  countCollectionMoviesFromJson,
} from "./src/user-doc-stats.js";

test("admin session token roundtrip and rejects user tokens", async () => {
  const jti = generateJti();
  const exp = Date.now() + 1000;
  const token = await createAdminSessionToken("secret", jti, exp);
  assert.deepEqual(await verifyAdminSessionToken("secret", token, Date.now()), { jti, exp });
  assert.equal(await verifyAdminSessionToken("wrong", token, Date.now()), null);
  assert.equal(await verifyAdminSessionToken("secret", token, Date.now() + 2000), null);

  const userPayload = btoa(JSON.stringify({ uid: 1, exp }))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  assert.equal(await verifyAdminSessionToken("secret", `${userPayload}.fake`, Date.now()), null);
});

test("verifyAdminPassword uses timing-safe compare", () => {
  assert.equal(verifyAdminPassword({ ADMIN_PASSWORD: "hunter2" }, "hunter2"), true);
  assert.equal(verifyAdminPassword({ ADMIN_PASSWORD: "hunter2" }, "wrong"), false);
  assert.equal(verifyAdminPassword({}, "hunter2"), false);
});

test("adminAuthConfigured requires password and session secret", () => {
  assert.equal(adminAuthConfigured({}), false);
  assert.equal(adminAuthConfigured({ ADMIN_PASSWORD: "x" }), false);
  assert.equal(adminAuthConfigured({ ADMIN_SESSION_SECRET: "y" }), false);
  assert.equal(adminAuthConfigured({ ADMIN_PASSWORD: "x", ADMIN_SESSION_SECRET: "y" }), true);
});

test("admin login rejects missing configuration", async () => {
  const res = makeJsonResponder();
  const response = await handleAdminRoutes(
    new Request("https://example.com/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "x" }),
    }),
    {},
    "/api/admin/login",
    res,
    makeDeps(),
  );
  assert.equal(response.status, 503);
});

test("admin login issues token for valid password", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
    DB: makeAdminTestDb(),
  };
  const response = await handleAdminRoutes(
    new Request("https://example.com/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "secret-pass" }),
    }),
    env,
    "/api/admin/login",
    json,
    makeDeps(),
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.token);
  assert.ok(body.expiresAt > Date.now());
  assert.ok(body.expiresAt <= Date.now() + ADMIN_SESSION_LIFETIME_MS + 1000);
});

test("admin stats requires bearer token", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
    DB: makeAdminTestDb(),
  };
  const unauthorized = await handleAdminRoutes(
    new Request("https://example.com/api/admin/stats"),
    env,
    "/api/admin/stats",
    json,
    makeDeps(),
  );
  assert.equal(unauthorized.status, 401);

  const loginRes = await handleAdminRoutes(
    new Request("https://example.com/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "secret-pass" }),
    }),
    env,
    "/api/admin/login",
    json,
    makeDeps(),
  );
  const { token } = await loginRes.json();

  const statsRes = await handleAdminRoutes(
    new Request("https://example.com/api/admin/stats", {
      headers: { authorization: `Bearer ${token}` },
    }),
    env,
    "/api/admin/stats",
    json,
    makeDeps(),
  );
  assert.equal(statsRes.status, 200);
  assert.deepEqual(await statsRes.json(), {
    userCount: 3,
    unusedInviteCount: 2,
    rateLimitIp: "127.0.0.1",
    proxySignature: null,
  });
});

test("admin stats reports the proxy signature diagnostic", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
    DB: makeAdminTestDb(),
  };
  const token = await issueAdminSession(env, env.ADMIN_SESSION_SECRET);
  const proxySignature = {
    configured: true,
    verified: false,
    looksProxied: true,
    status: "unsigned",
  };

  const response = await handleAdminRoutes(
    new Request("https://example.com/api/admin/stats", {
      headers: { authorization: `Bearer ${token}` },
    }),
    env,
    "/api/admin/stats",
    json,
    makeDeps({ clientIp: () => "198.51.100.7", proxySignature }),
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.proxySignature, proxySignature);
  assert.equal(body.rateLimitIp, "198.51.100.7");
  assert.equal(body.userCount, 3);
});

test("admin delete user calls deleteUserAccount", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
    DB: makeAdminTestDb({ userIds: [7] }),
  };
  const token = await issueAdminSession(env, env.ADMIN_SESSION_SECRET);
  let deletedId = null;

  const response = await handleAdminRoutes(
    new Request("https://example.com/api/admin/users/7", {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    }),
    env,
    "/api/admin/users/7",
    json,
    {
      ...makeDeps(),
      deleteUserAccount: async (_env, uid) => {
        deletedId = uid;
      },
    },
  );
  assert.equal(response.status, 200);
  assert.equal(deletedId, 7);
});

test("admin invite batch validates count", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
    DB: makeAdminTestDb(),
  };
  const token = await issueAdminSession(env, env.ADMIN_SESSION_SECRET);

  const bad = await handleAdminRoutes(
    new Request("https://example.com/api/admin/invite-codes", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ count: MAX_ADMIN_INVITE_BATCH + 1 }),
    }),
    env,
    "/api/admin/invite-codes",
    json,
    makeDeps(),
  );
  assert.equal(bad.status, 400);
});

test("countCollectionMovies counts unique ids across preset and custom lists", () => {
  assert.equal(countCollectionMovies(null), 0);
  assert.equal(
    countCollectionMovies({
      lists: [
        { id: "watched", movieIds: [1, 2] },
        { id: "watchlist", movieIds: [2, 3] },
      ],
      customLists: [{ id: "a", movieIds: [3, 4] }],
    }),
    4,
  );
  assert.equal(
    countCollectionMoviesFromJson(JSON.stringify({ lists: [{ id: "watched", movieIds: [10] }] })),
    1,
  );
  assert.equal(countCollectionMoviesFromJson("{not json"), 0);
});

test("admin session token cannot be verified with user session secret", async () => {
  const jti = generateJti();
  const exp = Date.now() + 60_000;
  const token = await createAdminSessionToken("admin-only-secret", jti, exp);
  assert.equal(await verifyAdminSessionToken("user-session-secret", token, Date.now()), null);
});

test("admin logout revokes the session row", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
    DB: makeAdminTestDb(),
  };
  const token = await issueAdminSession(env, env.ADMIN_SESSION_SECRET);

  const logoutRes = await handleAdminRoutes(
    new Request("https://example.com/api/admin/logout", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    }),
    env,
    "/api/admin/logout",
    json,
    makeDeps(),
  );
  assert.equal(logoutRes.status, 200);

  const statsRes = await handleAdminRoutes(
    new Request("https://example.com/api/admin/stats", {
      headers: { authorization: `Bearer ${token}` },
    }),
    env,
    "/api/admin/stats",
    json,
    makeDeps(),
  );
  assert.equal(statsRes.status, 401);
});

test("admin login rate limits failed attempts per IP", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
    DB: makeAdminTestDb(),
  };
  const limits = ADMIN_LOGIN_RATE_LIMITS.ip;

  for (let i = 0; i < limits.limit; i += 1) {
    const response = await handleAdminRoutes(
      new Request("https://example.com/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: "wrong" }),
      }),
      env,
      "/api/admin/login",
      json,
      makeDeps(),
    );
    assert.equal(response.status, 401);
  }

  const blocked = await handleAdminRoutes(
    new Request("https://example.com/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "wrong" }),
    }),
    env,
    "/api/admin/login",
    json,
    makeDeps(),
  );
  assert.equal(blocked.status, 429);
});

test("createInviteCodes inserts hashes for each code", async () => {
  const batches = [];
  const env = {
    DB: {
      batch(stmts) {
        batches.push(stmts);
        return Promise.resolve([]);
      },
      prepare(sql) {
        return {
          bind(...args) {
            return { sql, args };
          },
        };
      },
    },
  };

  const codes = await createInviteCodes(env, 2);
  assert.equal(codes.length, 2);
  assert.equal(batches.length, 1);
  assert.equal(batches[0].length, 2);
  assert.match(batches[0][0].sql, /INSERT INTO invite_codes/);
});

function makeJsonResponder() {
  return {
    json(status, body) {
      return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      });
    },
    jsonRateLimited() {
      return new Response(JSON.stringify({ error: "rate limited" }), { status: 429 });
    },
  };
}

function makeDeps(overrides = {}) {
  return {
    clientIp: () => "127.0.0.1",
    readJsonBody: async (request) => request.json(),
    deleteUserAccount: async () => {},
    ...overrides,
  };
}

function makeAdminTestDb(options = {}) {
  const rateRows = new Map();
  const adminSessions = new Map();
  const userIds = new Set(options.userIds || []);

  return {
    batch(stmts) {
      for (const stmt of stmts) {
        if (stmt.sql?.includes("DELETE FROM admin_sessions WHERE expires_at")) {
          const cutoff = stmt.args[0];
          for (const [jti, row] of adminSessions) {
            if (row.expires_at <= cutoff) adminSessions.delete(jti);
          }
        } else if (stmt.sql?.includes("INSERT INTO admin_sessions")) {
          const [jti, expiresAt, createdAt] = stmt.args;
          adminSessions.set(jti, { jti, expires_at: expiresAt, created_at: createdAt });
        }
      }
      return Promise.resolve([]);
    },
    prepare(sql) {
      const query = (...args) => ({
        sql,
        args,
        async first() {
          if (/SELECT count, window_start FROM rate_limits/.test(sql)) {
            return rateRows.get(args[0]) || null;
          }
          if (/SELECT 1 AS ok FROM admin_sessions/.test(sql)) {
            const [jti, nowMs] = args;
            const row = adminSessions.get(jti);
            return row && row.expires_at > nowMs ? { ok: 1 } : null;
          }
          if (/FROM users/.test(sql) && /COUNT/.test(sql)) return { count: 3 };
          if (/FROM invite_codes/.test(sql)) return { count: 2 };
          if (/SELECT id FROM users WHERE id/.test(sql)) {
            return userIds.has(args[0]) ? { id: args[0] } : null;
          }
          return null;
        },
        async all() {
          return { results: [] };
        },
        async run() {
          if (/INSERT INTO rate_limits/.test(sql)) {
            rateRows.set(args[0], { count: 1, window_start: args[1] ?? Date.now() });
          } else if (/UPDATE rate_limits SET count = count \+ 1/.test(sql)) {
            const row = rateRows.get(args[0]);
            if (row) row.count += 1;
          } else if (/DELETE FROM admin_sessions WHERE jti/.test(sql)) {
            adminSessions.delete(args[0]);
          }
        },
      });
      const stmt = query();
      return {
        bind: (...args) => query(...args),
        first: () => stmt.first(),
        all: () => stmt.all(),
        run: () => stmt.run(),
      };
    },
  };
}

async function issueAdminSession(env, secret, nowMs = Date.now()) {
  const jti = generateJti();
  const exp = nowMs + 60_000;
  await insertAdminSession(env, { jti, expiresAtMs: exp }, nowMs);
  return createAdminSessionToken(secret, jti, exp);
}

function makeRateLimitDb() {
  return makeAdminTestDb();
}
