import { describe, it, expect } from 'vitest';
import { html, render } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiMapResponse } from './qti-map-response';
describe('qti-map-response', () => {
  it('should the value of the mapping by response value', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="interaction_1" cardinality="single" base-type="string">
          <qti-correct-response>
            <qti-value>a</qti-value>
          </qti-correct-response>
          <qti-mapping default-value="0">
            <qti-map-entry map-key="a" mapped-value="0"></qti-map-entry>
            <qti-map-entry map-key="b" mapped-value="1"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>

        <qti-map-response identifier="interaction_1"></qti-map-response>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    // (assessmentItem.variables.find(vr => vr.identifier === 'interaction_1') as ResponseVariable).value = 'b';
    // assessmentItem.getVariable('interaction_1').value = 'b';
    assessmentItem.updateResponseVariable('interaction_1', 'b');

    const qtiMapResponse = document.body.querySelector('qti-map-response') as QtiMapResponse;
    expect(qtiMapResponse.calculate()).toEqual(1);
  });
});

describe('qti-map-response', () => {
  it('should map the value correctly when case-sensitive is true', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="interaction_1" cardinality="single" base-type="string">
          <qti-correct-response>
            <qti-value>a</qti-value>
          </qti-correct-response>
          <qti-mapping default-value="0">
            <qti-map-entry map-key="A" mapped-value="2" case-sensitive="true"></qti-map-entry>
            <qti-map-entry map-key="a" mapped-value="1" case-sensitive="true"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>

        <qti-map-response identifier="interaction_1"></qti-map-response>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('interaction_1', 'a');

    const qtiMapResponse = document.body.querySelector('qti-map-response') as QtiMapResponse;
    expect(qtiMapResponse.getResult()).toEqual(1);
  });

  it('should map the value correctly when case-sensitive is default', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="interaction_1" cardinality="single" base-type="string">
          <qti-correct-response>
            <qti-value>a</qti-value>
          </qti-correct-response>
          <qti-mapping default-value="0">
            <qti-map-entry map-key="A" mapped-value="2"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>

        <qti-map-response identifier="interaction_1"></qti-map-response>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('interaction_1', 'a');

    const qtiMapResponse = document.body.querySelector('qti-map-response') as QtiMapResponse;
    expect(qtiMapResponse.getResult()).toEqual(2);
  });

  describe('qti-map-response', () => {
    it('should map the value 2 correctly when case-sensitive is true', () => {
      const template = () => html`
        <qti-assessment-item>
          <qti-response-declaration identifier="interaction_1" cardinality="single" base-type="string">
            <qti-correct-response>
              <qti-value>a</qti-value>
            </qti-correct-response>
            <qti-mapping default-value="0" case-sensitive="true">
              <qti-map-entry map-key="A" mapped-value="2" case-sensitive="true"></qti-map-entry>
              <qti-map-entry map-key="a" mapped-value="1" case-sensitive="true"></qti-map-entry>
            </qti-mapping>
          </qti-response-declaration>

          <qti-map-response identifier="interaction_1"></qti-map-response>
        </qti-assessment-item>
      `;
      render(template(), document.body);

      const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
      assessmentItem.updateResponseVariable('interaction_1', 'A');

      const qtiMapResponse = document.body.querySelector('qti-map-response') as QtiMapResponse;
      expect(qtiMapResponse.getResult()).toEqual(2);
    });
  });

  it('should map the value correctly when case-sensitive is false', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="interaction_1" cardinality="single" base-type="string">
          <qti-correct-response>
            <qti-value>a</qti-value>
          </qti-correct-response>
          <qti-mapping default-value="0">
            <qti-map-entry map-key="A" mapped-value="2" case-sensitive="false"></qti-map-entry>
            <qti-map-entry map-key="a" mapped-value="1" case-sensitive="false"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>

        <qti-map-response identifier="interaction_1"></qti-map-response>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('interaction_1', 'a');

    const qtiMapResponse = document.body.querySelector('qti-map-response') as QtiMapResponse;
    expect(qtiMapResponse.getResult()).toEqual(2);
  });

  it('should map not the value correctly when case-sensitive is true', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="interaction_1" cardinality="single" base-type="string">
          <qti-correct-response>
            <qti-value>a</qti-value>
          </qti-correct-response>
          <qti-mapping default-value="0">
            <qti-map-entry map-key="A" mapped-value="2" case-sensitive="true"></qti-map-entry>
            <qti-map-entry map-key="a" mapped-value="1" case-sensitive="true"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>

        <qti-map-response identifier="interaction_1"></qti-map-response>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('interaction_1', 'b');

    const qtiMapResponse = document.body.querySelector('qti-map-response') as QtiMapResponse;
    expect(qtiMapResponse.getResult()).toEqual(0);
  });
});
