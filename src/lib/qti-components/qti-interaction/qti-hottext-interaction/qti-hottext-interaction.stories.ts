import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import './qti-hottext-interaction';
import '../qti-hottext';
import { ifDefined } from 'lit/directives/if-defined.js';

const responses = ['[]', '["a"]', '"b"', '["d","e"]'];

export default {
  component: 'qti-hottext-interaction',
  parameters: {
    actions: {
      handles: ['saveResponse']
    },
    response: {
      control: { type: 'select', options: responses }
    }
  }
};

export const checkbox = {
  render: args =>
    html`
      <qti-hottext-interaction
        @qti-interaction-response="${e => {
          action(JSON.stringify(e.detail))();
        }}"
        .response=${args.response}
        class=${ifDefined(args.classes ? args.classes.join(' ') : undefined)}
        max-choices=${args['max-choices']}
        response-identifier="RESPONSE"
      >
        <p>
          Sponsors of the Olympic Games
          <qti-hottext identifier="A">who bought</qti-hottext> advertising time on United States television
          <qti-hottext identifier="B">includes</qti-hottext>
          <qti-hottext identifier="C">at least</qti-hottext> a dozen international firms
          <qti-hottext identifier="D">whose</qti-hottext> names are familiar to American consumers.
          <qti-hottext identifier="E">No error.</qti-hottext>
        </p>
      </qti-hottext-interaction>
    `,

  args: {
    maxChoices: 1,
    presentationClass: ''
  }
};

export const button = {
  render: ({ maxChoices, presentationClass, response }) =>
    html`
      <qti-hottext-interaction
        @qti-interaction-response="${e => {
          action(JSON.stringify(e.detail))();
        }}"
        .response=${response}
        class="choice-interaction ${presentationClass}"
        max-choices="${maxChoices}"
        response-identifier="RESPONSE"
      >
        <p>
          Sponsors of the Olympic Games
          <qti-hottext identifier="A">who bought</qti-hottext> advertising time on United States television
          <qti-hottext identifier="B">includes</qti-hottext>
          <qti-hottext identifier="C">at least</qti-hottext> a dozen international firms
          <qti-hottext identifier="D">whose</qti-hottext> names are familiar to American consumers.
          <qti-hottext identifier="E">No error.</qti-hottext>
        </p>
      </qti-hottext-interaction>
    `,

  args: {
    maxChoices: 1,
    presentationClass: 'qti-input-control-hidden'
  }
};
