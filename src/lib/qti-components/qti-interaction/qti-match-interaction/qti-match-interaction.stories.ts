import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import '../../index';

export default {
  component: 'qti-match-interaction'
};

export const Default = {
  render: args =>
    html` <qti-match-interaction
      .dragOptions=${{ copyStylesDragClone: false }}
      @qti-interaction-response="${action(`qti-interaction-response`)}"
      class="qti-choices-top"
      max-associations="4"
      response-identifier="RESPONSE"
    >
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
      </qti-simple-match-set>

      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="M" match-max="2">A Midsummer-Night's</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="R" match-max="2">Romeo and Juliet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="T" match-max="2">The Tempest</qti-simple-associable-choice>
      </qti-simple-match-set>
    </qti-match-interaction>`
};

export const Tabular = {
  render: () =>
    html`<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      identifier="match"
      title="Characters and Plays"
      adaptive="false"
      time-dependent="false"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
        <qti-correct-response>
          <qti-value>C R</qti-value>
          <qti-value>D M</qti-value>
          <qti-value>L M</qti-value>
          <qti-value>P T</qti-value>
        </qti-correct-response>
        <qti-mapping default-value="0">
          <qti-map-entry map-key="C R" mapped-value="1"></qti-map-entry>
          <qti-map-entry map-key="D M" mapped-value="0.5"></qti-map-entry>
          <qti-map-entry map-key="L M" mapped-value="0.5"></qti-map-entry>
          <qti-map-entry map-key="P T" mapped-value="1"></qti-map-entry>
        </qti-mapping>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-item-body>
        <qti-match-interaction
          @qti-interaction-response="${action(`qti-interaction-response`)}"
          class="qti-match-tabular"
          response-identifier="RESPONSE"
          shuffle="true"
          max-associations="4"
        >
          <qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="M" match-max="4"
              >A Midsummer-Night&apos;s Dream</qti-simple-associable-choice
            >
            <qti-simple-associable-choice identifier="R" match-max="4">Romeo and Juliet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="T" match-max="4">The Tempest</qti-simple-associable-choice>
          </qti-simple-match-set>
        </qti-match-interaction>
      </qti-item-body>
      <qti-response-processing
        template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml"
      ></qti-response-processing>
    </qti-assessment-item>`
};

export const Images = {
  render: () =>
    html`<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      identifier="match"
      title="Characters and Plays"
      adaptive="false"
      time-dependent="false"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
        <qti-correct-response>
          <qti-value>C R</qti-value>
          <qti-value>D M</qti-value>
          <qti-value>L M</qti-value>
          <qti-value>P T</qti-value>
        </qti-correct-response>
        <qti-mapping default-value="0">
          <qti-map-entry map-key="C R" mapped-value="1"></qti-map-entry>
          <qti-map-entry map-key="D M" mapped-value="0.5"></qti-map-entry>
          <qti-map-entry map-key="L M" mapped-value="0.5"></qti-map-entry>
          <qti-map-entry map-key="P T" mapped-value="1"></qti-map-entry>
        </qti-mapping>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-item-body>
        <qti-match-interaction
          @qti-interaction-response="${action(`qti-interaction-response`)}"
          class="qti-match-tabular"
          max-associations="4"
          response-identifier="RSP-C"
        >
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="PROD1" match-max="1"
              ><img alt="" src="./images/Biologische kipfilet.png"
            /></qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="PROD2" match-max="1"
              ><img alt="" src="./images/Verantwoorde wilde zalmfilets.png"
            /></qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="PROD3" match-max="1"
              ><img alt="" src="./images/Duurzamer geproduceerde melk.png"
            /></qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="BINA" match-max="2"
              ><img alt="" src="./images/asc.png"
            /></qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="BINB" match-max="2"
              ><img alt="" src="./images/EU-Biologisch.png"
            /></qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="BINC" match-max="2"
              ><img alt="" src="./images/Rainforest Alliance.png"
            /></qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="BIND" match-max="2"
              ><img alt="" src="./images/MSC.png"
            /></qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="BINE" match-max="2"
              ><img alt="" src="./images/Planet proof.png"
            /></qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="BINF" match-max="2"
              ><img alt="" src="./images/Fartrade.png"
            /></qti-simple-associable-choice>
          </qti-simple-match-set>
        </qti-match-interaction>
      </qti-item-body>
      <qti-response-processing
        template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml"
      ></qti-response-processing>
    </qti-assessment-item>`
};
