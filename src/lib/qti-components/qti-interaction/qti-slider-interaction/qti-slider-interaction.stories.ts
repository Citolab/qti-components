import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

import type { QtiSliderInteraction } from './qti-slider-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-slider-interaction');

type Story = StoryObj<QtiSliderInteraction & typeof args>;

const meta: Meta<QtiSliderInteraction> = {
  component: 'qti-slider-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: args => {
    return html` ${template(args)} `;
  }
};
