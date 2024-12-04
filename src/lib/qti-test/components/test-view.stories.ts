import { expect, userEvent } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { TestView as TestViewClass } from './test-view';
import { html } from 'lit';
import { findByShadowText, findByShadowTitle, getByShadowLabelText, getByShadowText } from 'shadow-dom-testing-library';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-view');

type Story = StoryObj<TestViewClass & typeof args>;

const meta: Meta<TestViewClass> = {
  title: 'qti-test/test-components/test-view',
  component: 'test-view',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const TestView: Story = {
  render: args =>
    html` <qti-test testURL="/assets/api/conformance/assessment.xml">
      <test-container></test-container>
      ${template(args)}
    </qti-test>`,

  play: async ({ canvasElement }) => {
    const selectElement = getByShadowLabelText(canvasElement, 'view');
    // 1 Wait for the item to load
    const itemElement = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(itemElement).toBeInTheDocument();
    // 2 Assume the candidate rubric is not visible
    const rubricElement = getByShadowText(canvasElement, 'candidate rubric block');
    expect(rubricElement).toBeVisible();
    // 3 Select the candidate view
    await userEvent.selectOptions(selectElement, 'candidate');
    // 4 Wait for the candidate rubric to be visible
    expect(rubricElement).toBeVisible();
    // 5 Assume correctResponse is not set
    const firstChoiceElement = await findByShadowText(canvasElement, 'Correct');
    const afterStyle = getComputedStyle(firstChoiceElement, '::after');
    expect(afterStyle.content).toBe('none');
    // 6 Set the view to scorer
    await userEvent.selectOptions(selectElement, 'scorer');
    // Expect the correctResponse to be visible
    expect(afterStyle.content).not.toBe('none');
  }
};
