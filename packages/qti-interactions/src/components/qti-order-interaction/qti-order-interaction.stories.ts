import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../../apps/e2e/src/testing/drag';

import type { InputType } from 'storybook/internal/types';
import type { StoryObj, Meta } from '@storybook/web-components-vite';
import type { QtiOrderInteraction } from './qti-order-interaction';
import type { QtiSimpleChoice } from '../../elements/qti-simple-choice';

const { events, args, argTypes, template } = getStorybookHelpers('qti-order-interaction');

type Story = StoryObj<QtiOrderInteraction & typeof args>;

/**
 *
 * ### [3.2.10 Order Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.4n8gips6tlv4)
 * the candidate's task is to reorder the choices, the order in which the choices are displayed initially is significant.
 *
 */
const meta: Meta<QtiOrderInteraction & { class: InputType }> = {
  component: 'qti-order-interaction',
  title: '3.2 interaction types/10 Order',
  args,
  argTypes: {
    ...argTypes,
    class: {
      options: ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right', 'qti-match-tabular'],
      control: { type: 'select' },
      table: { category: 'Styling' }
    }
  },
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'no-tests']
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <qti-prompt
          >The following F1 drivers finished on the podium in the first ever Grand Prix of Bahrain. Can you rearrange
          them into the correct finishing order?</qti-prompt
        >
        <qti-simple-choice identifier="DriverA">Rubens</qti-simple-choice>
        <qti-simple-choice identifier="DriverB">Jenson</qti-simple-choice>
        <qti-simple-choice identifier="DriverC">Michael</qti-simple-choice>
      `
    )
};

export const Test: Story = {
  render: () => {
    return html` <qti-order-interaction
      data-testid="order-interaction"
      response-identifier="RESPONSE"
      orientation="horizontal"
    >
      <qti-prompt>
        <p>Rearrange them into the correct finishing order.</p>
      </qti-prompt>
      <qti-simple-choice identifier="DriverA">Rubens Barrichello</qti-simple-choice>
      <qti-simple-choice identifier="DriverB">Jenson Button</qti-simple-choice>
      <qti-simple-choice identifier="DriverC">Michael Schumacher</qti-simple-choice>
    </qti-order-interaction>`;
  },
  args: {
    'min-choices': 1,
    'max-choices': 2
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    const dragA = canvas.getByText<QtiSimpleChoice>('Rubens Barrichello');
    const dragB = canvas.getByText<QtiSimpleChoice>('Jenson Button');
    const dragC = canvas.getByText<QtiSimpleChoice>('Michael Schumacher');

    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn(e => e.detail.response);

    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Drag 1 to drop and test response', async () => {
        await drag(dragA, { to: drops[0], duration: 500 });
        await drag(dragB, { to: drops[1], duration: 500 });
        await drag(dragC, { to: drops[2], duration: 500 });
        const receivedEvent = callback.mock.calls.at(-1)?.[0];
        const expectedResponse = ['DriverA', 'DriverB', 'DriverC'];
        expect(interaction.response).toEqual(expectedResponse.join(','));
        expect(receivedEvent.detail.response).toEqual(expectedResponse);
        expect(drops[0]).toHaveTextContent('Rubens Barrichello');
      });
      await step('reset interaction', async () => {
        interaction.reset();
        const receivedEvent = callback.mock.calls.at(-1)?.[0];
        const expectedResponse = ['', '', ''];
        expect(receivedEvent.detail.response).toEqual(expectedResponse);
        expect(interaction.response).toEqual(expectedResponse.join(','));
      });
      await step('set value of interaction', async () => {
        interaction.response = ['DriverA', 'DriverB', 'DriverC'];
        expect(drops[0]).toHaveTextContent('Rubens Barrichello');
      });
      await step('disabled', async () => {
        interaction.disabled = true;
        expect(drops[0]).toHaveTextContent('Rubens Barrichello');
      });
      await step('readonly', async () => {
        interaction.disabled = true;
        expect(drops[0]).toHaveTextContent('Rubens Barrichello');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};
