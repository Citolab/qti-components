import { QtiAssessmentItem, QtiGap, QtiGapMatchInteraction, QtiGapText } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect, fireEvent, within } from '@storybook/test';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getItemByUri } from '../../../../lib/qti-loader';
import drag from 'src/testing/drag';
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-6 Gap Match Interaction'
};
export default meta;

export const D101: Story = {
  name: 'Q6-L2-D101',
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
          item?.processResponse();
        }}
      >
        Submit
      </button>
    `;
  },
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    // Locate passage text and gap choices

    const gapInteraction = assessmentItem.querySelector(
      'qti-gap-match-interaction[class="qti-choices-top"]'
    ) as QtiGapMatchInteraction;
    const dragSlot = gapInteraction.shadowRoot.querySelector('slot[part="drags"]');

    const firstGapChoice = gapInteraction.querySelector('qti-gap-text') as QtiGapText;
    const passageText = gapInteraction.querySelector('blockquote'); // Adjust the selector if needed

    // Ensure elements exist
    expect(passageText).not.toBeNull();
    expect(dragSlot).not.toBeNull();
    expect(firstGapChoice).not.toBeNull();

    // Test that gap text choices are visually above the passage text
    await step('Check that gap choices are displayed above the passage text', () => {
      const passageRect = passageText.getBoundingClientRect();
      const gapChoicesRect = dragSlot.getBoundingClientRect();
      const firstGapChoiceRect = firstGapChoice.getBoundingClientRect();

      // Check if the top position of gapChoices is less than the top position of passageText
      expect(gapChoicesRect.top).toBeLessThan(passageRect.top);
      expect(firstGapChoiceRect.top).toBeLessThan(passageRect.top);

      action('Gap choices are displayed above the passage text')();
    });

    // Additional test: ensure choices are disassociated correctly when moved
    await step('Drag and drop and test again', async () => {
      const firstResponseGap = gapInteraction.querySelector('qti-gap') as QtiGap;
      expect(firstGapChoice).not.toBeNull();
      expect(firstResponseGap).not.toBeNull();

      // Simulate drag-and-drop
      await drag(firstGapChoice, { to: firstResponseGap, duration: 100 });
      // After dragging, ensure the choices are still displayed visually above
      const updatedGapChoicesRect = dragSlot.getBoundingClientRect();
      const updatedPassageRect = passageText.getBoundingClientRect();

      expect(updatedGapChoicesRect.top).toBeLessThan(updatedPassageRect.top);

      action('Gap choices remain displayed above after disassociation')();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml`)
    })
  ]
};

export const D102: Story = {
  name: 'Q6-L2-D102',
  render: D101.render,
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const gapInteraction = assessmentItem.querySelector(
      'qti-gap-match-interaction[class="qti-choices-bottom"]'
    ) as QtiGapMatchInteraction;
    const dragSlot = gapInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const passageText = gapInteraction.querySelector('blockquote'); // Adjust the selector if needed

    // Ensure elements exist
    expect(passageText).not.toBeNull();
    expect(dragSlot).not.toBeNull();

    await step('Check that gap choices are displayed below the passage text', () => {
      const passageRect = passageText.getBoundingClientRect();
      const gapChoicesRect = dragSlot.getBoundingClientRect();

      // Check if the top of the gap choices is greater than the bottom of the passage text
      expect(gapChoicesRect.top).toBeGreaterThan(passageRect.bottom);

      action('Gap choices are displayed below the passage text')();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml`)
    })
  ]
};

export const D103: Story = {
  name: 'Q6-L2-D103',
  render: D101.render,
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const gapInteraction = assessmentItem.querySelector(
      'qti-gap-match-interaction[class="qti-choices-left"]'
    ) as QtiGapMatchInteraction;
    const dragSlot = gapInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const passageText = gapInteraction.querySelector('blockquote'); // Adjust the selector if needed

    // Ensure elements exist
    expect(passageText).not.toBeNull();
    expect(dragSlot).not.toBeNull();

    await step('Check that gap choices are displayed to the left of the passage text', () => {
      const passageRect = passageText.getBoundingClientRect();
      const gapChoicesRect = dragSlot.getBoundingClientRect();

      // Check if the right side of the gap choices is less than the left side of the passage text
      expect(gapChoicesRect.right).toBeLessThan(passageRect.left);

      action('Gap choices are displayed to the left of the passage text')();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml`)
    })
  ]
};

export const D104: Story = {
  name: 'Q6-L2-D104',
  render: D101.render,
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const gapInteraction = assessmentItem.querySelector(
      'qti-gap-match-interaction[class="qti-choices-right"]'
    ) as QtiGapMatchInteraction;
    const dragSlot = gapInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const passageText = gapInteraction.querySelector('blockquote'); // Adjust the selector if needed

    // Ensure elements exist
    expect(passageText).not.toBeNull();
    expect(dragSlot).not.toBeNull();

    await step('Check that gap choices are displayed to the right of the passage text', () => {
      const passageRect = passageText.getBoundingClientRect();
      const gapChoicesRect = dragSlot.getBoundingClientRect();

      // Check if the left side of the gap choices is greater than the right side of the passage text
      expect(gapChoicesRect.left).toBeGreaterThan(passageRect.right);

      action('Gap choices are displayed to the right of the passage text')();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml`)
    })
  ]
};
