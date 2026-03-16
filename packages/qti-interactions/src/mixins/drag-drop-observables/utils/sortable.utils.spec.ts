import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./flip.utils', () => ({
  captureMultipleFlipStates: vi.fn(() => new Map()),
  animateMultipleFlips: vi.fn()
}));

import { animateMultipleFlips, captureMultipleFlipStates } from './flip.utils';
import {
  cancelSortableDrag,
  collectIdentifiersInOrder,
  createDropPlaceholder,
  createSortableDragContext,
  finalizeSortableDrop,
  isElementInContainer,
  placePlaceholderAtPosition,
  reorderDOMByIdentifiers,
  resetSortableDragContext
} from './sortable.utils';

import type { SortingStrategy } from '../strategies/sorting.strategy';

function makeRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({})
  } as DOMRect;
}

describe('sortable.utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createSortableDragContext returns an empty context', () => {
    const context = createSortableDragContext();
    expect(context).toEqual({
      placeholder: null,
      lastHoverTarget: null,
      lastPlacement: null,
      sortContainer: null
    });
  });

  it('resetSortableDragContext removes placeholder and clears state', () => {
    const context = createSortableDragContext();
    const placeholder = document.createElement('div');
    document.body.appendChild(placeholder);

    context.placeholder = placeholder;
    context.lastHoverTarget = document.createElement('div');
    context.lastPlacement = { target: document.createElement('div'), after: true };
    context.sortContainer = document.createElement('div');

    resetSortableDragContext(context);

    expect(context.placeholder).toBeNull();
    expect(context.lastHoverTarget).toBeNull();
    expect(context.lastPlacement).toBeNull();
    expect(context.sortContainer).toBeNull();
    expect(document.body.contains(placeholder)).toBe(false);
  });

  it('createDropPlaceholder copies dimensions and style basics', () => {
    const source = document.createElement('div');
    source.style.margin = '8px';
    source.style.borderRadius = '6px';

    const placeholder = createDropPlaceholder(source, makeRect(0, 0, 120, 40), {
      borderStyle: '1px dotted',
      borderColor: 'red',
      background: 'pink',
      transitionDuration: 300
    });

    expect(placeholder.getAttribute('data-drop-placeholder')).toBe('true');
    expect(placeholder.style.width).toBe('120px');
    expect(placeholder.style.height).toBe('40px');
    expect(placeholder.style.border).toContain('dotted');
    expect(placeholder.style.background).toBe('pink');
    expect(placeholder.style.pointerEvents).toBe('none');
  });

  it('placePlaceholderAtPosition inserts placeholder and records placement', () => {
    const context = createSortableDragContext();
    const container = document.createElement('div');
    const source = document.createElement('div');
    const target = document.createElement('div');
    const other = document.createElement('div');
    const placeholder = document.createElement('div');

    source.className = 'item';
    target.className = 'item';
    other.className = 'item';
    placeholder.className = 'item';

    container.append(source, target, other);
    context.sortContainer = container;
    context.placeholder = placeholder;

    const strategy: SortingStrategy = {
      getInsertPosition: () => ({ index: 1, placeAfter: false })
    };

    const result = placePlaceholderAtPosition({
      context,
      itemSelector: '.item',
      strategy,
      dragSource: source,
      dropTarget: target,
      clientX: 10,
      clientY: 10,
      enableAnimations: true
    });

    expect(result).toEqual({ index: 1, placeAfter: false });
    expect(container.children[1]).toBe(placeholder);
    expect(context.lastPlacement).toEqual({ target, after: false });
    expect(captureMultipleFlipStates).toHaveBeenCalled();
    expect(animateMultipleFlips).toHaveBeenCalled();
  });

  it('placePlaceholderAtPosition returns null when context is incomplete', () => {
    const context = createSortableDragContext();
    const strategy: SortingStrategy = {
      getInsertPosition: () => ({ index: 0, placeAfter: false })
    };

    const result = placePlaceholderAtPosition({
      context,
      itemSelector: '.item',
      strategy,
      dragSource: document.createElement('div'),
      dropTarget: document.createElement('div'),
      clientX: 0,
      clientY: 0,
      enableAnimations: false
    });

    expect(result).toBeNull();
  });

  it('finalizeSortableDrop swaps placeholder with draggable and calls callback', () => {
    const context = createSortableDragContext();
    const container = document.createElement('div');
    const placeholder = document.createElement('div');
    const draggable = document.createElement('div');
    const onPlaced = vi.fn();

    container.appendChild(placeholder);
    context.placeholder = placeholder;
    context.sortContainer = container;

    const result = finalizeSortableDrop({ context, draggable, onPlaced });

    expect(result).toBe(true);
    expect(container.firstElementChild).toBe(draggable);
    expect(context.placeholder).toBeNull();
    expect(onPlaced).toHaveBeenCalledWith(draggable, container);
    expect(draggable.style.opacity).toBe('1');
    expect(draggable.style.pointerEvents).toBe('auto');
  });

  it('cancelSortableDrag restores drag source styles and clears context', () => {
    const context = createSortableDragContext();
    const placeholder = document.createElement('div');
    const dragSource = document.createElement('div');
    context.placeholder = placeholder;
    document.body.appendChild(placeholder);

    cancelSortableDrag(context, dragSource);

    expect(dragSource.style.opacity).toBe('1');
    expect(dragSource.style.pointerEvents).toBe('auto');
    expect(context.placeholder).toBeNull();
  });

  it('reorderDOMByIdentifiers orders listed ids first and keeps others after', () => {
    const container = document.createElement('div');
    const a = document.createElement('div');
    const b = document.createElement('div');
    const c = document.createElement('div');
    a.setAttribute('identifier', 'A');
    b.setAttribute('identifier', 'B');
    c.setAttribute('identifier', 'C');
    container.append(a, b, c);

    reorderDOMByIdentifiers(container, [a, b, c], ['C', 'A'], false);

    const ids = Array.from(container.children).map(el => (el as HTMLElement).getAttribute('identifier'));
    expect(ids).toEqual(['C', 'A', 'B']);
  });

  it('collectIdentifiersInOrder returns only truthy identifiers', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.setAttribute('identifier', 'A');
    expect(collectIdentifiersInOrder([a, b])).toEqual(['A']);
  });

  it('isElementInContainer returns containing container or null', () => {
    const container = document.createElement('div');
    const child = document.createElement('span');
    container.appendChild(child);

    expect(isElementInContainer(child, [container])).toBe(container);
    expect(isElementInContainer(document.createElement('div'), [container])).toBeNull();
  });
});
