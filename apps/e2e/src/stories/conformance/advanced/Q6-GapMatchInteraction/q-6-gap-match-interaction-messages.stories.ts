import { getItemByUri } from '@citolab/qti-components';
import { expect, waitFor } from 'storybook/test';

import drag from '../../../../../../../tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type { QtiAssessmentItem, QtiGapMatchInteraction, QtiGapText, QtiGap } from '@citolab/qti-components';

type Story = StoryObj;

/**
 * ## Q6 Gap Match Interaction - Validation Messages Tests
 *
 * Tests for min/max selection validation messages (gap-match-sv-3.xml).
 */
const meta: Meta<QtiAssessmentItem> = {
  title: 'Testing/Conformance/advanced/Q-6 Gap Match Interaction'
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const render = (_args: unknown, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => xml;

const loaders = [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-sv-3.xml') })];

const getInteraction = (canvasElement: HTMLElement, responseIdentifier: string) => {
  const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
  const interaction = assessmentItem.querySelector<QtiGapMatchInteraction>(
    `qti-gap-match-interaction[response-identifier='${responseIdentifier}']`
  )!;
  const gapText = (id: string) => interaction.querySelector<QtiGapText>(`qti-gap-text[identifier="${id}"]`)!;
  const gap = (id: string) => interaction.querySelector<QtiGap>(`qti-gap[identifier="${id}"]`)!;
  const message = () => interaction.shadowRoot!.querySelector<HTMLElement>('#validation-message')!;
  return { assessmentItem, interaction, gapText, gap, message };
};

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM MIN/MAX MESSAGES (D107)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * RESPONSE1 (max-associations=1, min-associations=1) carries custom messages. Submitting with no
 * association shows the min message; trying to fill the second gap shows the max message.
 */
export const D107: Story = {
  name: 'Q6-L2-D107',
  render,
  play: async ({ canvasElement, step }) => {
    const { assessmentItem, interaction, gapText, gap, message } = getInteraction(canvasElement, 'RESPONSE1');
    await interaction.updateComplete;

    await step('Submitting with no association shows the min message', async () => {
      assessmentItem.processResponse();
      await waitFor(() => expect(message()).toHaveTextContent("You haven't selected enough"));
      expect(message()).toBeVisible();
    });

    await step('Filling the second gap shows the max message', async () => {
      await drag(gapText('W'), { to: gap('G1'), duration: 100 });
      await drag(gapText('Sp'), { to: gap('G2'), duration: 100 });
      assessmentItem.processResponse();
      await waitFor(() => expect(message()).toHaveTextContent("You've selected too many"));
      expect(message()).toBeVisible();
    });
  },
  loaders
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT MAX MESSAGE (D109)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * RESPONSE2 has no max-associations (spec default 1) and no data-max-selections-message: trying to
 * fill the second gap shows the platform's default max message.
 */
export const D109: Story = {
  name: 'Q6-L2-D109',
  render,
  play: async ({ canvasElement }) => {
    const { assessmentItem, interaction, gapText, gap, message } = getInteraction(canvasElement, 'RESPONSE2');
    await interaction.updateComplete;
    // The item omits max-associations and data-max-selections-message; the default of 1 is applied
    // (and reflected), so no custom message can be the source of what is shown.
    expect(interaction.hasAttribute('data-max-selections-message')).toBe(false);
    expect(interaction.maxAssociations).toBe(1);

    await drag(gapText('W'), { to: gap('G1'), duration: 100 });
    await drag(gapText('Sp'), { to: gap('G2'), duration: 100 });
    assessmentItem.processResponse();

    await waitFor(() => expect(message()).toHaveTextContent(/too many/i));
    expect(message()).toBeVisible();
  },
  loaders
};
