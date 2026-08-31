/**
 * Optional vanity display names. Storage holds the name the user picked, or
 * nothing at all — an unset name falls back to the email local part, which is
 * what every account was created with.
 *
 * Writes are strict (normalizeDisplayName / displayNameError); reads are lenient
 * (resolveDisplayName), so a stored value never disappears from the UI because
 * the rules tightened later.
 */

const DISPLAY_NAME_MIN = 3;
const DISPLAY_NAME_MAX = 20;
const DISPLAY_NAME_PATTERN = /^[a-z0-9][a-z0-9._]*$/i;
const DISPLAY_NAME_FALLBACK = "Someone";

/** Accepts either a D1 row (display_name) or a wire/config object (displayName). */
function storedDisplayName(user) {
  const value = user?.displayName != null ? user.displayName : user?.display_name;
  return String(value == null ? "" : value).trim();
}

function emailLocalPart(email) {
  return String(email == null ? "" : email).trim().split("@")[0];
}

/** The trimmed name when it passes the rules, otherwise null. Write path only. */
function normalizeDisplayName(raw) {
  const value = String(raw == null ? "" : raw).trim();
  if (value.length < DISPLAY_NAME_MIN || value.length > DISPLAY_NAME_MAX) {
    return null;
  }
  return DISPLAY_NAME_PATTERN.test(value) ? value : null;
}

/** Message for a rejected value, or null when it is acceptable. */
function displayNameError(raw) {
  const value = String(raw == null ? "" : raw).trim();
  if (!value) {
    return "Enter a display name.";
  }
  if (value.length < DISPLAY_NAME_MIN) {
    return `Use at least ${DISPLAY_NAME_MIN} characters.`;
  }
  if (value.length > DISPLAY_NAME_MAX) {
    return `Use ${DISPLAY_NAME_MAX} characters or fewer.`;
  }
  if (!DISPLAY_NAME_PATTERN.test(value)) {
    return "Letters, numbers, periods, and underscores only, starting with a letter or number.";
  }
  return null;
}

/**
 * Never returns an empty string: friendActivityItems drops any friend whose
 * displayName is blank, so a nameless account would vanish from the rail.
 */
function resolveDisplayName(user) {
  return storedDisplayName(user) || emailLocalPart(user?.email) || DISPLAY_NAME_FALLBACK;
}

function hasCustomDisplayName(user) {
  return storedDisplayName(user).length > 0;
}

module.exports = {
  DISPLAY_NAME_MIN,
  DISPLAY_NAME_MAX,
  storedDisplayName,
  normalizeDisplayName,
  displayNameError,
  resolveDisplayName,
  hasCustomDisplayName,
};
