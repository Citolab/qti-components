export function findDraggableTarget(event: Event, draggablesSelector: string): HTMLElement | null {
  const composedPath = event.composedPath ? event.composedPath() : [event.target];

  for (const element of composedPath) {
    if (element instanceof HTMLElement && element.tagName !== 'SLOT') {
      if (element.matches(draggablesSelector) || element.hasAttribute('qti-draggable')) {
        return element;
      }

      const closest = element.closest(draggablesSelector) || element.closest('[qti-draggable="true"]');
      if (closest) {
        return closest as HTMLElement;
      }
    }
  }

  return null;
}

/**
 * Draggable chips express `disabled` through ElementInternals — the ARIA property feeds the
 * accessibility tree and the custom state feeds CSS. The `aria-disabled` attribute is not
 * reflected, so it cannot be read back off the element.
 *
 * A bare `disabled` attribute is still honoured as an authoring escape hatch.
 */
export function isDraggableDisabled(target: HTMLElement | null | undefined): boolean {
  if (!target) return false;
  if (target.hasAttribute('disabled')) return true;

  const internals = (target as { internals?: ElementInternals }).internals;
  return internals?.states?.has('disabled') ?? false;
}

/**
 * Presentation states on a source chip in the drag bank. Both leave a hole where the chip was,
 * and both are styled by CSS rather than by writing `element.style.opacity` from here.
 *
 * - `dragging`    — this chip's clone is currently following the cursor.
 * - `placeholder` — this chip's copy sits in a dropzone (`matchMax` reached).
 *
 * They are distinct: a theme may want a dashed outline while dragging and a solid inset box
 * once placed.
 */
export type DragChipState = 'dragging' | 'placeholder';

const internalsOf = (el: HTMLElement | null | undefined): ElementInternals | undefined =>
  (el as { internals?: ElementInternals } | null | undefined)?.internals;

export function setDragChipState(el: HTMLElement | null | undefined, state: DragChipState, on: boolean): void {
  const states = internalsOf(el)?.states;
  if (!states) return;
  if (on) states.add(state);
  else states.delete(state);
}

export function hasDragChipState(el: HTMLElement | null | undefined, state: DragChipState): boolean {
  return internalsOf(el)?.states?.has(state) ?? false;
}

/** Clear both hole-leaving states — the chip is back in the bank and interactive again. */
export function clearDragChipStates(el: HTMLElement | null | undefined): void {
  setDragChipState(el, 'dragging', false);
  setDragChipState(el, 'placeholder', false);
}

/** A chip that currently leaves a hole: not draggable, and skipped by keyboard navigation. */
export function isDragChipHidden(el: HTMLElement | null | undefined): boolean {
  return hasDragChipState(el, 'dragging') || hasDragChipState(el, 'placeholder');
}

// Re-export collision detection types and functions for convenience
export type { CollisionDetectionAlgorithm } from './collision.utils';
export {
  detectCollision,
  getCollisionDetectionStrategy,
  pointerWithinCollision,
  rectangleIntersectionCollision,
  closestCenterCollision,
  closestCornersCollision
} from './collision.utils';

export function findInventoryItems(dragContainers: HTMLElement[], identifier: string): HTMLElement[] {
  const items: HTMLElement[] = [];

  dragContainers.forEach(container => {
    let matches: Element[] = [];

    if (container.tagName.toLowerCase() === 'slot') {
      const slotElement = container as HTMLSlotElement;
      const assignedElements = slotElement.assignedElements({ flatten: true });

      matches = assignedElements.filter(el => el.getAttribute('identifier') === identifier);
    } else {
      matches = Array.from(container.querySelectorAll(`[identifier="${identifier}"]`));
    }

    items.push(...(matches as HTMLElement[]));
  });

  return items;
}

export function getMatchMaxValue(draggables: HTMLElement[], identifier: string): number {
  const element = draggables.find(el => el.getAttribute('identifier') === identifier);
  if (!element) return 1;

  const matchMax = element.getAttribute('match-max');
  return matchMax ? parseInt(matchMax, 10) || 0 : 1;
}

/**
 * @deprecated No longer used in production. DragDropSlottedMixin now derives placement once,
 * in `syncDragDropState()`, and publishes it on `dragDropContext`. Kept only because its spec
 * documents the exact counting semantics that method reproduces:
 * response uses the structural selector, capacity uses max(selector, [qti-draggable]).
 * Delete once drop targets render from the context.
 */
