import { html } from 'lit';
import { expect, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { Test } from '../qti-choice-interaction.stories';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '../../../elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * ## Validation Stories
 *
 * Tests for component-specific validation rules including min-choices, max-choices,
 * validation messages, and validation state management.
 *
 * These tests are SPECIFIC to qti-choice-interaction and test the validation
 * behavior within a form context.
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '01 Choice Interaction/Validation',
  tags: ['validation', 'specific']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (storyArgs, context) => html`
  <form data-testid="form" role="form" @submit=${e => e.preventDefault()}>
    ${Test.render(storyArgs, context)}
    <input type="submit" value="submit" />
  </form>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  const choices = {
    A: canvas.getByText<QtiSimpleChoice>('Option A'),
    B: canvas.getByText<QtiSimpleChoice>('Option B'),
    C: canvas.getByText<QtiSimpleChoice>('Option C'),
    D: canvas.getByText<QtiSimpleChoice>('Option D')
  };
  const validationMessage = interaction.shadowRoot?.querySelector('#validation-message');
  return { canvas, form, interaction, choices, validationMessage };
};

// ═══════════════════════════════════════════════════════════════════════════════
// MIN-CHOICES VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const MinChoicesNotMet: Story = {
  name: 'Min Choices - Not Met',
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 2,
    maxChoices: 4
  },
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // No selection - should be invalid
    expect(interaction.validate()).toBe(false);

    // Select only one - still invalid (need 2)
    await fireEvent.click(choices.A);
    expect(interaction.validate()).toBe(false);

    // Select second - now valid
    await fireEvent.click(choices.B);
    expect(interaction.validate()).toBe(true);
  }
};

export const MinChoicesMet: Story = {
  name: 'Min Choices - Met',
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 1,
    maxChoices: 4
  },
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // No selection - invalid
    expect(interaction.validate()).toBe(false);

    // Select one - valid
    await fireEvent.click(choices.A);
    expect(interaction.validate()).toBe(true);
  }
};

export const MinChoicesZero: Story = {
  name: 'Min Choices - Zero (Optional)',
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 0,
    maxChoices: 4
  },
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // No selection - should be valid (optional)
    expect(interaction.validate()).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAX-CHOICES VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const MaxChoicesExceeded: Story = {
  name: 'Max Choices - Exceeded',
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 0,
    maxChoices: 2
  },
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Select up to max
    await fireEvent.click(choices.A);
    await fireEvent.click(choices.B);
    expect(interaction.validate()).toBe(true);

    // Select one more - should be invalid
    await fireEvent.click(choices.C);
    expect(interaction.validate()).toBe(false);
  }
};

export const MaxChoicesUnlimited: Story = {
  name: 'Max Choices - Unlimited (0)',
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 0,
    maxChoices: 0
  },
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Select all - should be valid
    await fireEvent.click(choices.A);
    await fireEvent.click(choices.B);
    await fireEvent.click(choices.C);
    await fireEvent.click(choices.D);
    expect(interaction.validate()).toBe(true);
  }
};

export const MaxChoicesSingle: Story = {
  name: 'Max Choices - Single (Radio Behavior)',
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 1,
    maxChoices: 1
  },
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Select A
    await fireEvent.click(choices.A);
    expect(interaction.value).toBe('A');
    expect(interaction.validate()).toBe(true);

    // Select B - should replace A (radio behavior)
    await fireEvent.click(choices.B);
    expect(interaction.value).toBe('B');
    expect(interaction.validate()).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

export const ValidationMessageMinChoices: Story = {
  name: 'Validation Message - Min Choices',
  tags: ['validation', 'specific', 'xfail'],
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 2,
    maxChoices: 4
  },
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Validate without selections
    interaction.validate();
    interaction.reportValidity();

    // Check validation message is shown
    const messageEl = interaction.shadowRoot?.querySelector('#validation-message');
    expect(messageEl?.textContent).toContain('at least 2');
  }
};

export const ValidationMessageMaxChoices: Story = {
  name: 'Validation Message - Max Choices',
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 0,
    maxChoices: 2
  },
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Exceed max choices
    await fireEvent.click(choices.A);
    await fireEvent.click(choices.B);
    await fireEvent.click(choices.C);

    interaction.validate();
    interaction.reportValidity();

    // Check validation message is shown
    const messageEl = interaction.shadowRoot?.querySelector('#validation-message');
    expect(messageEl?.textContent).toContain('no more than 2');
  }
};

export const ValidationMessageCleared: Story = {
  name: 'Validation Message - Cleared When Valid',
  tags: ['validation', 'specific', 'xfail'],
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 1,
    maxChoices: 4
  },
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Show validation message
    interaction.validate();
    interaction.reportValidity();

    const messageEl = interaction.shadowRoot?.querySelector('#validation-message');
    expect(messageEl?.textContent).toBeTruthy();

    // Make valid selection
    await fireEvent.click(choices.A);
    interaction.validate();
    interaction.reportValidity();

    // Message should be cleared
    expect(messageEl?.textContent).toBe('');
  }
};

export const CustomValidationMessage: Story = {
  tags: ['validation', 'specific', 'xfail'],
  render: () => html`
    <form data-testid="form" role="form" @submit=${e => e.preventDefault()}>
      <qti-choice-interaction
        name="RESPONSE"
        min-choices="2"
        max-choices="4"
        data-testid="interaction"
        data-min-selections-message="Please pick at least two options!"
        data-max-selections-message="Too many options selected!"
      >
        <qti-prompt><p>Select options</p></qti-prompt>
        <qti-simple-choice identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice identifier="B">Option B</qti-simple-choice>
        <qti-simple-choice identifier="C">Option C</qti-simple-choice>
        <qti-simple-choice identifier="D">Option D</qti-simple-choice>
      </qti-choice-interaction>
    </form>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Validate without selections
    interaction.validate();
    interaction.reportValidity();

    // Check custom message is shown
    const messageEl = interaction.shadowRoot?.querySelector('#validation-message');
    expect(messageEl?.textContent).toBe('Please pick at least two options!');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION STATE
// ═══════════════════════════════════════════════════════════════════════════════

export const ValidationStateTransition: Story = {
  name: 'Validation State - Transition',
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    minChoices: 1,
    maxChoices: 2
  },
  play: async ({ canvasElement, step }) => {
    const { interaction, choices } = getElements(canvasElement);

    await step('Initially invalid (no selection)', async () => {
      expect(interaction.validate()).toBe(false);
    });

    await step('Valid after first selection', async () => {
      await fireEvent.click(choices.A);
      expect(interaction.validate()).toBe(true);
    });

    await step('Still valid at max', async () => {
      await fireEvent.click(choices.B);
      expect(interaction.validate()).toBe(true);
    });

    await step('Invalid when exceeding max', async () => {
      await fireEvent.click(choices.C);
      expect(interaction.validate()).toBe(false);
    });

    await step('Valid again after deselection', async () => {
      await fireEvent.click(choices.C); // Deselect
      expect(interaction.validate()).toBe(true);
    });
  }
};
