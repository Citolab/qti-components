import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

/**
 * Characterization tests for drag-and-drop.
 *
 * These pin the CURRENT behaviour of all five drag-drop interactions before the data flow is
 * inverted (response as source of truth, drop targets rendering their own chips from a reactive
 * context). They are the contract that rewrite must not break.
 *
 * They drive `handleDrop` / `handleInvalidDrop` / `reset` directly rather than synthesising
 * pointer events: the mixin's pointerdown filter rejects untrusted events (`if (!e.isTrusted)
 * return false`), so synthetic pointer streams never reach the drag logic.
 *
 * What is deliberately asserted:
 *   - the response string produced by a drop  (the DOM is currently its source)
 *   - the source chip's `placeholder` state   (matchMax exhaustion)
 *   - the clone landing in the drop target    (today: cloneNode + appendChild)
 *   - reset() clearing both response and DOM
 */

const settle = () => new Promise(r => setTimeout(r, 300));

type Chip = HTMLElement & { internals: ElementInternals };
const el = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const byId = (identifier: string) => el<Chip>(`[identifier="${identifier}"]`);

describe('drag-drop characterization — response is currently derived from the DOM', () => {
  test('order-interaction: drops build a positional, comma-joined response', async () => {
    document.body.innerHTML = `
      <qti-order-interaction response-identifier="R">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
        <qti-simple-choice identifier="B">B</qti-simple-choice>
      </qti-order-interaction>`;
    await settle();

    const interaction = el<any>('qti-order-interaction');
    const drops = Array.from(interaction.shadowRoot.querySelectorAll(`[part~='drop']`)) as HTMLElement[];
    expect(drops.map(d => d.getAttribute('identifier'))).toEqual(['droplist0', 'droplist1']);

    interaction.handleDrop(byId('B'), drops[0]);
    await settle();
    expect(interaction.response, 'slot 1 filled, slot 2 empty').toBe('B,');

    interaction.handleDrop(byId('A'), drops[1]);
    await settle();
    expect(interaction.response).toBe('B,A');

    // both sources are spent
    expect(byId('A').internals.states.has('placeholder')).toBe(true);
    expect(byId('B').internals.states.has('placeholder')).toBe(true);

    // the clone lands inside the shadow drop target
    expect(drops[0].querySelectorAll('qti-simple-choice')).toHaveLength(1);
  });

  test('gap-match: response is "<dragId> <dropId>", and reset clears response and DOM', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R">
        <qti-gap-text identifier="ht_zuur" match-max="1">zuur</qti-gap-text>
        <qti-gap-text identifier="ht_bas" match-max="1">bas</qti-gap-text>
        <p>x <qti-gap identifier="gap_low"></qti-gap> y <qti-gap identifier="gap_high"></qti-gap></p>
      </qti-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');
    const gapLow = el<HTMLElement>('[identifier="gap_low"]');

    interaction.handleDrop(byId('ht_zuur'), gapLow);
    await settle();

    expect(interaction.response).toBe('ht_zuur gap_low');
    expect(byId('ht_zuur').internals.states.has('placeholder'), 'matchMax=1 exhausted').toBe(true);
    expect(byId('ht_bas').internals.states.has('placeholder'), 'untouched chip unaffected').toBe(false);
    expect(gapLow.querySelectorAll('qti-gap-text'), 'a clone is appended into the gap').toHaveLength(1);

    interaction.reset();
    await settle();
    expect(interaction.response).toBe('');
    expect(gapLow.querySelectorAll('qti-gap-text')).toHaveLength(0);
  });

  test('associate: a filled left/right pair becomes one "<a> <b>" association', async () => {
    document.body.innerHTML = `
      <qti-associate-interaction response-identifier="R" max-associations="2">
        <qti-simple-associable-choice identifier="A" match-max="1">A</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="B" match-max="1">B</qti-simple-associable-choice>
      </qti-associate-interaction>`;
    await settle();

    const interaction = el<any>('qti-associate-interaction');
    const drops = Array.from(interaction.shadowRoot.querySelectorAll(`[part~='drop']`)) as HTMLElement[];
    expect(drops.map(d => d.getAttribute('identifier'))).toEqual(['droplist0_left', 'droplist0_right']);

    interaction.handleDrop(byId('A'), drops[0]);
    await settle();
    interaction.handleDrop(byId('B'), drops[1]);
    await settle();

    expect(interaction.response).toBe('A B');
  });

  test('match: dropping a source onto a target yields "<source> <target>" and marks the target filled', async () => {
    document.body.innerHTML = `
      <qti-match-interaction response-identifier="R">
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="S1" match-max="1">s1</qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="T1" match-max="1">t1</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-match-interaction');
    const target = byId('T1');

    interaction.handleDrop(byId('S1'), target);
    await settle();

    expect(interaction.response).toBe('S1 T1');
    // `data-has-drop` was set here and nowhere else. An occupied target now carries `:state(filled)`
    // when it is a custom element, and a `filled` part token when it is a plain shadow div.
    expect(target.internals.states.has('filled'), 'occupied target is flagged').toBe(true);
    expect(byId('S1').internals.states.has('placeholder')).toBe(true);
  });

  test('graphic-gap-match: a gap-img dropped on a hotspot yields "<dragId> <hotspotId>"', async () => {
    document.body.innerHTML = `
      <qti-graphic-gap-match-interaction response-identifier="R">
        <img slot="image" alt="" />
        <qti-gap-img identifier="G1" match-max="1"><img alt="" /></qti-gap-img>
        <qti-associable-hotspot coords="0,0,10,10" identifier="H1" match-max="1" shape="rect"></qti-associable-hotspot>
      </qti-graphic-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-graphic-gap-match-interaction');
    interaction.handleDrop(byId('G1'), byId('H1'));
    await settle();

    expect(interaction.response).toBe('G1 H1');
    // qti-gap-img has ElementInternals (it is the one draggable without ActiveElementMixin)
    expect(byId('G1').internals.states.has('placeholder')).toBe(true);
  });

  test('an invalid drop clears the chip states, returning it to the bank', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R">
        <qti-gap-text identifier="ht_zuur" match-max="1">zuur</qti-gap-text>
        <p><qti-gap identifier="gap_low"></qti-gap></p>
      </qti-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');
    const chip = byId('ht_zuur');

    // simulate the source being hidden mid-drag, then the drag ending nowhere
    chip.internals.states.add('dragging');
    interaction.handleInvalidDrop(chip);
    await settle();

    expect(chip.internals.states.has('dragging')).toBe(false);
    expect(chip.internals.states.has('placeholder')).toBe(false);
  });

  test('a spent chip is not a drag source — keyboard nav and pointerdown both skip it', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R">
        <qti-gap-text identifier="ht_zuur" match-max="1">zuur</qti-gap-text>
        <p><qti-gap identifier="gap_low"></qti-gap></p>
      </qti-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');
    interaction.handleDrop(byId('ht_zuur'), el<HTMLElement>('[identifier="gap_low"]'));
    await settle();

    // `isDragChipHidden` gates both the pointerdown filter and the keyboard draggables list
    const chip = byId('ht_zuur');
    expect(chip.internals.states.has('placeholder')).toBe(true);
    expect(chip.style.opacity, 'presentation is not written inline any more').toBe('');
  });
});
