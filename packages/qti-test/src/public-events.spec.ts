import { describe, expect, it } from 'vitest';

import { PUBLIC_ITEM_EVENTS } from '@qti-components/elements/public-events';

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

  it('every qc- name in the source is declared', () => {
    const used = new Set(text.match(/'qc-[a-z-]+'/g)?.map(n => n.slice(1, -1)));
    for (const name of used)
      expect([...Object.keys(PUBLIC_EVENTS), ...Object.keys(PUBLIC_ITEM_EVENTS)], name).toContain(name);
  });

  it('every declared event is still used by the source', () => {
    for (const name of Object.keys(PUBLIC_EVENTS)) expect(text, name).toContain(`'${name}'`);
  });

  it('every declared name uses the qc- prefix, and its alias the cito- prefix', () => {
    for (const [name, { deprecated }] of Object.entries(PUBLIC_EVENTS)) {
      expect(name.startsWith('qc-')).toBe(true);
      expect(deprecated).toBe(name.replace(/^qc-/, 'cito-'));
    }
  });

  it('no source dispatches or listens to a cito- or 7.x name directly', () => {
    const own = Object.entries(raw)
      .filter(([path]) => !/\.(spec|stories)\.ts$/.test(path) && !path.endsWith('/public-events.ts'))
      .map(([, source]) => source)
      .join('\n');
    expect(own.match(/'cito-[a-z-]+'/g)).toBeNull();
    for (const old of [
      'qti-request-navigation',
      'on-test-switch-view',
      'qti-assessment-test-connected',
      'qti-state-changed'
    ])
      expect(own, old).not.toContain(`'${old}'`);
  });
});

describe('dispatchPublic / listenPublic', () => {
  it('sends both names, and a listener runs once for them', () => {
    const el = document.createElement('div');
    const names: string[] = [];
    el.addEventListener('cito-test-navigate', e => names.push(e.type));
    el.addEventListener('qc-test-navigate', e => names.push(e.type));
    let handled = 0;
    listenPublic(el, 'qc-test-navigate', () => handled++);

    dispatchPublic(el, 'qc-test-navigate', { type: 'item', id: 'i1' });

    expect(names).toEqual(['qc-test-navigate', 'cito-test-navigate']);
    expect(handled).toBe(1);
  });

  it('a host that sends only the old name is still handled', () => {
    const el = document.createElement('div');
    let detail: unknown;
    listenPublic(el, 'qc-test-navigate', e => (detail = e.detail));
    el.dispatchEvent(new CustomEvent('cito-test-navigate', { detail: { type: 'item', id: 'i2' } }));
    expect(detail).toEqual({ type: 'item', id: 'i2' });
  });

  it('a notification is sent under its qc- name and then its cito- alias', () => {
    const el = document.createElement('div');
    const seen: string[] = [];
    el.addEventListener('qc-test-navigated', e => seen.push(e.type));
    el.addEventListener('cito-test-navigated', e => seen.push(e.type));
    dispatchPublic(el, 'qc-test-navigated', { type: 'item', id: 'i1' });
    expect(seen).toEqual(['qc-test-navigated', 'cito-test-navigated']);
  });

  it('a second dispatch with the same detail object is handled again', () => {
    const el = document.createElement('div');
    let handled = 0;
    listenPublic(el, 'qc-test-loaded', () => handled++);
    const test = document.createElement('div') as never;
    dispatchPublic(el, 'qc-test-loaded', test);
    dispatchPublic(el, 'qc-test-loaded', test);
    expect(handled).toBe(2);
  });
});
