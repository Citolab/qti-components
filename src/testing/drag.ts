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
    duration = 500
  }: {
    to?: Element | Coords;
    delta?: { x: number; y: number };
    steps?: number;
    duration?: number;
  }
): Promise<void> {
  const from = getElementClientCenter(element);
  const toCoords = delta
    ? {
        x: from.x + delta.x,
        y: from.y + delta.y
      }
    : getCoords(to);

  const step = {
    x: (toCoords.x - from.x) / steps,
    y: (toCoords.y - from.y) / steps
  };

  const current = {
    clientX: from.x,
    clientY: from.y
  };

  fireEvent.mouseEnter(element, current);
  fireEvent.mouseOver(element, current);
  fireEvent.mouseMove(element, current);
  fireEvent.mouseDown(element, current);

  for (let i = 0; i < steps; i++) {
    current.clientX += step.x;
    current.clientY += step.y;
    await sleep(duration / steps);
    fireEvent.mouseMove(element, current);
  }

  fireEvent.mouseUp(element, current);
}