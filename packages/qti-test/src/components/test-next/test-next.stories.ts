import { expect, fireEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { findByShadowTitle, within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../../tools/testing/test-utils';
import { SHOWCASE_TEST } from '../qti-test/showcase.fixtures';

import type { TestNext } from './test-next';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-next');

type Story = StoryObj<TestNext & typeof args>;

const meta: Meta<TestNext> = {
  title: 'QTI Test/Building blocks/test-next',
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
        <test-container test-url=${SHOWCASE_TEST}> </test-container>
        <test-prev>previous</test-prev>
        ${template(args, html`next`)}
      </test-navigation>
    </qti-test>
  `
};

export const Test: Story = {
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url=${SHOWCASE_TEST}> </test-container>
        <test-prev>previous</test-prev>
        <test-next>next</test-next>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const prevButton = canvas.getByShadowText('previous');
    const nextButton = canvas.getByShadowText('next');
    await waitFor(() => expect(nextButton).toBeEnabled());

    const firstItem = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Multiple choice, one answer');
    expect(firstItem).toBeInTheDocument();
    expect(prevButton).toBeDisabled();

    await fireEvent.click(nextButton);
    const secondItem = await getAssessmentItemFromTestContainerByDataTitle(
      canvasElement,
      'Multiple choice, several answers'
    );
    expect(secondItem).toBeInTheDocument();
    await waitFor(() => expect(prevButton).toBeEnabled());
  }
};

/** On the last item of the test there is no next. */
export const LastItem: Story = {
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url=${SHOWCASE_TEST}> </test-container>
        <test-prev>previous</test-prev>
        <test-next>next</test-next>
        <test-item-link item-id="ITEM027">last</test-item-link>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByShadowText('next');
    await waitFor(() => expect(nextButton).toBeEnabled());

    await fireEvent.click(canvas.getByShadowText('last'));
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Custom interaction (PCI)');
    await waitFor(() => expect(nextButton).toBeDisabled());
    await waitFor(() => expect(canvas.getByShadowText('previous')).toBeEnabled());
  }
};
