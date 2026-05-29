import { expect, waitFor } from 'storybook/test';

import type { QtiTest } from '@qti-components/test';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj<QtiTest>;

const html = String.raw;

const meta: Meta<QtiTest> = {
  // tags: ['!dev']
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
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/api/examples/assessment.xml"></test-container>
        <div>
          <test-prev> previous </test-prev>
          <test-next> next </test-next>
        </div>
      </test-navigation>
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

/**
 * Loads the examples assessment, navigates to the `math.xml` item, and validates that the MathML equation has
 * namespaces intact so the browser can render it
 */
export const MathQuestion: Story = {
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/api/examples/assessment.xml"></test-container>
        <div>
          <test-item-link item-id="ITM-math">Go to Math Question</test-item-link>
          <test-prev> previous </test-prev>
          <test-next> next </test-next>
        </div>
      </test-navigation>
    </qti-test>
  `,

  play: async ({ canvasElement, step }) => {
    const getTestContainerShadow = () => canvasElement.querySelector('test-container')?.shadowRoot;

    await step('Wait for the assessment to load', async () => {
      await waitFor(
        () => {
          const shadow = getTestContainerShadow();
          const item = shadow?.querySelector('qti-assessment-item');
          expect(item).not.toBeNull();
        },
        { timeout: 10000 }
      );
    });

    await step('Click the math item link', async () => {
      const link = canvasElement.querySelector('test-item-link[item-id="ITM-math"]') as HTMLElement;
      expect(link).not.toBeNull();
      link.click();
    });

    await step('Validate the equation is mathml', async () => {
      await waitFor(
        () => {
          const shadow = getTestContainerShadow();
          // Grab the <math> element
          const mathEl = shadow?.querySelector('math');

          expect(mathEl).toBeTruthy();

          // Namespace must still be MathML
          expect(mathEl!.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');

          // And the children too
          const mi = mathEl!.querySelector('mi');
          expect(mi!.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
        },
        { timeout: 10000 }
      );
    });
  }
};
