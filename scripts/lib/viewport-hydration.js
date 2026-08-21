/**
 * Viewport-scoped list hydration helpers. Movie rows hydrate when they enter
 * (or neared) the viewport instead of fetching the entire list upfront.
 *
 * rootMargin expands the observer root so the first batch covers visible rows
 * plus a short prefetch band (e.g. ~20 on screen → ~25–35 in one POST).
 */

const ROW_HYDRATE_ROOT_MARGIN = "320px 0px";

function movieIdFromRowElement(element) {
  if (!element || typeof element !== "object") {
    return null;
  }
  const raw =
    element.dataset?.movieId ??
    (typeof element.getAttribute === "function" ? element.getAttribute("data-movie-id") : null);
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** True when no viewport hydration batches are queued or in flight. */
function isHydrationQuiescent({ batchTimer = 0, inflightCount = 0, pendingCount = 0 } = {}) {
  return !batchTimer && inflightCount === 0 && pendingCount === 0;
}

module.exports = {
  ROW_HYDRATE_ROOT_MARGIN,
  movieIdFromRowElement,
  isHydrationQuiescent,
};
