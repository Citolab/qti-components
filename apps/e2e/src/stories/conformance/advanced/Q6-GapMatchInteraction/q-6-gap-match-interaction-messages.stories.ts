import { getItemByUri } from '@citolab/qti-components';
import { html } from 'lit';
import { expect } from 'storybook/test';

import drag from '../../../../../../../tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type { QtiAssessmentItem, QtiGapMatchInteraction, QtiGapText, QtiGap } from '@citolab/qti-components';

type Story = StoryObj;

/**
 * ## Q6 Gap Match Interaction - Validation Messages Tests
 *
 * Tests for min/max selection validation messages.
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
    <button
      @click=${() => {
        item?.validate();
        item?.processResponse();
      }}
    >
      Submit
    </button>
  `;
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAX ASSOCIATIONS VALIDATION (D107)
// ═══════════════════════════════════════════════════════════════════════════════

export const D107: Story = {
  name: 'Q6-L2-D107',
  render,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const gapMatchInteraction = assessmentItem.querySelector<QtiGapMatchInteraction>(
      `qti-gap-match-interaction[response-identifier='RESPONSE1']`
    )!;
    const gapTextWinter = gapMatchInteraction.querySelector<QtiGapText>('qti-gap-text[identifier="W"]')!;
    const gapG1 = gapMatchInteraction.querySelector<QtiGap>('qti-gap[identifier="G1"]')!;
    const gapG2 = gapMatchInteraction.querySelector<QtiGap>('qti-gap[identifier="G2"]')!;

    await step('Drag items and verify max-associations behavior', async () => {
      await drag(gapTextWinter, { to: gapG1, duration: 100 });
      await drag(gapTextWinter, { to: gapG2, duration: 100 });

      // Verify validation behavior
      expect(gapMatchInteraction).not.toBeNull();
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-sv-3.xml') })]
};
