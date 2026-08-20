import test from "node:test";
import assert from "node:assert/strict";
import {
  hashInviteCodeHex,
  linkInviteCodeToUser,
  normalizeInviteCode,
  releaseInviteCode,
  reserveInviteCode,
} from "./src/invite-codes.js";

function createInviteDb() {
  const rows = new Map();

  return {
    rows,
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, " ").trim();
      return {
        bind(...args) {
          return {
            async run() {
              if (
                normalized.startsWith(
                  "UPDATE invite_codes SET used_at = ?1 WHERE code_hash = ?2 AND used_at IS NULL",
                )
              ) {
                const [usedAt, codeHash] = args;
                const row = rows.get(codeHash);
                if (!row || row.used_at != null) {
                  return { meta: { changes: 0 } };
                }
                row.used_at = usedAt;
                row.used_by_user_id = null;
                return { meta: { changes: 1 } };
              }
              if (
                normalized.startsWith(
                  "UPDATE invite_codes SET used_at = NULL, used_by_user_id = NULL WHERE code_hash = ?1 AND used_at = ?2 AND used_by_user_id IS NULL",
                )
              ) {
                const [codeHash, usedAt] = args;
                const row = rows.get(codeHash);
                if (!row || row.used_at !== usedAt || row.used_by_user_id != null) {
                  return { meta: { changes: 0 } };
                }
                row.used_at = null;
                row.used_by_user_id = null;
                return { meta: { changes: 1 } };
              }
              if (normalized.startsWith("UPDATE invite_codes SET used_by_user_id = ?1 WHERE code_hash = ?2")) {
                const [userId, codeHash] = args;
                const row = rows.get(codeHash);
                if (!row) {
                  return { meta: { changes: 0 } };
                }
                row.used_by_user_id = userId;
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 0 } };
            },
          };
        },
      };
    },
    seed(codeHash) {
      rows.set(codeHash, { used_at: null, used_by_user_id: null });
    },
  };
}

test("normalizeInviteCode trims and rejects empty values", () => {
  assert.equal(normalizeInviteCode("  abc  "), "abc");
  assert.equal(normalizeInviteCode(""), null);
  assert.equal(normalizeInviteCode(null), null);
});

test("hashInviteCodeHex is stable for the same plaintext", async () => {
  const first = await hashInviteCodeHex("test-code");
  const second = await hashInviteCodeHex(" test-code ");
  assert.equal(first, second);
  assert.match(first, /^[0-9a-f]{64}$/);
});

test("reserveInviteCode rejects missing and unknown codes", async () => {
  const env = { DB: createInviteDb() };
  assert.deepEqual(await reserveInviteCode(env, ""), {
    ok: false,
    reason: "missing",
    codeHash: null,
    reservedAt: null,
  });

  const unknown = await reserveInviteCode(env, "unknown-code");
  assert.equal(unknown.ok, false);
  assert.equal(unknown.reason, "invalid");
});

test("reserveInviteCode consumes a code once and release restores unused reservations", async () => {
  const code = "one-time-code";
  const codeHash = await hashInviteCodeHex(code);
  const db = createInviteDb();
  db.seed(codeHash);
  const env = { DB: db };

  const first = await reserveInviteCode(env, code);
  assert.equal(first.ok, true);
  assert.equal(first.codeHash, codeHash);
  assert.ok(first.reservedAt);

  const second = await reserveInviteCode(env, code);
  assert.equal(second.ok, false);
  assert.equal(second.reason, "invalid");

  await releaseInviteCode(env, codeHash, first.reservedAt);
  const third = await reserveInviteCode(env, code);
  assert.equal(third.ok, true);

  await linkInviteCodeToUser(env, codeHash, 42);
  assert.equal(db.rows.get(codeHash).used_by_user_id, 42);
});
