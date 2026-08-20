import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ALLOWED_ORIGINS,
  allowedOrigins,
  corsHeaders,
} from "./src/index.js";

test("DEFAULT_ALLOWED_ORIGINS includes production sites and local dev", () => {
  assert.ok(DEFAULT_ALLOWED_ORIGINS.includes("https://filmfroggies.com"));
  assert.ok(DEFAULT_ALLOWED_ORIGINS.includes("https://www.filmfroggies.com"));
  assert.ok(DEFAULT_ALLOWED_ORIGINS.includes("http://localhost:8743"));
  assert.ok(DEFAULT_ALLOWED_ORIGINS.includes("http://127.0.0.1:8743"));
  assert.ok(!DEFAULT_ALLOWED_ORIGINS.includes("https://cinequeue.org"));
});

test("corsHeaders reflects allowlisted Origin only", () => {
  const env = {};
  const allowed = corsHeaders(
    new Request("https://example.com", { headers: { Origin: "http://localhost:8743" } }),
    env,
  );
  assert.equal(allowed["access-control-allow-origin"], "http://localhost:8743");
  assert.equal(allowed.vary, "Origin");

  const blocked = corsHeaders(
    new Request("https://example.com", { headers: { Origin: "https://evil.com" } }),
    env,
  );
  assert.equal(blocked["access-control-allow-origin"], undefined);
});

test("allowedOrigins merges ALLOWED_ORIGINS env extras", () => {
  const set = allowedOrigins({ ALLOWED_ORIGINS: "https://preview.example.com, https://staging.example.com" });
  assert.ok(set.has("https://filmfroggies.com"));
  assert.ok(set.has("https://preview.example.com"));
  assert.ok(set.has("https://staging.example.com"));
});
