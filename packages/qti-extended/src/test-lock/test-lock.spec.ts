import '@citolab/qti-components';
import '../register';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { lockState } from './test-lock';

import type { TestLock } from './test-lock';
import type { QtiAssessmentItemRef, QtiTest } from '@citolab/qti-components/qti-test';
import type { QtiTestState } from '@citolab/qti-components/qti-test/plugin-api';

/**
 * The lock keeps its state in the test's state (`session.plugins.lock`): what leaving the page does is
 * what a host that stores `state` ends up storing, and a restored locked state comes back locked. The
 * item is handed to its ref the way the navigation mixin does once it has fetched it.
 */
const assessmentTest = (code?: string) => html`
  <qti-test>
    <test-navigation>
      <test-lock code=${code ?? ''}>Vergrendeld.</test-lock>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Lock">
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="individual">
            <qti-assessment-section identifier="S1" title="S1" visible="true">
              <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml"></qti-assessment-item-ref>
            </qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

const itemDoc = (): DocumentFragment =>
  document.createRange().createContextualFragment(`
    <qti-assessment-item identifier="ITEM-1" title="ITEM-1" adaptive="false" time-dependent="false">
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"></qti-response-declaration>
      <qti-item-body><p>Item</p></qti-item-body>
    </qti-assessment-item>
  `);

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

/** The page goes to the background (another tab), as `visibilitychange` reports it. */
const hidePage = () => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
  document.dispatchEvent(new Event('visibilitychange'));
  delete (document as { hidden?: boolean }).hidden;
};

describe('test-lock', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;
  let lock: TestLock;
  let events: string[];

  const dialog = () => lock.shadowRoot!.querySelector('dialog')!;
  const plugins = () => qtiTest.state.session.plugins;

  const mount = async (code?: string, restore?: QtiTestState) => {
    host = document.createElement('div');
    render(assessmentTest(code), host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    lock = host.querySelector('test-lock') as TestLock;
    events = [];
    for (const name of ['lock', 'unlock']) host.addEventListener(name, () => events.push(name));
    document.body.append(host);
    await settle();
    qtiTest.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref')!.xmlDoc = itemDoc();
    qtiTest.sessionContext = { ...qtiTest.sessionContext, navPartId: 'P1', navSectionId: 'S1', navItemRefId: 'ITEM-1' };
    if (restore) qtiTest.state = restore;
    await settle();
  };

  afterEach(() => host.remove());

  describe('with a code', () => {
    beforeEach(() => mount('1234'));

    it('shows nothing and keeps no state while the candidate stays', () => {
      expect(dialog().open).toBe(false);
      expect(lock.hasAttribute('locked')).toBe(false);
      expect(plugins()).toBeUndefined();
    });

    it('locks when the page is hidden, and stores it in the state a host stores', async () => {
      hidePage();
      await settle();

      expect(dialog().open).toBe(true);
      expect(lock.hasAttribute('locked')).toBe(true);
      expect(plugins()).toEqual({ lock: { locked: true, times: 1 } });
      expect(events).toEqual(['lock']);
    });

    it('locks when the window loses focus', async () => {
      window.dispatchEvent(new Event('blur'));
      await settle();
      expect(lockState({ plugins: plugins() })).toEqual({ locked: true, times: 1 });
    });

    it('does not lock when focus moves into an iframe of the test', async () => {
      const frame = document.createElement('iframe');
      host.append(frame);
      frame.focus();
      window.dispatchEvent(new Event('blur'));
      await settle();
      expect(lockState({ plugins: plugins() }).locked).toBe(false);
    });

    it('stays locked on Escape and on a wrong code', async () => {
      hidePage();
      await settle();

      dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
      expect(dialog().open).toBe(true);

      const input = lock.shadowRoot!.querySelector('input')!;
      input.value = '0000';
      lock.shadowRoot!.querySelector('form')!.requestSubmit();
      await settle();

      expect(dialog().open).toBe(true);
      expect(lock.shadowRoot!.querySelector('[part="error"]')?.textContent).toContain('klopt niet');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('unlocks with the right code, and counts how often it was locked', async () => {
      hidePage();
      await settle();
      const input = lock.shadowRoot!.querySelector('input')!;
      input.value = '1234';
      lock.shadowRoot!.querySelector('form')!.requestSubmit();
      await settle();

      expect(dialog().open).toBe(false);
      expect(plugins()).toEqual({ lock: { locked: false, times: 1 } });
      expect(events).toEqual(['lock', 'unlock']);

      hidePage();
      await settle();
      expect(plugins()).toEqual({ lock: { locked: true, times: 2 } });
    });
  });

  it('without a code asks no code, and only unlock() opens it', async () => {
    await mount();
    hidePage();
    await settle();

    expect(dialog().open).toBe(true);
    expect(lock.shadowRoot!.querySelector('input')).toBeNull();

    lock.unlock();
    await settle();
    expect(dialog().open).toBe(false);
    expect(lockState({ plugins: plugins() })).toEqual({ locked: false, times: 1 });
  });

  it('comes back locked from a restored state, so a reload does not escape it', async () => {
    await mount('1234', {
      version: 1,
      test: { items: [], outcomes: [] },
      session: { plugins: { lock: { locked: true, times: 3 } } }
    });

    expect(dialog().open).toBe(true);
    expect(lockState({ plugins: plugins() })).toEqual({ locked: true, times: 3 });
    expect(events).toEqual(['lock']);
  });

  it('does not lock outside a test', async () => {
    host = document.createElement('div');
    const loose = document.createElement('test-lock') as TestLock;
    host.append(loose);
    document.body.append(host);
    await loose.updateComplete;

    hidePage();
    await settle();
    expect(loose.shadowRoot!.querySelector('dialog')!.open).toBe(false);
  });
});
