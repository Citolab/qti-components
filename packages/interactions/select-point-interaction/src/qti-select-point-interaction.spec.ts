/**
 * A select-point picture scales with its column by default, and a click on the scaled picture
 * still records the point in the picture's own pixel space (its width/height attributes).
 */
import './register';
import itemCss from '../../../qti-theme/src/item.css?inline';

import type { QtiSelectPointInteraction } from './qti-select-point-interaction';

// 400x300 picture, declared at that size, so the coordinate space is 400x300.
const SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#8ac"/></svg>'
)}`;

const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

const interactionHtml = `
  <qti-select-point-interaction response-identifier="RESPONSE" max-choices="1">
    <img src="${SVG}" width="400" height="300" alt="" />
  </qti-select-point-interaction>`;

describe.each([
  // No CSS for the interaction or its picture at all.
  ['without a theme', interactionHtml],
  // The item theme, whose reset gives every picture in an interaction `max-width: none`: a light-DOM
  // rule, so it outranks the component's own ::slotted(img) sizing.
  [
    'with the item theme',
    `<style>${itemCss}</style><qti-item-body style="display:block">${interactionHtml}</qti-item-body>`
  ]
])('qti-select-point-interaction scaling %s', (_label, markup) => {
  let container: HTMLDivElement;
  let interaction: QtiSelectPointInteraction;
  let img: HTMLImageElement;

  beforeEach(async () => {
    container = document.createElement('div');
    // Only a column narrower than the picture. The widths keep every clicked point on a whole
    // pixel: MouseEvent.clientX/Y are integers.
    container.style.cssText = 'width:240px;margin:0;padding:0';
    container.innerHTML = markup;
    document.body.appendChild(container);
    interaction = container.querySelector('qti-select-point-interaction')!;
    img = interaction.querySelector('img')!;
    await img.decode();
    await interaction.updateComplete;
    await nextFrame();
  });

  afterEach(() => container.remove());

  // A real click at a fraction of the rendered picture, as the handler on the <img> reads it.
  const clickAt = async (fx: number, fy: number) => {
    const rect = img.getBoundingClientRect();
    img.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        composed: true,
        clientX: rect.left + rect.width * fx,
        clientY: rect.top + rect.height * fy
      })
    );
    await interaction.updateComplete;
  };

  const marker = () => interaction.shadowRoot!.querySelector<HTMLElement>('[part~="point"]')!;

  const resize = async (width: number) => {
    container.style.width = `${width}px`;
    window.dispatchEvent(new Event('resize'));
    await nextFrame();
  };

  it('displays the picture at the column width, at its aspect ratio', () => {
    const rect = img.getBoundingClientRect();
    expect(rect.width).toBe(240);
    expect(rect.height).toBe(180);
    expect(interaction.getBoundingClientRect().width).toBe(240);
  });

  it('does not blow up a picture smaller than the column', async () => {
    container.style.width = '800px';
    await nextFrame();
    const rect = img.getBoundingClientRect();
    expect(rect.width).toBe(400);
    expect(rect.height).toBe(300);
  });

  it('records the centre of the scaled picture in the picture pixels', async () => {
    await clickAt(0.5, 0.5);
    expect(interaction.response).toEqual(['200 150']);
  });

  it('records a point near the top left in the picture pixels', async () => {
    await clickAt(0.25, 0.25);
    expect(interaction.response).toEqual(['100 75']);
  });

  it('records the centre again after the column shrinks', async () => {
    await resize(160);
    expect(img.getBoundingClientRect().width).toBe(160);
    expect(img.getBoundingClientRect().height).toBe(120);
    await clickAt(0.5, 0.5);
    expect(interaction.response).toEqual(['200 150']);
  });

  it('places the marker as a percentage, which survives a resize', async () => {
    await clickAt(0.5, 0.5);
    expect(parseFloat(marker().style.left)).toBeCloseTo(50, 5);
    expect(parseFloat(marker().style.top)).toBeCloseTo(50, 5);
    expect(marker().style.left.endsWith('%')).toBe(true);

    await resize(160);
    expect(parseFloat(marker().style.left)).toBeCloseTo(50, 5);
    expect(parseFloat(marker().style.top)).toBeCloseTo(50, 5);
    // And the marker's anchor is really at the centre of the (smaller) picture.
    const imgRect = img.getBoundingClientRect();
    const markerParent = marker().offsetParent as HTMLElement;
    const parentRect = markerParent.getBoundingClientRect();
    expect(parentRect.left + marker().offsetLeft).toBeCloseTo(imgRect.left + 80, 0);
    expect(parentRect.top + marker().offsetTop).toBeCloseTo(imgRect.top + 60, 0);
  });
});
