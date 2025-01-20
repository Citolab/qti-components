import { expect, fireEvent, waitFor } from '@storybook/test';
import { html } from 'lit';
import { findByShadowTitle } from 'shadow-dom-testing-library';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import type { TestNext } from './test-next';
import type { Meta, StoryObj } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-next');

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
    <qti-test>
      <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
      ${template(args, html`volgende`)}
    </qti-test>
  `
};

export const Test: Story = {
  render: args => html`
    <qti-test>
      <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
      <test-next ${spread(args)}>volgende</test-next>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const nextButton = canvasElement.querySelector('test-next');
    // expect(nextButton).toBeDisabled();
    await waitFor(() => expect(nextButton).toBeEnabled());
    await new Promise(resolve => setTimeout(resolve, 500));
    const firstItem = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(firstItem).toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    const secondItem = await findByShadowTitle(canvasElement, 'T1 - Choice Interaction - Multiple Cardinality');
    expect(secondItem).toBeInTheDocument();
    await fireEvent.click(nextButton);
    await fireEvent.click(nextButton);
    expect(nextButton).toBeDisabled();
  }
};
