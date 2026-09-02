import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiTestFeedback } from './qti-test-feedback';
import type { QtiTest } from '../qti-test/qti-test';

/**
 * Test feedback is presented per its `access` characteristic: `during` after
 * each instance of outcome processing, `atEnd` only at the conclusion of the
 * test — or of the test part the feedback sits in.
 *
 * Each feedback keys off its own outcome, set by hand, and
 * `qti-outcome-processing` is left empty — so these cover the presentation
 * rules rather than the processing that feeds them.
 */
const assessmentTest = html`
  <qti-test navigate="item">
    <test-container>
      <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Feedback">
        <qti-outcome-declaration identifier="FB_PART" cardinality="single" base-type="identifier">
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="FB_TEST" cardinality="single" base-type="identifier">
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="FB_DURING" cardinality="single" base-type="identifier">
        </qti-outcome-declaration>
        <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="simultaneous">
          <qti-assessment-section identifier="S1" title="S1" visible="true"> </qti-assessment-section>
          <qti-test-feedback identifier="part-over" outcome-identifier="FB_PART" access="atEnd" show-hide="show">
            End of part
          </qti-test-feedback>
        </qti-test-part>
        <qti-test-feedback identifier="test-over" outcome-identifier="FB_TEST" access="atEnd" show-hide="show">
          End of test
        </qti-test-feedback>
        <qti-test-feedback identifier="in-progress" outcome-identifier="FB_DURING" access="during" show-hide="show">
          Still going
        </qti-test-feedback>
        <qti-outcome-processing></qti-outcome-processing>
      </qti-assessment-test>
    </test-container>
  </qti-test>
`;

describe('qti-test-feedback access', () => {
  let container: HTMLDivElement;
  let qtiTest: QtiTest;

  const feedback = (identifier: string) =>
    container.querySelector<QtiTestFeedback>(`qti-test-feedback[identifier='${identifier}']`);

  /** Never presented — an unevaluated feedback has no showStatus at all. */
  const isHidden = (identifier: string) => feedback(identifier)?.showStatus !== 'on';

  beforeEach(async () => {
    // A fresh container per case: rendering the same template into a shared
    // root reuses the elements, so showStatus would leak between tests.
    container = document.createElement('div');
    document.body.appendChild(container);

    render(assessmentTest, container);
    qtiTest = container.querySelector('qti-test') as QtiTest;
    await qtiTest.updateComplete;
    // Every feedback's outcome names it, so scoping is what separates them.
    qtiTest.updateOutcomeVariable('FB_PART', 'part-over');
    qtiTest.updateOutcomeVariable('FB_TEST', 'test-over');
    qtiTest.updateOutcomeVariable('FB_DURING', 'in-progress');
  });

  afterEach(() => container.remove());

  it('shows during-feedback on an in-flight processing run', () => {
    qtiTest.outcomeProcessing();

    expect(feedback('in-progress')?.showStatus).toBe('on');
  });

  it('leaves atEnd feedback hidden on an in-flight run', () => {
    qtiTest.outcomeProcessing();

    expect(isHidden('test-over')).toBe(true);
    expect(isHidden('part-over')).toBe(true);
  });

  it('shows test-root feedback at the conclusion of the test', () => {
    qtiTest.outcomeProcessing({ atEnd: true });

    expect(feedback('test-over')?.showStatus).toBe('on');
  });

  it('does not show part feedback at the conclusion of the test', () => {
    qtiTest.outcomeProcessing({ atEnd: true });

    expect(isHidden('part-over')).toBe(true);
  });

  it('shows part feedback at the conclusion of its own part', () => {
    qtiTest.outcomeProcessing({ atEnd: true, partId: 'P1' });

    expect(feedback('part-over')?.showStatus).toBe('on');
    expect(isHidden('test-over')).toBe(true);
  });

  it('runs outcome processing when a part reports completion', () => {
    const testElement = document.body.querySelector('qti-assessment-test')!;

    testElement.dispatchEvent(new CustomEvent('qti-part-completed', { detail: { partId: 'P1' }, bubbles: true }));

    expect(feedback('part-over')?.showStatus).toBe('on');
  });

  it('runs outcome processing when the test reports completion', () => {
    const testElement = document.body.querySelector('qti-assessment-test')!;

    testElement.dispatchEvent(new CustomEvent('qti-test-completed', { bubbles: true }));

    expect(feedback('test-over')?.showStatus).toBe('on');
  });
});
