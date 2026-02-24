import { html } from 'lit';
import { expect, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTextEntryInteraction } from '../qti-text-entry-interaction';

type Story = StoryObj<QtiTextEntryInteraction>;

/**
 * ## Form Association Stories
 *
 * Tests for form integration: FormData, submission, reset, and form states.
 * Verifies the component works correctly as a form-associated custom element.
 *
 * These tests are mostly GENERIC (common to all form-associated interactions).
 */
const meta: Meta<QtiTextEntryInteraction> = {
  component: 'qti-text-entry-interaction',
  title: '03 Text Entry Interaction/Forms',
  tags: ['form-associated']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = () => html`
  <form
    data-testid="form"
    role="form"
    @submit=${(e: Event) => e.preventDefault()}
    @reset=${(e: Event) => {
      e.preventDefault();
      const interaction = (e.target as HTMLElement)?.querySelector('qti-text-entry-interaction');
      if (interaction?.formResetCallback) {
        interaction.formResetCallback();
      }
    }}
  >
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
    <input type="submit" value="submit" />
    <input type="reset" value="reset" />
  </form>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
  const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;
  const submitButton = canvas.getByRole<HTMLButtonElement>('button', { name: 'submit' });
  const resetButton = canvas.getByRole<HTMLButtonElement>('button', { name: 'reset' });
  return { canvas, form, interaction, input, submitButton, resetButton };
};

const getFormDataValues = (form: HTMLFormElement, name: string) => {
  const formData = new FormData(form);
  return formData.get(name);
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM SUBMISSION
// ═══════════════════════════════════════════════════════════════════════════════

export const FormSubmitEnabled: Story = {
  name: 'Form Submit - Enabled',
  render: formTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction, input } = getElements(canvasElement);

    // Type a value
    input.value = 'test answer';
    await fireEvent.keyUp(input, { target: { value: 'test answer' } });
    await interaction.updateComplete;

    // Submit form
    await fireEvent.submit(form);

    // Check form data
    expect(getFormDataValues(form, 'RESPONSE')).toBe('test answer');
  }
};

export const FormSubmitDisabled: Story = {
  name: 'Form Submit - Disabled',
  render: formTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction, input } = getElements(canvasElement);

    // Set disabled before typing
    interaction.disabled = true;
    await interaction.updateComplete;

    // Try to type (should not work)
    input.value = 'should not appear';
    await fireEvent.keyUp(input, { target: { value: 'should not appear' } });

    // Submit form
    await fireEvent.submit(form);

    // Disabled elements should not submit
    expect(getFormDataValues(form, 'RESPONSE')).toBe(null);
  }
};

export const FormSubmitReadonly: Story = {
  name: 'Form Submit - Readonly',
  render: formTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction, input } = getElements(canvasElement);

    // Type a value first
    input.value = 'initial value';
    await fireEvent.keyUp(input, { target: { value: 'initial value' } });
    await interaction.updateComplete;

    // Set readonly
    interaction.readonly = true;
    await interaction.updateComplete;

    // Submit form - readonly should still submit
    await fireEvent.submit(form);

    // Readonly elements should submit their value
    expect(getFormDataValues(form, 'RESPONSE')).toBe('initial value');
  }
};

export const FormSubmitEmpty: Story = {
  name: 'Form Submit - Empty',
  render: formTemplate,
  play: async ({ canvasElement }) => {
    const { form } = getElements(canvasElement);

    // Submit without typing anything
    await fireEvent.submit(form);

    // Should submit null for empty value
    expect(getFormDataValues(form, 'RESPONSE')).toBe(null);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormReset: Story = {
  render: formTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction, input, resetButton } = getElements(canvasElement);

    // Type a value
    input.value = 'some text';
    await fireEvent.keyUp(input, { target: { value: 'some text' } });
    await interaction.updateComplete;
    expect(interaction.value).toBe('some text');

    // Reset form
    await fireEvent.click(resetButton);
    await interaction.updateComplete;

    // Should clear value
    expect(interaction.response).toBe('');
  }
};

export const FormResetMultipleTimes: Story = {
  name: 'Form Reset - Multiple Times',
  render: formTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input, resetButton } = getElements(canvasElement);

    for (let i = 0; i < 3; i++) {
      // Type a value
      input.value = `value ${i}`;
      await fireEvent.keyUp(input, { target: { value: `value ${i}` } });
      await interaction.updateComplete;
      expect(interaction.value).toBe(`value ${i}`);

      // Reset
      await fireEvent.click(resetButton);
      await interaction.updateComplete;
      expect(interaction.response).toBe('');
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataIncludesValue: Story = {
  name: 'FormData - Includes Value',
  render: formTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction, input } = getElements(canvasElement);

    // Type values
    input.value = 'my response';
    await fireEvent.keyUp(input, { target: { value: 'my response' } });
    await interaction.updateComplete;

    // Check FormData
    const formData = new FormData(form);
    expect(formData.get('RESPONSE')).toBe('my response');
  }
};

export const FormDataMultipleInteractions: Story = {
  name: 'FormData - Multiple Interactions',
  render: () => html`
    <form data-testid="form" role="form" @submit=${(e: Event) => e.preventDefault()}>
      <qti-text-entry-interaction
        name="RESPONSE1"
        response-identifier="RESPONSE1"
        data-testid="interaction1"
      ></qti-text-entry-interaction>
      <qti-text-entry-interaction
        name="RESPONSE2"
        response-identifier="RESPONSE2"
        data-testid="interaction2"
      ></qti-text-entry-interaction>
      <input type="submit" value="submit" />
    </form>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>('form');
    const interaction1 = canvas.getByTestId<QtiTextEntryInteraction>('interaction1');
    const interaction2 = canvas.getByTestId<QtiTextEntryInteraction>('interaction2');
    const input1 = interaction1.shadowRoot?.querySelector('input') as HTMLInputElement;
    const input2 = interaction2.shadowRoot?.querySelector('input') as HTMLInputElement;

    // Type in both
    input1.value = 'answer1';
    await fireEvent.keyUp(input1, { target: { value: 'answer1' } });
    await interaction1.updateComplete;

    input2.value = 'answer2';
    await fireEvent.keyUp(input2, { target: { value: 'answer2' } });
    await interaction2.updateComplete;

    // Check FormData
    const formData = new FormData(form);
    expect(formData.get('RESPONSE1')).toBe('answer1');
    expect(formData.get('RESPONSE2')).toBe('answer2');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const FormValidationBlocking: Story = {
  name: 'Form Validation - Blocking Invalid Submit',
  render: () => html`
    <form data-testid="form" role="form" @submit=${(e: Event) => e.preventDefault()}>
      <qti-text-entry-interaction
        name="RESPONSE"
        response-identifier="RESPONSE"
        pattern-mask="[A-Za-z]{3}"
        data-patternmask-message="Please enter exactly 3 letters"
        data-testid="interaction"
      ></qti-text-entry-interaction>
      <input type="submit" value="submit" />
    </form>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>('form');
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
    const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;

    // Type invalid value
    input.value = '12';
    await fireEvent.keyUp(input, { target: { value: '12' } });
    await interaction.updateComplete;

    // Form should be invalid
    expect(form.checkValidity()).toBe(false);

    // Type valid value
    input.value = 'abc';
    await fireEvent.keyUp(input, { target: { value: 'abc' } });
    await interaction.updateComplete;

    // Form should now be valid
    expect(form.checkValidity()).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC NAME CHANGES
// ═══════════════════════════════════════════════════════════════════════════════

export const DynamicNameChange: Story = {
  tags: ['xfail'],
  render: formTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction, input } = getElements(canvasElement);

    // Type a value
    input.value = 'test';
    await fireEvent.keyUp(input, { target: { value: 'test' } });
    await interaction.updateComplete;

    // Verify initial name
    let formData = new FormData(form);
    expect(formData.get('RESPONSE')).toBe('test');
    expect(formData.get('NEW_RESPONSE')).toBe(null);

    // Change name
    interaction.name = 'NEW_RESPONSE';
    await interaction.updateComplete;

    // Verify new name
    formData = new FormData(form);
    expect(formData.get('RESPONSE')).toBe(null);
    expect(formData.get('NEW_RESPONSE')).toBe('test');
  }
};
