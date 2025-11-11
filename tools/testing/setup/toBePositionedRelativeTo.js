export function toBePositionedRelativeTo(received, other, position) {
  if (!(received instanceof Element) || !(other instanceof Element)) {
    return {
      pass: false,
      message: () => `Expected both arguments to be DOM elements.`
    };
  }

  const rectA = received.getBoundingClientRect();
  const rectB = other.getBoundingClientRect();

  // Check for overlap (Fail if they overlap)
  const overlaps =
    rectA.left < rectB.right && rectA.right > rectB.left && rectA.top < rectB.bottom && rectA.bottom > rectB.top;

  if (overlaps) {
    return {
      pass: false,
      message: () => `Expected elements NOT to overlap, but they do.`
    };
  }

  const positionChecks = {
    left: rectA.right <= rectB.left,
    right: rectA.left >= rectB.right,
    above: rectA.bottom <= rectB.top,
    below: rectA.top >= rectB.bottom
  };

  if (!positionChecks[position]) {
    return {
      pass: false,
      message: () => `Expected element to be "${position}" relative to the other, but it was not.`
    };
  }

  return {
    pass: true,
    message: () => `Element is correctly positioned "${position}" without overlapping.`
  };
}
