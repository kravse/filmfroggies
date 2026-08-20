import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_RATE_LIMITS,
  clientIp,
  rateLimit,
  rateLimitBlocked,
} from "./src/index.js";

function createMockDb() {
  const rows = new Map();

  return {
    rows,
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, " ").trim();
      return {
        bind(...args) {
          return {
            async first() {
              if (normalized.startsWith("SELECT count, window_start FROM rate_limits")) {
                const key = args[0];
                return rows.get(key) || null;
              }
              return null;
            },
            async run() {
              if (normalized.includes("INSERT INTO rate_limits")) {
                const [key, windowStart] = args;
                rows.set(key, { count: 1, window_start: windowStart });
                return { meta: { changes: 1 } };
              }
              if (normalized.startsWith("UPDATE rate_limits SET count = count + 1")) {
                const [key] = args;
                const row = rows.get(key);
                if (row) {
                  row.count += 1;
                }
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 0 } };
            },
          };
        },
      };
    },
  };
}

test("clientIp prefers x-forwarded-for then CF-Connecting-IP", () => {
  assert.equal(
    clientIp(
      new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "203.0.113.5, 10.0.0.1",
          "CF-Connecting-IP": "198.51.100.2",
        },
      }),
    ),
    "203.0.113.5",
  );
  assert.equal(
    clientIp(new Request("https://example.com", { headers: { "CF-Connecting-IP": "198.51.100.2" } })),
    "198.51.100.2",
  );
  assert.equal(clientIp(new Request("https://example.com")), "unknown");
});

test("rateLimit allows up to limit then blocks until window expires", async () => {
  const db = createMockDb();
  const env = { DB: db };
  const config = { limit: 3, windowMs: 60_000 };
  const now = 1_700_000_000_000;

  assert.equal((await rateLimit(env, "login:ip:test", config, now)).allowed, true);
  assert.equal((await rateLimit(env, "login:ip:test", config, now + 1)).allowed, true);
  assert.equal((await rateLimit(env, "login:ip:test", config, now + 2)).allowed, true);
  const blocked = await rateLimit(env, "login:ip:test", config, now + 3);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec > 0);

  const afterWindow = await rateLimit(env, "login:ip:test", config, now + config.windowMs);
  assert.equal(afterWindow.allowed, true);
  assert.equal(db.rows.get("login:ip:test").count, 1);
});

test("rateLimitBlocked checks without incrementing", async () => {
  const db = createMockDb();
  const env = { DB: db };
  const config = AUTH_RATE_LIMITS.loginEmailFail;
  const now = 2_000_000_000_000;

  for (let i = 0; i < config.limit; i++) {
    assert.equal((await rateLimit(env, "login:email:a@b.com", config, now + i)).allowed, true);
  }
  assert.equal(
    (await rateLimitBlocked(env, "login:email:a@b.com", config, now + config.limit)).blocked,
    true,
  );
  assert.equal(db.rows.get("login:email:a@b.com").count, config.limit);
});
