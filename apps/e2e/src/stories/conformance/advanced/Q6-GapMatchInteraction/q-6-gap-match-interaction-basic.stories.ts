import { getItemByUri } from '@citolab/qti-components';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { fireEvent, expect } from 'storybook/test';

import drag from '../../../../../../../tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type { QtiAssessmentItem, QtiGap, QtiGapText } from '@citolab/qti-components';

type Story = StoryObj;

/**
 * ## Q6 Gap Match Interaction - Basic Tests
 *
 * Tests for basic gap match interaction behavior: drag/drop, scoring, and response handling.
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

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
  const submitButton = canvas.getByRole('button', { name: 'Submit' });
  return { canvas, assessmentItem, submitButton };
};

const getScore = (item: QtiAssessmentItem) => +(item.variables.find(v => v.identifier === 'SCORE')?.value ?? 0);
const getResponse = (item: QtiAssessmentItem) => item.variables.find(v => v.identifier === 'RESPONSE')?.value;

// ═══════════════════════════════════════════════════════════════════════════════
// BASIC DRAG & DROP (D1)
// ═══════════════════════════════════════════════════════════════════════════════

export const Default: Story = {
  name: 'Q6-L2-D1',
  render,
  play: async ({ canvasElement, step }) => {
    const { canvas, assessmentItem } = getElements(canvasElement);

    const gapTextWinter = canvas.getByText('winter');
    const gapTextSummer = canvas.getByText('summer');
    const gapTextAutumn = canvas.getByText('autumn');
    const gapG1 = assessmentItem.querySelector<QtiGap>('qti-gap[identifier="G1"]')!;
    const gapG2 = assessmentItem.querySelector<QtiGap>('qti-gap[identifier="G2"]')!;

    await step('Drag Winter to G1', async () => {
      await drag(gapTextWinter, { to: gapG1, duration: 300 });
    });

    await step('Drag Summer to G2', async () => {
      await drag(gapTextSummer, { to: gapG2, duration: 300 });
    });

    await step('Drag Autumn to G2 - should not replace Summer', async () => {
      await drag(gapTextAutumn, { to: gapG2, duration: 300 });
    });

    await step('Verify gaps contain correct values', () => {
      expect(gapG1.textContent).toBe('winter');
      expect(gapG2.textContent).toBe('summer');
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-example-1.xml') })]
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING TEMPLATE (D2)
// ═══════════════════════════════════════════════════════════════════════════════

export const D2: Story = {
  name: 'Q6-L2-D2',
  render,
  play: async ({ canvasElement, step }) => {
    const { canvas, assessmentItem, submitButton } = getElements(canvasElement);

    const gapTextWinter = canvas.getByText('winter');
    const gapTextSummer = canvas.getByText('summer');
    const gapG1 = assessmentItem.querySelector<QtiGap>('qti-gap[identifier="G1"]')!;
    const gapG2 = assessmentItem.querySelector<QtiGap>('qti-gap[identifier="G2"]')!;

    await step('Submit with no selections - score should be 0', async () => {
      await fireEvent.click(submitButton);
      expect(getScore(assessmentItem)).toBe(0);
      expect(getResponse(assessmentItem)).toBeNull();
    });

    await step('Drag Winter to G1 - score should be 1', async () => {
      await drag(gapTextWinter, { to: gapG1, duration: 300 });
      await fireEvent.click(submitButton);
      expect(getScore(assessmentItem)).toBe(1);
      expect(getResponse(assessmentItem)).toEqual(['W G1']);
    });

    await step('Drag Summer to G2 - score should be 3', async () => {
      await drag(gapTextSummer, { to: gapG2, duration: 300 });
      await fireEvent.click(submitButton);
      expect(getScore(assessmentItem)).toBe(3);
      expect(getResponse(assessmentItem)).toEqual(['W G1', 'Su G2']);
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-example-1.xml') })]
};

// ═══════════════════════════════════════════════════════════════════════════════
// MATHML PRESENTATION (D3)
// ═══════════════════════════════════════════════════════════════════════════════

export const D3: Story = {
  name: 'Q6-L2-D3',
  render,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);

    // Verify MathML is present and rendered
    const mathElements = assessmentItem.querySelectorAll('math');
    expect(mathElements.length).toBeGreaterThan(0);
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-example-2.xml') })]
};

// ═══════════════════════════════════════════════════════════════════════════════
// MATCH-GROUP SCORING (D4)
// ═══════════════════════════════════════════════════════════════════════════════

export const D4: Story = {
  name: 'Q6-L2-D4',
  render,
  play: async ({ canvasElement, step }) => {
    const { assessmentItem, submitButton } = getElements(canvasElement);

    const gapTextS1 = assessmentItem.querySelector<QtiGapText>('qti-gap-text[identifier="s1"]')!;
    const gapTextS2 = assessmentItem.querySelector<QtiGapText>('qti-gap-text[identifier="s2"]')!;
    const gapTextS3 = assessmentItem.querySelector<QtiGapText>('qti-gap-text[identifier="s3"]')!;
    const gapTextS5 = assessmentItem.querySelector<QtiGapText>('qti-gap-text[identifier="s5"]')!;

    const gapT1 = assessmentItem.querySelector<QtiGap>('qti-gap[identifier="t1"]')!;
    const gapT2 = assessmentItem.querySelector<QtiGap>('qti-gap[identifier="t2"]')!;
    const gapT3 = assessmentItem.querySelector<QtiGap>('qti-gap[identifier="t3"]')!;
    const gapT4 = assessmentItem.querySelector<QtiGap>('qti-gap[identifier="t4"]')!;

    await step('Fill in correct response', async () => {
      await drag(gapTextS1, { to: gapT1, duration: 300 });
      await drag(gapTextS5, { to: gapT2, duration: 300 });
      await drag(gapTextS2, { to: gapT3, duration: 300 });
      await drag(gapTextS3, { to: gapT4, duration: 300 });
    });

    await step('Verify score is 1 for correct pairings', async () => {
      await fireEvent.click(submitButton);
      expect(getScore(assessmentItem)).toBe(1);
      expect(getResponse(assessmentItem)).toEqual(['s1 t1', 's5 t2', 's2 t3', 's3 t4']);
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-example-3.xml') })]
};
