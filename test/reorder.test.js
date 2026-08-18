const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  moveMovieId,
  rectOverlapArea,
  pickOverlapTargetId,
} = require("../scripts/lib/reorder");
const {
  floatingRectFor,
  collectTargetRects,
} = require("../scripts/lib/pointer-reorder");

function rect(left, top, width, height) {
  return { left, top, width, height, right: left + width, bottom: top + height };
}

test("moveMovieId moves an item down to the target slot", () => {
  assert.deepEqual(moveMovieId([1, 2, 3, 4], 1, 3), [2, 3, 1, 4]);
});

test("moveMovieId moves an item up to the target slot", () => {
  assert.deepEqual(moveMovieId([1, 2, 3, 4], 4, 2), [1, 4, 2, 3]);
});

test("moveMovieId returns the same array when nothing changes", () => {
  const ids = [1, 2, 3];
  assert.equal(moveMovieId(ids, 2, 2), ids);
  assert.equal(moveMovieId(ids, 9, 2), ids);
  assert.equal(moveMovieId(ids, 2, 9), ids);
});

test("moveMovieId does not mutate the input", () => {
  const ids = [1, 2, 3];
  moveMovieId(ids, 1, 3);
  assert.deepEqual(ids, [1, 2, 3]);
});

test("rectOverlapArea measures the intersection", () => {
  assert.equal(rectOverlapArea(rect(0, 0, 10, 10), rect(5, 5, 10, 10)), 25);
});

test("rectOverlapArea is zero for disjoint or touching rects", () => {
  assert.equal(rectOverlapArea(rect(0, 0, 10, 10), rect(20, 20, 5, 5)), 0);
  assert.equal(rectOverlapArea(rect(0, 0, 10, 10), rect(10, 0, 10, 10)), 0);
});

test("rectOverlapArea works from width and height alone", () => {
  const a = { left: 0, top: 0, width: 10, height: 10 };
  const b = { left: 5, top: 0, width: 10, height: 10 };
  assert.equal(rectOverlapArea(a, b), 50);
});

test("pickOverlapTargetId picks the largest overlap in a grid", () => {
  const targets = [
    { id: 1, rect: rect(0, 0, 100, 150) },
    { id: 2, rect: rect(110, 0, 100, 150) },
    { id: 3, rect: rect(220, 0, 100, 150) },
  ];
  assert.equal(pickOverlapTargetId(rect(180, 0, 100, 150), targets, 1), 3);
});

test("pickOverlapTargetId returns null while still over its own slot", () => {
  const targets = [
    { id: 1, rect: rect(0, 0, 100, 150) },
    { id: 2, rect: rect(110, 0, 100, 150) },
  ];
  assert.equal(pickOverlapTargetId(rect(10, 5, 100, 150), targets, 1), null);
});

test("pickOverlapTargetId returns null when the drag is off the grid", () => {
  const targets = [{ id: 1, rect: rect(0, 0, 100, 150) }];
  assert.equal(pickOverlapTargetId(rect(900, 900, 100, 150), targets, 1), null);
});

test("pickOverlapTargetId handles an empty target set", () => {
  assert.equal(pickOverlapTargetId(rect(0, 0, 10, 10), [], 1), null);
});

test("floatingRectFor tracks the pointer using the grab offset", () => {
  const drag = { offsetX: 20, offsetY: 30, width: 100, height: 150 };
  assert.deepEqual(floatingRectFor(drag, 120, 130), {
    left: 100,
    top: 100,
    width: 100,
    height: 150,
    right: 200,
    bottom: 250,
  });
});

test("collectTargetRects pairs ids with rects and drops unusable entries", () => {
  const elements = [{ id: "1" }, { id: "nope" }, { id: "2" }];
  const rects = { 1: rect(0, 0, 10, 10), 2: rect(0, 20, 10, 10) };
  const collected = collectTargetRects(
    elements,
    (el) => el.id,
    (el) => rects[el.id],
  );
  assert.deepEqual(
    collected.map((item) => item.id),
    [1, 2],
  );
});

test("collectTargetRects accepts an array-like NodeList stand-in", () => {
  const elements = new Set([{ id: 5 }]);
  const collected = collectTargetRects(
    elements,
    (el) => el.id,
    () => rect(0, 0, 1, 1),
  );
  assert.equal(collected.length, 1);
});
