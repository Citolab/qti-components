import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { action } from '@storybook/addon-actions';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

import '../index';
import { useEffect, useRef, useState, virtual } from 'haunted';

export default {
  component: 'qti-assessment-item',
  decorators: [story => html`${virtual(story)()}`]
};

export const Default = () => {
  const assessmentItemRef = createRef<QtiAssessmentItem>();

  const processResponse = () => {
    assessmentItemRef.value?.processResponse();
  };

  return html`<qti-assessment-item
      identifier="blah"
      ${ref(assessmentItemRef)}
      @qti-register-interaction="${action(`qti-register-interaction`)}"
      @qti-interaction-changed="${action(`qti-interaction-changed`)}"
      @qti-outcome-changed="${action(`qti-outcome-changed`)}"
      @qti-response-processing="${action(`qti-response-processing`)}"
      adaptive="false"
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
        niet gezien: not attempted gezien: incompleet 1 choice: incomplete 2 of 3 completed

        <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" min-choices="2" max-choices="3">
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
    </qti-assessment-item>
    <button @click=${processResponse}>PROCESS</button>`;
};
