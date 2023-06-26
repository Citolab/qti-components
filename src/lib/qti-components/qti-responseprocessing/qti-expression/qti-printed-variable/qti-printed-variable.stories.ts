import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { action } from '@storybook/addon-actions';

import '../../../index';
import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';

export default {
  component: 'qti-printed-variable'
};

export const inline = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  return html`<qti-assessment-item
    identifier="blah"
    ${ref(assessmentItemRef)}
    @qti-outcome-changed=${action(`qti-outcome-changed`)}
    @qti-interaction-changed=${action(`qti-interaction-changed`)}
  >
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="integer"></qti-response-declaration>

    <qti-response-declaration
      identifier="RESPONSE2"
      cardinality="single"
      base-type="integer"
    ></qti-response-declaration>

    <qti-outcome-declaration identifier="STORY" cardinality="single" base-type="identifier">
      <qti-default-value>
        <qti-value>ZONNEPANELEN</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" normal-maximum="10.0">
      <qti-default-value>
        <qti-value>0</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>

    <qti-item-body>
      <qti-feedback-block outcome-identifier="STORY" show-hide="show" identifier="ZONNEPANELEN">
        <p>Hoeveel zonnepannelen zijn er</p>
        <qti-text-entry-interaction response-identifier="RESPONSE"></qti-text-entry-interaction>
      </qti-feedback-block>

      <qti-feedback-block outcome-identifier="STORY" show-hide="show" identifier="ZONNEPANELEN">
        <p>
          Zonnepanelen zorgen voor
          <qti-inline-choice-interaction response-identifier="RESPONSE">
            <qti-inline-choice identifier="G">geen</qti-inline-choice>
            <qti-inline-choice identifier="L">minder</qti-inline-choice>
            <qti-inline-choice identifier="Y">evenveel</qti-inline-choice>
            <qti-inline-choice identifier="Y">meer</qti-inline-choice>
          </qti-inline-choice-interaction>
          CO2 uitstoot dan het gebruik van fossiele branstoffen.
        </p>
      </qti-feedback-block>

      <qti-feedback-block outcome-identifier="STORY" show-hide="show" identifier="QUESTION">
        <p>Hoeveel = <qti-printed-variable identifier="RESPONSE"></qti-printed-variable> x 5</p>
        <qti-text-entry-interaction response-identifier="RESPONSE2"></qti-text-entry-interaction>
      </qti-feedback-block>
      <qti-end-attempt-interaction title="End attempt"></qti-end-attempt-interaction>
    </qti-item-body>

    <qti-response-processing>
      <qti-set-outcome-value identifier="STORY">
        <qti-base-value base-type="identifier">QUESTION</qti-base-value>
      </qti-set-outcome-value>
      <qti-response-condition>
        <qti-response-if>
          <qti-not>
            <qti-is-null>
              <qti-variable identifier="RESPONSE2"></qti-variable>
            </qti-is-null>
          </qti-not>
          <qti-response-condition>
            <qti-response-if>
              <qti-equal>
                <qti-product>
                  <qti-base-value base-type="integer">5</qti-base-value>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                </qti-product>
                <qti-variable identifier="RESPONSE2"></qti-variable>
              </qti-equal>
              <qti-set-outcome-value identifier="SCORE">
                <qti-base-value base-type="float">1</qti-base-value>
              </qti-set-outcome-value>
            </qti-response-if>
            <qti-response-else>
              <qti-set-outcome-value identifier="SCORE">
                <qti-base-value base-type="float">0</qti-base-value>
              </qti-set-outcome-value>
            </qti-response-else>
          </qti-response-condition>
        </qti-response-if>
      </qti-response-condition>
    </qti-response-processing>
  </qti-assessment-item>`;
};
