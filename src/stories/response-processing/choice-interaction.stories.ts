import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import '../../lib/qti-components';
import { createRef, ref } from 'lit/directives/ref.js';
import { QtiAssessmentItem } from '../../lib/qti-components';

export default {
  title: 'response processing/qti-choice-interaction'
  // decorators: [(story) => html`${virtual(story)()}`],
};

export const MultipleCorrect = {
  render: () => {
    const testRef = createRef<QtiAssessmentItem>();
    return html`<button @click="${() => testRef.value.processResponse()}">processResponse</button>
      <button @click="${() => testRef.value.resetInteractions()}">Reset</button>
      <button @click="${() => alert(testRef.value.validateResponses())}">Validate</button>

      <button
        @click=${() => {
          testRef.value.showCorrectResponse();
        }}
      >
        set correct response
      </button>

      <qti-assessment-item
        ${ref(testRef)}
        xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0
  https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
        xml:lang="en-US"
        identifier="QTI3multiplechoice2"
        time-dependent="false"
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
      >
        <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
          <qti-correct-response>
            <qti-value>H</qti-value>
            <qti-value>O</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction
            response-identifier="RESPONSE"
            min-choices="1"
            max-choices="6"
            @qti-register-interaction=${action(`qti-register-interaction`)}
            @qti-interaction-response=${action(`qti-interaction-response`)}
          >
            <qti-prompt>Which of the following elements are used to form water?</qti-prompt>
            <qti-simple-choice identifier="H">Hydrogen</qti-simple-choice>
            <qti-simple-choice identifier="He">Helium</qti-simple-choice>
            <qti-simple-choice identifier="C">Carbon</qti-simple-choice>
            <qti-simple-choice identifier="O">Oxygen</qti-simple-choice>
            <qti-simple-choice identifier="N">Nitrogen</qti-simple-choice>
            <qti-simple-choice identifier="Cl">Chlorine</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing
          template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"
        ></qti-response-processing>
      </qti-assessment-item>`;
  }
};

export const MultipleMapResponse = {
  render: () => {
    const testRef = createRef<QtiAssessmentItem>();
    return html` <button @click="${() => testRef.value.processResponse()}">
        processResponse
      </button>
      <button @click="${() => testRef.value.resetInteractions()}">Reset</button>
      <button @click="${() => alert(testRef.value.validateResponses())}">
        Validate
      </button>

      <button
        @click=${() => {
          testRef.value.showCorrectResponse();
        }}
      >
        set correct response
      </button>
        <qti-assessment-item
          ${ref(testRef)}
          xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
          identifier="qti3-choice-multiple-01"
          title="Composition of Water qti3"
          adaptive="false"
          time-dependent="false"
          @qti-outcome-changed=${action(`qti-outcome-changed`)}
        >
          <qti-response-declaration
            identifier="RESPONSE"
            cardinality="multiple"
            base-type="identifier"
          >
            <qti-correct-response>
              <qti-value>H</qti-value>
              <qti-value>O</qti-value>
            </qti-correct-response>
            <qti-mapping lower-bound="0" upper-bound="2" default-value="-2">
              <qti-map-entry map-key="H" mapped-value="1"></qti-map-entry>
              <qti-map-entry map-key="O" mapped-value="1" ></qti-map-entry>
              <qti-map-entry map-key="Cl" mapped-value="-1" ></qti-map-entry>
            </qti-mapping>
          </qti-response-declaration>
          <qti-outcome-declaration
            identifier="SCORE"
            cardinality="single"
            base-type="float"
          ></qti-outcome-declaration>
          <qti-item-body>
            <qti-choice-interaction
              response-identifier="RESPONSE"
              shuffle="true"
              max-choices="0"
            >
              <qti-prompt
                >Which of the following elements are used to form
                water?</qti-prompt
              >
              <qti-simple-choice identifier="H" fixed="false"
                >Hydrogen</qti-simple-choice
              >
              <qti-simple-choice identifier="He" fixed="false"
                >Helium</qti-simple-choice
              >
              <qti-simple-choice identifier="C" fixed="false"
                >Carbon</qti-simple-choice
              >
              <qti-simple-choice identifier="O" fixed="false"
                >Oxygen</qti-simple-choice
              >
              <qti-simple-choice identifier="N" fixed="false"
                >Nitrogen</qti-simple-choice
              >
              <qti-simple-choice identifier="Cl" fixed="false"
                >Chlorine</qti-simple-choice
              >
            </qti-choice-interaction>
          </qti-item-body>
          <qti-response-processing
            template="https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml"
          ></qti-response-processing></qti-assessment-item
      ></qti-assessment-item>`;
  }
};

