/**
 * Regression for the 1EdTech "Airport Tags" example: a dropped label rendered low, hanging out of
 * the bottom of the hotspot the author drew.
 *
 * `qti-gap-img` skipped `super.connectedCallback()`, so Lit never enabled updating and the element
 * had no shadow root — which made its own `:host { display: flex; align-items: center }` dead code
 * (the source said so). The authored `<img>`/`<object>` was then laid out as an inline replaced
 * element on a text baseline rather than centred, so a 9px picture sat 5px down in its chip with
 * the line box's descender space below it. Measured on this item, before the fix:
 *
 *   hotspot A  27x18   (authored 27x13 — inflated, because the chip measured 18px tall)
 *   image      +7px from the hotspot top, centre 2.5px low, bottom 3px past the authored box
 *
 * The inflated chip measurement also fed --qti-dropzone-min-height, so the hotspot grew past the
 * coords the author gave it: the box on screen was not the box in the item either.
 */
import '@citolab/qti-components';
import itemCss from '../../../qti-theme/src/item.css?inline';
import drag from '../../../../tools/testing/drag';

import type { QtiAssessmentItem } from '@qti-components/elements';

// 1x1 transparent PNG. The chips carry an explicit box, so the bitmap's own size never decides
// the geometry — a 1:1 source under a `height: auto` reset would otherwise render square.
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const CHIP_HEIGHT = 9;

const graphicFor = (tag: 'object' | 'img', w: number, h: number, alt: string) =>
  tag === 'object'
    ? `<object type="image/png" data="${PNG}" width="${w}" height="${h}">${alt}</object>`
    : `<img src="${PNG}" width="${w}" height="${h}" style="width:${w}px;height:${h}px" alt="${alt}"/>`;

const gapImg = (id: string, w: number, tag: 'object' | 'img') =>
  `<qti-gap-img identifier="${id}" match-max="1">${graphicFor(tag, w, CHIP_HEIGHT, id)}</qti-gap-img>`;

// The 1EdTech item's own coords and image sizes.
const airportTags = (tag: 'object' | 'img') => `
<qti-assessment-item identifier="graphicGapfill" title="Airport Tags">
  <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair"></qti-response-declaration>
  <qti-item-body>
    <qti-graphic-gap-match-interaction response-identifier="RESPONSE">
      <qti-prompt>Identify the unlabelled airports.</qti-prompt>
      ${graphicFor(tag, 206, 280, 'UK map')}
      ${gapImg('CBG', 20, tag)}
      ${gapImg('EBG', 18, tag)}
      ${gapImg('EDI', 14, tag)}
      <qti-associable-hotspot identifier="A" match-max="1" shape="rect" coords="12,108,39,121"></qti-associable-hotspot>
      <qti-associable-hotspot identifier="C" match-max="1" shape="rect" coords="66,165,93,178"></qti-associable-hotspot>
    </qti-graphic-gap-match-interaction>
  </qti-item-body>
</qti-assessment-item>`;

