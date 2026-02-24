import { html } from 'lit';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTextEntryInteraction } from '../qti-text-entry-interaction';

type Story = StoryObj<QtiTextEntryInteraction>;

/**
 * # Correct Response Stories
 *
 * Tests for the standalone correct response functionality.
 * These features allow interactions to work without a `qti-assessment-item` wrapper.
 *
 * ## Attributes
 * - `correct-response` - Set the correct answer as a string
 * - `show-correct-response` - Show the correct answer inline next to the input
 * - `show-full-correct-response` - Show a cloned interaction with the correct answer filled in
 * - `show-candidate-correction` - Show feedback on candidate's input
 */
const meta: Meta<QtiTextEntryInteraction> = {
  component: 'qti-text-entry-interaction',
  title: '03 Text Entry Interaction/Correct Response',
  tags: ['correct-response', 'standalone']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const baseTemplate = (args: Partial<QtiTextEntryInteraction> = {}) => html`
  <qti-text-entry-interaction
    name="RESPONSE"
    response-identifier="RESPONSE"
    data-testid="interaction"
    correct-response=${args.correctResponseAttr || ''}
    ?show-correct-response=${args.showCorrectResponse}
    ?show-full-correct-response=${args.showFullCorrectResponse}
    ?show-candidate-correction=${args.showCandidateCorrection}
  ></qti-text-entry-interaction>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
  const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;
  return { canvas, interaction, input };
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
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Attribute should be reflected
    expect(interaction.getAttribute('correct-response')).toBe('Paris');

    // Property should return the value
    expect(interaction.correctResponse).toBe('Paris');
  }
};

/**
 * ## Setting via Property
 *
 * The `correctResponse` property can be set programmatically.
 */
export const SetViaProperty: Story = {
  name: 'Set Correct Response via Property',
  render: () => baseTemplate(),
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Set as string
    interaction.correctResponse = 'London';
    await interaction.updateComplete;
    expect(interaction.getAttribute('correct-response')).toBe('London');
    expect(interaction.correctResponse).toBe('London');
  }
};

/**
 * ## Clear Correct Response
 *
 * Setting to null removes the correct response.
 */
export const ClearCorrectResponse: Story = {
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Initially set
    expect(interaction.correctResponse).toBe('Paris');

    // Clear
    interaction.correctResponse = null;
    await interaction.updateComplete;

    expect(interaction.getAttribute('correct-response')).toBe(null);
    expect(interaction.correctResponse).toBe(null);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORRECTNESS EVALUATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Correctness - Correct Answer
 *
 * When the user enters the correct answer, `correctness` should return 'correct'.
 */
export const CorrectnessCorrect: Story = {
  name: 'Correctness - Correct Answer',
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // No answer yet - correctness should be null
    expect(interaction.correctness).toBe(null);

    // Type correct answer
    input.value = 'Paris';
    await fireEvent.keyUp(input, { target: { value: 'Paris' } });
    await interaction.updateComplete;

    expect(interaction.correctness).toBe('correct');
  }
};

/**
 * ## Correctness - Incorrect Answer
 *
 * When the user enters an incorrect answer, `correctness` should return 'incorrect'.
 */
export const CorrectnessIncorrect: Story = {
  name: 'Correctness - Incorrect Answer',
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type incorrect answer
    input.value = 'London';
    await fireEvent.keyUp(input, { target: { value: 'London' } });
    await interaction.updateComplete;

    expect(interaction.correctness).toBe('incorrect');
  }
};

/**
 * ## Correctness - Case Sensitivity
 *
 * By default, text comparison is case-sensitive.
 */
export const CaseSensitive: Story = {
  name: 'Correctness - Case Sensitive',
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type with different case
    input.value = 'paris';
    await fireEvent.keyUp(input, { target: { value: 'paris' } });
    await interaction.updateComplete;

    // Should be incorrect due to case mismatch
    expect(interaction.correctness).toBe('incorrect');

    // Type with correct case
    input.value = 'Paris';
    await fireEvent.keyUp(input, { target: { value: 'Paris' } });
    await interaction.updateComplete;

    expect(interaction.correctness).toBe('correct');
  }
};

/**
 * ## Correctness - Empty Response
 *
 * Empty response should return null for correctness.
 */
export const CorrectnessEmpty: Story = {
  name: 'Correctness - Empty Response',
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type then clear
    input.value = 'Paris';
    await fireEvent.keyUp(input, { target: { value: 'Paris' } });
    await interaction.updateComplete;
    expect(interaction.correctness).toBe('correct');

    // Clear input
    input.value = '';
    await fireEvent.keyUp(input, { target: { value: '' } });
    await interaction.updateComplete;

    expect(interaction.correctness).toBe(null);
  }
};

/**
 * ## Correctness - No Correct Response Set
 *
 * When no correct response is set, correctness should be null.
 */
export const CorrectnessNoCorrectResponse: Story = {
  name: 'Correctness - No Correct Response Set',
  render: () => baseTemplate(),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type something
    input.value = 'anything';
    await fireEvent.keyUp(input, { target: { value: 'anything' } });
    await interaction.updateComplete;

    // No correct response set - should be null
    expect(interaction.correctness).toBe(null);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHOW CORRECT RESPONSE (INLINE)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Show Correct Response Inline
 *
 * When `show-correct-response` is set, the correct answer is displayed
 * next to the input field.
 */
export const ShowCorrectResponseInline: Story = {
  name: 'Show Correct Response - Inline',
  tags: ['xfail'],
  render: () =>
    baseTemplate({
      correctResponseAttr: 'Paris',
      showCorrectResponse: true
    }),
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    await interaction.updateComplete;

    // Check for correct response display element
    const correctDiv = interaction.shadowRoot?.querySelector('[part="correct"]');
    expect(correctDiv).toBeTruthy();
    expect(correctDiv?.textContent).toBe('Paris');
  }
};

/**
 * ## Toggle Show Correct Response
 *
 * The `show-correct-response` attribute can be toggled at runtime.
 */
export const ToggleShowCorrectResponse: Story = {
  name: 'Show Correct Response - Toggle',
  tags: ['xfail'],
  render: () => html`
    <button data-testid="toggle-btn">Toggle</button>
    ${baseTemplate({ correctResponseAttr: 'Paris' })}
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
    const toggleBtn = canvas.getByTestId<HTMLButtonElement>('toggle-btn');

    // Initially hidden
    let correctDiv = interaction.shadowRoot?.querySelector('[part="correct"]');
    expect(correctDiv).toBeFalsy();

    // Toggle on
    toggleBtn.addEventListener('click', () => {
      interaction.showCorrectResponse = !interaction.showCorrectResponse;
    });

    await fireEvent.click(toggleBtn);
    await interaction.updateComplete;

    correctDiv = interaction.shadowRoot?.querySelector('[part="correct"]');
    expect(correctDiv).toBeTruthy();

    // Toggle off
    await fireEvent.click(toggleBtn);
    await interaction.updateComplete;

    correctDiv = interaction.shadowRoot?.querySelector('[part="correct"]');
    expect(correctDiv).toBeFalsy();
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
    baseTemplate({
      correctResponseAttr: 'Paris',
      showFullCorrectResponse: true
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interactions = canvas.queryAllByTestId<QtiTextEntryInteraction>('interaction');
    const interaction = interactions[0];

    await interaction.updateComplete;

    // Wait for the clone to be created
    await waitFor(() => {
      const fullCorrectDiv = canvasElement.querySelector('.full-correct-response');
      expect(fullCorrectDiv).toBeTruthy();
    });

    const fullCorrectDiv = canvasElement.querySelector('.full-correct-response');
    const clonedInteraction = fullCorrectDiv?.querySelector('qti-text-entry-interaction') as QtiTextEntryInteraction;

    expect(clonedInteraction).toBeTruthy();
    expect(clonedInteraction.disabled).toBe(true);
    expect(clonedInteraction.value).toBe('Paris');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHOW CANDIDATE CORRECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Show Candidate Correction - Correct
 *
 * When the candidate enters the correct answer and `show-candidate-correction` is set,
 * the interaction gets the `:state(candidate-correct)` state.
 */
export const CandidateCorrectionCorrect: Story = {
  name: 'Candidate Correction - Correct Answer',
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type correct answer
    input.value = 'Paris';
    await fireEvent.keyUp(input, { target: { value: 'Paris' } });
    await interaction.updateComplete;

    // Enable candidate correction
    interaction.showCandidateCorrection = true;
    await interaction.updateComplete;

    // Should show as correct
    expect(interaction.internals.states.has('candidate-correct')).toBe(true);
    expect(interaction.internals.states.has('candidate-incorrect')).toBe(false);
  }
};

/**
 * ## Show Candidate Correction - Incorrect
 *
 * When the candidate enters an incorrect answer and `show-candidate-correction` is set,
 * the interaction gets the `:state(candidate-incorrect)` state.
 */
export const CandidateCorrectionIncorrect: Story = {
  name: 'Candidate Correction - Incorrect Answer',
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type incorrect answer
    input.value = 'London';
    await fireEvent.keyUp(input, { target: { value: 'London' } });
    await interaction.updateComplete;

    // Enable candidate correction
    interaction.showCandidateCorrection = true;
    await interaction.updateComplete;

    // Should show as incorrect
    expect(interaction.internals.states.has('candidate-correct')).toBe(false);
    expect(interaction.internals.states.has('candidate-incorrect')).toBe(true);
  }
};

/**
 * ## Toggle Candidate Correction
 *
 * Candidate correction can be toggled on and off.
 */
export const ToggleCandidateCorrection: Story = {
  name: 'Candidate Correction - Toggle',
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type correct answer
    input.value = 'Paris';
    await fireEvent.keyUp(input, { target: { value: 'Paris' } });
    await interaction.updateComplete;

    // Initially no states
    expect(interaction.internals.states.has('candidate-correct')).toBe(false);

    // Enable
    interaction.showCandidateCorrection = true;
    await interaction.updateComplete;
    expect(interaction.internals.states.has('candidate-correct')).toBe(true);

    // Disable
    interaction.showCandidateCorrection = false;
    await interaction.updateComplete;
    expect(interaction.internals.states.has('candidate-correct')).toBe(false);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Full Workflow - Enter Answer Then Show Correction
 *
 * Simulates a test scenario where the user enters an answer,
 * then results are shown.
 */
export const FullWorkflow: Story = {
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement, step }) => {
    const { interaction, input } = getElements(canvasElement);

    await step('User enters an answer', async () => {
      input.value = 'London';
      await fireEvent.keyUp(input, { target: { value: 'London' } });
      await interaction.updateComplete;
      expect(interaction.value).toBe('London');
    });

    await step('Show correction - reveals incorrect', async () => {
      interaction.showCandidateCorrection = true;
      await interaction.updateComplete;
      expect(interaction.internals.states.has('candidate-incorrect')).toBe(true);
    });

    await step('Show correct response inline', async () => {
      interaction.showCorrectResponse = true;
      await interaction.updateComplete;
      const correctDiv = interaction.shadowRoot?.querySelector('[part="correct"]');
      expect(correctDiv?.textContent).toBe('Paris');
    });

    await step('Optionally show full correct response', async () => {
      interaction.showFullCorrectResponse = true;
      await interaction.updateComplete;

      await waitFor(() => {
        const fullCorrectDiv = canvasElement.querySelector('.full-correct-response');
        expect(fullCorrectDiv).toBeTruthy();
      });
    });
  }
};

