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
import { createInviteCodes } from "./src/invite-codes.js";

test("admin session token roundtrip and rejects user tokens", async () => {
  const exp = Date.now() + 1000;
  const token = await createAdminSessionToken("secret", exp);
  assert.deepEqual(await verifyAdminSessionToken("secret", token, Date.now()), { exp });
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
    DB: makeRateLimitDb(),
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
    DB: makeRateLimitDb(),
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

  const db = {
    prepare(sql) {
      return {
        async first() {
          if (/FROM users/.test(sql)) return { count: 3 };
          if (/FROM invite_codes/.test(sql)) return { count: 2 };
          return null;
        },
      };
    },
  };

  const statsRes = await handleAdminRoutes(
    new Request("https://example.com/api/admin/stats", {
      headers: { authorization: `Bearer ${token}` },
    }),
    { ...env, DB: db },
    "/api/admin/stats",
    json,
    makeDeps(),
  );
  assert.equal(statsRes.status, 200);
  assert.deepEqual(await statsRes.json(), { userCount: 3, unusedInviteCount: 2 });
});

test("admin delete user calls deleteUserAccount", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
  };
  const token = await createAdminSessionToken(env.ADMIN_SESSION_SECRET, Date.now() + 60_000);
  let deletedId = null;
  const db = {
    prepare(sql) {
      return {
        bind(id) {
          return {
            async first() {
              if (/SELECT id FROM users/.test(sql)) {
                return id === 7 ? { id: 7 } : null;
              }
              return null;
            },
          };
        },
      };
    },
  };

  const response = await handleAdminRoutes(
    new Request("https://example.com/api/admin/users/7", {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    }),
    { ...env, DB: db },
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
  };
  const token = await createAdminSessionToken(env.ADMIN_SESSION_SECRET, Date.now() + 60_000);

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

test("admin session token cannot be verified with user session secret", async () => {
  const exp = Date.now() + 60_000;
  const token = await createAdminSessionToken("admin-only-secret", exp);
  assert.equal(await verifyAdminSessionToken("user-session-secret", token, Date.now()), null);
});

test("admin login rate limits failed attempts per IP", async () => {
  const json = makeJsonResponder();
  const env = {
    ADMIN_PASSWORD: "secret-pass",
    ADMIN_SESSION_SECRET: "admin-session-key",
    DB: makeRateLimitDb(),
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

function makeDeps() {
  return {
    clientIp: () => "127.0.0.1",
    readJsonBody: async (request) => request.json(),
    deleteUserAccount: async () => {},
  };
}

function makeRateLimitDb() {
  const rows = new Map();
  return {
    prepare(sql) {
      return {
        bind(key, ...rest) {
          return {
            async first() {
              if (/SELECT count, window_start FROM rate_limits/.test(sql)) {
                return rows.get(key) || null;
              }
              return null;
            },
            async run() {
              if (/INSERT INTO rate_limits/.test(sql)) {
                rows.set(key, { count: 1, window_start: rest[0] ?? Date.now() });
              } else if (/UPDATE rate_limits SET count = count \+ 1/.test(sql)) {
                const row = rows.get(key);
                if (row) row.count += 1;
              }
            },
          };
        },
      };
    },
  };
}
