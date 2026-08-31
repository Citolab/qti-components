import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

import { isDropFilled } from './utils/drag-drop.utils';

/**
 * "This drop target holds a chip" has two spellings, and it has to.
 *
 * `qti-gap`, `qti-associable-hotspot` and `qti-simple-associable-choice` are custom elements with
 * an ElementInternals, so they carry a real `:state(filled)`. Order's and associate's targets are
 * plain `<div part="drop">` inside the interaction's shadow root, and a div has no
 * `attachInternals` — it cannot carry a custom state at all. Those take a `filled` part token,
 * which a theme reaches as `::part(filled)` while `::part(drop)` still matches.
 *
 * This replaced `data-has-drop`, which was set in one branch of `dropDraggableInDroppable` (the
 * `QTI-SIMPLE-ASSOCIABLE-CHOICE` one) and removed in two others — so gaps, hotspots, order slots
 * and associate slots never got it, and nothing noticed because no theme read it.
 *
 * `isDropFilled` reads whichever spelling a given target uses, so callers never have to care.
 */

const settle = () => new Promise(r => setTimeout(r, 300));
const el = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const byId = (identifier: string) => el(`[identifier="${identifier}"]`);

describe('an occupied drop target says so', () => {
  test('a custom-element target carries :state(filled), and drops it on reset', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <p>In the <qti-gap identifier="G1"></qti-gap> of our discontent.</p>
      </qti-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');
    const gap = byId('G1') as HTMLElement & { internals: ElementInternals };

    expect(isDropFilled(gap), 'empty to start').toBe(false);

    interaction.handleDrop(byId('winter'), gap);
    await settle();
    expect(gap.internals.states.has('filled'), 'a real custom state, not an attribute').toBe(true);
    expect(isDropFilled(gap)).toBe(true);

    interaction.reset();
    await settle();
    expect(isDropFilled(gap), 'reset empties it').toBe(false);
  });

  test('a plain shadow div carries a `filled` part token, and keeps `drop`', async () => {
    document.body.innerHTML = `
      <qti-order-interaction response-identifier="R">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
        <qti-simple-choice identifier="B">B</qti-simple-choice>
      </qti-order-interaction>`;
    await settle();

    const interaction = el<any>('qti-order-interaction');
    const drop = interaction.shadowRoot.querySelector(`[part~='drop']`) as HTMLElement;

    expect(drop.tagName, 'order renders a plain div — it cannot hold :state()').toBe('DIV');
    expect(isDropFilled(drop)).toBe(false);

    interaction.handleDrop(byId('A'), drop);
    await settle();

    const tokens = (drop.getAttribute('part') ?? '').split(/\s+/);
    expect(tokens, 'both tokens — ::part(drop) must keep matching').toContain('drop');
    expect(tokens).toContain('filled');
    expect(isDropFilled(drop)).toBe(true);

    interaction.reset();
    await settle();
    expect(isDropFilled(drop), 'reset empties it').toBe(false);
    expect((drop.getAttribute('part') ?? '').split(/\s+/), 'and `drop` survives').toContain('drop');
  });

  test('every light-DOM drop target is hookable as :state(droppable)', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <p>In the <qti-gap identifier="G1"></qti-gap> of our <qti-gap identifier="G2"></qti-gap>.</p>
      </qti-gap-match-interaction>`;
    await settle();

    const gaps = Array.from(document.querySelectorAll('qti-gap'));
    expect(gaps).toHaveLength(2);
    // `qti-gap` is authored in the item body, so no part can name it — a part only exists inside
    // the shadow tree that declares it. The state is the only cross-interaction hook, and it is a
    // state rather than an attribute so a host whose mutation observer reverts unknown attributes
    // (ProseMirror, in the editor) can carry the same marker.
    expect(
      gaps.every(g => (g as HTMLElement & { internals: ElementInternals }).internals.states.has('droppable'))
    ).toBe(true);
  });
});
