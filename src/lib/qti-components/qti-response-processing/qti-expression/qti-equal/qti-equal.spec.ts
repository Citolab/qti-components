import '../../../../index';
import { html, render } from 'lit';

import type { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import type { QtiEqual } from './qti-equal';

describe('qti-equal', () => {
  it('response and correct response match', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>test</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal tolerance-mode="exact">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqual = document.body.querySelector('qti-equal') as QtiEqual;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiEqual.calculate()).toBeTruthy();
  });

  it('response and correct response do not match', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>correct</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal tolerance-mode="exact">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqual = document.body.querySelector('qti-equal') as QtiEqual;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiEqual.calculate()).toBeFalsy();
  });
});