/**
 * ## Correct Answer Full Workflow
 *
 * Simulates a test scenario where the user enters the correct answer.
 */
export const CorrectAnswerWorkflow: Story = {
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement, step }) => {
    const { interaction, input } = getElements(canvasElement);

    await step('User enters correct answer', async () => {
      input.value = 'Paris';
      await fireEvent.keyUp(input, { target: { value: 'Paris' } });
      await interaction.updateComplete;
    });

    await step('Show correction - reveals correct', async () => {
      interaction.showCandidateCorrection = true;
      await interaction.updateComplete;
      expect(interaction.internals.states.has('candidate-correct')).toBe(true);
      expect(interaction.correctness).toBe('correct');
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ## Whitespace Handling
 *
 * Tests how leading/trailing whitespace affects correctness.
 */
export const WhitespaceHandling: Story = {
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: 'Paris' }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type with leading space
    input.value = ' Paris';
    await fireEvent.keyUp(input, { target: { value: ' Paris' } });
    await interaction.updateComplete;

    // Whitespace matters - should be incorrect
    expect(interaction.correctness).toBe('incorrect');

    // Type exact match
    input.value = 'Paris';
    await fireEvent.keyUp(input, { target: { value: 'Paris' } });
    await interaction.updateComplete;
    expect(interaction.correctness).toBe('correct');
  }
};

/**
 * ## Special Characters in Correct Response
 *
 * Tests correct response with special characters.
 */
export const SpecialCharacters: Story = {
  tags: ['xfail'],
  render: () => baseTemplate({ correctResponseAttr: "Côte d'Ivoire" }),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Exact match with special characters
    input.value = "Côte d'Ivoire";
    await fireEvent.keyUp(input, { target: { value: "Côte d'Ivoire" } });
    await interaction.updateComplete;

    expect(interaction.correctness).toBe('correct');
  }
};

/**
 * ## Numeric Correct Response
 *
 * Tests correct response with numeric values.
 */
export const NumericCorrectResponse: Story = {
  tags: ['xfail'],
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      correct-response="42"
      pattern-mask="[0-9]+"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Wrong number
    input.value = '41';
    await fireEvent.keyUp(input, { target: { value: '41' } });
    await interaction.updateComplete;
    expect(interaction.correctness).toBe('incorrect');

    // Correct number
    input.value = '42';
    await fireEvent.keyUp(input, { target: { value: '42' } });
    await interaction.updateComplete;
    expect(interaction.correctness).toBe('correct');
  }
};
