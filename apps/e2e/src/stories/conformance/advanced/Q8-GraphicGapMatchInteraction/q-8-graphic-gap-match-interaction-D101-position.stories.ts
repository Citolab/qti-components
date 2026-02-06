import { getItemByUri } from '@citolab/qti-components';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { action } from 'storybook/actions';
import { expect, fireEvent } from 'storybook/test';

import drag from '../../../../../../../tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type {
  QtiAssessmentItem,
  QtiGap,
  QtiGapMatchInteraction,
  QtiGapText,
  QtiGraphicGapMatchInteraction
} from '@citolab/qti-components';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-8 Graphic Gap Match Interaction'
};
export default meta;

export const Q8_L2_D101: Story = {
  name: 'Q8-L2-D101',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const graphicInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[class="qti-choices-top"]'
    ) as QtiGraphicGapMatchInteraction;
    const dragSlot = graphicInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const responseArea = graphicInteraction.shadowRoot.querySelector('slot[part="image"]');
    const firstGapChoice = graphicInteraction.querySelector('qti-gap-img') as QtiGapText;

    // Ensure elements exist
    expect(graphicInteraction).not.toBeNull();
    expect(dragSlot).not.toBeNull();
    expect(responseArea).not.toBeNull();
    expect(firstGapChoice).not.toBeNull();

    // Test that gap text choices are visually above the response area
    await step('Check that gap choices are displayed above the response area', () => {
      const responseRect = responseArea.getBoundingClientRect();
      const gapChoicesRect = dragSlot.getBoundingClientRect();
      const firstGapChoiceRect = firstGapChoice.getBoundingClientRect();

      // Ensure gap choices appear above the response area
      expect(gapChoicesRect.bottom).toBeLessThan(responseRect.top);
      expect(firstGapChoiceRect.bottom).toBeLessThan(responseRect.top);

      action('Gap choices are displayed above the response area')();
    });

    // Additional test: ensure choices remain above after being moved
    await step('Drag and drop and test again', async () => {
      const firstResponseGap = graphicInteraction.querySelector('qti-associable-hotspot') as HTMLElement;
      expect(firstResponseGap).not.toBeNull();

      // Simulate drag-and-drop
      await drag(firstGapChoice, { to: firstResponseGap, duration: 100 });

      // After dragging, ensure the choices remain visually above
      const updatedGapChoicesRect = dragSlot.getBoundingClientRect();
      const updatedResponseRect = responseArea.getBoundingClientRect();

      expect(updatedGapChoicesRect.bottom).toBeLessThan(updatedResponseRect.top);

      action('Gap choices remain displayed above the response area after moving')();
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-1.xml`)
    })
  ]
};

export const Q8_L2_D102: Story = {
  name: 'Q8-L2-D102',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const graphicInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[class="qti-choices-bottom"]'
    ) as QtiGraphicGapMatchInteraction;
    const dragSlot = graphicInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const responseArea = graphicInteraction.shadowRoot.querySelector('slot[part="image"]');
    const firstGapChoice = graphicInteraction.querySelector('qti-gap-img') as QtiGapText;

    // Ensure elements exist
    expect(graphicInteraction).not.toBeNull();
    expect(dragSlot).not.toBeNull();
    expect(responseArea).not.toBeNull();
    expect(firstGapChoice).not.toBeNull();

    // Test that gap text choices are visually below the response area
    await step('Check that gap choices are displayed below the response area', () => {
      const responseRect = responseArea.getBoundingClientRect();
      const gapChoicesRect = dragSlot.getBoundingClientRect();
      const firstGapChoiceRect = firstGapChoice.getBoundingClientRect();

      // Ensure gap choices appear below the response area
      expect(gapChoicesRect.top).toBeGreaterThan(responseRect.bottom);
      expect(firstGapChoiceRect.top).toBeGreaterThan(responseRect.bottom);

      action('Gap choices are displayed below the response area')();
    });

    // Additional test: ensure choices remain below after being moved
    await step('Drag and drop and test again', async () => {
      const firstResponseGap = graphicInteraction.querySelector('qti-associable-hotspot') as HTMLElement;
      expect(firstResponseGap).not.toBeNull();

      // Simulate drag-and-drop
      await drag(firstGapChoice, { to: firstResponseGap, duration: 100 });

      // After dragging, ensure the choices remain visually below
      const updatedGapChoicesRect = dragSlot.getBoundingClientRect();
      const updatedResponseRect = responseArea.getBoundingClientRect();

      expect(updatedGapChoicesRect.top).toBeGreaterThan(updatedResponseRect.bottom);

      action('Gap choices remain displayed below the response area after moving')();
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-1.xml`)
    })
  ]
};

