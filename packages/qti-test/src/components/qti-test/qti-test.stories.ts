import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTest } from './qti-test';

type Story = StoryObj<QtiTest>;

const meta: Meta<QtiTest> = {
  title: 'QTI Test/Overview',
  component: 'qti-test',
  subcomponents: { testContainer: 'test-container' },
  args: {},
  argTypes: {},
  parameters: {
    actions: {
      handles: {}
    },
    controls: { disable: true }
  },
  tags: ['autodocs', 'no-tests']
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
