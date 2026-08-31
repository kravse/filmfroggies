import test from "node:test";
import assert from "node:assert/strict";
import { setAccountDisplayName } from "./src/index.js";

/** Mock D1 whose UPDATE honours a case-insensitive unique index on display_name. */
function mockDb(rows) {
  const users = new Map(rows.map((row) => [row.id, { ...row }]));
  return {
    users,
    env: {
      DB: {
        prepare(sql) {
          return {
            bind(...args) {
              return {
                async first() {
                  if (!sql.includes("UPDATE users SET display_name")) {
                    return null;
                  }
                  const [displayName, userId] = args;
                  const user = users.get(userId);
                  if (!user) return null;
                  const taken = [...users.values()].some(
                    (other) =>
                      other.id !== userId &&
                      other.display_name &&
                      displayName &&
                      other.display_name.toLowerCase() === String(displayName).toLowerCase(),
                  );
                  if (taken) {
                    throw new Error("UNIQUE constraint failed: users.display_name");
                  }
                  user.display_name = displayName;
                  return { id: user.id, email: user.email, display_name: user.display_name };
                },
              };
            },
          };
        },
      },
    },
  };
}

const seed = () => [
  { id: 1, email: "jared987@gmail.com", display_name: null },
  { id: 2, email: "sam@mail.com", display_name: "BadMovieHomie" },
];

test("setAccountDisplayName stores a valid handle", async () => {
  const { env, users } = mockDb(seed());
  const result = await setAccountDisplayName(env, 1, "  filmfroggie  ");
  assert.equal(result.ok, true);
  assert.equal(result.user.display_name, "filmfroggie");
  assert.equal(users.get(1).display_name, "filmfroggie");
});

test("setAccountDisplayName rejects malformed names with a reason", async () => {
  const { env, users } = mockDb(seed());
  const result = await setAccountDisplayName(env, 1, "bad movie homie");
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.match(result.error, /Letters, numbers/);
  assert.equal(users.get(1).display_name, null);
});

test("setAccountDisplayName reports a taken name, case-insensitively", async () => {
  const { env, users } = mockDb(seed());
  const result = await setAccountDisplayName(env, 1, "badmoviehomie");
  assert.equal(result.ok, false);
  assert.equal(result.status, 409);
  assert.equal(result.error, "That display name is taken");
  assert.equal(users.get(1).display_name, null);
});

test("setAccountDisplayName clears the name when the value is empty", async () => {
  const { env, users } = mockDb(seed());
  const result = await setAccountDisplayName(env, 2, "   ");
  assert.equal(result.ok, true);
  assert.equal(result.user.display_name, null);
  assert.equal(users.get(2).display_name, null);
});

test("setAccountDisplayName reports a deleted account", async () => {
  const { env } = mockDb(seed());
  const result = await setAccountDisplayName(env, 99, "someone");
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
});
