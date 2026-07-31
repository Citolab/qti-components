import normalizeCss from 'modern-normalize/modern-normalize.css?inline';
import { expect, test, describe, beforeEach } from 'vitest';

import '@qti-components/interactions';

import itemCss from '../../../../qti-theme/src/item.css?inline';

/**
 * Measurement stability for the two auto-sizing mixins.
 *
 * Every bug these cover looked correct once and only went wrong on repetition, which is why none of
 * them were caught by VRT (one capture), by the invariance spec (one drop), or by looking at the
 * thing. They are all the same shape: a measurement that reads something its own output feeds.
 *
 *   MenuAutoSizeMixin
 *     - The menu is anchored with `min-width: anchor-size(width)`, i.e. never narrower than the
 *       trigger. Measuring the MENU and writing the result back to the trigger — with the chevron's
 *       width added — made the control one chevron wider on every open, without limit.
 *     - Option rows are `display: inline-flex`, so a `max-content` menu lays them all on ONE line
 *       and its intrinsic width is the SUM of every option. Two rows of 53px and 284px measured
 *       343px instead of 284px; the error grows with each option added.
 *     - The chevron rotates as the menu opens, and `getBoundingClientRect()` reports the TRANSFORMED
 *       box, so a chevron caught mid-rotation measured 22.17px instead of 16px and the width
 *       jittered on every open.
 *
 *   DropzoneAutoSizeMixin
 *     - Writing `--qti-dropzone-min-*` changes layout, which the ResizeObserver observes, which
 *       measures again. Without a changed-value guard that is a loop.
 *
 * The assertions are deliberately "do it N times and compare", not "is the number right". A wrong
 * number is a design question; a number that will not sit still is a bug in every design.
 */

const settle = () => new Promise(r => setTimeout(r, 250));

const applyTheme = () => {
  document.querySelectorAll('style[data-substrate]').forEach(s => s.remove());
  for (const css of [normalizeCss, itemCss]) {
    const style = document.createElement('style');
    style.setAttribute('data-substrate', 'citolab');
    style.textContent = css;
    document.head.appendChild(style);
  }
};

type Autosizing = HTMLElement & { updateComplete: Promise<unknown> };

/**
 * Autosizing is opt-in through the config context, and the interaction consumes it. With no provider
 * above it, assigning the field directly is the supported development-time route — see the note on
 * `Interaction.configContext`.
 */
const enableAutosize = (el: HTMLElement) => {
  (el as HTMLElement & { configContext?: Record<string, unknown> }).configContext = {
    inlineChoiceAutosize: true
  };
};

/**
 * Two options with very different widths. The short one is what turns "sum of all rows" into a
 * visibly wrong answer rather than a rounding difference.
 */
const INLINE_CHOICE = `
  <p>In <qti-inline-choice-interaction response-identifier="R" data-testid="ic">
    <qti-inline-choice identifier="S">Ely</qti-inline-choice>
    <qti-inline-choice identifier="L">Kingston upon Kingston-upon-Hull</qti-inline-choice>
  </qti-inline-choice-interaction> today.</p>`;

const GAP_MATCH = `
  <qti-gap-match-interaction response-identifier="R" style="width: 320px">
    <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
    <qti-gap-text identifier="summer" match-max="1">summer</qti-gap-text>
    <p>In the <qti-gap identifier="G1"></qti-gap> of our discontent.</p>
  </qti-gap-match-interaction>`;

const shadow = (host: Element, sel: string) => host.shadowRoot?.querySelector<HTMLElement>(sel) ?? null;

