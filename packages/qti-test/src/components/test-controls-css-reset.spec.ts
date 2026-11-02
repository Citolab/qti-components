import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import '../register';

/**
 * A page's CSS reset (Tailwind's preflight: `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid }`)
 * is a rule of the page, and a page rule beats the `:host` rules of a shadow root. A test control that paints
 * its padding and border on its host would lose them. They are painted on an inner element, in the shadow tree,
 * where the page's `*` does not reach. (The controls that belong to a plugin are checked in their own package.)
 */
const controls = ['test-next', 'test-prev', 'test-end-attempt'];

describe('test controls under a page reset', () => {
  let reset: HTMLStyleElement;
  let container: HTMLDivElement;

  beforeEach(() => {
    reset = document.createElement('style');
    reset.textContent =
      '@layer base { *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; } }';
    document.head.append(reset);
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    reset.remove();
    container.remove();
  });

  it.each(controls)('%s keeps its padding and border', async tag => {
    const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<boolean> };
    el.textContent = 'Label';
    container.append(el);
    await el.updateComplete;

    const control = el.shadowRoot!.querySelector('.control')!;
    expect(control, `${tag} renders an inner .control`).toBeTruthy();
    const style = getComputedStyle(control);
    expect(parseFloat(style.paddingLeft), `${tag} padding`).toBeGreaterThan(0);
    expect(parseFloat(style.borderTopWidth), `${tag} border`).toBeGreaterThan(0);
    // the control is what you see: the host is as wide as it is
    expect(el.getBoundingClientRect().width).toBeCloseTo(control.getBoundingClientRect().width, 0);
  });
});
