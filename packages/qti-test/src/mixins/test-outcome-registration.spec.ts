import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiTest } from '../components/qti-test/qti-test';

/**
 * Test-level outcome declarations register themselves into the test context by
 * dispatching `qti-register-variable` as they connect, which the test host
 * collects into `testContext.testOutcomeVariables`.
 *
 * Those declarations are children of `qti-assessment-test`, so they connect —
 * and register — before the test element itself announces
 * `qti-assessment-test-connected`. Anything that resets the test context on
 * that announcement therefore throws their registrations away, and every later
 * read of a test-level outcome finds nothing declared.
 */
const assessmentTest = html`
  <qti-test navigate="item">
    <test-container>
      <qti-assessment-test
        xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
        identifier="T1"
        title="Outcome registration"
      >
        <qti-outcome-declaration identifier="TEST_SCORE" cardinality="single" base-type="float">
          <qti-default-value><qti-value>0</qti-value></qti-default-value>
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="TEST_RESULT" cardinality="single" base-type="identifier">
        </qti-outcome-declaration>
        <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="simultaneous">
          <qti-assessment-section identifier="S1" title="S1" visible="true"> </qti-assessment-section>
        </qti-test-part>
      </qti-assessment-test>
    </test-container>
  </qti-test>
`;

describe('test-level outcome registration', () => {
  let qtiTest: QtiTest;

  beforeEach(async () => {
    render(assessmentTest, document.body);
    qtiTest = document.body.querySelector('qti-test') as QtiTest;
    await qtiTest.updateComplete;
  });

  it('keeps the declarations the test document registered', () => {
    const declared = qtiTest.testContext.testOutcomeVariables?.map(v => v.identifier) ?? [];

    expect(declared).toContain('TEST_SCORE');
    expect(declared).toContain('TEST_RESULT');
  });

  it('can read a declared test-level outcome back', () => {
    expect(qtiTest.getOutcome('TEST_SCORE')).toBeTruthy();
  });

  it('can set a declared test-level outcome', () => {
    qtiTest.updateOutcomeVariable('TEST_RESULT', 'ENCOURAGE');

    expect(qtiTest.getOutcome('TEST_RESULT')?.value).toBe('ENCOURAGE');
  });
});