export const MultipleInteractions = {
  render: () => {
    const testRef = createRef<QtiAssessmentItem>();
    return html`
      <button @click="${() => testRef.value.processResponse()}">processResponse</button>
      <button @click="${() => testRef.value.resetInteractions()}">Reset</button>
      <button @click="${() => alert(testRef.value.validateResponses())}">Validate</button>

      <button
        @click=${() => {
          testRef.value.showCorrectResponse();
        }}
      >
        set correct response
      </button>
      <qti-assessment-item
        ${ref(testRef)}
        xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
        identifier="qti3-choice-multiple-04"
        title="Composition of Water qti3 - labels and suffixes"
        adaptive="false"
        time-dependent="false"
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
      >
        <qti-response-declaration
          identifier="RESPONSE1"
          cardinality="multiple"
          base-type="identifier"
        ></qti-response-declaration>
        <qti-response-declaration
          identifier="RESPONSE2"
          cardinality="multiple"
          base-type="identifier"
        ></qti-response-declaration>
        <qti-response-declaration
          identifier="RESPONSE3"
          cardinality="multiple"
          base-type="identifier"
        ></qti-response-declaration>
        <qti-response-declaration
          identifier="RESPONSE4"
          cardinality="multiple"
          base-type="identifier"
        ></qti-response-declaration>
        <qti-response-declaration
          identifier="RESPONSE5"
          cardinality="multiple"
          base-type="identifier"
        ></qti-response-declaration>
        <qti-response-declaration
          identifier="RESPONSE6"
          cardinality="multiple"
          base-type="identifier"
        ></qti-response-declaration>
        <qti-response-declaration
          identifier="RESPONSE7"
          cardinality="multiple"
          base-type="identifier"
        ></qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
        <qti-item-body>
          <p>Which of the following elements are used to form water?</p>

          <qti-choice-interaction class="qti-labels-lower-alpha" response-identifier="RESPONSE1" max-choices="0">
            <qti-prompt>Demonstrates qti-labels-lower-alpha.</qti-prompt>
            <qti-simple-choice identifier="H" fixed="false">Hydrogen</qti-simple-choice>
            <qti-simple-choice identifier="He" fixed="false">Helium</qti-simple-choice>
            <qti-simple-choice identifier="C" fixed="false">Carbon</qti-simple-choice>
            <qti-simple-choice identifier="O" fixed="false">Oxygen</qti-simple-choice>
            <qti-simple-choice identifier="N" fixed="false">Nitrogen</qti-simple-choice>
            <qti-simple-choice identifier="Cl" fixed="false">Chlorine</qti-simple-choice>
          </qti-choice-interaction>

          <qti-choice-interaction class="qti-labels-upper-alpha" response-identifier="RESPONSE2" max-choices="0">
            <qti-prompt>Demonstrates qti-labels-upper-alpha.</qti-prompt>
            <qti-simple-choice identifier="H" fixed="false">Hydrogen</qti-simple-choice>
            <qti-simple-choice identifier="He" fixed="false">Helium</qti-simple-choice>
            <qti-simple-choice identifier="C" fixed="false">Carbon</qti-simple-choice>
            <qti-simple-choice identifier="O" fixed="false">Oxygen</qti-simple-choice>
            <qti-simple-choice identifier="N" fixed="false">Nitrogen</qti-simple-choice>
            <qti-simple-choice identifier="Cl" fixed="false">Chlorine</qti-simple-choice>
          </qti-choice-interaction>

          <qti-choice-interaction
            class="qti-labels-upper-alpha qti-labels-suffix-none"
            response-identifier="RESPONSE3"
            max-choices="0"
          >
            <qti-prompt>Demonstrates qti-labels-upper-alpha and qti-labels-suffix-none.</qti-prompt>
            <qti-simple-choice identifier="H" fixed="false">Hydrogen</qti-simple-choice>
            <qti-simple-choice identifier="He" fixed="false">Helium</qti-simple-choice>
            <qti-simple-choice identifier="C" fixed="false">Carbon</qti-simple-choice>
            <qti-simple-choice identifier="O" fixed="false">Oxygen</qti-simple-choice>
            <qti-simple-choice identifier="N" fixed="false">Nitrogen</qti-simple-choice>
            <qti-simple-choice identifier="Cl" fixed="false">Chlorine</qti-simple-choice>
          </qti-choice-interaction>

          <qti-choice-interaction class="qti-labels-decimal" response-identifier="RESPONSE4" max-choices="0">
            <qti-prompt>Demonstrates qti-labels-decimal.</qti-prompt>
            <qti-simple-choice identifier="H" fixed="false">Hydrogen</qti-simple-choice>
            <qti-simple-choice identifier="He" fixed="false">Helium</qti-simple-choice>
            <qti-simple-choice identifier="C" fixed="false">Carbon</qti-simple-choice>
            <qti-simple-choice identifier="O" fixed="false">Oxygen</qti-simple-choice>
            <qti-simple-choice identifier="N" fixed="false">Nitrogen</qti-simple-choice>
            <qti-simple-choice identifier="Cl" fixed="false">Chlorine</qti-simple-choice>
          </qti-choice-interaction>

          <qti-choice-interaction
            class="qti-labels-decimal qti-labels-suffix-parenthesis"
            response-identifier="RESPONSE5"
            max-choices="0"
          >
            <qti-prompt>Demonstrates qti-labels-decimal and qti-labels-suffix-parenthesis.</qti-prompt>
            <qti-simple-choice identifier="H" fixed="false">Hydrogen</qti-simple-choice>
            <qti-simple-choice identifier="He" fixed="false">Helium</qti-simple-choice>
            <qti-simple-choice identifier="C" fixed="false">Carbon</qti-simple-choice>
            <qti-simple-choice identifier="O" fixed="false">Oxygen</qti-simple-choice>
            <qti-simple-choice identifier="N" fixed="false">Nitrogen</qti-simple-choice>
            <qti-simple-choice identifier="Cl" fixed="false">Chlorine</qti-simple-choice>
          </qti-choice-interaction>

          <qti-choice-interaction class="qti-labels-none" response-identifier="RESPONSE6" max-choices="0">
            <qti-prompt>Demonstrates qti-labels-none.</qti-prompt>
            <qti-simple-choice identifier="H" fixed="false">Hydrogen</qti-simple-choice>
            <qti-simple-choice identifier="He" fixed="false">Helium</qti-simple-choice>
            <qti-simple-choice identifier="C" fixed="false">Carbon</qti-simple-choice>
            <qti-simple-choice identifier="O" fixed="false">Oxygen</qti-simple-choice>
            <qti-simple-choice identifier="N" fixed="false">Nitrogen</qti-simple-choice>
            <qti-simple-choice identifier="Cl" fixed="false">Chlorine</qti-simple-choice>
          </qti-choice-interaction>

          <qti-choice-interaction
            class="qti-labels-none qti-input-control-hidden"
            response-identifier="RESPONSE7"
            max-choices="0"
          >
            <qti-prompt>Demonstrates qti-labels-none qti-input-control-hidden</qti-prompt>
            <qti-simple-choice identifier="H" fixed="false">Hydrogen</qti-simple-choice>
            <qti-simple-choice identifier="He" fixed="false">Helium</qti-simple-choice>
            <qti-simple-choice identifier="C" fixed="false">Carbon</qti-simple-choice>
            <qti-simple-choice identifier="O" fixed="false">Oxygen</qti-simple-choice>
            <qti-simple-choice identifier="N" fixed="false">Nitrogen</qti-simple-choice>
            <qti-simple-choice identifier="Cl" fixed="false">Chlorine</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
      </qti-assessment-item>
    `;
  }
};
