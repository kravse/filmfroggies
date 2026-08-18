const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  SESSION_LIFETIME_MS,
  createSessionToken,
  verifySessionToken,
  sessionExpiresAtMs,
} = require("../scripts/lib/hosted-session");

test("createSessionToken and verifySessionToken round-trip", () => {
  const exp = Date.now() + SESSION_LIFETIME_MS;
  const token = createSessionToken("site-password", exp);
  const result = verifySessionToken("site-password", token);
  assert.equal(result.ok, true);
  assert.equal(result.exp, exp);
});

test("verifySessionToken rejects wrong secret", () => {
  const token = createSessionToken("correct", Date.now() + 60_000);
  const result = verifySessionToken("wrong", token);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid");
});

test("verifySessionToken rejects expired token", () => {
  const exp = Date.now() + 60_000;
  const token = createSessionToken("secret", exp);
  const result = verifySessionToken("secret", token, exp + 1);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "expired");
});

test("verifySessionToken rejects tampered signature", () => {
  const token = createSessionToken("secret", Date.now() + 60_000);
  const [payload] = token.split(".");
  const result = verifySessionToken("secret", `${payload}.tampered`);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid");
});

test("verifySessionToken rejects malformed token", () => {
  assert.equal(verifySessionToken("secret", "not-a-token").reason, "malformed");
  assert.equal(verifySessionToken("secret", "").reason, "missing");
});

test("sessionExpiresAtMs returns exp for valid token", () => {
  const exp = Date.now() + 60_000;
  const token = createSessionToken("secret", exp);
  assert.equal(sessionExpiresAtMs("secret", token), exp);
  assert.equal(sessionExpiresAtMs("secret", "bad"), null);
});
