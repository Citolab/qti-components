import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSelectPointInteraction } from '../qti-select-point-interaction';

type Story = StoryObj<QtiSelectPointInteraction>;

const meta: Meta<QtiSelectPointInteraction> = {
  component: 'qti-select-point-interaction',
  title: '17 Select Point/Correct Response',
  tags: ['correct-response', 'standalone', 'iol']
};
export default meta;

const overviewStyles = html`
  <style>
    .overview-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

const img = html`
  <img src="assets/qti-select-point-interaction/uk.png" alt="map of united kingdom" height="280" width="206" />
`;

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="103 130" · correct="103 130"</code></p>
        <qti-select-point-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="103 130"
          response="103 130"
          show-candidate-correction
          >${img}</qti-select-point-interaction
        >
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="50 50" · correct="103 130"</code></p>
        <qti-select-point-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="103 130"
          response="50 50"
          show-candidate-correction
          >${img}</qti-select-point-interaction
        >
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="50 50" · correct="103 130"</code></p>
        <qti-select-point-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="103 130"
          response="50 50"
          show-correct-response
          >${img}</qti-select-point-interaction
        >
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="50 50" · correct="103 130"</code></p>
        <qti-select-point-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="103 130"
          response="50 50"
          show-full-correct-response
          >${img}</qti-select-point-interaction
        >
      </section>

      <section>
        <h3>multi-select · candidate-correction (partial)</h3>
        <p><code>response="103 130,40 40" · correct="103 130,200 250"</code></p>
        <qti-select-point-interaction
          response-identifier="RESPONSE"
          max-choices="0"
          correct-response="103 130,200 250"
          response="103 130,40 40"
          show-candidate-correction
          >${img}</qti-select-point-interaction
        >
      </section>
    </div>
  `
};
