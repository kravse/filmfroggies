/**
 * Fixed-window rate limits backed by D1 rate_limits table.
 */

export async function rateLimit(env, key, { limit, windowMs }, nowMs = Date.now()) {
  const row = await env.DB.prepare(
    "SELECT count, window_start FROM rate_limits WHERE key = ?1",
  )
    .bind(key)
    .first();

  if (!row || nowMs - row.window_start >= windowMs) {
    await env.DB.prepare(
      "INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2) ON CONFLICT (key) DO UPDATE SET count = 1, window_start = ?2",
    )
      .bind(key, nowMs)
      .run();
    return { allowed: true, retryAfterSec: 0 };
  }

  if (row.count >= limit) {
    const retryAfterSec = Math.ceil((row.window_start + windowMs - nowMs) / 1000);
    return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  await env.DB.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?1").bind(key).run();
  return { allowed: true, retryAfterSec: 0 };
}

export async function rateLimitBlocked(env, key, { limit, windowMs }, nowMs = Date.now()) {
  const row = await env.DB.prepare(
    "SELECT count, window_start FROM rate_limits WHERE key = ?1",
  )
    .bind(key)
    .first();

  if (!row || nowMs - row.window_start >= windowMs) {
    return { blocked: false, retryAfterSec: 0 };
  }
  if (row.count < limit) {
    return { blocked: false, retryAfterSec: 0 };
  }
  const retryAfterSec = Math.ceil((row.window_start + windowMs - nowMs) / 1000);
  return { blocked: true, retryAfterSec: Math.max(retryAfterSec, 1) };
}
