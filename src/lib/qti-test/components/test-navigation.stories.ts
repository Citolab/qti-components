import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestNavigation } from './test-navigation';

const { events, args, argTypes, template } = getStorybookHelpers('test-navigation');

type Story = StoryObj<TestNavigation & typeof args>;

const meta: Meta<TestNavigation> = {
  component: 'test-navigation',
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
      ${template(args, html` <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>`)}
    </qti-test>`
};
