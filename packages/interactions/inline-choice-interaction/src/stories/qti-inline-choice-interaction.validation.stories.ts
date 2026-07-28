import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiInlineChoiceInteraction } from '../qti-inline-choice-interaction';

type Story = StoryObj<QtiInlineChoiceInteraction>;

/**
 * ## Validation Stories
 *
 * `required` is what decides whether an empty response is valid. QTI defaults it to false, so
 * an untouched dropdown is a valid empty response — the same rule `ChoicesMixin` applies while
 * `min-choices` is 0. These stories pin both sides of that default, because before `required`
 * existed this interaction invalidated every unanswered dropdown.
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: '08 Inline Choice/Validation',
  tags: ['validation', 'iol']
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

const getInteraction = (canvasElement: HTMLElement) =>
  within(canvasElement).getByTestId<QtiInlineChoiceInteraction>('interaction');

// ═══════════════════════════════════════════════════════════════════════════════
// REQUIRED
// ═══════════════════════════════════════════════════════════════════════════════

export const EmptyIsValidByDefault: Story = {
  name: 'required: unanswered is valid when not required',
  render: () => html`
    <qti-inline-choice-interaction response-identifier="RESPONSE" data-testid="interaction">
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const interaction = getInteraction(canvasElement);
    await interaction.updateComplete;

    expect(interaction.required).toBe(false);
    expect(interaction.validate()).toBe(true);
  }
};

export const EmptyIsInvalidWhenRequired: Story = {
  name: 'required: unanswered is invalid when required="true"',
  render: () => html`
    <qti-inline-choice-interaction response-identifier="RESPONSE" required="true" data-testid="interaction">
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const interaction = getInteraction(canvasElement);
    await interaction.updateComplete;

    expect(interaction.required).toBe(true);
    expect(interaction.validate()).toBe(false);
  }
};

export const AnsweredIsValidWhenRequired: Story = {
  name: 'required: a selection satisfies required',
  render: () => html`
    <qti-inline-choice-interaction
      response-identifier="RESPONSE"
      required="true"
      response="Y"
      data-testid="interaction"
    >
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const interaction = getInteraction(canvasElement);
    await interaction.updateComplete;

    expect(interaction.validate()).toBe(true);
  }
};

export const RequiredFalseReadsAsFalse: Story = {
  name: 'required: required="false" is false, not merely present',
  render: () => html`
    <qti-inline-choice-interaction response-identifier="RESPONSE" required="false" data-testid="interaction">
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const interaction = getInteraction(canvasElement);
    await interaction.updateComplete;

    // Lit's default Boolean converter tests for presence, so it would report `true` here.
    // QTI writes the value out explicitly, so the custom converter has to read it.
    expect(interaction.required).toBe(false);
    expect(interaction.validate()).toBe(true);
  }
};

export const BareRequiredIsTrue: Story = {
  name: 'required: a bare `required` attribute is accepted',
  render: () => html`
    <qti-inline-choice-interaction response-identifier="RESPONSE" required data-testid="interaction">
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const interaction = getInteraction(canvasElement);
    await interaction.updateComplete;

    expect(interaction.required).toBe(true);
    expect(interaction.validate()).toBe(false);
  }
};

export const MinChoicesDemandsAnAnswer: Story = {
  name: 'required: min-choices="1" is an equivalent spelling',
  render: () => html`
    <qti-inline-choice-interaction response-identifier="RESPONSE" min-choices="1" data-testid="interaction">
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const interaction = getInteraction(canvasElement);
    await interaction.updateComplete;

    // The conformance suite (Advanced/Q12-inline-choice/inline-choice-sv-3) expresses
    // "must answer" this way rather than with `required`.
    expect(interaction.required).toBe(false);
    expect(interaction.validate()).toBe(false);
  }
};

export const RequiredIsLive: Story = {
  name: 'required: toggling revalidates',
  render: () => html`
    <qti-inline-choice-interaction response-identifier="RESPONSE" data-testid="interaction">
      ${choices}
    </qti-inline-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const interaction = getInteraction(canvasElement);
    await interaction.updateComplete;

    expect(interaction.validate()).toBe(true);

    interaction.required = true;
    await interaction.updateComplete;

    expect(interaction.validate()).toBe(false);
  }
};
