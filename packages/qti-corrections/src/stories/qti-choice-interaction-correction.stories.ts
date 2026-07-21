import { expect, fireEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { correctionCanvas, withCorrectionRegistry } from './with-correction-registry.decorator';

import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice/qti-simple-choice';
import type { QtiChoiceInteractionCorrection } from '../interactions/qti-choice-interaction-correction';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * # Choice Interaction — Correction Modes
 *
 * These stories exercise the correction overlays that live in `qti-corrections`:
 * `show-correct-response`, `show-full-correct-response` and `show-candidate-correction`.
 * The lean `QtiChoiceInteraction` in `@qti-components/choice-interaction` deliberately
 * does *not* implement them, so the assertions only hold against
 * `QtiChoiceInteractionCorrection`.
 *
 * `withCorrectionRegistry` binds that class to the standard `qti-choice-interaction` tag
 * inside a scoped registry, so every story below renders markup strings rather than lit
 * templates and queries through `correctionCanvas`.
 */
type Story = StoryObj<QtiChoiceInteractionCorrection>;

const singleChoice = (attrs = '') => `
  <qti-choice-interaction
    response-identifier="RESPONSE"
    max-choices="1"
    data-testid="interaction"
    ${attrs}
  >
    <qti-prompt>Which letter comes first in the alphabet?</qti-prompt>
    <qti-simple-choice identifier="A">Option A</qti-simple-choice>
    <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    <qti-simple-choice identifier="C">Option C</qti-simple-choice>
  </qti-choice-interaction>
`;

const multipleChoice = (attrs = '') => `
  <qti-choice-interaction
    response-identifier="RESPONSE"
    max-choices="0"
    data-testid="interaction"
    ${attrs}
  >
    <qti-prompt>Select all vowels:</qti-prompt>
    <qti-simple-choice identifier="A">A</qti-simple-choice>
    <qti-simple-choice identifier="B">B</qti-simple-choice>
    <qti-simple-choice identifier="C">C</qti-simple-choice>
    <qti-simple-choice identifier="E">E</qti-simple-choice>
  </qti-choice-interaction>
`;

const meta: Meta<QtiChoiceInteractionCorrection> = {
  title: 'Choice Interaction/Correction Modes',
  tags: ['correct-response', 'standalone', 'iol'],
  decorators: [withCorrectionRegistry]
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// SHOW CORRECT RESPONSE (INLINE)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Show Correct Response Inline
 *
 * When `show-correct-response` is set, choices get CSS states:
 * - `:state(correct-response)` - for correct choices
 * - `:state(incorrect-response)` - for incorrect choices
 */
export const ShowCorrectResponseInline: Story = {
  render: () => singleChoice('correct-response="A" show-correct-response'),
  play: async ({ canvasElement }) => {
    const canvas = within(correctionCanvas(canvasElement));
    const interaction = canvas.getByTestId<QtiChoiceInteractionCorrection>('interaction');
    const choiceA = canvas.getByShadowText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByShadowText<QtiSimpleChoice>('Option B');

    await interaction.updateComplete;

    // Correct choice should have correct-response state
    expect(choiceA.internals.states.has('correct-response')).toBe(true);
    expect(choiceA.internals.states.has('incorrect-response')).toBe(false);

    // Incorrect choice should have incorrect-response state
    expect(choiceB.internals.states.has('correct-response')).toBe(false);
    expect(choiceB.internals.states.has('incorrect-response')).toBe(true);
  }
};

/**
 * ## Toggle Correct Response Dynamically
 *
 * The `show-correct-response` attribute can be toggled at runtime.
 */
export const ToggleCorrectResponse: Story = {
  render: () => `
    <button data-testid="toggle-btn">Toggle</button>
    ${singleChoice('correct-response="A"')}
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(correctionCanvas(canvasElement));
    const interaction = canvas.getByTestId<QtiChoiceInteractionCorrection>('interaction');
    const toggleBtn = canvas.getByTestId<HTMLButtonElement>('toggle-btn');
    const choiceA = canvas.getByShadowText<QtiSimpleChoice>('Option A');

    // Initially no states
    expect(choiceA.internals.states.has('correct-response')).toBe(false);

    // Toggle on
    toggleBtn.addEventListener('click', () => {
      interaction.showCorrectResponse = !interaction.showCorrectResponse;
    });

    await fireEvent.click(toggleBtn);
    await interaction.updateComplete;
    expect(choiceA.internals.states.has('correct-response')).toBe(true);

    // Toggle off
    await fireEvent.click(toggleBtn);
    await interaction.updateComplete;
    expect(choiceA.internals.states.has('correct-response')).toBe(false);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHOW FULL CORRECT RESPONSE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Show Full Correct Response
 *
 * When `show-full-correct-response` is set, a cloned interaction is inserted
 * after the original, showing the correct answer filled in.
 */
export const ShowFullCorrectResponse: Story = {
  render: () => singleChoice('correct-response="A" show-full-correct-response'),
  play: async ({ canvasElement }) => {
    const root = correctionCanvas(canvasElement);
    // Don't use getByTestId here since the clone also has data-testid="interaction"
    const interactions = root.querySelectorAll<QtiChoiceInteractionCorrection>('qti-choice-interaction');
    const interaction = interactions[0]; // Get the original, not the clone

    await interaction.updateComplete;
    // Wait for the clone to be created
    await waitFor(() => {
      const fullCorrectDiv = root.querySelector('.full-correct-response');
      expect(fullCorrectDiv).toBeTruthy();
    });

    const fullCorrectDiv = root.querySelector('.full-correct-response');
    const clonedInteraction = fullCorrectDiv?.querySelector('qti-choice-interaction') as QtiChoiceInteractionCorrection;

    expect(clonedInteraction).toBeTruthy();
    expect(clonedInteraction.response).toBe('A');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHOW CANDIDATE CORRECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Show Candidate Correction - Correct Answer
 *
 * When the candidate selects the correct answer and `show-candidate-correction` is set,
 * the choice gets the `:state(candidate-correct)` state.
 */
export const CandidateCorrectionCorrect: Story = {
  render: () => singleChoice('correct-response="A"'),
  play: async ({ canvasElement }) => {
    const canvas = within(correctionCanvas(canvasElement));
    const interaction = canvas.getByTestId<QtiChoiceInteractionCorrection>('interaction');
    const choiceA = canvas.getByShadowText<QtiSimpleChoice>('Option A');

    // Select correct answer
    await fireEvent.click(choiceA);
    await interaction.updateComplete;

    // Enable candidate correction
    interaction.showCandidateCorrection = true;
    await interaction.updateComplete;

    // Choice should show as correct
    expect(choiceA.internals.states.has('candidate-correct')).toBe(true);
    expect(choiceA.internals.states.has('candidate-incorrect')).toBe(false);

    // Interaction should also have correct state
    expect(interaction.internals.states.has('candidate-correct')).toBe(true);
  }
};

/**
 * ## Show Candidate Correction - Incorrect Answer
 *
 * When the candidate selects an incorrect answer and `show-candidate-correction` is set,
 * the choice gets the `:state(candidate-incorrect)` state.
 */
export const CandidateCorrectionIncorrect: Story = {
  render: () => singleChoice('correct-response="A"'),
  play: async ({ canvasElement }) => {
    const canvas = within(correctionCanvas(canvasElement));
    const interaction = canvas.getByTestId<QtiChoiceInteractionCorrection>('interaction');
    const choiceB = canvas.getByShadowText<QtiSimpleChoice>('Option B');

    // Select incorrect answer
    await fireEvent.click(choiceB);
    await interaction.updateComplete;

    // Enable candidate correction
    interaction.showCandidateCorrection = true;
    await interaction.updateComplete;

    // Choice should show as incorrect
    expect(choiceB.internals.states.has('candidate-correct')).toBe(false);
    expect(choiceB.internals.states.has('candidate-incorrect')).toBe(true);

    // Interaction should also have incorrect state
    expect(interaction.internals.states.has('candidate-incorrect')).toBe(true);
  }
};

/**
 * ## Show Candidate Correction - Partial
 *
 * When the candidate has some correct and some incorrect selections.
 */
export const CandidateCorrectionPartial: Story = {
  render: () => multipleChoice('correct-response="A,E"'),
  play: async ({ canvasElement }) => {
    const canvas = within(correctionCanvas(canvasElement));
    const interaction = canvas.getByTestId<QtiChoiceInteractionCorrection>('interaction');
    const choiceA = canvas.getByShadowText<QtiSimpleChoice>('A');
    const choiceB = canvas.getByShadowText<QtiSimpleChoice>('B');

    // Select one correct (A) and one incorrect (B)
    await fireEvent.click(choiceA);
    await fireEvent.click(choiceB);
    await interaction.updateComplete;

    // Enable candidate correction
    interaction.showCandidateCorrection = true;
    await interaction.updateComplete;

    // A should show as correct, B as incorrect
    expect(choiceA.internals.states.has('candidate-correct')).toBe(true);
    expect(choiceB.internals.states.has('candidate-incorrect')).toBe(true);

    // Interaction should show as partially correct
    expect(interaction.internals.states.has('candidate-partially-correct')).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED MODES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Combined: Correct Response + Candidate Correction
 *
 * Both `show-correct-response` and `show-candidate-correction` can be active simultaneously.
 */
export const CombinedModes: Story = {
  render: () => singleChoice('correct-response="A" show-correct-response'),
  play: async ({ canvasElement }) => {
    const canvas = within(correctionCanvas(canvasElement));
    const interaction = canvas.getByTestId<QtiChoiceInteractionCorrection>('interaction');
    const choiceA = canvas.getByShadowText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByShadowText<QtiSimpleChoice>('Option B');

    await interaction.updateComplete;

    // Correct response states should be set
    expect(choiceA.internals.states.has('correct-response')).toBe(true);
    expect(choiceB.internals.states.has('incorrect-response')).toBe(true);

    // Select incorrect answer
    await fireEvent.click(choiceB);
    await interaction.updateComplete;

    // Enable candidate correction
    interaction.showCandidateCorrection = true;
    await interaction.updateComplete;

    // Now both correct response and candidate correction states should be set
    expect(choiceA.internals.states.has('correct-response')).toBe(true);
    expect(choiceB.internals.states.has('incorrect-response')).toBe(true);
    expect(choiceB.internals.states.has('candidate-incorrect')).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW: ALL VIEW MODES
// ═══════════════════════════════════════════════════════════════════════════════

/** One `qti-choice-interaction` section for the overview grid. */
const overviewSection = (heading: string, note: string, attrs: string, multi = false) => `
  <section>
    <h3>${heading}</h3>
    <p><code>${note}</code></p>
    ${multi ? multipleChoice(attrs) : singleChoice(attrs)}
  </section>
`;

/**
 * ## Overview: All View Modes Side-by-Side
 *
 * The same `qti-choice-interaction` with a pre-filled response across every correction
 * view mode, driven purely by attributes:
 *
 * 1. **`show-candidate-correction`** — feedback on the candidate's own selection
 *    (rendered once with a correct pick and once with an incorrect pick).
 * 2. **`show-correct-response`** — inline indicators on every choice marking
 *    which one(s) are correct/incorrect.
 * 3. **`show-full-correct-response`** — a cloned, disabled interaction is
 *    appended with the correct answer filled in.
 *
 * Correct answer for every single-select instance is `A`. The interactions are
 * otherwise identical — only the view attribute(s) differ.
 */
export const AllViewModesOverview: Story = {
  name: 'Overview: All View Modes',
  render: () => `
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
          font: 600 0.85rem/1.2 system-ui, sans-serif;
          color: #444;
        }
        .overview-grid code {
          font-size: 0.75rem;
          background: #f3f3f3;
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
        }
      </style>

      <div class="overview-grid">
        ${overviewSection(
          'show-candidate-correction (correct pick)',
          'response="A" · correct-response="A"',
          'correct-response="A" response="A" show-candidate-correction'
        )}
        ${overviewSection(
          'show-candidate-correction (incorrect pick)',
          'response="B" · correct-response="A"',
          'correct-response="A" response="B" show-candidate-correction'
        )}
        ${overviewSection(
          'show-correct-response (inline)',
          'response="B" · correct-response="A"',
          'correct-response="A" response="B" show-correct-response'
        )}
        ${overviewSection(
          'show-full-correct-response (clone)',
          'response="B" · correct-response="A"',
          'correct-response="A" response="B" show-full-correct-response'
        )}
        ${overviewSection(
          'candidate-correction + inline',
          'show-candidate-correction + show-correct-response',
          'correct-response="A" response="B" show-candidate-correction show-correct-response'
        )}
        ${overviewSection(
          'candidate-correction + full',
          'show-candidate-correction + show-full-correct-response',
          'correct-response="A" response="B" show-candidate-correction show-full-correct-response'
        )}
        ${overviewSection(
          'inline + full',
          'show-correct-response + show-full-correct-response',
          'correct-response="A" response="B" show-correct-response show-full-correct-response'
        )}
        ${overviewSection(
          'all three view modes combined',
          'candidate + inline + full',
          'correct-response="A" response="B" show-candidate-correction show-correct-response show-full-correct-response'
        )}
        ${overviewSection(
          'multi-select · all three combined (partial)',
          'max-choices="0" · correct="A,E" · response="A,B"',
          'correct-response="A,E" response="A,B" show-candidate-correction show-correct-response show-full-correct-response',
          true
        )}
      </div>
  `
};
