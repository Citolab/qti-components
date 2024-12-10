import { QtiAssessmentItem, QtiGapText, QtiGraphicGapMatchInteraction } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect, within } from '@storybook/test';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getItemByUri } from '../../../../lib/qti-loader';
import drag from 'src/testing/drag';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-8 Graphic Gap Match Interaction'
};
export default meta;

export const Q8_L2_D105: Story = {
  name: 'Q8-L2-D105',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected')();
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
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const graphicInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[class="qti-choices-top"][data-choices-container-width]'
    ) as QtiGraphicGapMatchInteraction;
    const dragSlot = graphicInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const responseArea = graphicInteraction.shadowRoot.querySelector('slot[part="image"]');
    const gapChoices = Array.from(graphicInteraction.querySelectorAll('qti-associable-hotspot'));

    // Ensure elements exist
    expect(graphicInteraction).not.toBeNull();
    expect(dragSlot).not.toBeNull();
    expect(responseArea).not.toBeNull();
    expect(gapChoices.length).toBeGreaterThan(0);

    // Test that gap choices containers are 188 pixels wide at 100% zoom
    await step('Check container width at 100% zoom', () => {
      gapChoices.forEach(choice => {
        const rect = choice.getBoundingClientRect();
        expect(rect.width).toBeCloseTo(188, 1); // Validate width is approximately 188 pixels
      });

      action('Gap choice containers are 188 pixels wide at 100% zoom')();
    });

    // Test that gap choices are visually displayed above the response area
    await step('Check that gap choices are displayed above the response area', () => {
      const responseRect = responseArea.getBoundingClientRect();
      const dragSlotRect = dragSlot.getBoundingClientRect();

      // Ensure dragSlot appears above the response area
      expect(dragSlotRect.bottom).toBeLessThan(responseRect.top);

      action('Gap choices are displayed above the response area')();
    });

    // Simulate zoom level change to 150% and verify width scaling
    await step('Check container width at 150% zoom', () => {
      document.body.style.zoom = '1.5'; // Simulate 150% zoom

      gapChoices.forEach(choice => {
        const rect = choice.getBoundingClientRect();
        expect(rect.width).toBeCloseTo(282, 1); // Validate width scales to 282 pixels (188 * 1.5)
      });

      action('Gap choice containers scale correctly to 150% zoom')();
      document.body.style.zoom = '1'; // Reset zoom
    });

    // Additional test: ensure choices remain above after being moved
    await step('Drag and drop and test again', async () => {
      const firstResponseGap = graphicInteraction.querySelector('qti-associable-hotspot') as HTMLElement;
      expect(firstResponseGap).not.toBeNull();

      const firstGapChoice = gapChoices[0];

      // Simulate drag-and-drop
      await drag(firstGapChoice, { to: firstResponseGap, duration: 100 });

      // After dragging, ensure the choices remain visually above
      const updatedDragSlotRect = dragSlot.getBoundingClientRect();
      const updatedResponseRect = responseArea.getBoundingClientRect();

      expect(updatedDragSlotRect.bottom).toBeLessThan(updatedResponseRect.top);

      action('Gap choices remain displayed above the response area after moving')();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-2.xml`)
    })
  ]
};

export const Q8_L2_D106: Story = {
  name: 'Q8-L2-D106',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected')();
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
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const graphicInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[class="qti-choices-left"][data-choices-container-width]'
    ) as QtiGraphicGapMatchInteraction;
    const dragSlot = graphicInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const responseArea = graphicInteraction.shadowRoot.querySelector('slot[part="image"]');
    const gapChoices = Array.from(graphicInteraction.querySelectorAll('qti-associable-hotspot'));

    // Ensure elements exist
    expect(graphicInteraction).not.toBeNull();
    expect(dragSlot).not.toBeNull();
    expect(responseArea).not.toBeNull();
    expect(gapChoices.length).toBeGreaterThan(0);

    // Test that gap choices containers are 100 pixels wide at 100% zoom
    await step('Check container width at 100% zoom', () => {
      gapChoices.forEach(choice => {
        const rect = choice.getBoundingClientRect();
        expect(rect.width).toBeCloseTo(100, 1); // Validate width is approximately 100 pixels
      });

      action('Gap choice containers are 100 pixels wide at 100% zoom')();
    });

    // Test that gap choices are visually displayed to the left of the response area
    await step('Check that gap choices are displayed to the left of the response area', () => {
      const responseRect = responseArea.getBoundingClientRect();
      const dragSlotRect = dragSlot.getBoundingClientRect();

      // Ensure dragSlot appears to the left of the response area
      expect(dragSlotRect.right).toBeLessThan(responseRect.left);

      action('Gap choices are displayed to the left of the response area')();
    });

    // Simulate zoom level change to 150% and verify width scaling
    await step('Check container width at 150% zoom', () => {
      document.body.style.zoom = '1.5'; // Simulate 150% zoom

      gapChoices.forEach(choice => {
        const rect = choice.getBoundingClientRect();
        expect(rect.width).toBeCloseTo(150, 1); // Validate width scales to 150 pixels (100 * 1.5)
      });

      action('Gap choice containers scale correctly to 150% zoom')();
      document.body.style.zoom = '1'; // Reset zoom
    });

    // Additional test: ensure choices remain to the left after being moved
    await step('Drag and drop and test again', async () => {
      const firstResponseGap = graphicInteraction.querySelector('qti-associable-hotspot') as HTMLElement;
      expect(firstResponseGap).not.toBeNull();

      const firstGapChoice = gapChoices[0];

      // Simulate drag-and-drop
      await drag(firstGapChoice, { to: firstResponseGap, duration: 100 });

      // After dragging, ensure the choices remain visually to the left
      const updatedDragSlotRect = dragSlot.getBoundingClientRect();
      const updatedResponseRect = responseArea.getBoundingClientRect();

      expect(updatedDragSlotRect.right).toBeLessThan(updatedResponseRect.left);

      action('Gap choices remain displayed to the left of the response area after moving')();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-2.xml`)
    })
  ]
};
