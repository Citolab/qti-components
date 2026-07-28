import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiExtendedTextInteraction } from '../qti-extended-text-interaction';

type Story = StoryObj<QtiExtendedTextInteraction>;

/**
 * ## Config Stories
 *
 * Presentation configuration that changes how the field renders rather than what it accepts.
 *
 * `format` is the QTI vocabulary `plain | preformatted | xhtml`. Only the first two are real
 * here: `xhtml` is accepted so valid QTI is never refused, but the field is a `<textarea>` with
 * no rich-text editor behind it, so it renders as plain and says so once in the console.
 */
const meta: Meta<QtiExtendedTextInteraction> = {
  component: 'qti-extended-text-interaction',
  title: '04 Extended Text/Config',
  tags: ['config', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const getElements = (canvasElement: HTMLElement) => {
  const interaction = within(canvasElement).getByTestId<QtiExtendedTextInteraction>('interaction');
  // The assertion is about a computed style on the shadow textarea; no semantic query reaches it.
  const textarea = interaction.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
  return { interaction, textarea };
};

const isMonospace = (element: Element) => getComputedStyle(element).fontFamily.includes('monospace');

// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT
// ═══════════════════════════════════════════════════════════════════════════════

export const FormatDefaultsToPlain: Story = {
  name: 'format: defaults to plain',
  render: () => html`
    <qti-extended-text-interaction response-identifier="RESPONSE" data-testid="interaction">
    </qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, textarea } = getElements(canvasElement);
    await interaction.updateComplete;

    expect(interaction.format).toBe('plain');
    expect(isMonospace(textarea)).toBe(false);
  }
};

export const FormatPreformattedIsMonospaced: Story = {
  name: 'format: preformatted renders monospaced',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      format="preformatted"
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, textarea } = getElements(canvasElement);
    await interaction.updateComplete;

    // Reflected, so the style hook `:host([format='preformatted'])` can match.
    expect(interaction.getAttribute('format')).toBe('preformatted');
    expect(isMonospace(textarea)).toBe(true);
  }
};

export const FormatXhtmlDowngradesToPlain: Story = {
  name: 'format: xhtml is accepted but renders as plain',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      format="xhtml"
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, textarea } = getElements(canvasElement);
    await interaction.updateComplete;

    // The value is recorded faithfully — an authoring tool round-tripping the item keeps it.
    expect(interaction.format).toBe('xhtml');
    // But nothing about the field changes: there is no rich-text editor to switch on.
    expect(isMonospace(textarea)).toBe(false);
  }
};

export const FormatIsLive: Story = {
  name: 'format: switching re-renders the field',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      format="preformatted"
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, textarea } = getElements(canvasElement);
    await interaction.updateComplete;

    expect(isMonospace(textarea)).toBe(true);

    interaction.format = 'plain';
    await interaction.updateComplete;

    expect(isMonospace(textarea)).toBe(false);
  }
};
