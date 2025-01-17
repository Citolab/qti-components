import type { Meta, StoryObj } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import type { TestEndAttempt } from './test-end-attempt';
import { expect, waitFor } from '@storybook/test';
import { findByShadowText, findByShadowTitle } from 'shadow-dom-testing-library';
import { spread } from '@open-wc/lit-helpers';

import { html } from 'lit';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-end-attempt');

type Story = StoryObj<TestEndAttempt & typeof args>;

const meta: Meta<TestEndAttempt> = {
  component: 'test-end-attempt',
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
      <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
      ${template(args, html`End Attempt`)}
      <test-next>Volgende</test-next>
    </qti-test>`
};

export const Test: Story = {
  render: args => html`
    <qti-test nav-item-id="t1-test-entry-item3">
      <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
      <test-end-attempt ${spread(args)}>End Attempt</test-end-attempt>
      <test-next>Volgende</test-next>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const nextButton = await findByShadowText(canvasElement, 'Volgende');
    await waitFor(() => expect(nextButton).toBeEnabled());
    const firstItem = await findByShadowTitle(canvasElement, 'T1 - Text Entry Interaction');
    expect(firstItem).toBeInTheDocument();
  }
};
