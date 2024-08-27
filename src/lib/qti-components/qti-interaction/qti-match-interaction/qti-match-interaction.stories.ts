import { action } from '@storybook/addon-actions';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';

import { createRef, ref } from 'lit/directives/ref.js';
import '../../index';
import { QtiAssessmentItem } from '../../index';

import { expect, fn, within } from '@storybook/test';
import drag from '../../../../testing/drag';
// import { userEvent } from '@vitest/browser/context';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-match-interaction',
  argTypes: {
    class: {
      description: 'supported classes',
      control: 'inline-radio',
      options: ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right', 'qti-match-tabular'],
      table: { category: 'QTI' }
    }
  }
};
export default meta;

export const Default = {
  render: args =>
    html` <qti-match-interaction
      .dragOptions=${{ copyStylesDragClone: false }}
      @qti-interaction-response="${action(`qti-interaction-response`)}"
      class=${args.class}
      max-associations="4"
      response-identifier="RESPONSE"
    >
      <qti-simple-match-set>
        <qti-simple-associable-choice data-testid="drag-capulet" identifier="C" match-max="1"
          >Capulet</qti-simple-associable-choice
        >
        <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
      </qti-simple-match-set>

      <qti-simple-match-set>
        <qti-simple-associable-choice data-testid="drop-capulet" identifier="M" match-max="2"
          >A Midsummer-Night's</qti-simple-associable-choice
        >
        <qti-simple-associable-choice identifier="R" match-max="2">Romeo and Juliet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="T" match-max="2">The Tempest</qti-simple-associable-choice>
      </qti-simple-match-set>
    </qti-match-interaction>`
};

export const Play: Story = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-choices-bottom']
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const interactionResponse = fn(event => expect(event.detail.response).toEqual(['C M', 'R', 'T']));

    canvasElement.addEventListener('qti-interaction-response', interactionResponse);

    const source = canvas.getByTestId('drag-capulet');
    const target = canvas.getByTestId('drop-capulet');

    await drag(source, { to: target });

    expect(interactionResponse).toHaveBeenCalled();
    canvasElement.removeEventListener('qti-interaction-response', interactionResponse);
  }
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

export const TabularAardrijkskunde = {
  render: () => {
    const testRef = createRef<QtiAssessmentItem>();
    return html`<qti-assessment-item
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd
						http://www.duo.nl/schema/dep_extension ../dep_extension.xsd"
        title="3297cq"
        identifier="ITM-3297cq"
        time-dependent="false"
        label="3297cq"
         ${ref(testRef)}
              @qti-interaction-changed="${e => {
                testRef.value.processResponse();
                action(JSON.stringify(e.detail))();
              }}"
      @qti-outcome-changed="${e => {
        action(JSON.stringify(e.detail))();
      }}"
        xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
        xmlns:dep="http://www.duo.nl/schema/dep_extension"
      >
        <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
          <qti-correct-response interpretation="A&amp;B">
            <qti-value>y_A x_1</qti-value>
            <qti-value>y_B x_2</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
          <qti-default-value>
            <qti-value>0</qti-value>
          </qti-default-value>
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
          <qti-default-value>
            <qti-value>1</qti-value>
          </qti-default-value> </qti-outcome-declaration
        >
        <qti-item-body class="defaultBody" xml:lang="nl-NL">
          <qti-match-interaction
          id="matchInteraction1"
          class="qti-match-tabular "
          min-associations="2"
          max-associations="2"
          shuffle="false"
          response-identifier="RESPONSE"
        >
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="y_A" match-max="1">
              <div>
                <p>Als koele lucht botst tegen warme vochtige lucht ontstaat frontale neerslag.</p>
              </div>
            </qti-simple-associable-choice>

            <qti-simple-associable-choice identifier="y_B" match-max="1">
              <div>
                <p>De aanvoer van koude lucht vanuit het noorden wordt door de ligging van gebergtes tegengehouden.</p>
              </div>
            </qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="x_1" match-max="2">
              <div class="cito_genclass_BB_2017_A1-012_1">
                <p>juist</p>
              </div>
            </qti-simple-associable-choice>

            <qti-simple-associable-choice identifier="x_2" match-max="2">
              <div class="cito_genclass_BB_2017_A1-012_2">
                <p>onjuist</p>
              </div>
            </qti-simple-associable-choice>
          </qti-simple-match-set>
        </qti-match-interaction>

      	</qti-item-body>
             <qti-response-processing
    		template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"></qti-response-processing>
    </qti-response-processing>
    </qti-assessment-item>`;

    //   <qti-response-processing
    // 		template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"></qti-response-processing>
    // </qti-response-processing>

    //   <qti-response-processing xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd">
    // <qti-response-condition>
    // <qti-response-if>
    // <qti-match>
    // <qti-variable identifier="RESPONSE"/>
    // <qti-correct identifier="RESPONSE"/>
    // </qti-match>
    // <qti-set-outcome-value identifier="SCORE">
    // <qti-base-value base-type="float">1</qti-base-value>
    // </qti-set-outcome-value>
    // </qti-response-if>
    // <qti-response-else>
    // <qti-set-outcome-value identifier="SCORE">
    // <qti-base-value base-type="float">0</qti-base-value>
    // </qti-set-outcome-value>
    // </qti-response-else>
    // </qti-response-condition>
    // </qti-response-processing>
  }
};

export const TabularMultiple = {
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
            <qti-simple-associable-choice identifier="C" match-max="2">Capulet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="D" match-max="2">Demetrius</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="L" match-max="2">Lysander</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="P" match-max="2">Prospero</qti-simple-associable-choice>
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
