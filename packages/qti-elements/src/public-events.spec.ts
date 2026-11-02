import { describe, expect, it, vi } from 'vitest';

import { dispatchPublic, listenPublic, PUBLIC_ITEM_EVENTS } from './public-events';

const raw = import.meta.glob<string>('/packages/qti-elements/src/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true
});

describe('public item events', () => {
  const text = Object.entries(raw)
    .filter(([path]) => !/\.(spec|stories)\.ts$/.test(path) && !path.endsWith('/public-events.ts'))
    .map(([, source]) => source)
    .join('\n');

  it('every qc- name in the source is declared', () => {
    const used = new Set(text.match(/'qc-[a-z-]+'/g)?.map(n => n.slice(1, -1)));
    for (const name of used) expect(Object.keys(PUBLIC_ITEM_EVENTS), name).toContain(name);
  });

  it('every declared event is still dispatched by the source', () => {
    for (const name of Object.keys(PUBLIC_ITEM_EVENTS)) expect(text, name).toContain(`'${name}'`);
  });

  it('every declared name uses the qc- prefix, and its alias the cito- prefix', () => {
    for (const [name, { deprecated }] of Object.entries(PUBLIC_ITEM_EVENTS)) {
      expect(name.startsWith('qc-')).toBe(true);
      expect(deprecated).toBe(name.replace(/^qc-/, 'cito-'));
    }
    expect(text.match(/'cito-[a-z-]+'/g)).toBeNull();
  });
});

describe('dispatchPublic / listenPublic (item)', () => {
  it('sends both names; a listener runs once; the old name alone is handled too', () => {
    const el = document.createElement('div');
    const names: string[] = [];
    el.addEventListener('cito-item-outcome-changed', e => names.push(e.type));
    el.addEventListener('qc-item-outcome-changed', e => names.push(e.type));
    let handled = 0;
    listenPublic(el, 'qc-item-outcome-changed', () => handled++);

    dispatchPublic(el, 'qc-item-outcome-changed', { item: 'i1', outcomeIdentifier: 'SCORE', value: '1' });
    expect(names).toEqual(['qc-item-outcome-changed', 'cito-item-outcome-changed']);
    expect(handled).toBe(1);

    el.dispatchEvent(new CustomEvent('cito-item-outcome-changed', { detail: { item: 'i1' } }));
    expect(handled).toBe(2);
  });

  it('a cancel on either name reports the event as cancelled', () => {
    const el = document.createElement('div');
    el.addEventListener('cito-item-rubric-placement', e => e.preventDefault());
    const placed = dispatchPublic(el, 'qc-item-rubric-placement', { className: 'x', element: el }, true);
    expect(placed).toBe(false);

    const el2 = document.createElement('div');
    el2.addEventListener('qc-item-rubric-placement', e => e.preventDefault());
    expect(dispatchPublic(el2, 'qc-item-rubric-placement', { className: 'x', element: el2 }, true)).toBe(false);
  });

  it('warns once when a host sends the old name alone, and never for our own dual dispatch', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('div');
    listenPublic(el, 'qc-item-response-changed', () => {});

    dispatchPublic(el, 'qc-item-response-changed', { item: 'i1', responseIdentifier: 'R', response: 'a' } as never);
    expect(warn).not.toHaveBeenCalled();

    el.dispatchEvent(new CustomEvent('cito-item-response-changed', { detail: { item: 'i1' } }));
    el.dispatchEvent(new CustomEvent('cito-item-response-changed', { detail: { item: 'i2' } }));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('cito-item-response-changed');
    expect(String(warn.mock.calls[0][0])).toContain('qc-item-response-changed');
    warn.mockRestore();
  });
});