export function isDroppableAtCapacity(droppable: HTMLElement, draggablesSelector: string): boolean {
  const parsedMatchMax = parseInt(droppable.getAttribute('match-max') || '1', 10);
  const matchMax = Number.isNaN(parsedMatchMax) ? 1 : parsedMatchMax;
  if (matchMax === 0) return false;

  const selectorMatches = droppable.querySelectorAll(draggablesSelector);
  const attributeMatches = droppable.querySelectorAll('[qti-draggable="true"]');
  const current = Math.max(selectorMatches.length, attributeMatches.length);

  return current >= matchMax;
}

/**
 * @deprecated No longer used in production. DragDropSlottedMixin now derives placement once,
 * in `syncDragDropState()`, and publishes it on `dragDropContext`. Kept only because its spec
 * documents the exact counting semantics that method reproduces:
 * response uses the structural selector, capacity uses max(selector, [qti-draggable]).
 * Delete once drop targets render from the context.
 */
export function countTotalAssociations(droppables: HTMLElement[], draggablesSelector: string): number {
  return droppables.reduce((total, droppable) => {
    const selectorMatches = droppable.querySelectorAll(draggablesSelector).length;
    const attributeMatches = droppable.querySelectorAll('[qti-draggable="true"]').length;
    return total + Math.max(selectorMatches, attributeMatches);
  }, 0);
}

/**
 * @deprecated No longer used in production. DragDropSlottedMixin now derives placement once,
 * in `syncDragDropState()`, and publishes it on `dragDropContext`. Kept only because its spec
 * documents the exact counting semantics that method reproduces:
 * response uses the structural selector, capacity uses max(selector, [qti-draggable]).
 * Delete once drop targets render from the context.
 */
export function collectResponseData(droppables: HTMLElement[], draggablesSelector: string): string[] {
  return droppables
    .map(droppable => {
      const draggablesInDroppable = Array.from(droppable.querySelectorAll<HTMLElement>(draggablesSelector));
      const identifiers = draggablesInDroppable
        .map(element => element.getAttribute('identifier'))
        .filter((identifier): identifier is string => Boolean(identifier));
      const droppableIdentifier = droppable.getAttribute('identifier');
      return identifiers.map(id => `${id} ${droppableIdentifier}`);
    })
    .flat();
}

export function applyDropzoneAutoSizing(
  draggables: HTMLElement[],
  droppables: HTMLElement[],
  dragContainers: HTMLElement[],
  hostWindow: Window | null = typeof window !== 'undefined' ? window : null
): void {
  if (!draggables.length || !droppables.length || !hostWindow) return;

  let maxDraggableHeight = 0;
  let maxDraggableWidth = 0;

  draggables.forEach(draggable => {
    const rect = draggable.getBoundingClientRect();
    maxDraggableHeight = Math.max(maxDraggableHeight, rect.height);
    maxDraggableWidth = Math.max(maxDraggableWidth, rect.width);
  });

  const dropContainer: HTMLElement | null = droppables[0].parentElement;

  const isGridLayout = droppables[0].tagName === 'QTI-SIMPLE-ASSOCIABLE-CHOICE';
  const isGapElement = droppables[0].tagName === 'QTI-GAP';

  if (isGridLayout && dropContainer) {
    let maxWidth: number;

    if (dropContainer.clientWidth > 0) {
      const styles = hostWindow.getComputedStyle(dropContainer);
      const paddingLeft = parseFloat(styles.paddingLeft);
      const paddingRight = parseFloat(styles.paddingRight);
      maxWidth = dropContainer.clientWidth - paddingLeft - paddingRight;
    } else {
      maxWidth = Math.min(hostWindow.innerWidth * 0.8, 600);
    }

    dropContainer.style.gridTemplateColumns = `repeat(auto-fit, minmax(calc(min(${maxWidth}px, ${maxDraggableWidth}px + 2 * var(--qti-dropzone-padding, 0.5rem))), 1fr))`;
  }

  droppables.forEach(droppable => {
    droppable.style.minHeight = `var(--qti-dropzone-min-height, ${maxDraggableHeight}px)`;

    if (isGridLayout || isGapElement) {
      droppable.style.minWidth = `${maxDraggableWidth}px`;
    }

    const dropSlot: HTMLElement | null = droppable.shadowRoot?.querySelector('slot[part="dropslot"]');
    if (dropSlot) {
      dropSlot.style.minHeight = `var(--qti-dropzone-min-height, ${maxDraggableHeight}px)`;
    }
  });

  dragContainers.forEach(dragContainer => {
    dragContainer.style.minHeight = `var(--qti-drag-container-min-height, ${maxDraggableHeight}px)`;
  });
}
