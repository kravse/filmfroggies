/**
 * Netlify signed proxy redirects: verify the HS256 x-nf-sign JWS so the Worker
 * can tell traffic that really came through Netlify from a direct request that
 * forged x-forwarded-for. Only that proof lets clientIp() trust the header.
 *
 * Payload shape from Netlify:
 * { deploy_context, exp, iss: "netlify", netlify_id, site_url }
 */

export const PROXY_SIGNATURE_HEADER = "x-nf-sign";
const EXPECTED_ISSUER = "netlify";

const enc = new TextEncoder();

function fromB64url(str) {
  const padded = str.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (str.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function timingSafeEqualBytes(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

/** Verify a Netlify JWS. Returns the payload on success, null on any failure. */
export async function verifyNetlifyProxySignature(secret, token, nowMs) {
  if (!secret || !token) return null;
  const parts = String(token).split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  let expected;
  try {
    expected = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(`${header}.${payload}`));
  } catch (_) {
    return null;
  }
  try {
    if (!timingSafeEqualBytes(fromB64url(signature), new Uint8Array(expected))) return null;
    const parsedHeader = JSON.parse(new TextDecoder().decode(fromB64url(header)));
    if (parsedHeader.alg !== "HS256") return null;
    const parsed = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (parsed.iss !== EXPECTED_ISSUER) return null;
    // exp is seconds since epoch, unlike our own session tokens.
    if (!Number.isFinite(parsed.exp) || parsed.exp * 1000 <= nowMs) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

/**
 * Whether x-forwarded-for may be believed for this request.
 *
 * With no signing secret configured we fall back to the old x-nf-request-id
 * check: without it every real user behind the Netlify proxy would collapse
 * into a handful of edge IPs and share the login rate limit, which locks out
 * legitimate traffic. Setting the secret on both Netlify and the Worker is what
 * actually closes the spoofing hole.
 */
export async function netlifyProxyTrusted(env, request, nowMs = Date.now()) {
  const secret = String(env?.NETLIFY_PROXY_SIGNING_SECRET || "").trim();
  if (!secret) {
    return Boolean(request.headers.get("x-nf-request-id"));
  }
  const payload = await verifyNetlifyProxySignature(
    secret,
    request.headers.get(PROXY_SIGNATURE_HEADER),
    nowMs,
  );
  return Boolean(payload);
}

/**
 * Which of the four states this request is in.
 *
 * `unsigned` is the one that matters: the secret is set but the signature did
 * not verify, so every visitor collapses into Netlify's edge IP and shares one
 * rate-limit bucket. Because the per-IP caps are only 1-2x the per-user caps,
 * that stays invisible to a single user and only shows up as other people
 * getting 429s, which is why the admin dashboard surfaces it.
 */
export function proxySignatureStatus({ configured, verified, looksProxied }) {
  if (verified) {
    return "verified";
  }
  if (!looksProxied) {
    return "direct";
  }
  return configured ? "unsigned" : "unconfigured";
}

/** Admin-only diagnostic. Never feeds a trust decision. */
export function describeProxySignature(env, request, verified) {
  const configured = Boolean(String(env?.NETLIFY_PROXY_SIGNING_SECRET || "").trim());
  // x-nf-request-id is forgeable, so it only labels the diagnostic — it can
  // make the report say "unsigned" but never grants trust.
  const looksProxied = Boolean(verified || request.headers.get("x-nf-request-id"));
  return {
    configured,
    verified: Boolean(verified),
    looksProxied,
    status: proxySignatureStatus({ configured, verified, looksProxied }),
  };
}
