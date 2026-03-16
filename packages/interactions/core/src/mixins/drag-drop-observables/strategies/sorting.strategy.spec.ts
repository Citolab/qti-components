import { describe, expect, it } from 'vitest';

import {
  HorizontalListSortingStrategy,
  VerticalListSortingStrategy,
  defaultSortingStrategy
} from './sorting.strategy';

type Rect = { left: number; top: number; width: number; height: number };

function createElementWithRect(rect: Rect): HTMLElement {
  const el = document.createElement('div');
  el.getBoundingClientRect = () =>
    ({
      x: rect.left,
      y: rect.top,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      toJSON: () => ({})
    }) as DOMRect;
  return el;
}

describe('sorting.strategy', () => {
  it('VerticalListSortingStrategy returns null when target is not in elements', () => {
    const strategy = new VerticalListSortingStrategy();
    const a = createElementWithRect({ left: 0, top: 0, width: 100, height: 100 });
    const target = createElementWithRect({ left: 0, top: 100, width: 100, height: 100 });
    const active = createElementWithRect({ left: 0, top: 200, width: 100, height: 100 });

    const result = strategy.getInsertPosition([a], active, target, 0, 120);
    expect(result).toBeNull();
  });

  it('VerticalListSortingStrategy uses 50% threshold (before in top half, after in bottom half)', () => {
    const strategy = new VerticalListSortingStrategy();
    const target = createElementWithRect({ left: 0, top: 100, width: 100, height: 100 });
    const active = createElementWithRect({ left: 0, top: 0, width: 100, height: 100 });
    const elements = [target];

    const topHalf = strategy.getInsertPosition(elements, active, target, 0, 120);
    const bottomHalf = strategy.getInsertPosition(elements, active, target, 0, 180);

    expect(topHalf).toEqual({ index: 0, placeAfter: false });
    expect(bottomHalf).toEqual({ index: 0, placeAfter: true });
  });

  it('VerticalListSortingStrategy clamps pointer values outside the target bounds', () => {
    const strategy = new VerticalListSortingStrategy();
    const target = createElementWithRect({ left: 0, top: 100, width: 100, height: 100 });
    const active = createElementWithRect({ left: 0, top: 0, width: 100, height: 100 });
    const elements = [target];

    const above = strategy.getInsertPosition(elements, active, target, 0, 0);
    const below = strategy.getInsertPosition(elements, active, target, 0, 1000);

    expect(above).toEqual({ index: 0, placeAfter: false });
    expect(below).toEqual({ index: 0, placeAfter: true });
  });

  it('HorizontalListSortingStrategy uses 50% threshold for non-last items', () => {
    const strategy = new HorizontalListSortingStrategy();
    const first = createElementWithRect({ left: 0, top: 0, width: 100, height: 30 });
    const last = createElementWithRect({ left: 100, top: 0, width: 100, height: 30 });
    const active = createElementWithRect({ left: 0, top: 30, width: 100, height: 30 });
    const elements = [first, last];

    const leftSide = strategy.getInsertPosition(elements, active, first, 20, 0);
    const rightSide = strategy.getInsertPosition(elements, active, first, 80, 0);

    expect(leftSide).toEqual({ index: 0, placeAfter: false });
    expect(rightSide).toEqual({ index: 0, placeAfter: true });
  });

  it('HorizontalListSortingStrategy uses 33% threshold for the last item', () => {
    const strategy = new HorizontalListSortingStrategy();
    const first = createElementWithRect({ left: 0, top: 0, width: 100, height: 30 });
    const last = createElementWithRect({ left: 100, top: 0, width: 100, height: 30 });
    const active = createElementWithRect({ left: 0, top: 30, width: 100, height: 30 });
    const elements = [first, last];

    // 20% of width -> before last item
    const beforeLast = strategy.getInsertPosition(elements, active, last, 120, 0);
    // 40% of width -> after last item (because last-item threshold is 33%)
    const afterLast = strategy.getInsertPosition(elements, active, last, 140, 0);

    expect(beforeLast).toEqual({ index: 1, placeAfter: false });
    expect(afterLast).toEqual({ index: 1, placeAfter: true });
  });

  it('defaultSortingStrategy is vertical', () => {
    expect(defaultSortingStrategy).toBeInstanceOf(VerticalListSortingStrategy);
  });
});

