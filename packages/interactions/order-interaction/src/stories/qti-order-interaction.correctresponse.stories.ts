import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

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

/* -------------------------------------------------------------------------------------------------
 * LIS (longest increasing subsequence) marking
 *
 * Correctness is judged on *relative* order, not slot-by-slot equality. The longest subsequence of
 * chips already in the right order relative to each other counts as correct; everything outside it
 * is what the candidate actually got wrong. Slot-by-slot comparison would mark a chip wrong purely
 * because something ahead of it shifted every later chip down one — see the "two clusters" story,
 * where the old behaviour marked all 8 chips incorrect.
 * ---------------------------------------------------------------------------------------------- */

const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const CORRECT_ORDER = ALPHABET.join(',');

const eightChoices = html`
  ${ALPHABET.map(identifier => html`<qti-simple-choice identifier=${identifier}>${identifier}</qti-simple-choice>`)}
`;

const settle = async (interaction: QtiOrderInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

/** Verdict per identifier, read off the placed chips in drop order. */
const verdictsByIdentifier = (interaction: QtiOrderInteraction): Record<string, string | null> => {
  const dropTargets = Array.from(interaction.shadowRoot.querySelectorAll<HTMLElement>(`[part~='drop']`));
  const chips = dropTargets.flatMap(drop => interaction.chipsIn(drop));

  return Object.fromEntries(
    chips.map(chip => [chip.getAttribute('identifier'), (chip as { candidateCorrection?: string }).candidateCorrection])
  );
};

const renderLisCase = (response: string) => html`
  <qti-order-interaction
    data-testid="interaction"
    response-identifier="RESPONSE"
    orientation="horizontal"
    correct-response=${CORRECT_ORDER}
    response=${response}
    show-candidate-correction
    >${eightChoices}</qti-order-interaction
  >
`;

export const LisAllCorrect: Story = {
  name: 'LIS: fully correct order marks every chip correct',
  render: () => renderLisCase(CORRECT_ORDER),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const verdicts = verdictsByIdentifier(interaction);
    expect(Object.keys(verdicts)).toHaveLength(8);
    expect(Object.values(verdicts).every(verdict => verdict === 'correct')).toBe(true);
  }
};

export const LisSingleDisplacedChip: Story = {
  name: 'LIS: one displaced chip is the only one marked wrong',
  render: () => renderLisCase('A,B,C,E,F,G,H,D'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    // D was dragged to the end; A,B,C,E,F,G,H are still in the right order relative to each other.
    const verdicts = verdictsByIdentifier(interaction);
    expect(verdicts.D).toBe('incorrect');
    expect(['A', 'B', 'C', 'E', 'F', 'G', 'H'].map(id => verdicts[id])).toEqual(Array(7).fill('correct'));
  }
};

export const LisLongestClusterWins: Story = {
  name: 'LIS: with two ordered clusters, the longer one counts as correct',
  render: () => renderLisCase('F,G,H,A,B,C,D,E'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    // Both clusters are internally ordered, but they sit wrong relative to each other. The cluster
    // of 5 wins over the cluster of 3. Slot-by-slot comparison marked all 8 incorrect here.
    const verdicts = verdictsByIdentifier(interaction);
    expect(['A', 'B', 'C', 'D', 'E'].map(id => verdicts[id])).toEqual(Array(5).fill('correct'));
    expect(['F', 'G', 'H'].map(id => verdicts[id])).toEqual(Array(3).fill('incorrect'));
  }
};

export const LisFullyReversed: Story = {
  name: 'LIS: fully reversed order leaves exactly one chip correct',
  render: () => renderLisCase([...ALPHABET].reverse().join(',')),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    // Worst case: no two chips are in the right relative order, so the longest subsequence has
    // length 1. Which chip survives is down to the tiebreaker, so only the count is asserted here.
    const verdicts = Object.values(verdictsByIdentifier(interaction));
    expect(verdicts.filter(verdict => verdict === 'correct')).toHaveLength(1);
    expect(verdicts.filter(verdict => verdict === 'incorrect')).toHaveLength(7);
  }
};
