import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

import { SHOWCASE_TEST } from '../showcase.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestPrintVariables } from './test-print-item-variables';

import './test-print-item-variables';

const { events, args, argTypes, template } = getStorybookHelpers('test-print-item-variables');

type Story = StoryObj<TestPrintVariables & typeof args>;

const meta: Meta<TestPrintVariables> = {
  title: 'QTI Test/Plugins/Print/test-print-item-variables',
  component: 'test-print-item-variables',
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
        <test-container test-url=${SHOWCASE_TEST}></test-container>
        ${template(args)}
        <test-next>Next</test-next>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('test-print-item-variables')!;
    // The first item's response variable is listed.
    await waitFor(() => expect(table.shadowRoot?.textContent).toContain('RESPONSE'), { timeout: 15000 });
  }
};
