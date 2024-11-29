import { QtiAssessmentItem, QtiGap, QtiGapMatchInteraction, QtiGapText } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect, fireEvent, within } from '@storybook/test';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getItemByUri } from '../../../../lib/qti-loader';
import drag from 'src/testing/drag';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-6 Gap Match Interaction'
};
export default meta;

export const D107: Story = {
  name: 'Q6-L2-D107',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    const gapTextSummer = qtiGapMatchInteraction.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;
    const gapAutumn = qtiGapMatchInteraction.querySelector('qti-gap[identifier="A"]') as QtiGap;

    const gapG1 = qtiGapMatchInteraction.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    const gapG2 = qtiGapMatchInteraction.querySelector('qti-gap[identifier="G2"]') as QtiGapText;

    const dragSlot = qtiGapMatchInteraction.shadowRoot.querySelector('slot[part="drags"]');

    const validationMessageElement = qtiGapMatchInteraction.shadowRoot.querySelector(
      '#validationMessage'
    ) as HTMLElement;

    const submitButton = canvas.getByRole('button', { name: 'Submit' });

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
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-sv-3.xml`)
    })
  ]
};

export const D108: Story = {
  name: 'Q6-L2-D108',
  render: D107.render,
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const gapInteraction = assessmentItem.querySelector(
      'qti-gap-match-interaction[data-choices-container-width][class="qti-choices-left"]'
    ) as QtiGapMatchInteraction;
    const gapContainers = gapInteraction.querySelectorAll('qti-gap');
    const passageText = gapInteraction.querySelector('blockquote'); // Adjust if needed
    const dragSlot = gapInteraction.shadowRoot.querySelector('slot[part="drags"]');

    // Ensure the interaction and containers exist
    expect(gapInteraction).not.toBeNull();
    expect(gapContainers.length).toBeGreaterThan(0);
    expect(dragSlot).not.toBeNull();
    expect(passageText).not.toBeNull();

    // Test the initial width at 100% zoom
    await step('Check container width at 100% zoom', () => {
      gapContainers.forEach(gapContainer => {
        const containerRect = gapContainer.getBoundingClientRect();
        expect(containerRect.width).toBeCloseTo(100, 1); // Expect 100px width
      });

      action('Container width is 100 pixels at 100% zoom')();
    });

    // Test the position of gap match choices relative to passage text
    await step('Check gap choices are displayed to the left of the passage text', () => {
      const passageRect = passageText.getBoundingClientRect();
      const dragSlotRect = dragSlot.getBoundingClientRect();

      // Ensure dragSlot (choices) is left of passage text
      expect(dragSlotRect.right).toBeLessThan(passageRect.left);

      action('Gap choices are displayed to the left of the passage text')();
    });

    // Simulate zoom and re-check the width
    await step('Check container width at 150% zoom', () => {
      document.body.style.zoom = '1.5'; // Simulate 150% zoom
      gapContainers.forEach(gapContainer => {
        const containerRect = gapContainer.getBoundingClientRect();
        expect(containerRect.width).toBeCloseTo(150, 1); // Expect 150px width (100 * 1.5)
      });

      action('Container width scales correctly at 150% zoom')();
      document.body.style.zoom = '1'; // Reset zoom
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-sv-2.xml`)
    })
  ]
};
