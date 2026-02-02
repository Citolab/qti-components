import { html } from 'lit';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '../../../elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * # Correct Response Stories
 *
 * Tests for the standalone correct response functionality.
 * These features allow interactions to work without a `qti-assessment-item` wrapper.
 *
 * ## New Attributes
 * - `correct-response` - Set the correct answer(s) as a comma-separated string
 * - `show-correct-response` - Show inline indicators for correct/incorrect choices
 * - `show-full-correct-response` - Show a cloned interaction with correct answers filled in
 * - `show-candidate-correction` - Show feedback on candidate's selections
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '01 Choice Interaction/Correct Response',
  tags: ['correct-response', 'standalone']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

const SingleChoiceTemplate = (args: Partial<QtiChoiceInteraction> = {}) => html`
  <qti-choice-interaction
    response-identifier="RESPONSE"
    max-choices="1"
    data-testid="interaction"
    correct-response=${args.correctResponseAttr || ''}
    ?show-correct-response=${args.showCorrectResponse}
    ?show-full-correct-response=${args.showFullCorrectResponse}
    ?show-candidate-correction=${args.showCandidateCorrection}
  >
    <qti-prompt>Which letter comes first in the alphabet?</qti-prompt>
    <qti-simple-choice identifier="A">Option A</qti-simple-choice>
    <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    <qti-simple-choice identifier="C">Option C</qti-simple-choice>
  </qti-choice-interaction>
`;

const MultipleChoiceTemplate = (args: Partial<QtiChoiceInteraction> = {}) => html`
  <qti-choice-interaction
    response-identifier="RESPONSE"
    max-choices="0"
    data-testid="interaction"
    correct-response=${args.correctResponseAttr || ''}
    ?show-correct-response=${args.showCorrectResponse}
    ?show-full-correct-response=${args.showFullCorrectResponse}
    ?show-candidate-correction=${args.showCandidateCorrection}
  >
    <qti-prompt>Select all vowels:</qti-prompt>
    <qti-simple-choice identifier="A">A</qti-simple-choice>
    <qti-simple-choice identifier="B">B</qti-simple-choice>
    <qti-simple-choice identifier="C">C</qti-simple-choice>
    <qti-simple-choice identifier="E">E</qti-simple-choice>
  </qti-choice-interaction>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  const choiceA = canvas.getByText<QtiSimpleChoice>('Option A') || canvas.getByText<QtiSimpleChoice>('A');
  const choiceB = canvas.getByText<QtiSimpleChoice>('Option B') || canvas.getByText<QtiSimpleChoice>('B');
  const choiceC = canvas.getByText<QtiSimpleChoice>('Option C') || canvas.getByText<QtiSimpleChoice>('C');
  return { canvas, interaction, choiceA, choiceB, choiceC };
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORRECT RESPONSE ATTRIBUTE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Setting Correct Response via Attribute
 *
 * The `correct-response` attribute allows setting the correct answer directly
 * on the interaction element without needing a `qti-response-declaration`.
 */
export const CorrectResponseAttribute: Story = {
  render: () => SingleChoiceTemplate({ correctResponseAttr: 'A' }),
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Attribute should be reflected
    expect(interaction.getAttribute('correct-response')).toBe('A');

    // Property should return the value
    expect(interaction.correctResponse).toBe('A');
  }
};

/**
 * ## Multiple Correct Responses
 *
 * For multiple choice interactions, use comma-separated values.
 */
export const MultipleCorrectResponses: Story = {
  render: () => MultipleChoiceTemplate({ correctResponseAttr: 'A,E' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');

    expect(interaction.getAttribute('correct-response')).toBe('A,E');
    expect(interaction.correctResponse).toEqual(['A', 'E']);
  }
};

/**
 * ## Setting via Property
 *
 * The `correctResponse` property can be set programmatically as string or string[].
 */
export const SetViaProperty: Story = {
  render: () => SingleChoiceTemplate(),
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Set as string
    interaction.correctResponse = 'B';
    await interaction.updateComplete;
    expect(interaction.getAttribute('correct-response')).toBe('B');

    // Set as array
    interaction.correctResponse = ['A', 'C'];
    await interaction.updateComplete;
    expect(interaction.getAttribute('correct-response')).toBe('A,C');
  }
};

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
  render: () =>
    SingleChoiceTemplate({
      correctResponseAttr: 'A',
      showCorrectResponse: true
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');

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
  render: () => html`
    <button data-testid="toggle-btn">Toggle</button>
    ${SingleChoiceTemplate({ correctResponseAttr: 'A' })}
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const toggleBtn = canvas.getByTestId<HTMLButtonElement>('toggle-btn');
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');

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
  render: () =>
    SingleChoiceTemplate({
      correctResponseAttr: 'A',
      showFullCorrectResponse: true
    }),
  play: async ({ canvasElement }) => {
    // Don't use getElements here since the clone also has data-testid="interaction"
    const canvas = within(canvasElement);
    const interactions = canvas.queryAllByTestId<QtiChoiceInteraction>('interaction');
    const interaction = interactions[0]; // Get the original, not the clone

    await interaction.updateComplete;
    // Wait for the clone to be created
    await waitFor(() => {
      const fullCorrectDiv = canvasElement.querySelector('.full-correct-response');
      expect(fullCorrectDiv).toBeTruthy();
    });

    const fullCorrectDiv = canvasElement.querySelector('.full-correct-response');
    const clonedInteraction = fullCorrectDiv?.querySelector('qti-choice-interaction') as QtiChoiceInteraction;

    expect(clonedInteraction).toBeTruthy();
    expect(clonedInteraction.disabled).toBe(true);
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
  render: () => SingleChoiceTemplate({ correctResponseAttr: 'A' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');

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
  render: () => SingleChoiceTemplate({ correctResponseAttr: 'A' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');

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
  render: () => MultipleChoiceTemplate({ correctResponseAttr: 'A,E' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceA = canvas.getByText<QtiSimpleChoice>('A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('B');

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
// CORRECTNESS GETTER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Correctness Getter
 *
 * The `correctness` property returns 'correct', 'partially-correct', 'incorrect', or null.
 */
export const CorrectnessGetter: Story = {
  render: () => MultipleChoiceTemplate({ correctResponseAttr: 'A,E' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceA = canvas.getByText<QtiSimpleChoice>('A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('B');
    const choiceE = canvas.getByText<QtiSimpleChoice>('E');

    // No response yet - correctness is null
    expect(interaction.correctness).toBe(null);

    // Select correct answers
    await fireEvent.click(choiceA);
    await fireEvent.click(choiceE);
    await interaction.updateComplete;
    expect(interaction.correctness).toBe('correct');

    // Deselect E and select B (now partial)
    await fireEvent.click(choiceE);
    await fireEvent.click(choiceB);
    await interaction.updateComplete;
    expect(interaction.correctness).toBe('partially-correct');

    // Deselect A (now fully incorrect)
    await fireEvent.click(choiceA);
    await interaction.updateComplete;
    expect(interaction.correctness).toBe('incorrect');
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
  render: () =>
    SingleChoiceTemplate({
      correctResponseAttr: 'A',
      showCorrectResponse: true
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');

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