export const Q8_L2_D103: Story = {
  name: 'Q8-L2-D103',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const graphicInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[class="qti-choices-left"]'
    ) as QtiGraphicGapMatchInteraction;
    const dragSlot = graphicInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const responseArea = graphicInteraction.shadowRoot.querySelector('slot[part="image"]');
    const firstGapChoice = graphicInteraction.querySelector('qti-gap-img') as QtiGapText;

    // Ensure elements exist
    expect(graphicInteraction).not.toBeNull();
    expect(dragSlot).not.toBeNull();
    expect(responseArea).not.toBeNull();
    expect(firstGapChoice).not.toBeNull();

    // Test that gap text choices are visually to the left of the response area
    await step('Check that gap choices are displayed to the left of the response area', () => {
      const responseRect = responseArea.getBoundingClientRect();
      const gapChoicesRect = dragSlot.getBoundingClientRect();
      const firstGapChoiceRect = firstGapChoice.getBoundingClientRect();

      // Ensure gap choices appear to the left of the response area
      expect(gapChoicesRect.right).toBeLessThan(responseRect.left);
      expect(firstGapChoiceRect.right).toBeLessThan(responseRect.left);

      action('Gap choices are displayed to the left of the response area')();
    });

    // Additional test: ensure choices remain to the left after being moved
    await step('Drag and drop and test again', async () => {
      const firstResponseGap = graphicInteraction.querySelector('qti-associable-hotspot') as HTMLElement;
      expect(firstResponseGap).not.toBeNull();

      // Simulate drag-and-drop
      await drag(firstGapChoice, { to: firstResponseGap, duration: 100 });

      // After dragging, ensure the choices remain visually to the left
      const updatedGapChoicesRect = dragSlot.getBoundingClientRect();
      const updatedResponseRect = responseArea.getBoundingClientRect();

      expect(updatedGapChoicesRect.right).toBeLessThan(updatedResponseRect.left);

      action('Gap choices remain displayed to the left of the response area after moving')();
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-1.xml`)
    })
  ]
};

export const Q8_L2_D104: Story = {
  name: 'Q8-L2-D104',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const graphicInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[class="qti-choices-right"]'
    ) as QtiGraphicGapMatchInteraction;
    const dragSlot = graphicInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const responseArea = graphicInteraction.shadowRoot.querySelector('slot[part="image"]');
    const firstGapChoice = graphicInteraction.querySelector('qti-gap-img') as QtiGapText;

    // Ensure elements exist
    expect(graphicInteraction).not.toBeNull();
    expect(dragSlot).not.toBeNull();
    expect(responseArea).not.toBeNull();
    expect(firstGapChoice).not.toBeNull();

    // Test that gap text choices are visually to the right of the response area
    await step('Check that gap choices are displayed to the right of the response area', () => {
      const responseRect = responseArea.getBoundingClientRect();
      const gapChoicesRect = dragSlot.getBoundingClientRect();
      const firstGapChoiceRect = firstGapChoice.getBoundingClientRect();

      // Ensure gap choices appear to the right of the response area
      expect(gapChoicesRect.left).toBeGreaterThan(responseRect.right);
      expect(firstGapChoiceRect.left).toBeGreaterThan(responseRect.right);

      action('Gap choices are displayed to the right of the response area')();
    });

    // Additional test: ensure choices remain to the right after being moved
    await step('Drag and drop and test again', async () => {
      const firstResponseGap = graphicInteraction.querySelector('qti-associable-hotspot') as HTMLElement;
      expect(firstResponseGap).not.toBeNull();

      // Simulate drag-and-drop
      await drag(firstGapChoice, { to: firstResponseGap, duration: 100 });

      // After dragging, ensure the choices remain visually to the right
      const updatedGapChoicesRect = dragSlot.getBoundingClientRect();
      const updatedResponseRect = responseArea.getBoundingClientRect();

      expect(updatedGapChoicesRect.left).toBeGreaterThan(updatedResponseRect.right);

      action('Gap choices remain displayed to the right of the response area after moving')();
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-1.xml`)
    })
  ]
};
