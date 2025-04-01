import { expect, fireEvent, waitFor } from '@storybook/test';
import { html } from 'lit';
import { findByShadowTitle } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import type { TestNext } from './test-next';
import type { Meta, StoryObj } from '@storybook/web-components';

const { events, args, argTypes, template } = getStorybookHelpers('test-next');

type Story = StoryObj<TestNext & typeof args>;

const meta: Meta<TestNext> = {
  component: 'test-next',
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
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
        ${template(args, html`volgende`)}
      </test-navigation>
    </qti-test>
  `
};

export const Test: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
        <test-next ${spread(args)}>volgende</test-next>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const nextButton = canvasElement.querySelector('test-next');
    await waitFor(() => expect(nextButton).toBeEnabled());
    const firstItem = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(firstItem).toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    const secondItem = await findByShadowTitle(canvasElement, 'T1 - Choice Interaction - Multiple Cardinality');
    expect(secondItem).toBeInTheDocument();
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 1)); // minimal time to let the next button know about the update on sessionContext
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 1)); // minimal time to let the next button know about the update on sessionContext
    await fireEvent.click(nextButton);
    expect(nextButton).toBeDisabled();
  }
};
