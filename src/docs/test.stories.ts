import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { fireEvent } from '@storybook/test';
import { findByShadowTitle } from 'shadow-dom-testing-library';
import { QtiTest } from '@citolab/qti-components/qti-test';

type Story = StoryObj<QtiTest>;

const meta: Meta<QtiTest> = {
  component: 'qti-test'
};
export default meta;

export const Default: Story = {
  render: () => html`
    <qti-test class="flex h-full w-full flex-col" testURL="/assets/api/examples/assessment.xml">
      <test-container class="relative flex-1 overflow-auto"> </test-container>

      <div class="flex items-center justify-between gap-2">
        <test-prev>volgende</test-prev>
        <test-next>volgende</test-next>
      </div>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const nextButton = canvasElement.querySelector('test-next');
    await findByShadowTitle(canvasElement, 'Info Start');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(nextButton);
  }
};
