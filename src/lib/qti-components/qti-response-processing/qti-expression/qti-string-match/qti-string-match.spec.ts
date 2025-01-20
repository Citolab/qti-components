import '../../../../index';
import { html, render } from 'lit';

import type { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import type { QtiStringMatch } from './qti-string-match';
describe('qti-string-match', () => {
  it('response and correct response match', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>test</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-string-match>
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-string-match>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiStringMatch = document.body.querySelector('qti-string-match') as QtiStringMatch;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiStringMatch.calculate()).toBeTruthy();
  });

  it('match but casing incorrect - casing default', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>TEST</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-string-match case>
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-string-match>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiStringMatch = document.body.querySelector('qti-string-match') as QtiStringMatch;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiStringMatch.calculate()).toBeFalsy();
  });

  it('match but casing incorrect - case sensitive', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>TEST</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-string-match case-sensitive="true">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
          </qti-string-match>
        </qti-equal>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiStringMatch = document.body.querySelector('qti-string-match') as QtiStringMatch;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiStringMatch.calculate()).toBeFalsy();
  });

  it('match casing incorrect, case insensitive', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>TEST</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-string-match case-sensitive="false">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
          </qti-string-match>
        </qti-equal>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiStringMatch = document.body.querySelector('qti-string-match') as QtiStringMatch;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiStringMatch.calculate()).toBeTruthy();
  });

  it('response and incorrect response do not match', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>correct</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-string-match>
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-string-match>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiStringMatch = document.body.querySelector('qti-string-match') as QtiStringMatch;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiStringMatch.calculate()).toBeFalsy();
  });
});
