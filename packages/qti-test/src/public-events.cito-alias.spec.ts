import { describe, expect, it, vi } from 'vitest';

import { dispatchPublic, listenPublic } from './public-events';

/**
 * The 9.x `cito-*` names are aliases of the `qc-*` names for one major: a host that still listens
 * to, or dispatches, a `cito-*` event keeps working. Nothing sends or handles the 7.x names
 * (`qti-request-navigation`, `test-end-attempt`, …) any more.
 */
describe('cito- aliases of the qc- events', () => {
  it('a host listener on cito-test-navigated fires when the test dispatches qc-test-navigated', () => {
    const el = document.createElement('div');
    const seen = vi.fn();
    el.addEventListener('cito-test-navigated', e => seen((e as CustomEvent).detail));

    dispatchPublic(el, 'qc-test-navigated', { type: 'item', id: 'item-2' });

    expect(seen).toHaveBeenCalledTimes(1);
    expect(seen).toHaveBeenCalledWith({ type: 'item', id: 'item-2' });
  });

  it('a request a host dispatches as cito-test-navigate reaches the qc-test-navigate listener, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('div');
    const handled = vi.fn();
    listenPublic(el, 'qc-test-navigate', e => handled(e.detail));

    el.dispatchEvent(
      new CustomEvent('cito-test-navigate', { detail: { type: 'section', id: 's1' }, bubbles: true, composed: true })
    );

    expect(handled).toHaveBeenCalledTimes(1);
    expect(handled).toHaveBeenCalledWith({ type: 'section', id: 's1' });
    expect(String(warn.mock.calls.at(-1)?.[0])).toContain('qc-test-navigate');
    warn.mockRestore();
  });

  it('the 7.x names are no longer sent or handled', () => {
    const el = document.createElement('div');
    const old = vi.fn();
    const handled = vi.fn();
    el.addEventListener('qti-request-navigation', old);
    listenPublic(el, 'qc-test-navigate', handled);

    dispatchPublic(el, 'qc-test-navigate', { type: 'item', id: 'i1' });
    expect(old).not.toHaveBeenCalled();
    expect(handled).toHaveBeenCalledTimes(1);

    el.dispatchEvent(new CustomEvent('qti-request-navigation', { detail: { type: 'item', id: 'i2' } }));
    expect(handled).toHaveBeenCalledTimes(1);
  });
});
