import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import '../../../../../.storybook/utilities.css';
import { GETTING_STARTED_TEST } from '../qti-test/getting-started.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestPrintState } from './test-print-state';

import './test-print-state';

const { events, args, argTypes, template } = getStorybookHelpers('test-print-state');

type Story = StoryObj<TestPrintState & typeof args>;

/**
 * `<test-print-state>` shows the test's state (`qtiTest.state`, what `cito-test-state-changed` sends)
 * as a tree you can fold open and shut. Drop it anywhere inside `<qti-test>`; it follows every change.
 * It only lays out the tree: the font, colour and height come from the page.
 */
const meta: Meta<TestPrintState> = {
  tags: ['autodocs'],
  title: 'QTI Test/Plugins/Print/test-print-state',
  component: 'test-print-state',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

/** Answer the first item: the tree shows the new response of `GS-photosynthesis`. */
export const Default: Story = {
  parameters: { testTimeout: 30000 },
  render: args => html`
    <qti-test navigate="item">
      <div class="flex gap-3">
        <test-navigation class="flex flex-col gap-2 flex-1 min-w-0">
          <test-container class="block h-100 overflow-auto" test-url=${GETTING_STARTED_TEST}></test-container>
          <nav class="flex justify-between">
            <test-prev>Previous</test-prev>
            <test-next>Next</test-next>
          </nav>
        </test-navigation>
        <div class="relative w-80">
          <div class="absolute inset-0 overflow-auto font-mono text-xs text-gray-500">${template(args)}</div>
        </div>
      </div>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const printState = canvasElement.querySelector('test-print-state')!;
    const tree = within(printState.shadowRoot as unknown as HTMLElement);

    await waitFor(() => expect(tree.getByText('0 · GS-photosynthesis')).toBeInTheDocument(), { timeout: 15000 });
    expect(tree.getByText('session')).toBeInTheDocument();

    const item = await waitFor(
      () => {
        const element = canvasElement.querySelector('test-container')?.shadowRoot?.querySelector('qti-assessment-item');
        if (!element) throw new Error('the first item is not loaded yet');
        return element;
      },
      { timeout: 15000 }
    );
    within(item as HTMLElement)
      .getByText('Light')
      .click();

    await waitFor(() => expect(tree.getAllByText('"light"').length).toBeGreaterThan(0));
  }
};
