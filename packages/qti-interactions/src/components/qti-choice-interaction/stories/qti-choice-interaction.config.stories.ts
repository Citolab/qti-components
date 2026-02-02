import { html } from 'lit';
import { expect, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '../../../elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * ## Configuration Stories
 *
 * Tests for component-specific configuration options: context settings, shuffle, modes.
 * These tests verify configuration options work correctly.
 *
 * These tests are SPECIFIC to qti-choice-interaction.
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '01 Choice Interaction/Configuration',
  tags: ['configuration', 'specific']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  return { canvas, interaction };
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHUFFLE
// ═══════════════════════════════════════════════════════════════════════════════

export const ShuffleAttribute: Story = {
  name: 'Shuffle Attribute',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" shuffle="true" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Verify shuffle attribute is present
    expect(interaction.hasAttribute('shuffle')).toBe(true);
  }
};

export const ShuffleWithFixed: Story = {
  name: 'Shuffle with Fixed Choices',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" shuffle="true" data-testid="interaction">
      <qti-simple-choice identifier="A" fixed="true">First (fixed)</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D" fixed="true">Last (fixed)</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { interaction } = getElements(canvasElement);

    // Fixed choices should have fixed attribute
    const choices = interaction.querySelectorAll('qti-simple-choice');
    expect(choices[0].hasAttribute('fixed')).toBe(true);
    expect(choices[3].hasAttribute('fixed')).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAX CHOICES BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════════

export const MaxChoicesOne: Story = {
  name: 'Max Choices = 1 (Radio Behavior)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { interaction } = getElements(canvasElement);

    expect(interaction.maxChoices).toBe(1);
    expect(interaction.internals.role).toBe('radiogroup');
  }
};

export const MaxChoicesMultiple: Story = {
  name: 'Max Choices > 1 (Checkbox Behavior)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="3" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { interaction } = getElements(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');

    expect(interaction.maxChoices).toBe(3);
    expect(choiceA.internals.role).toBe('checkbox');
  }
};

export const MaxChoicesZero: Story = {
  name: 'Max Choices = 0 (Unlimited)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="0" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { interaction } = getElements(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Option C');
    const choiceD = canvas.getByText<QtiSimpleChoice>('Option D');

    // Select all - should be allowed
    await fireEvent.click(choiceA);
    await fireEvent.click(choiceB);
    await fireEvent.click(choiceC);
    await fireEvent.click(choiceD);

    expect(interaction.response).toContain('A');
    expect(interaction.response).toContain('B');
    expect(interaction.response).toContain('C');
    expect(interaction.response).toContain('D');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE IDENTIFIER
// ═══════════════════════════════════════════════════════════════════════════════

export const ResponseIdentifier: Story = {
  name: 'Response Identifier',
  render: () => html`
    <qti-choice-interaction
      name="RESPONSE"
      response-identifier="CHOICE_RESPONSE"
      max-choices="4"
      data-testid="interaction"
    >
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.responseIdentifier).toBe('CHOICE_RESPONSE');
    expect(interaction.getAttribute('response-identifier')).toBe('CHOICE_RESPONSE');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORRECT RESPONSE
// ═══════════════════════════════════════════════════════════════════════════════

export const CorrectResponseSingle: Story = {
  name: 'Correct Response - Single',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Set correct response programmatically
    interaction.correctResponse = 'B';

    expect(interaction.correctResponse).toBe('B');
  }
};

export const CorrectResponseMultiple: Story = {
  name: 'Correct Response - Multiple',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Set correct response programmatically
    interaction.correctResponse = ['A', 'C'];

    expect(interaction.correctResponse).toContain('A');
    expect(interaction.correctResponse).toContain('C');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATA ATTRIBUTES
// ═══════════════════════════════════════════════════════════════════════════════

export const CustomValidationMessages: Story = {
  name: 'Custom Validation Messages via Data Attributes',
  tags: ['configuration', 'specific', 'xfail'],
  render: () => html`
    <qti-choice-interaction
      name="RESPONSE"
      min-choices="2"
      max-choices="3"
      data-min-selections-message="You need at least two!"
      data-max-selections-message="That's too many!"
      data-testid="interaction"
    >
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.dataset.minSelectionsMessage).toBe('You need at least two!');
    expect(interaction.dataset.maxSelectionsMessage).toBe("That's too many!");

    // Trigger validation
    interaction.validate();
    interaction.reportValidity();

    const messageEl = interaction.shadowRoot?.querySelector('#validation-message');
    expect(messageEl?.textContent).toBe('You need at least two!');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC CONFIGURATION CHANGES
// ═══════════════════════════════════════════════════════════════════════════════

export const DynamicMaxChoicesChange: Story = {
  name: 'Dynamic: Change max-choices at Runtime',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const { interaction } = getElements(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');

    await step('Initially radio (max-choices=1)', async () => {
      expect(interaction.internals.role).toBe('radiogroup');
      expect(choiceA.internals.role).toBe('radio');
    });

    await step('Change to multiple (max-choices=4)', async () => {
      interaction.maxChoices = 4;
      await interaction.updateComplete;

      expect(interaction.internals.role).toBe(null);
      expect(choiceA.internals.role).toBe('checkbox');
    });

    await step('Change back to single (max-choices=1)', async () => {
      interaction.maxChoices = 1;
      await interaction.updateComplete;

      expect(interaction.internals.role).toBe('radiogroup');
      expect(choiceA.internals.role).toBe('radio');
    });
  }
};
