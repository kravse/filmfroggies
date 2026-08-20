/**
 * One-time signup invite codes stored in D1 (hash only).
 */

const enc = new TextEncoder();

export function normalizeInviteCode(code) {
  const normalized = String(code ?? "").trim();
  return normalized || null;
}

export function hashInviteCodeHex(code) {
  const normalized = normalizeInviteCode(code);
  if (!normalized) {
    return null;
  }
  return crypto.subtle.digest("SHA-256", enc.encode(normalized)).then((digest) =>
    [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join(""),
  );
}

/** Reserve a code for signup. Returns ok:false for missing, unknown, or already-used codes. */
export async function reserveInviteCode(env, code) {
  const codeHash = await hashInviteCodeHex(code);
  if (!codeHash) {
    return { ok: false, reason: "missing", codeHash: null, reservedAt: null };
  }
  const reservedAt = Date.now();
  const result = await env.DB.prepare(
    "UPDATE invite_codes SET used_at = ?1 WHERE code_hash = ?2 AND used_at IS NULL",
  )
    .bind(reservedAt, codeHash)
    .run();
  if (result.meta.changes === 0) {
    return { ok: false, reason: "invalid", codeHash, reservedAt: null };
  }
  return { ok: true, reason: "ok", codeHash, reservedAt };
}

/** Undo a reservation when signup cannot complete (e.g. duplicate email). */
export async function releaseInviteCode(env, codeHash, reservedAt) {
  if (!codeHash || reservedAt == null) {
    return;
  }
  await env.DB.prepare(
    "UPDATE invite_codes SET used_at = NULL, used_by_user_id = NULL WHERE code_hash = ?1 AND used_at = ?2 AND used_by_user_id IS NULL",
  )
    .bind(codeHash, reservedAt)
    .run();
}

export async function linkInviteCodeToUser(env, codeHash, userId) {
  if (!codeHash || !Number.isInteger(userId)) {
    return;
  }
  await env.DB.prepare("UPDATE invite_codes SET used_by_user_id = ?1 WHERE code_hash = ?2")
    .bind(userId, codeHash)
    .run();
}

function toBase64Url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function generateInviteCodePlaintext() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(12)));
}

/** Insert one-time signup codes; returns plaintext codes (shown once). */
export async function createInviteCodes(env, count) {
  const createdAt = Date.now();
  const codes = [];
  const statements = [];

  for (let i = 0; i < count; i += 1) {
    const code = generateInviteCodePlaintext();
    codes.push(code);
    const codeHash = await hashInviteCodeHex(code);
    statements.push(
      env.DB.prepare("INSERT INTO invite_codes (code_hash, created_at) VALUES (?1, ?2)").bind(
        codeHash,
        createdAt,
      ),
    );
  }

  await env.DB.batch(statements);
  return codes;
}
