import test from "node:test";
import assert from "node:assert/strict";
import {
  createFriendShareToken,
  hashFriendShareToken,
  normalizeFriendShareToken,
  resolveFriendShareLink,
  rotateFriendShareLink,
} from "./src/friend-share-links.js";

test("friend share tokens are opaque, URL-safe, and hashable", async () => {
  const token = createFriendShareToken();
  assert.match(token, /^[A-Za-z0-9_-]{32}$/);
  assert.equal(normalizeFriendShareToken(token), token);
  assert.equal(normalizeFriendShareToken("bad"), null);
  assert.match(await hashFriendShareToken(token), /^[a-f0-9]{64}$/);
});

test("rotate stores only the token hash", async () => {
  let bound = null;
  const env = { DB: { prepare: () => ({ bind: (...args) => ({ run: async () => { bound = args; } }) }) } };
  const token = await rotateFriendShareLink(env, 7);
  assert.equal(bound[0], 7);
  assert.notEqual(bound[1], token);
  assert.match(bound[1], /^[a-f0-9]{64}$/);
});

test("resolve exposes only id and resolved display name", async () => {
  const token = createFriendShareToken();
  const env = { DB: { prepare: () => ({ bind: () => ({ first: async () => ({ id: 3, email: "sam@example.com", display_name: null }) }) }) } };
  assert.deepEqual(await resolveFriendShareLink(env, token), { id: 3, displayName: "sam" });
  assert.equal(await resolveFriendShareLink(env, "invalid"), null);
});
