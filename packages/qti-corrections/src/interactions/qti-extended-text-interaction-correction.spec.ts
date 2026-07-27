import normalizeCss from 'modern-normalize/modern-normalize.css?inline';
import { expect, test, describe, beforeEach } from 'vitest';

import itemCss from '../../../qti-theme/src/item.css?inline';
import { QtiExtendedTextInteractionCorrection } from './qti-extended-text-interaction-correction';

/**
 * Extended-text is the one interaction judged from OUTSIDE — it cannot compute a verdict for free
 * prose, so `candidate-correction` is pushed in and everything else follows from it.
 *
 * This tests the wiring the theme cannot: attribute → custom state → part token. The theme half (what
 * those states paint) is covered by candidate-correction-paint.spec.ts, which sets the states by
 * hand; if only that existed, the component could stop publishing them entirely and both suites would
 * still be green.
 *
 * The correction subclass is registered under the REAL tag, because the theme's selectors are keyed
 * on `qti-extended-text-interaction` — under any other name none of the corrections CSS would match
 * and the paint assertions would pass vacuously. This file deliberately imports no base elements, so
 * the tag is free.
 */

const settle = () => new Promise(r => setTimeout(r, 150));

const AMBER = 'rgb(255, 167, 0)'; // --qti-warning, which --qti-partially-correct aliases

type Corrected = HTMLElement & {
  internals: ElementInternals;
  candidateCorrection: 'correct' | 'incorrect' | 'partially-correct' | null;
};

if (!customElements.get('qti-extended-text-interaction')) {
  customElements.define('qti-extended-text-interaction', QtiExtendedTextInteractionCorrection);
}

const mount = async (markup: string) => {
  document.querySelectorAll('style[data-corr-spec]').forEach(s => s.remove());
  for (const css of [normalizeCss, itemCss]) {
    const style = document.createElement('style');
    style.setAttribute('data-corr-spec', '');
    style.textContent = css;
    document.head.appendChild(style);
  }
  document.body.innerHTML = `<qti-item-body>${markup}</qti-item-body>`;
  await settle();
  return document.querySelector('qti-extended-text-interaction') as unknown as Corrected;
};

const badgeOf = (el: Corrected) => el.shadowRoot?.querySelector('[part~="correction"]') as HTMLElement | null;

