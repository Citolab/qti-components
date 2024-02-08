import '@citolab/qti-components/qti-components';

import { html, render } from 'lit';
import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import { QtiContains } from './qti-contains';

describe('qti-contains', () => {
  it('should check if the variable identified in the first child is contained in the second one', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="gapmatch_1" cardinality="multiple" base-type="directedPair">
          <qti-correct-response>
            <qti-value>GT1 G1</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-contains>
          <qti-variable identifier="gapmatch_1"></qti-variable>
          <qti-multiple>
            <qti-base-value base-type="directedPair">GT1 G1</qti-base-value>
          </qti-multiple>
        </qti-contains>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiContains = document.body.querySelector('qti-contains') as QtiContains;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('gapmatch_1', ['GT1 G1']);

    expect(qtiContains.calculate()).toBeTruthy();
  });

  it('should check if the first expression is contained in the second one', () => {
    const template = () =>
      html` <qti-assessment-item>
        <qti-response-declaration identifier="gapmatch_1" cardinality="single" base-type="directedPair">
        </qti-response-declaration>
        <qti-contains>
          <qti-variable identifier="gapmatch_1"></qti-variable>
          <qti-multiple>
            <qti-base-value base-type="directedPair">GTa Ga</qti-base-value>
            <qti-base-value base-type="directedPair">GTb Gb</qti-base-value>
            <qti-base-value base-type="directedPair">GTc Gc</qti-base-value>
          </qti-multiple>
        </qti-contains>
      </qti-assessment-item>`;
    render(template(), document.body);

    const qtiContains = document.body.querySelector('qti-contains') as QtiContains;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('gapmatch_1', 'GTb Gb');

    expect(qtiContains.calculate()).toBeTruthy();
  });
});
