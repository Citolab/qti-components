import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestPrintVariables } from './test-print-item-variables';

import './test-print-item-variables';

const { events, args, argTypes, template } = getStorybookHelpers('test-print-item-variables');

type Story = StoryObj<TestPrintVariables & typeof args>;

const meta: Meta<TestPrintVariables> = {
  component: 'test-print-item-variables',
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
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
        ${template(args)}
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};
