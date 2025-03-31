import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestSectionLink } from './test-section-link';

const { events, args, argTypes, template } = getStorybookHelpers('test-section-link');

type Story = StoryObj<TestSectionLink & typeof args>;

const meta: Meta<TestSectionLink & { 'section-id' }> = {
  component: 'test-section-link',
  args: { ...args, 'section-id': 'advanced' },
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
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        ${template(args, html`Link to section`)}
      </test-navigation>
    </qti-test>`
};
