import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

import type { QtiChoiceInteraction } from '@qti-components/interactions';

/**
 * A choice's role comes from `interactionContext`, published by the interaction it sits in.
 * The choice subscribes; the interaction never reaches into its children to set it.
 */

const settle = async (el: Element & { updateComplete?: Promise<unknown> }) => {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
};

const choices = () =>
  Array.from(document.querySelectorAll('qti-simple-choice')) as (HTMLElement & {
    internals: ElementInternals;
  })[];

describe('choice role via interactionContext', () => {
  test('max-choices="1" publishes the radio role to every choice', async () => {
    document.body.innerHTML = `
      <qti-choice-interaction response-identifier="R" max-choices="1">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
        <qti-simple-choice identifier="B">B</qti-simple-choice>
      </qti-choice-interaction>`;
    const interaction = document.querySelector('qti-choice-interaction') as QtiChoiceInteraction;
    await settle(interaction);
    await Promise.all(choices().map(settle));

    for (const choice of choices()) {
      expect(choice.internals.role).toBe('radio');
      expect(choice.internals.states.has('radio')).toBe(true);
      expect(choice.internals.states.has('checkbox')).toBe(false);
    }
  });

  test('max-choices="0" publishes the checkbox role', async () => {
    document.body.innerHTML = `
      <qti-choice-interaction response-identifier="R" max-choices="0">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
      </qti-choice-interaction>`;
    const interaction = document.querySelector('qti-choice-interaction') as QtiChoiceInteraction;
    await settle(interaction);
    await Promise.all(choices().map(settle));

    const [choice] = choices();
    expect(choice.internals.role).toBe('checkbox');
    expect(choice.internals.states.has('checkbox')).toBe(true);
    expect(choice.internals.states.has('radio')).toBe(false);
  });

  test('changing max-choices reactively swaps the role, and drops the stale state', async () => {
    document.body.innerHTML = `
      <qti-choice-interaction response-identifier="R" max-choices="1">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
      </qti-choice-interaction>`;
    const interaction = document.querySelector('qti-choice-interaction') as QtiChoiceInteraction;
    await settle(interaction);
    await Promise.all(choices().map(settle));
    expect(choices()[0].internals.states.has('radio')).toBe(true);

    interaction.maxChoices = 0;
    await settle(interaction);
    await Promise.all(choices().map(settle));

    const [choice] = choices();
    expect(choice.internals.role).toBe('checkbox');
    expect(choice.internals.states.has('checkbox')).toBe(true);
    expect(choice.internals.states.has('radio')).toBe(false);
  });

  test('a choice with no interaction above it takes no role — standalone use must not throw', async () => {
    document.body.innerHTML = `<qti-simple-choice identifier="A">A</qti-simple-choice>`;
    const [choice] = choices();
    await settle(choice);

    expect(choice.internals.role).toBeNull();
    expect(choice.internals.states.has('radio')).toBe(false);
    expect(choice.internals.states.has('checkbox')).toBe(false);
  });
});
