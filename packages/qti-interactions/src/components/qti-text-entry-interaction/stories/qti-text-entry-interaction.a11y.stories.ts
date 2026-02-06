import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTextEntryInteraction } from '../qti-text-entry-interaction';

type Story = StoryObj<QtiTextEntryInteraction>;

/**
 * ## Accessibility Stories
 *
 * Tests for accessibility compliance: labels, focus management, disabled/readonly states.
 * These tests verify the component works correctly with assistive technologies.
 *
 * Note: qti-text-entry-interaction is a simple input wrapper, so ARIA roles are
 * inherited from the native input element.
 */
const meta: Meta<QtiTextEntryInteraction> = {
  component: 'qti-text-entry-interaction',
  title: '03 Text Entry Interaction/Accessibility',
  tags: ['a11y']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
  const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;
  return { canvas, interaction, input };
};

// ═══════════════════════════════════════════════════════════════════════════════
// LABELS
// ═══════════════════════════════════════════════════════════════════════════════

export const LabelAssociation: Story = {
  name: 'Label Association',
  render: () => html`
    <form data-testid="form" role="form">
      <label for="text-input">Enter your answer:</label>
      <qti-text-entry-interaction
        id="text-input"
        name="RESPONSE"
        response-identifier="RESPONSE"
        data-testid="interaction"
      ></qti-text-entry-interaction>
    </form>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Should have associated label
    expect(interaction.internals.labels.length).toBe(1);
    expect(interaction.internals.labels[0].textContent).toBe('Enter your answer:');
  }
};

export const ClickOnLabelFocusesInput: Story = {
  name: 'Click on Label Focuses Input',
  tags: ['xfail'], // This test may fail due to browser focus delegation behavior
  render: () => html`
    <form data-testid="form" role="form">
      <label for="text-input" data-testid="label">Enter your answer:</label>
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
    const label = canvas.getByTestId('label');
    const { interaction, input } = getElements(canvasElement);

    // Click on label
    await userEvent.click(label);

    // Input should receive focus (via form internals)
    // Note: Focus delegation may depend on browser implementation
    expect(document.activeElement === interaction || interaction.shadowRoot?.activeElement === input).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

export const TabFocusable: Story = {
  name: 'Tab - Focusable',
  tags: ['xfail'],
  render: () => html`
    <button data-testid="before">Before</button>
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
    <button data-testid="after">After</button>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const beforeButton = canvas.getByTestId('before');
    const { interaction, input } = getElements(canvasElement);

    // Focus on before button
    beforeButton.focus();
    expect(document.activeElement).toBe(beforeButton);

    // Tab to interaction
    await userEvent.tab();

    // Interaction's input should be focused
    expect(interaction.shadowRoot?.activeElement).toBe(input);
  }
};

export const TabSkipsDisabled: Story = {
  name: 'Tab - Skips Disabled',
  render: () => html`
    <button data-testid="before">Before</button>
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      disabled
      data-testid="interaction"
    ></qti-text-entry-interaction>
    <button data-testid="after">After</button>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const beforeButton = canvas.getByTestId('before');
    const afterButton = canvas.getByTestId('after');
    const { input } = getElements(canvasElement);

    // Focus on before button
    beforeButton.focus();
    expect(document.activeElement).toBe(beforeButton);

    // Tab should skip disabled interaction
    await userEvent.tab();

    // Should go to after button, not the disabled interaction
    expect(document.activeElement).toBe(afterButton);
    expect(input.disabled).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DISABLED STATE ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

export const DisabledInputAttribute: Story = {
  name: 'Disabled - Input Has Disabled Attribute',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      disabled
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { input } = getElements(canvasElement);

    // Input should have disabled attribute
    expect(input.disabled).toBe(true);
    expect(input.hasAttribute('disabled')).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// READONLY STATE ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

export const ReadonlyInputAttribute: Story = {
  name: 'Readonly - Input Has Readonly Attribute',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      readonly
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { input } = getElements(canvasElement);

    // Input should have readonly attribute
    expect(input.readOnly).toBe(true);
    expect(input.hasAttribute('readonly')).toBe(true);
  }
};

export const ReadonlyStillFocusable: Story = {
  name: 'Readonly - Still Focusable',
  tags: ['xfail'],
  render: () => html`
    <button data-testid="before">Before</button>
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      readonly
      data-testid="interaction"
    ></qti-text-entry-interaction>
    <button data-testid="after">After</button>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const beforeButton = canvas.getByTestId('before');
    const { interaction, input } = getElements(canvasElement);

    // Focus on before button
    beforeButton.focus();

    // Tab to readonly interaction - should still be focusable
    await userEvent.tab();

    // Readonly input should be focused (unlike disabled)
    expect(interaction.shadowRoot?.activeElement).toBe(input);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOCOMPLETE AND SPELLCHECK
// ═══════════════════════════════════════════════════════════════════════════════

export const AutocompleteOff: Story = {
  name: 'Autocomplete - Off',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { input } = getElements(canvasElement);

    // Autocomplete should be off for test inputs
    expect(input.autocomplete).toBe('off');
  }
};

export const SpellcheckOff: Story = {
  name: 'Spellcheck - Off',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { input } = getElements(canvasElement);

    // Spellcheck should be off for test inputs
    expect(input.spellcheck).toBe(false);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════════════

export const PlaceholderAccessible: Story = {
  name: 'Placeholder - Accessible',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      placeholder-text="Type your answer here"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { input } = getElements(canvasElement);

    // Placeholder should be present
    expect(input.placeholder).toBe('Type your answer here');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE ELEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const IsInlineElement: Story = {
  name: 'Is Inline Element',
  render: () => html`
    <p>
      The capital of France is
      <qti-text-entry-interaction
        name="RESPONSE"
        response-identifier="RESPONSE"
        data-testid="interaction"
      ></qti-text-entry-interaction>
      and it is located in Europe.
    </p>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Should be inline
    expect(interaction.isInline).toBe(true);
  }
};
