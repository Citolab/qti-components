import '@citolab/qti-components';

import { consume } from '@lit/context';
import { html, LitElement, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { computedContext } from '@qti-components/base';

import { dispatchPublic } from '../public-events';
import { pluginState } from '../plugin-state';

import type { ComputedContext } from '@qti-components/base';
import type { QtiTest } from '../components/qti-test/qti-test';
import type { QtiTestState } from '../types/qti-test-state';

/**
 * A plugin keeps what it wants remembered in `state.session.plugins`, by its own name: it writes
 * with `cito-test-update-plugin-state`, reads from `computedContext.plugins`, and the host that
 * already stores `state` stores it too. The test never reads an entry.
 */
declare module '../types/qti-test-state' {
  interface QtiTestPluginState {
    'probe-notes': string[];
  }
}

class PluginProbe extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  computed?: ComputedContext;

  override render() {
    return html``;
  }
}
if (!customElements.get('plugin-state-probe')) customElements.define('plugin-state-probe', PluginProbe);

const assessmentTest = html`
  <qti-test>
    <test-navigation>
      <plugin-state-probe></plugin-state-probe>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Plugins">
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="simultaneous">
            <qti-assessment-section identifier="S1" title="S1" visible="true">
              <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml"></qti-assessment-item-ref>
            </qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

const baseState = (plugins?: Record<string, unknown>): QtiTestState => ({
  version: 1,
  test: { items: [], outcomes: [] },
  session: { ...(plugins ? { plugins } : {}) }
});

describe('plugin state', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;
  let probe: PluginProbe;
  let emitted: QtiTestState[];

  beforeEach(async () => {
    host = document.createElement('div');
    render(assessmentTest, host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    probe = host.querySelector('plugin-state-probe') as PluginProbe;
    emitted = [];
    qtiTest.addEventListener('cito-test-state-changed', e => emitted.push(e.detail));
  });

  afterEach(() => host.remove());

  const connect = async () => {
    document.body.append(host);
    await settle();
  };

  it('is read from computedContext, empty until a plugin writes', async () => {
    await connect();
    expect(probe.computed?.plugins).toEqual({});
    expect(pluginState(probe.computed, 'probe-notes')).toBeUndefined();
  });

  it('is written with the request, shows in computedContext and in the state a host stores', async () => {
    await connect();
    dispatchPublic(probe, 'cito-test-update-plugin-state', { plugin: 'probe-notes', value: ['a', 'b'] });
    await settle();

    expect(pluginState(probe.computed, 'probe-notes')).toEqual(['a', 'b']);
    expect(qtiTest.state.session.plugins).toEqual({ 'probe-notes': ['a', 'b'] });
    expect(emitted.at(-1)?.session.plugins).toEqual({ 'probe-notes': ['a', 'b'] });
  });

  it('keeps a copy: changing the value afterwards does not change the state', async () => {
    await connect();
    const notes = ['a'];
    dispatchPublic(probe, 'cito-test-update-plugin-state', { plugin: 'probe-notes', value: notes });
    notes.push('b');
    await settle();

    expect(qtiTest.state.session.plugins).toEqual({ 'probe-notes': ['a'] });
  });

  it('removes the entry for null, and leaves other plugins alone', async () => {
    await connect();
    dispatchPublic(probe, 'cito-test-update-plugin-state', { plugin: 'probe-notes', value: ['a'] });
    dispatchPublic(probe, 'cito-test-update-plugin-state', { plugin: 'other', value: 1 });
    dispatchPublic(probe, 'cito-test-update-plugin-state', { plugin: 'probe-notes', value: null });
    await settle();

    expect(qtiTest.state.session.plugins).toEqual({ other: 1 });
  });

  it('ignores a value that is not JSON', async () => {
    await connect();
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    dispatchPublic(probe, 'cito-test-update-plugin-state', { plugin: 'probe-notes', value: cyclic });
    await settle();

    expect(qtiTest.state.session.plugins).toBeUndefined();
  });

  it('is restored from an assigned state, including plugins that are not loaded', async () => {
    qtiTest.state = baseState({ 'probe-notes': ['x'], 'not-loaded': { kept: true } });
    await connect();

    expect(pluginState(probe.computed, 'probe-notes')).toEqual(['x']);
    expect(qtiTest.state.session.plugins).toEqual({ 'probe-notes': ['x'], 'not-loaded': { kept: true } });
  });

  it('is replaced, not merged, when a later state is assigned', async () => {
    await connect();
    qtiTest.state = baseState({ 'probe-notes': ['x'], other: 1 });
    await settle();
    qtiTest.state = baseState({ 'probe-notes': ['y'] });
    await settle();
    expect(qtiTest.state.session.plugins).toEqual({ 'probe-notes': ['y'] });

    qtiTest.state = baseState();
    await settle();
    expect(pluginState(probe.computed, 'probe-notes')).toBeUndefined();
    expect(qtiTest.state.session.plugins).toBeUndefined();
  });

  it('round-trips: what one test stores, another resumes from', async () => {
    await connect();
    dispatchPublic(probe, 'cito-test-update-plugin-state', { plugin: 'probe-notes', value: ['a', 'b'] });
    await settle();
    const stored = JSON.parse(JSON.stringify(qtiTest.state)) as QtiTestState;
    host.remove();

    host = document.createElement('div');
    render(assessmentTest, host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    probe = host.querySelector('plugin-state-probe') as PluginProbe;
    qtiTest.state = stored;
    await connect();

    expect(pluginState(probe.computed, 'probe-notes')).toEqual(['a', 'b']);
  });
});
