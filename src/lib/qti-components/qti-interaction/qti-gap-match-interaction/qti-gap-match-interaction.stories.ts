import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';
import { fireEvent, userEvent, within } from '@storybook/testing-library';

import './../../index';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Meta } from '@storybook/web-components';

const meta: Meta = {
  component: 'qti-match-interaction',
  argTypes: {
    'response-identifier': { control: { type: 'text' }, table: { category: 'QTI' } },
    'max-associations': { control: { type: 'number' }, table: { category: 'QTI' } },
    'min-associations': { control: { type: 'number' }, table: { category: 'QTI' } },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    classes: {
      description: 'supported classes',
      control: 'radio',
      options: ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right'],
      table: { category: 'QTI' }
    },
    unsupported: {
      description: 'unsupported',
      control: 'radio',
      options: [
        'qti-input-width-1',
        'qti-input-width-2',
        'qti-input-width-3',
        'qti-input-width-4',
        'qti-input-width-6',
        'qti-input-width-10',
        'qti-input-width-15',
        'qti-input-width-20',
        'qti-input-width-72'
      ],
      table: { category: 'QTI' }
    },
    shuffle: { description: 'unsupported', table: { category: 'QTI' } },
    'data-choices-container-width': { description: 'unsupported', table: { category: 'QTI' } },
    'data-max-selections-message': { description: 'unsupported', table: { category: 'QTI' } },
    'data-min-selections-message': { description: 'unsupported', table: { category: 'QTI' } }
  }
};
export default meta;

export const Interaction = {
  render: args =>
    html`<qti-gap-match-interaction
      response-identifier=${ifDefined(args['response-identifier'])}
      @qti-register-interaction=${action(`qti-register-interaction`)}
      @qti-interaction-response=${action(`qti-interaction-response`)}
      class=${ifDefined(
        args.classes ? (Array.isArray(args.classes) ? args.classes.join(' ') : args.classes) : undefined
      )}
      min-associations=${ifDefined(args['min-associations'])}
      max-associations=${ifDefined(args['max-associations'])}
      ?readonly=${args.readonly}
      ?disabled=${args.disabled}
    >
      <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
      <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
      <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
      <qti-gap-text identifier="A" match-max="1">autumn</qti-gap-text>
      <blockquote>
        <p>
          Now is the <qti-gap identifier="G1"></qti-gap> of our discontent<br />
          Made glorious <qti-gap identifier="G2"></qti-gap> by this sun of York;<br />
          And all the clouds that lour'd upon our house<br />
          In the deep bosom of the ocean buried.
        </p>
      </blockquote>
    </qti-gap-match-interaction>`
};

export const Item = {
  render: () => {
    const testRef = createRef<QtiAssessmentItem>();
    return html` <button @click="${() => testRef.value.processResponse()}">processResponse</button>
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
        identifier="gap-match-item"
        ${ref(testRef)}
        @qti-register-interaction=${action(`qti-register-interaction`)}
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
      >
        <qti-response-declaration base-type="directedPair" cardinality="multiple" identifier="RESPONSE">
          <qti-correct-response>
            <qti-value>W G1</qti-value>
            <qti-value>Su G2</qti-value>
          </qti-correct-response>
          <qti-mapping default-value="-1" lower-bound="0">
            <qti-map-entry map-key="W G1" mapped-value="1"></qti-map-entry>
            <qti-map-entry map-key="Su G2" mapped-value="2"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>
        <qti-outcome-declaration baseType="float" cardinality="single" identifier="SCORE"></qti-outcome-declaration>
        <qti-item-body>
          <qti-gap-match-interaction
            @qti-interaction-response="${e => action(JSON.stringify(e.detail))()}"
            class="qti-choices-top"
            response-identifier="RESPONSE"
            shuffle="false"
          >
            <qti-gap-text data-testid="choice-1" identifier="W" match-max="1">winter</qti-gap-text>
            <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
            <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
            <qti-gap-text identifier="A" match-max="1">autumn</qti-gap-text>
            <blockquote>
              <p>
                Now is the <qti-gap identifier="G1"></qti-gap> of our discontent<br />
                Made glorious <qti-gap identifier="G2"></qti-gap> by this sun of York;<br />
                And all the clouds that lour'd upon our house<br />
                In the deep bosom of the ocean buried.
              </p>
            </blockquote>
          </qti-gap-match-interaction>
        </qti-item-body>
        <qti-response-processing
          template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response"
        ></qti-response-processing>
      </qti-assessment-item>`;
  }
};
