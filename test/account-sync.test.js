const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ACCOUNT_API_DIRECT,
  ACCOUNT_API_PROXIED,
  resolveAccountApiBase,
  parseAccountConfig,
  serializeAccountConfig,
  isConnectedAccountConfig,
} = require("../scripts/lib/account-sync");

test("resolveAccountApiBase picks the Worker directly only for local dev", () => {
  assert.equal(resolveAccountApiBase("localhost"), ACCOUNT_API_DIRECT);
  assert.equal(resolveAccountApiBase("127.0.0.1"), ACCOUNT_API_DIRECT);
  assert.equal(resolveAccountApiBase("cinequeue.example.com"), ACCOUNT_API_PROXIED);
  assert.equal(resolveAccountApiBase(""), ACCOUNT_API_PROXIED);
});

test("account config roundtrip", () => {
  const config = { token: "abc.def", email: "a@b.com", userId: 7, displayName: "a" };
  const parsed = parseAccountConfig(serializeAccountConfig(config));
  assert.deepEqual(parsed, config);
  assert.ok(isConnectedAccountConfig(parsed));
});

test("parseAccountConfig rejects incomplete or malformed payloads", () => {
  assert.equal(parseAccountConfig(null), null);
  assert.equal(parseAccountConfig(""), null);
  assert.equal(parseAccountConfig("not json"), null);
  assert.equal(parseAccountConfig(JSON.stringify({ token: "", userId: 1 })), null);
  assert.equal(parseAccountConfig(JSON.stringify({ token: "t" })), null);
  assert.equal(isConnectedAccountConfig(null), false);
});
