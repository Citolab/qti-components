import '@citolab/qti-components';
import { html, render } from 'lit';

describe('qti-outcome-condition', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  });

  function setupQtiAssessmentItem() {
    const template = html`<qti-assessment-item
      identifier="OUTCOME_CONDITION_ITEM"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response>
          <qti-value>B</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="GRADE" cardinality="single" base-type="identifier"></qti-outcome-declaration>
      <qti-item-body>
        <qti-choice-interaction max-choices="1" response-identifier="RESPONSE">
          <qti-simple-choice identifier="A">A</qti-simple-choice>
          <qti-simple-choice identifier="B">B</qti-simple-choice>
          <qti-simple-choice identifier="C">C</qti-simple-choice>
        </qti-choice-interaction>
      </qti-item-body>
      <qti-response-processing>
        <qti-outcome-condition>
          <qti-outcome-if>
            <qti-match>
              <qti-variable identifier="RESPONSE"></qti-variable>
              <qti-base-value base-type="identifier">B</qti-base-value>
            </qti-match>
            <qti-set-outcome-value identifier="GRADE">
              <qti-base-value base-type="identifier">pass</qti-base-value>
            </qti-set-outcome-value>
          </qti-outcome-if>
          <qti-outcome-else-if>
            <qti-match>
              <qti-variable identifier="RESPONSE"></qti-variable>
              <qti-base-value base-type="identifier">A</qti-base-value>
            </qti-match>
            <qti-set-outcome-value identifier="GRADE">
              <qti-base-value base-type="identifier">partial</qti-base-value>
            </qti-set-outcome-value>
          </qti-outcome-else-if>
          <qti-outcome-else>
            <qti-set-outcome-value identifier="GRADE">
              <qti-base-value base-type="identifier">fail</qti-base-value>
            </qti-set-outcome-value>
          </qti-outcome-else>
        </qti-outcome-condition>
      </qti-response-processing>
    </qti-assessment-item>`;

    render(template, container);
    return container.querySelector('qti-assessment-item');
  }

  it('runs the outcome-if branch when its expression is true', () => {
    const assessmentItem = setupQtiAssessmentItem();
    assessmentItem.updateResponseVariable('RESPONSE', 'B');
    assessmentItem.processResponse();
    expect(assessmentItem.getOutcome('GRADE').value).toBe('pass');
  });

  it('runs the outcome-else-if branch when only its expression is true', () => {
    const assessmentItem = setupQtiAssessmentItem();
    assessmentItem.updateResponseVariable('RESPONSE', 'A');
    assessmentItem.processResponse();
    expect(assessmentItem.getOutcome('GRADE').value).toBe('partial');
  });

  it('runs the outcome-else branch when no expression is true', () => {
    const assessmentItem = setupQtiAssessmentItem();
    assessmentItem.updateResponseVariable('RESPONSE', 'C');
    assessmentItem.processResponse();
    expect(assessmentItem.getOutcome('GRADE').value).toBe('fail');
  });
});
