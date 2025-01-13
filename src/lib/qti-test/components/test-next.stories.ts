import { expect, fireEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { findByShadowTitle } from 'shadow-dom-testing-library';
import type { QtiTest } from '../core/qti-test';

type Story = StoryObj;

const meta: Meta<QtiTest> = {
  component: 'test-next'
};
export default meta;

export const Default: Story = {
  render: () => html`
    <qti-test>
      <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
      <test-next>volgende</test-next>
    </qti-test>
  `
};

export const PlayFast: Story = {
  render: Default.render,
  play: async ({ canvasElement }) => {
    const nextButton = canvasElement.querySelector('test-next');
    // expect(nextButton).toBeDisabled();
    await waitFor(() => expect(nextButton).toBeEnabled());
    await fireEvent.click(nextButton);
    await fireEvent.click(nextButton);
    await fireEvent.click(nextButton);
    expect(nextButton).toBeDisabled();
  }
};

export const PlayWithDelay: Story = {
  render: Default.render,
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
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    expect(nextButton).toBeDisabled();
  }
};
