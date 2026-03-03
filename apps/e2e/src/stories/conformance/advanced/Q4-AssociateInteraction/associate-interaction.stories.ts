import { expect } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import drag from '../../../../../../../tools/testing/drag';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiAssociateInteraction } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q4 - Associate Interaction',
  beforeEach: async () => {}
};
export default meta;

const getElements = (canvasElement: HTMLElement) => {
  const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
  const associateInteraction = assessmentItem.querySelector('qti-associate-interaction') as QtiAssociateInteraction;
  const choiceA = associateInteraction.querySelector('qti-simple-associable-choice[identifier="A"]') as HTMLElement;
  const choiceB = associateInteraction.querySelector('qti-simple-associable-choice[identifier="B"]') as HTMLElement;
  const choiceC = associateInteraction.querySelector('qti-simple-associable-choice[identifier="C"]') as HTMLElement;
  const choiceD = associateInteraction.querySelector('qti-simple-associable-choice[identifier="D"]') as HTMLElement;
  return { assessmentItem, associateInteraction, choiceA, choiceB, choiceC, choiceD };
};

const getDropZone = (associateInteraction: QtiAssociateInteraction, slot: string) =>
  associateInteraction.shadowRoot?.querySelector(`.dl[identifier="${slot}"]`) as HTMLElement;

const getResponse = (assessmentItem: QtiAssessmentItem) =>
  assessmentItem.variables.find(v => v.identifier === 'RESPONSE')?.value;

const loader = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q4/associate-interaction.xml')
});

// Q4-L1-D1: No associations made → RESPONSE is NULL
export const Q4_L1_D1: Story = {
  name: 'Q4-L1-D1',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBeNull();
  },
  loaders: [loader]
};

// Q4-L1-D2: Drag A → pair0_left, B → pair0_right → RESPONSE is ['A B']
export const Q4_L1_D2: Story = {
  name: 'Q4-L1-D2',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, associateInteraction, choiceA, choiceB } = getElements(canvasElement);
    await associateInteraction.updateComplete;

    const droplist0Left = getDropZone(associateInteraction, 'droplist0_left');
    const droplist0Right = getDropZone(associateInteraction, 'droplist0_right');

    await drag(choiceA, { to: droplist0Left, duration: 300 });
    await drag(choiceB, { to: droplist0Right, duration: 300 });

    assessmentItem.processResponse();
    expect(Array.isArray(getResponse(assessmentItem))).toBe(true);
    expect(getResponse(assessmentItem)).toEqual(['A B']);
  },
  loaders: [loader]
};

// Q4-L1-D3: Drag C → pair0_left, D → pair0_right → RESPONSE is ['C D']
export const Q4_L1_D3: Story = {
  name: 'Q4-L1-D3',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, associateInteraction, choiceC, choiceD } = getElements(canvasElement);
    await associateInteraction.updateComplete;

    const droplist0Left = getDropZone(associateInteraction, 'droplist0_left');
    const droplist0Right = getDropZone(associateInteraction, 'droplist0_right');

    await drag(choiceC, { to: droplist0Left, duration: 300 });
    await drag(choiceD, { to: droplist0Right, duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['C D']);
  },
  loaders: [loader]
};

// Q4-L1-D4: Drag A → pair0_left, C → pair0_right → RESPONSE is ['A C']
export const Q4_L1_D4: Story = {
  name: 'Q4-L1-D4',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, associateInteraction, choiceA, choiceC } = getElements(canvasElement);
    await associateInteraction.updateComplete;

    const droplist0Left = getDropZone(associateInteraction, 'droplist0_left');
    const droplist0Right = getDropZone(associateInteraction, 'droplist0_right');

    await drag(choiceA, { to: droplist0Left, duration: 300 });
    await drag(choiceC, { to: droplist0Right, duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['A C']);
  },
  loaders: [loader]
};

// Q4-L1-D5: Drag A → pair0_left, B → pair0_right + C → pair1_left, D → pair1_right → RESPONSE is ['A B', 'C D']
export const Q4_L1_D5: Story = {
  name: 'Q4-L1-D5',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, associateInteraction, choiceA, choiceB, choiceC, choiceD } = getElements(canvasElement);
    await associateInteraction.updateComplete;

    const droplist0Left = getDropZone(associateInteraction, 'droplist0_left');
    const droplist0Right = getDropZone(associateInteraction, 'droplist0_right');
    const droplist1Left = getDropZone(associateInteraction, 'droplist1_left');
    const droplist1Right = getDropZone(associateInteraction, 'droplist1_right');

    await drag(choiceA, { to: droplist0Left, duration: 300 });
    await drag(choiceB, { to: droplist0Right, duration: 300 });
    await drag(choiceC, { to: droplist1Left, duration: 300 });
    await drag(choiceD, { to: droplist1Right, duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['A B', 'C D']);
  },
  loaders: [loader]
};
