import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '../../../elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * ## Accessibility Stories
 *
 * Tests for accessibility compliance: ARIA attributes, keyboard navigation, focus management.
 * These tests verify the component works correctly with assistive technologies.
 *
 * These tests are a MIX of generic (keyboard patterns) and specific (ARIA roles for choice).
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '02 Choice Interaction/Accessibility',
  tags: ['a11y']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  const choiceA = canvas.queryByText<QtiSimpleChoice>('Option A');
  const choiceB = canvas.queryByText<QtiSimpleChoice>('Option B');
  const choiceC = canvas.queryByText<QtiSimpleChoice>('Option C');
  const choices = {
    A: choiceA!,
    B: choiceB!,
    C: choiceC
  };
  return { canvas, interaction, choices };
};

// ═══════════════════════════════════════════════════════════════════════════════
// ARIA ROLES
// ═══════════════════════════════════════════════════════════════════════════════

export const AriaRolesRadio: Story = {
  name: 'ARIA Roles - Radio (max-choices=1)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Interaction should be radiogroup
    expect(interaction.internals.role).toBe('radiogroup');

    // Choices should be radio
    expect(choices.A.internals.role).toBe('radio');
    expect(choices.B.internals.role).toBe('radio');
    expect(choices.C.internals.role).toBe('radio');
  }
};

export const AriaRolesCheckbox: Story = {
  name: 'ARIA Roles - Checkbox (max-choices > 1)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { choices } = getElements(canvasElement);

    // Choices should be checkbox
    expect(choices.A.internals.role).toBe('checkbox');
    expect(choices.B.internals.role).toBe('checkbox');
    expect(choices.C.internals.role).toBe('checkbox');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ARIA STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const AriaCheckedState: Story = {
  name: 'ARIA aria-checked State',
  tags: ['a11y'],
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { choices } = getElements(canvasElement);

    // Initially unchecked
    expect(choices.A.internals.ariaChecked).toBe('false');
    expect(choices.B.internals.ariaChecked).toBe('false');

    // Click A
    choices.A.click();
    await new Promise(r => setTimeout(r, 50));

    expect(choices.A.internals.ariaChecked).toBe('true');
    expect(choices.B.internals.ariaChecked).toBe('false');
  }
};

export const AriaDisabledState: Story = {
  name: 'ARIA aria-disabled State',
  tags: ['a11y'],
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B" aria-disabled="true">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { choices } = getElements(canvasElement);

    expect(choices.A.disabled).toBe(false);
    expect(choices.B.disabled).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

export const KeyboardTab: Story = {
  name: 'Keyboard: Tab Navigation',
  tags: ['a11y'],
  render: () => html`
    <button data-testid="before">Before</button>
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
    <button data-testid="after">After</button>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const before = canvas.getByTestId('before');
    const { choices } = getElements(canvasElement);

    // Wait for elements to be fully ready
    await new Promise(r => setTimeout(r, 50));

    // Choices should be focusable (tabindex 0)
    expect(choices.A.tabIndex).toBe(0);
    expect(choices.B.tabIndex).toBe(0);
    expect(choices.C.tabIndex).toBe(0);

    // Focus first choice directly
    choices.A.focus();
    expect(document.activeElement).toBe(choices.A);

    // Focus second choice
    choices.B.focus();
    expect(document.activeElement).toBe(choices.B);
  }
};

export const KeyboardSpace: Story = {
  name: 'Keyboard: Space to Select',
  tags: ['a11y'],
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Wait for elements to be ready
    await new Promise(r => setTimeout(r, 50));

    // Focus first choice
    choices.A.focus();
    expect(document.activeElement).toBe(choices.A);

    // Dispatch keyup event for Space
    choices.A.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
    await new Promise(r => setTimeout(r, 50));

    expect(interaction.response).toContain('A');
    expect(choices.A.internals.states.has('--checked')).toBe(true);
  }
};

export const KeyboardDisabledChoice: Story = {
  name: 'Keyboard: Disabled Choice Not Focusable',
  tags: ['a11y'],
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A" aria-disabled="true">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { choices } = getElements(canvasElement);

    // Disabled choice should have tabindex -1
    expect(choices.A.tabIndex).toBe(-1);
    expect(choices.B.tabIndex).toBe(0);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FOCUS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const FocusVisible: Story = {
  name: 'Focus: Visible Focus Indicator',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { choices } = getElements(canvasElement);

    // Focus first choice
    choices.A.focus();

    // Verify it's focusable
    expect(document.activeElement).toBe(choices.A);
  }
};

export const FocusLostOnDisable: Story = {
  name: 'Focus: Blur on Disable',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { choices } = getElements(canvasElement);

    // Focus first choice
    choices.A.focus();
    expect(document.activeElement).toBe(choices.A);

    // Disable the choice
    choices.A.disabled = true;
    await new Promise(r => setTimeout(r, 50));

    // Focus should be lost
    expect(document.activeElement).not.toBe(choices.A);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN READER CONSIDERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const PromptAssociation: Story = {
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-prompt><p>Select your favorite color</p></qti-prompt>
      <qti-simple-choice identifier="A">Red</qti-simple-choice>
      <qti-simple-choice identifier="B">Blue</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');

    // Verify prompt exists
    const prompt = interaction.querySelector('qti-prompt');
    expect(prompt).toBeTruthy();
    expect(prompt?.textContent).toContain('Select your favorite color');
  }
};

export const ValidationMessageAccessible: Story = {
  name: 'Validation Message has role="alert"',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" min-choices="1" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Trigger validation
    interaction.validate();
    interaction.reportValidity();

    // Find validation message element
    const messageEl = interaction.shadowRoot?.querySelector('#validation-message');
    expect(messageEl).toBeTruthy();
    expect(messageEl?.getAttribute('role')).toBe('alert');
  }
};
