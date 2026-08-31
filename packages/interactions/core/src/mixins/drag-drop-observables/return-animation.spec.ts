import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

/**
 * A chip that goes home travels there.
 *
 * `restoreOriginalInInventory` used to make the returning chip reappear in the bank with no
 * animation at all — or, worse, sweep it into the sibling FLIP, where it was captured while still
 * `display: none`. Its "first" rect was 0×0 at the viewport origin, so it flew in from the top-left
 * corner of the screen at `scale(0)`. It now animates from the rect the chip actually occupied.
 *
 * The catch, and the reason this file exists: a FLIP animation puts a `transform` on the element,
 * and `getBoundingClientRect` reports the *transformed* box. A chip grabbed mid-flight therefore
 * reported a box that was still moving — `createDragClone` copied the half-applied transform, and
 * the drop resolved against the wrong rect. In Q8-L2-D2 that turned a correct pairing into SCORE=0,
 * with nothing in the failure to suggest an animation was involved.
 *
 * So: picking a chip up cancels whatever it was doing.
 */

const settle = () => new Promise(r => setTimeout(r, 300));
const el = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const byId = (identifier: string) => el(`[identifier="${identifier}"]`);

const mount = async () => {
  document.body.innerHTML = `
    <qti-gap-match-interaction response-identifier="R">
      <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
      <qti-gap-text identifier="summer" match-max="1">summer</qti-gap-text>
      <p>In the <qti-gap identifier="G1"></qti-gap> of our discontent.</p>
    </qti-gap-match-interaction>`;
  await settle();
  return el<any>('qti-gap-match-interaction');
};

describe('a chip picked up mid-flight starts from where it really is', () => {
  test('initiateDrag cancels a running animation on the chip', async () => {
    const interaction = await mount();
    const chip = byId('winter');

    // Stand in for a return animation still playing. `fill: 'both'` is what FLIP uses, and it is
    // what makes the transform outlive the animation's active phase.
    chip.animate([{ transform: 'translate(200px, 120px)' }, { transform: 'none' }], {
      duration: 10_000,
      fill: 'both'
    });
    await new Promise(requestAnimationFrame);

    expect(chip.getAnimations().length, 'the chip is mid-flight').toBe(1);

    const displaced = chip.getBoundingClientRect();
    interaction.initiateDrag(chip, displaced.left, displaced.top, 'mouse');

    expect(chip.getAnimations().length, 'grabbing it lands it').toBe(0);

    interaction.handleDragEnd();
    await settle();
  });

  test('the box a drag starts from is the layout box, not the animated one', async () => {
    const interaction = await mount();
    const chip = byId('summer');

    const atRest = chip.getBoundingClientRect();

    // Both keyframes hold the displacement. A single keyframe is read as the *to* value, so the
    // chip would sit at `transform: none` on the frame this test looks at, and the test would pass
    // while proving nothing.
    chip.animate([{ transform: 'translate(200px, 120px)' }, { transform: 'translate(200px, 120px)' }], {
      duration: 10_000,
      fill: 'both'
    });
    await new Promise(requestAnimationFrame);

    const midFlight = chip.getBoundingClientRect();
    expect(midFlight.left, 'the transform really does move the reported box').not.toBe(atRest.left);

    interaction.initiateDrag(chip, atRest.left, atRest.top, 'mouse');

    const afterGrab = chip.getBoundingClientRect();
    expect(afterGrab.left, 'back to its layout box').toBe(atRest.left);
    expect(afterGrab.top).toBe(atRest.top);

    interaction.handleDragEnd();
    await settle();
  });
});
