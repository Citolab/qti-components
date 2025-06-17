import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../testing/drag';

import type { QtiSliderInteraction } from './qti-slider-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-slider-interaction');

type Story = StoryObj<QtiSliderInteraction & typeof args>;

/**
 *
 * ### [3.2.18 Slider Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.s61xcrj4qcyj)
 * presents the candidate with a control for selecting a numerical value between a lower and upper bound..
 *
 */
const meta: Meta<QtiSliderInteraction & { 'data-testid' }> = {
  component: 'qti-slider-interaction',
  title: '3.2 interaction types/18 Slider',
  args: {
    ...args,
    'data-testid': 'interaction'
  },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: args => template(args)
};

export const Test: Story = {
  render: args => {
    return html` ${template(args)} `;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByTestId<QtiSliderInteraction>('interaction');
    const knob = slider.shadowRoot?.querySelector('#knob') as HTMLElement;
    slider.value = '50';

    await drag(knob, { delta: { x: 50, y: 0 }, duration: 500 });
  }
};
