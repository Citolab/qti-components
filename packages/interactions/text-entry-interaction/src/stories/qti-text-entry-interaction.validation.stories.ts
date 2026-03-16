import { html } from 'lit';
import { expect, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTextEntryInteraction } from '../qti-text-entry-interaction';

type Story = StoryObj<QtiTextEntryInteraction>;

/**
 * ## Validation Stories
 *
 * Tests for component-specific validation rules including pattern-mask validation,
 * validation messages, and validation state management.
 *
 * These tests are SPECIFIC to qti-text-entry-interaction and test the validation
 * behavior within a form context.
 */
const meta: Meta<QtiTextEntryInteraction> = {
  component: 'qti-text-entry-interaction',
  title: '03 Text Entry Interaction/Validation',
  tags: ['validation', 'specific']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (patternMask?: string, message?: string) => html`
  <form data-testid="form" role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      pattern-mask=${patternMask || '[A-Za-z]{3}'}
      data-patternmask-message=${message || 'Please enter exactly 3 letters'}
      data-testid="interaction"
    ></qti-text-entry-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
  const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;
  return { canvas, form, interaction, input };
};

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN MASK VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const PatternMaskValid: Story = {
  name: 'Pattern Mask - Valid Input',
  render: () => formTemplate('[A-Za-z]{3}', 'Please enter exactly 3 letters'),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type valid value
    input.value = 'abc';
    await fireEvent.keyUp(input, { target: { value: 'abc' } });
    await interaction.updateComplete;

    expect(interaction.validate()).toBe(true);
  }
};

export const PatternMaskInvalid: Story = {
  name: 'Pattern Mask - Invalid Input',
  render: () => formTemplate('[A-Za-z]{3}', 'Please enter exactly 3 letters'),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type invalid value (numbers instead of letters)
    input.value = '123';
    await fireEvent.keyUp(input, { target: { value: '123' } });
    await interaction.updateComplete;

    expect(interaction.validate()).toBe(false);
  }
};

export const PatternMaskTooShort: Story = {
  name: 'Pattern Mask - Too Short',
  render: () => formTemplate('[A-Za-z]{3}', 'Please enter exactly 3 letters'),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type too few characters
    input.value = 'ab';
    await fireEvent.keyUp(input, { target: { value: 'ab' } });
    await interaction.updateComplete;

    expect(interaction.validate()).toBe(false);
  }
};

export const PatternMaskTooLong: Story = {
  name: 'Pattern Mask - Too Long',
  render: () => formTemplate('[A-Za-z]{3}', 'Please enter exactly 3 letters'),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type too many characters
    input.value = 'abcd';
    await fireEvent.keyUp(input, { target: { value: 'abcd' } });
    await interaction.updateComplete;

    expect(interaction.validate()).toBe(false);
  }
};

export const PatternMaskNumeric: Story = {
  name: 'Pattern Mask - Numeric Only',
  render: () => formTemplate('[0-9]+', 'Please enter only numbers'),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type letters - invalid
    input.value = 'abc';
    await fireEvent.keyUp(input, { target: { value: 'abc' } });
    await interaction.updateComplete;
    expect(interaction.validate()).toBe(false);

    // Type numbers - valid
    input.value = '123';
    await fireEvent.keyUp(input, { target: { value: '123' } });
    await interaction.updateComplete;
    expect(interaction.validate()).toBe(true);
  }
};

export const PatternMaskEmail: Story = {
  name: 'Pattern Mask - Email Pattern',
  tags: ['xfail'],
  render: () => formTemplate('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', 'Please enter a valid email'),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type invalid email
    input.value = 'not-an-email';
    await fireEvent.keyUp(input, { target: { value: 'not-an-email' } });
    await interaction.updateComplete;
    expect(interaction.validate()).toBe(false);

    // Type valid email
    input.value = 'test@example.com';
    await fireEvent.keyUp(input, { target: { value: 'test@example.com' } });
    await interaction.updateComplete;
    expect(interaction.validate()).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY INPUT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const EmptyInputInvalid: Story = {
  name: 'Empty Input - Invalid',
  tags: ['xfail'],
  render: () => formTemplate(),
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Empty input should be invalid (no response entered)
    expect(interaction.validate()).toBe(false);
  }
};

export const EmptyAfterClearing: Story = {
  name: 'Empty After Clearing - Invalid',
  tags: ['xfail'],
  render: () => formTemplate(),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type something
    input.value = 'abc';
    await fireEvent.keyUp(input, { target: { value: 'abc' } });
    await interaction.updateComplete;
    expect(interaction.validate()).toBe(true);

    // Clear input
    input.value = '';
    await fireEvent.keyUp(input, { target: { value: '' } });
    await interaction.updateComplete;
    expect(interaction.validate()).toBe(false);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM VALIDATION MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

export const CustomValidationMessage: Story = {
  render: () => formTemplate('[A-Z]{2}', 'Enter exactly 2 uppercase letters'),
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type invalid value
    input.value = 'ab'; // lowercase
    await fireEvent.keyUp(input, { target: { value: 'ab' } });
    await interaction.updateComplete;

    // Validate should fail
    expect(interaction.validate()).toBe(false);

    // Check that custom message is set
    expect(interaction.dataPatternmaskMessage).toBe('Enter exactly 2 uppercase letters');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION STATE CHANGES
// ═══════════════════════════════════════════════════════════════════════════════

export const ValidationStateTransitions: Story = {
  tags: ['xfail'],
  render: () => formTemplate('[0-9]{4}', 'Enter a 4-digit number'),
  play: async ({ canvasElement, step }) => {
    const { interaction, input } = getElements(canvasElement);

    await step('Initially invalid (empty)', async () => {
      expect(interaction.validate()).toBe(false);
    });

    await step('Invalid - too short', async () => {
      input.value = '12';
      await fireEvent.keyUp(input, { target: { value: '12' } });
      await interaction.updateComplete;
      expect(interaction.validate()).toBe(false);
    });

    await step('Invalid - wrong characters', async () => {
      input.value = 'abcd';
      await fireEvent.keyUp(input, { target: { value: 'abcd' } });
      await interaction.updateComplete;
      expect(interaction.validate()).toBe(false);
    });

    await step('Valid - correct format', async () => {
      input.value = '1234';
      await fireEvent.keyUp(input, { target: { value: '1234' } });
      await interaction.updateComplete;
      expect(interaction.validate()).toBe(true);
    });

    await step('Invalid again - cleared', async () => {
      input.value = '';
      await fireEvent.keyUp(input, { target: { value: '' } });
      await interaction.updateComplete;
      expect(interaction.validate()).toBe(false);
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// NO PATTERN MASK
// ═══════════════════════════════════════════════════════════════════════════════

export const NoPatternMaskAnyInput: Story = {
  name: 'No Pattern Mask - Any Input Valid',
  tags: ['xfail'],
  render: () => html`
    <form data-testid="form" role="form" @submit=${(e: Event) => e.preventDefault()}>
      <qti-text-entry-interaction
        name="RESPONSE"
        response-identifier="RESPONSE"
        data-testid="interaction"
      ></qti-text-entry-interaction>
      <input type="submit" value="submit" />
    </form>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Empty should be invalid (no response)
    expect(interaction.validate()).toBe(false);

    // Any non-empty input should be valid without pattern mask
    input.value = 'anything goes here!';
    await fireEvent.keyUp(input, { target: { value: 'anything goes here!' } });
    await interaction.updateComplete;
    expect(interaction.validate()).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM CONTEXT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const FormCheckValidity: Story = {
  name: 'Form checkValidity()',
  tags: ['xfail'],
  render: () => formTemplate(),
  play: async ({ canvasElement }) => {
    const { form, interaction, input } = getElements(canvasElement);

    // Form should be invalid when interaction is invalid
    expect(form.checkValidity()).toBe(false);

    // Type valid value
    input.value = 'abc';
    await fireEvent.keyUp(input, { target: { value: 'abc' } });
    await interaction.updateComplete;

    // Form should now be valid
    expect(form.checkValidity()).toBe(true);
  }
};

export const FormReportValidity: Story = {
  name: 'Form reportValidity()',
  tags: ['xfail'],
  render: () => formTemplate(),
  play: async ({ canvasElement }) => {
    const { form, interaction, input } = getElements(canvasElement);

    // Invalid form should report invalidity
    expect(form.reportValidity()).toBe(false);

    // Valid form should report validity
    input.value = 'abc';
    await fireEvent.keyUp(input, { target: { value: 'abc' } });
    await interaction.updateComplete;
    expect(form.reportValidity()).toBe(true);
  }
};
