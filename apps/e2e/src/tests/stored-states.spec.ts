import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';

import checkmate1 from './fixtures/stored-states/checkmate-1.json';
import checkmate2 from './fixtures/stored-states/checkmate-2.json';
import checkmate3 from './fixtures/stored-states/checkmate-3.json';
import { STORED_STATES_FIXTURES } from './stored-states.fixtures';

import type { QtiTest } from '@qti-components/test';

/**
 * Stored 9.x states keep restoring (roadmap 1, T1e; `plans/delivery-state.md` → Old states). Every
 * later phase keeps this passing.
 *
 * Host: CitoTestUit (Checkmate). It stores `{ id, navItemId, items }` (its `ExtendedTestContext`)
 * and restores by assigning `testContext` once the test has loaded, then `navigateTo` the stored
 * item. The states are real exports of its demo delivery; see the fixture folder's README.
 */

type StoredVariable = { identifier: string; value: string | number | string[] | null };
type StoredRecord = {
  testContext: { id: string; navItemId: string; items: { identifier: string; variables: StoredVariable[] }[] };
};

const records: [string, StoredRecord][] = [
  ['checkmate-1', checkmate1 as StoredRecord],
  ['checkmate-2', checkmate2 as StoredRecord],
  ['checkmate-3', checkmate3 as StoredRecord]
];

const TEST_URL = `${STORED_STATES_FIXTURES}demo-package/assessment-test.xml`;

/** A stored value as it reads back: 9.x hosts stored numbers as JSON numbers, `qti-test` keeps strings. */
const asRead = (value: StoredVariable['value']) => (typeof value === 'number' ? String(value) : value);

const valueOf = (variables: readonly { identifier: string; value: unknown }[] | undefined, identifier: string) =>
  variables?.find(v => v.identifier === identifier)?.value;

describe('stored 9.x states restore (CitoTestUit)', () => {
  let host: HTMLDivElement;
  afterEach(() => host?.remove());

  const mount = async (): Promise<QtiTest> => {
    host = document.createElement('div');
    document.body.append(host);
    render(
      html`<qti-test navigate="item">
        <test-navigation>
          <test-container test-url=${TEST_URL}></test-container>
        </test-navigation>
      </qti-test>`,
      host
    );
    const qtiTest = host.querySelector('qti-test') as QtiTest;
    // CitoTestUit's guard: assign only once the test has put its item-refs in the context.
    await expect.poll(() => qtiTest.testContext.items.length, { timeout: 5000 }).toBe(16);
    return qtiTest;
  };

  for (const [name, record] of records) {
    describe(name, () => {
      const stored = record.testContext;

      it('restores the answers, scores, attempts and position', async () => {
        const qtiTest = await mount();

        qtiTest.testContext = { ...qtiTest.testContext, items: stored.items as never };
        qtiTest.navigateTo('item', stored.navItemId);

        await expect.poll(() => qtiTest.sessionContext.navItemRefId, { timeout: 5000 }).toBe(stored.navItemId);

        for (const item of stored.items) {
          const restored = qtiTest.testContext.items.find(i => i.identifier === item.identifier)?.variables;
          for (const identifier of ['RESPONSE', 'SCORE', 'numAttempts', 'completionStatus']) {
            expect(
              asRead(valueOf(restored, identifier) as StoredVariable['value']),
              `${item.identifier} ${identifier}`
            ).toEqual(asRead(valueOf(item.variables, identifier) as StoredVariable['value']));
          }
        }
        // Not checked: the answer in the item on screen. Hosts have no public way to reach it until
        // `item(identifier)` ships (plans/host-api.md, roadmap 5).
      });

      it('saves the restored state as a version 1 QtiTestState with the same answers and position', async () => {
        const qtiTest = await mount();

        qtiTest.testContext = { ...qtiTest.testContext, items: stored.items as never };
        qtiTest.navigateTo('item', stored.navItemId);
        await expect.poll(() => qtiTest.sessionContext.navItemRefId, { timeout: 5000 }).toBe(stored.navItemId);

        const state = qtiTest.state;
        expect(state.version).toBe(1);
        expect(state.session.navItemRefId).toBe(stored.navItemId);
        for (const item of stored.items) {
          const saved = state.test.items.find(i => i.identifier === item.identifier)?.variables;
          for (const identifier of ['RESPONSE', 'SCORE', 'numAttempts']) {
            expect(
              asRead(valueOf(saved, identifier) as StoredVariable['value']),
              `${item.identifier} ${identifier}`
            ).toEqual(asRead(valueOf(item.variables, identifier) as StoredVariable['value']));
          }
        }
        // Derived values are never stored (plans/delivery-state.md).
        expect(JSON.stringify(state)).not.toMatch(/"sessionControl"|"done"/);
      });
    });
  }
});
