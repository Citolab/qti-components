import { html, render } from 'lit';
import { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';
import { describe, expect, it, beforeEach } from '@jest/globals';
import '../../../qti-components/index';
import { ResponseInteraction } from '../../../qti-components/index';

const match_correct_item = html` <qti-assessment-item identifier="choice" title="Unattended Luggage">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>ChoiceA</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration base-type="float" cardinality="single" identifier="SCORE"></qti-outcome-declaration>

  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="ChoiceA">You must stay with your luggage at all times.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceB">Do not let someone else look after your luggage.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceC">Remember your luggage when you leave.</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>

  <qti-response-processing
    template="https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct.xml"
  ></qti-response-processing>
</qti-assessment-item>`;

describe('qti-response-processing', () => {
  beforeEach(async () => {
    const template = () => match_correct_item;
    render(template(), document.body);
  });

  it('match correct 1', async () => {
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const responses = {
      response: 'ChoiceA',
      responseIdentifier: 'RESPONSE'
    } as ResponseInteraction;

    assessmentItem.responses = [responses];
    assessmentItem.processResponse();
    const score = assessmentItem.getOutcome('SCORE');
    expect(score.value).toEqual('1');
  });

  it('match correct 0', async () => {
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const responses = {
      response: 'choiceB',
      responseIdentifier: 'RESPONSE'
    } as ResponseInteraction;

    assessmentItem.responses = [responses];
    assessmentItem.processResponse();
    expect(+assessmentItem.getOutcome('SCORE').value).toEqual(0);
  });
});
