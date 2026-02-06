import { html } from 'lit';
import { expect, fireEvent, fn, userEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTextEntryInteraction } from '../qti-text-entry-interaction';

type Story = StoryObj<QtiTextEntryInteraction>;

/**
 * ## Behavior Stories
 *
 * Tests for user interaction behavior: text input, events, keyboard handling.
 * These tests verify how the component responds to user actions.
 *
 * These tests are SPECIFIC to qti-text-entry-interaction.
 */
const meta: Meta<QtiTextEntryInteraction> = {
  component: 'qti-text-entry-interaction',
  title: '03 Text Entry Interaction/Behavior',
  tags: ['behavior', 'specific']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const baseTemplate = () => html`
  <qti-text-entry-interaction
    name="RESPONSE"
    response-identifier="RESPONSE"
    data-testid="interaction"
  ></qti-text-entry-interaction>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiTextEntryInteraction>('interaction');
  const input = interaction.shadowRoot?.querySelector('input') as HTMLInputElement;
  return { canvas, interaction, input };
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT INPUT
// ═══════════════════════════════════════════════════════════════════════════════

export const TextInputBasic: Story = {
  name: 'Text Input - Basic',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type text
    input.value = 'hello';
    await fireEvent.keyUp(input, { target: { value: 'hello' } });
    await interaction.updateComplete;

    expect(interaction.value).toBe('hello');
    expect(interaction.response).toBe('hello');
  }
};

export const TextInputWithSpaces: Story = {
  name: 'Text Input - With Spaces',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type text with spaces
    input.value = 'hello world';
    await fireEvent.keyUp(input, { target: { value: 'hello world' } });
    await interaction.updateComplete;

    expect(interaction.value).toBe('hello world');
  }
};

export const TextInputSpecialCharacters: Story = {
  name: 'Text Input - Special Characters',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type special characters
    const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    input.value = specialText;
    await fireEvent.keyUp(input, { target: { value: specialText } });
    await interaction.updateComplete;

    expect(interaction.value).toBe(specialText);
  }
};

export const TextInputUnicode: Story = {
  name: 'Text Input - Unicode Characters',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type unicode characters
    const unicodeText = '日本語 中文 한국어 العربية';
    input.value = unicodeText;
    await fireEvent.keyUp(input, { target: { value: unicodeText } });
    await interaction.updateComplete;

    expect(interaction.value).toBe(unicodeText);
  }
};

export const TextInputClearAndRetype: Story = {
  name: 'Text Input - Clear and Retype',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type initial text
    input.value = 'first';
    await fireEvent.keyUp(input, { target: { value: 'first' } });
    await interaction.updateComplete;
    expect(interaction.value).toBe('first');

    // Clear
    input.value = '';
    await fireEvent.keyUp(input, { target: { value: '' } });
    await interaction.updateComplete;
    expect(interaction.value).toBe(null);

    // Retype
    input.value = 'second';
    await fireEvent.keyUp(input, { target: { value: 'second' } });
    await interaction.updateComplete;
    expect(interaction.value).toBe('second');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DISABLED STATE
// ═══════════════════════════════════════════════════════════════════════════════

export const DisabledPreventInput: Story = {
  name: 'Disabled - Prevents Input',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      disabled
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Try to type
    input.value = 'should not work';
    await fireEvent.keyUp(input, { target: { value: 'should not work' } });
    await interaction.updateComplete;

    // Value should still be null
    expect(interaction.value).toBe(null);
  }
};

export const DisabledDynamically: Story = {
  name: 'Disabled - Dynamic Toggle',
  render: baseTemplate,
  play: async ({ canvasElement, step }) => {
    const { interaction, input } = getElements(canvasElement);

    await step('Initially enabled - can type', async () => {
      input.value = 'enabled';
      await fireEvent.keyUp(input, { target: { value: 'enabled' } });
      await interaction.updateComplete;
      expect(interaction.value).toBe('enabled');
    });

    await step('Disable - cannot type new content', async () => {
      interaction.disabled = true;
      await interaction.updateComplete;

      input.value = 'disabled attempt';
      await fireEvent.keyUp(input, { target: { value: 'disabled attempt' } });
      await interaction.updateComplete;

      // Should retain previous value
      expect(interaction.value).toBe('enabled');
    });

    await step('Re-enable - can type again', async () => {
      interaction.disabled = false;
      await interaction.updateComplete;

      input.value = 'enabled again';
      await fireEvent.keyUp(input, { target: { value: 'enabled again' } });
      await interaction.updateComplete;
      expect(interaction.value).toBe('enabled again');
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// READONLY STATE
// ═══════════════════════════════════════════════════════════════════════════════

export const ReadonlyPreventInput: Story = {
  name: 'Readonly - Prevents Input',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      readonly
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Input should be readonly
    expect(input.readOnly).toBe(true);

    // Try to type
    input.value = 'should not work';
    await fireEvent.keyUp(input, { target: { value: 'should not work' } });
    await interaction.updateComplete;

    // Value should still be null
    expect(interaction.value).toBe(null);
  }
};

export const ReadonlyWithInitialValue: Story = {
  name: 'Readonly - With Initial Value',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Set value first
    input.value = 'initial';
    await fireEvent.keyUp(input, { target: { value: 'initial' } });
    await interaction.updateComplete;

    // Set readonly
    interaction.readonly = true;
    await interaction.updateComplete;

    // Try to change
    input.value = 'changed';
    await fireEvent.keyUp(input, { target: { value: 'changed' } });
    await interaction.updateComplete;

    // Should retain initial value
    expect(interaction.value).toBe('initial');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY ATTRIBUTE
// ═══════════════════════════════════════════════════════════════════════════════

export const EmptyAttributeTracking: Story = {
  name: 'Empty Attribute - Tracking',
  render: baseTemplate,
  play: async ({ canvasElement, step }) => {
    const { interaction, input } = getElements(canvasElement);

    await step('Type text - empty should be false', async () => {
      input.value = 'text';
      await fireEvent.keyUp(input, { target: { value: 'text' } });
      await interaction.updateComplete;
      expect(interaction.getAttribute('empty')).toBe('false');
    });

    await step('Clear text - empty should be true', async () => {
      input.value = '';
      await fireEvent.keyUp(input, { target: { value: '' } });
      await interaction.updateComplete;
      expect(interaction.getAttribute('empty')).toBe('true');
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

export const EventFiredOnKeyUp: Story = {
  name: 'Event - Fired on KeyUp',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);
    const handler = fn();

    interaction.addEventListener('qti-interaction-response', handler);

    // Type a character
    input.value = 'a';
    await fireEvent.keyUp(input, { target: { value: 'a' } });

    expect(handler).toHaveBeenCalled();
  }
};

export const EventFiredOnChange: Story = {
  name: 'Event - Fired on Change',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);
    const handler = fn();

    interaction.addEventListener('qti-interaction-response', handler);

    // Change input
    input.value = 'test';
    await fireEvent.change(input, { target: { value: 'test' } });

    expect(handler).toHaveBeenCalled();
  }
};

export const EventNotFiredWhenValueUnchanged: Story = {
  name: 'Event - Not Fired When Value Unchanged',
  render: baseTemplate,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);
    const handler = fn();

    // Set initial value
    input.value = 'test';
    await fireEvent.keyUp(input, { target: { value: 'test' } });
    await interaction.updateComplete;

    // Now listen
    interaction.addEventListener('qti-interaction-response', handler);

    // "Type" the same value
    await fireEvent.keyUp(input, { target: { value: 'test' } });

    // Event should not fire since value didn't change
    expect(handler).not.toHaveBeenCalled();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLUR VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const BlurTriggersValidation: Story = {
  name: 'Blur - Triggers Validation',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      pattern-mask="[A-Za-z]{3}"
      data-patternmask-message="Enter 3 letters"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, input } = getElements(canvasElement);

    // Type invalid value
    input.value = '12';
    await fireEvent.keyUp(input, { target: { value: '12' } });
    await interaction.updateComplete;

    // Blur should trigger reportValidity
    await fireEvent.blur(input);

    // Check that validation ran (internals should have validity state)
    expect(interaction.validate()).toBe(false);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT TYPE BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════════

export const InputTypeNumber: Story = {
  name: 'Input Type - Number for Numeric Pattern',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      pattern-mask="[0-9]*"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { input } = getElements(canvasElement);

    // Input type should be number for numeric pattern
    expect(input.type).toBe('number');
  }
};

export const InputTypeText: Story = {
  name: 'Input Type - Text for Other Patterns',
  render: () => html`
    <qti-text-entry-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      pattern-mask="[A-Za-z]+"
      data-testid="interaction"
    ></qti-text-entry-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { input } = getElements(canvasElement);

    // Input type should be text for non-numeric patterns
    expect(input.type).toBe('text');
  }
};
