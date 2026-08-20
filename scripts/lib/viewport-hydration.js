/**
 * Viewport-scoped list hydration helpers. Movie rows hydrate when they enter
 * (or neared) the viewport instead of fetching the entire list upfront.
 */

const ROW_HYDRATE_ROOT_MARGIN = "240px 0px";

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

module.exports = {
  ROW_HYDRATE_ROOT_MARGIN,
  movieIdFromRowElement,
};
