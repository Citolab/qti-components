import { afterEach, describe, expect, it } from 'vitest';

import itemCss from '@qti-components/theme/item-css';
import nativeCss from '@qti-components/theme/native-css';

/**
 * The QTI 3 shared CSS (qti3p0.css, kept verbatim) paints `.qti-bordered`, `.qti-well` and `.qti-underline`
 * with custom properties it never declares. Undeclared, those declarations fall back to their initial values —
 * a bordered table showed no lines at all. qti3p0-variables.css declares them with the spec's own example values
 * and the theme maps the border colour onto its border token; this pins both, measured in a real browser.
 */

const sheets: HTMLStyleElement[] = [];
const load = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  sheets.push(style);
};

const render = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
};

/** A colour as the browser computes it (rgb(…)), for comparing against a token's value. */
const computedColor = (value: string) => {
  const probe = render(`<span style="color: ${value}"></span>`).firstElementChild as HTMLElement;
  const color = getComputedStyle(probe).color;
  probe.parentElement!.remove();
  return color;
};

const BORDERED = `
  <table class="qti-bordered"><tbody>
    <tr><th class="qti-bordered">Artikelgroep</th><th class="qti-bordered">Index</th></tr>
    <tr><td class="qti-bordered">Voeding en kleding</td><td class="qti-bordered">140</td></tr>
  </tbody></table>
  <p class="qti-well">In a well.</p>
  <p style="color: rgb(200, 0, 0)"><span class="qti-underline">Underlined.</span></p>`;

afterEach(() => {
  sheets.splice(0).forEach(s => s.remove());
  document.body.innerHTML = '';
});

describe('QTI 3 shared CSS variables', () => {
  it('the theme draws a bordered table and its cells in its own border colour', () => {
    load(itemCss);
    const host = render(BORDERED);
    const border = computedColor(getComputedStyle(document.documentElement).getPropertyValue('--qti-border-color'));
    for (const el of host.querySelectorAll<HTMLElement>('table, th, td')) {
      const style = getComputedStyle(el);
      expect(style.borderTopStyle, el.localName).toBe('solid');
      expect(style.borderTopWidth, el.localName).toBe('1px');
      expect(style.borderTopColor, el.localName).toBe(border);
    }
  });

  it("the theme paints a well with the spec's fill, frame and shadow, and an underline in the text colour", () => {
    load(itemCss);
    const host = render(BORDERED);
    const well = getComputedStyle(host.querySelector('.qti-well')!);
    expect(well.backgroundColor).toBe('rgb(245, 245, 245)');
    expect([well.borderTopStyle, well.borderTopWidth, well.borderTopColor]).toEqual([
      'solid',
      '1px',
      'rgb(227, 227, 227)'
    ]);
    expect(well.boxShadow).not.toBe('none');
    expect(getComputedStyle(host.querySelector('.qti-underline')!).textDecorationColor).toBe('rgb(200, 0, 0)');
  });

  it("native.css on its own (as the PCI iframe inlines it) uses the spec's grey", () => {
    load(nativeCss);
    const host = render(BORDERED);
    const table = getComputedStyle(host.querySelector('table')!);
    expect([table.borderTopStyle, table.borderTopColor]).toEqual(['solid', 'rgb(136, 136, 136)']);
  });
});
