import { describe, expect, it } from 'vitest';

import { TestSubmit } from './test-submit';

if (!customElements.get('test-submit')) customElements.define('test-submit', TestSubmit);

describe('test-submit', () => {
  it('asks the test to submit', () => {
    const el = document.createElement('test-submit');
    document.body.append(el);
    const seen: unknown[] = [];
    el.addEventListener('cito-test-submit', e => seen.push((e as CustomEvent).detail));
    el.click();
    el.remove();
    expect(seen).toEqual([{}]);
  });
});
