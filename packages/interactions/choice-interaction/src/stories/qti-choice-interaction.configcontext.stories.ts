import { html } from 'lit';
import { expect, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * ## Config Context Stories
 *
 * Tests for behavior changes controlled through a config-context wrapper in test scenarios.
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '02 Choice Interaction/Config Context',
  tags: ['configuration', 'specific', 'iol']
};
export default meta;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  return { canvas, interaction };
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG CONTEXT WRAPPER (TEST-ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export const DisableAfterMaxReachedEnabledViaConfigProvider: Story = {
  name: 'Config Wrapper: disableAfterMaxReached = true',
  render: () => html`
    <qti-config-test-provider .config=${{ disableAfterMaxReached: true }}>
      <qti-choice-interaction name="RESPONSE" max-choices="2" data-testid="interaction">
        <qti-simple-choice identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice identifier="B">Option B</qti-simple-choice>
        <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      </qti-choice-interaction>
    </qti-config-test-provider>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { interaction } = getElements(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Option C');

    await fireEvent.click(choiceA);
    await fireEvent.click(choiceB);

    expect(choiceC.disabled).toBe(true);
    expect(interaction.response).toContain('A');
    expect(interaction.response).toContain('B');
  }
};

export const DisableAfterMaxReachedDisabledViaConfigProvider: Story = {
  name: 'Config Wrapper: disableAfterMaxReached = false',
  render: () => html`
    <qti-config-test-provider .config=${{ disableAfterMaxReached: false }}>
      <qti-choice-interaction name="RESPONSE" max-choices="2" data-testid="interaction">
        <qti-simple-choice identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice identifier="B">Option B</qti-simple-choice>
        <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      </qti-choice-interaction>
    </qti-config-test-provider>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { interaction } = getElements(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Option C');

    // No semantic query can reach this shadow-root status region directly.
    const validationMessage = interaction.shadowRoot?.querySelector('#validation-message') as HTMLElement | null;

    await fireEvent.click(choiceA);
    await fireEvent.click(choiceB);

    expect(choiceC.disabled).toBe(false);

    await fireEvent.click(choiceC);
    await interaction.updateComplete;

    expect(interaction.internals.validity.valid).toBe(false);
    expect(validationMessage?.textContent?.trim().length).toBeGreaterThan(0);

    expect(interaction.response).toContain('A');
    expect(interaction.response).toContain('B');
    expect(interaction.response).toContain('C');

    // Make the response valid again and verify the validation message is cleared.
    await fireEvent.click(choiceC);
    interaction.validate();
    interaction.reportValidity();
    await interaction.updateComplete;

    expect(interaction.internals.validity.valid).toBe(true);
    expect(validationMessage?.textContent).toBe('');
    expect(validationMessage?.style.display).toBe('none');
    expect(interaction.response).toContain('A');
    expect(interaction.response).toContain('B');
    expect(interaction.response).not.toContain('C');
  }
};