describe.each([['object'], ['img']] as const)('graphic gap match, graphic as <%s>', tag => {
  let host: HTMLElement;
  let style: HTMLStyleElement;
  let interaction: HTMLElement;

  beforeEach(async () => {
    style = document.createElement('style');
    style.textContent = itemCss as unknown as string;
    document.head.appendChild(style);

    host = document.createElement('div');
    host.style.cssText = 'position:relative;width:360px;padding:10px;background:#fff';
    document.body.appendChild(host);
    host.innerHTML = airportTags(tag);

    const item = host.querySelector('qti-assessment-item') as QtiAssessmentItem;
    interaction = host.querySelector('qti-graphic-gap-match-interaction') as HTMLElement;
    await item.updateComplete;
    await (interaction as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    await Promise.all(
      Array.from(host.querySelectorAll('img')).map(i => (i.complete ? Promise.resolve() : i.decode().catch(() => {})))
    );
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  afterEach(() => {
    host.remove();
    style.remove();
  });

  const chip = (id: string) => interaction.querySelector(`qti-gap-img[identifier="${id}"]`) as HTMLElement;
  const hotspot = (id: string) =>
    interaction.querySelector(`qti-associable-hotspot[identifier="${id}"]`) as HTMLElement;

  const dropInto = async (chipId: string, hotspotId: string) => {
    await drag(chip(chipId), { to: hotspot(hotspotId), duration: 300 });
    await new Promise(resolve => setTimeout(resolve, 200));
    const placed = hotspot(hotspotId).shadowRoot!.querySelector('qti-gap-img') as HTMLElement;
    return { placed, image: placed?.querySelector(tag) as HTMLElement };
  };

  // The chip's own stylesheet was dead code while the element had no shadow root.
  it('gives every chip the shadow root its centring styles need', () => {
    for (const id of ['CBG', 'EBG', 'EDI']) {
      expect(chip(id).shadowRoot, `${id} has no shadow root`).toBeTruthy();
      expect(getComputedStyle(chip(id)).display).toBe('flex');
    }
  });

  // An inline replaced element on a text baseline made the chip taller than its picture.
  it('sizes a chip to its picture, not to a line box', () => {
    for (const [id, width] of [
      ['CBG', 20],
      ['EBG', 18],
      ['EDI', 14]
    ] as const) {
      const rect = chip(id).getBoundingClientRect();
      expect(rect.height, `chip ${id} is taller than its picture`).toBeCloseTo(CHIP_HEIGHT, 0);
      expect(rect.width, `chip ${id} is not its picture's width`).toBeCloseTo(width, 0);
    }
  });

  // The inflated chip measurement fed --qti-dropzone-min-height and grew the hotspot with it.
  it('leaves a hotspot at the size its coords declare', () => {
    const rect = hotspot('A').getBoundingClientRect();
    expect(rect.width).toBeCloseTo(39 - 12, 0);
    expect(rect.height).toBeCloseTo(121 - 108, 0);
  });

  it('records the drop', async () => {
    await dropInto('EBG', 'A');
    expect((interaction as HTMLElement & { response: unknown }).response).toEqual('EBG A');
  });

  // The reported symptom: EBG landed low and hung out of the bottom of its box.
  it('centres the dropped picture in its hotspot', async () => {
    const { image } = await dropInto('EBG', 'A');
    const imageRect = image.getBoundingClientRect();
    const hotspotRect = hotspot('A').getBoundingClientRect();

    const offset = imageRect.top + imageRect.height / 2 - (hotspotRect.top + hotspotRect.height / 2);
    expect(Math.abs(offset), `picture sits ${offset.toFixed(1)}px off centre`).toBeLessThanOrEqual(1);
  });

  it('keeps the dropped picture inside its hotspot', async () => {
    const { image } = await dropInto('EBG', 'A');
    const imageRect = image.getBoundingClientRect();
    const hotspotRect = hotspot('A').getBoundingClientRect();

    expect(imageRect.top, 'picture starts above its hotspot').toBeGreaterThanOrEqual(hotspotRect.top - 0.5);
    expect(imageRect.bottom, 'picture hangs below its hotspot').toBeLessThanOrEqual(hotspotRect.bottom + 0.5);
    expect(imageRect.left).toBeGreaterThanOrEqual(hotspotRect.left - 0.5);
    expect(imageRect.right).toBeLessThanOrEqual(hotspotRect.right + 0.5);
  });

  // A chip is the same chip wherever it lives — the library's standing invariant.
  it('keeps the chip the same size in the bank and in the hotspot', async () => {
    const bankRect = chip('EBG').getBoundingClientRect();
    const { placed } = await dropInto('EBG', 'A');
    const placedRect = placed.getBoundingClientRect();

    expect(placedRect.width).toBeCloseTo(bankRect.width, 0);
    expect(placedRect.height).toBeCloseTo(bankRect.height, 0);
  });
});
