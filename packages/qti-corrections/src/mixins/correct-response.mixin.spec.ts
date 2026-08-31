import { expect, test, describe, beforeEach } from 'vitest';

import { QtiTextEntryInteractionCorrection } from '../interactions/qti-text-entry-interaction-correction';

/**
 * `withholdsFullCorrectResponseWhenCorrect` — the gate that decides whether a candidate who is
 * already right is shown the answer key as well.
 *
 * Driven through text-entry, which keeps the base default. Inline-choice overrides it to always
 * show, so this file is the record that the default itself still behaves, for every interaction that
 * has not opted out.
 */

const settle = () => new Promise(r => setTimeout(r, 150));

type Corrected = HTMLElement & {
  showCorrectResponse: boolean;
  updateComplete: Promise<boolean>;
  configContext: unknown;
};

if (!customElements.get('qti-text-entry-interaction')) {
  customElements.define('qti-text-entry-interaction', QtiTextEntryInteractionCorrection);
}

const mount = async (response: string): Promise<Corrected> => {
  document.body.innerHTML = `
    <div>
      <qti-text-entry-interaction response-identifier="RESPONSE" correct-response="Kennedy"
        response="${response}"></qti-text-entry-interaction>
    </div>
  `;
  await settle();
  return document.querySelector('qti-text-entry-interaction') as unknown as Corrected;
};

/** The answer-key wrapper the full variant inserts after the field, or null while there is none. */
const keyWrapper = (element: Corrected) =>
  (element.nextElementSibling as HTMLElement | null)?.classList.contains('full-correct-response') ? 'shown' : 'absent';

const show = async (element: Corrected, on: boolean) => {
  element.showCorrectResponse = on;
  await element.updateComplete;
  await settle();
};

describe('withholding the full correct response', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('an incorrect candidate is shown the key', async () => {
    const element = await mount('Gorbatsjov');

    await show(element, true);

    expect(keyWrapper(element)).toBe('shown');
  });

  test('a correct candidate is not — their answer already is the key', async () => {
    const element = await mount('Kennedy');

    await show(element, true);

    expect(keyWrapper(element)).toBe('absent');
  });

  test('unless the item opts out with fullCorrectResponseOnlyWhenIncorrect: false', async () => {
    const element = await mount('Kennedy');
    element.configContext = { fullCorrectResponseOnlyWhenIncorrect: false };

    await show(element, true);

    expect(keyWrapper(element)).toBe('shown');
  });
});
