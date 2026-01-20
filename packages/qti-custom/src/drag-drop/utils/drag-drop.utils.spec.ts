import { describe, expect, it, vi } from 'vitest';

import {
  applyDropzoneAutoSizing,
  collectResponseData,
  countTotalAssociations,
  findDraggableTarget,
  findInventoryItems,
  getMatchMaxValue,
  isDroppableAtCapacity,
  detectCollision
} from './drag-drop.utils';

type Rect = { left: number; top: number; width: number; height: number };

function mockRect(rect: Rect): DOMRect {
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => ({})
  } as DOMRect;
}

function makeElement(rect?: Rect, tag = 'div') {
  const el = document.createElement(tag);
  if (rect) {
    el.getBoundingClientRect = () => mockRect(rect);
  }
  return el;
}

describe('drag-drop.utils', () => {
  it('findDraggableTarget returns element matching selector or qti-draggable attribute', () => {
    const draggable = makeElement();
    draggable.setAttribute('qti-draggable', 'true');

    const child = document.createElement('span');
    draggable.appendChild(child);

    const event = { composedPath: () => [child] } as unknown as Event;

    const result = findDraggableTarget(event, '.not-used');

    expect(result).toBe(draggable);
  });

  it('detectCollision returns zone containing pointer with default strategy', () => {
    const zone = makeElement({ left: 0, top: 0, width: 100, height: 100 });
    const result = detectCollision([zone], 50, 50, null);
    expect(result).toBe(zone);
  });

  it('findInventoryItems locates items in slots and standard containers', () => {
    const container = document.createElement('div');
    const match = document.createElement('div');
    match.setAttribute('identifier', 'a');
    container.appendChild(match);

    const other = document.createElement('div');
    other.setAttribute('identifier', 'b');
    container.appendChild(other);

    const slot = document.createElement('slot');
    (slot as unknown as HTMLSlotElement).assignedElements = () => [match, other];

    const result = findInventoryItems([container, slot as HTMLSlotElement], 'a');

    expect(result).toHaveLength(2);
    expect(result).toContain(match);
  });

  it('getMatchMaxValue falls back to defaults', () => {
    const el = document.createElement('div');
    el.setAttribute('identifier', 'x');
    el.setAttribute('match-max', '3');
    const result = getMatchMaxValue([el], 'x');
    expect(result).toBe(3);
    expect(getMatchMaxValue([], 'x')).toBe(1);
  });

  it('isDroppableAtCapacity respects match-max and counts by selector and attribute', () => {
    const droppable = document.createElement('div');
    droppable.setAttribute('match-max', '2');
    droppable.innerHTML = `<div class="drag"></div><div qti-draggable="true"></div><div qti-draggable="true"></div>`;
    expect(isDroppableAtCapacity(droppable, '.drag')).toBe(true);
  });

  it('countTotalAssociations counts max of selector and attribute matches per droppable', () => {
    const d1 = document.createElement('div');
    d1.innerHTML = `<div class="drag"></div>`;
    const d2 = document.createElement('div');
    d2.innerHTML = `<div qti-draggable="true"></div><div qti-draggable="true"></div>`;
    expect(countTotalAssociations([d1, d2], '.drag')).toBe(3);
  });

  it('collectResponseData pairs draggable identifiers with droppable identifiers', () => {
    const droppable = document.createElement('div');
    droppable.setAttribute('identifier', 'drop1');
    const drag = document.createElement('div');
    drag.setAttribute('identifier', 'item1');
    drag.classList.add('drag');
    droppable.appendChild(drag);

    expect(collectResponseData([droppable], '.drag')).toEqual(['item1 drop1']);
  });

  it('applyDropzoneAutoSizing sets min sizes and grid columns for grid layouts', () => {
    const draggableA = makeElement({ left: 0, top: 0, width: 40, height: 30 });
    const draggableB = makeElement({ left: 0, top: 0, width: 50, height: 40 });

    const dropContainer = document.createElement('div');
    Object.defineProperty(dropContainer, 'clientWidth', { value: 200 });

    const droppable = makeElement(undefined, 'qti-simple-associable-choice');
    droppable.attachShadow({ mode: 'open' });
    const slot = document.createElement('slot');
    slot.setAttribute('part', 'dropslot');
    droppable.shadowRoot?.appendChild(slot);
    dropContainer.appendChild(droppable);

    const dragContainer = document.createElement('div');

    const hostWindow = {
      innerWidth: 1024,
      getComputedStyle: () => ({ paddingLeft: '10', paddingRight: '10' })
    } as unknown as Window;

    applyDropzoneAutoSizing([draggableA, draggableB], [droppable], [dragContainer], hostWindow);

    expect(droppable.style.minHeight).toBe('40px');
    expect(droppable.style.minWidth).toBe('50px');
    expect(slot.style.minHeight).toBe('40px');
    expect(dragContainer.style.minHeight).toBe('40px');
    expect(dropContainer.style.gridTemplateColumns).toContain('minmax');
  });
});
