import test from "node:test";
import assert from "node:assert/strict";
import { verifySignupInviteCode } from "./src/index.js";

const env = { SIGNUP_INVITE_CODE: "friends-only-2026" };

test("verifySignupInviteCode requires a configured secret", () => {
  assert.deepEqual(verifySignupInviteCode({}, "friends-only-2026"), {
    ok: false,
    reason: "disabled",
  });
});

test("verifySignupInviteCode rejects missing and wrong codes", () => {
  assert.deepEqual(verifySignupInviteCode(env, ""), { ok: false, reason: "missing" });
  assert.deepEqual(verifySignupInviteCode(env, "wrong"), {
    ok: false,
    reason: "mismatch",
  });
});

test("verifySignupInviteCode accepts an exact match", () => {
  assert.deepEqual(verifySignupInviteCode(env, "friends-only-2026"), {
    ok: true,
    reason: "ok",
  });
});

test("verifySignupInviteCode uses timing-safe equality", () => {
  assert.equal(verifySignupInviteCode(env, "friends-only-2027").ok, false);
  assert.equal(verifySignupInviteCode(env, "Friends-only-2026").ok, false);
});
