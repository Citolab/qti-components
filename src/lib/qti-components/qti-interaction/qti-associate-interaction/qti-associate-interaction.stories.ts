import { action } from '@storybook/addon-actions';
import { html } from 'lit';

import './qti-associate-interaction';
import '../qti-simple-associable-choice';
import { ifDefined } from 'lit/directives/if-defined.js';

export default {
  component: 'qti-associate-interaction',
  argTypes: {
    'response-identifier': { control: { type: 'text' } },
    'min-associations': { control: { type: 'number' } },
    'max-associations': { control: { type: 'number' } },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    class: { control: 'inline-check', options: ['USA', 'Canada', 'asd', '12das', 'a2ersd', '34ads'] }
  }
};

export const Interaction = {
  render: args =>
    html`<qti-associate-interaction
      response-identifier=${ifDefined(args['response-identifier'])}
      @qti-register-interaction=${action(`qti-register-interaction`)}
      @qti-interaction-response=${action(`qti-interaction-response`)}
      class=${args.class}
      min-associations=${ifDefined(args['min-associations'])}
      max-associations=${ifDefined(args['max-associations'])}
      ?readonly=${args.readonly}
      ?disabled=${args.disabled}
    >
      <qti-prompt>
        Hidden in this list of characters from famous Shakespeare plays are three pairs of rivals. Can you match each
        character to his adversary?
      </qti-prompt>
      <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="M" match-max="1">Montague</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
    </qti-associate-interaction>`
};
