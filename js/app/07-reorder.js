/**
 * Drag reorder for both views, ported from arkham's want-list engine.
 *
 * One lift-and-drop implementation drives a vertical list and a 2D card grid;
 * only the lifted element, the drop-target selector, and the floating class
 * differ. Targets are chosen by overlap area, which is what makes the same
 * code work in a grid where row hit testing would fall apart.
 *
 * There is no gate: the stored order is the only order, so nothing can
 * disagree with what was dragged.
 */

const EDGE_SCROLL_ZONE = 72;
const EDGE_SCROLL_SPEED = 18;

let dragState = null;

function getLiftConfig() {
  if (gridViewMode === "list") {
    return {
      liftSelector: ".movie-row",
      targetSelector: ".movie-row:not(.movie-row--card)",
      floatingClass: "movie-row-floating",
    };
  }
  return {
    liftSelector: ".card",
    targetSelector: ".movie-row--card .card",
    floatingClass: "movie-card-floating",
  };
}

function elementMovieId(element) {
  return Number(element?.dataset?.movieId);
}

function clearDropHighlight() {
  for (const el of grid.querySelectorAll(".drop-target")) {
    el.classList.remove("drop-target");
  }
}

function highlightTarget(targets, targetId) {
  clearDropHighlight();
  if (targetId == null) {
    return;
  }
  targets.find((item) => item.id === targetId)?.el.classList.add("drop-target");
}

function autoScrollForPointer(clientY) {
  const fromTop = clientY;
  const fromBottom = window.innerHeight - clientY;
  if (fromTop < EDGE_SCROLL_ZONE) {
    window.scrollBy(0, -EDGE_SCROLL_SPEED);
  } else if (fromBottom < EDGE_SCROLL_ZONE) {
    window.scrollBy(0, EDGE_SCROLL_SPEED);
  }
}

function onGripPointerDown(event) {
  const handle = event.target.closest(".card-grip, .row-grip");
  if (!handle || dragState || (event.pointerType === "mouse" && event.button !== 0)) {
    return;
  }

  const config = getLiftConfig();
  const source = handle.closest(config.liftSelector);
  const movieId = elementMovieId(source);
  if (!source || !Number.isInteger(movieId)) {
    return;
  }

  event.preventDefault();
  const rect = source.getBoundingClientRect();
  const floatEl = source.cloneNode(true);
  floatEl.classList.add(config.floatingClass);
  floatEl.style.position = "fixed";
  floatEl.style.left = `${rect.left}px`;
  floatEl.style.top = `${rect.top}px`;
  floatEl.style.width = `${rect.width}px`;
  floatEl.style.height = `${rect.height}px`;
  floatEl.style.margin = "0";
  document.body.appendChild(floatEl);

  source.classList.add("drag-lift-source");
  document.body.classList.add("reorder-active");
  handle.setPointerCapture(event.pointerId);

  dragState = {
    pointerId: event.pointerId,
    handle,
    config,
    movieId,
    source,
    floatEl,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
    lastTargetId: null,
  };
}

function onGripPointerMove(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }
  event.preventDefault();

  const floatingRect = appPointerReorder.floatingRectFor(
    dragState,
    event.clientX,
    event.clientY,
  );
  dragState.floatEl.style.left = `${floatingRect.left}px`;
  dragState.floatEl.style.top = `${floatingRect.top}px`;

  autoScrollForPointer(event.clientY);

  // Rects are re-read every move so hydration or scrolling cannot desync them.
  const targets = appPointerReorder.collectTargetRects(
    grid.querySelectorAll(dragState.config.targetSelector),
    elementMovieId,
    (el) => el.getBoundingClientRect(),
  );
  const targetId = appReorder.pickOverlapTargetId(
    floatingRect,
    targets,
    dragState.movieId,
  );
  dragState.lastTargetId = targetId;
  highlightTarget(targets, targetId);
}

function commitDrop(targetId) {
  const list = activeList();
  if (!list || targetId == null) {
    return false;
  }
  const nextIds = appReorder.moveMovieId(list.movieIds, dragState.movieId, targetId);
  if (!updateLists(appLists.replaceMovieIds(userState.lists, list.id, nextIds))) {
    return false;
  }
  persistUserState();
  return true;
}

function finishDrag(event, { commit }) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  // Release coordinates can drift from where the glow was, so trust the last
  // highlighted target over a fresh hit test.
  const targetId = dragState.lastTargetId;
  const { handle, source, floatEl, pointerId } = dragState;

  const changed = commit ? commitDrop(targetId) : false;

  if (handle.hasPointerCapture?.(pointerId)) {
    handle.releasePointerCapture(pointerId);
  }
  floatEl.remove();
  source.classList.remove("drag-lift-source");
  document.body.classList.remove("reorder-active");
  clearDropHighlight();
  dragState = null;

  if (changed) {
    render();
  }
}
