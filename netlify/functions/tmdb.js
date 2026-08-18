const {
  verifySessionToken,
} = require("../../scripts/lib/hosted-session");
const {
  buildProxiedTmdbUrl,
  parseProxyRequestQuery,
} = require("../../scripts/lib/tmdb-proxy");

const REQUEST_TIMEOUT_MS = 12_000;
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

function readBearerToken(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(String(header));
  return match ? match[1].trim() : "";
}

function readSitePassword() {
  return String(process.env.HOSTED_SITE_PASSWORD || "");
}

function readTmdbToken() {
  return String(process.env.TMDB_READ_TOKEN || "").trim();
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const sitePassword = readSitePassword();
  const tmdbToken = readTmdbToken();
  if (!sitePassword || !tmdbToken) {
    return jsonResponse(503, { error: "Hosted access is not configured" });
  }

  const sessionToken = readBearerToken(event);
  const session = verifySessionToken(sitePassword, sessionToken);
  if (!session.ok) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  let proxiedUrl;
  try {
    const { pathname, searchParams } = parseProxyRequestQuery(event.queryStringParameters || {});
    proxiedUrl = buildProxiedTmdbUrl(pathname, searchParams);
  } catch (error) {
    return jsonResponse(400, { error: error.message || "Bad request" });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(proxiedUrl, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${tmdbToken}`,
      },
      signal: controller.signal,
    });
    const text = await response.text();
    return {
      statusCode: response.status,
      headers: JSON_HEADERS,
      body: text,
    };
  } catch (error) {
    const message =
      error.name === "AbortError" ? "Upstream request timed out" : "Upstream request failed";
    return jsonResponse(502, { error: message });
  } finally {
    clearTimeout(timer);
  }
};
