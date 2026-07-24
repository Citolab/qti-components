import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

/**
 * Drag/drop role states are owned by the drag-drop mixins.
 *
 * `drag` and `drop` are custom states (never ARIA roles). The mixin assigns them from its own
 * tracked draggable/droppable sets, including positional cases where the same tag is source in
 * one place and target in another.
 */

type Stateful = HTMLElement & { internals: ElementInternals; updateComplete?: Promise<unknown> };

const settle = async () => {
  await new Promise(r => setTimeout(r, 0));
  const pending = Array.from(document.querySelectorAll('*'))
    .map(e => (e as Stateful).updateComplete)
    .filter(Boolean);
  await Promise.all(pending);
  await new Promise(r => setTimeout(r, 0));
};

const hasDrag = (el: Element | null) => !!el && (el as Stateful).internals.states.has('drag');
const hasDrop = (el: Element | null) => !!el && (el as Stateful).internals.states.has('drop');

describe(':state(drag) from draggablesSelector', () => {
  test('order-interaction: every qti-simple-choice is a drag, and takes no ARIA role', async () => {
    document.body.innerHTML = `
      <qti-order-interaction response-identifier="R">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
        <qti-simple-choice identifier="B">B</qti-simple-choice>
      </qti-order-interaction>`;
    await settle();

    const choices = Array.from(document.querySelectorAll('qti-simple-choice')) as Stateful[];
    expect(choices).toHaveLength(2);
    for (const c of choices) {
      expect(c.internals.states.has('drag')).toBe(true);
      // `drag` is not a valid ARIA role
      expect(c.internals.role).toBeNull();
    }
  });

  test('choice-interaction: a choice is a radio, never a drag', async () => {
    document.body.innerHTML = `
      <qti-choice-interaction response-identifier="R" max-choices="1">
        <qti-simple-choice identifier="A">A</qti-simple-choice>
      </qti-choice-interaction>`;
    await settle();

    const choice = document.querySelector('qti-simple-choice') as Stateful;
    expect(choice.internals.states.has('radio')).toBe(true);
    expect(choice.internals.states.has('drag')).toBe(false);
  });

  test('match-interaction: sources are drags, drop targets are not — same tag, different answer', async () => {
    document.body.innerHTML = `
      <qti-match-interaction response-identifier="R">
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="S1" match-max="1">source 1</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="S2" match-max="1">source 2</qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="T1" match-max="1">target 1</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>`;
    await settle();

    const sets = document.querySelectorAll('qti-simple-match-set');
    const sources = Array.from(sets[0].querySelectorAll('qti-simple-associable-choice'));
    const targets = Array.from(sets[1].querySelectorAll('qti-simple-associable-choice'));

    expect(sources).toHaveLength(2);
    expect(targets).toHaveLength(1);

    for (const s of sources) {
      expect(hasDrag(s)).toBe(true);
      expect(hasDrop(s)).toBe(false);
    }
    // the drop target is the same tag, in the last match-set — it must NOT be a drag
    for (const t of targets) {
      expect(hasDrag(t)).toBe(false);
      expect(hasDrop(t)).toBe(true);
    }
  });

  test('match-interaction in tabular mode: nothing is a drag — it is a radio/checkbox grid', async () => {
    document.body.innerHTML = `
      <qti-match-interaction response-identifier="R" class="qti-match-tabular">
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="S1" match-max="1">source 1</qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="T1" match-max="1">target 1</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>`;
    await settle();

    const all = Array.from(document.querySelectorAll('qti-simple-associable-choice'));
    expect(all).toHaveLength(2);
    for (const el of all) {
      expect(hasDrag(el)).toBe(false);
      expect(hasDrop(el)).toBe(false);
    }
  });

  test('a chip with no interaction above it is not a drag — standalone use', async () => {
    document.body.innerHTML = `<qti-simple-choice identifier="A">A</qti-simple-choice>`;
    await settle();
    expect(hasDrag(document.querySelector('qti-simple-choice'))).toBe(false);
  });
});
