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

const mount = async (maxAssociations: string, choiceCount: number) => {
  const choices = Array.from(
    { length: choiceCount },
    (_, i) => `<qti-simple-associable-choice identifier="C${i}" match-max="1">C${i}</qti-simple-associable-choice>`
  ).join('');

  document.body.innerHTML = `
    <qti-associate-interaction response-identifier="R" max-associations="${maxAssociations}">
      ${choices}
    </qti-associate-interaction>`;
  await settle();

  const interaction = document.querySelector('qti-associate-interaction') as HTMLElement;
  return interaction.shadowRoot!.querySelectorAll('[part~="drop-row"]').length;
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
