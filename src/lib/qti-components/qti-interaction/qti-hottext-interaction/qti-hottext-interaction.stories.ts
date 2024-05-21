import { action } from '@storybook/addon-actions';
import { html } from 'lit';

import { ifDefined } from 'lit/directives/if-defined.js';
import '../qti-hottext';
import './qti-hottext-interaction';

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

export const Default = {
  render: args => html`
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
    classes: ''
  }
};

export const Button = {
  render: Default.render,

  args: {
    maxChoices: 1,
    classes: ['qti-input-control-hidden']
  }
};

export const Hidden = {
  render: Default.render,

  args: {
    maxChoices: 1,
    classes: ['qti-unselected-hidden']
  }
};
