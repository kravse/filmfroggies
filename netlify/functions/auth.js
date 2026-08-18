const crypto = require("node:crypto");

const {
  createSessionToken,
} = require("../../scripts/lib/hosted-session");

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function safeEqualString(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function readSitePassword() {
  return String(process.env.HOSTED_SITE_PASSWORD || "");
}

function parseJsonBody(event) {
  if (!event.body) {
    return null;
  }
  try {
    return JSON.parse(event.body);
  } catch (_) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const sitePassword = readSitePassword();
  if (!sitePassword) {
    return jsonResponse(503, { error: "Hosted access is not configured" });
  }

  const body = parseJsonBody(event);
  const password = String(body?.password || "");
  if (!password || !safeEqualString(password, sitePassword)) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const token = createSessionToken(sitePassword);
  return jsonResponse(200, { token });
};
