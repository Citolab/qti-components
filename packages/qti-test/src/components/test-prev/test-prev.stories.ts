import { expect, fireEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { findByShadowTitle, getByShadowText, within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../../tools/testing/test-utils';
import { SHOWCASE_TEST } from '../qti-test/showcase.fixtures';

import type { TestPrev } from '..';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-prev');

type Story = StoryObj<TestPrev & typeof args>;

const meta: Meta<TestPrev> = {
  title: 'QTI Test/Building blocks/test-prev',
  component: 'test-prev',
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
  render: () => html`
    <qti-test>
      <test-navigation>
        <test-container test-url=${SHOWCASE_TEST}> </test-container>
        ${template(args, html`previous`)}
        <test-next>next</test-next>
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
      <test-item-link item-id="ITEM028">link</test-item-link>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = await canvas.findByShadowText('link');

    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Multiple choice, one answer');

    // jump to the third item
    await fireEvent.click(link);

    const prevButton = canvas.getByShadowText('previous');
    const nextButton = canvas.getByShadowText('next');

    const thirdItem = await getAssessmentItemFromTestContainerByDataTitle(
      canvasElement,
      'Multiple choice with pictures'
    );
    expect(thirdItem).toBeInTheDocument();
    await waitFor(() => expect(prevButton).not.toBeDisabled());

    await fireEvent.click(prevButton);
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Multiple choice, several answers');
    await fireEvent.click(prevButton);
    const firstItem = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Multiple choice, one answer');
    expect(firstItem).toBeInTheDocument();
    await waitFor(() => expect(prevButton).toBeDisabled());

    await fireEvent.click(nextButton);
    await waitFor(() => expect(prevButton).not.toBeDisabled());
  }
};
