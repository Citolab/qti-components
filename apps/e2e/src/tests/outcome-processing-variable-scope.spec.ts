import '@citolab/qti-components';

import { html, render } from 'lit';
import { describe, beforeEach, test, expect } from 'vitest';

import type { QtiTest } from '@qti-components/test';

/**
 * Test-level variable scope.
 *
 * An assessmentTest's outcome processing must be able to read a test-level
 * outcome it has just set, through the `variable` expression — this is how the
 * QTI spec's own feedback examples work: set a total, then branch on it in an
 * outcomeCondition. The `variable` expression therefore resolves item scope
 * first and test-level outcomes second.
 */
const assessmentTest = html`
  <qti-test navigate="item">
    <test-container>
      <qti-assessment-test
        xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
        identifier="T1"
        title="Variable scope test"
      >
        <qti-outcome-declaration identifier="TEST_SCORE" cardinality="single" base-type="float">
          <qti-default-value><qti-value>0</qti-value></qti-default-value>
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="TEST_RESULT" cardinality="single" base-type="identifier">
        </qti-outcome-declaration>
        <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="simultaneous">
          <qti-assessment-section identifier="S1" title="S1" visible="true"> </qti-assessment-section>
        </qti-test-part>
        <qti-outcome-processing>
          <qti-set-outcome-value identifier="TEST_SCORE">
            <qti-base-value base-type="float">2</qti-base-value>
          </qti-set-outcome-value>
          <qti-outcome-condition>
            <qti-outcome-if>
              <!-- reads the test-level outcome set immediately above -->
              <qti-gte>
                <qti-variable identifier="TEST_SCORE"></qti-variable>
                <qti-base-value base-type="float">2</qti-base-value>
              </qti-gte>
              <qti-set-outcome-value identifier="TEST_RESULT">
                <qti-base-value base-type="identifier">ENCOURAGE</qti-base-value>
              </qti-set-outcome-value>
            </qti-outcome-if>
            <qti-outcome-else>
              <qti-set-outcome-value identifier="TEST_RESULT">
                <qti-base-value base-type="identifier">REMEDIATE</qti-base-value>
              </qti-set-outcome-value>
            </qti-outcome-else>
          </qti-outcome-condition>
        </qti-outcome-processing>
      </qti-assessment-test>
    </test-container>
  </qti-test>
`;

const outcomeOf = (qtiTest: QtiTest, identifier: string) =>
  qtiTest.testContext.testOutcomeVariables?.find(v => v.identifier === identifier)?.value ?? null;

describe('outcome processing reads test-level outcomes through qti-variable', () => {
  let qtiTest: QtiTest;

  beforeEach(async () => {
    render(assessmentTest, document.body);
    qtiTest = document.body.querySelector('qti-test') as QtiTest;
    await qtiTest.updateComplete;
  });

  test('resolves a test-level outcome the same processing run has set', () => {
    qtiTest.outcomeProcessing();

    expect(outcomeOf(qtiTest, 'TEST_SCORE')).toBe('2');
    expect(outcomeOf(qtiTest, 'TEST_RESULT')).toBe('ENCOURAGE');
  });
});
