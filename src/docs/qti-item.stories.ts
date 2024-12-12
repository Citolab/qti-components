import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { fireEvent } from '@storybook/test';
import { findByShadowTitle } from 'shadow-dom-testing-library';
import { QtiTest } from '@citolab/qti-components/qti-test';

type Story = StoryObj<QtiTest>;

const meta: Meta<QtiTest> = {
  component: 'qti-test',
  tags: ['!autodocs', '!dev']
};
export default meta;

export const Unstyled: Story = {
  render: () => html`
    <qti-test>
      <test-container test-url="/assets/api/examples/assessment.xml"></test-container>
      <test-prev> previous </test-prev>
      <test-next> next </test-next>
    </qti-test>
  `
};

export const Styled: Story = {
  render: () => html`
    <qti-test class="d-flex h-100 w-full flex-column">
      <test-container test-url="/assets/api/examples/assessment.xml" class="overflow-auto aspect-16/9"></test-container>
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
