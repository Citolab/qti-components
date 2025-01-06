import { html } from 'lit';

import { QtiSelectPointInteraction } from '../../index';
import { StoryObj, Meta } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-select-point-interaction');

type Story = StoryObj<QtiSelectPointInteraction & typeof args>;

const meta: Meta<QtiSelectPointInteraction> = {
  component: 'qti-select-point-interaction',
  title: 'components/qti-select-point-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html` <qti-prompt>Mark Edinburgh on this map of the United Kingdom.</qti-prompt>
        <img src="qti-select-point-interaction/uk.png" height="280" width="206" />`
    )
};
