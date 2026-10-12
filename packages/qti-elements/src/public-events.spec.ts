import { describe, expect, it } from 'vitest';

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

  it('every cito- name in the source is declared', () => {
    const used = new Set(text.match(/'cito-[a-z-]+'/g)?.map(n => n.slice(1, -1)));
    for (const name of used) expect(Object.keys(PUBLIC_ITEM_EVENTS), name).toContain(name);
  });

  it('every declared event is still dispatched by the source', () => {
    for (const name of Object.keys(PUBLIC_ITEM_EVENTS)) expect(text, name).toContain(`'${name}'`);
  });
});

describe('dispatchPublic / listenPublic (item)', () => {
  it('sends both names; a listener runs once; the old name alone is handled too', () => {
    const el = document.createElement('div');
    const names: string[] = [];
    el.addEventListener('qti-outcome-changed', e => names.push(e.type));
    el.addEventListener('cito-item-outcome-changed', e => names.push(e.type));
    let handled = 0;
    listenPublic(el, 'cito-item-outcome-changed', () => handled++);

    dispatchPublic(el, 'cito-item-outcome-changed', { item: 'i1', outcomeIdentifier: 'SCORE', value: '1' });
    expect(names).toEqual(['cito-item-outcome-changed', 'qti-outcome-changed']);
    expect(handled).toBe(1);

    el.dispatchEvent(new CustomEvent('qti-outcome-changed', { detail: { item: 'i1' } }));
    expect(handled).toBe(2);
  });

  it('a cancel on either name reports the event as cancelled', () => {
    const el = document.createElement('div');
    el.addEventListener('qti-rubric:discretionary-placement', e => e.preventDefault());
    const placed = dispatchPublic(el, 'cito-item-rubric-placement', { className: 'x', element: el }, true);
    expect(placed).toBe(false);

    const el2 = document.createElement('div');
    el2.addEventListener('cito-item-rubric-placement', e => e.preventDefault());
    expect(dispatchPublic(el2, 'cito-item-rubric-placement', { className: 'x', element: el2 }, true)).toBe(false);
  });
});
