import { describe, expect, test } from 'vitest';

import '@qti-components/interactions';

import type { QtiChoiceInteraction } from './qti-choice-interaction';

/**
 * When a validity message shows (Interaction.reportValidity): too many at once on a change, too few
 * only after a submit, then every change in full; a reset forgets the submit. Pinned on choice; the
 * rule lives in the base class and every interaction reports through it.
 */
const settle = () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

const mount = async (attrs: string) => {
  document.body.innerHTML = `
    <form>
      <qti-choice-interaction name="R" response-identifier="R" ${attrs}>
        <qti-simple-choice identifier="A">A</qti-simple-choice>
        <qti-simple-choice identifier="B">B</qti-simple-choice>
        <qti-simple-choice identifier="C">C</qti-simple-choice>
      </qti-choice-interaction>
    </form>`;
  await settle();
  const form = document.querySelector('form') as HTMLFormElement;
  const interaction = document.querySelector('qti-choice-interaction') as QtiChoiceInteraction;
  const choice = (id: string) => document.querySelector(`[identifier="${id}"]`) as HTMLElement;
  const message = () => interaction.shadowRoot?.querySelector('#validation-message') as HTMLElement;
  const shown = () => message().style.display === 'block' && message().textContent !== '';
  const click = async (id: string) => {
    choice(id).click();
    await interaction.updateComplete;
  };
  return { form, interaction, click, shown };
};

describe('validation timing', () => {
  test('too few waits for a submit, then every change reports', async () => {
    const { interaction, click, shown } = await mount('min-choices="2" max-choices="3"');

    await click('A');
    expect(interaction.internals.validity.valid, 'invalid below the minimum').toBe(false);
    expect(shown(), 'but no message on a change').toBe(false);

    interaction.reportValidity();
    expect(shown(), 'a submit shows it').toBe(true);

    await click('B');
    expect(shown(), 'meeting the minimum clears it').toBe(false);

    await click('B');
    expect(shown(), 'losing it again brings it back, without a new submit').toBe(true);
  });

  test('too many shows at once', async () => {
    const { interaction, shown } = await mount('max-choices="2"');
    // A candidate cannot click past the maximum (the extra choices disable), so set what a restored
    // or host-written response could hold, and report it as a change.
    (interaction as unknown as { response: string[] }).response = ['A', 'B', 'C'];
    await interaction.updateComplete;
    interaction.validate();
    interaction.reportValidity({ trigger: 'change' });
    expect(interaction.internals.validity.valid, 'invalid over the maximum').toBe(false);
    expect(shown(), 'a max error needs no submit').toBe(true);
  });

  test("a form's submit shows the message; a form reset forgets it", async () => {
    const { form, click, shown } = await mount('min-choices="2"');
    let submitted = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitted = true;
    });

    await click('A');
    form.requestSubmit();
    expect(submitted, 'an invalid interaction blocks the submit').toBe(false);
    expect(shown(), 'the browser validation counts as a submit').toBe(true);

    form.reset();
    expect(shown(), 'reset clears the message').toBe(false);
    await click('A');
    expect(shown(), 'and forgets the submit').toBe(false);
  });

  test('an untouched interaction below its minimum is invalid, silently', async () => {
    const { form, interaction, shown } = await mount('min-choices="1"');
    await interaction.updateComplete;
    expect(interaction.internals.validity.valid, 'invalid before any change').toBe(false);
    expect(shown(), 'and silent').toBe(false);
    let submitted = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitted = true;
    });
    form.requestSubmit();
    expect(submitted, 'so the form does not submit').toBe(false);
    expect(shown(), 'and the submit shows the message').toBe(true);
  });

  test('a restored response that meets the minimum is valid', async () => {
    const { interaction, shown } = await mount('min-choices="1" response="A"');
    await interaction.updateComplete;
    await settle();
    expect(interaction.internals.validity.valid, 'restored A meets min 1').toBe(true);
    interaction.reportValidity();
    expect(shown(), 'nothing to show on end attempt').toBe(false);
  });

  test('a restored gap-match response that meets the minimum is valid', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="G" min-associations="1">
        <qti-gap-text identifier="a" match-max="1">a</qti-gap-text>
        <p>x <qti-gap identifier="g1"></qti-gap></p>
      </qti-gap-match-interaction>`;
    await settle();
    await settle();
    const gm = document.querySelector('qti-gap-match-interaction') as HTMLElement & {
      internals: ElementInternals;
      response: string[] | string;
    };
    // Restored the way a host or the item restores state: through the property.
    gm.response = ['a g1'];
    expect(gm.internals.validity.valid, 'restored association meets min 1').toBe(true);
  });

  test("in 'both' mode the element's own native report is not a submit", async () => {
    const { interaction, click, shown } = await mount('min-choices="2"');
    interaction.configContext = { validationDisplayMode: 'both' } as never;
    await click('A');
    await click('B');
    await click('A');
    expect(shown(), 'a change below the minimum stays silent in both mode').toBe(false);
  });
});
