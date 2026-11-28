import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiTest } from '../components/qti-test/qti-test';

/**
 * QTI starts each run of the test's outcome processing from the declared defaults. `TOTAL` adds 1 to
 * itself, as the 1EdTech suite's `SCORE_TOTAL` does, so it shows whether a run starts from the default.
 */
const assessmentTest = html`
  <qti-test navigate="item">
    <test-container>
      <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Submit">
        <qti-outcome-declaration identifier="TOTAL" cardinality="single" base-type="float">
          <qti-default-value><qti-value>0</qti-value></qti-default-value>
        </qti-outcome-declaration>
        <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="simultaneous">
          <qti-assessment-section identifier="S1" title="S1" visible="true"> </qti-assessment-section>
        </qti-test-part>
        <qti-outcome-processing>
          <qti-set-outcome-value identifier="TOTAL">
            <qti-sum>
              <qti-variable identifier="TOTAL"></qti-variable>
              <qti-base-value base-type="float">1</qti-base-value>
            </qti-sum>
          </qti-set-outcome-value>
        </qti-outcome-processing>
      </qti-assessment-test>
    </test-container>
  </qti-test>
`;

describe('test submit', () => {
  let qtiTest: QtiTest;

  beforeEach(async () => {
    render(assessmentTest, document.body);
    qtiTest = document.body.querySelector('qti-test') as QtiTest;
    await qtiTest.updateComplete;
  });

  it('starts every outcome processing run from the declared defaults', () => {
    qtiTest.outcomeProcessing();
    qtiTest.outcomeProcessing();

    expect(Number(qtiTest.getOutcome('TOTAL').value)).toBe(1);
  });

  it('submits on qc-test-submit and announces it', () => {
    const seen: string[] = [];
    qtiTest.addEventListener('qc-test-submitted', () => seen.push(String(qtiTest.getOutcome('TOTAL').value)));

    qtiTest.dispatchEvent(new CustomEvent('qc-test-submit', { bubbles: true, composed: true, detail: {} }));
    qtiTest.dispatchEvent(new CustomEvent('qc-test-submit', { bubbles: true, composed: true, detail: {} }));

    expect(seen).toEqual(['1', '1']);
  });
});
