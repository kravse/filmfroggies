import test from "node:test";
import assert from "node:assert/strict";
import { deleteUserAccount } from "./src/index.js";

test("deleteUserAccount removes friends, data, and user row", async () => {
  const statements = [];
  const env = {
    DB: {
      batch(stmts) {
        statements.push(...stmts);
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

  await deleteUserAccount(env, 42);

  assert.equal(statements.length, 5);
  assert.match(statements[0].sql, /DELETE FROM sessions/);
  assert.deepEqual(statements[0].args, [42]);
  assert.match(statements[1].sql, /DELETE FROM friend_share_links/);
  assert.match(statements[2].sql, /DELETE FROM friends/);
  assert.deepEqual(statements[2].args, [42]);
  assert.match(statements[3].sql, /DELETE FROM user_data/);
  assert.match(statements[4].sql, /DELETE FROM users/);
});
