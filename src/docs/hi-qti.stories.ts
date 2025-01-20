import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { QtiTest } from '../lib/qti-test/core';

type Story = StoryObj<QtiTest>;

const meta: Meta<QtiTest> = {
  tags: ['!dev']
};
export default meta;

export const Default: Story = {
  render: () => html`
    <style>
      test-container {
        display: block;
        aspect-ratio: 16 / 5;
        max-width: 800px;
      }
    </style>
    <qti-test>
      <test-container test-url="/assets/api/examples/assessment.xml"></test-container>
      <div>
        <test-prev> previous </test-prev>
        <test-next> next </test-next>
      </div>
    </qti-test>
  `
};

// export const PkgPr: Story = {
//   render: (_args, context) => {
//     if (context.loaded?.pkgpr) {
//       return html`<pre>${context.loaded.pkgpr.packages[0]?.url || 'No URL available'}</pre>`;
//     } else if (context.error) {
//       return html`<p>Error: ${context.error}</p>`;
//     } else {
//       return html`<p>No pkg pr URL available</p>`;
//     }
//   },
//   loaders: [
//     async () => {
//       try {
//         const response = await fetch('./pkg.pr.json');
//         if (!response.ok) {
//           throw new Error(`Failed to load: ${response.statusText}`);
//         }
//         const pkgpr = await response.json();
//         return { pkgpr };
//       } catch (error) {
//         return { error: error.message || 'An error occurred while fetching the file.' };
//       }
//     }
//   ]
// };
