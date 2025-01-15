import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import type { QtiItem } from './qti-item';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-item');

type Story = StoryObj<QtiItem & typeof args>;

const meta: Meta<typeof QtiItem> = {
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
