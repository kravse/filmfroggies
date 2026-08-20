/**
 * Block internal repo paths from read-only static servers (local dev only).
 * Production publishes build/, which never includes these directories.
 */

const BLOCKED_PREFIXES = ["/plans", "/plans/"];

function isBlockedStaticPath(urlPath) {
  const path = String(urlPath || "").split("?")[0];
  return BLOCKED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function blockInternalStaticPaths(req, res, next) {
  if (isBlockedStaticPath(req.path)) {
    res.status(404).end();
    return;
  }
  next();
}

module.exports = {
  BLOCKED_PREFIXES,
  isBlockedStaticPath,
  blockInternalStaticPaths,
};
