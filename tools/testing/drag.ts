// PK: Helper utility for unit tests
// There is no such thing in the testing library as drag and drop, so we need to simulate it
// Vitest has a https://vitest.dev/guide/browser/interactivity-api#userevent-draganddrop, but it is not supported in storybook
// So we need to simulate the drag and drop ourselves, using this utility: https://testing-library.com/docs/example-drag/

import { fireEvent } from '@testing-library/dom';

interface ElementClientCenter {
  x: number;
  y: number;
}

function isElement(obj: any): boolean {
  return obj instanceof Element || obj instanceof Document;
}

function getElementClientCenter(element: Element): ElementClientCenter {
  const { left, top, width, height } = element.getBoundingClientRect();
  return {
    x: left + width / 2,
    y: top + height / 2
  };
}

type Coords = ElementClientCenter | { x: number; y: number };

const getCoords = (target: Element | Coords): Coords => {
  if (isElement(target)) {
    return getElementClientCenter(target as Element);
  }
  return target as Coords;
};

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getTargetAtPoint = (x: number, y: number): Element | Document => {
  if (typeof document.elementFromPoint !== 'function') {
    return document;
  }
  return document.elementFromPoint(x, y) ?? document;
};

const dispatchMoveTransition = (
  prevTarget: Element | Document,
  nextTarget: Element | Document,
  coords: { clientX: number; clientY: number }
) => {
  if (prevTarget === nextTarget) return;

  if (prevTarget instanceof Element) {
    fireEvent.mouseOut(prevTarget, coords);
    fireEvent.mouseLeave(prevTarget, coords);
  }

  if (nextTarget instanceof Element) {
    fireEvent.pointerEnter(nextTarget, { ...coords, pointerId: 1, pointerType: 'mouse', isPrimary: true });
    fireEvent.pointerOver(nextTarget, { ...coords, pointerId: 1, pointerType: 'mouse', isPrimary: true });
    fireEvent.mouseEnter(nextTarget, coords);
    fireEvent.mouseOver(nextTarget, coords);
    fireEvent.dragEnter(nextTarget, coords);
    fireEvent.dragOver(nextTarget, coords);
  }
};

/**
 * Drags an element to a specified location or by a specified delta.
 * @param element - The element to be dragged.
 * @param options - The drag options.
 * @param options.to - The target element or coordinates to drag to.
 * @param options.delta - The delta coordinates to drag by.
 * @param options.steps - The number of steps to perform during the drag.
 * @param options.duration - The duration of the drag in milliseconds.
 * @returns A promise that resolves when the drag operation is complete.
 */
export default async function drag(
  element: Element,
  {
    to,
    delta,
    steps = 20,
    duration = 100,
    offset = { x: 0, y: 0 }
  }: {
    to?: Element | Coords;
    delta?: { x: number; y: number };
    steps?: number;
    duration?: number;
    offset?: { x: number; y: number };
  }
): Promise<void> {
  // Give Storybook canvas/layout a frame to settle before sampling coords.
  await sleep(16);

  const fromCoords = getCoords(element);
  let toCoords = to ? getCoords(to) : null;
  const explicitTarget = to && isElement(to) ? (to as Element) : null;
  if (delta) {
    // Use delta if provided
    toCoords = {
      x: fromCoords.x + delta.x,
      y: fromCoords.y + delta.y
    };
  } else if (to) {
    // Calculate center of the target element
    toCoords = getCoords(to);
  } else {
    throw new Error('Either "to" or "delta" must be provided.');
  }
  if (offset) {
    toCoords.x += offset.x;
    toCoords.y += offset.y;
  }
  // Calculate the step increments
  const step = {
    x: (toCoords.x - fromCoords.x) / steps,
    y: (toCoords.y - fromCoords.y) / steps
  };

  const current = {
    clientX: fromCoords.x,
    clientY: fromCoords.y,
    button: 0,
    buttons: 1
  };
  let currentHoverTarget: Element | Document = element;
  const pointerMeta = { pointerId: 1, pointerType: 'mouse', isPrimary: true };

  // Simulate drag start
  fireEvent.pointerEnter(element, { ...current, ...pointerMeta });
  fireEvent.pointerOver(element, { ...current, ...pointerMeta });
  fireEvent.mouseEnter(element, current);
  fireEvent.mouseOver(element, current);
  fireEvent.pointerMove(element, { ...current, ...pointerMeta });
  fireEvent.mouseMove(element, current);
  fireEvent.pointerMove(document, { ...current, ...pointerMeta });
  fireEvent.mouseMove(document, current);
  fireEvent.pointerDown(element, { ...current, ...pointerMeta });
  fireEvent.mouseDown(element, current);
  fireEvent.pointerDown(document, { ...current, ...pointerMeta });
  fireEvent.mouseDown(document, current);
  fireEvent.dragStart(element, current);

  // Simulate drag movement in steps
  for (let i = 0; i < steps; i++) {
    if (i === steps - 1) {
      // Ensure the last step lands exactly at toCoords
      current.clientX = toCoords.x;
      current.clientY = toCoords.y;
    } else {
      // Incrementally move toward toCoords
      current.clientX += step.x;
      current.clientY += step.y;
    }
    await sleep(duration / steps);

    const nextHoverTarget = getTargetAtPoint(current.clientX, current.clientY);
    dispatchMoveTransition(currentHoverTarget, nextHoverTarget, current);
    currentHoverTarget = nextHoverTarget;

    fireEvent.pointerMove(nextHoverTarget, { ...current, ...pointerMeta });
    fireEvent.mouseMove(nextHoverTarget, current);
    if (nextHoverTarget instanceof Element) {
      fireEvent.dragOver(nextHoverTarget, current);
    }
    fireEvent.pointerMove(document, { ...current, ...pointerMeta });
    fireEvent.mouseMove(document, current);
  }

  // Simulate drag end
  const releaseTarget = explicitTarget ?? getTargetAtPoint(current.clientX, current.clientY);
  dispatchMoveTransition(currentHoverTarget, releaseTarget, current);
  const release = { ...current, buttons: 0 };

  if (releaseTarget instanceof Element) {
    fireEvent.drop(releaseTarget, release);
  }
  fireEvent.pointerUp(releaseTarget, { ...release, ...pointerMeta });
  fireEvent.mouseUp(releaseTarget, release);
  fireEvent.pointerUp(document, { ...release, ...pointerMeta });
  fireEvent.mouseUp(document, release);
  fireEvent.dragEnd(element, release);
  await sleep(100);
}
