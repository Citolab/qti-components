import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

import type { QtiSliderInteraction } from './qti-slider-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-slider-interaction');

type Story = StoryObj<QtiSliderInteraction & typeof args>;

/**
 *
 * ### [3.2.18 Slider Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.s61xcrj4qcyj)
 * presents the candidate with a control for selecting a numerical value between a lower and upper bound..
 *
 */
const meta: Meta<QtiSliderInteraction> = {
  component: 'qti-slider-interaction',
  title: '3.2 interaction types/3.2.18 Slider Interaction',
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
