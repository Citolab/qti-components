import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiExtendedTextInteraction } from '../qti-extended-text-interaction';

type Story = StoryObj<QtiExtendedTextInteraction>;

/**
 * ## API Stories
 *
 * Tests for the public API: properties, attributes and rendered form internals.
 *
 * The height-resolution stories below pin the precedence chain in `#resolveRows`:
 * `qti-height-lines-*` outranks `expected-lines`, which outranks `expected-length`.
 * All three are QTI-authored height hints that can legitimately appear together, so the
 * order between them is a contract, not an implementation detail.
 */
const meta: Meta<QtiExtendedTextInteraction> = {
  component: 'qti-extended-text-interaction',
  title: '04 Extended Text/API',
  tags: ['api', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const getTextarea = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiExtendedTextInteraction>('interaction');
  // No semantic query exposes `rows`; `getByRole('textbox')` returns the element but the
  // assertion is specifically about the rendered attribute, so the shadow query is the
  // narrowest way to reach it.
  const textarea = interaction.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
  return { interaction, textarea };
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE ATTRIBUTE
// ═══════════════════════════════════════════════════════════════════════════════

export const ResponseFromAttribute: Story = {
  name: 'Response: the response attribute reaches the field',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      response="Zon en wind vullen elkaar aan."
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, textarea } = getTextarea(canvasElement);

    // Regression: `response` was declared `@state`, so Lit never observed the attribute and
    // authored or restored prose rendered as an empty textarea.
    expect(interaction.response).toBe('Zon en wind vullen elkaar aan.');
    expect(textarea.value).toBe('Zon en wind vullen elkaar aan.');
  }
};

export const ResponseKeepsCommas: Story = {
  name: 'Response: prose containing commas survives intact',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      response="Zon, wind en water vullen elkaar aan, dus de mix is betrouwbaarder."
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction } = getTextarea(canvasElement);

    // Why this element must NOT use `responseAttributeConverter`: that codec splits on commas to
    // build multi-value responses, which would turn one essay into three.
    expect(interaction.response).toBe('Zon, wind en water vullen elkaar aan, dus de mix is betrouwbaarder.');
    expect(Array.isArray(interaction.response)).toBe(false);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HEIGHT RESOLUTION — expected-lines, qti-height-lines-*, expected-length
// ═══════════════════════════════════════════════════════════════════════════════

export const RowsFromExpectedLines: Story = {
  name: 'Height: expected-lines drives the row count',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      expected-lines="5"
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { textarea } = getTextarea(canvasElement);

    expect(textarea.rows).toBe(5);
  }
};

export const HeightLinesClassOutranksExpectedLines: Story = {
  name: 'Height: qti-height-lines-* outranks expected-lines',
  render: () => html`
    <qti-extended-text-interaction
      class="qti-height-lines-3"
      response-identifier="RESPONSE"
      expected-lines="15"
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { textarea } = getTextarea(canvasElement);

    expect(textarea.rows).toBe(3);
  }
};

export const ExpectedLinesOutranksExpectedLength: Story = {
  name: 'Height: expected-lines outranks expected-length',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      expected-lines="4"
      expected-length="500"
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { textarea } = getTextarea(canvasElement);

    // 500 characters would estimate 10 rows; the explicit line count wins.
    expect(textarea.rows).toBe(4);
  }
};

export const RowsFromExpectedLengthAlone: Story = {
  name: 'Height: expected-length applies with no class present',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      expected-length="500"
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { textarea } = getTextarea(canvasElement);

    // Regression: the estimate used to live inside the `class` watcher, so it never ran
    // for markup that set no class at all.
    expect(textarea.rows).toBe(10);
  }
};

export const RowsDefaultWithoutHints: Story = {
  name: 'Height: falls back to the default row count',
  render: () => html`
    <qti-extended-text-interaction response-identifier="RESPONSE" data-testid="interaction">
    </qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { textarea } = getTextarea(canvasElement);

    expect(textarea.rows).toBe(5);
  }
};

export const RowsUpdateWhenExpectedLinesChanges: Story = {
  name: 'Height: expected-lines is live',
  render: () => html`
    <qti-extended-text-interaction
      response-identifier="RESPONSE"
      expected-lines="3"
      data-testid="interaction"
    ></qti-extended-text-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, textarea } = getTextarea(canvasElement);

    expect(textarea.rows).toBe(3);

    interaction.setAttribute('expected-lines', '8');
    await interaction.updateComplete;

    expect(textarea.rows).toBe(8);
  }
};
