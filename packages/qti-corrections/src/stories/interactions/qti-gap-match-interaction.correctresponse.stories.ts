import { html } from 'lit';

import { withCorrectionRegistry } from '../with-correction-registry.decorator';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiGapMatchInteractionCorrection as QtiGapMatchInteraction } from '../../interactions';

type Story = StoryObj<QtiGapMatchInteraction>;

const meta: Meta<QtiGapMatchInteraction> = {
  component: 'qti-gap-match-interaction',
  title: '05 Gap Match/Correct Response',
  decorators: [withCorrectionRegistry],
  tags: ['correct-response', 'standalone', 'iol']
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

const gapMatchInner = html`
  <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
  <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
  <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
  <blockquote>
    <p>
      <qti-gap identifier="G1"></qti-gap> &middot; <qti-gap identifier="G2"></qti-gap> &middot;
      <qti-gap identifier="G3"></qti-gap>
    </p>
  </blockquote>
`;

export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => html`
    ${overviewStyles}
    <div class="overview-grid">
      <section>
        <h3>show-candidate-correction (correct)</h3>
        <p><code>response="W G1,Sp G2,Su G3" · correct="W G1,Sp G2,Su G3"</code></p>
        <qti-gap-match-interaction
          response-identifier="RESPONSE"
          max-associations="3"
          correct-response="W G1,Sp G2,Su G3"
          response="W G1,Sp G2,Su G3"
          show-candidate-correction
          >${gapMatchInner}</qti-gap-match-interaction
        >
      </section>

      <section>
        <h3>show-candidate-correction (incorrect)</h3>
        <p><code>response="Sp G1,W G2,Su G3" · correct="W G1,Sp G2,Su G3"</code></p>
        <qti-gap-match-interaction
          response-identifier="RESPONSE"
          max-associations="3"
          correct-response="W G1,Sp G2,Su G3"
          response="Sp G1,W G2,Su G3"
          show-candidate-correction
          >${gapMatchInner}</qti-gap-match-interaction
        >
      </section>

      <section>
        <h3>show-correct-response (inline)</h3>
        <p><code>response="Sp G1,W G2,Su G3" · correct="W G1,Sp G2,Su G3"</code></p>
        <qti-gap-match-interaction
          response-identifier="RESPONSE"
          max-associations="3"
          correct-response="W G1,Sp G2,Su G3"
          response="Sp G1,W G2,Su G3"
          show-correct-response
          >${gapMatchInner}</qti-gap-match-interaction
        >
      </section>

      <section>
        <h3>show-full-correct-response (clone)</h3>
        <p><code>response="Sp G1,W G2,Su G3" · correct="W G1,Sp G2,Su G3"</code></p>
        <qti-gap-match-interaction
          response-identifier="RESPONSE"
          max-associations="3"
          correct-response="W G1,Sp G2,Su G3"
          response="Sp G1,W G2,Su G3"
          show-full-correct-response
          >${gapMatchInner}</qti-gap-match-interaction
        >
      </section>

      <section>
        <h3>all three combined</h3>
        <p><code>candidate + inline + full</code></p>
        <qti-gap-match-interaction
          response-identifier="RESPONSE"
          max-associations="3"
          correct-response="W G1,Sp G2,Su G3"
          response="Sp G1,W G2,Su G3"
          show-candidate-correction
          show-correct-response
          show-full-correct-response
          >${gapMatchInner}</qti-gap-match-interaction
        >
      </section>
    </div>
  `
};
