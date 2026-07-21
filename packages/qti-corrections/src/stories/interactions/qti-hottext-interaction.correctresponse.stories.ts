import { html } from 'lit';

import { withCorrectionRegistry } from '../with-correction-registry.decorator';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiHottextInteractionCorrection as QtiHottextInteraction } from '../../interactions/correction-interactions';

type Story = StoryObj<QtiHottextInteraction>;

const meta: Meta<QtiHottextInteraction> = {
  component: 'qti-hottext-interaction',
  title: '07 Hot Text/Correct Response',
  decorators: [withCorrectionRegistry],
  tags: ['correct-response', 'standalone', 'iol']
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

const hottexts = html`
  <p>
    The CEO of a multinational consumer-electronics conglomerate
    <qti-hottext identifier="A">who bought</qti-hottext> advertising time on United States television
    <qti-hottext identifier="B">includes</qti-hottext>
    <qti-hottext identifier="C">at least</qti-hottext> a dozen international firms
    <qti-hottext identifier="D">whose</qti-hottext> names are familiar to American consumers.
    <qti-hottext identifier="E">No error.</qti-hottext>
  </p>
`;

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="B" · correct-response="B"</code></p>
        <qti-hottext-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="B"
          response="B"
          show-candidate-correction
          >${hottexts}</qti-hottext-interaction
        >
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="C" · correct-response="B"</code></p>
        <qti-hottext-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="B"
          response="C"
          show-candidate-correction
          >${hottexts}</qti-hottext-interaction
        >
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="C" · correct-response="B"</code></p>
        <qti-hottext-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="B"
          response="C"
          show-correct-response
          >${hottexts}</qti-hottext-interaction
        >
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="C" · correct-response="B"</code></p>
        <qti-hottext-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          correct-response="B"
          response="C"
          show-full-correct-response
          >${hottexts}</qti-hottext-interaction
        >
      </section>

      <section>
        <h3>multi-select · all three combined (partial)</h3>
        <p><code>max-choices="0" · correct="B,D" · response="B,C"</code></p>
        <qti-hottext-interaction
          response-identifier="RESPONSE"
          max-choices="0"
          correct-response="B,D"
          response="B,C"
          show-candidate-correction
          show-correct-response
          show-full-correct-response
          >${hottexts}</qti-hottext-interaction
        >
      </section>
    </div>
  `
};
