import { getItemByUri } from '@citolab/qti-components';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { expect } from 'storybook/test';

import drag from '../../../../../../../tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type { QtiAssessmentItem, QtiGapMatchInteraction } from '@citolab/qti-components';

type Story = StoryObj;

/**
 * ## Q6 Gap Match Interaction - Choice Location Tests
 *
 * Tests for choice positioning relative to the passage text (top, bottom, left, right).
 */
const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-6 Gap Match Interaction'
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const render = (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
  let item: QtiAssessmentItem;
  return html`
    <div @qti-assessment-item-connected=${({ detail }) => (item = detail)}>${xml}</div>
    <button @click=${() => item?.processResponse()}>Submit</button>
  `;
};

const getInteraction = (assessmentItem: QtiAssessmentItem, className: string) => {
  const interaction = assessmentItem.querySelector<QtiGapMatchInteraction>(
    `qti-gap-match-interaction[class="${className}"]`
  )!;
  const dragSlot = interaction.shadowRoot!.querySelector('slot[part="drags"]')!;
  const passageText = interaction.querySelector('blockquote')!;
  return { interaction, dragSlot, passageText };
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHOICES POSITION - TOP (D101)
// ═══════════════════════════════════════════════════════════════════════════════

export const D101: Story = {
  name: 'Q6-L2-D101',
  render,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const { interaction, dragSlot, passageText } = getInteraction(assessmentItem, 'qti-choices-top');
    const firstGapChoice = interaction.querySelector('qti-gap-text')!;

    expect(passageText).not.toBeNull();
    expect(dragSlot).not.toBeNull();

    await step('Verify gap choices are displayed above the passage text', () => {
      expect(dragSlot).toBePositionedRelativeTo(passageText, 'above');
      expect(firstGapChoice).toBePositionedRelativeTo(passageText, 'above');
    });

    await step('Verify position after drag and drop', async () => {
      const firstResponseGap = interaction.querySelector('qti-gap')!;
      await drag(firstGapChoice, { to: firstResponseGap, duration: 100 });
      expect(dragSlot).toBePositionedRelativeTo(passageText, 'above');
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml') })]
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHOICES POSITION - BOTTOM (D102)
// ═══════════════════════════════════════════════════════════════════════════════

export const D102: Story = {
  name: 'Q6-L2-D102',
  render,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const { dragSlot, passageText } = getInteraction(assessmentItem, 'qti-choices-bottom');

    expect(passageText).not.toBeNull();
    expect(dragSlot).not.toBeNull();

    await step('Verify gap choices are displayed below the passage text', () => {
      expect(dragSlot).toBePositionedRelativeTo(passageText, 'below');
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml') })]
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHOICES POSITION - LEFT (D103)
// ═══════════════════════════════════════════════════════════════════════════════

export const D103: Story = {
  name: 'Q6-L2-D103',
  render,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const { dragSlot, passageText } = getInteraction(assessmentItem, 'qti-choices-left');

    expect(passageText).not.toBeNull();
    expect(dragSlot).not.toBeNull();

    await step('Verify gap choices are displayed to the left of the passage text', () => {
      expect(dragSlot).toBePositionedRelativeTo(passageText, 'left');
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml') })]
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHOICES POSITION - RIGHT (D104)
// ═══════════════════════════════════════════════════════════════════════════════

export const D104: Story = {
  name: 'Q6-L2-D104',
  render,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const { dragSlot, passageText } = getInteraction(assessmentItem, 'qti-choices-right');

    expect(passageText).not.toBeNull();
    expect(dragSlot).not.toBeNull();

    await step('Verify gap choices are displayed to the right of the passage text', () => {
      expect(dragSlot).toBePositionedRelativeTo(passageText, 'right');
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml') })]
};
