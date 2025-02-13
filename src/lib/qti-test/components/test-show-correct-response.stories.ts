import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { expect, userEvent, waitFor } from '@storybook/test';
import { findByShadowText, findByShadowTitle, within } from 'shadow-dom-testing-library';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';

import type { TestShowCorrectResponse } from './test-show-correct-response';
import type { Meta, StoryObj } from '@storybook/web-components';

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
    html` <qti-test nav-item-id="ITM-text_entry">
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment.xml"> </test-container>
        ${template(args, html`Show Correct`)}
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};

export const Test: Story = {
  render: args => html`
    <qti-test nav-item-id="ITM-text_entry">
      <test-navigation>
        <!-- <test-print-item-variables></test-print-item-variables> -->
        <test-container test-url="/assets/qti-test-package/assessment.xml"> </test-container>
        <test-show-correct-response ${spread(args)}>Show correct</test-show-correct-response>
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nextButton = await canvas.findByShadowText('Volgende');
    await waitFor(() => expect(nextButton).toBeEnabled());

    const firstItem = await findByShadowTitle(canvasElement, 'Richard III (Take 3)');
    expect(firstItem).toBeInTheDocument();

    const showCorrectButton = await findByShadowText(canvasElement, 'Show correct response');
    showCorrectButton.click();

    const incorrect = await canvas.findByShadowText('York');
    expect(incorrect).toBeInTheDocument();
  }
};
