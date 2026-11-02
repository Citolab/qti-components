import { describe, expect, test } from 'vitest';

import '@qti-components/interactions';

/**
 * The bank lights up (`drag-active`) only when it can take the chip back: a drag that starts in
 * a target. A chip lifted out of the bank itself leaves the bank unlit (CONTRACT.md §3).
 *
 * `initiateDrag` is driven directly: the pointerdown filter rejects untrusted events.
 */
const settle = () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const tokens = (el: Element) => (el.getAttribute('part') ?? '').split(/\s+/);

describe('the bank is drag-active only for a chip that comes from a target', () => {
  test('gap-match', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R">
        <qti-gap-text identifier="a" match-max="1">a</qti-gap-text>
        <qti-gap-text identifier="b" match-max="1">b</qti-gap-text>
        <p>x <qti-gap identifier="g1"></qti-gap> y</p>
      </qti-gap-match-interaction>`;
    await settle();
    const interaction = document.querySelector('qti-gap-match-interaction') as any;
    const bank = interaction.shadowRoot.querySelector("slot[part~='bank']") as HTMLElement;
    const gap = document.querySelector('[identifier="g1"]') as HTMLElement & { internals: ElementInternals };
    const chipA = document.querySelector('[identifier="a"]') as HTMLElement;

    interaction.initiateDrag(chipA, 0, 0);
    expect(document.documentElement.style.cursor, 'a grabbing hand for the whole drag').toBe('grabbing');
    expect(tokens(bank), 'from the bank: the bank stays unlit').not.toContain('drag-active');
    expect(gap.internals.states.has('drag-active'), 'the target lights up').toBe(true);
    interaction.handleInvalidDrop(chipA);
    interaction.deactivateAllDroppables();
    interaction.resetDragState();
    expect(tokens(bank)).not.toContain('drag-active');
    expect(gap.internals.states.has('drag-active'), 'cleared when the drag ends').toBe(false);
    expect(document.documentElement.style.cursor, 'the page gets its cursor back').toBe('');

    interaction.handleDrop(chipA, gap);
    await settle();
    const placed = (gap.shadowRoot?.querySelector('[identifier="a"]') ??
      gap.querySelector('[identifier="a"]')) as HTMLElement;
    expect(placed, 'the chip is placed').toBeTruthy();

    interaction.initiateDrag(placed, 0, 0);
    expect(tokens(bank), 'from a target: the bank can take it back').toContain('drag-active');
    expect(gap.internals.states.has('full'), 'the source target is no longer full while its chip is in flight').toBe(
      false
    );
    interaction.deactivateAllDroppables();
    interaction.resetDragState();
    expect(tokens(bank)).not.toContain('drag-active');
  });
});
