import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

/**
 * `max-associations` is how many associations the candidate may make.
 *
 * The interaction drew `ceil(choices / 2)` rows — the number of pairs the choices could possibly
 * form — so the attribute changed nothing about the rendering. Six choices always produced three
 * rows, `max-associations="3"` was therefore unexceedable, and its validation could never fail. It
 * also read as a cap on how many drags could be placed, which is a different quantity.
 */

const settle = () => new Promise(r => setTimeout(r, 300));

const build = async (maxAssociations: string, choiceCount: number, minAssociations = '1') => {
  const choices = Array.from(
    { length: choiceCount },
    (_, i) => `<qti-simple-associable-choice identifier="C${i}" match-max="1">C${i}</qti-simple-associable-choice>`
  ).join('');

  document.body.innerHTML = `
    <qti-associate-interaction response-identifier="R"
      max-associations="${maxAssociations}" min-associations="${minAssociations}">
      ${choices}
    </qti-associate-interaction>`;
  await settle();

  return document.querySelector('qti-associate-interaction') as HTMLElement & {
    shadowRoot: ShadowRoot;
    validate(): boolean;
    totalAssociationsFromState(): number;
    handleDrop(chip: HTMLElement, drop: HTMLElement): void;
  };
};

const mount = async (maxAssociations: string, choiceCount: number) =>
  (await build(maxAssociations, choiceCount)).shadowRoot.querySelectorAll('[part~="drop-row"]').length;

const chip = (identifier: string) => document.querySelector(`[identifier="${identifier}"]`) as HTMLElement;
const slot = (interaction: { shadowRoot: ShadowRoot }, id: string) =>
  interaction.shadowRoot.querySelector(`[part~='drop'][identifier="${id}"]`) as HTMLElement;

/** Fill row `row` with two chips, which is one association. */
const associate = async (interaction: any, row: number, left: string, right: string) => {
  interaction.handleDrop(chip(left), slot(interaction, `droplist${row}_left`));
  await settle();
  interaction.handleDrop(chip(right), slot(interaction, `droplist${row}_right`));
  await settle();
};

describe('an associate interaction renders one row per association it allows', () => {
  test('max-associations="3" draws three rows, whatever the choice count', async () => {
    expect(await mount('3', 6), 'six choices').toBe(3);
    expect(await mount('3', 8), 'eight choices — used to draw four').toBe(3);
    expect(await mount('3', 2), 'two choices — used to draw one').toBe(3);
  });

  test('max-associations="2" draws two rows, not three', async () => {
    // The case the old formula got wrong in the direction that matters: it drew three rows for six
    // choices, so a candidate could make three associations when only two were allowed.
    expect(await mount('2', 6)).toBe(2);
  });

  test('max-associations="0" means no limit: every choice may pair with one other', async () => {
    expect(await mount('0', 6)).toBe(3);
    expect(await mount('0', 7), 'an odd choice out still gets a row').toBe(4);
  });
});

/**
 * Validation counts associations, not chips.
 *
 * `totalAssociationsFromState` in the mixin sums placed chips across every target. That is exactly
 * the association count for gap-match — a chip in a gap *is* an association — and exactly double it
 * here, where an association is a left/right pair. So `max-associations="2"`, correctly filled with
 * two pairs, counted four and reported "you've selected too many associations".
 */
describe('an associate interaction validates on associations, not on placed chips', () => {
  test('two full rows under max-associations="2" is valid, and counts 2', async () => {
    const interaction = await build('2', 6);
    await associate(interaction, 0, 'C0', 'C1');
    await associate(interaction, 1, 'C2', 'C3');

    // Four chips are placed. Four is not the number of associations.
    expect(interaction.totalAssociationsFromState(), 'two pairs, not four chips').toBe(2);
    expect(interaction.validate(), 'exactly at max-associations is valid').toBe(true);
  });

  test('a half-filled row is not an association yet', async () => {
    const interaction = await build('2', 6, '2');
    await associate(interaction, 0, 'C0', 'C1');
    // One lone chip in the second row: an association needs both sides.
    interaction.handleDrop(chip('C2'), slot(interaction, 'droplist1_left'));
    await settle();

    expect(interaction.totalAssociationsFromState(), 'three chips, one association').toBe(1);
    expect(interaction.validate(), 'below min-associations=2').toBe(false);
  });

  test('the count validation sees equals the count the response reports', async () => {
    const interaction = await build('3', 6);
    await associate(interaction, 0, 'C0', 'C1');
    await associate(interaction, 1, 'C2', 'C3');
    await associate(interaction, 2, 'C4', 'C5');

    expect(interaction.totalAssociationsFromState()).toBe(3);
    expect((interaction as any).response).toBe('C0 C1,C2 C3,C4 C5');
    expect(interaction.validate(), 'a fully and correctly filled item is valid').toBe(true);
  });
});
