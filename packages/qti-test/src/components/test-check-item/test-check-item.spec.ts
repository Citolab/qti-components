import { describe, expect, it } from 'vitest';

import { TestCheckItem } from './test-check-item';

if (!customElements.get('test-check-item')) customElements.define('test-check-item', TestCheckItem);

describe('test-check-item', () => {
  const press = (attributes: Record<string, string> = {}) => {
    const el = document.createElement('test-check-item') as TestCheckItem;
    for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
    document.body.append(el);
    const seen: { type: string; detail: unknown }[] = [];
    for (const type of ['cito-test-end-attempt', 'cito-test-switch-view']) {
      el.addEventListener(type, e => seen.push({ type, detail: (e as CustomEvent).detail }));
    }
    el.click();
    el.remove();
    return seen;
  };

  it('ends the attempt, then switches to the scorer view', () => {
    expect(press()).toEqual([
      { type: 'cito-test-end-attempt', detail: {} },
      { type: 'cito-test-switch-view', detail: 'scorer' }
    ]);
  });

  it('switches to the view named by its view attribute', () => {
    expect(press({ view: 'tutor' }).at(-1)).toEqual({ type: 'cito-test-switch-view', detail: 'tutor' });
  });
});
