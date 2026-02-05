import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTextEntryInteraction } from '../qti-text-entry-interaction';

type Story = StoryObj<QtiTextEntryInteraction>;

/**
 * ## API Stories
 *
 * Tests for the public API: properties, attributes, events, methods, and form internals.
 * Verifies the component's public contract is working correctly.
 *
 * These tests are a MIX of generic (common to all form-associated interactions)
 * and specific (qti-text-entry-interaction specific properties/attributes).
 */
const meta: Meta<QtiTextEntryInteraction> = {
  component: 'qti-text-entry-interaction',
  title: '03 Text Entry Interaction/API',
  tags: ['api']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const baseTemplate = () => html`
  <form data-testid="form" role="form" @submit=${e => e.preventDefault()}>
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
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
// PROPERTIES - GENERIC (value, response, disabled, readonly)
// ═══════════════════════════════════════════════════════════════════════════════

export const PropertyValue: Story = {
  name: 'Property: value',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Initially null
    expect(interaction.value).toBe(null);

    // After typing
    input.value = 'hello';
    await fireEvent.keyUp(input, { target: { value: 'hello' } });
    expect(interaction.value).toBe('hello');

    // Setting value programmatically
    interaction.value = 'world';
    await interaction.updateComplete;
    expect(interaction.value).toBe('world');
  }
};

export const PropertyResponse: Story = {
  name: 'Property: response',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Initially empty string
    expect(interaction.response).toBe(null);

    // After typing
    input.value = 'test';
    await fireEvent.keyUp(input, { target: { value: 'test' } });
    expect(interaction.response).toBe('test');
  }
};

export const PropertyDisabled: Story = {
  name: 'Property: disabled',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Initially not disabled
    expect(interaction.disabled).toBe(false);
    expect(input.disabled).toBe(false);

    // Set disabled
    interaction.disabled = true;
    await interaction.updateComplete;
    expect(interaction.disabled).toBe(true);
    expect(input.disabled).toBe(true);

    // Typing should not work when disabled
    const originalValue = interaction.value;
    input.value = 'should not work';
    await fireEvent.keyUp(input, { target: { value: 'should not work' } });
    expect(interaction.value).toBe(originalValue);
  }
};

export const PropertyReadonly: Story = {
  name: 'Property: readonly',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Initially not readonly
    expect(interaction.readonly).toBe(false);

    // Set readonly
    interaction.readonly = true;
    await interaction.updateComplete;
    expect(interaction.readonly).toBe(true);
    expect(input.readOnly).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTIES - SPECIFIC (expectedLength, patternMask, placeholderText)
// ═══════════════════════════════════════════════════════════════════════════════

export const PropertyExpectedLength: Story = {
  name: 'Property: expectedLength',
  render: () => html`
    <qti-text-entry-interaction
      expected-length="10"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');

    expect(interaction.expectedLength).toBe(10);
  }
};

