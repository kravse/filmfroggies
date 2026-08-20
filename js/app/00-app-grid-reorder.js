/* Generated from scripts/lib/grid-reorder.js — run npm run bundle */

const appGridReorder = (function () {
  /**
   * Reorder existing DOM children to match an id sequence without rebuilding HTML.
   */

  function reorderElementsById(container, orderedIds, getElementId) {
    if (!container || typeof container.appendChild !== "function" || !Array.isArray(orderedIds)) {
      return false;
    }
    const readId = typeof getElementId === "function" ? getElementId : () => null;
    const byId = new Map();
    const children = Array.from(container.children || []);
    for (const child of children) {
      const id = readId(child);
      if (id == null) {
        continue;
      }
      byId.set(id, child);
    }
    for (const id of orderedIds) {
      const element = byId.get(id);
      if (!element) {
        continue;
      }
      container.appendChild(element);
      byId.delete(id);
    }
    for (const element of byId.values()) {
      container.appendChild(element);
    }
    return true;
  }

  return {
    reorderElementsById,
  };
})();
