import { expect } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import drag from '../../../../../../../tools/testing/drag';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiMatchInteraction } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q3 - Match Interaction',
  beforeEach: async () => {}
};
export default meta;

const getElements = (canvasElement: HTMLElement) => {
  const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
  const matchInteraction = assessmentItem.querySelector('qti-match-interaction') as QtiMatchInteraction;
  const sourceA = matchInteraction.querySelector(
    'qti-simple-match-set:first-of-type qti-simple-associable-choice[identifier="A"]'
  ) as HTMLElement;
  const sourceB = matchInteraction.querySelector(
    'qti-simple-match-set:first-of-type qti-simple-associable-choice[identifier="B"]'
  ) as HTMLElement;
  const sourceC = matchInteraction.querySelector(
    'qti-simple-match-set:first-of-type qti-simple-associable-choice[identifier="C"]'
  ) as HTMLElement;
  const targetT = matchInteraction.querySelector(
    'qti-simple-match-set:last-of-type qti-simple-associable-choice[identifier="T"]'
  ) as HTMLElement;
  const targetU = matchInteraction.querySelector(
    'qti-simple-match-set:last-of-type qti-simple-associable-choice[identifier="U"]'
  ) as HTMLElement;
  return { assessmentItem, matchInteraction, sourceA, sourceB, sourceC, targetT, targetU };
};

const getResponse = (assessmentItem: QtiAssessmentItem) =>
  assessmentItem.variables.find(v => v.identifier === 'RESPONSE')?.value;

const loader = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q3/match-interaction.xml')
});

// Q3-L1-D1: No associations made → RESPONSE is NULL
export const Q3_L1_D1: Story = {
  name: 'Q3-L1-D1',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBeNull();
  },
  loaders: [loader]
};

// Q3-L1-D2: Drag A → T → RESPONSE is a Multiple Container with the directedPair ['A T']
export const Q3_L1_D2: Story = {
  name: 'Q3-L1-D2',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, matchInteraction, sourceA, targetT } = getElements(canvasElement);
    await matchInteraction.updateComplete;

    await drag(sourceA, { to: targetT, duration: 300 });

    assessmentItem.processResponse();
    expect(Array.isArray(getResponse(assessmentItem))).toBe(true);
    expect(getResponse(assessmentItem)).toEqual(['A T']);
  },
  loaders: [loader]
};

// Q3-L1-D3: Drag B → T → RESPONSE contains ['B T']
export const Q3_L1_D3: Story = {
  name: 'Q3-L1-D3',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, matchInteraction, sourceB, targetT } = getElements(canvasElement);
    await matchInteraction.updateComplete;

    await drag(sourceB, { to: targetT, duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['B T']);
  },
  loaders: [loader]
};

// Q3-L1-D4: Drag C → U → RESPONSE contains ['C U']
export const Q3_L1_D4: Story = {
  name: 'Q3-L1-D4',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, matchInteraction, sourceC, targetU } = getElements(canvasElement);
    await matchInteraction.updateComplete;

    await drag(sourceC, { to: targetU, duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['C U']);
  },
  loaders: [loader]
};

// Q3-L1-D5: Drag A → T, B → U → RESPONSE contains ['A T', 'B U']
export const Q3_L1_D5: Story = {
  name: 'Q3-L1-D5',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, matchInteraction, sourceA, sourceB, targetT, targetU } = getElements(canvasElement);
    await matchInteraction.updateComplete;

    await drag(sourceA, { to: targetT, duration: 300 });
    await drag(sourceB, { to: targetU, duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['A T', 'B U']);
  },
  loaders: [loader]
};

// Q3-L1-D6: Drag A → T, B → T → RESPONSE contains ['A T', 'B T'] (two sources to same target)
export const Q3_L1_D6: Story = {
  name: 'Q3-L1-D6',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, matchInteraction, sourceA, sourceB, targetT } = getElements(canvasElement);
    await matchInteraction.updateComplete;

    await drag(sourceA, { to: targetT, duration: 300 });
    await drag(sourceB, { to: targetT, duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['A T', 'B T']);
  },
  loaders: [loader]
};

// Q3-L1-D7: Drag A → T, B → T, C → U → RESPONSE contains ['A T', 'B T', 'C U']
export const Q3_L1_D7: Story = {
  name: 'Q3-L1-D7',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, matchInteraction, sourceA, sourceB, sourceC, targetT, targetU } =
      getElements(canvasElement);
    await matchInteraction.updateComplete;

    await drag(sourceA, { to: targetT, duration: 300 });
    await drag(sourceB, { to: targetT, duration: 300 });
    await drag(sourceC, { to: targetU, duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['A T', 'B T', 'C U']);
  },
  loaders: [loader]
};
