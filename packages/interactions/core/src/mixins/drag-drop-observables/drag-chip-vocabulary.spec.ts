import normalizeCss from 'modern-normalize/modern-normalize.css?inline';
import { expect, test, describe, beforeEach } from 'vitest';

import '@qti-components/interactions';

import itemCss from '../../../../../qti-theme/src/item.css?inline';

/**
 * The chip vocabulary is OPT-IN, and this is what holds it together.
 *
 * A drag chip's card — border-box, padding, grab cursor, fill, border, radius, and the grip glyph on
 * its control — used to come from one unscoped rule in qti-states.css that claimed every
 * `:state(drag)` element in the document. Because it was a universal claim it needed a carve-out,
 * and graphic-gap-match got one: its chips are photographs sitting on a picture, so a card would
 * cover the image beneath the hotspot. That exclusion had to be written in qti-states.css twice
 * (chip and grip) and mirrored twice more in the Kennisnet overlay.
 *
 * It is now declared once per drag-drop interaction, in that interaction's own stylesheet.
 * Graphic-gap-match simply declares none, so there is no exception to write anywhere — the
 * blacklist became an allowlist.
 *
 * That trade has one cost, and it is the reason this file exists: a NEW drag-drop interaction, or
 * one whose selectors stop matching, no longer gets the card for free. It gets nothing, silently.
 * Nothing else catches that — the VRT corpus has no graphic-gap-match or associate story at all,
 * and the invariance suite measures that a chip's box is CONSISTENT, not that it is painted.
 *
 * So: every interaction that opts in must actually get the card, and graphic-gap-match must
 * actually not. Both directions are asserted, because both are load-bearing.
 *
 * (Found by measurement, not by reading: qti-associate-interaction's own `@mixin drag` rules all
 * target `::part(drag)`, the PLACED chip. Its light-DOM bank chip drew fill, radius, cursor and text
 * colour from the removed global rule and nothing else, so moving the rule without giving associate
 * its own block turned those chips transparent, square and un-grabbable.)
 */

const settle = () => new Promise(r => setTimeout(r, 300));

const applyTheme = () => {
  document.querySelectorAll('style[data-chip-vocab]').forEach(s => s.remove());
  for (const css of [normalizeCss, itemCss]) {
    const style = document.createElement('style');
    style.setAttribute('data-chip-vocab', '');
    style.textContent = css;
    document.head.appendChild(style);
  }
};

const byId = (identifier: string) => document.querySelector(`[identifier="${identifier}"]`) as HTMLElement;

/** The grip is drawn as a ::before on the chip's own `control` part, inside its shadow root. */
const gripOf = (chip: HTMLElement) => {
  const control = chip.shadowRoot?.querySelector('[part~="control"]');
  if (!control) return null;
  const before = getComputedStyle(control, '::before');
  return { content: before.content, mask: before.getPropertyValue('mask-image') };
};

const OPT_IN = [
  {
    name: 'gap-match',
    chip: 'winter',
    html: `
      <qti-gap-match-interaction response-identifier="R" style="width: 320px">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <p>In the <qti-gap identifier="G1"></qti-gap> of our discontent.</p>
      </qti-gap-match-interaction>`
  },
  {
    name: 'order',
    chip: 'A',
    html: `
      <qti-order-interaction response-identifier="R" style="width: 480px">
        <qti-simple-choice identifier="A">Hypothese formuleren</qti-simple-choice>
        <qti-simple-choice identifier="B">Data verzamelen</qti-simple-choice>
      </qti-order-interaction>`
  },
  {
    name: 'associate',
    chip: 'A',
    html: `
      <qti-associate-interaction response-identifier="R" max-associations="2" style="width: 480px">
        <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="B" match-max="1">Brutus</qti-simple-associable-choice>
      </qti-associate-interaction>`
  },
  {
    name: 'match',
    chip: 'S1',
    html: `
      <qti-match-interaction response-identifier="R" style="width: 480px">
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="S1" match-max="1">Source one</qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="T1" match-max="1">Target one</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>`
  }
];

const GRAPHIC_GAP_MATCH = `
  <qti-graphic-gap-match-interaction response-identifier="R">
    <img slot="image" alt="" width="200" height="120" />
    <qti-gap-text identifier="G1" match-max="1">winter</qti-gap-text>
    <qti-associable-hotspot coords="0,0,60,40" identifier="H1" match-max="1" shape="rect"></qti-associable-hotspot>
  </qti-graphic-gap-match-interaction>`;

