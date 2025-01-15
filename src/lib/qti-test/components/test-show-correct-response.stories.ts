import type { Meta, StoryObj } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import type { TestShowCorrectResponse } from './test-show-correct-response';
import { html } from 'lit';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-show-correct-response');

type Story = StoryObj<TestShowCorrectResponse & typeof args>;

const meta: Meta<TestShowCorrectResponse> = {
  component: 'test-show-correct-response',
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
      ${template(args, html`Show Correct`)}
      <test-next>Volgende</test-next>
    </qti-test>`
};
