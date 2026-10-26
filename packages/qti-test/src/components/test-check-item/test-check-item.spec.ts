import { describe, expect, it } from 'vitest';

import { TestCheckItem } from './test-check-item';

if (!customElements.get('test-check-item')) customElements.define('test-check-item', TestCheckItem);

describe('test-check-item', () => {
  const press = (attributes: Record<string, string> = {}) => {
    const el = document.createElement('test-check-item') as TestCheckItem;
    for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
    document.body.append(el);
    const seen: { type: string; detail: unknown }[] = [];
    for (const type of ['qc-test-end-attempt', 'qc-test-switch-view']) {
      el.addEventListener(type, e => seen.push({ type, detail: (e as CustomEvent).detail }));
    }
    el.click();
    el.remove();
    return seen;
  };

  it('ends the attempt, then switches to the scorer view', () => {
    expect(press()).toEqual([
      { type: 'qc-test-end-attempt', detail: {} },
      { type: 'qc-test-switch-view', detail: 'scorer' }
    ]);
  });

  it('switches to the view named by its view attribute', () => {
    expect(press({ view: 'tutor' }).at(-1)).toEqual({ type: 'qc-test-switch-view', detail: 'tutor' });
  });
});

/**
 * A page's CSS reset (Tailwind's preflight: `* { margin: 0; padding: 0; border: 0 solid }`) is a rule of the page and beats the
 * `:host` rules of a shadow root, so the look is on the inner `.control`, out of the reset's reach.
 */
describe('TestCheckItem under a page reset', () => {
  it('keeps its padding and border', async () => {
    const reset = document.createElement('style');
    reset.textContent =
      '@layer base { *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; } }';
    document.head.append(reset);
    const el = document.createElement('test-check-item') as HTMLElement & { updateComplete: Promise<boolean> };
    el.textContent = 'Label';
    document.body.append(el);
    await el.updateComplete;

    const control = el.shadowRoot!.querySelector('.control')!;
    expect(control).toBeTruthy();
    expect(parseFloat(getComputedStyle(control).paddingLeft)).toBeGreaterThan(0);
    expect(parseFloat(getComputedStyle(control).borderTopWidth)).toBeGreaterThan(0);
    expect(el.getBoundingClientRect().width).toBeCloseTo(control.getBoundingClientRect().width, 0);

    el.remove();
    reset.remove();
  });
});
