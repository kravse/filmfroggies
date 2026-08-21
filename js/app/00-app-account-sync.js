/* Generated from scripts/lib/account-sync.js — run npm run bundle */

const appAccountSync = (function () {
  /**
   * Account sync helpers for the CineQueue backend (Cloudflare Worker + D1).
   *
   * Pure config/URL helpers only; the fetch runtime lives in 03-user-state.js.
   * The session token is stored under its own key and never part of the synced
   * payload, same as the Gist token.
   */

  /** Direct Worker URL for local dev; Netlify proxies /api/backend in production. */
  const ACCOUNT_API_DIRECT = "https://cinequeue-api.cinequeue.workers.dev/api";
  const ACCOUNT_API_PROXIED = "/api/backend";
  const TMDB_API_PROXIED = "/api/tmdb";
  const MOVIES_BATCH_PATH = "/movies/batch";

  function buildListIdsPath(listId) {
    const id = String(listId || "").trim();
    if (id.startsWith("custom-")) {
      return `/lists/custom/${encodeURIComponent(id)}`;
    }
    return `/lists/${encodeURIComponent(id)}`;
  }

  function buildFriendListIdsPath(friendUserId, listId) {
    const friendId = Number(friendUserId);
    const id = String(listId || "").trim();
    if (!Number.isInteger(friendId) || friendId <= 0) {
      throw new Error("Invalid friend user id");
    }
    if (id.startsWith("custom-")) {
      return `/friends/${friendId}/lists/custom/${encodeURIComponent(id)}`;
    }
    return `/friends/${friendId}/lists/${encodeURIComponent(id)}`;
  }

  function resolveAccountApiBase(hostname) {
    const host = String(hostname || "");
    return host === "localhost" || host === "127.0.0.1"
      ? ACCOUNT_API_DIRECT
      : ACCOUNT_API_PROXIED;
  }

  function resolveTmdbApiBase(hostname) {
    const host = String(hostname || "");
    return host === "localhost" || host === "127.0.0.1"
      ? `${ACCOUNT_API_DIRECT}/tmdb`
      : TMDB_API_PROXIED;
  }

  function parseAccountConfig(json) {
    if (json == null || json === "") {
      return null;
    }
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      const token = typeof parsed.token === "string" ? parsed.token.trim() : "";
      const email = typeof parsed.email === "string" ? parsed.email.trim() : "";
      const userId = Number(parsed.userId);
      if (!token || !Number.isInteger(userId)) {
        return null;
      }
      return {
        token,
        email,
        userId,
        displayName:
          typeof parsed.displayName === "string" ? parsed.displayName : "",
      };
    } catch (_) {
      return null;
    }
  }

  function serializeAccountConfig(config) {
    return JSON.stringify({
      token: config.token,
      email: config.email || "",
      userId: config.userId,
      displayName: config.displayName || "",
    });
  }

  function isConnectedAccountConfig(config) {
    return Boolean(config?.token && Number.isInteger(config?.userId));
  }

  return {
    ACCOUNT_API_DIRECT,
    ACCOUNT_API_PROXIED,
    TMDB_API_PROXIED,
    MOVIES_BATCH_PATH,
    resolveAccountApiBase,
    resolveTmdbApiBase,
    parseAccountConfig,
    serializeAccountConfig,
    isConnectedAccountConfig,
  };
})();
