import { describe, expect, it } from 'vitest';

import {
  closestCenterCollision,
  closestCornersCollision,
  closestCornersWithInventoryPriorityCollision,
  pointerWithinCollision,
  rectangleIntersectionCollision
} from './collision.utils';

type Rect = { left: number; top: number; width: number; height: number };

function createZone(rect: Rect, options?: { disabled?: boolean; tag?: string }) {
  const el = document.createElement(options?.tag ?? 'div');
  el.getBoundingClientRect = () => ({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => ({})
  } as DOMRect);
  if (options?.disabled) {
    el.setAttribute('disabled', '');
  }
  return el;
}

function createDrag(rect: Rect) {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => ({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => ({})
  } as DOMRect);
  return el;
}

describe('collision detection utils', () => {
  it('pointerWithinCollision returns active zone containing pointer', () => {
    const inside = createZone({ left: 0, top: 0, width: 100, height: 100 });
    const outside = createZone({ left: 200, top: 200, width: 50, height: 50 });
    const disabled = createZone({ left: 0, top: 0, width: 100, height: 100 }, { disabled: true });

    const result = pointerWithinCollision([disabled, outside, inside], 50, 50);

    expect(result).toBe(inside);
  });

  it('rectangleIntersectionCollision detects intersecting rectangles and ignores non-intersecting', () => {
    const dragEl = createDrag({ left: 10, top: 10, width: 20, height: 20 });
    const intersecting = createZone({ left: 25, top: 15, width: 30, height: 30 });
    const nonIntersecting = createZone({ left: 100, top: 100, width: 20, height: 20 });

    const result = rectangleIntersectionCollision([intersecting, nonIntersecting], 0, 0, dragEl);

    expect(result).toBe(intersecting);
  });

  it('closestCenterCollision picks zone with nearest center to drag center', () => {
    const close = createZone({ left: 0, top: 0, width: 20, height: 20 });
    const far = createZone({ left: 200, top: 0, width: 20, height: 20 });
    const dragEl = createDrag({ left: 25, top: 5, width: 10, height: 10 }); // center near close zone

    const result = closestCenterCollision([far, close], 0, 0, dragEl);

    expect(result).toBe(close);
  });

  it('closestCornersCollision uses average corner distance to choose nearest zone', () => {
    const near = createZone({ left: 0, top: 0, width: 10, height: 10 });
    const far = createZone({ left: 100, top: 100, width: 10, height: 10 });
    const dragEl = createDrag({ left: 5, top: 5, width: 10, height: 10 });

    const result = closestCornersCollision([far, near], 0, 0, dragEl);

    expect(result).toBe(near);
  });

  describe('closestCornersWithInventoryPriorityCollision', () => {
    it('prefers drag container when drag is inside it', () => {
      const dragContainer = createZone({ left: 0, top: 0, width: 100, height: 100 });
      const droppable = createZone({ left: 10, top: 10, width: 20, height: 20 });
      const dragEl = createDrag({ left: 20, top: 20, width: 10, height: 10 });

      const result = closestCornersWithInventoryPriorityCollision(
        [dragContainer, droppable],
        0,
        0,
        dragEl,
        [dragContainer]
      );

      expect(result).toBe(dragContainer);
    });

    it('prefers drag container when within threshold of closest droppable', () => {
      const dragContainer = createZone({ left: 0, top: 0, width: 10, height: 10 });
      const droppable = createZone({ left: 40, top: 0, width: 10, height: 10 });
      const dragEl = createDrag({ left: 5, top: 5, width: 10, height: 10 });

      const result = closestCornersWithInventoryPriorityCollision(
        [dragContainer, droppable],
        0,
        0,
        dragEl,
        [dragContainer]
      );

      expect(result).toBe(dragContainer);
    });

    it('falls back to closest droppable when drag container is much farther', () => {
      const dragContainer = createZone({ left: 200, top: 200, width: 10, height: 10 });
      const droppable = createZone({ left: 0, top: 0, width: 10, height: 10 });
      const dragEl = createDrag({ left: 5, top: 5, width: 10, height: 10 });

      const result = closestCornersWithInventoryPriorityCollision(
        [dragContainer, droppable],
        0,
        0,
        dragEl,
        [dragContainer]
      );

      expect(result).toBe(droppable);
    });
  });
});
