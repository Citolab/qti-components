import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiHotspotInteraction } from '../qti-hotspot-interaction';

type Story = StoryObj<QtiHotspotInteraction>;

const meta: Meta<QtiHotspotInteraction> = {
  component: 'qti-hotspot-interaction',
  title: '06 Hotspot/Correct Response',
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
  <img src="assets/qti-hotspot-interaction/uk.png" height="280" width="206" />
  <qti-hotspot-choice coords="77,115,10" identifier="A" shape="circle"></qti-hotspot-choice>
  <qti-hotspot-choice coords="118,184,10" identifier="B" shape="circle"></qti-hotspot-choice>
  <qti-hotspot-choice coords="150,235,10" identifier="C" shape="circle"></qti-hotspot-choice>
  <qti-hotspot-choice coords="96,114,10" identifier="D" shape="circle"></qti-hotspot-choice>
`;

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="A" · correct-response="A"</code></p>
        <qti-hotspot-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="A"
          response="A"
          show-candidate-correction
          >${hotspots}</qti-hotspot-interaction
        >
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="B" · correct-response="A"</code></p>
        <qti-hotspot-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="A"
          response="B"
          show-candidate-correction
          >${hotspots}</qti-hotspot-interaction
        >
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="B" · correct-response="A"</code></p>
        <qti-hotspot-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="A"
          response="B"
          show-correct-response
          >${hotspots}</qti-hotspot-interaction
        >
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="B" · correct-response="A"</code></p>
        <qti-hotspot-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="A"
          response="B"
          show-full-correct-response
          >${hotspots}</qti-hotspot-interaction
        >
      </section>

      <section>
        <h3>multi-select · all three combined (partial)</h3>
        <p><code>max-choices="0" · correct="A,C" · response="A,B"</code></p>
        <qti-hotspot-interaction
          response-identifier="RESPONSE"
          max-choices="0"
          correct-response="A,C"
          response="A,B"
          show-candidate-correction
          show-correct-response
          show-full-correct-response
          >${hotspots}</qti-hotspot-interaction
        >
      </section>
    </div>
  `
};
