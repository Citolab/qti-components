import { describe, expect, it } from '@jest/globals';
import { html, render } from 'lit';
// import '../qti-basevalue/qti-basevalue';
import '../../../qti-assessment-item/qti-assessment-item';
import '../../qti-response-processing/qti-response-processing';
import '../../../qti-variable-declaration/qti-outcome-declaration/qti-outcome-declaration';
import './qti-sum';
import './../../qti-rule/qti-set-outcome-value/qti-set-outcome-value';
import './../qti-basevalue/qti-basevalue';
import { QtiSum } from './qti-sum';
import { ItemContext, QtiAssessmentItem } from 'src';

describe('QtiComponent qti-sum', () => {
  it('all true', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="identifier">
        <qti-response-processing>
          <qti-set-outcome-value identifier="SCORE">
            <qti-sum>
              <qti-base-value>1</qti-base-value>
              <qti-base-value>1</qti-base-value>
              <qti-base-value>1</qti-base-value>
            </qti-sum>
          </qti-set-outcome-value>
        </qti-response-processing>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiAssessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    qtiAssessmentItem.processResponse();
    const itemContext = (qtiAssessmentItem as any)._context as ItemContext;
    const scoreVariable = itemContext.variables.find(v => v.identifier === 'SCORE');
    expect(scoreVariable?.value).toEqual('3');
  });

  it('one false should result in false', () => {
    const template = () => html`
      <qti-sum>
        <qti-base-value>1</qti-base-value>
        <qti-base-value>1</qti-base-value>
        <qti-base-value>4</qti-base-value>
      </qti-sum>
    `;
    render(template(), document.body);

    const qtiSum = document.body.querySelector('qti-sum') as QtiSum;
    expect(qtiSum.calculate()).toEqual(6);
  });
});
