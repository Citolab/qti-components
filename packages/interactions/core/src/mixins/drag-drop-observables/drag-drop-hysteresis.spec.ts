import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

/**
 * The hover highlight must not decide the drop.
 *
 * handleDragMove latches `currentTarget` for MIN_TARGET_SWITCH_INTERVAL (50ms) so the `hover`
 * outline does not flicker as a chip passes between adjacent zones. That is a presentation
 * concern. handleDragEnd used to drop into the latched value, which made it an outcome concern:
 * a drag whose moves all land inside a single 50ms window can never update `currentTarget`, so
 * it keeps the first zone its path happened to cross — no matter where the user let go.
 *
 * A flick is well under 50ms. So is any programmatic drag, which is how the conformance suite
 * moves chips.
 */

const settle = () => new Promise(r => setTimeout(r, 300));
const el = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const byId = (identifier: string) => el(`[identifier="${identifier}"]`);

describe('drag-drop hysteresis governs the highlight, not the drop', () => {
  test('a drop resolves where the chip rests, not where the latch is pointing', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R" style="width: 400px">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <!--
          The sentence sits well clear of the drag bank. The inventory-priority collision
          strategy prefers the bank whenever it is within 1.5x the distance of the nearest
          dropzone, so a fixture with the two on top of each other tests that heuristic rather
          than the thing under test.
        -->
        <p style="margin-top: 240px">
          In the <qti-gap identifier="G1"></qti-gap> of our discontent, made glorious
          <qti-gap identifier="G2"></qti-gap> by this sun of York.
        </p>
      </qti-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');
    const chip = byId('winter');
    const g1 = byId('G1');

    // Stand a clone squarely over G1 — this is the chip's resting position at mouseup.
    const target = g1.getBoundingClientRect();
    const clone = chip.cloneNode(true) as HTMLElement;
    clone.setAttribute('data-drag-clone', '');
    // What initiateDrag stamps on a clone lifted out of the bank. The inventory-priority
    // collision strategy reads it to decide how eagerly a chip falls back to the drag bank.
    clone.setAttribute('data-drag-origin', 'inventory');
    Object.assign(clone.style, {
      position: 'fixed',
      left: `${target.left}px`,
      top: `${target.top}px`,
      width: `${target.width}px`,
      height: `${target.height}px`
    });
    document.body.appendChild(clone);

    // ...while the latch still points at G2, as it would after a sub-50ms flick whose path
    // grazed G2 on the way to G1.
    interaction.dragState = {
      dragging: true,
      dragSource: chip,
      dragClone: clone,
      currentTarget: byId('G2'),
      sourceDroppable: null,
      startOffset: { x: 0, y: 0 },
      inputType: 'mouse'
    };

    interaction.handleDragEnd();
    await settle();

    expect(interaction.response, 'the chip landed in the gap it was released over').toBe('winter G1');
  });
});
