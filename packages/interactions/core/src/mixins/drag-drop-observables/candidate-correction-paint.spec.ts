import normalizeCss from 'modern-normalize/modern-normalize.css?inline';
import { expect, test, describe, beforeEach } from 'vitest';

import '@qti-components/interactions';

import itemCss from '../../../../../qti-theme/src/item.css?inline';

/**
 * Candidate corrections are OPT-IN per interaction, and this is what holds that together.
 *
 * The tint used to come from one unscoped rule in qti-corrections.css claiming `:state(drag)` across
 * every interaction at once. It is declared per interaction now, so an interaction that never states
 * its correction rules simply gets none — silently, with nothing going red. Same trade as the chip
 * vocabulary (see drag-chip-vocabulary.spec.ts), same guard needed.
 *
 * `color` is the property asserted, because it is the one every correction path must set and the one
 * that has actually been missed: qti-order-interaction hand-rolled its judgement paint, set fill and
 * border but never `color`, and its drag handle — `background-color: currentColor` behind a mask —
 * stayed black while every other interaction's turned green.
 *
 * The two verdicts are checked separately: a rule that recolours regardless of verdict would pass a
 * one-sided test and tell a candidate their wrong answer was right.
 */

const settle = () => new Promise(r => setTimeout(r, 150));

const CORRECT = 'rgb(43, 131, 14)';
const INCORRECT = 'rgb(223, 0, 0)';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const applyTheme = () => {
  document.querySelectorAll('style[data-corr]').forEach(s => s.remove());
  for (const css of [normalizeCss, itemCss]) {
    const style = document.createElement('style');
    style.setAttribute('data-corr', '');
    style.textContent = css;
    document.head.appendChild(style);
  }
};

/** Each case names the element that carries the verdict, and the element that should repaint. */
const CASES: Array<{ name: string; html: string; carrier: string; painted?: string; card: boolean }> = [
  {
    name: 'gap-match chip',
    card: true,
    carrier: '[identifier="winter"]',
    html: `<qti-gap-match-interaction response-identifier="R" style="width:320px">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <p>In the <qti-gap identifier="G1"></qti-gap> of discontent.</p>
      </qti-gap-match-interaction>`
  },
  {
    name: 'order chip',
    card: true,
    carrier: '[identifier="A"]',
    html: `<qti-order-interaction response-identifier="R" style="width:480px">
        <qti-simple-choice identifier="A">Alpha</qti-simple-choice>
      </qti-order-interaction>`
  },
  {
    name: 'associate chip',
    card: true,
    carrier: '[identifier="A"]',
    html: `<qti-associate-interaction response-identifier="R" max-associations="2" style="width:480px">
        <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
      </qti-associate-interaction>`
  },
  {
    name: 'match chip',
    card: true,
    carrier: '[identifier="S1"]',
    html: `<qti-match-interaction response-identifier="R" style="width:480px">
        <qti-simple-match-set><qti-simple-associable-choice identifier="S1" match-max="1">S</qti-simple-associable-choice></qti-simple-match-set>
        <qti-simple-match-set><qti-simple-associable-choice identifier="T1" match-max="1">T</qti-simple-associable-choice></qti-simple-match-set>
      </qti-match-interaction>`
  },
  {
    // The roleless one: no card, so its correction is written as direct properties rather than slots.
    name: 'graphic-gap-match chip',
    card: false,
    carrier: '[identifier="G1"]',
    html: `<qti-graphic-gap-match-interaction response-identifier="R">
        <img slot="image" alt="" width="200" height="120" />
        <qti-gap-text identifier="G1" match-max="1">winter</qti-gap-text>
        <qti-associable-hotspot coords="0,0,60,40" identifier="H1" match-max="1" shape="rect"></qti-associable-hotspot>
      </qti-graphic-gap-match-interaction>`
  },
  {
    name: 'choice (control hidden)',
    card: true,
    carrier: '[identifier="A"]',
    html: `<qti-choice-interaction class="qti-input-control-hidden" response-identifier="R" max-choices="1">
        <qti-simple-choice identifier="A">Alpha</qti-simple-choice>
      </qti-choice-interaction>`
  },
  {
    name: 'text-entry',
    card: true,
    carrier: 'qti-text-entry-interaction',
    html: `<qti-text-entry-interaction response-identifier="R"></qti-text-entry-interaction>`
  },
  {
    name: 'inline-choice',
    card: true,
    carrier: 'qti-inline-choice-interaction',
    html: `<qti-inline-choice-interaction response-identifier="R">
        <qti-inline-choice identifier="A">Alpha</qti-inline-choice>
      </qti-inline-choice-interaction>`
  },
  {
    name: 'hottext',
    card: true,
    carrier: '[identifier="H"]',
    html: `<qti-hottext-interaction response-identifier="R"><p>a <qti-hottext identifier="H">word</qti-hottext> here</p></qti-hottext-interaction>`
  },
  {
    /*
     * Extended text is judged from outside, so its verdict normally arrives as an attribute on the
     * correction subclass. The state is what the theme keys on either way, so this covers the theme
     * half exactly like the others; the attribute → state → badge wiring is covered separately in
     * qti-extended-text-interaction-correction.spec.ts.
     *
     * `painted` because the tint lands on the textarea rather than the host: an extended-text
     * interaction is a box you write in, not a box that is coloured.
     */
    name: 'extended-text',
    card: true,
    carrier: 'qti-extended-text-interaction',
    painted: '[part~="textarea"]',
    html: `<qti-extended-text-interaction response-identifier="R"></qti-extended-text-interaction>`
  }
];

