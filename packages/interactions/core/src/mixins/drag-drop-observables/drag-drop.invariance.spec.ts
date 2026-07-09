import normalizeCss from 'modern-normalize/modern-normalize.css?inline';
import { expect, test, describe, beforeEach } from 'vitest';

import '@qti-components/interactions';

import itemCss from '../../../../../qti-theme/src/item.css?inline';
import kennisnetCss from '../../../../../qti-theme/src/kennisnet-override.scss?inline';

/**
 * Layout-invariance tests for drag and drop.
 *
 * Two rules, stated as measurements rather than as prose:
 *
 *   1. A drag is dimensionally invariant. A chip's border-box is the same size sitting in the
 *      bank, mid-flight as a clone, and after it has been dropped. Lifting a chip must not
 *      resize it, and must not resize the hole it leaves behind.
 *
 *   2. A drop's outer box is constant. Filling a dropzone must not change its own dimensions,
 *      and starting a drag must not move any dropzone.
 *
 * These exist because breaking either one produces a bug that is invisible to both VRT and the
 * conformance suite. VRT compares end states, and the end state is usually fine; conformance
 * asserts the response string, which reports *that* a chip landed in the wrong gap but never
 * *why*. The actual failure is transient: at drag start the source chip leaves the flow, the
 * bank rewraps, the gaps shrink, the sentence reflows, and the gap the user aimed at slides out
 * from under the pointer while the pointer is on its way there. The drop then lands in the
 * neighbouring gap, and collision detection is blamed for reporting it accurately.
 *
 * A pixel is a much better error message than a wrong response string.
 */

const settle = () => new Promise(r => setTimeout(r, 300));

type Chip = HTMLElement & { internals: ElementInternals };
const el = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const byId = (identifier: string) => el<Chip>(`[identifier="${identifier}"]`);

/** Border-box size, rounded — sub-pixel text metrics are not the subject of these tests. */
const boxOf = (e: Element) => {
  const r = e.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height) };
};
const originOf = (e: Element) => {
  const r = e.getBoundingClientRect();
  return { x: Math.round(r.left), y: Math.round(r.top) };
};

/**
 * A wrapping drag bank is the point. A single-line bank cannot rewrap, so it cannot expose the
 * bug: the chips have to be wide enough, and numerous enough, that losing one reflows the rest.
 */
const GAP_MATCH = `
  <qti-gap-match-interaction response-identifier="R" style="width: 320px">
    <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
    <qti-gap-text identifier="summer" match-max="1">summer</qti-gap-text>
    <qti-gap-text identifier="autumn" match-max="1">autumn</qti-gap-text>
    <p>
      In the <qti-gap identifier="G1"></qti-gap> of our discontent, made glorious
      <qti-gap identifier="G2"></qti-gap> by this sun of York.
    </p>
  </qti-gap-match-interaction>`;

/**
 * The invariants are a property of the *substrate*, not of the components alone: a vendor
 * stylesheet is exactly where a rule like `:state(dragging) { border: none }` gets written. So
 * these run against every substrate we ship, mirroring what .storybook/extensions/style-substrate
 * composes. Running them bare would pass vacuously — the offending rule would never load.
 */
const SUBSTRATES: Record<string, string[]> = {
  citolab: [normalizeCss, itemCss],
  kennisnet: [normalizeCss, itemCss, kennisnetCss]
};

const applySubstrate = (name: string) => {
  document.querySelectorAll('style[data-substrate]').forEach(s => s.remove());
  for (const css of SUBSTRATES[name]) {
    const style = document.createElement('style');
    style.setAttribute('data-substrate', name);
    style.textContent = css;
    document.head.appendChild(style);
  }
};

describe.each(Object.keys(SUBSTRATES))('drag-drop layout invariance — %s', substrate => {
  beforeEach(() => applySubstrate(substrate));

  test('a chip keeps its border-box when it is lifted', async () => {
    document.body.innerHTML = GAP_MATCH;
    await settle();

    const chip = byId('winter');
    const atRest = boxOf(chip);

    // `dragging` is what the mixin sets on the source while its clone follows the cursor.
    chip.internals.states.add('dragging');
    await settle();
    const whileDragging = boxOf(chip);

    expect(whileDragging, 'the hole a lifted chip leaves must keep the chip’s footprint').toEqual(atRest);
  });

  test('a chip keeps its border-box once it has been placed', async () => {
    document.body.innerHTML = GAP_MATCH;
    await settle();

    const chip = byId('winter');
    const atRest = boxOf(chip);

    chip.internals.states.add('placeholder');
    await settle();

    expect(boxOf(chip), 'a spent chip still occupies its own footprint').toEqual(atRest);
  });

  test('lifting a chip moves no dropzone', async () => {
    document.body.innerHTML = GAP_MATCH;
    await settle();

    const g1 = el<HTMLElement>('[identifier="G1"]');
    const g2 = el<HTMLElement>('[identifier="G2"]');
    const before = { G1: originOf(g1), G2: originOf(g2) };

    byId('winter').internals.states.add('dragging');
    await settle();

    expect({ G1: originOf(g1), G2: originOf(g2) }, 'the target must not slide out from under the pointer').toEqual(
      before
    );
  });

  test('filling a dropzone does not resize it', async () => {
    document.body.innerHTML = GAP_MATCH;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');
    const g1 = el<HTMLElement>('[identifier="G1"]');
    const empty = boxOf(g1);

    interaction.handleDrop(byId('winter'), g1);
    await settle();

    expect(boxOf(g1), 'an empty gap is already the size of the chip it will hold').toEqual(empty);
  });

  test('a dropped chip is the same size as it was in the bank', async () => {
    document.body.innerHTML = GAP_MATCH;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');
    const inBank = boxOf(byId('winter'));

    interaction.handleDrop(byId('winter'), el<HTMLElement>('[identifier="G1"]'));
    await settle();

    const placed = el<HTMLElement>('[identifier="G1"] qti-gap-text');
    expect(placed, 'the clone landed in the gap').toBeTruthy();
    expect(boxOf(placed), 'a chip is the same chip wherever it lives').toEqual(inBank);
  });
});
