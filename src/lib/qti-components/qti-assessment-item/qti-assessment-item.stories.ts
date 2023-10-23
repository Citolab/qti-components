import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { action } from '@storybook/addon-actions';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

import '../index';
import '../../qti-test';

import { virtual } from 'haunted';

export default {
  component: 'qti-assessment-item',
  decorators: [story => html`${virtual(story)()}`]
};

export const Default = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  return html`<qti-assessment-test>
      <qti-assessment-item
        identifier="blah"
        ${ref(assessmentItemRef)}
        @qti-register-interaction="${action(`qti-register-interaction`)}"
        @qti-interaction-changed="${action(`qti-interaction-changed`)}"
        @qti-outcome-changed="${action(`qti-outcome-changed`)}"
        @qti-response-processed="${action(`qti-response-processing`)}"
        adaptive="false"
      >
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
          <qti-correct-response>
            <qti-value>true</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <!--￼Define a feedback variable; its baseType is "identifier" so that it can contain the identifier of the feedback message-->
        <qti-outcome-declaration
          identifier="FEEDBACK"
          cardinality="single"
          base-type="identifier"
        ></qti-outcome-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" normal-maximum="10.0">
          <qti-default-value>
            <qti-value>0</qti-value>
          </qti-default-value>
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
          <qti-default-value>
            <qti-value>10.0</qti-value>
          </qti-default-value>
        </qti-outcome-declaration>
        <qti-item-body>
          <!--￼￼￼￼The response variable RESPONSE will hold the candidate's input-->
          <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
            <qti-prompt>Sigmund Freud and Carl Jung both belong to the psychoanalytic school of psychology.</qti-prompt>
            <qti-simple-choice identifier="true" fixed="true"
              >True
              <!--￼￼￼The feedbackInline elements are each given the same identifier as the corresponding option.-->
              <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="true" show-hide="show"
                >That's correct</qti-feedback-inline
              ></qti-simple-choice
            >
            <qti-simple-choice identifier="false" fixed="true"
              >False
              <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="false" show-hide="show"
                >That's not correct</qti-feedback-inline
              ></qti-simple-choice
            >
          </qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing>
          <!--￼This time, FEEDBACK is given the value of the identifier of the option which was selected.-->
          <qti-set-outcome-value identifier="FEEDBACK">
            <qti-variable identifier="RESPONSE"></qti-variable>
          </qti-set-outcome-value>
          <qti-response-condition>
            <qti-response-if>
              <qti-match>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-correct identifier="RESPONSE"></qti-correct>
              </qti-match>
              <qti-set-outcome-value identifier="SCORE">
                <qti-variable identifier="MAXSCORE"></qti-variable>
              </qti-set-outcome-value>
            </qti-response-if>
          </qti-response-condition>
        </qti-response-processing>
        <debug-assessment-item></debug-assessment-item>
      </qti-assessment-item>
    </qti-assessment-test>
    <button @click=${() => assessmentItemRef.value?.processResponse()}>PROCESS</button>
    <button @click=${() => assessmentItemRef.value?.resetResponses()}>Reset</button>`;
};
