import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';

describe('qti-response-processing-fragment', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  const item = (rules: unknown) => {
    render(
      html`
        <qti-assessment-item identifier="ITEM">
          <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"> </qti-outcome-declaration>
          <qti-outcome-declaration identifier="BONUS" cardinality="single" base-type="float"> </qti-outcome-declaration>
          <qti-response-processing>${rules}</qti-response-processing>
        </qti-assessment-item>
      `,
      testContainer
    );
    return testContainer.querySelector('qti-assessment-item') as QtiAssessmentItem;
  };

  const valueOf = (assessmentItem: QtiAssessmentItem, identifier: string) =>
    assessmentItem.variables.find(v => v.identifier === identifier)?.value;

  it('runs its rules in place', () => {
    const assessmentItem = item(html`
      <qti-response-processing-fragment>
        <qti-set-outcome-value identifier="SCORE">
          <qti-base-value base-type="float">5</qti-base-value>
        </qti-set-outcome-value>
        <qti-set-outcome-value identifier="BONUS">
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-processing-fragment>
    `);
    assessmentItem.processResponse();

    expect(valueOf(assessmentItem, 'SCORE')).toBe('5');
    expect(valueOf(assessmentItem, 'BONUS')).toBe('2');
  });

  it('is transparent: rules after it still run', () => {
    const assessmentItem = item(html`
      <qti-response-processing-fragment>
        <qti-set-outcome-value identifier="SCORE">
          <qti-base-value base-type="float">5</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-processing-fragment>
      <qti-set-outcome-value identifier="BONUS">
        <qti-base-value base-type="float">7</qti-base-value>
      </qti-set-outcome-value>
    `);
    assessmentItem.processResponse();

    expect(valueOf(assessmentItem, 'SCORE')).toBe('5');
    expect(valueOf(assessmentItem, 'BONUS')).toBe('7');
  });

  it('an empty fragment does nothing', () => {
    const assessmentItem = item(html`<qti-response-processing-fragment></qti-response-processing-fragment>`);

    expect(() => assessmentItem.processResponse()).not.toThrow();
    expect(valueOf(assessmentItem, 'SCORE')).toBe('0');
  });
});
