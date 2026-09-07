import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../register';

import type { TestNavigation } from './test-navigation';
import type { QtiAssessmentTest } from '../qti-assessment-test/qti-assessment-test';

/**
 * The candidate-facing events `<test-navigation>` handles all resolve the active
 * item through the connected test element. That element only exists once the
 * test document has loaded, and the navigation buttons are clickable before
 * then — a failed assessment.xml fetch leaves them enabled indefinitely — so
 * each handler has to tolerate a missing test, item-ref, assessment item or
 * session context and simply do nothing.
 *
 * `test-show-correct-response` and `test-show-candidate-correction` are not
 * covered here: they are handled by `TestNavigationCorrection` in
 * qti-corrections, which already resolves the item through optional chaining.
 */
describe('TestNavigation event handlers without a loaded test', () => {
  let container: HTMLDivElement;
  let onError: (event: ErrorEvent) => void;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // An exception inside an event listener never propagates out of
    // dispatchEvent — it surfaces as an uncaught error on window, so that is
    // what these tests have to assert on.
    onError = vi.fn<(event: ErrorEvent) => void>();
    window.addEventListener('error', onError);
  });

  afterEach(() => {
    window.removeEventListener('error', onError);
    container.remove();
  });

  /** A `<test-navigation>` with the one context willUpdate reads unconditionally. */
  const mountNavigation = async (): Promise<TestNavigation> => {
    const nav = document.createElement('test-navigation') as TestNavigation;
    (nav as unknown as { _testContext: unknown })._testContext = { items: [] };
    container.appendChild(nav);
    await nav.updateComplete;
    return nav;
  };

  /**
   * Stand in for the loaded `<qti-assessment-test>`: an element holding one
   * item-ref, whose `assessmentItem` is the given stub — or absent, for the case
   * where the ref exists but its item has not rendered yet.
   */
  const connectTest = (nav: TestNavigation, assessmentItem?: unknown): void => {
    const test = document.createElement('div');
    test.innerHTML = `<qti-assessment-item-ref identifier="item1"></qti-assessment-item-ref>`;
    if (assessmentItem !== undefined) {
      // `assessmentItem` is a getter on the real element, so it has to be
      // shadowed on the instance rather than assigned.
      Object.defineProperty(test.querySelector('qti-assessment-item-ref')!, 'assessmentItem', {
        value: assessmentItem,
        configurable: true
      });
    }
    nav.dispatchEvent(
      new CustomEvent('qti-assessment-test-connected', { detail: test as unknown as QtiAssessmentTest })
    );
  };

  const setSessionContext = (nav: TestNavigation): void => {
    (nav as unknown as { _sessionContext: unknown })._sessionContext = { navItemRefId: 'item1' };
  };

  const candidateEvents = ['test-end-attempt', 'test-update-outcome-variable'];

  it.each(candidateEvents)('handles %s without a connected test', async eventName => {
    const nav = await mountNavigation();
    setSessionContext(nav);

    nav.dispatchEvent(
      new CustomEvent(eventName, { detail: { assessmentItemRefId: 'item1', outcomeVariableId: 'SCORE', value: '1' } })
    );
    await nav.updateComplete;

    expect(onError).not.toHaveBeenCalled();
  });

  it.each(candidateEvents)('handles %s without a session context', async eventName => {
    const nav = await mountNavigation();
    connectTest(nav, { processResponse: vi.fn() });
    await nav.updateComplete;

    nav.dispatchEvent(new CustomEvent(eventName, { detail: {} }));
    await nav.updateComplete;

    expect(onError).not.toHaveBeenCalled();
  });

  it.each(candidateEvents)('handles %s when the item-ref has no assessment item', async eventName => {
    const nav = await mountNavigation();
    setSessionContext(nav);
    connectTest(nav);
    await nav.updateComplete;

    nav.dispatchEvent(
      new CustomEvent(eventName, { detail: { assessmentItemRefId: 'item1', outcomeVariableId: 'SCORE', value: '1' } })
    );
    await nav.updateComplete;

    expect(onError).not.toHaveBeenCalled();
  });

  /**
   * Autoscoring resolves the item from the event's own path rather than the
   * session context, so it has its own way of finding nothing: an interaction
   * change that did not come from inside an assessment item.
   */
  it('handles qti-interaction-changed raised outside an assessment item while autoscoring', async () => {
    const nav = await mountNavigation();
    nav.autoScoreItems = true;
    setSessionContext(nav);
    connectTest(nav, { processResponse: vi.fn() });
    await nav.updateComplete;

    nav.dispatchEvent(new CustomEvent('qti-interaction-changed', { detail: {} }));
    await nav.updateComplete;

    expect(onError).not.toHaveBeenCalled();
  });

  it('still ends the attempt on the active item once the test is loaded', async () => {
    const nav = await mountNavigation();
    setSessionContext(nav);
    const processResponse = vi.fn();
    connectTest(nav, { processResponse });
    await nav.updateComplete;

    nav.dispatchEvent(new CustomEvent('test-end-attempt'));
    await nav.updateComplete;

    expect(processResponse).toHaveBeenCalledWith(true, false);
    expect(onError).not.toHaveBeenCalled();
  });

  it('still sets the outcome variable on the named item once the test is loaded', async () => {
    const nav = await mountNavigation();
    setSessionContext(nav);
    const setOutcomeVariable = vi.fn();
    connectTest(nav, { setOutcomeVariable });
    await nav.updateComplete;

    nav.dispatchEvent(
      new CustomEvent('test-update-outcome-variable', {
        detail: { assessmentItemRefId: 'item1', outcomeVariableId: 'SCORE', value: '1' }
      })
    );
    await nav.updateComplete;

    expect(setOutcomeVariable).toHaveBeenCalledWith('SCORE', '1');
    expect(onError).not.toHaveBeenCalled();
  });
});
