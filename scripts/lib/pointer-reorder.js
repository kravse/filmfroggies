/**
 * Pointer drag geometry. Kept free of DOM lookups so it can be tested in Node:
 * callers pass elements plus the accessors used to read ids and rects.
 */

/** Where the lifted clone sits right now, given the grab offset. */
function floatingRectFor(drag, clientX, clientY) {
  const left = clientX - drag.offsetX;
  const top = clientY - drag.offsetY;
  return {
    left,
    top,
    width: drag.width,
    height: drag.height,
    right: left + drag.width,
    bottom: top + drag.height,
  };
}

function collectTargetRects(elements, getId, getRect) {
  const items = Array.isArray(elements) ? elements : [...(elements || [])];
  return items
    .map((el) => ({ id: Number(getId(el)), el, rect: getRect(el) }))
    .filter((item) => Number.isInteger(item.id) && item.rect);
}

module.exports = {
  floatingRectFor,
  collectTargetRects,
};
