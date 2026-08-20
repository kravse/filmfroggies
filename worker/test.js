import test from "node:test";
import assert from "node:assert/strict";
import {
  createSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  rateLimitDecision,
} from "./src/index.js";

test("session token roundtrip, tamper, expiry", async () => {
  const token = await createSessionToken("secret", 42, Date.now() + 1000);
  assert.equal((await verifySessionToken("secret", token, Date.now())).uid, 42);
  assert.equal(await verifySessionToken("wrong-secret", token, Date.now()), null);
  assert.equal(await verifySessionToken("secret", token.slice(0, -2) + "xx", Date.now()), null);
  assert.equal(await verifySessionToken("secret", token, Date.now() + 2000), null);
  assert.equal(await verifySessionToken("secret", "garbage", Date.now()), null);
});

test("password hash and verify", async () => {
  const hash = await hashPassword("hunter2hunter2");
  assert.ok(await verifyPassword("hunter2hunter2", hash));
  assert.equal(await verifyPassword("wrong-password", hash), false);
  assert.equal(await verifyPassword("hunter2hunter2", "not.a.hash"), false);
});

test("rate limit opens a window for a key with no history", () => {
  const d = rateLimitDecision(null, 1000, 3, 60_000);
  assert.deepEqual(d, { blocked: false, startNewWindow: true });
});

test("rate limit allows up to the limit, then blocks inside the window", () => {
  const at = (count) => rateLimitDecision({ count, window_start: 1000 }, 5000, 3, 60_000);
  assert.equal(at(1).blocked, false);
  assert.equal(at(2).blocked, false);
  assert.equal(at(3).blocked, true, "the limit-th attempt is already spent");
  assert.equal(at(9).blocked, true);
});

test("rate limit resets once the window has elapsed", () => {
  const row = { count: 99, window_start: 1000 };
  assert.deepEqual(rateLimitDecision(row, 1000 + 60_000, 3, 60_000), {
    blocked: false,
    startNewWindow: true,
  });
  // One millisecond short of the window is still inside it.
  assert.equal(rateLimitDecision(row, 1000 + 59_999, 3, 60_000).blocked, true);
});
