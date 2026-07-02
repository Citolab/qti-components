import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiGraphicAssociateInteraction } from '../qti-graphic-associate-interaction';

type Story = StoryObj<QtiGraphicAssociateInteraction>;

const meta: Meta<QtiGraphicAssociateInteraction> = {
  component: 'qti-graphic-associate-interaction',
  title: '13 Graphic Associate/Correct Response',
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
  <img src="/assets/qti-graphic-associate-interaction/uk.png" width="206" height="280" />
  <qti-associable-hotspot shape="circle" coords="78,102,8" identifier="A" match-max="3"></qti-associable-hotspot>
  <qti-associable-hotspot shape="circle" coords="117,171,8" identifier="B" match-max="3"></qti-associable-hotspot>
  <qti-associable-hotspot shape="circle" coords="166,227,8" identifier="C" match-max="3"></qti-associable-hotspot>
  <qti-associable-hotspot shape="circle" coords="100,102,8" identifier="D" match-max="3"></qti-associable-hotspot>
`;

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="A B,C D" · correct="A B,C D"</code></p>
        <qti-graphic-associate-interaction
          response-identifier="RESPONSE"
          correct-response="A B,C D"
          response="A B,C D"
          show-candidate-correction
          >${hotspots}</qti-graphic-associate-interaction
        >
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="A C" · correct="A B,C D"</code></p>
        <qti-graphic-associate-interaction
          response-identifier="RESPONSE"
          correct-response="A B,C D"
          response="A C"
          show-candidate-correction
          >${hotspots}</qti-graphic-associate-interaction
        >
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="A C" · correct="A B,C D"</code></p>
        <qti-graphic-associate-interaction
          response-identifier="RESPONSE"
          correct-response="A B,C D"
          response="A C"
          show-correct-response
          >${hotspots}</qti-graphic-associate-interaction
        >
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="A C" · correct="A B,C D"</code></p>
        <qti-graphic-associate-interaction
          response-identifier="RESPONSE"
          correct-response="A B,C D"
          response="A C"
          show-full-correct-response
          >${hotspots}</qti-graphic-associate-interaction
        >
      </section>

      <section>
        <h3>all three combined</h3>
        <p><code>candidate + inline + full</code></p>
        <qti-graphic-associate-interaction
          response-identifier="RESPONSE"
          correct-response="A B,C D"
          response="A C"
          show-candidate-correction
          show-correct-response
          show-full-correct-response
          >${hotspots}</qti-graphic-associate-interaction
        >
      </section>
    </div>
  `
};
