/**
 * Reorder math, ported from arkham's want-list drag engine.
 *
 * Targets are picked by rect intersection area rather than row hit testing,
 * which is what lets the same code drive a vertical list and a 2D card grid.
 */

function moveMovieId(movieIds, dragId, targetId) {
  const from = movieIds.indexOf(dragId);
  const to = movieIds.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) {
    return movieIds;
  }

  const next = [...movieIds];
  next.splice(from, 1);
  next.splice(to, 0, dragId);
  return next;
}

function normalizeRect(rect) {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right != null ? rect.right : rect.left + rect.width,
    bottom: rect.bottom != null ? rect.bottom : rect.top + rect.height,
  };
}

function rectOverlapArea(a, b) {
  const ra = normalizeRect(a);
  const rb = normalizeRect(b);
  const width = Math.max(0, Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left));
  const height = Math.max(0, Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top));
  return width * height;
}

/**
 * Pick the item the floating element overlaps most. `itemRects` includes the
 * dragged item's own slot, so "still mostly over my own slot" resolves to the
 * drag id and returns null. Returns null when there is no overlap at all.
 */
function pickOverlapTargetId(floatingRect, itemRects, dragId) {
  const drag = Number(dragId);
  let bestId = null;
  let bestArea = 0;
  for (const item of itemRects) {
    const area = rectOverlapArea(floatingRect, item.rect);
    if (area > bestArea) {
      bestArea = area;
      bestId = Number(item.id);
    }
  }
  if (bestArea <= 0) {
    return null;
  }
  return bestId === drag ? null : bestId;
}

module.exports = {
  moveMovieId,
  rectOverlapArea,
  pickOverlapTargetId,
};
