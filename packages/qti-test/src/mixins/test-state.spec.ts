import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { Interaction } from '@qti-components/base';
import type { QtiTest } from '../components/qti-test/qti-test';
import type { QtiAssessmentItemRef } from '../components/qti-assessment-item-ref/qti-assessment-item-ref';
import type { QtiTestState } from '../types/qti-test-state';

/**
 * `qtiTest.state` and `qti-state-changed` are the whole persistence contract for a host: listen,
 * store, and assign the stored value back to resume. These specs hold that contract to what a
 * host would actually do — assign before anything has loaded, or after — and to what it must
 * never see: an empty state emitted mid-load, or the answer key in what it stores.
 */
const assessmentTest = html`
  <qti-test>
    <test-container>
      <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="State">
        <qti-outcome-declaration identifier="TEST_SCORE" cardinality="single" base-type="float">
          <qti-default-value><qti-value>0</qti-value></qti-default-value>
        </qti-outcome-declaration>
        <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="simultaneous">
          <qti-assessment-section identifier="S1" title="S1" visible="true">
            <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml"></qti-assessment-item-ref>
            <qti-assessment-item-ref identifier="ITEM-2" href="items/item-2.xml"></qti-assessment-item-ref>
          </qti-assessment-section>
        </qti-test-part>
      </qti-assessment-test>
    </test-container>
  </qti-test>
`;

/** What the navigation mixin hands an item-ref once it has fetched and transformed the item. */
const itemDoc = (): DocumentFragment =>
  document.createRange().createContextualFragment(`
    <qti-assessment-item identifier="item-1" title="Item 1" adaptive="false" time-dependent="false">
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-item-body>
        <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
          <qti-simple-choice identifier="A">A</qti-simple-choice>
          <qti-simple-choice identifier="B">B</qti-simple-choice>
        </qti-choice-interaction>
      </qti-item-body>
    </qti-assessment-item>
  `);

const savedState = (overrides: Partial<QtiTestState['session']> = {}): QtiTestState => ({
  version: 1,
  test: {
    items: [
      {
        identifier: 'ITEM-1',
        variables: [
          { identifier: 'completionStatus', type: 'outcome', value: 'completed' },
          { identifier: 'numAttempts', type: 'response', value: '1' },
          { identifier: 'RESPONSE', type: 'response', value: 'B' },
          { identifier: 'SCORE', type: 'outcome', value: '0' }
        ],
        state: { RESPONSE: 'opaque-pci-state' }
      }
    ],
    outcomes: [{ identifier: 'TEST_SCORE', value: '0.5' }]
  },
  session: { navItemRefId: 'ITEM-1', ...overrides }
});

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

const variable = (qtiTest: QtiTest, item: string, identifier: string) =>
  qtiTest.testContext.items.find(i => i.identifier === item)?.variables?.find(v => v.identifier === identifier);