describe('MenuAutoSizeMixin — the measurement does not feed itself', () => {
  beforeEach(applyTheme);

  test('opening and closing the menu repeatedly does not change the trigger width', async () => {
    document.body.innerHTML = INLINE_CHOICE;
    const ic = document.querySelector<Autosizing>('[data-testid="ic"]')!;
    enableAutosize(ic);
    await settle();

    const trigger = shadow(ic, 'button[part="trigger"]')!;
    const menu = shadow(ic, '[part="menu"]')!;
    const width = () => getComputedStyle(trigger).minWidth;

    const first = width();
    expect(first, 'a measurement was written at all').toMatch(/^\d+(\.\d+)?px$/);

    const seen = new Set<string>([first]);
    for (let i = 0; i < 6; i++) {
      menu.showPopover();
      await settle();
      menu.hidePopover();
      await settle();
      seen.add(width());
    }

    // One distinct value across seven readings. Before the fix this grew by the chevron's width
    // every cycle, and jittered by a few px on top from the rotating chevron.
    expect([...seen], 'the trigger width must be identical after every open/close cycle').toEqual([first]);
  });

  test('the width is the widest option, not the sum of the options', async () => {
    document.body.innerHTML = INLINE_CHOICE;
    const ic = document.querySelector<Autosizing>('[data-testid="ic"]')!;
    enableAutosize(ic);
    await settle();

    const trigger = shadow(ic, 'button[part="trigger"]')!;
    const measured = parseFloat(getComputedStyle(trigger).minWidth);

    const rows = Array.from(ic.querySelectorAll<HTMLElement>('qti-inline-choice'));
    expect(rows).toHaveLength(2);

    // The rows live inside the popover, which is `display: none` while closed — a row measured then
    // reports 0 and this comparison would pass vacuously. Open it, exactly as the mixin does.
    const menu = shadow(ic, '[part="menu"]')!;
    menu.showPopover();
    await settle();

    // Each row's own intrinsic width, the same question the mixin asks per row.
    const intrinsic = rows.map(row => {
      const prev = row.style.width;
      row.style.width = 'max-content';
      const w = row.getBoundingClientRect().width;
      row.style.width = prev;
      return w;
    });
    menu.hidePopover();
    await settle();

    expect(Math.min(...intrinsic), 'every row measured something').toBeGreaterThan(0);
    const widest = Math.max(...intrinsic);
    const sum = intrinsic.reduce((a, b) => a + b, 0);

    // The chevron and the menu's own border are added on top, so this is a band rather than an
    // equality — but it has to sit near the widest row and nowhere near the sum.
    expect(measured, 'at least as wide as the widest option').toBeGreaterThanOrEqual(widest);
    expect(
      measured,
      'and not the sum of the options — that is what a max-content menu of inline-flex rows reports'
    ).toBeLessThan(sum);
  });

  test('the measured width lands in the shadow root, never on the host', async () => {
    document.body.innerHTML = INLINE_CHOICE;
    const ic = document.querySelector<Autosizing>('[data-testid="ic"]')!;
    enableAutosize(ic);
    await settle();

    expect(
      shadow(ic, 'button[part="trigger"]')!.style.getPropertyValue('--qti-inline-choice-width'),
      'the trigger carries it'
    ).toMatch(/^\d+(\.\d+)?px$/);

    // A host is light DOM. Writing there is what ProseMirror's mutation observer reverts, and the
    // revert re-triggers the observer that wrote it.
    expect(ic.style.getPropertyValue('--qti-inline-choice-width'), 'the host stays clean').toBe('');
  });

  test('an option added while the menu is closed still resizes the trigger', async () => {
    document.body.innerHTML = INLINE_CHOICE;
    const ic = document.querySelector<Autosizing>('[data-testid="ic"]')!;
    enableAutosize(ic);
    await settle();

    const trigger = shadow(ic, 'button[part="trigger"]')!;
    const menu = shadow(ic, '[part="menu"]')!;
    const before = parseFloat(getComputedStyle(trigger).minWidth);

    const long = document.createElement('qti-inline-choice');
    long.setAttribute('identifier', 'X');
    long.textContent = 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch';
    ic.appendChild(long);
    await settle();

    expect(menu.matches(':popover-open'), 'the menu never opened').toBe(false);
    expect(
      parseFloat(getComputedStyle(trigger).minWidth),
      'a closed popover has no box, so only the content observer can catch this'
    ).toBeGreaterThan(before);

    long.remove();
    await settle();
    expect(parseFloat(getComputedStyle(trigger).minWidth), 'and removing it goes back').toBeCloseTo(before, 0);
  });
});

describe('DropzoneAutoSizeMixin — the measurement converges', () => {
  beforeEach(applyTheme);

  test('re-measuring repeatedly does not move the published minimums', async () => {
    document.body.innerHTML = GAP_MATCH;
    await settle();

    const interaction = document.querySelector<HTMLElement & { updateMinDimensionsForDropZones(): void }>(
      'qti-gap-match-interaction'
    )!;
    const published = () => [
      interaction.style.getPropertyValue('--qti-dropzone-min-height'),
      interaction.style.getPropertyValue('--qti-dropzone-min-width')
    ];

    const first = published();
    expect(first[0], 'a height was measured').toMatch(/^\d+(\.\d+)?px$/);

    const seen = new Set<string>([first.join('|')]);
    for (let i = 0; i < 5; i++) {
      interaction.updateMinDimensionsForDropZones();
      await settle();
      seen.add(published().join('|'));
    }

    expect([...seen], 'measuring again must produce the same answer').toEqual([first.join('|')]);
  });

  test('editing a chip’s text re-measures, with the menu of triggers untouched', async () => {
    document.body.innerHTML = GAP_MATCH;
    await settle();

    const interaction = document.querySelector<HTMLElement>('qti-gap-match-interaction')!;
    const chip = document.querySelector<HTMLElement>('[identifier="winter"]')!;
    const width = () => parseFloat(interaction.style.getPropertyValue('--qti-dropzone-min-width'));

    const before = width();
    chip.textContent = 'winter, and a great deal more besides';
    await settle();

    expect(width(), 'the widest chip grew, so the reservation grows with it').toBeGreaterThan(before);

    chip.textContent = 'winter';
    await settle();
    expect(width(), 'and shrinks back').toBeCloseTo(before, 0);
  });
});
