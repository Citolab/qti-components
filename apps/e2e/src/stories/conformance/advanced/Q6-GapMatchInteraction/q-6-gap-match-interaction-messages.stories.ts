import { getItemByUri } from '@citolab/qti-components';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { action } from 'storybook/actions';
import { expect, fireEvent } from 'storybook/test';
import drag from 'tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type { QtiAssessmentItem, QtiGap, QtiGapMatchInteraction, QtiGapText } from '@citolab/qti-components';
type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-6 Gap Match Interaction'
};
export default meta;

export const D107: Story = {
  name: 'Q6-L2-D107',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button
        @click=${() => {
          item?.validate();
          item?.processResponse();
        }}
      >
        Submit
      </button>
    `;
  },
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const qtiGapMatchInteraction = assessmentItem.querySelector(
      `qti-gap-match-interaction[response-identifier='RESPONSE1']`
    ) as QtiGapMatchInteraction;
    const gapTextWinter = qtiGapMatchInteraction.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;

    const gapG1 = qtiGapMatchInteraction.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    const gapG2 = qtiGapMatchInteraction.querySelector('qti-gap[identifier="G2"]') as QtiGapText;

    // Step 1: Drag to exceed max-associations
    await step('Drag items to exceed max-associations', async () => {
      // Drag Winter to G1
      await drag(gapTextWinter, { to: gapG1, duration: 100 });

      // Attempt to drag Summer to G2 (exceeding max-associations)
      // await drag(gapTextSummer, { to: gapG2, duration: 100 });

      // // Validate that the max-selections message is displayed
      // expect(validationMessageElement.textContent).toBe(
      //   assessmentItem.dataset.maxSelectionsMessage || "You've selected too many"
      // );

      // Acknowledge the message by removing an association
      await drag(gapTextWinter, { to: gapG2, duration: 100 });
      // expect(validationMessageElement.style.display).toBe('none');
    });

    // // Step 2: Submit with no associations
    // await step('Submit with no associations', async () => {
    //   // Clear all associations
    //   await drag(gapTextWinter, { to: null, duration: 100 });
    //   await drag(gapTextSummer, { to: null, duration: 100 });

    //   // Submit the item
    //   fireEvent.click(submitButton);

    //   // Validate that the min-selections message is displayed
    //   expect(validationMessageElement.textContent).toBe(
    //     assessmentItem.dataset.minSelectionsMessage || "You haven't selected enough"
    //   );

    //   // Acknowledge the message by closing it
    //   const closeButton = canvas.getByRole('button', { name: 'Close Message' });
    //   fireEvent.click(closeButton);
    //   expect(validationMessageElement.style.display).toBe('none');
    // });

    // // Step 3: Drag valid associations and submit
    // await step('Drag valid associations and submit', async () => {
    //   // Drag Winter to G1 and Summer to G2
    //   await drag(gapTextWinter, { to: gapG1, duration: 100 });
    //   await drag(gapTextSummer, { to: gapG2, duration: 100 });

    //   // Submit the item
    //   fireEvent.click(submitButton);

    //   // Validate no validation message is displayed
    //   expect(validationMessageElement.style.display).toBe('none');
    // });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q6/gap-match-sv-3.xml`)
    })
  ]
};