export const PropertyPatternMask: Story = {
  name: 'Property: patternMask',
  render: () => html`
    <qti-text-entry-interaction
      pattern-mask="[A-Za-z]{3}"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
    const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;

    expect(interaction.patternMask).toBe('[A-Za-z]{3}');
    expect(input.pattern).toBe('[A-Za-z]{3}');
  }
};

export const PropertyPlaceholderText: Story = {
  name: 'Property: placeholderText',
  render: () => html`
    <qti-text-entry-interaction
      placeholder-text="Enter your answer"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
    const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;

    expect(interaction.placeholderText).toBe('Enter your answer');
    expect(input.placeholder).toBe('Enter your answer');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ATTRIBUTES
// ═══════════════════════════════════════════════════════════════════════════════

export const AttributeResponseIdentifier: Story = {
  name: 'Attribute: response-identifier',
  render: () => html`
    <qti-text-entry-interaction
      response-identifier="MY_RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');

    expect(interaction.responseIdentifier).toBe('MY_RESPONSE');
    expect(interaction.getAttribute('response-identifier')).toBe('MY_RESPONSE');
  }
};

export const AttributeName: Story = {
  name: 'Attribute: name',
  render: () => html`
    <form data-testid="form" role="form" @submit=${e => e.preventDefault()}>
      <qti-text-entry-interaction
        name="FORM_FIELD"
        response-identifier="RESPONSE"
        data-testid="interaction"
      ></qti-text-entry-interaction>
    </form>
  `,
  play: async ({ canvasElement }) => {
    const { form, interaction, input } = getElements(canvasElement);

    expect(interaction.name).toBe('FORM_FIELD');

    // Type and verify form data uses the name
    input.value = 'test';
    await fireEvent.keyUp(input, { target: { value: 'test' } });
    await fireEvent.submit(form);

    const formData = new FormData(form);
    expect(formData.get('FORM_FIELD')).toBe('test');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const EventInput: Story = {
  name: 'Event: input',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
    const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;
    const inputHandler = fn();

    interaction.addEventListener('qti-interaction-response', inputHandler);

    input.value = 'a';
    await fireEvent.keyUp(input, { target: { value: 'a' } });

    expect(inputHandler).toHaveBeenCalled();
  }
};

export const EventChange: Story = {
  name: 'Event: change',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
    const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;
    const changeHandler = fn();

    interaction.addEventListener('qti-interaction-response', changeHandler);

    input.value = 'test';
    await fireEvent.change(input, { target: { value: 'test' } });

    expect(changeHandler).toHaveBeenCalled();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════════════════════════

export const MethodValidate: Story = {
  name: 'Method: validate()',
  tags: ['xfail'],
  render: () => html`
    <qti-text-entry-interaction
      pattern-mask="[A-Za-z]{3}"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
    const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;

    // Empty input - invalid
    expect(interaction.validate()).toBe(false);

    // Invalid pattern
    input.value = '123';
    await fireEvent.keyUp(input, { target: { value: '123' } });
    expect(interaction.validate()).toBe(false);

    // Valid pattern
    input.value = 'abc';
    await fireEvent.keyUp(input, { target: { value: 'abc' } });
    expect(interaction.validate()).toBe(true);
  }
};

export const MethodReset: Story = {
  name: 'Method: reset()',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type something
    input.value = 'hello';
    await fireEvent.keyUp(input, { target: { value: 'hello' } });
    expect(interaction.value).toBe('hello');

    // Reset
    interaction.reset();
    await interaction.updateComplete;
    expect(interaction.response).toBe('');
  }
};

export const MethodReportValidity: Story = {
  name: 'Method: reportValidity()',
  render: () => html`
    <qti-text-entry-interaction
      pattern-mask="[A-Za-z]{3}"
      data-patternmask-message="Please enter exactly 3 letters"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
    const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;

    // Invalid - should return false
    input.value = '12';
    await fireEvent.keyUp(input, { target: { value: '12' } });
    expect(interaction.reportValidity()).toBe(false);

    // Valid - should return true
    input.value = 'abc';
    await fireEvent.keyUp(input, { target: { value: 'abc' } });
    expect(interaction.reportValidity()).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM INTERNALS
// ═══════════════════════════════════════════════════════════════════════════════

export const FormInternalsFormAssociated: Story = {
  name: 'Form Internals: formAssociated',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction } = getElements(canvasElement);

    // Should be form-associated
    expect((interaction.constructor as typeof QtiTextEntryInteraction).formAssociated).toBe(true);

    // Should have a form reference
    expect(interaction.internals.form).toBe(form);
  }
};

export const FormInternalsLabels: Story = {
  name: 'Form Internals: labels',
  render: () => html`
    <form data-testid="form" role="form">
      <label for="text-input">Answer Label</label>
      <qti-text-entry-interaction
        id="text-input"
        name="RESPONSE"
        response-identifier="RESPONSE"
        data-testid="interaction"
      ></qti-text-entry-interaction>
    </form>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');

    // Should have labels
    expect(interaction.internals.labels.length).toBe(1);
    expect(interaction.internals.labels[0].textContent).toBe('Answer Label');
  }
};
