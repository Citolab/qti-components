import { html } from 'lit';
import { QtiSliderInteraction } from './qti-slider-interaction';
import { StoryObj, Meta } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

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

export const Default = (args: any) => html` ${template(args)} `;
