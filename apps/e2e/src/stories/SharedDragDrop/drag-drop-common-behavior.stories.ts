import { getItemByUri } from '@citolab/qti-components';
import { expect, fireEvent } from 'storybook/test';

import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '@citolab/qti-components';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Shared Drag Drop Behavior'
};
export default meta;

const settle = async () => {
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getResponse = (assessmentItem: QtiAssessmentItem) =>
  assessmentItem.variables.find(v => v.identifier === 'RESPONSE')?.value;

export const PressReleaseKeepsGapPlacement: Story = {
  name: 'Shared-DnD: gap-match press/release keeps slot placement',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const interaction = assessmentItem.querySelector('qti-gap-match-interaction') as HTMLElement;
    const winter = interaction.querySelector('qti-gap-text[identifier="W"]') as HTMLElement;
    const gapG1 = interaction.querySelector('qti-gap[identifier="G1"]') as HTMLElement;

    await step('Place winter into G1', async () => {
      await drag(winter, { to: gapG1, duration: 200 });
      await settle();
      expect(gapG1).toHaveTextContent('winter');
    });

    await step('Press and release slotted winter without moving', async () => {
      const placedWinter = gapG1.querySelector('[identifier="W"]') as HTMLElement;
      const rect = placedWinter.getBoundingClientRect();
      const down = { button: 0, buttons: 1, clientX: rect.left + 5, clientY: rect.top + 5 };
      fireEvent.mouseDown(placedWinter, down);
      fireEvent.mouseUp(document, { ...down, buttons: 0 });
      await settle();
    });

    await step('Item remains in the same gap and response is unchanged', () => {
      assessmentItem.processResponse();
      expect(gapG1).toHaveTextContent('winter');
      expect(getResponse(assessmentItem)).toEqual(['W G1']);
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q6/gap-match-example-1.xml') })]
};

export const PressReleaseKeepsOrderPlacement: Story = {
  name: 'Shared-DnD: order press/release keeps slot placement',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const orderInteraction = assessmentItem.querySelector('qti-order-interaction') as HTMLElement;
    const choiceA = orderInteraction.querySelector('qti-simple-choice[identifier="A"]') as HTMLElement;
    const slot0 = orderInteraction.shadowRoot?.querySelector('drop-list[identifier="droplist0"]') as HTMLElement;

    await step('Place choice A in slot 0', async () => {
      await drag(choiceA, { to: slot0, duration: 200 });
      await settle();
      expect(slot0).toHaveTextContent('choice_a');
    });

    await step('Press and release slotted A without moving', async () => {
      const placedA = slot0.querySelector('[identifier="A"]') as HTMLElement;
      const rect = placedA.getBoundingClientRect();
      const down = { button: 0, buttons: 1, clientX: rect.left + 5, clientY: rect.top + 5 };
      fireEvent.mouseDown(placedA, down);
      fireEvent.mouseUp(document, { ...down, buttons: 0 });
      await settle();
    });

    await step('A remains in slot 0', () => {
      assessmentItem.processResponse();
      expect(slot0).toHaveTextContent('choice_a');
      expect(getResponse(assessmentItem)).toEqual(['A', '', '']);
    });
  },
  loaders: [async () => ({ xml: await getItemByUri('/assets/qti-conformance/Advanced/Q10/order-interaction.xml') })]
};
