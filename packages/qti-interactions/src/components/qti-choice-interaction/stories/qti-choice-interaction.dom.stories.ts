import { html } from 'lit';
import { expect, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '../../../elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * ## DOM Manipulation Stories
 *
 * Tests for runtime DOM changes: adding, removing, reordering, and moving elements.
 * These tests verify the component's resilience to structural changes.
 *
 * These tests are a MIX of generic (applicable to all interactions with children)
 * and specific (choice-interaction specific behavior).
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '02 Choice Interaction/DOM Manipulation',
  tags: ['dom-manipulation']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const baseTemplate = () => html`
  <form data-testid="form" role="form" @submit=${e => e.preventDefault()} @reset=${e => e.preventDefault()}>
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-prompt><p>Select options</p></qti-prompt>
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  return { canvas, form, interaction };
};

const getFormDataValues = (form: HTMLFormElement, name: string) => {
  const formData = new FormData(form);
  return formData.getAll(name);
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADD ELEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const AddChoiceAtRuntime: Story = {
  name: 'Add Choice at Runtime',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { canvas, form, interaction } = getElements(canvasElement);

    // Create and add a new choice
    const newChoice = document.createElement('qti-simple-choice');
    newChoice.setAttribute('identifier', 'D');
    newChoice.textContent = 'Option D';
    interaction.appendChild(newChoice);

    // Wait for registration
    await interaction.updateComplete;

    // Verify the new choice is clickable
    const choiceD = canvas.getByText<QtiSimpleChoice>('Option D');
    await fireEvent.click(choiceD);

    // Verify form value includes new choice
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toContain('D');
  }
};

export const AddMultipleChoicesAtRuntime: Story = {
  name: 'Add Multiple Choices at Runtime',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { canvas, form, interaction } = getElements(canvasElement);

    // Add multiple choices
    ['D', 'E', 'F'].forEach(id => {
      const choice = document.createElement('qti-simple-choice');
      choice.setAttribute('identifier', id);
      choice.textContent = `Option ${id}`;
      interaction.appendChild(choice);
    });

    await interaction.updateComplete;

    // Click new choices
    const choiceE = canvas.getByText<QtiSimpleChoice>('Option E');
    await fireEvent.click(choiceE);

    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toContain('E');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// REMOVE ELEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const RemoveUnselectedChoice: Story = {
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { canvas, form, interaction } = getElements(canvasElement);

    // Select A
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    await fireEvent.click(choiceA);

    // Remove B (not selected)
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    choiceB.remove();
    await interaction.updateComplete;

    // A should still be selected
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);
  }
};

export const RemoveSelectedChoice: Story = {
  tags: ['dom-manipulation', 'xfail'],
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { canvas, form, interaction } = getElements(canvasElement);

    // Select A
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    await fireEvent.click(choiceA);

    // Verify A is selected
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);

    // Remove A (selected)
    choiceA.remove();
    await interaction.updateComplete;

    // Form value should be empty now
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);
  }
};

export const RemoveAllChoices: Story = {
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction } = getElements(canvasElement);

    // Remove all choices
    const choices = interaction.querySelectorAll('qti-simple-choice');
    choices.forEach(choice => choice.remove());
    await interaction.updateComplete;

    // Should have no form value
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);

    // Validation should handle empty state
    expect(interaction.validate()).toBe(true); // min-choices defaults to 0
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// REPLACE ELEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const ReplaceAllChoices: Story = {
  tags: ['dom-manipulation', 'xfail'],
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { canvas, form, interaction } = getElements(canvasElement);

    // Select A first
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    await fireEvent.click(choiceA);

    // Replace all choices with new ones
    const prompt = interaction.querySelector('qti-prompt');
    interaction.innerHTML = '';
    if (prompt) interaction.appendChild(prompt);

    ['X', 'Y', 'Z'].forEach(id => {
      const choice = document.createElement('qti-simple-choice');
      choice.setAttribute('identifier', id);
      choice.textContent = `New Option ${id}`;
      interaction.appendChild(choice);
    });

    await interaction.updateComplete;

    // Old selection should be cleared
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);

    // New choices should be clickable
    const choiceY = canvas.getByText<QtiSimpleChoice>('New Option Y');
    await fireEvent.click(choiceY);

    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual(['Y']);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// REORDER ELEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const ReorderChoices: Story = {
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { canvas, form, interaction } = getElements(canvasElement);

    // Select A
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    await fireEvent.click(choiceA);

    // Move A to the end
    interaction.appendChild(choiceA);
    await interaction.updateComplete;

    // A should still be selected
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOVE TO NEW PARENT
// ═══════════════════════════════════════════════════════════════════════════════

export const MoveToNewForm: Story = {
  name: 'Move Interaction to New Form',
  render: () => html`
    <form data-testid="form1" role="form" @submit=${e => e.preventDefault()}>
      <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
        <qti-simple-choice identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      </qti-choice-interaction>
    </form>
    <form data-testid="form2" role="form" @submit=${e => e.preventDefault()}>
      <div data-testid="target"></div>
    </form>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form1 = canvas.getByTestId<HTMLFormElement>('form1');
    const form2 = canvas.getByTestId<HTMLFormElement>('form2');
    const target = canvas.getByTestId<HTMLDivElement>('target');
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');

    // Select A in form1
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    await fireEvent.click(choiceA);

    // Verify form1 has value
    let formData = new FormData(form1);
    expect(formData.get('RESPONSE')).toBe('A');

    // Move to form2
    target.appendChild(interaction);
    await interaction.updateComplete;

    // form1 should no longer have value
    formData = new FormData(form1);
    expect(formData.get('RESPONSE')).toBe(null);

    // form2 should now have value
    formData = new FormData(form2);
    expect(formData.get('RESPONSE')).toBe('A');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE AFTER DOM CHANGES
// ═══════════════════════════════════════════════════════════════════════════════

export const StatePreservedAfterDOMChange: Story = {
  tags: ['dom-manipulation', 'xfail'],
  render: baseTemplate,
  play: async ({ canvasElement, step }) => {
    const { canvas, form, interaction } = getElements(canvasElement);

    await step('Select A and B', async () => {
      const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
      const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
      await fireEvent.click(choiceA);
      await fireEvent.click(choiceB);

      await fireEvent.submit(form);
      const values = getFormDataValues(form, 'RESPONSE');
      expect(values).toContain('A');
      expect(values).toContain('B');
    });

    await step('Add new choice - state preserved', async () => {
      const newChoice = document.createElement('qti-simple-choice');
      newChoice.setAttribute('identifier', 'D');
      newChoice.textContent = 'Option D';
      interaction.appendChild(newChoice);
      await interaction.updateComplete;

      await fireEvent.submit(form);
      const values = getFormDataValues(form, 'RESPONSE');
      expect(values).toContain('A');
      expect(values).toContain('B');
    });

    await step('Remove unrelated choice - state preserved', async () => {
      const choiceC = canvas.getByText<QtiSimpleChoice>('Option C');
      choiceC.remove();
      await interaction.updateComplete;

      await fireEvent.submit(form);
      const values = getFormDataValues(form, 'RESPONSE');
      expect(values).toContain('A');
      expect(values).toContain('B');
    });
  }
};
