import { expect, fireEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../tools/testing/test-utils';
import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiChoiceInteraction } from '@qti-components/choice-interaction';
import type { QtiTextEntryInteraction } from '@qti-components/text-entry-interaction';
import type { QtiGapText, QtiSimpleChoice } from '@qti-components/interactions-core';
import type { QtiGapMatchInteraction } from '@qti-components/gap-match-interaction';
import type { QtiGraphicAssociateInteraction } from '@qti-components/graphic-associate-interaction';

const meta: Meta = {
  title: 'test-navigation/Linear Navigation',
  component: 'qti-test'
};
export default meta;

export const LinearNavigation: StoryObj = {
  parameters: {
    testTimeout: 60000
  },
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment-linear.xml"></test-container>
        <div class="d-flex align-items-center justify-content-between mt-4">
          <test-prev id="prev-btn" class="btn btn-secondary">Previous</test-prev>
          <test-end-attempt id="end-attempt-btn" class="btn btn-warning">End Attempt</test-end-attempt>
          <test-next id="next-btn" class="btn btn-primary">Next</test-next>
        </div>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const prevBtn = canvas.getByShadowText('Previous');
    const nextBtn = canvas.getByShadowText('Next');
    const endAttemptBtn = canvas.getByShadowText('End Attempt');

    // Wait for the items to be loaded
    await getAssessmentItemsFromTestContainer(canvasElement);

    async function submit() {
      endAttemptBtn.click();

      await waitFor(() => expect(nextBtn).toBeEnabled());
      nextBtn.click();

      // Wait for the next question to render
      await new Promise(resolve => setTimeout(resolve, 100));
      // In linear, prev should always be disabled
      expect(prevBtn).toBeDisabled();
      // Before submitting an answer, expect next button to be disabled
      expect(nextBtn).toBeDisabled();
    }

    // 1. Move from section 'info-start' to section 'basic'
    // Currently on ITM-info_start (last item of info-start)
    await submit();

    // 2. Move through section 'basic'

    // Since allow-skipping defaults to true, submitting without an answer should enable next.
    endAttemptBtn.click();
    await waitFor(() => expect(nextBtn).toBeEnabled());

    // And max-attempts isn't limited, so that shouldn't stop us from a second attempt
    await step('Type York', async () => {
      // ITM-text_entry
      const item = await waitFor(async () =>
        getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Richard III (Take 3)')
      );
      const interaction = item.querySelector<QtiTextEntryInteraction>('qti-text-entry-interaction');
      const input = interaction.shadowRoot?.querySelector<HTMLInputElement>('input');
      input.value = 'York';
      await fireEvent.keyUp(input, { target: { value: 'York' } });
    });
    await submit();

    await step('Select stay', async () => {
      // ITM-choice
      const item = await waitFor(async () =>
        getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage')
      );
      const interaction = item.querySelector<QtiChoiceInteraction>('qti-choice-interaction');

      within(interaction).getByText<QtiSimpleChoice>('You must stay with your luggage at all times.').click();
    });
    await submit();

    await step('Select H and O', async () => {
      // ITM-choice_multiple
      const item = await waitFor(async () =>
        getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Composition of Water')
      );
      const interaction = item.querySelector<QtiChoiceInteraction>('qti-choice-interaction');

      within(interaction).getByText<QtiSimpleChoice>('Hydrogen').click();
      within(interaction).getByText<QtiSimpleChoice>('Oxygen').click();
    });
    await submit();

    await step('Type a postcard', async () => {
      // ITM-extended_text
      const item = await waitFor(async () =>
        getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Writing a Postcard')
      );
      const interaction = item.querySelector<QtiTextEntryInteraction>('qti-extended-text-interaction');
      const textArea = interaction.shadowRoot?.querySelector<HTMLTextAreaElement>('textarea');
      const postcardContent =
        'A postcard from my town. It has 25 to 35 words. Nicest part is the park. I go to the cinema in the evenings. Sam.';
      textArea.value = postcardContent;

      await fireEvent.keyUp(textArea, { target: { value: postcardContent } });
    });
    await submit();

    // 3. Move from section 'basic' to section 'advanced'
    await step('Drag correct items', async () => {
      // ITM-gap_match
      const item = await waitFor(async () =>
        getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Richard III (Take 1)')
      );
      const interaction = item.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction');

      const winter = interaction.querySelector<QtiGapText>('qti-gap-text[identifier="W"]');
      const summer = interaction.querySelector<QtiGapText>('qti-gap-text[identifier="Su"]');
      const gap1 = interaction.querySelector<HTMLElement>(`qti-gap[identifier="G1"]`);
      const gap2 = interaction.querySelector<HTMLElement>(`qti-gap[identifier="G2"]`);

      await drag(winter, { to: gap1, duration: 300 });
      await drag(summer, { to: gap2, duration: 300 });
    });
    await submit();

    // 4. Verify we can still move forward in section 'advanced'
    await step('Associate correct hotspots', async () => {
      // ITM-graphic_associate
      const item = await waitFor(async () =>
        getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Low-cost Flying')
      );
      const interaction = item.querySelector<QtiGraphicAssociateInteraction>('qti-graphic-associate-interaction');

      const hotspotC = interaction.querySelector<HTMLElement>('qti-associable-hotspot[identifier="C"]');
      const hotspotB = interaction.querySelector<HTMLElement>('qti-associable-hotspot[identifier="B"]');
      const hotspotD = interaction.querySelector<HTMLElement>('qti-associable-hotspot[identifier="D"]');
      hotspotC.click();
      hotspotB.click();

      hotspotC.click();
      hotspotD.click();
    });
    await submit();
  }
};
