import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiPortableCustomInteraction } from '../qti-portable-custom-interaction';

type Story = StoryObj<QtiPortableCustomInteraction>;

const meta: Meta<QtiPortableCustomInteraction> = {
  component: 'qti-portable-custom-interaction',
  title: '23 Portable Custom Interaction (PCI)/Correct Response',
  tags: ['correct-response', 'standalone']
};
export default meta;

const overviewStyles = html`
  <style>
    .overview-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    }
    .overview-grid section {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 1rem;
    }
    .overview-grid h3 {
      margin: 0 0 0.5rem;
      font:
        600 0.85rem/1.2 system-ui,
        sans-serif;
      color: #444;
    }
    .overview-grid code {
      font-size: 0.75rem;
      background: #f3f3f3;
      padding: 0.05rem 0.3rem;
      border-radius: 3px;
    }
  </style>
`;

/**
 * Note: PCI responses are opaque — interpretation is delegated to the PCI
 * module. This overview shows the view-mode attributes on a placeholder PCI;
 * actual visual feedback depends on the loaded module's implementation.
 */
export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="A" · correct-response="A"</code></p>
        <qti-portable-custom-interaction
          response-identifier="RESPONSE"
          correct-response="A"
          response="A"
          show-candidate-correction
        ></qti-portable-custom-interaction>
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="B" · correct-response="A"</code></p>
        <qti-portable-custom-interaction
          response-identifier="RESPONSE"
          correct-response="A"
          response="B"
          show-candidate-correction
        ></qti-portable-custom-interaction>
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="B" · correct-response="A"</code></p>
        <qti-portable-custom-interaction
          response-identifier="RESPONSE"
          correct-response="A"
          response="B"
          show-correct-response
        ></qti-portable-custom-interaction>
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="B" · correct-response="A"</code></p>
        <qti-portable-custom-interaction
          response-identifier="RESPONSE"
          correct-response="A"
          response="B"
          show-full-correct-response
        ></qti-portable-custom-interaction>
      </section>
    </div>
  `
};
