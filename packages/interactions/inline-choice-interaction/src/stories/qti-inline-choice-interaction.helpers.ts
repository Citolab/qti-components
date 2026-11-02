import { expect, waitFor } from 'storybook/test';

import type { QtiInlineChoiceInteraction } from '../qti-inline-choice-interaction';

export type InlineChoiceWithInternals = HTMLElement & { internals: ElementInternals };

export const openListboxMenu = async (interaction: QtiInlineChoiceInteraction) => {
  await interaction.updateComplete;
  const root = interaction.shadowRoot;
  if (!root) return null;
  const trigger = root.querySelector<HTMLButtonElement>('[part="trigger"]');
  if (!trigger) return null;
  trigger.click();
  await interaction.updateComplete;
  const menu = await waitFor(() => root.querySelector<HTMLElement>('[part="menu"]'));
  return { menu, trigger };
};

export const getDeepActiveElement = (): Element | null => {
  let current: Element | null = document.activeElement;

  while (current && current instanceof HTMLElement && current.shadowRoot?.activeElement) {
    current = current.shadowRoot.activeElement;
  }

  return current;
};

export const getFocusedInlineChoiceIdentifier = (): string | null => {
  const active = getDeepActiveElement();
  if (active instanceof HTMLElement && active.matches('qti-inline-choice')) {
    return active.getAttribute('identifier');
  }
  return null;
};

export const assertInlineChoiceInternals = (
  interaction: QtiInlineChoiceInteraction,
  expectedSelectedIdentifier: string
) => {
  const choices = Array.from(interaction.querySelectorAll<InlineChoiceWithInternals>('qti-inline-choice'));

  for (const choice of choices) {
    const identifier = choice.getAttribute('identifier') ?? '';
    const isSelected = identifier === expectedSelectedIdentifier;
    expect(choice.internals.role).toBe('option');
    expect(choice.internals.ariaSelected).toBe(isSelected ? 'true' : 'false');
    expect(choice.internals.states.has('checked')).toBe(isSelected);
  }
};
