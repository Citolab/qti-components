
import { QtiEqualRounded } from './qti-equal-rounded';
import { html, render } from 'lit';
import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import "../../../../../lib/qti-components/index";

describe('qti-equal-rounded', () => {
  it('rounded 3 decimals equal', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration  identifier="RESPONSE" base-type="float" cardinality="single">
          <qti-correct-response>
            <qti-value>3.175</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded rounding-mode="significantFigures" figures="2">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector(
      'qti-assessment-item'
    ) as QtiAssessmentItem;
    assessmentItem.responses = [{
      responseIdentifier: 'RESPONSE',
      response: '3.183',
    }]
    expect(qtiEqualRounded.calculate()).toBeTruthy();
  });

 
  it('rounded 3 decimals equal with default rounding-mode', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration  identifier="RESPONSE" base-type="float" cardinality="single">
          <qti-correct-response>
            <qti-value>3.175</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded figures="2">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector(
      'qti-assessment-item'
    ) as QtiAssessmentItem;
    assessmentItem.responses = [{
      responseIdentifier: 'RESPONSE',
      response: '3.183',
    }]
    expect(qtiEqualRounded.calculate()).toBeTruthy();
  });

  it('rounded 3 decimals not equal with default rounding-mode', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration  identifier="RESPONSE" base-type="float" cardinality="single">
          <qti-correct-response>
            <qti-value>3.175</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded figures="3">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector(
      'qti-assessment-item'
    ) as QtiAssessmentItem;
    assessmentItem.responses = [{
      responseIdentifier: 'RESPONSE',
      response: '3.183',
    }]
    expect(qtiEqualRounded.calculate()).toBeFalsy();
  });

  it('rounded 3 decimals equal with rounding mode: decimalPlaces', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration  identifier="RESPONSE" rounding-mode="decimalPlaces" base-type="float" cardinality="single">
          <qti-correct-response>
            <qti-value>1.68572</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded figures="3">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector(
      'qti-assessment-item'
    ) as QtiAssessmentItem;
    assessmentItem.responses = [{
      responseIdentifier: 'RESPONSE',
      response: '1.69',
    }]
    expect(qtiEqualRounded.calculate()).toBeTruthy();
  });

  it('rounded 3 decimals not equal with rounding mode: decimalPlaces', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration  identifier="RESPONSE" rounding-mode="decimalPlaces" base-type="float" cardinality="single">
          <qti-correct-response>
            <qti-value>1.68432</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded figures="3">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector(
      'qti-assessment-item'
    ) as QtiAssessmentItem;
    assessmentItem.responses = [{
      responseIdentifier: 'RESPONSE',
      response: '1.68572',
    }]
    expect(qtiEqualRounded.calculate()).toBeFalsy();
  });
});
