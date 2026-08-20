const { test } = require("node:test");
const assert = require("node:assert/strict");

const { reorderElementsById } = require("../scripts/lib/grid-reorder");

function mockContainer(initial) {
  const children = initial.slice();
  return {
    children,
    appendChild(node) {
      const index = children.indexOf(node);
      if (index >= 0) {
        children.splice(index, 1);
      }
      children.push(node);
    },
  };
}

test("reorderElementsById moves children into the requested order", () => {
  const a = { id: 1 };
  const b = { id: 2 };
  const c = { id: 3 };
  const container = mockContainer([a, b, c]);
  reorderElementsById(container, [3, 1, 2], (node) => node.id);
  assert.deepEqual(
    container.children.map((node) => node.id),
    [3, 1, 2],
  );
});

test("reorderElementsById appends unmatched children at the end", () => {
  const a = { id: 1 };
  const extra = { id: 9 };
  const container = mockContainer([a, extra]);
  reorderElementsById(container, [1], (node) => node.id);
  assert.deepEqual(
    container.children.map((node) => node.id),
    [1, 9],
  );
});

test("reorderElementsById rejects invalid containers", () => {
  assert.equal(reorderElementsById(null, [1], () => 1), false);
});
