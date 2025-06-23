import { html, render } from 'lit';
import { expect, describe, it, vi } from 'vitest';

import './../../../index';
import type { QtiLookupOutcomeValue } from './qti-lookup-outcome-value';

describe('qti-lookup-outcome-value', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  });

  function setupQtiAssessmentItem2() {
    const container = document.createElement('div'); // Create a new container for each test
    document.body.appendChild(container);
    const template = html`<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd
                        http://www.w3.org/1998/Math/MathML https://purl.imsglobal.org/spec/mathml/v3p0/schema/xsd/mathml3.xsd
                        http://www.w3.org/2001/10/synthesis https://purl.imsglobal.org/spec/ssml/v1p1/schema/xsd/ssmlv1p1-core.xsd"
      title="Ik heb een stomme naam 3"
      time-dependent="false"
      adaptive="false"
      identifier="_eb6b2d2b-5548-49fa-b73a-217b8e62ed35"
      label="20011 D "
      xml:lang="nl-NL"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response interpretation="B">
          <qti-value>B</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="RAWSCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-interpolation-table>
          <qti-interpolation-table-entry target-value="1" source-value="1"></qti-interpolation-table-entry>
          <qti-interpolation-table-entry target-value="0" source-value="0"></qti-interpolation-table-entry>
        </qti-interpolation-table>
      </qti-outcome-declaration>
      <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
        <qti-default-value>
          <qti-value>1</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-assessment-stimulus-ref
        identifier="_86bee4be-0126-43f1-aea6-87207b42ab9e"
        href="Stimulus/86bee4be-0126-43f1-aea6-87207b42ab9e.xml"
      ></qti-assessment-stimulus-ref>
      <qti-item-body>
        <div class="qti-layout-row">
          <div class="qti-layout-col6">
            <div class="qti-shared-stimulus" data-stimulus-idref="_86bee4be-0126-43f1-aea6-87207b42ab9e"></div>
          </div>
          <div class="qti-layout-col6">
            <div class="question">
              <p>Lees: De jongen &#x2026; boos aan. (r. 2 en 3)</p>
              <p>Wat hoort op de puntjes (&#x2026;) te staan?</p>
            </div>
            <qti-choice-interaction max-choices="1" min-choices="0" shuffle="false" response-identifier="RESPONSE">
              <qti-simple-choice identifier="A"
                ><p xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">Ik ben ontspannen</p></qti-simple-choice
              >
              <qti-simple-choice identifier="B"
                ><p xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">Ik moet &#x2018;m niet</p></qti-simple-choice
              >
              <qti-simple-choice identifier="C"
                ><p xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">Ik vind &#x2018;m leuk</p></qti-simple-choice
              >
              <qti-simple-choice identifier="D"
                ><p xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">Ik kwispel blij</p></qti-simple-choice
              >
            </qti-choice-interaction>
          </div>
        </div>
      </qti-item-body>
      <qti-response-processing>
        <qti-response-condition>
          <qti-response-if>
            <qti-member>
              <qti-base-value base-type="identifier">B</qti-base-value>
              <qti-multiple>
                <qti-variable identifier="RESPONSE"></qti-variable>
              </qti-multiple>
            </qti-member>
            <qti-set-outcome-value identifier="RAWSCORE">
              <qti-sum>
                <qti-variable identifier="RAWSCORE"></qti-variable>
                <qti-base-value base-type="float">1</qti-base-value>
              </qti-sum>
            </qti-set-outcome-value>
          </qti-response-if>
        </qti-response-condition>
        <qti-lookup-outcome-value identifier="SCORE">
          <qti-variable identifier="RAWSCORE"></qti-variable>
        </qti-lookup-outcome-value>
      </qti-response-processing>
    </qti-assessment-item>`;

    render(template, container); // Render into the new container
    return container.querySelector('qti-assessment-item');
  }

  function setupQtiAssessmentItem() {
    try {
      document.body.appendChild(container);
      const template = html`
        <qti-assessment-item>
          <qti-outcome-declaration identifier="RAW_SCORE" cardinality="single" base-type="integer">
            <qti-default-value>
              <qti-value>0</qti-value>
            </qti-default-value>
          </qti-outcome-declaration>
          <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
            <qti-interpolation-table>
              <qti-interpolation-table-entry
                include-boundary="false"
                source-value="3"
                target-value="2"
              ></qti-interpolation-table-entry>
              <qti-interpolation-table-entry
                include-boundary="false"
                source-value="2"
                target-value="1"
              ></qti-interpolation-table-entry>
              <qti-interpolation-table-entry
                include-boundary="false"
                source-value="1"
                target-value="0"
              ></qti-interpolation-table-entry>
              <qti-interpolation-table-entry
                include-boundary="false"
                source-value="0"
                target-value="0"
              ></qti-interpolation-table-entry>
            </qti-interpolation-table>
          </qti-outcome-declaration>

          <qti-response-processing>
            <qti-lookup-outcome-value identifier="SCORE">
              <qti-variable identifier="RAW_SCORE"></qti-variable>
            </qti-lookup-outcome-value>
          </qti-response-processing>
        </qti-assessment-item>
      `;
      render(template, container); // Render into the new container
      return container.querySelector('qti-assessment-item');
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  }

  it('should interpolate RAW_SCORE to SCORE correctly', () => {
    const assessmentItem = setupQtiAssessmentItem();
    assessmentItem.updateOutcomeVariable('RAW_SCORE', '2');
    const lookupOutcomeValue = assessmentItem!.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;

    const result = lookupOutcomeValue.process();
    expect(result).toBe(1);
  });

  it('should return 0 if RAW_SCORE is not found in interpolation table', () => {
    const assessmentItem = setupQtiAssessmentItem();

    const lookupOutcomeValue = assessmentItem!.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;

    assessmentItem.updateOutcomeVariable('RAW_SCORE', '1');
    const result = lookupOutcomeValue.process();

    expect(result).toBe(0);
  });

  it('should correctly handle missing interpolation table', () => {
    const assessmentItem = setupQtiAssessmentItem();

    const lookupOutcomeValue = assessmentItem!.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;

    assessmentItem.updateOutcomeVariable('RAW_SCORE', '0');

    const result = lookupOutcomeValue.process();
    expect(result).toBe(0);
  });

  it('score correct with RESPONSE B', () => {
    const assessmentItem = setupQtiAssessmentItem2();

    const lookupOutcomeValue = assessmentItem!.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;
    console.debug('lookupOutcomeValue', lookupOutcomeValue);
    assessmentItem.updateResponseVariable('RESPONSE', 'B');
    assessmentItem.processResponse();

    const result = lookupOutcomeValue.process();
    expect(result).toBe(1);
  });

  it('score correct with RESPONSE A', () => {
    const assessmentItem = setupQtiAssessmentItem2();

    const lookupOutcomeValue = assessmentItem!.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;

    assessmentItem.updateResponseVariable('RESPONSE', 'A');
    assessmentItem.processResponse();

    const result = lookupOutcomeValue.process();
    expect(result).toBe(0);
  });
});
