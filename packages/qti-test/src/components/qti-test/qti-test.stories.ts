import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTest } from './qti-test';

type Story = StoryObj<QtiTest>;

const meta: Meta<QtiTest> = {
  title: 'Getting started',
  component: 'qti-test',
  args: {},
  argTypes: {},
  parameters: {
    actions: {
      handles: {}
    },
    controls: { disable: true }
  },
  // The demo behind the Getting started page: out of the sidebar (`!dev`) and out of the test runs (`no-tests`).
  tags: ['!dev', 'no-tests']
};
export default meta;

/** The smallest working test: a container that loads the test, and previous and next to move through it. */
export const Default: Story = {
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
        <nav><test-prev>Previous</test-prev><test-next>Next</test-next></nav>
      </test-navigation>
    </qti-test>
  `
};
