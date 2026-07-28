import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiInlineChoiceInteraction } from '../qti-inline-choice-interaction';

type Story = StoryObj<QtiInlineChoiceInteraction>;

/**
 * ## API Stories
 *
 * Tests for the public API: properties, attributes and rendered internals.
 *
 * `data-prompt` is a declared property rather than a `dataset` read, so these pin both halves
 * of that contract: the fallback chain (`data-prompt` → `configContext.inlineChoicePrompt` →
 * `select`) and the fact that changing it re-renders.
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: '08 Inline Choice/API',
  tags: ['api', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const choices = html`
  <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
  <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
  <qti-inline-choice identifier="Y">York</qti-inline-choice>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiInlineChoiceInteraction>('interaction');
  return { canvas, interaction };
};

/**
 * The text shown in the closed combobox — the prompt until a choice is picked.
 *
 * Queried by part rather than by role: the trigger and every option in this shadow root are
 * all `button`s, so a role query cannot single the trigger out, and `part="value"` is the
 * documented styling contract for exactly this text. Same exception the sibling stories in
 * this package already take.
 */
const promptText = (interaction: QtiInlineChoiceInteraction) =>
  interaction.shadowRoot?.querySelector('[part~="value"]')?.textContent?.trim();

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT — data-prompt, config fallback, default
// ═══════════════════════════════════════════════════════════════════════════════

export const PromptFromDataPrompt: Story = {
  name: 'Prompt: data-prompt attribute',
  render: () => html`
    <qti-inline-choice-interaction
      response-identifier="RESPONSE"
      data-prompt="kies het juiste antwoord…"
      data-testid="interaction"
    >
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);
    await interaction.updateComplete;

    expect(promptText(interaction)).toBe('kies het juiste antwoord…');
    expect(interaction.dataPrompt).toBe('kies het juiste antwoord…');
  }
};

export const PromptDefault: Story = {
  name: 'Prompt: falls back to "select"',
  render: () => html`
    <qti-inline-choice-interaction response-identifier="RESPONSE" data-testid="interaction">
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);
    await interaction.updateComplete;

    expect(promptText(interaction)).toBe('select');
  }
};

export const PromptIsLive: Story = {
  name: 'Prompt: data-prompt re-renders when changed',
  render: () => html`
    <qti-inline-choice-interaction response-identifier="RESPONSE" data-prompt="first" data-testid="interaction">
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);
    await interaction.updateComplete;

    expect(promptText(interaction)).toBe('first');

    // Reading `dataset.prompt` at render time never picked this up — the options were only
    // rebuilt when the slotted choices changed.
    interaction.setAttribute('data-prompt', 'second');
    await interaction.updateComplete;

    expect(promptText(interaction)).toBe('second');
  }
};

export const PromptSurvivesSelection: Story = {
  name: 'Prompt: still the empty option after a choice is picked',
  render: () => html`
    <qti-inline-choice-interaction
      response-identifier="RESPONSE"
      data-prompt="kies…"
      response="Y"
      data-testid="interaction"
    >
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getElements(canvasElement);
    await interaction.updateComplete;

    // The trigger shows the selection, not the prompt — but the prompt option remains
    // available so the candidate can clear their answer.
    expect(promptText(interaction)).toBe('York');

    interaction.response = null;
    await interaction.updateComplete;

    expect(promptText(interaction)).toBe('kies…');
  }
};
