import test from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken, hashPassword, verifyPassword } from "./src/index.js";

test("session token roundtrip, tamper, expiry", async () => {
  const jti = crypto.randomUUID();
  const token = await createSessionToken("secret", 42, jti, Date.now() + 1000);
  const session = await verifySessionToken("secret", token, Date.now());
  assert.equal(session.uid, 42);
  assert.equal(session.jti, jti);
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
