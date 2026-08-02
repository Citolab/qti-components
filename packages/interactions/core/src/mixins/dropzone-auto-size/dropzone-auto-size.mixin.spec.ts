import { describe, expect, it } from 'vitest';

import { applyDropzoneAutoSizing } from './dropzone-auto-size.mixin';

/**
 * The measurement pass, unit-tested directly.
 *
 * It moved here with the function itself: `drag-drop.utils` no longer knows anything about dropzone
 * sizing, so its spec should not either. Behaviour under repetition — the ratchet and the observer
 * loop, which is where the real bugs were — is covered by `../measurement-stability.spec.ts` against
 * a live interaction; these two pin the write contract, which is easier to state with fake rects
 * than with a real layout.
 */

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

describe('applyDropzoneAutoSizing', () => {
  it('publishes min sizes on the host and the drag container, and writes nothing else', () => {
    const draggableA = makeElement({ left: 0, top: 0, width: 40, height: 30 });
    const draggableB = makeElement({ left: 0, top: 0, width: 50, height: 40 });

    const dropContainer = document.createElement('div');
    Object.defineProperty(dropContainer, 'clientWidth', { value: 200 });

    const droppable = makeElement(undefined, 'qti-simple-associable-choice');
    droppable.attachShadow({ mode: 'open' });
    const slot = document.createElement('slot');
    slot.setAttribute('part', 'drop');
    droppable.shadowRoot?.appendChild(slot);
    dropContainer.appendChild(droppable);

    const dragContainer = document.createElement('div');

    const hostWindow = {
      innerWidth: 1024,
      getComputedStyle: () => ({ paddingLeft: '10', paddingRight: '10' })
    } as unknown as Window;

    const host = document.createElement('div');

    applyDropzoneAutoSizing(host, [draggableA, draggableB], [droppable], [dragContainer], { hostWindow });

    // Measurements are published as custom properties; each droppable's own stylesheet reads them.
    // Nothing is written to a droppable's style attribute.
    expect(host.style.getPropertyValue('--qti-dropzone-min-height')).toBe('40px');
    expect(host.style.getPropertyValue('--qti-dropzone-min-width')).toBe('50px');
    expect(droppable.getAttribute('style')).toBeNull();
    expect(slot.getAttribute('style')).toBeNull();

    // The drag container carries the reservation too, so a host whose chips and drops share no
    // ancestor inside its shadow root can still reach both without writing to the light DOM.
    expect(dragContainer.style.minHeight).toBe('var(--qti-drag-container-min-height, 40px)');
    expect(dragContainer.style.getPropertyValue('--qti-dropzone-min-height')).toBe('40px');
    expect(dragContainer.style.getPropertyValue('--qti-dropzone-min-width')).toBe('50px');

    // The drops' own container is not touched either. This used to get an inline
    // `grid-template-columns` when the droppables were qti-simple-associable-choice, which
    // overrode --qti-match-target-min-width — the one responsive breakpoint match's stylesheet
    // deliberately owns — and could not run in the editor, where that parent is a ProseMirror node.
    expect(dropContainer.getAttribute('style')).toBeNull();
  });

  it('publishes the height but never the width when publishWidth is false', () => {
    const draggable = makeElement({ left: 0, top: 0, width: 40, height: 30 });
    const droppable = makeElement();
    const dragContainer = document.createElement('div');
    const host = document.createElement('div');
    const hostWindow = { innerWidth: 1024, getComputedStyle: () => ({}) } as unknown as Window;

    applyDropzoneAutoSizing(host, [draggable], [droppable], [dragContainer], {
      hostWindow,
      publishWidth: false
    });

    // The height axis is unaffected — only the axis the author has spoken for is given up.
    expect(host.style.getPropertyValue('--qti-dropzone-min-height')).toBe('30px');
    expect(dragContainer.style.getPropertyValue('--qti-dropzone-min-height')).toBe('30px');

    // Not written, rather than written and undone by whoever runs next. `data-choices-container-width`
    // sets `width`, and `min-width` beats `width`, so any published width discards the authored one.
    // Both write targets have to stay clear: a slot sits closer to a chip than the host does, so a
    // width on the slot would win even with the host left alone.
    expect(host.style.getPropertyValue('--qti-dropzone-min-width')).toBe('');
    expect(dragContainer.style.getPropertyValue('--qti-dropzone-min-width')).toBe('');
  });

  it('writes both width names together, so a chip stays the size of its slot', () => {
    const draggable = makeElement({ left: 0, top: 0, width: 50, height: 40 });
    const droppable = makeElement();
    const dragContainer = document.createElement('div');
    const host = document.createElement('div');
    const hostWindow = { innerWidth: 1024, getComputedStyle: () => ({}) } as unknown as Window;

    applyDropzoneAutoSizing(host, [draggable], [droppable], [dragContainer], { hostWindow });

    // Two names, one measurement. They exist as two only so their UNMEASURED defaults can differ —
    // a chip keeps its natural width, a drop is worth whatever its own fallback says — and writing
    // both is the entire mechanism by which a chip and its slot come out the same size. Neither is
    // declared globally (tools/stylelint/no-declared-measured-token.mjs), so this pass is the only
    // thing that ever gives either of them a value.
    expect(host.style.getPropertyValue('--qti-dropzone-min-width')).toBe('50px');
    expect(host.style.getPropertyValue('--qti-drag-min-width')).toBe('50px');
    expect(dragContainer.style.getPropertyValue('--qti-dropzone-min-width')).toBe('50px');
    expect(dragContainer.style.getPropertyValue('--qti-drag-min-width')).toBe('50px');
  });

  it('measures without ever writing to a chip, which is what makes it safe under ProseMirror', () => {
    const draggable = makeElement({ left: 0, top: 0, width: 50, height: 40 });
    const droppable = makeElement();
    const dragContainer = document.createElement('div');
    const host = document.createElement('div');
    const hostWindow = { innerWidth: 1024, getComputedStyle: () => ({}) } as unknown as Window;

    applyDropzoneAutoSizing(host, [draggable], [droppable], [dragContainer], { hostWindow });

    // The ratchet fix neutralises the reservation before measuring, and it must do that on the SLOT,
    // never inline on each chip. A chip is a light-DOM node the editor's ProseMirror document owns;
    // PM's DOMObserver runs with `attributes: true`, so a `style` attribute it did not author marks
    // the node dirty, it re-renders, and the re-render re-triggers the measurement. That loop
    // freezes the tab. Pointing `dropzonePropertyTarget()` at a shadow node does not help — that
    // moves where the RESULT lands, not where the measurement pokes.
    expect(draggable.getAttribute('style')).toBeNull();
  });

  it('works with the editor shape: a shadow property target and a div drag container', () => {
    // QtiOrderInteractionEdit / QtiAssociateInteractionEdit / QtiGapMatchInteractionEdit apply
    // DropzoneAutoSizeMixin directly to Interaction — no DragDropCoreMixin, their own drag handling
    // inside a ProseMirror document — and override `dropzonePropertyTarget()` to a node inside their
    // shadow root. The editor's drag container is a <div part="drags">, not upstream's <slot>.
    //
    // This pins the arrangement those three depend on: everything lands inside the shadow root, and
    // the ProseMirror-owned host is left without so much as an empty style attribute.
    const proseMirrorHost = document.createElement('qti-order-interaction');
    proseMirrorHost.attachShadow({ mode: 'open' });
    const propertyTarget = document.createElement('div');
    propertyTarget.setAttribute('part', 'container');
    const dragContainer = document.createElement('div');
    dragContainer.setAttribute('part', 'drags');
    propertyTarget.appendChild(dragContainer);
    proseMirrorHost.shadowRoot?.appendChild(propertyTarget);

    const draggable = makeElement({ left: 0, top: 0, width: 60, height: 24 }, 'qti-simple-choice');
    const droppable = makeElement(undefined, 'drop-list');
    const hostWindow = { innerWidth: 1024, getComputedStyle: () => ({}) } as unknown as Window;

    applyDropzoneAutoSizing(propertyTarget, [draggable], [droppable], [dragContainer], { hostWindow });

    expect(propertyTarget.style.getPropertyValue('--qti-dropzone-min-height')).toBe('24px');
    expect(propertyTarget.style.getPropertyValue('--qti-dropzone-min-width')).toBe('60px');
    expect(dragContainer.style.getPropertyValue('--qti-drag-min-width')).toBe('60px');

    // The one thing the editor cannot tolerate.
    expect(proseMirrorHost.getAttribute('style')).toBeNull();
  });

  it('skips the write when hasChanged says nothing moved, leaving no style attribute behind', () => {
    const draggable = makeElement({ left: 0, top: 0, width: 40, height: 30 });
    const droppable = makeElement();
    const host = document.createElement('div');
    const hostWindow = { innerWidth: 1024, getComputedStyle: () => ({}) } as unknown as Window;

    applyDropzoneAutoSizing(host, [draggable], [droppable], [], { hostWindow, hasChanged: () => false });

    // Not merely empty: the neutralise/restore round trip must not leave `style=""` behind, because
    // an empty attribute is still a mutation record for ProseMirror.
    expect(host.getAttribute('style')).toBeNull();
  });
});
