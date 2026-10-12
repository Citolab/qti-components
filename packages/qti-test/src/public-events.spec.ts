import { describe, expect, it } from 'vitest';

import { dispatchPublic, listenPublic, PUBLIC_EVENTS } from './public-events';

const raw = import.meta.glob<string>('/packages/qti-test/src/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true
});

describe('public events', () => {
  const text = Object.entries(raw)
    .filter(([path]) => !/\.(spec|stories)\.ts$/.test(path) && !path.endsWith('/public-events.ts'))
    .map(([, source]) => source)
    .join('\n');

  it('every cito- name in the source is declared', () => {
    const used = new Set(text.match(/'cito-[a-z-]+'/g)?.map(n => n.slice(1, -1)));
    for (const name of used) expect(Object.keys(PUBLIC_EVENTS), name).toContain(name);
  });

  it('every declared event is still used by the source', () => {
    for (const name of Object.keys(PUBLIC_EVENTS)) expect(text, name).toContain(`'${name}'`);
  });

  it('no declared name uses the qti- prefix', () => {
    for (const name of Object.keys(PUBLIC_EVENTS)) expect(name.startsWith('cito-')).toBe(true);
  });
});

describe('dispatchPublic / listenPublic', () => {
  it('sends both names, and a listener runs once for them', () => {
    const el = document.createElement('div');
    const names: string[] = [];
    el.addEventListener('qti-request-navigation', e => names.push(e.type));
    el.addEventListener('cito-test-navigate', e => names.push(e.type));
    let handled = 0;
    listenPublic(el, 'cito-test-navigate', () => handled++);

    dispatchPublic(el, 'cito-test-navigate', { type: 'item', id: 'i1' });

    expect(names).toEqual(['cito-test-navigate', 'qti-request-navigation']);
    expect(handled).toBe(1);
  });

  it('a host that sends only the old name is still handled', () => {
    const el = document.createElement('div');
    let detail: unknown;
    listenPublic(el, 'cito-test-navigate', e => (detail = e.detail));
    el.dispatchEvent(new CustomEvent('qti-request-navigation', { detail: { type: 'item', id: 'i2' } }));
    expect(detail).toEqual({ type: 'item', id: 'i2' });
  });

  it('a notification without a deprecated name sends one event', () => {
    const el = document.createElement('div');
    const seen: string[] = [];
    el.addEventListener('cito-test-navigated', e => seen.push(e.type));
    dispatchPublic(el, 'cito-test-navigated', { type: 'item', id: 'i1' });
    expect(seen).toEqual(['cito-test-navigated']);
  });

  it('a second dispatch with the same detail object is handled again', () => {
    const el = document.createElement('div');
    let handled = 0;
    listenPublic(el, 'cito-test-loaded', () => handled++);
    const test = document.createElement('div') as never;
    dispatchPublic(el, 'cito-test-loaded', test);
    dispatchPublic(el, 'cito-test-loaded', test);
    expect(handled).toBe(2);
  });
});
