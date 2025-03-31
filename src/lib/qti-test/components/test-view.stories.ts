import { expect, userEvent } from '@storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import type { TestView as TestViewClass } from './test-view';
import type { Meta, StoryObj } from '@storybook/web-components';

const { events, args, argTypes, template } = getStorybookHelpers('test-view');

type Story = StoryObj<TestViewClass & typeof args>;

const meta: Meta<TestViewClass> = {
  component: 'test-view',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['no-tests']
};
export default meta;

export const Default: Story = {
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
        ${template(args)}
      </test-navigation>
    </qti-test>`
};

export const Test: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
        <test-view ${spread(args)}>vorige</test-view>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectElement = await canvas.findByShadowLabelText('view');
    // 1 Wait for the item to load
    const itemElement = await canvas.findByShadowTitle('T1 - Test Entry - Item 1');
    expect(itemElement).toBeInTheDocument();
    // 2 Assume the candidate rubric is not visible
    const rubricElement = await canvas.findByShadowText('candidate rubric block');
    expect(rubricElement).toBeVisible();
    // 3 Select the candidate view
    await userEvent.selectOptions(selectElement, 'candidate');
    // 4 Wait for the candidate rubric to be visible
    expect(rubricElement).toBeVisible();
    // 5 Assume correctResponse is not set
    const firstChoiceElement = await canvas.findByShadowText('Correct');
    const afterStyle = getComputedStyle(firstChoiceElement, '::after');
    expect(afterStyle.content).toBe('none');
    // 6 Set the view to scorer
    await userEvent.selectOptions(selectElement, 'scorer');
    // Expect the correctResponse to be visible
    expect(afterStyle.content).not.toBe('none');
  },
  args: {
    'view-options': 'candidate, scorer'
  }
};
