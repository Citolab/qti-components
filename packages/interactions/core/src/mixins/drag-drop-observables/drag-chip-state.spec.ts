import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

/**
 * The hole a chip leaves behind is a custom state, not an inline `style.opacity`.
 *
 * `placeholder` — this chip's copy sits in a dropzone (matchMax reached)
 * `dragging`    — this chip's clone is following the cursor
 *
 * Themes style these. The mixins must no longer write opacity, and must no longer read it back
 * as if it were state (they used to do both: `d.style.opacity !== '0'`).
 */

type Chip = HTMLElement & { internals: ElementInternals };

const settle = () => new Promise(r => setTimeout(r, 300));
const chip = (identifier: string) => document.querySelector(`[identifier="${identifier}"]`) as Chip;

describe('drag chip states', () => {
  test('a chip whose copy is placed takes :state(placeholder) — and no inline opacity', async () => {
    document.body.innerHTML = `
      <qti-order-interaction response-identifier="R" response="B,A">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
        <qti-simple-choice identifier="B">B</qti-simple-choice>
      </qti-order-interaction>`;
    await settle();

    const a = chip('A');
    expect(a.internals.states.has('placeholder'), 'placed chip is a placeholder').toBe(true);
    expect(a.internals.states.has('drag'), 'placeholder is not marked as draggable role').toBe(false);
    expect(a.hasAttribute('qti-draggable'), 'spent source is not exposed as draggable').toBe(false);
    expect(a.hasAttribute('tabindex'), 'spent source leaves keyboard tab order').toBe(false);

    // presentation must no longer be painted onto the element
    expect(a.style.opacity, 'no inline opacity').toBe('');
    expect(a.style.pointerEvents, 'no inline pointer-events').toBe('');
  });

  test('an unplaced chip is neither placeholder nor dragging', async () => {
    document.body.innerHTML = `
      <qti-order-interaction response-identifier="R">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
      </qti-order-interaction>`;
    await settle();

    const a = chip('A');
    expect(a.internals.states.has('placeholder')).toBe(false);
    expect(a.internals.states.has('dragging')).toBe(false);
    // it is still a drag source
    expect(a.internals.states.has('drag')).toBe(true);
    expect(a.getAttribute('qti-draggable')).toBe('true');
    expect(a.getAttribute('tabindex')).toBe('0');
  });

  test('a successful drop clears `dragging` from the source — it must not stay mid-drag', async () => {
    document.body.innerHTML = `
      <qti-order-interaction response-identifier="R">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
        <qti-simple-choice identifier="B">B</qti-simple-choice>
      </qti-order-interaction>`;
    await settle();

    const interaction = document.querySelector('qti-order-interaction') as any;
    const drops = Array.from(interaction.shadowRoot.querySelectorAll(`[part~='drop']`)) as HTMLElement[];
    const a = chip('A');

    // simulate the source being hidden while its clone is in flight, then a successful landing
    a.internals.states.add('dragging');
    interaction.dragState = { ...interaction.dragState, dragging: true, dragSource: a, currentTarget: drops[0] };
    interaction.handleDragEnd();
    await settle();

    expect(a.internals.states.has('dragging'), 'transient state is cleared on a successful drop').toBe(false);
    // it may still be a placeholder — that is handleDrop's decision, not handleDragEnd's
  });

  test('qti-gap-img has ElementInternals, so it can carry the drag states too', async () => {
    document.body.innerHTML = `<qti-gap-img identifier="A"><img alt="" /></qti-gap-img>`;
    await settle();

    const img = chip('A');
    expect(img.internals).toBeTruthy();
    expect(() => img.internals.states.add('placeholder')).not.toThrow();
  });
});
