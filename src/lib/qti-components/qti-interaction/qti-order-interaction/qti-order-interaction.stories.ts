import type { StoryObj, Meta } from '@storybook/web-components';
import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import type { QtiOrderInteraction } from './qti-order-interaction';
import type { InputType } from '@storybook/core/types';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-order-interaction');

type Story = StoryObj<QtiOrderInteraction & typeof args>;

const meta: Meta<QtiOrderInteraction & { class: InputType }> = {
  component: 'qti-order-interaction',
  title: 'components/qti-order-interaction',
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
