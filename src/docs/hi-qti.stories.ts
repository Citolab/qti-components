import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { QtiTest } from '@citolab/qti-components/qti-test';

type Story = StoryObj<QtiTest>;

const meta: Meta<QtiTest> = {
  tags: ['!dev']
};
export default meta;

export const Default: Story = {
  render: () => html`
    <qti-test class="d-flex h-100 w-full flex-column">
      <test-container test-url="/assets/api/examples/assessment.xml" class="overflow-auto aspect-16/9"></test-container>
      <div class="d-flex align-items-center justify-content-between">
        <test-prev class="d-flex flex-nowrap btn  btn-success">
          <i class="bi bi-arrow-left-short me-2"></i>previous
        </test-prev>

        <test-next class="d-flex flex-nowrap btn  btn-success">
          next<i class="bi bi-arrow-right-short ms-2"></i>
        </test-next>
      </div>
    </qti-test>
  `
};
