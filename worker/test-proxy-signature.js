import test from "node:test";
import assert from "node:assert/strict";
import {
  PROXY_SIGNATURE_HEADER,
  describeProxySignature,
  netlifyProxyTrusted,
  proxySignatureStatus,
  verifyNetlifyProxySignature,
} from "./src/proxy-signature.js";

const SECRET = "netlify-proxy-signing-secret";
const NOW = 1_700_000_000_000;

function b64url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function signJws(payload, { secret = SECRET, alg = "HS256" } = {}) {
  const header = b64url(JSON.stringify({ alg, typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(new Uint8Array(signature))}`;
}

function validPayload(overrides = {}) {
  return {
    deploy_context: "production",
    iss: "netlify",
    netlify_id: "abc123",
    site_url: "https://cinequeue.app",
    exp: Math.floor(NOW / 1000) + 60,
    ...overrides,
  };
}

test("verifyNetlifyProxySignature accepts a well-formed token", async () => {
  const payload = validPayload();
  const result = await verifyNetlifyProxySignature(SECRET, await signJws(payload), NOW);
  assert.equal(result?.iss, "netlify");
  assert.equal(result?.netlify_id, "abc123");
});

test("verifyNetlifyProxySignature rejects a token signed with another secret", async () => {
  const token = await signJws(validPayload(), { secret: "wrong-secret" });
  assert.equal(await verifyNetlifyProxySignature(SECRET, token, NOW), null);
});

test("verifyNetlifyProxySignature rejects tampered payloads", async () => {
  const token = await signJws(validPayload());
  const [header, , signature] = token.split(".");
  const forged = `${header}.${b64url(JSON.stringify(validPayload({ netlify_id: "evil" })))}.${signature}`;
  assert.equal(await verifyNetlifyProxySignature(SECRET, forged, NOW), null);
});

test("verifyNetlifyProxySignature rejects expired tokens", async () => {
  const token = await signJws(validPayload({ exp: Math.floor(NOW / 1000) - 1 }));
  assert.equal(await verifyNetlifyProxySignature(SECRET, token, NOW), null);
});

test("verifyNetlifyProxySignature rejects a foreign issuer", async () => {
  const token = await signJws(validPayload({ iss: "attacker" }));
  assert.equal(await verifyNetlifyProxySignature(SECRET, token, NOW), null);
});

test("verifyNetlifyProxySignature rejects alg none and malformed input", async () => {
  const none = await signJws(validPayload(), { alg: "none" });
  assert.equal(await verifyNetlifyProxySignature(SECRET, none, NOW), null);
  assert.equal(await verifyNetlifyProxySignature(SECRET, "not-a-jws", NOW), null);
  assert.equal(await verifyNetlifyProxySignature(SECRET, "", NOW), null);
  assert.equal(await verifyNetlifyProxySignature("", await signJws(validPayload()), NOW), null);
});

test("netlifyProxyTrusted requires a valid signature once the secret is set", async () => {
  const env = { NETLIFY_PROXY_SIGNING_SECRET: SECRET };
  const token = await signJws(validPayload());

  assert.equal(
    await netlifyProxyTrusted(
      env,
      new Request("https://example.com", { headers: { [PROXY_SIGNATURE_HEADER]: token } }),
      NOW,
    ),
    true,
  );
  // A forged x-nf-request-id no longer buys trust.
  assert.equal(
    await netlifyProxyTrusted(
      env,
      new Request("https://example.com", { headers: { "x-nf-request-id": "abc123" } }),
      NOW,
    ),
    false,
  );
  assert.equal(await netlifyProxyTrusted(env, new Request("https://example.com"), NOW), false);
});

test("netlifyProxyTrusted falls back to x-nf-request-id with no secret configured", async () => {
  assert.equal(
    await netlifyProxyTrusted(
      {},
      new Request("https://example.com", { headers: { "x-nf-request-id": "abc123" } }),
      NOW,
    ),
    true,
  );
  assert.equal(await netlifyProxyTrusted({}, new Request("https://example.com"), NOW), false);
});

test("proxySignatureStatus separates a broken proxy from a direct request", () => {
  assert.equal(
    proxySignatureStatus({ configured: true, verified: true, looksProxied: true }),
    "verified",
  );
  // The alarm case: secret set, request proxied, signature absent or bad.
  assert.equal(
    proxySignatureStatus({ configured: true, verified: false, looksProxied: true }),
    "unsigned",
  );
  assert.equal(
    proxySignatureStatus({ configured: false, verified: false, looksProxied: true }),
    "unconfigured",
  );
  // Localhost and direct Worker calls are healthy, not a misconfiguration.
  assert.equal(
    proxySignatureStatus({ configured: true, verified: false, looksProxied: false }),
    "direct",
  );
  assert.equal(
    proxySignatureStatus({ configured: false, verified: false, looksProxied: false }),
    "direct",
  );
});

test("describeProxySignature reports the live state of a request", () => {
  const env = { NETLIFY_PROXY_SIGNING_SECRET: SECRET };
  const proxied = new Request("https://example.com", { headers: { "x-nf-request-id": "abc123" } });

  assert.deepEqual(describeProxySignature(env, proxied, true), {
    configured: true,
    verified: true,
    looksProxied: true,
    status: "verified",
  });
  assert.equal(describeProxySignature(env, proxied, false).status, "unsigned");
  assert.equal(describeProxySignature({}, proxied, true).status, "verified");
  assert.equal(describeProxySignature({}, proxied, false).status, "unconfigured");
  assert.equal(
    describeProxySignature(env, new Request("https://example.com"), false).status,
    "direct",
  );
});

test("describeProxySignature treats a verified request as proxied without x-nf-request-id", () => {
  const described = describeProxySignature(
    { NETLIFY_PROXY_SIGNING_SECRET: SECRET },
    new Request("https://example.com"),
    true,
  );
  assert.equal(described.looksProxied, true);
  assert.equal(described.status, "verified");
});
