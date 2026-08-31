import { expect, test, describe, beforeEach } from 'vitest';

import { QtiInlineChoice } from '@qti-components/interactions-core/elements/qti-inline-choice';

import { QtiInlineChoiceInteractionCorrection } from './qti-inline-choice-interaction-correction';

/**
 * Internal mode on an inline interaction hands over to the full correct response — see the element
 * for why. What is asserted here is the observable half of that: a key in a sibling wrapper, never a
 * marker inside the field, and the candidate's own answer left alone in every case.
 *
 * The correction subclass is registered under the REAL tag, as in the other correction specs: this
 * file imports no base interaction, so the tag is free.
 */

const settle = () => new Promise(r => setTimeout(r, 150));

type Corrected = HTMLElement & {
  response: string | string[] | null;
  showCorrectResponse: boolean;
  updateComplete: Promise<boolean>;
  configContext: unknown;
};

if (!customElements.get('qti-inline-choice-interaction')) {
  customElements.define('qti-inline-choice-interaction', QtiInlineChoiceInteractionCorrection);
}
// The options are real elements, not inert markup: `#syncSlottedChoices` writes role and selection
// state through each one's `internals`, which only an upgraded element has.
if (!customElements.get('qti-inline-choice')) {
  customElements.define('qti-inline-choice', QtiInlineChoice);
}

const mount = async (response: string): Promise<Corrected> => {
  document.body.innerHTML = `
    <div>
      <qti-inline-choice-interaction response-identifier="RESPONSE" correct-response="B" shuffle="false"
        response="${response}">
        <qti-inline-choice identifier="A"><span>Gorbatsjov</span></qti-inline-choice>
        <qti-inline-choice identifier="B"><span>Kennedy</span></qti-inline-choice>
      </qti-inline-choice-interaction>
    </div>
  `;
  await settle();
  return document.querySelector('qti-inline-choice-interaction') as unknown as Corrected;
};

/** What the candidate sees in their own closed dropdown. */
const triggerText = (element: Corrected) =>
  element.shadowRoot?.querySelector('button[part="trigger"] span[part="value"]')?.textContent?.trim() ?? '';

/** The answer-key wrapper the full variant inserts after the field, or null while there is none. */
const keyWrapper = (element: Corrected) => element.nextElementSibling as HTMLElement | null;

const show = async (element: Corrected, on: boolean) => {
  element.showCorrectResponse = on;
  await element.updateComplete;
  await settle();
};

describe('inline-choice, showing the correct response', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('an incorrect answer gets the key as an inline wrapper beside the field', async () => {
    const element = await mount('A');

    await show(element, true);

    const wrapper = keyWrapper(element)!;
    expect(wrapper?.classList.contains('full-correct-response'), 'the full variant rendered').toBe(true);
    expect(wrapper.classList.contains('full-correct-response-inline'), 'inline, not block').toBe(true);
    expect(wrapper.querySelector('qti-inline-choice-interaction'), 'holding a copy of the interaction').not.toBeNull();
    expect(triggerText(element), "the candidate's own answer is untouched").toBe('Gorbatsjov');
  });

  /**
   * The case the old inline marker handled worst — it printed the correct option a second time right
   * beside an identical answer, and in doing so stole the nodes that answer was made of.
   *
   * The key still appears: this element overrides the base's withholding, because asking for the
   * correct response and being shown nothing is indistinguishable from a broken feature.
   */
  test('a correct answer gets the key too, and keeps its own answer', async () => {
    const element = await mount('B');

    expect(triggerText(element), 'sanity: the answer is there to begin with').toBe('Kennedy');
    await show(element, true);

    expect(keyWrapper(element)?.classList.contains('full-correct-response'), 'shown, not withheld').toBe(true);
    expect(triggerText(element)).toBe('Kennedy');
  });

  test('switching the key off removes the wrapper', async () => {
    const element = await mount('A');
    await show(element, true);
    expect(keyWrapper(element)).not.toBeNull();

    await show(element, false);

    expect(keyWrapper(element)).toBeNull();
    expect(triggerText(element)).toBe('Gorbatsjov');
  });

  /**
   * Guards the way back. The marker this replaced rendered the option's own DOM nodes, which a node
   * cannot be in two places at once, so showing the key blanked the dropdown for any candidate whose
   * answer was the correct option — recorded upstream as Citolab/qti-components#178.
   */
  test('no marker is rendered inside the field any more', async () => {
    const element = await mount('B');

    await show(element, true);

    expect(element.shadowRoot?.querySelector('[part="correct-option"]')).toBeNull();
  });
});
