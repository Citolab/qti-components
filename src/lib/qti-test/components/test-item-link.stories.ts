import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestItemLink } from './test-item-link';


const { events, args, argTypes, template } = getWcStorybookHelpers('test-item-link');

type Story = StoryObj<TestItemLink & typeof args>;

const meta: Meta<TestItemLink> = {
  component: 'test-item-link',
  args: { ...args, 'item-id': 'ITM-32cjnu' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: args =>
    html` <qti-test>
      <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
      ${template(args, html`Link to item`)}
    </qti-test>`
};
