import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '../../../elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * ## API Stories
 *
 * Tests for the public API: properties, attributes, events, methods, and form internals.
 * Verifies the component's public contract is working correctly.
 *
 * These tests are a MIX of generic (common to all form-associated interactions)
 * and specific (qti-choice-interaction specific properties/attributes).
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '02 Choice Interaction/API',
  tags: ['api']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const baseTemplate = () => html`
  <form data-testid="form" role="form" @submit=${e => e.preventDefault()}>
    <qti-choice-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      max-choices="4"
      min-choices="0"
      data-testid="interaction"
    >
      <qti-prompt><p>Select options</p></qti-prompt>
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  </form>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  const choices = {
    A: canvas.getByText<QtiSimpleChoice>('Option A'),
    B: canvas.getByText<QtiSimpleChoice>('Option B'),
    C: canvas.getByText<QtiSimpleChoice>('Option C')
  };
  return { canvas, form, interaction, choices };
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTIES - GENERIC (value, response, disabled, readonly)
// ═══════════════════════════════════════════════════════════════════════════════

export const PropertyValue: Story = {
  name: 'Property: value',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Initially null
    expect(interaction.value).toBe(null);

    // After selection
    await fireEvent.click(choices.A);
    expect(interaction.value).toBe('A');

    // Multiple selections (comma-separated)
    await fireEvent.click(choices.B);
    expect(interaction.value).toContain('A');
    expect(interaction.value).toContain('B');

    // Setting value programmatically
    interaction.value = 'C';
    await interaction.updateComplete;
    expect(interaction.value).toBe('C');
  }
};

export const PropertyResponse: Story = {
  name: 'Property: response',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Initially empty
    expect(interaction.response).toBe('');

    // After selection (single)
    interaction.setAttribute('max-choices', '1');
    await interaction.updateComplete;
    await fireEvent.click(choices.A);
    expect(interaction.response).toBe('A');

    // Multiple selections (array)
    interaction.setAttribute('max-choices', '4');
    await interaction.updateComplete;
    await fireEvent.click(choices.B);
    expect(Array.isArray(interaction.response)).toBe(true);
    expect(interaction.response).toContain('A');
    expect(interaction.response).toContain('B');

    // Setting response programmatically
    interaction.response = ['C'];
    await interaction.updateComplete;
    expect(interaction.response).toContain('C');
  }
};

export const PropertyDisabled: Story = {
  name: 'Property: disabled',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Initially false
    expect(interaction.disabled).toBe(false);

    // Set disabled
    interaction.disabled = true;
    await interaction.updateComplete;
    expect(interaction.disabled).toBe(true);
    expect(interaction.hasAttribute('disabled')).toBe(true);

    // Click should not work
    await fireEvent.click(choices.A);
    expect(interaction.value).toBe(null);

    // Unset disabled
    interaction.disabled = false;
    await interaction.updateComplete;
    expect(interaction.disabled).toBe(false);
    expect(interaction.hasAttribute('disabled')).toBe(false);
  }
};

export const PropertyReadonly: Story = {
  name: 'Property: readonly',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Initially false
    expect(interaction.readonly).toBe(false);

    // Set readonly
    interaction.readonly = true;
    await interaction.updateComplete;
    expect(interaction.readonly).toBe(true);
    expect(interaction.hasAttribute('readonly')).toBe(true);

    // Unset readonly
    interaction.readonly = false;
    await interaction.updateComplete;
    expect(interaction.readonly).toBe(false);
    expect(interaction.hasAttribute('readonly')).toBe(false);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTIES - SPECIFIC (minChoices, maxChoices)
// ═══════════════════════════════════════════════════════════════════════════════

export const PropertyMinChoices: Story = {
  name: 'Property: minChoices',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Check default from attribute
    expect(interaction.minChoices).toBe(0);

    // Set via property
    interaction.minChoices = 2;
    await interaction.updateComplete;
    expect(interaction.minChoices).toBe(2);

    // Should affect validation
    expect(interaction.validate()).toBe(false);
  }
};

export const PropertyMaxChoices: Story = {
  name: 'Property: maxChoices',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Check default from attribute
    expect(interaction.maxChoices).toBe(4);

    // Set via property
    interaction.maxChoices = 1;
    await interaction.updateComplete;
    expect(interaction.maxChoices).toBe(1);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ATTRIBUTE REFLECTION
// ═══════════════════════════════════════════════════════════════════════════════

export const AttributeReflection: Story = {
  render: baseTemplate,
  play: async ({ canvasElement, step }) => {
    const { interaction } = getElements(canvasElement);

    await step('disabled: attribute → property', async () => {
      interaction.setAttribute('disabled', '');
      await interaction.updateComplete;
      expect(interaction.disabled).toBe(true);

      interaction.removeAttribute('disabled');
      await interaction.updateComplete;
      expect(interaction.disabled).toBe(false);
    });

    await step('disabled: property → attribute', async () => {
      interaction.disabled = true;
      await interaction.updateComplete;
      expect(interaction.hasAttribute('disabled')).toBe(true);

      interaction.disabled = false;
      await interaction.updateComplete;
      expect(interaction.hasAttribute('disabled')).toBe(false);
    });

    await step('min-choices: attribute → property', async () => {
      interaction.setAttribute('min-choices', '3');
      await interaction.updateComplete;
      expect(interaction.minChoices).toBe(3);
    });

    await step('max-choices: attribute → property', async () => {
      interaction.setAttribute('max-choices', '2');
      await interaction.updateComplete;
      expect(interaction.maxChoices).toBe(2);
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const EventInteractionResponse: Story = {
  name: 'Event: qti-interaction-response',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    const spy = fn();
    interaction.addEventListener('qti-interaction-response', spy);

    await fireEvent.click(choices.A);

    expect(spy).toHaveBeenCalled();
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail.responseIdentifier).toBe('RESPONSE');
    expect(event.detail.response).toContain('A');
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  }
};

export const EventRegisterInteraction: Story = {
  name: 'Event: qti-register-interaction',
  render: () => html` <div data-testid="container"></div> `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container');

    const spy = fn();
    container.addEventListener('qti-register-interaction', spy);

    // Create and add interaction
    const interaction = document.createElement('qti-choice-interaction');
    interaction.setAttribute('response-identifier', 'TEST');
    container.appendChild(interaction);

    // Wait for event
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(spy).toHaveBeenCalled();
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail.responseIdentifier).toBe('TEST');
    expect(event.detail.interactionElement).toBe(interaction);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════════════════════════

export const MethodValidate: Story = {
  name: 'Method: validate()',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Set min-choices to require selection
    interaction.minChoices = 1;
    await interaction.updateComplete;

    // Should return false (invalid)
    expect(interaction.validate()).toBe(false);

    // Make selection
    await fireEvent.click(choices.A);

    // Should return true (valid)
    expect(interaction.validate()).toBe(true);
  }
};

export const MethodReportValidity: Story = {
  name: 'Method: reportValidity()',
  tags: ['api', 'xfail'],
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Set min-choices to require selection
    interaction.minChoices = 1;
    await interaction.updateComplete;

    // Validate first to set state
    interaction.validate();

    // reportValidity should return boolean
    const result = interaction.reportValidity();
    expect(typeof result).toBe('boolean');
    expect(result).toBe(false);

    // Should show validation message
    const messageEl = interaction.shadowRoot?.querySelector('#validation-message');
    expect(messageEl?.textContent).toBeTruthy();
  }
};

export const MethodReset: Story = {
  name: 'Method: reset()',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction, choices } = getElements(canvasElement);

    // Make selection
    await fireEvent.click(choices.A);
    expect(interaction.value).toBe('A');

    // Reset
    interaction.reset();
    await interaction.updateComplete;

    // Should clear value
    expect(interaction.value).toBe(null);

    // Form should not have value
    const formData = new FormData(form);
    expect(formData.get('RESPONSE')).toBe(null);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM INTERNALS
// ═══════════════════════════════════════════════════════════════════════════════

export const InternalsForm: Story = {
  name: 'Internals: form association',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction } = getElements(canvasElement);

    // Should be associated with form
    expect(interaction.internals).toBeTruthy();
    expect(interaction.internals.form).toBe(form);

    // Remove from form
    document.body.appendChild(interaction);
    await interaction.updateComplete;

    // Should no longer be associated
    expect(interaction.internals.form).toBe(null);
  }
};

export const InternalsFormValue: Story = {
  name: 'Internals: setFormValue',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { form, interaction, choices } = getElements(canvasElement);

    // Make selection
    await fireEvent.click(choices.A);

    // Check FormData
    const formData = new FormData(form);
    expect(formData.get('RESPONSE')).toBe('A');
  }
};

export const InternalsValidity: Story = {
  name: 'Internals: validity state',
  tags: ['api', 'xfail'],
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    interaction.minChoices = 1;
    await interaction.updateComplete;

    // Check validity state
    interaction.validate();
    expect(interaction.internals.validity.valid).toBe(false);
    expect(interaction.internals.validity.customError).toBe(true);

    // Make valid
    await fireEvent.click(choices.A);
    interaction.validate();
    expect(interaction.internals.validity.valid).toBe(true);
  }
};

export const InternalsStates: Story = {
  name: 'Internals: states (choice level)',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { choices } = getElements(canvasElement);

    // Click choice A
    await fireEvent.click(choices.A);

    // Check states on choice
    expect(choices.A.internals.states.has('--checked')).toBe(true);
    expect(choices.B.internals.states.has('--checked')).toBe(false);

    // Deselect A
    await fireEvent.click(choices.A);
    expect(choices.A.internals.states.has('--checked')).toBe(false);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════════

export const StaticFormAssociated: Story = {
  name: 'Static: formAssociated',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Check static property on constructor
    const ctor = interaction.constructor as typeof QtiChoiceInteraction;
    expect((ctor as any).formAssociated).toBe(true);
  }
};
