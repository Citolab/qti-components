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
export type DragChipState = 'dragging' | 'placeholder' | 'return-anchor';

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
  setDragChipState(el, 'return-anchor', false);
}

/** A chip that currently leaves a hole: not draggable, and skipped by keyboard navigation. */
export function isDragChipHidden(el: HTMLElement | null | undefined): boolean {
  return hasDragChipState(el, 'dragging') || hasDragChipState(el, 'placeholder');
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
 * Flags a drop target carries, readable from a theme.
 *
 * `filled`   — holds at least one chip
 * `active`   — a drag is in progress and this target could receive it
 * `enabled`  — same, kept distinct because the themes distinguish them
 * `hover`    — the chip is currently over this target
 */
export type DropFlag = 'filled' | 'active' | 'enabled' | 'hover';

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

  if (on) el.setAttribute(flag, '');
  else el.removeAttribute(flag);

  const states = internalsOf(el)?.states;
  if (states) {
    if (on) states.add(flag);
    else states.delete(flag);
    return;
  }

  const tokens = new Set((el.getAttribute('part') ?? '').split(/\s+/).filter(Boolean));
  // Only a drop target takes the token. `allDropzones` also holds the drag container — a
  // `<slot part="drags">` — and stamping it would rewrite a part list that other selectors read.
  if (!tokens.has('drop')) return;
  if (on) tokens.add(flag);
  else tokens.delete(flag);
  el.setAttribute('part', [...tokens].join(' '));
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

/**
 * Measure the chips and publish the result as custom properties on the interaction host.
 *
 * JavaScript owns the *measurement*; CSS owns the *properties*. Each droppable's stylesheet
 * reads `min-height: var(--qti-dropzone-min-height, 0)` etc., so nothing is written to
 * `element.style` and a theme can override any of them by setting the variable.
 *
 * This also removes a precedence trap: when both `min-width` and `width` were written inline,
 * `min-width` silently won, discarding an authored `data-choices-container-width`.
 *
 * Measurement only — no scheduling and no `this`. `DropzoneAutoSizeMixin` owns when this runs.
 *
 * A branch that wrote an inline `grid-template-columns` on the drops' container when the droppables
 * were `qti-simple-associable-choice` was deleted. It fired only for match, which had auto-sizing
 * off, so it never ran; turning match's measurement on would have woken it, and it overrode
 * `--qti-match-target-min-width` — the one responsive breakpoint `qti-match-interaction.styles.ts`
 * deliberately owns. It was also the one write here that could not work in the editor, where that
 * parent is a ProseMirror-managed node.
 */
export function applyDropzoneAutoSizing(
  host: HTMLElement,
  draggables: HTMLElement[],
  droppables: HTMLElement[],
  dragContainers: HTMLElement[],
  options: {
    hostWindow?: Window | null;
    /**
     * Called with the measurement before anything is written; return false to skip the write.
     * `DropzoneAutoSizeMixin` uses it to suppress a no-op write, which is what keeps its
     * `ResizeObserver` from feeding itself.
     */
    hasChanged?: (measured: { height: number; width: number }) => boolean;
  } = {}
): void {
  const hostWindow = options.hostWindow ?? (typeof window !== 'undefined' ? window : null);
  if (!draggables.length || !droppables.length || !hostWindow) return;

  let maxDraggableHeight = 0;
  let maxDraggableWidth = 0;

  /*
   * Measure each chip at its INTRINSIC width, with any minimum this pass previously gave it
   * neutralised — otherwise the measurement reads its own output and the result is a one-way ratchet.
   *
   * `@mixin drag` gives a chip `min-width: var(--qti-dropzone-min-width)`, which is what makes a chip
   * and its slot the same size. It also means that once the widest chip has set the reservation,
   * every chip is at least that wide — so shortening the longest one can never bring the number back
   * down. Measured: a chip edited from 191px of text back to 106px left the reservation at 191px
   * forever, and with it every chip and every drop.
   *
   * Growing was never the problem; not being able to shrink was. Nothing paints between the
   * neutralise and the restore, so this is invisible.
   */
  const restore = draggables.map(d => d.style.minWidth);
  draggables.forEach(d => (d.style.minWidth = '0'));

  draggables.forEach(draggable => {
    const rect = draggable.getBoundingClientRect();
    maxDraggableHeight = Math.max(maxDraggableHeight, rect.height);
    maxDraggableWidth = Math.max(maxDraggableWidth, rect.width);
  });

  draggables.forEach((d, i) => (d.style.minWidth = restore[i]));

  if (options.hasChanged?.({ height: maxDraggableHeight, width: maxDraggableWidth }) === false) return;

  // Measured values go on `host` as custom properties; each droppable's own stylesheet reads them.
  // A theme overrides by setting the same variable on the droppable, which is closer.
  //
  // `host` is not necessarily the interaction: custom properties inherit down the flat tree, so any
  // ancestor of the drops will do, and a host whose own attributes are policed (the editor, under
  // ProseMirror) passes a node inside its shadow root instead.
  //
  // Both axes, for every dropzone. `--qti-dropzone-min-width` used to reach only gaps and the
  // match grid, so order's and associate's drops were tall enough for the largest chip but not
  // wide enough for it, and a drop grew sideways the moment one landed.
  host.style.setProperty('--qti-dropzone-min-height', `${maxDraggableHeight}px`);
  host.style.setProperty('--qti-dropzone-min-width', `${maxDraggableWidth}px`);

  dragContainers.forEach(dragContainer => {
    dragContainer.style.minHeight = `var(--qti-drag-container-min-height, ${maxDraggableHeight}px)`;
  });
}