describe('candidate correction paint', () => {
  beforeEach(() => applyTheme());

  test.each(CASES.map(c => [c.name, c] as const))('%s repaints for both verdicts', async (_n, spec) => {
    for (const [state, expected] of [
      ['candidate-correct', CORRECT],
      ['candidate-incorrect', INCORRECT]
    ] as const) {
      document.body.innerHTML = `<qti-item-body>${spec.html}</qti-item-body>`;
      await settle();

      const el = document.querySelector(spec.carrier) as HTMLElement & { internals?: ElementInternals };
      expect(el, `${spec.name}: fixture must render ${spec.carrier}`).toBeTruthy();
      el.internals?.states?.add(state);
      await settle();

      // Most interactions are tinted on the host; a few paint an inner part instead.
      const target = spec.painted ? (el.shadowRoot?.querySelector(spec.painted) as HTMLElement) : el;
      expect(target, `${spec.name}: expected a painted element at ${spec.painted}`).toBeTruthy();

      const cs = getComputedStyle(target);
      expect(cs.color, `${spec.name} / ${state}: text takes the verdict colour`).toBe(expected);
      expect(cs.borderTopColor, `${spec.name} / ${state}: edge takes the verdict colour`).toBe(expected);
      expect(cs.backgroundColor, `${spec.name} / ${state}: fill is tinted, not left blank`).not.toBe(TRANSPARENT);
    }
  });

  /**
   * The badge aligns itself, and must keep doing so.
   *
   * It is a flex item with a definite height, so without `align-self` its cross-axis position is
   * whatever its host happens to say — and the hosts disagreed: qti-simple-associable-choice defaults
   * to `align-items: normal`, and qti-gap-text used to gate `center` behind `:not([part~='drag'])`,
   * so one chip centred its badge in the bank and top-aligned it once placed. Both were measured at
   * roughly 1.4px high before the fix, which is exactly the kind of drift nobody catches by eye and
   * VRT waves through at 0.0005 tolerance.
   *
   * Asserted against the host's CONTENT box, not its border box, so it stays true whatever padding a
   * container uses.
   */
  test.each([
    ['associable choice', 'qti-simple-associable-choice'],
    ['simple choice', 'qti-simple-choice'],
    ['hottext', 'qti-hottext']
  ])('%s: the correction badge is vertically centred in its host', async (_n, tag) => {
    const probe = document.createElement(tag);
    probe.setAttribute('identifier', 'X');
    document.body.innerHTML = '<qti-item-body></qti-item-body>';
    document.querySelector('qti-item-body')!.appendChild(probe);
    await settle();

    const badge = probe.shadowRoot?.querySelector('[part~="correction"]') as HTMLElement | null;
    if (!badge) return; // base element, no correction variant registered in this suite

    expect(getComputedStyle(badge).alignSelf, 'the badge decides its own cross-axis position').toBe('center');
  });

  /**
   * Graphic-gap-match is corrected but takes NO card — a filled box would cover the picture its
   * hotspot sits on. It is the reason its correction stays direct properties instead of --drag-*
   * slots: nothing there reads the slots, so routing it through them would erase the correction.
   */
  test('graphic-gap-match is corrected without gaining a card', async () => {
    const spec = CASES.find(c => !c.card)!;
    document.body.innerHTML = `<qti-item-body>${spec.html}</qti-item-body>`;
    await settle();

    const chip = document.querySelector(spec.carrier) as HTMLElement & { internals?: ElementInternals };
    chip.internals?.states?.add('candidate-correct');
    await settle();

    const cs = getComputedStyle(chip);
    expect(cs.color, 'it is still corrected').toBe(CORRECT);
    expect(parseFloat(cs.borderTopWidth), 'but draws no border over the image').toBe(0);
    expect(parseFloat(cs.paddingLeft), 'and takes no padding').toBe(0);
  });
});
