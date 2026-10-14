import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestPrintContext } from './test-print-context';

import './test-print-context';

const { events, args, argTypes, template } = getStorybookHelpers('test-print-context');

type Story = StoryObj<TestPrintContext & typeof args>;

/**
 * The **print** plugin is two debug helpers that show what the test knows, for building a page or a
 * plugin.
 *
 * - `<test-print-context>` prints the whole `computedContext` as JSON.
 * - `<test-print-item-variables>` prints the variables of the active item as a table.
 */
const meta: Meta<TestPrintContext> = {
  tags: ['autodocs'],
  title: 'Plugins/Print/test-print-context',
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
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
        ${template(args)}
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};
