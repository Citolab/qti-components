import { expect } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import drag from '../../../../../../../tools/testing/drag';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiOrderInteraction } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q10 - Order Interaction',
  beforeEach: async () => {}
};
export default meta;

const getElements = (canvasElement: HTMLElement) => {
  const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
  const orderInteraction = assessmentItem.querySelector('qti-order-interaction') as QtiOrderInteraction;
  const choiceA = orderInteraction.querySelector('qti-simple-choice[identifier="A"]') as HTMLElement;
  const choiceB = orderInteraction.querySelector('qti-simple-choice[identifier="B"]') as HTMLElement;
  const choiceC = orderInteraction.querySelector('qti-simple-choice[identifier="C"]') as HTMLElement;
  return { assessmentItem, orderInteraction, choiceA, choiceB, choiceC };
};

const getDropZone = (orderInteraction: QtiOrderInteraction, index: number) =>
  orderInteraction.shadowRoot?.querySelector(`drop-list[identifier="droplist${index}"]`) as HTMLElement;

const getResponse = (assessmentItem: QtiAssessmentItem) =>
  assessmentItem.variables.find(v => v.identifier === 'RESPONSE')?.value;

const loader = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q10/order-interaction.xml')
});

const settle = async () => {
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

// Q10-L1-D1: No choices ordered → RESPONSE is NULL
export const Q10_L1_D1: Story = {
  name: 'Q10-L1-D1',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBeNull();
  },
  loaders: [loader]
};

// Q10-L1-D2: Order A, B, C → RESPONSE is ['A', 'B', 'C']
export const Q10_L1_D2: Story = {
  name: 'Q10-L1-D2',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, orderInteraction, choiceA, choiceB, choiceC } = getElements(canvasElement);
    await orderInteraction.updateComplete;

    await drag(choiceA, { to: getDropZone(orderInteraction, 0), duration: 300 });
    await drag(choiceB, { to: getDropZone(orderInteraction, 1), duration: 300 });
    await drag(choiceC, { to: getDropZone(orderInteraction, 2), duration: 300 });

    assessmentItem.processResponse();
    expect(Array.isArray(getResponse(assessmentItem))).toBe(true);
    expect(getResponse(assessmentItem)).toEqual(['A', 'B', 'C']);
  },
  loaders: [loader]
};

// Q10-L1-D3: Order C, B, A → RESPONSE is ['C', 'B', 'A']
export const Q10_L1_D3: Story = {
  name: 'Q10-L1-D3',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, orderInteraction, choiceA, choiceB, choiceC } = getElements(canvasElement);
    await orderInteraction.updateComplete;

    await drag(choiceC, { to: getDropZone(orderInteraction, 0), duration: 300 });
    await drag(choiceB, { to: getDropZone(orderInteraction, 1), duration: 300 });
    await drag(choiceA, { to: getDropZone(orderInteraction, 2), duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['C', 'B', 'A']);
  },
  loaders: [loader]
};

// Q10-L1-D4: Order B, A, C → RESPONSE is ['B', 'A', 'C']
export const Q10_L1_D4: Story = {
  name: 'Q10-L1-D4',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, orderInteraction, choiceA, choiceB, choiceC } = getElements(canvasElement);
    await orderInteraction.updateComplete;

    await drag(choiceB, { to: getDropZone(orderInteraction, 0), duration: 300 });
    await drag(choiceA, { to: getDropZone(orderInteraction, 1), duration: 300 });
    await drag(choiceC, { to: getDropZone(orderInteraction, 2), duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['B', 'A', 'C']);
  },
  loaders: [loader]
};

// Q10-L1-D5: Order A, C, B → RESPONSE is ['A', 'C', 'B']
export const Q10_L1_D5: Story = {
  name: 'Q10-L1-D5',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, orderInteraction, choiceA, choiceB, choiceC } = getElements(canvasElement);
    await orderInteraction.updateComplete;

    await drag(choiceA, { to: getDropZone(orderInteraction, 0), duration: 300 });
    await drag(choiceC, { to: getDropZone(orderInteraction, 1), duration: 300 });
    await drag(choiceB, { to: getDropZone(orderInteraction, 2), duration: 300 });

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['A', 'C', 'B']);
  },
  loaders: [loader]
};

// Q10-L1-D6: A -> slot0, then return to source, then A -> slot2 => ['', '', 'A']
export const Q10_L1_D6: Story = {
  name: 'Q10-L1-D6',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, orderInteraction, choiceA } = getElements(canvasElement);
    await orderInteraction.updateComplete;

    await drag(choiceA, { to: getDropZone(orderInteraction, 0), duration: 300, steps: 30 });
    await settle();

    const placedA = getDropZone(orderInteraction, 0).querySelector('[identifier="A"]') as HTMLElement;
    await drag(placedA, { to: choiceA, duration: 300, steps: 30 });
    await settle();

    await drag(choiceA, { to: getDropZone(orderInteraction, 2), duration: 300, steps: 30 });
    await settle();

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['', '', 'A']);
  },
  loaders: [loader]
};

// Q10-L1-D7: A->0, B->1, C->2, then move A from 0 to 2 (occupied) => ['A','B','C']
export const Q10_L1_D7: Story = {
  name: 'Q10-L1-D7',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, orderInteraction, choiceA, choiceB, choiceC } = getElements(canvasElement);
    await orderInteraction.updateComplete;

    await drag(choiceA, { to: getDropZone(orderInteraction, 0), duration: 300, steps: 30 });
    await drag(choiceB, { to: getDropZone(orderInteraction, 1), duration: 300, steps: 30 });
    await drag(choiceC, { to: getDropZone(orderInteraction, 2), duration: 300, steps: 30 });
    await settle();

    const placedA = getDropZone(orderInteraction, 0).querySelector('[identifier="A"]') as HTMLElement;
    await drag(placedA, { to: getDropZone(orderInteraction, 2), duration: 300, steps: 30 });
    await settle();

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['A', 'B', 'C']);
  },
  loaders: [loader]
};
