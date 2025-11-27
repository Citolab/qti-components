import { getItemByUri } from '@citolab/qti-components/qti-loader';
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

export const D105: Story = {
  tags: ['skip-test'],
  name: 'Q6-L2-D105',
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
          item?.processResponse();
        }}
      >
        Submit
      </button>
    `;
  },
  args: {},
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const gapInteraction = assessmentItem.querySelector(
      'qti-gap-match-interaction[data-choices-container-width]'
    ) as QtiGapMatchInteraction;
    const gapContainers = gapInteraction.querySelectorAll('qti-gap');

    // Ensure the interaction and containers exist
    expect(gapInteraction).not.toBeNull();
    expect(gapContainers.length).toBeGreaterThan(0);

    // Test the initial width at 100% zoom
    await step('Check container width at 100% zoom', () => {
      gapContainers.forEach(gapContainer => {
        const containerRect = gapContainer.getBoundingClientRect();
        expect(containerRect.width).toBeCloseTo(200, 1); // Expect 200px width
      });

      action('Container width is 200 pixels at 100% zoom')();
    });

    // Simulate zoom and re-check the width
    await step('Check container width at 150% zoom', () => {
      document.body.style.zoom = '1.5'; // Simulate 150% zoom
      gapContainers.forEach(gapContainer => {
        const containerRect = gapContainer.getBoundingClientRect();
        expect(containerRect.width).toBeCloseTo(300, 1); // Expect 300px width (200 * 1.5)
      });

      action('Container width scales correctly at 150% zoom')();
      document.body.style.zoom = '1'; // Reset zoom
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q6/gap-match-sv-2.xml`)
    })
  ]
};

export const D106: Story = {
  tags: ['skip-test'],
  name: 'Q6-L2-D106',
  render: D105.render,
  args: {},
  play: async ({ canvasElement, step }) => {
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
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q6/gap-match-sv-2.xml`)
    })
  ]
};
