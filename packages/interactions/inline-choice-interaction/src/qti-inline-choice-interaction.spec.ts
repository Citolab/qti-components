import '@citolab/qti-components';
import { html, render } from 'lit';

import type { QtiInlineChoiceInteraction } from './qti-inline-choice-interaction';

describe('qti-inline-choice-interaction', () => {
  beforeEach(async () => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  }); // MANDATORY

  const setup = async (): Promise<QtiInlineChoiceInteraction> => {
    render(
      html`
        <qti-inline-choice-interaction response-identifier="RESPONSE" correct-response="B" shuffle="false">
          <qti-inline-choice identifier="A"><span>Gorbatsjov</span></qti-inline-choice>
          <qti-inline-choice identifier="B"><span>Kennedy</span></qti-inline-choice>
        </qti-inline-choice-interaction>
      `,
      document.body
    );
    const element = document.querySelector('qti-inline-choice-interaction') as QtiInlineChoiceInteraction;
    await element.updateComplete;
    return element;
  };

  const triggerText = (element: QtiInlineChoiceInteraction) =>
    element.shadowRoot?.querySelector('button[part="trigger"] span[part="value"]')?.textContent?.trim() ?? '';

  const correctOptionText = (element: QtiInlineChoiceInteraction) =>
    element.shadowRoot?.querySelector('span[part="correct-option"]')?.textContent?.trim() ?? null;

  describe('showing the correct response', () => {
    it('keeps the candidate response visible when it differs from the correct one', async () => {
      const element = await setup();

      element.response = 'A';
      await element.updateComplete;
      element.toggleInternalCorrectResponse(true);
      await element.updateComplete;

      expect(triggerText(element)).toBe('Gorbatsjov');
      expect(correctOptionText(element)).toBe('Kennedy');
    });

    it('keeps the candidate response visible when it IS the correct one', async () => {
      const element = await setup();

      element.response = 'B';
      await element.updateComplete;
      expect(triggerText(element)).toBe('Kennedy');

      element.toggleInternalCorrectResponse(true);
      await element.updateComplete;

      // The correct-option marker must render its own copy of the option's nodes:
      // binding the option's own nodes would move them out of the trigger, leaving
      // the dropdown blank for every candidate who answered correctly.
      expect(correctOptionText(element)).toBe('Kennedy');
      expect(triggerText(element)).toBe('Kennedy');
    });
  });
});
