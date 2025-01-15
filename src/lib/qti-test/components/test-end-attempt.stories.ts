import type { Meta, StoryObj } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import type { TestEndAttempt } from './test-end-attempt';
import { html } from 'lit';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-end-attempt');

type Story = StoryObj<TestEndAttempt & typeof args>;

const meta: Meta<TestEndAttempt> = {
  component: 'test-end-attempt',
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
      <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
      ${template(args, html`End Attempt`)}
      <test-next>Volgende</test-next>
    </qti-test>`
};
