import '../../../index';
import { html, render } from 'lit';

import type { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';

// import { unitTestItem } from "./qti-responseprocessing-map-response.stories";
const unitTestItem = html`<qti-assessment-item
  xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
  identifier="qti3-choice-multiple-01"
  title="Composition of Water qti3"
  adaptive="false"
  time-dependent="false"
>
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
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="0">
      <qti-prompt>Which of the following elements are used to form water?</qti-prompt>
      <qti-simple-choice identifier="H" fixed="false">Hydrogen</qti-simple-choice>
      <qti-simple-choice identifier="He" fixed="false">Helium</qti-simple-choice>
      <qti-simple-choice identifier="C" fixed="false">Carbon</qti-simple-choice>
      <qti-simple-choice identifier="O" fixed="false">Oxygen</qti-simple-choice>
      <qti-simple-choice identifier="N" fixed="false">Nitrogen</qti-simple-choice>
      <qti-simple-choice identifier="Cl" fixed="false">Chlorine</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing
    template="https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml"
  ></qti-response-processing>
</qti-assessment-item>`;

describe('qti-response-processed', () => {
  beforeEach(async () => {
    const template = () => unitTestItem;
    render(template(), document.body);
  });

  it('map response 2', async () => {
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', ['H', 'O']);

    assessmentItem.processResponse();
    expect(+assessmentItem.getOutcome('SCORE').value).toEqual(2);
  });

  it('map response 1', async () => {
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('RESPONSE', ['O']);

    assessmentItem.processResponse();
    expect(+assessmentItem.getOutcome('SCORE').value).toEqual(1);
  });
});
