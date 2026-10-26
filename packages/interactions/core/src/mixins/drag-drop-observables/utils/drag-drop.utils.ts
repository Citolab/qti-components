import { hasState, setState } from '@qti-components/base';

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
 * Presentation states on a source chip in the drag bank (CONTRACT.md §3). Two of them leave a hole
 * where the chip was; all are styled by CSS rather than by writing `element.style.opacity` here.
 *
 * - `lifted`        — this chip's clone is currently following the cursor.
 * - `used`          — every copy of this chip sits in a dropzone (`matchMax` reached).
 * - `return-target` — where a re-dragged placed chip goes back to on an invalid drop.
 *
 * `lifted` and `used` are distinct: a theme may want a dashed outline while lifted and a solid inset
 * box once used. Each is set with its old name too (`dragging`, `placeholder`, `return-anchor`) for
 * one major; see `STATE_ALIASES` in qti-base.
 */
export type DragChipState = 'lifted' | 'used' | 'return-target';

const internalsOf = (el: HTMLElement | null | undefined): ElementInternals | undefined =>
  (el as { internals?: ElementInternals } | null | undefined)?.internals;

export function setDragChipState(el: HTMLElement | null | undefined, state: DragChipState, on: boolean): void {
  setState(internalsOf(el)?.states, state, on);
}

export function hasDragChipState(el: HTMLElement | null | undefined, state: DragChipState): boolean {
  return hasState(internalsOf(el)?.states, state);
}

/** Clear every bank-chip state — the chip is back in the bank and interactive again. */
export function clearDragChipStates(el: HTMLElement | null | undefined): void {
  setDragChipState(el, 'lifted', false);
  setDragChipState(el, 'used', false);
  setDragChipState(el, 'return-target', false);
}

/** A chip that currently leaves a hole: not draggable, and skipped by keyboard navigation. */
export function isDragChipHidden(el: HTMLElement | null | undefined): boolean {
  return hasDragChipState(el, 'lifted') || hasDragChipState(el, 'used');
}

/**
 * Mark a drop target as holding at least one chip.
 *
 * Two spellings, because the five drop targets are not the same kind of thing and cannot be made
 * so. `qti-gap`, `qti-associable-hotspot` and `qti-simple-associable-choice` are custom elements
 * with an `ElementInternals`, so they take a real custom state. Order's and associate's targets are
 * plain `<div part="drop">` in the interaction's shadow root, and **a div cannot carry
 * `:state()`** — there is no `attachInternals` for it. They take an extra part token instead.
 *
 * Both are reachable, and a theme addresses them the same way it addresses a chip's three homes:
 *
 *   :state(filled)    the light-DOM custom-element targets
 *   ::part(filled)    the shadow-resident divs — and `::part(drop)` still matches them
 *
 * Verified in Chromium: an extra part token does not stop `::part(drop)` matching, and an unfilled
 * target matches neither.
 *
 * Replaces `data-has-drop`, which was set in exactly one of the branches that could set it and
 * removed in two that could not.
 */
/**
 * Flags a drop target carries, readable from a theme (CONTRACT.md §3).
 *
 * `filled`      — holds at least one chip
 * `full`        — takes no more chips
 * `drag-active` — a drag is in progress and this target could receive it
 * `drag-over`   — the dragged chip is currently over this target
 *
 * Each is written with its old spelling too, for one major: `drag-active` was `active` + `enabled`
 * (always set together, never painted apart), `drag-over` was `hover`. `full` is new; it replaces
 * the `disabled` attribute, which `setDropFull` still writes because the drag code reads it.
 */
export type DropFlag = 'filled' | 'full' | 'drag-active' | 'drag-over';

const DROP_FLAG_ALIASES: Readonly<Record<DropFlag, readonly string[]>> = {
  filled: [],
  full: [],
  'drag-active': ['active', 'enabled'],
  'drag-over': ['hover']
};

/**
 * Set a flag on a drop target, in the only spelling that element can carry.
 *
 * Verified in Chromium, and it is the whole reason there are two spellings:
 *
 *   ::part(x):state(y)   MATCHES  — but only when x is a custom element
 *   ::part(x)[attr]      never matches
 *   ::part(x):has(…)     never matches
 *   ::part(y)  (token)   MATCHES  — on anything
 *
 * A plain `<div>` cannot carry a custom state: `attachInternals()` throws NotSupportedError. So
 * order's and associate's `<div part="drop">` take an extra part token, and a theme reaches them as
 * `::part(active)`. The custom-element targets take a real state.
 *
 * The plain attribute is written too, because shadow-internal styles and existing vendor rules
 * still select on it. Nothing reads it from the document — nothing can.
 */
export function setDropFlag(el: HTMLElement | null | undefined, flag: DropFlag, on: boolean): void {
  if (!el) return;

  const names = [flag, ...DROP_FLAG_ALIASES[flag]];
  for (const name of names) {
    if (on) el.setAttribute(name, '');
    else el.removeAttribute(name);
  }

  const states = internalsOf(el)?.states;
  if (states) {
    setState(states, flag, on, DROP_FLAG_ALIASES[flag]);
    return;
  }

  const tokens = new Set((el.getAttribute('part') ?? '').split(/\s+/).filter(Boolean));
  // A drop target or the bank (`<slot part="bank">`) takes the token; every selector that reads
  // either part is a `~=` match, so a second token changes nothing else.
  if (!tokens.has('drop') && !tokens.has('bank')) return;
  for (const name of names) {
    if (on) tokens.add(name);
    else tokens.delete(name);
  }
  el.setAttribute('part', [...tokens].join(' '));
}

/**
 * A target at capacity. The drag code still reads the `disabled` attribute this writes (collision
 * filtering, `allowDrop`, the sortable's peer handling); the theme reads `full`. `disabled` on a
 * drop target goes when the alias period ends.
 */
export function setDropFull(el: HTMLElement | null | undefined, full: boolean): void {
  if (!el) return;
  if (full) el.setAttribute('disabled', '');
  else el.removeAttribute('disabled');
  setDropFlag(el, 'full', full);
}

export function setDropFilled(el: HTMLElement | null | undefined, filled: boolean): void {
  setDropFlag(el, 'filled', filled);
}

/** Does this drop target currently hold a chip? Reads whichever spelling the target uses. */
export function isDropFilled(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  const states = internalsOf(el)?.states;
  if (states) return states.has('filled');
  return (el.getAttribute('part') ?? '').split(/\s+/).includes('filled');
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
