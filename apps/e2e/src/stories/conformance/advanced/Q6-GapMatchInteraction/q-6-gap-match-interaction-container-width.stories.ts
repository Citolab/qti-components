import { getItemByUri } from '@citolab/qti-components';
import { html } from 'lit';
import { expect } from 'storybook/test';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type { QtiAssessmentItem, QtiGapMatchInteraction } from '@citolab/qti-components';

type Story = StoryObj;

/**
 * ## Q6 Gap Match Interaction - Container Width Tests
 *
 * Tests for gap container width behavior at different zoom levels.
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

// ═══════════════════════════════════════════════════════════════════════════════
// CONTAINER WIDTH AT 100% ZOOM (D105)
// ═══════════════════════════════════════════════════════════════════════════════

export const D105: Story = {
  tags: ['skip-test'],
  name: 'Q6-L2-D105',
  render,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const gapInteraction = assessmentItem.querySelector<QtiGapMatchInteraction>(
      'qti-gap-match-interaction[data-choices-container-width]'
    )!;
    const gapContainers = gapInteraction.querySelectorAll('qti-gap');

    expect(gapInteraction).not.toBeNull();
    expect(gapContainers.length).toBeGreaterThan(0);

    await step('Verify container width is 200px at 100% zoom', () => {
      gapContainers.forEach(gapContainer => {
        const containerRect = gapContainer.getBoundingClientRect();
        expect(containerRect.width).toBeCloseTo(200, 1);
      });
    });

    await step('Verify container width scales to 300px at 150% zoom', () => {
      document.body.style.zoom = '1.5';
      gapContainers.forEach(gapContainer => {
        const containerRect = gapContainer.getBoundingClientRect();
        expect(containerRect.width).toBeCloseTo(300, 1);
      });
      document.body.style.zoom = '1';
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-sv-2.xml') })]
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTAINER WIDTH WITH LEFT POSITION (D106)
// ═══════════════════════════════════════════════════════════════════════════════

export const D106: Story = {
  tags: ['skip-test'],
  name: 'Q6-L2-D106',
  render,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const gapInteraction = assessmentItem.querySelector<QtiGapMatchInteraction>(
      'qti-gap-match-interaction[data-choices-container-width][class="qti-choices-left"]'
    )!;
    const gapContainers = gapInteraction.querySelectorAll('qti-gap');
    const passageText = gapInteraction.querySelector('blockquote')!;
    const dragSlot = gapInteraction.shadowRoot!.querySelector('slot[part="drags"]')!;

    expect(gapInteraction).not.toBeNull();
    expect(gapContainers.length).toBeGreaterThan(0);
    expect(dragSlot).not.toBeNull();
    expect(passageText).not.toBeNull();

    await step('Verify container width is 100px at 100% zoom', () => {
      gapContainers.forEach(gapContainer => {
        const containerRect = gapContainer.getBoundingClientRect();
        expect(containerRect.width).toBeCloseTo(100, 1);
      });
    });

    await step('Verify gap choices are displayed to the left', () => {
      expect(dragSlot).toBePositionedRelativeTo(passageText, 'left');
    });

    await step('Verify container width scales to 150px at 150% zoom', () => {
      document.body.style.zoom = '1.5';
      gapContainers.forEach(gapContainer => {
        const containerRect = gapContainer.getBoundingClientRect();
        expect(containerRect.width).toBeCloseTo(150, 1);
      });
      document.body.style.zoom = '1';
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-sv-2.xml') })]
};
