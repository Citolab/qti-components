import '@citolab/qti-components';
import '../register';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { zoomLevel } from './test-zoom';

import type { TestZoomIn, TestZoomOut, TestZoomReset } from './test-zoom';
import type { QtiAssessmentItemRef, QtiTest } from '@citolab/qti-components/qti-test';
import type { QtiTestState } from '@citolab/qti-components/qti-test/plugin-api';

/**
 * The zoom buttons keep the level in the test's state (`session.plugins.zoom`) and scale every rendered
 * item with it: what a click does is what a host that stores `state` ends up storing, and a restored
 * state shows the items at that size again. The items are handed to their refs the way the navigation
 * mixin does once it has fetched them.
 */
const assessmentTest = html`
  <qti-test>
    <test-navigation>
      <test-zoom-out step="0.25" min="0.5">−</test-zoom-out>
      <test-zoom-reset></test-zoom-reset>
      <test-zoom-in step="0.25" max="1.5">+</test-zoom-in>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Zoom">
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="individual">
            <qti-assessment-section identifier="S1" title="S1" visible="true">
              <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml"></qti-assessment-item-ref>
              <qti-assessment-item-ref identifier="ITEM-2" href="items/item-2.xml"></qti-assessment-item-ref>
            </qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

const itemDoc = (identifier: string): DocumentFragment =>
  document.createRange().createContextualFragment(`
    <qti-assessment-item identifier="${identifier}" title="${identifier}" adaptive="false" time-dependent="false">
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"></qti-response-declaration>
      <qti-item-body>
        <p>Item ${identifier}</p>
      </qti-item-body>
    </qti-assessment-item>
  `);

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

describe('test-zoom', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;
  let zoomIn: TestZoomIn;
  let zoomOut: TestZoomOut;
  let reset: TestZoomReset;

  const itemRef = (identifier: string) =>
    qtiTest.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${identifier}"]`)!;
  const itemZoom = (identifier: string) =>
    (itemRef(identifier).querySelector('qti-assessment-item') as HTMLElement | null)?.style.getPropertyValue('zoom');
  /** The level as a host reads it: from the plugins entry of the state it stores. */
  const level = () => zoomLevel({ plugins: qtiTest.state.session.plugins });

  beforeEach(async () => {
    host = document.createElement('div');
    render(assessmentTest, host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    zoomIn = host.querySelector('test-zoom-in') as TestZoomIn;
    zoomOut = host.querySelector('test-zoom-out') as TestZoomOut;
    reset = host.querySelector('test-zoom-reset') as TestZoomReset;
    document.body.append(host);
    await settle();
    itemRef('ITEM-1').xmlDoc = itemDoc('ITEM-1');
    itemRef('ITEM-2').xmlDoc = itemDoc('ITEM-2');
    qtiTest.sessionContext = { ...qtiTest.sessionContext, navPartId: 'P1', navSectionId: 'S1', navItemRefId: 'ITEM-1' };
    await settle();
  });

  afterEach(() => host.remove());

  it('starts at 100%: the reset shows it, the items are not scaled and the state has no entry', () => {
    expect(reset.getAttribute('role')).toBe('button');
    expect(reset.shadowRoot!.textContent).toContain('100%');
    expect(itemZoom('ITEM-1')).toBe('');
    expect(qtiTest.state.session.plugins).toBeUndefined();
  });

  it('zooms every rendered item by a step, and stores the level in the state a host stores', async () => {
    zoomIn.click();
    await settle();

    expect(level()).toBe(1.25);
    expect(itemZoom('ITEM-1')).toBe('1.25');
    expect(itemZoom('ITEM-2')).toBe('1.25');
    expect(reset.shadowRoot!.textContent).toContain('125%');
    expect(qtiTest.state.session.plugins).toEqual({ zoom: 1.25 });
  });

  it('stops at max and min, and is disabled there', async () => {
    zoomIn.click();
    await settle();
    zoomIn.click();
    await settle();
    expect(level()).toBe(1.5);
    expect(zoomIn.hasAttribute('disabled')).toBe(true);
    zoomIn.click();
    await settle();
    expect(level()).toBe(1.5);

    for (let i = 0; i < 5; i++) {
      zoomOut.click();
      await settle();
    }
    expect(level()).toBe(0.5);
    expect(zoomOut.hasAttribute('disabled')).toBe(true);
    expect(itemZoom('ITEM-1')).toBe('0.5');
  });

  it('resets to 100% and leaves no trace in the state', async () => {
    zoomOut.click();
    await settle();
    reset.click();
    await settle();

    expect(level()).toBe(1);
    expect(itemZoom('ITEM-1')).toBe('');
    expect(qtiTest.state.session.plugins).toBeUndefined();
  });

  it('works with Enter and Space', async () => {
    zoomIn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
    expect(level()).toBe(1.25);
    zoomOut.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await settle();
    expect(level()).toBe(1);
  });

  it('shows the level of a restored state', async () => {
    const stored: QtiTestState = { version: 1, test: { items: [], outcomes: [] }, session: { plugins: { zoom: 1.5 } } };
    qtiTest.state = stored;
    await settle();

    expect(level()).toBe(1.5);
    expect(itemZoom('ITEM-1')).toBe('1.5');
    expect(reset.shadowRoot!.textContent).toContain('150%');
  });
});
