import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestPrintContext } from './test-print-context';

import './test-print-context';

const { events, args, argTypes, template } = getStorybookHelpers('test-print-context');

type Story = StoryObj<TestPrintContext & typeof args>;

const meta: Meta<TestPrintContext> = {
  component: 'test-print-context',
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
    html` <qti-test>
      <test-navigation>
        <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
        ${template(args)}
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};
