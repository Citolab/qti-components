import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { QtiTest } from '@citolab/qti-components/qti-test';

type Story = StoryObj<QtiTest>;

const meta: Meta<QtiTest> = {
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

export const ItemsStyled: Story = {
  render: () => html`
    <style>
      test-container {
        --qti-bg-active: #efecff;
        --qti-border-active: #581d70;
        --qti-button-padding-vertical: 0.2rem;
      }
    </style>
    <qti-test>
      <test-container test-url="/assets/api/examples/assessment.xml"></test-container>
      <test-prev> previous </test-prev>
      <test-next> next </test-next>
    </qti-test>
  `
};
