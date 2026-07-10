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

/**
 * Kennisnet is the leading substrate; citolab is deprecated and on its way out.
 *
 * The invariants are asserted against kennisnet only. Citolab styles a bank chip with tag
 * selectors and a placed chip with `::part(drag)`, and the two blocks never agreed — in
 * graphic-gap-match its bank chips carry no chip styling at all. Holding a deprecated theme to a
 * contract it predates would mean fixing CSS nobody will ship.
 *
 * Add `minimal` here once it is a real substrate rather than a sketch.
 */
const CONTRACT_SUBSTRATES = ['kennisnet'];

const applySubstrate = (name: string) => {
  document.querySelectorAll('style[data-substrate]').forEach(s => s.remove());
  for (const css of SUBSTRATES[name]) {
    const style = document.createElement('style');
    style.setAttribute('data-substrate', name);
    style.textContent = css;
    document.head.appendChild(style);
  }
};

describe.each(CONTRACT_SUBSTRATES)('drag-drop layout invariance — %s', substrate => {
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

    const placed = el<HTMLElement>('[identifier="G1"]').shadowRoot!.querySelector('qti-gap-text') as HTMLElement;
    expect(placed, 'the gap renders the clone in its own shadow root').toBeTruthy();
    expect(boxOf(placed), 'a chip is the same chip wherever it lives').toEqual(inBank);
  });
});

/**
 * The same two invariants, for every drag-drop interaction rather than just gap-match.
 *
 * `chipsIn(target)` is how the interaction itself answers "what do you hold" — placement map or
 * DOM, depending on the target — so the fixtures do not have to know where a chip lives.
 *
 * Written after `qti-order-interaction` turned out to grow its chips by 2px on drop, and to have
 * done so long before any of this work: a chip is one size in the bank and another in a drop, and
 * nothing anywhere asserted otherwise.
 */
const INTERACTIONS: Array<{ name: string; html: string; chip: string; target: () => HTMLElement }> = [
  {
    name: 'gap-match',
    html: GAP_MATCH,
    chip: 'winter',
    target: () => el('[identifier="G1"]')
  },
  {
    name: 'order',
    html: `
      <qti-order-interaction response-identifier="R" style="width: 480px">
        <qti-simple-choice identifier="A">Hypothese formuleren</qti-simple-choice>
        <qti-simple-choice identifier="B">Data verzamelen</qti-simple-choice>
      </qti-order-interaction>`,
    chip: 'A',
    target: () => el<any>('qti-order-interaction').shadowRoot!.querySelector(`[part~='drop']`) as HTMLElement
  },
  {
    name: 'associate',
    html: `
      <qti-associate-interaction response-identifier="R" max-associations="2" style="width: 480px">
        <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="B" match-max="1">Brutus</qti-simple-associable-choice>
      </qti-associate-interaction>`,
    chip: 'A',
    target: () => el<any>('qti-associate-interaction').shadowRoot!.querySelector(`[part~='drop']`) as HTMLElement
  },
  {
    name: 'match',
    html: `
      <qti-match-interaction response-identifier="R" style="width: 480px">
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="S1" match-max="1">Source one</qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="T1" match-max="1">Target one</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>`,
    chip: 'S1',
    target: () => el('[identifier="T1"]')
  },
  {
    name: 'graphic-gap-match',
    html: `
      <qti-graphic-gap-match-interaction response-identifier="R">
        <img slot="image" alt="" width="200" height="120" />
        <qti-gap-text identifier="G1" match-max="1">winter</qti-gap-text>
        <qti-associable-hotspot coords="0,0,60,40" identifier="H1" match-max="1" shape="rect"></qti-associable-hotspot>
      </qti-graphic-gap-match-interaction>`,
    chip: 'G1',
    target: () => el('[identifier="H1"]')
  }
];

/**
 * Known violations, recorded rather than deleted. `test.fails` inverts the assertion: these must
 * keep failing, and the day one starts passing the suite goes red and tells you to remove it here.
 *
 *   order      a bank chip and a placed chip are styled by different blocks — kennisnet gives the
 *              bank card `border: none` and the placed card `border: 1px` — so the chip grows 2px
 *              on drop and the drop grows with it. Present at HEAD, long before this work.
 *   associate  the same disease: the placed chip's horizontal padding comes from a different rule
 *              than the bank chip's.
 *
 * The cure is Phase 1 of plans/theme-merge-and-shadow-style-cleanup.md — one selector list per
 * theme, covering a chip's three homes. Not a CSS nudge here.
 */
const CHIP_BOX_KNOWN_BAD = new Set(['order', 'associate']);
const DROPZONE_KNOWN_BAD = new Set(['order']);

const chipCases = INTERACTIONS.map(i => [i.name, i] as const);

describe.each(CONTRACT_SUBSTRATES)('every interaction, layout invariance — %s', substrate => {
  beforeEach(() => applySubstrate(substrate));

  // The real measurement, expected to fail. `test.fails` goes red the day it starts passing.
  test.fails.each(chipCases.filter(([n]) => CHIP_BOX_KNOWN_BAD.has(n)))(
    '%s: KNOWN VIOLATION — a chip does not keep its box when dropped',
    async (_n, spec) => {
      document.body.innerHTML = spec.html;
      await settle();

      const interaction = document.body.firstElementChild as any;
      const chip = byId(spec.chip);
      const inBank = boxOf(chip);

      interaction.handleDrop(chip, spec.target());
      await settle();

      expect(boxOf(interaction.chipsIn(spec.target())[0] as HTMLElement)).toEqual(inBank);
    }
  );

  test.fails.each(chipCases.filter(([n]) => DROPZONE_KNOWN_BAD.has(n)))(
    '%s: KNOWN VIOLATION — filling a dropzone resizes it',
    async (_n, spec) => {
      document.body.innerHTML = spec.html;
      await settle();

      const interaction = document.body.firstElementChild as any;
      const empty = boxOf(spec.target());

      interaction.handleDrop(byId(spec.chip), spec.target());
      await settle();

      expect(boxOf(spec.target())).toEqual(empty);
    }
  );

  test.each(chipCases.filter(([n]) => !CHIP_BOX_KNOWN_BAD.has(n)))(
    '%s: a chip keeps its box when dropped',
    async (_n, spec) => {
      document.body.innerHTML = spec.html;
      await settle();

      const interaction = document.body.firstElementChild as any;
      const chip = byId(spec.chip);
      const inBank = boxOf(chip);

      interaction.handleDrop(chip, spec.target());
      await settle();

      const placed = interaction.chipsIn(spec.target())[0] as HTMLElement;
      expect(placed, 'the chip landed').toBeTruthy();
      expect(boxOf(placed), 'a chip is the same chip wherever it lives').toEqual(inBank);
    }
  );

  test.each(chipCases.filter(([n]) => !DROPZONE_KNOWN_BAD.has(n)))(
    '%s: filling a dropzone does not resize it',
    async (_n, spec) => {
      document.body.innerHTML = spec.html;
      await settle();

      const interaction = document.body.firstElementChild as any;
      const empty = boxOf(spec.target());

      interaction.handleDrop(byId(spec.chip), spec.target());
      await settle();

      expect(boxOf(spec.target()), 'an empty drop is already the size of the chip it will hold').toEqual(empty);
    }
  );
});
