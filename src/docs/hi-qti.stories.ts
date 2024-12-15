import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { QtiTest } from '../lib/qti-test';

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

export const PkgPr: Story = {
  render: (_args, context) => {
    if (context.loaded?.pkgpr) {
      return html`<pre>${context.loaded.pkgpr.packages[0]?.url || 'No URL available'}</pre>`;
    } else if (context.error) {
      return html`<p>Error: ${context.error}</p>`;
    } else {
      return html`<p>No pkg pr URL available</p>`;
    }
  },
  loaders: [
    async () => {
      try {
        const response = await fetch('./pkg.pr.json');
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.statusText}`);
        }
        const pkgpr = await response.json();
        return { pkgpr };
      } catch (error) {
        return { error: error.message || 'An error occurred while fetching the file.' };
      }
    }
  ]
};
