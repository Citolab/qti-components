import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import { action } from '@storybook/addon-actions';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

import '../index';

export default {
  component: 'qti-feedback-inline'
};

export const Inline = () => {
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

export const Modal = () => {
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

export const ModalKennisnet = () => {
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
    <qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      title="Plantenanatomie"
      time-dependent="false"
      identifier="QUE_2_1"
    >
      <qti-response-declaration identifier="RESPONSE" base-type="identifier" cardinality="single">
        <qti-correct-response>
          <qti-value>choice2</qti-value>
        </qti-correct-response>
        <qti-mapping lower-bound="0" upper-bound="2" default-value="-2">
          <qti-map-entry map-key="choice1" mapped-value="0"></qti-map-entry>
          <qti-map-entry map-key="choice2" mapped-value="2"></qti-map-entry>
          <qti-map-entry map-key="choice3" mapped-value="0"></qti-map-entry>
          <qti-map-entry map-key="choice4" mapped-value="0"></qti-map-entry>
        </qti-mapping>
      </qti-response-declaration>
      <qti-outcome-declaration
        identifier="SCORE"
        base-type="float"
        cardinality="single"
        normal-minimum="0"
        normal-maximum="2"
      >
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration identifier="MAXSCORE" base-type="float" cardinality="single">
        <qti-default-value>
          <qti-value>2</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration identifier="FEEDBACK" base-type="identifier" cardinality="single">
      </qti-outcome-declaration>
      <qti-item-body>
        <div>
          <p>
            <strong>Uitdroging bij planten.</strong><br /><br />Bij bladeren van planten kunnen de volgende
            eigenschappen voorkomen:<br /><br />1. diep verzonken huidmondjes,<br />2. huidmondjes aan de bovenkant,<br />3.
            groot oppervlak met veel huidmondjes,<br />4. klein oppervlak met een waslaag.<br /><br />Welke van
            bovenstaande eigenschappen beschermen het meest tegen uitdroging?
          </p>
        </div>
        <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" min-choices="0" max-choices="1">
          <qti-simple-choice identifier="choice1" fixed="false" show-hide="show">
            <div>
              <p>1 en 3</p>
            </div>
          </qti-simple-choice>
          <qti-simple-choice identifier="choice2" fixed="false" show-hide="show">
            <div>
              <p>1 en 4</p>
            </div>
          </qti-simple-choice>
          <qti-simple-choice identifier="choice3" fixed="false" show-hide="show">
            <div>
              <p>2 en 3</p>
            </div>
          </qti-simple-choice>
          <qti-simple-choice identifier="choice4" fixed="false" show-hide="show">
            <div>
              <p>2 en 4</p>
            </div>
          </qti-simple-choice>
        </qti-choice-interaction>
      </qti-item-body>
      <qti-response-processing>
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
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-variable identifier="RESPONSE"></qti-variable>
        </qti-set-outcome-value>
      </qti-response-processing>
      <qti-modal-feedback identifier="choice1" outcome-identifier="FEEDBACK" show-hide="show">
        <qti-content-body> </qti-content-body>
      </qti-modal-feedback>
      <qti-modal-feedback identifier="choice2" outcome-identifier="FEEDBACK" show-hide="show">
        <qti-content-body> </qti-content-body>
      </qti-modal-feedback>
      <qti-modal-feedback identifier="choice3" outcome-identifier="FEEDBACK" show-hide="show">
        <qti-content-body> </qti-content-body>
      </qti-modal-feedback>
      <qti-modal-feedback identifier="choice4" outcome-identifier="FEEDBACK" show-hide="show">
        <qti-content-body> </qti-content-body>
      </qti-modal-feedback>
      <qti-modal-feedback identifier="choice2" outcome-identifier="FEEDBACK" show-hide="hide">
        <qti-content-body>
          Het juiste antwoord is:
          <p>1 en 4</p>
        </qti-content-body>
      </qti-modal-feedback>
    </qti-assessment-item></qti-assessment-item
  >`;
};

export const Woordmars = () => {
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

export const Kringloop = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  const processResponse = () => {
    assessmentItemRef.value?.processResponse();
  };

  return html`
    <qti-assessment-item
      identifier="kringloop1"
      ${ref(assessmentItemRef)}
      @qti-outcome-changed="${e => {
        action(JSON.stringify(e.detail))();
      }}"
      @qti-interaction-changed="${e => {
        processResponse();
        action(JSON.stringify(e.detail))();
      }}"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="float">
        <qti-correct-response interpretation="562 kilo">
          <qti-value>562</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-item-body xml:lang="nl-NL">
        <div class="qti-layout-row">
          <div class="qti-layout-col12">
            <p>
              <strong>Hoeveel kilo afval werd er 2021 in Nederland per persoon weggegooid?</strong>
            </p>
            <div>
              <qti-slider-interaction
                response-identifier="RESPONSE"
                lower-bound="0"
                step="100"
                upper-bound="1000"
              ></qti-slider-interaction>
              <qti-feedback-block
                id="feedbackblock-correct-exact"
                identifier="correct-exact"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Helemaal goed! Dat is net zoveel als het gewicht van een groot paard! 🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-correct"
                identifier="correct"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Bijna! We rekenen het goed! 562 kilo 😮 Dat is net zoveel als het gewicht van een groot paard!🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-incorrect-less"
                identifier="incorrect-less"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Helaas het is nog meer! 562 kilo 😮! Dat is net zoveel als het gewicht van een groot paard 🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-incorrect-more"
                identifier="incorrect-more"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Dat is niet goed, gelukkig is het minder, maar toch 562 kilo! Dat is net zoveel als het gewicht van een
                groot paard!🐎
              </qti-feedback-block>
            </div>
          </div>
        </div>
      </qti-item-body>
      <qti-response-processing>
        <qti-response-condition>
          <qti-response-if>
            <qti-and>
              <qti-gte>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-base-value base-type="float">500</qti-base-value>
              </qti-gte>
              <qti-lte>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-base-value base-type="float">600</qti-base-value>
              </qti-lte>
            </qti-and>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">1</qti-base-value>
            </qti-set-outcome-value>
            <qti-response-condition>
              <qti-response-if>
                <qti-equal>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                  <qti-correct identifier="RESPONSE"></qti-correct>
                </qti-equal>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="identifier">correct-exact</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">correct</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
          </qti-response-if>
          <qti-response-else>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">0</qti-base-value>
            </qti-set-outcome-value>
            <qti-response-condition>
              <qti-response-if>
                <qti-lt>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                  <qti-base-value base-type="float">500</qti-base-value>
                </qti-lt>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">incorrect-less</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">incorrect-more</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
          </qti-response-else>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>
  `;
};
