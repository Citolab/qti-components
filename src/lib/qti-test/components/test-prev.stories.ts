import { expect, fireEvent } from '@storybook/test';
import { html } from 'lit';
import { findByShadowTitle, getByShadowText } from 'shadow-dom-testing-library';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import type { TestPrev } from '.';
import type { Meta, StoryObj } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-prev');

type Story = StoryObj<TestPrev & typeof args>;

const meta: Meta<TestPrev> = {
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
    <qti-test nav-item-id="t1-test-entry-item4">
      <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
      ${template(args, html`vorige`)}
    </qti-test>
  `
};

export const Test: Story = {
  render: args => html`
    <qti-test nav-item-id="t1-test-entry-item4">
      <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
      <test-prev ${spread(args)}>vorige</test-prev>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const prevButton = getByShadowText(canvasElement, 'vorige');
    expect(prevButton).toBeDisabled();
    const firstItem = await findByShadowTitle(canvasElement, 'T1 - Extended Text Interaction');
    expect(prevButton).not.toBeDisabled();
    expect(firstItem).toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(prevButton);
    await new Promise(resolve => setTimeout(resolve, 500));

    await fireEvent.click(prevButton);
    await new Promise(resolve => setTimeout(resolve, 500));

    await fireEvent.click(prevButton);
    const secondItem = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(secondItem).toBeInTheDocument();
    expect(prevButton).toBeDisabled();
  }
};
