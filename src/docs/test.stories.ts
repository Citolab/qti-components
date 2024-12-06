import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { fireEvent } from '@storybook/test';
import { findByShadowTitle } from 'shadow-dom-testing-library';
import { QtiTest } from '@citolab/qti-components/qti-test';

type Story = StoryObj<QtiTest>;

const meta: Meta<QtiTest> = {
  component: 'qti-test',
  tags: ['autodocs', '!dev', 'hidden-docs']
};
export default meta;

export const Unstyled: Story = {
  render: () => html`
    <qti-test testURL="/assets/api/examples/assessment.xml">
      <test-container></test-container>
      <test-prev> previous </test-prev>
      <test-next> next </test-next>
    </qti-test>
  `
  // play: async ({ canvasElement }) => {
  //   const nextButton = canvasElement.querySelector('test-next');
  //   await findByShadowTitle(canvasElement, 'Info Start');
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   await fireEvent.click(nextButton);
  // }
};

export const Styled: Story = {
  render: () => html`
    <qti-test testURL="/assets/api/examples/assessment.xml" class="d-flex h-100 w-full flex-column">
      <test-container class="overflow-auto aspect-16/9"></test-container>
      <div class="d-flex align-items-center justify-content-between">
        <test-prev class="d-flex flex-nowrap btn btn-lg btn-success">
          <i class="bi bi-arrow-left-short me-2"></i>previous
        </test-prev>

        <test-next class="d-flex flex-nowrap btn btn-lg btn-success">
          next<i class="bi bi-arrow-right-short ms-2"></i>
        </test-next>
      </div>
    </qti-test>
  `
};
