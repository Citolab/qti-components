import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { action } from '@storybook/addon-actions';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

import '../index';

export default {
  component: 'qti-feedback-inline'
};

export const inline = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  const processResponse = () => {
    assessmentItemRef.value?.processResponse();
  };

  return html`<qti-assessment-item
    identifier="blah"
    ${ref(assessmentItemRef)}
    @qti-outcome-changed="${e => {
      action(JSON.stringify(e.detail))();
    }}"
    @qti-interaction-changed="${e => {
      processResponse();
      action(JSON.stringify(e.detail))();
    }}"
  >
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>true</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <!--￼Define a feedback variable; its baseType is "identifier" so that it can contain the identifier 
        of the feedback message-->
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
          <!--￼￼￼The feedbackInline elements are each given the same identifier as the 
                    corresponding option.-->
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
  </qti-assessment-item>`;
};

export const modal = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  const processResponse = () => {
    assessmentItemRef.value?.processResponse();
  };

  return html`<qti-assessment-item
    identifier="blah"
    ${ref(assessmentItemRef)}
    @qti-outcome-changed="${e => {
      action(JSON.stringify(e.detail))();
    }}"
    @qti-interaction-changed="${e => {
      processResponse();
      action(JSON.stringify(e.detail))();
    }}"
  >
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>true</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
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
      <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
        <qti-prompt>Sigmund Freud and Carl Jung both belong to the psychoanalytic school of psychology.</qti-prompt>
        <qti-simple-choice identifier="true" fixed="true">True </qti-simple-choice>
        <qti-simple-choice identifier="false" fixed="true">False </qti-simple-choice>
      </qti-choice-interaction>
    </qti-item-body>
    <qti-response-processing>
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

    <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="true">
      <qti-content-body>correct</qti-content-body>
    </qti-modal-feedback>
    <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="false">
      <qti-content-body>incorrect</qti-content-body>
    </qti-modal-feedback>
  </qti-assessment-item>`;
};

export const woordmars = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  const processResponse = () => {
    assessmentItemRef.value?.processResponse();
  };

  return html`
    <qti-assessment-item
      identifier="blah"
      2
      ${ref(assessmentItemRef)}
      @qti-outcome-changed="${e => {
        action(JSON.stringify(e.detail))();
      }}"
      @qti-interaction-changed="${e => {
        processResponse();
        action(JSON.stringify(e.detail))();
      }}"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response>
          <qti-value>A</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-item-body>
        <qti-choice-interaction class="qti-input-control-hidden" response-identifier="RESPONSE" max-choices="1">
          <qti-prompt> Wat betekent stuk? </qti-prompt>
          <qti-simple-choice identifier="A">
            Een deel
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="A" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="B" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="C" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="D" show-hide="show"
              >goed</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="B"
            >Een gat
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="B" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="C"
            >Een krant
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="C" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="D">
            Een steen
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="D" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
        </qti-choice-interaction>
      </qti-item-body>

      <qti-response-processing>
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
              <qti-base-value base-type="float">1</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-if>
          <qti-response-else>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">0</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-else>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>
  `;
};
