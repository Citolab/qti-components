import '@citolab/qti-components/qti-components';

import { html, render } from 'lit';
import { QtiAssessmentItem, QtiMapResponse } from '../../../../../index';

describe('qti-mapping', () => {
  it('correct', () => {
    const template = () =>
      html`<qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
          <qti-correct-response>
            <qti-value>H</qti-value>
            <qti-value>O</qti-value>
          </qti-correct-response>
          <qti-mapping lower-bound="0" upper-bound="2" default-value="-2">
            <qti-map-entry map-key="H" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="O" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="Cl" mapped-value="-1"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="0"> </qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-map-response identifier="RESPONSE"> </qti-map-response>
        </qti-response-processing>
      </qti-assessment-item>`;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('RESPONSE', ['H', 'O']);

    const mapResponse = assessmentItem.querySelector('qti-map-response') as QtiMapResponse;
    const score = mapResponse.calculate();
    expect(score).toEqual(2);
  });

  it('only 1 correct', () => {
    const template = () =>
      html`<qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
          <qti-correct-response>
            <qti-value>H</qti-value>
            <qti-value>O</qti-value>
          </qti-correct-response>
          <qti-mapping lower-bound="0" upper-bound="2" default-value="-2">
            <qti-map-entry map-key="H" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="O" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="Cl" mapped-value="-1"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="0"> </qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-map-response identifier="RESPONSE"> </qti-map-response>
        </qti-response-processing>
      </qti-assessment-item>`;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('RESPONSE', ['H']);

    const mapResponse = assessmentItem.querySelector('qti-map-response') as QtiMapResponse;
    const score = mapResponse.calculate();
    expect(score).toEqual(1);
  });

  it('1 correct 1 wrong', () => {
    const template = () =>
      html`<qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
          <qti-correct-response>
            <qti-value>H</qti-value>
            <qti-value>O</qti-value>
          </qti-correct-response>
          <qti-mapping lower-bound="0" upper-bound="2" default-value="-2">
            <qti-map-entry map-key="H" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="O" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="Cl" mapped-value="-1"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="0"> </qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-map-response identifier="RESPONSE"> </qti-map-response>
        </qti-response-processing>
      </qti-assessment-item>`;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', ['H', 'Cl']);

    const mapResponse = assessmentItem.querySelector('qti-map-response') as QtiMapResponse;
    const score = mapResponse.calculate();
    expect(score).toEqual(0);
  });

  it('1 wrong lowerbound should set 0', () => {
    const template = () =>
      html`<qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
          <qti-correct-response>
            <qti-value>H</qti-value>
            <qti-value>O</qti-value>
          </qti-correct-response>
          <qti-mapping lower-bound="0" upper-bound="2" default-value="-2">
            <qti-map-entry map-key="H" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="O" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="Cl" mapped-value="-1"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="0"> </qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-map-response identifier="RESPONSE"> </qti-map-response>
        </qti-response-processing>
      </qti-assessment-item>`;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', ['Cl']);

    const mapResponse = assessmentItem.querySelector('qti-map-response') as QtiMapResponse;
    const score = mapResponse.calculate();
    expect(score).toEqual(0);
  });

  it('correct - upperbound', () => {
    const template = () =>
      html`<qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
          <qti-correct-response>
            <qti-value>H</qti-value>
            <qti-value>O</qti-value>
          </qti-correct-response>
          <qti-mapping lower-bound="0" upper-bound="1" default-value="-2">
            <qti-map-entry map-key="H" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="O" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="Cl" mapped-value="-1"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="0"></qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-map-response identifier="RESPONSE"> </qti-map-response>
        </qti-response-processing>
      </qti-assessment-item>`;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', ['H', 'O']);

    const mapResponse = assessmentItem.querySelector('qti-map-response') as QtiMapResponse;
    const score = mapResponse.calculate();
    expect(score).toEqual(1);
  });
});
