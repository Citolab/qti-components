import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiGraphicOrderInteraction } from '../qti-graphic-order-interaction';

type Story = StoryObj<QtiGraphicOrderInteraction>;

const meta: Meta<QtiGraphicOrderInteraction> = {
  component: 'qti-graphic-order-interaction',
  title: '11 Graphic Order/Correct Response',
  tags: ['correct-response', 'standalone']
};
export default meta;

const overviewStyles = html`
  <style>
    .overview-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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

const hotspots = html`
  <img src="assets/qti-graphic-order-interaction/uk.png" height="280" width="206" />
  <qti-hotspot-choice coords="78,102,8" identifier="A" shape="circle"></qti-hotspot-choice>
  <qti-hotspot-choice coords="117,171,8" identifier="B" shape="circle"></qti-hotspot-choice>
  <qti-hotspot-choice coords="166,227,8" identifier="C" shape="circle"></qti-hotspot-choice>
  <qti-hotspot-choice coords="100,102,8" identifier="D" shape="circle"></qti-hotspot-choice>
`;

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="A,B,C" · correct-response="A,B,C"</code></p>
        <qti-graphic-order-interaction
          response-identifier="RESPONSE"
          correct-response="A,B,C"
          response="A,B,C"
          show-candidate-correction
          >${hotspots}</qti-graphic-order-interaction
        >
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="B,A,C" · correct-response="A,B,C"</code></p>
        <qti-graphic-order-interaction
          response-identifier="RESPONSE"
          correct-response="A,B,C"
          response="B,A,C"
          show-candidate-correction
          >${hotspots}</qti-graphic-order-interaction
        >
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="B,A,C" · correct-response="A,B,C"</code></p>
        <qti-graphic-order-interaction
          response-identifier="RESPONSE"
          correct-response="A,B,C"
          response="B,A,C"
          show-correct-response
          >${hotspots}</qti-graphic-order-interaction
        >
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="B,A,C" · correct-response="A,B,C"</code></p>
        <qti-graphic-order-interaction
          response-identifier="RESPONSE"
          correct-response="A,B,C"
          response="B,A,C"
          show-full-correct-response
          >${hotspots}</qti-graphic-order-interaction
        >
      </section>

      <section>
        <h3>all three combined</h3>
        <p><code>candidate + inline + full</code></p>
        <qti-graphic-order-interaction
          response-identifier="RESPONSE"
          correct-response="A,B,C"
          response="B,A,C"
          show-candidate-correction
          show-correct-response
          show-full-correct-response
          >${hotspots}</qti-graphic-order-interaction
        >
      </section>
    </div>
  `
};
