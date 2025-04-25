import { expect, fireEvent } from '@storybook/test';
import { html } from 'lit';
import { findByShadowTitle, getByShadowText, within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import type { TestPrev } from '.';
import type { Meta, StoryObj } from '@storybook/web-components';

const { events, args, argTypes, template } = getStorybookHelpers('test-prev');

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
    <qti-test>
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
        ${template(args, html`vorige`)}
        <test-next>volgende</test-next>
      </test-navigation>
    </qti-test>
  `
};

export const Test: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
        <test-prev>vorige</test-prev>
        <test-next>volgende</test-next>
      </test-navigation>
      <test-item-link item-id="t1-test-entry-item4">link</test-item-link>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = await canvas.findByShadowText('link');

    await canvas.findByShadowTitle('T1 - Test Entry - Item 1');
    await fireEvent.click(link);

    const prevButton = canvas.getByShadowText('vorige');
    const nextButton = canvas.getByShadowText('volgende');

    expect(prevButton).toBeDisabled();
    const firstItem = await canvas.findByShadowTitle('T1 - Extended Text Interaction');
    expect(prevButton).not.toBeDisabled();
    expect(firstItem).toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 1));
    await fireEvent.click(prevButton);
    await new Promise(resolve => setTimeout(resolve, 1));

    await fireEvent.click(prevButton);
    await new Promise(resolve => setTimeout(resolve, 1));

    await fireEvent.click(prevButton);
    const secondItem = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(secondItem).toBeInTheDocument();
    expect(prevButton).toBeDisabled();
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(prevButton).not.toBeDisabled();
  }
};