describe('qti-test state', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;
  let emitted: QtiTestState[];

  beforeEach(() => {
    host = document.createElement('div');
    // Rendered detached, so a host can assign state before the test has connected.
    render(assessmentTest, host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    emitted = [];
    qtiTest.addEventListener('qti-state-changed', e => emitted.push(e.detail));
  });

  afterEach(() => host.remove());

  const connect = async () => {
    document.body.append(host);
    await settle();
  };

  const loadItem = async (identifier = 'ITEM-1'): Promise<QtiAssessmentItem> => {
    const itemRef = qtiTest.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${identifier}"]`);
    itemRef.xmlDoc = itemDoc();
    await settle();
    return itemRef.assessmentItem;
  };

  describe('assigned before the test loads', () => {
    beforeEach(async () => {
      qtiTest.state = savedState();
      await connect();
    });

    it('restores item variables, test outcomes and position', () => {
      expect(variable(qtiTest, 'ITEM-1', 'RESPONSE')?.value).toBe('B');
      expect(variable(qtiTest, 'ITEM-1', 'completionStatus')?.value).toBe('completed');
      expect(qtiTest.getOutcome('TEST_SCORE')?.value).toBe('0.5');
      expect(qtiTest.sessionContext.navItemRefId).toBe('ITEM-1');
    });

    it('leaves items the state does not mention as they were', () => {
      expect(variable(qtiTest, 'ITEM-2', 'completionStatus')?.value).toBe('not_attempted');
    });

    it('never emits the empty state of a test that is still loading', () => {
      expect(emitted.length).toBeGreaterThan(0);
      for (const state of emitted) {
        expect(state.test.items.find(i => i.identifier === 'ITEM-1')?.variables).toContainEqual({
          identifier: 'RESPONSE',
          type: 'response',
          value: 'B'
        });
      }
    });

    it('hands the restored response and interaction state to the item when it loads', async () => {
      const item = await loadItem();

      expect(item.variables.find(v => v.identifier === 'RESPONSE')?.value).toBe('B');
      expect(item.querySelector<Interaction>('qti-choice-interaction')?.response).toBe('B');
      expect(item.state).toEqual({ RESPONSE: 'opaque-pci-state' });
    });
  });

  describe('assigned after the test has loaded', () => {
    beforeEach(connect);

    it('applies the state and navigates to the restored item', () => {
      const requested: unknown[] = [];
      // Captured and stopped at the target: the real handler would fetch the item's href.
      qtiTest.addEventListener(
        'qti-request-navigation',
        (e: CustomEvent) => {
          requested.push(e.detail);
          e.stopImmediatePropagation();
        },
        { capture: true }
      );

      qtiTest.state = savedState();

      expect(variable(qtiTest, 'ITEM-1', 'RESPONSE')?.value).toBe('B');
      expect(requested).toEqual([{ type: 'item', id: 'ITEM-1' }]);
    });

    it('pushes the state into an item that is already on screen', async () => {
      const item = await loadItem();

      qtiTest.state = savedState({ navItemRefId: null });

      expect(item.variables.find(v => v.identifier === 'RESPONSE')?.value).toBe('B');
      expect(item.state).toEqual({ RESPONSE: 'opaque-pci-state' });
    });

    it('drops a stored position the test no longer has', () => {
      qtiTest.state = savedState({ navItemRefId: 'REMOVED-ITEM', navSectionId: 'REMOVED-SECTION' });

      expect(qtiTest.sessionContext.navItemRefId).toBeUndefined();
      expect(qtiTest.sessionContext.navSectionId).toBeUndefined();
    });

    it('ignores a state of another version', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const before = qtiTest.state;

      qtiTest.state = { ...savedState(), version: 2 } as unknown as QtiTestState;

      expect(qtiTest.state).toEqual(before);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('qti-state-changed', () => {
    beforeEach(connect);

    it('emits when the candidate answers, without declaration metadata or the answer key', async () => {
      const item = await loadItem();
      emitted.length = 0;

      item.querySelector<Interaction>('qti-choice-interaction').saveResponse('A');
      await settle();

      const last = emitted.at(-1);
      expect(last.test.items.find(i => i.identifier === 'ITEM-1')?.variables).toContainEqual({
        identifier: 'RESPONSE',
        type: 'response',
        value: 'A'
      });
      const serialized = JSON.stringify(last);
      expect(serialized).not.toContain('correctResponse');
      expect(serialized).not.toContain('baseType');
      expect(serialized).not.toContain('cardinality');
    });

    it('does not emit when nothing persistable changed', async () => {
      await settle();
      emitted.length = 0;

      // The view lives in the session context but is not part of the stored state.
      qtiTest.sessionContext = { ...qtiTest.sessionContext, view: 'scorer' };
      await settle();

      expect(emitted).toEqual([]);
    });

    it('emits when a host writes a value through updateItemVariables', async () => {
      await settle();
      emitted.length = 0;

      // An external score for an item that has not loaded yet, as a manual-scoring host does.
      qtiTest.updateItemVariables('ITEM-2', [{ identifier: 'SCORE', type: 'outcome', value: '1' }]);
      await settle();

      expect(variable(qtiTest, 'ITEM-2', 'SCORE')?.value).toBe('1');
      expect(emitted.at(-1)?.test.items.find(i => i.identifier === 'ITEM-2')?.variables).toContainEqual({
        identifier: 'SCORE',
        type: 'outcome',
        value: '1'
      });
    });

    it('round-trips: what it emits restores the same state', () => {
      qtiTest.state = savedState({ navItemRefId: null });
      const stored = JSON.parse(JSON.stringify(qtiTest.state)) as QtiTestState;

      qtiTest.state = stored;

      expect(qtiTest.state).toEqual(stored);
    });
  });
});