describe('drag chip vocabulary', () => {
  beforeEach(() => applyTheme());

  test.each(OPT_IN.map(i => [i.name, i] as const))(
    '%s: its bank chip is painted as a card, from its own stylesheet',
    async (_name, spec) => {
      document.body.innerHTML = spec.html;
      await settle();

      const chip = byId(spec.chip);
      const cs = getComputedStyle(chip);

      expect(cs.boxSizing, 'a chip is border-box — the floating clone depends on it').toBe('border-box');
      expect(cs.cursor, 'a chip advertises that it can be picked up').toBe('grab');
      expect(cs.backgroundColor, 'a chip has an opaque fill, not the page behind it').not.toBe('rgba(0, 0, 0, 0)');
      expect(parseFloat(cs.borderTopWidth), 'a chip has a border').toBeGreaterThan(0);
      expect(parseFloat(cs.borderTopLeftRadius), 'a chip has rounded corners').toBeGreaterThan(0);
      expect(parseFloat(cs.paddingLeft), 'a chip has padding').toBeGreaterThan(0);

      const grip = gripOf(chip);
      expect(grip, 'a chip exposes a control part to hang its grip on').not.toBeNull();
      expect(grip!.content, 'the grip glyph is drawn').toBe('""');
      expect(grip!.mask, 'the grip is a masked glyph, not a character').toContain('url(');
    }
  );

  /**
   * The floating clone has to be themed too, and it is the case every other test misses.
   *
   * This mounts the item the way the SHIPPED component does — item.css in `adoptedStyleSheets` on a
   * shadow root (item-container.ts) — rather than as a document stylesheet, which is only how
   * .storybook/preview.ts happens to load it. The difference is the whole test: a stylesheet sees
   * one tree, so a clone parked on document.body was somewhere the theme could not reach. Its paint
   * survived anyway (createDragClone copies the source's computed style inline), but a ::before
   * cannot be copied that way, so the grip silently vanished the instant a chip was picked up —
   * visible in a real item, invisible in Storybook, and invisible to VRT, which never captures
   * mid-drag.
   *
   * Fixed by appending the clone to the interaction's own root. Assert on the GRIP specifically:
   * it is the one property that the inline copy cannot fake, so it is the only honest witness that
   * CSS is genuinely reaching the clone. (Every other property would pass whether the fix were in
   * place or not — inline styles beat any author rule, so the card is copied, not cascaded.)
   *
   * And assert it on the same NODE the resting chip uses, ::part(control)::before, not on the host:
   * a chip must not move its handle at the moment it is picked up.
   */
  test('a drag clone is themed even when the theme lives in a shadow root', async () => {
    document.querySelectorAll('style[data-chip-vocab]').forEach(s => s.remove());
    document.body.innerHTML = '';

    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(itemCss);
    shadow.adoptedStyleSheets = [sheet];
    shadow.innerHTML = OPT_IN[0].html; // gap-match
    await settle();

    const interaction = shadow.firstElementChild as HTMLElement & {
      createDragClone(el: HTMLElement, rect: DOMRect): HTMLElement;
    };
    const source = shadow.querySelector('[identifier="winter"]') as HTMLElement;
    const clone = interaction.createDragClone(source, source.getBoundingClientRect());
    await settle();

    expect(clone.parentNode, 'the clone lands in the interaction’s root, not document.body').not.toBe(document.body);

    // The grip must be on the clone's own `control` part — the same node the resting chip draws it
    // on — and must be identical to the source's, so picking a chip up does not move its handle.
    const sourceGrip = gripOf(source);
    const cloneGrip = gripOf(clone);
    expect(cloneGrip, 'the clone exposes the same control part the chip does').not.toBeNull();
    expect(cloneGrip!.content, 'the clone keeps the grip glyph the chip had').toBe('""');
    expect(cloneGrip!.mask, 'and it is the masked grip, not stray content').toContain('url(');
    expect(cloneGrip, 'a chip must not move its handle when it is picked up').toEqual(sourceGrip);

    // ...and NOT on the host as well, or the clone would sprout a second handle.
    expect(getComputedStyle(clone, '::before').content, 'no duplicate grip on the clone host').toBe('none');

    // `position: fixed` must still resolve against the viewport after the move.
    clone.style.left = '100px';
    clone.style.top = '50px';
    const rect = clone.getBoundingClientRect();
    expect(Math.round(rect.left), 'a fixed clone still positions against the viewport').toBe(100);
    expect(Math.round(rect.top), 'a fixed clone still positions against the viewport').toBe(50);

    clone.remove();
  });

  /**
   * The other half, and the one the removed exclusions used to state. A ggm chip is a picture on a
   * picture: give it a card and it covers the image its hotspot sits on. It stays out by declaring
   * no vocabulary block, so this fails the moment anything reintroduces a cross-interaction rule.
   */
  test('graphic-gap-match: its chips take no card and no grip', async () => {
    document.body.innerHTML = GRAPHIC_GAP_MATCH;
    await settle();

    const chip = byId('G1');
    const cs = getComputedStyle(chip);

    expect(cs.backgroundColor, 'a ggm chip must not fill over the image beneath it').toBe('rgba(0, 0, 0, 0)');
    expect(parseFloat(cs.borderTopWidth), 'a ggm chip draws no border').toBe(0);
    expect(parseFloat(cs.borderTopLeftRadius), 'a ggm chip is not a rounded card').toBe(0);
    expect(parseFloat(cs.paddingLeft), 'a ggm chip is its picture and nothing else').toBe(0);

    const grip = gripOf(chip);
    expect(grip?.content ?? 'none', 'a ggm chip shows no drag handle').toBe('none');
  });
});
