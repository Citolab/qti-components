import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiItem } from './qti-item';

const { events, args, argTypes, template } = getStorybookHelpers('qti-item');

type Story = StoryObj<QtiItem & typeof args>;

const meta: Meta<QtiItem> = {
  component: 'qti-item',
  subcomponents: { ItemContainer: 'item-container' },
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs']
};
export default meta;

export const Default: Story = {
  render: args => {
    return html`${template(args, html`<item-container item-url="/qti-item/example-choice-item.xml"></item-container>`)}`;
  }
};
