import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * ## Theming Stories
 *
 * Tests for visual customization: CSS custom properties, orientation, styling variants.
 * These tests verify the component's visual appearance can be customized.
 *
 * These tests are a MIX of generic (CSS custom properties) and specific (orientation).
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '02 Choice Interaction/Theming',
  tags: ['theming']
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
// ORIENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export const OrientationVertical: Story = {
  name: 'Orientation: Vertical (default)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" orientation="vertical" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.orientation).toBe('vertical');
  }
};

export const OrientationHorizontal: Story = {
  name: 'Orientation: Horizontal',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" orientation="horizontal" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.orientation).toBe('horizontal');
  }
};

export const OrientationClass: Story = {
  name: 'Orientation via CSS Class',
  render: () => html`
    <qti-choice-interaction
      name="RESPONSE"
      max-choices="4"
      class="qti-orientation-horizontal"
      data-testid="interaction"
    >
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.classList.contains('qti-orientation-horizontal')).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// STACKING / LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

export const Stacking2Columns: Story = {
  name: 'Stacking: 2 Columns',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" class="qti-choices-stacking-2" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.classList.contains('qti-choices-stacking-2')).toBe(true);
  }
};

export const Stacking3Columns: Story = {
  name: 'Stacking: 3 Columns',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="6" class="qti-choices-stacking-3" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
      <qti-simple-choice identifier="E">Option E</qti-simple-choice>
      <qti-simple-choice identifier="F">Option F</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.classList.contains('qti-choices-stacking-3')).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT CONTROL VISIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

export const InputControlHidden: Story = {
  name: 'Input Control: Hidden',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" class="qti-input-control-hidden" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.classList.contains('qti-input-control-hidden')).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSS CUSTOM PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════════

export const CSSCustomProperties: Story = {
  render: () => html`
    <style>
      .themed-interaction {
        --qti-choice-background: #f0f0f0;
        --qti-choice-border: 2px solid blue;
        --qti-choice-border-radius: 8px;
      }
    </style>
    <qti-choice-interaction name="RESPONSE" max-choices="4" class="themed-interaction" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    expect(interaction.classList.contains('themed-interaction')).toBe(true);
  }
};

export const ItemCountCSSVariable: Story = {
  name: 'CSS Variable: --item-count',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Wait for slotchange to set the variable
    await new Promise(r => setTimeout(r, 50));

    const itemCount = getComputedStyle(interaction).getPropertyValue('--item-count');
    expect(itemCount.trim()).toBe('4');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSS PARTS
// ═══════════════════════════════════════════════════════════════════════════════

export const CSSParts: Story = {
  name: 'CSS Parts Available',
  render: () => html`
    <style>
      qti-choice-interaction::part(prompt) {
        font-weight: bold;
        color: navy;
      }
      qti-choice-interaction::part(slot) {
        padding: 16px;
        background: #f9f9f9;
      }
      qti-choice-interaction::part(message) {
        color: red;
        font-style: italic;
      }
    </style>
    <qti-choice-interaction name="RESPONSE" min-choices="1" max-choices="4" data-testid="interaction">
      <qti-prompt slot="prompt">Styled Prompt</qti-prompt>
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);

    // Verify parts exist in shadow DOM
    const promptPart = interaction.shadowRoot?.querySelector('[part="prompt"]');
    const slotPart = interaction.shadowRoot?.querySelector('[part="slot"]');
    const messagePart = interaction.shadowRoot?.querySelector('[part="message"]');

    expect(promptPart).toBeTruthy();
    expect(slotPart).toBeTruthy();
    expect(messagePart).toBeTruthy();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSS STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const CSSStatesChecked: Story = {
  name: 'CSS States: --checked',
  render: () => html`
    <style>
      qti-simple-choice:state(--checked) {
        background: lightgreen;
        border: 2px solid green;
      }
    </style>
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByText('Option A');

    // Click to select
    choiceA.click();
    await new Promise(r => setTimeout(r, 50));

    // Verify state is set
    expect((choiceA as any).internals.states.has('--checked')).toBe(true);
  }
};

export const CSSStatesRadioCheckbox: Story = {
  name: 'CSS States: radio/checkbox',
  render: () => html`
    <style>
      qti-simple-choice:state(radio)::before {
        content: '○ ';
      }
      qti-simple-choice:state(checkbox)::before {
        content: '☐ ';
      }
      qti-simple-choice:state(--checked):state(radio)::before {
        content: '● ';
      }
      qti-simple-choice:state(--checked):state(checkbox)::before {
        content: '☑ ';
      }
    </style>
    <div style="display: flex; gap: 32px;">
      <qti-choice-interaction name="RESPONSE1" max-choices="1" data-testid="interaction">
        <qti-prompt>Radio (max=1)</qti-prompt>
        <qti-simple-choice identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      </qti-choice-interaction>
      <qti-choice-interaction name="RESPONSE2" max-choices="4">
        <qti-prompt>Checkbox (max>1)</qti-prompt>
        <qti-simple-choice identifier="X">Option X</qti-simple-choice>
        <qti-simple-choice identifier="Y">Option Y</qti-simple-choice>
      </qti-choice-interaction>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { interaction } = getElements(canvasElement);
    const choiceA = canvas.getByText('Option A');
    const choiceX = canvas.getByText('Option X');

    // Radio choices should have radio state
    expect((choiceA as any).internals.states.has('radio')).toBe(true);

    // Checkbox choices should have checkbox state
    expect((choiceX as any).internals.states.has('checkbox')).toBe(true);
  }
};
