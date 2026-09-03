import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import { TestNavigationCorrection } from './test-correction-elements';

import type { TestNavigation } from '@qti-components/test/elements';
import type { ComputedContext } from '@qti-components/base';

/**
 * Behaviour of the QTI-standard `qti-item-session-control show-solution` opt-in
 * on the correction-capable navigation: after each ended attempt it marks the
 * candidate's selection (candidate correction), and once the item is *done* —
 * the candidate reached the optimal outcome or ran out of attempts — it also
 * reveals the correct answer. Correctness/doneness come from the navigation's
 * own optimality assessment, so items with no SCORE but a declared
 * qti-correct-response are judged too. Nothing happens for items that didn't
 * opt in, mirroring the library's default clear-on-change behaviour.
 *
 * The correction subclass is registered under the REAL tag, as in the other
 * correction specs: this file imports no base navigation, so the tag is free.
 */
if (!customElements.get('test-navigation')) {
  customElements.define('test-navigation', TestNavigationCorrection);
}

describe('TestNavigationCorrection show-solution', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // A computed context whose single item carries the given show-solution opt-in
  // and max-attempts — what #revealItemCorrection reads to decide whether to act
  // and when the item is out of attempts.
  const contextWith = (showSolution: boolean, maxAttempts: number): ComputedContext =>
    ({
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [{ identifier: 'item1', active: true, categories: [], maxAttempts, showSolution }]
            }
          ]
        }
      ]
    }) as unknown as ComputedContext;

  // Mount a <test-navigation> with a stubbed assessment item inside it, so a
  // bubbling qti-item-context-updated event resolves back to the item via
  // composedPath()…closest('qti-assessment-item').
  const mount = async (showSolution: boolean, maxAttempts: number) => {
    const nav = document.createElement('test-navigation') as TestNavigation;
    // The only non-optional context read in willUpdate; empty items is enough.
    (nav as unknown as { _testContext: unknown })._testContext = { items: [] };
    container.appendChild(nav);

    const item = document.createElement('qti-assessment-item');
    const showCandidateCorrection = vi.fn();
    const showCorrectResponse = vi.fn();
    Object.assign(item, { showCandidateCorrection, showCorrectResponse });
    nav.appendChild(item);

    // Set after appending so the (optional) connected-item rebuild can't clobber it.
    (nav as unknown as { computedContext: ComputedContext }).computedContext = contextWith(showSolution, maxAttempts);
    await nav.updateComplete;

    return { item, showCandidateCorrection, showCorrectResponse };
  };

  // End an attempt by dispatching a processed context update carrying the given
  // variables. `responseProcessed` marks it as the end of an attempt (vs a plain
  // selection). A scored attempt sets SCORE/MAXSCORE; an unscored-but-declared
  // one sets a RESPONSE variable with a correctResponse.
  const endAttempt = (
    item: HTMLElement,
    {
      variables,
      numAttempts,
      responseProcessed = true
    }: { variables: Array<Record<string, unknown>>; numAttempts: number; responseProcessed?: boolean }
  ) => {
    item.dispatchEvent(
      new CustomEvent('qti-item-context-updated', {
        bubbles: true,
        composed: true,
        detail: {
          responseProcessed,
          itemContext: {
            identifier: 'item1',
            variables: [...variables, { identifier: 'numAttempts', value: `${numAttempts}` }]
          }
        }
      })
    );
  };

  const scored = (score: number, maxScore = 1) => [
    { identifier: 'SCORE', value: `${score}` },
    { identifier: 'MAXSCORE', value: `${maxScore}` }
  ];

  it('marks the wrong answer but does not reveal the correct one before the item is done', async () => {
    const { item, showCandidateCorrection, showCorrectResponse } = await mount(true, 2);

    endAttempt(item, { variables: scored(0), numAttempts: 1 });

    expect(showCandidateCorrection).toHaveBeenCalledWith(true);
    // suboptimal with an attempt remaining → not done → correct answer stays hidden.
    expect(showCorrectResponse).toHaveBeenCalledWith(false);
  });

  it('reveals the correct answer once attempts are exhausted and still incorrect', async () => {
    const { item, showCandidateCorrection, showCorrectResponse } = await mount(true, 2);

    endAttempt(item, { variables: scored(0), numAttempts: 2 });

    expect(showCandidateCorrection).toHaveBeenCalledWith(true);
    expect(showCorrectResponse).toHaveBeenCalledWith(true);
  });

  it('marks the correct pick and reveals the correct answer on a correct attempt', async () => {
    const { item, showCandidateCorrection, showCorrectResponse } = await mount(true, 2);

    endAttempt(item, { variables: scored(1), numAttempts: 1 });

    // Still marks the candidate's pick (accumulate keeps earlier ✘)…
    expect(showCandidateCorrection).toHaveBeenCalledWith(true);
    // …and reveals the correct answer (✔) as soon as SCORE reaches MAXSCORE.
    expect(showCorrectResponse).toHaveBeenCalledWith(true);
  });

  it('judges correctness from a declared correct-response when the item has no SCORE', async () => {
    const { item, showCorrectResponse } = await mount(true, 2);

    // No SCORE/MAXSCORE, but a response variable whose value matches its declared
    // correctResponse — #assessOptimality treats this as optimal → done → reveal.
    endAttempt(item, {
      variables: [{ identifier: 'RESPONSE', type: 'response', value: 'ChoiceA', correctResponse: 'ChoiceA' }],
      numAttempts: 1
    });

    expect(showCorrectResponse).toHaveBeenCalledWith(true);
  });

  it('does nothing when the assessment did not opt in via show-solution', async () => {
    const { item, showCandidateCorrection, showCorrectResponse } = await mount(false, 2);

    endAttempt(item, { variables: scored(0), numAttempts: 2 });

    expect(showCandidateCorrection).not.toHaveBeenCalled();
    expect(showCorrectResponse).not.toHaveBeenCalled();
  });

  it('ignores plain selections that are not a processed attempt', async () => {
    const { item, showCandidateCorrection, showCorrectResponse } = await mount(true, 2);

    endAttempt(item, { variables: scored(0), numAttempts: 1, responseProcessed: false });

    expect(showCandidateCorrection).not.toHaveBeenCalled();
    expect(showCorrectResponse).not.toHaveBeenCalled();
  });
});
