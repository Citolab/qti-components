import { html } from 'lit';

import { withCorrectionRegistry } from '../with-correction-registry.decorator';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiInlineChoiceInteractionCorrection as QtiInlineChoiceInteraction } from '../../interactions';

type Story = StoryObj<QtiInlineChoiceInteraction>;

/**
 * # Correct Response Stories
 *
 * Standalone correct-response behavior driven entirely by attributes —
 * `response`, `correct-response`, and the three view-mode booleans
 * (`show-correct-response`, `show-full-correct-response`,
 * `show-candidate-correction`). No `play()` step, no `qti-assessment-item`.
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: '08 Inline Choice/Correct Response',
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

const choices = html`
  <qti-inline-choice identifier="Y">yes</qti-inline-choice>
  <qti-inline-choice identifier="N">no</qti-inline-choice>
  <qti-inline-choice identifier="M">maybe</qti-inline-choice>
`;

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="Y" · correct-response="Y"</code></p>
        <qti-inline-choice-interaction
          response-identifier="RESPONSE"
          correct-response="Y"
          response="Y"
          show-candidate-correction
          >${choices}</qti-inline-choice-interaction
        >
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="N" · correct-response="Y"</code></p>
        <qti-inline-choice-interaction
          response-identifier="RESPONSE"
          correct-response="Y"
          response="N"
          show-candidate-correction
          >${choices}</qti-inline-choice-interaction
        >
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="N" · correct-response="Y"</code></p>
        <qti-inline-choice-interaction
          response-identifier="RESPONSE"
          correct-response="Y"
          response="N"
          show-correct-response
          >${choices}</qti-inline-choice-interaction
        >
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="N" · correct-response="Y"</code></p>
        <qti-inline-choice-interaction
          response-identifier="RESPONSE"
          correct-response="Y"
          response="N"
          show-full-correct-response
          >${choices}</qti-inline-choice-interaction
        >
      </section>

      <section>
        <h3>candidate + inline</h3>
        <p><code>show-candidate-correction + show-correct-response</code></p>
        <qti-inline-choice-interaction
          response-identifier="RESPONSE"
          correct-response="Y"
          response="N"
          show-candidate-correction
          show-correct-response
          >${choices}</qti-inline-choice-interaction
        >
      </section>

      <section>
        <h3>all three combined</h3>
        <p><code>candidate + inline + full</code></p>
        <qti-inline-choice-interaction
          response-identifier="RESPONSE"
          correct-response="Y"
          response="N"
          show-candidate-correction
          show-correct-response
          show-full-correct-response
          >${choices}</qti-inline-choice-interaction
        >
      </section>
    </div>
  `
};
