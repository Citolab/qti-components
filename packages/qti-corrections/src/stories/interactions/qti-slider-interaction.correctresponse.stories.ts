import { html } from 'lit';

import { withCorrectionRegistry } from '../with-correction-registry.decorator';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSliderInteractionCorrection as QtiSliderInteraction } from '../../interactions';

type Story = StoryObj<QtiSliderInteraction>;

const meta: Meta<QtiSliderInteraction> = {
  component: 'qti-slider-interaction',
  title: '18 Slider/Correct Response',
  decorators: [withCorrectionRegistry],
  tags: ['correct-response', 'standalone']
};
export default meta;

const overviewStyles = html`
  <style>
    .overview-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="50" · correct-response="50"</code></p>
        <qti-slider-interaction
          response-identifier="RESPONSE"
          lower-bound="0"
          upper-bound="100"
          step="1"
          correct-response="50"
          response="50"
          show-candidate-correction
        ></qti-slider-interaction>
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="20" · correct-response="50"</code></p>
        <qti-slider-interaction
          response-identifier="RESPONSE"
          lower-bound="0"
          upper-bound="100"
          step="1"
          correct-response="50"
          response="20"
          show-candidate-correction
        ></qti-slider-interaction>
      </section>

      <section>
        <h3>show-correct-response (inline knob)</h3>
        <p><code>response="20" · correct-response="50"</code></p>
        <qti-slider-interaction
          response-identifier="RESPONSE"
          lower-bound="0"
          upper-bound="100"
          step="1"
          correct-response="50"
          response="20"
          show-correct-response
        ></qti-slider-interaction>
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="20" · correct-response="50"</code></p>
        <qti-slider-interaction
          response-identifier="RESPONSE"
          lower-bound="0"
          upper-bound="100"
          step="1"
          correct-response="50"
          response="20"
          show-full-correct-response
        ></qti-slider-interaction>
      </section>

      <section>
        <h3>all three combined</h3>
        <p><code>candidate + inline + full</code></p>
        <qti-slider-interaction
          response-identifier="RESPONSE"
          lower-bound="0"
          upper-bound="100"
          step="1"
          correct-response="50"
          response="20"
          show-candidate-correction
          show-correct-response
          show-full-correct-response
        ></qti-slider-interaction>
      </section>
    </div>
  `
};