describe('extended-text, corrected from outside', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('the attribute publishes the matching custom state', async () => {
    const el = await mount(
      `<qti-extended-text-interaction response-identifier="R" candidate-correction="partially-correct"></qti-extended-text-interaction>`
    );

    expect(el.internals.states.has('candidate-partially-correct'), 'attribute reached internals').toBe(true);
    expect(el.internals.states.has('candidate-correct')).toBe(false);
    expect(el.internals.states.has('candidate-incorrect')).toBe(false);
  });

  test('the property is the same channel, and reflects', async () => {
    const el = await mount(`<qti-extended-text-interaction response-identifier="R"></qti-extended-text-interaction>`);

    expect(el.internals.states.has('candidate-incorrect'), 'nothing until told').toBe(false);

    el.candidateCorrection = 'incorrect';
    await settle();
    expect(el.internals.states.has('candidate-incorrect')).toBe(true);
    expect(el.getAttribute('candidate-correction'), 'property reflects to the attribute').toBe('incorrect');
  });

  test('a new verdict replaces the old one rather than stacking', async () => {
    const el = await mount(
      `<qti-extended-text-interaction response-identifier="R" candidate-correction="correct"></qti-extended-text-interaction>`
    );
    expect(el.internals.states.has('candidate-correct')).toBe(true);

    el.candidateCorrection = 'incorrect';
    await settle();

    expect(el.internals.states.has('candidate-correct'), 'the previous verdict is cleared').toBe(false);
    expect(el.internals.states.has('candidate-incorrect')).toBe(true);
  });

  test('clearing the verdict removes every state and hides the badge', async () => {
    const el = await mount(
      `<qti-extended-text-interaction response-identifier="R" candidate-correction="correct"></qti-extended-text-interaction>`
    );

    el.candidateCorrection = null;
    await settle();

    expect(el.internals.states.has('candidate-correct')).toBe(false);
    const badge = badgeOf(el)!;
    expect(badge.getAttribute('part'), 'part falls back to the bare token').toBe('correction');
    expect(getComputedStyle(badge).display, 'which correction.styles.ts hides').toBe('none');
  });

  /**
   * The end-to-end one: the verdict has to survive all the way to a painted glyph. This is the case
   * that proves the new --qti-partial-mask token and the new ::part(correction-partially-correct)
   * theme rule are actually connected — before this change that badge was sized but never painted,
   * in every interaction, not just this one.
   */
  test('a partially-correct verdict paints both the textarea and the badge', async () => {
    const el = await mount(
      `<qti-extended-text-interaction response-identifier="R" candidate-correction="partially-correct"></qti-extended-text-interaction>`
    );

    const badge = badgeOf(el)!;
    expect(badge.getAttribute('part')).toBe('correction correction-partially-correct');

    const badgeStyle = getComputedStyle(badge);
    expect(badgeStyle.display, 'the badge is shown').not.toBe('none');
    expect(badgeStyle.backgroundColor, 'painted in the partial colour').toBe(AMBER);
    expect(badgeStyle.getPropertyValue('mask-image'), 'and masked with the partial glyph').toContain('url(');

    const textarea = el.shadowRoot!.querySelector('[part~="textarea"]') as HTMLElement;
    expect(getComputedStyle(textarea).borderTopColor, 'the field takes the amber edge').toBe(AMBER);
  });

  /**
   * The badge belongs to the FIELD, not to the interaction.
   *
   * Its containing block is :host, and the host also holds the prompt slot — so an offset measured
   * from the host lands wherever the prompt happens to end. With a prompt slotted in, that put the
   * badge above the textarea entirely, floating over the question text. It is anchored to the
   * textarea now; this asserts the badge sits within the field's box in both cases, which is the
   * thing a fixed pixel offset cannot promise.
   */
  test.each([
    ['no prompt', ''],
    ['with a prompt', '<div slot="prompt">Leg uit waarom landen overstappen op een energiemix.</div>']
  ])('the badge stays over the textarea (%s)', async (_label, prompt) => {
    const el = await mount(
      `<qti-extended-text-interaction response-identifier="R" candidate-correction="incorrect">${prompt}</qti-extended-text-interaction>`
    );

    const badge = badgeOf(el)!.getBoundingClientRect();
    const field = (el.shadowRoot!.querySelector('[part~="textarea"]') as HTMLElement).getBoundingClientRect();

    expect(field.height, 'sanity: the textarea has a box').toBeGreaterThan(0);
    expect(badge.top, 'badge starts below the top of the field').toBeGreaterThanOrEqual(Math.floor(field.top));
    expect(badge.bottom, 'and ends above its bottom').toBeLessThanOrEqual(Math.ceil(field.bottom));
    expect(badge.left, 'sits inside the reserved left gutter').toBeGreaterThanOrEqual(Math.floor(field.left));
    expect(badge.right, 'without reaching the text').toBeLessThanOrEqual(Math.ceil(field.left + 38.4)); // 2.4rem
  });

  /**
   * Layout invariance: a verdict repaints, it must not reflow. The gutter the badge sits in is
   * reserved unconditionally in the base layer for exactly this reason — the old class-based rules
   * switched padding inside the state and would have re-wrapped the candidate's answer on grading.
   */
  test('grading does not move the textarea', async () => {
    const el = await mount(`<qti-extended-text-interaction response-identifier="R"></qti-extended-text-interaction>`);
    const textarea = el.shadowRoot!.querySelector('[part~="textarea"]') as HTMLElement;

    const before = textarea.getBoundingClientRect();
    const paddingBefore = getComputedStyle(textarea).paddingLeft;

    el.candidateCorrection = 'incorrect';
    await settle();

    const after = textarea.getBoundingClientRect();
    expect(getComputedStyle(textarea).paddingLeft, 'the gutter was already there').toBe(paddingBefore);
    expect({ w: Math.round(after.width), h: Math.round(after.height) }).toEqual({
      w: Math.round(before.width),
      h: Math.round(before.height)
    });
  });
});
