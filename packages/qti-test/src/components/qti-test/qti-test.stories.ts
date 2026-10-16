import { html } from 'lit';

import '../../../../../.storybook/utilities.css';
import { GETTING_STARTED_TEST } from './getting-started.fixtures';

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

/**
 * The smallest working test, as a mini player: the item sits in a box of fixed height that scrolls when
 * the content is taller, so moving between items does not make the page jump.
 */
export const Default: Story = {
  render: () => html`
    <qti-test navigate="item">
      <test-navigation class="flex flex-col gap-2">
        <test-container
          class="block h-96 overflow-auto border rounded p-4"
          test-url=${GETTING_STARTED_TEST}
        ></test-container>
        <nav class="flex justify-between">
          <test-prev>Previous</test-prev>
          <test-next>Next</test-next>
        </nav>
      </test-navigation>
    </qti-test>
  `
};
