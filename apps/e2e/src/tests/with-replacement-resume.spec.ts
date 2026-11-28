import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';

import { WITH_REPLACEMENT_TEST } from '../stories/conformance/spec/selection/selection.fixtures';

import type { QtiTest, QtiTestState } from '@qti-components/test';

/**
 * A session with a `with-replacement` clone resumes with each instance's own answer (roadmap 1, T4):
 * the clone is stored under its instance id, `ITM-choice#2` (`plans/host-api.md` → Decided).
 *
 * Host: CitoTestUit, the host that stores state: it assigns the stored `state` before the test is in
 * the page and passes the same seed in `qtiContext`. The test selects 3 of its 2 items with
 * replacement; the seed `with-replacement` brings the choice item twice.
 */
describe('a session with a with-replacement clone resumes (CitoTestUit)', () => {
  let host: HTMLDivElement;
  afterEach(() => host?.remove());

  const mount = async (before?: (qtiTest: QtiTest) => void): Promise<QtiTest> => {
    host = document.createElement('div');
    render(
      html`<qti-test navigate="item" .qtiContext=${{ QTI_CONTEXT: { seed: 'with-replacement' } }}>
        <test-navigation>
          <test-container test-url=${WITH_REPLACEMENT_TEST}></test-container>
        </test-navigation>
      </qti-test>`,
      host
    );
    const qtiTest = host.querySelector('qti-test') as QtiTest;
    before?.(qtiTest);
    document.body.append(host);
    await expect.poll(() => qtiTest.testContext.items.length, { timeout: 5000 }).toBe(3);
    return qtiTest;
  };

  const response = (state: QtiTestState, instance: string) =>
    state.test.items.find(item => item.identifier === instance)?.variables.find(v => v.identifier === 'RESPONSE')
      ?.value;

  const stored: QtiTestState = {
    version: 1,
    test: {
      items: [
        { identifier: 'ITM-choice', variables: [{ identifier: 'RESPONSE', type: 'response', value: 'ChoiceA' }] },
        { identifier: 'ITM-choice#2', variables: [{ identifier: 'RESPONSE', type: 'response', value: 'ChoiceB' }] }
      ],
      outcomes: []
    },
    session: { navItemRefId: 'ITM-choice#2' }
  };

  it('presents the same three instances for the same seed', async () => {
    const qtiTest = await mount();
    expect(qtiTest.testContext.items.map(item => item.identifier)).toEqual(['ITM-choice', 'ITM-choice#2', 'ITM-text']);
  });

  it('gives each instance its own answer back, with the clone on screen', async () => {
    const qtiTest = await mount(test => {
      test.state = stored;
    });

    await expect.poll(() => qtiTest.sessionContext.navItemRefId, { timeout: 5000 }).toBe('ITM-choice#2');
    expect(response(qtiTest.state, 'ITM-choice')).toBe('ChoiceA');
    expect(response(qtiTest.state, 'ITM-choice#2')).toBe('ChoiceB');
    expect(qtiTest.state.session.navItemRefId).toBe('ITM-choice#2');
  });
});
