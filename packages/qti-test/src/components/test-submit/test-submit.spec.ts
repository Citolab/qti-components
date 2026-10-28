import { describe, expect, it } from 'vitest';

import { TestSubmit } from './test-submit';

if (!customElements.get('test-submit')) customElements.define('test-submit', TestSubmit);

describe('test-submit', () => {
  it('asks the test to submit', () => {
    const el = document.createElement('test-submit');
    document.body.append(el);
    const seen: unknown[] = [];
    el.addEventListener('qc-test-submit', e => seen.push((e as CustomEvent).detail));
    el.click();
    el.remove();
    expect(seen).toEqual([{}]);
  });
});

/**
 * A page's CSS reset (Tailwind's preflight: `* { margin: 0; padding: 0; border: 0 solid }`) is a rule of the page and beats the
 * `:host` rules of a shadow root, so the look is on the inner `.control`, out of the reset's reach.
 */
describe('TestSubmit under a page reset', () => {
  it('keeps its padding and border', async () => {
    const reset = document.createElement('style');
    reset.textContent =
      '@layer base { *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; } }';
    document.head.append(reset);
    const el = document.createElement('test-submit') as HTMLElement & { updateComplete: Promise<boolean> };
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
