import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestItemLink } from './test-item-link';

const { events, args, argTypes, template } = getStorybookHelpers('test-item-link');

type Story = StoryObj<TestItemLink & typeof args>;

const meta: Meta<TestItemLink> = {
  component: 'test-item-link',
  args: { ...args }, // itemId: 'ITM-32cjnu' - private property, set via attribute
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
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
        ${template(args, html`Link to item`)}
      </test-navigation>
    </qti-test>`
};
