import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiOrderInteraction } from '../qti-order-interaction';

type Story = StoryObj<QtiOrderInteraction>;

const meta: Meta<QtiOrderInteraction> = {
  component: 'qti-order-interaction',
  title: '10 Order/Correct Response',
  tags: ['correct-response', 'standalone', 'iol']
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

const choices = html`
  <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
  <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
  <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
`;

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="A,B,C" · correct-response="A,B,C"</code></p>
        <qti-order-interaction
          response-identifier="RESPONSE"
          orientation="horizontal"
          correct-response="A,B,C"
          response="A,B,C"
          show-candidate-correction
          >${choices}</qti-order-interaction
        >
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="B,A,C" · correct-response="A,B,C"</code></p>
        <qti-order-interaction
          response-identifier="RESPONSE"
          orientation="horizontal"
          correct-response="A,B,C"
          response="B,A,C"
          show-candidate-correction
          >${choices}</qti-order-interaction
        >
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="B,A,C" · correct-response="A,B,C"</code></p>
        <qti-order-interaction
          response-identifier="RESPONSE"
          orientation="horizontal"
          correct-response="A,B,C"
          response="B,A,C"
          show-correct-response
          >${choices}</qti-order-interaction
        >
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="B,A,C" · correct-response="A,B,C"</code></p>
        <qti-order-interaction
          response-identifier="RESPONSE"
          orientation="horizontal"
          correct-response="A,B,C"
          response="B,A,C"
          show-full-correct-response
          >${choices}</qti-order-interaction
        >
      </section>

      <section>
        <h3>all three combined</h3>
        <p><code>candidate + inline + full</code></p>
        <qti-order-interaction
          response-identifier="RESPONSE"
          orientation="horizontal"
          correct-response="A,B,C"
          response="B,A,C"
          show-candidate-correction
          show-correct-response
          show-full-correct-response
          >${choices}</qti-order-interaction
        >
      </section>
    </div>
  `
};
