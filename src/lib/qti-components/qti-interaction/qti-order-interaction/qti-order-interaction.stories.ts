import { action } from '@storybook/addon-actions';
import { html } from 'lit';

import '../../index';

import { ifDefined } from 'lit/directives/if-defined.js';

export default {
  component: 'qti-order-interaction',
  argTypes: {
    'response-identifier': { control: { type: 'text' }, table: { category: 'QTI' } },
    'min-choices': { control: { type: 'number' }, table: { category: 'QTI' } },
    'max-choices': { control: { type: 'number' }, table: { category: 'QTI' } },
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
      table: { category: 'QTI' }
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    shuffle: { control: { type: 'boolean' } },
    classes: {
      description: 'supported classes',
      control: 'radio',
      options: ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right'],
      table: { category: 'QTI' }
    },
    unsupported: {
      description: 'unsupported',
      control: 'inline-check',
      options: [
        'qti-labels-none',
        'qti-labels-decimal',
        'qti-labels-lower-alpha',
        'qti-labels-upper-alpha',
        'qti-labels-suffix-none',
        'qti-labels-suffix-period',
        'qti-labels-suffix-parenthesis',
        'data-choices-container-width'
      ],
      table: { category: 'QTI' }
    },
    'data-max-selections-message': { description: 'unsupported', table: { category: 'QTI' } },
    'data-min-selections-message': { description: 'unsupported', table: { category: 'QTI' } }
  }
};

export const Default = {
  render: args => html`
    <qti-order-interaction
      @qti-register-interaction="${action(`qti-register-interaction`)}"
      @qti-interaction-response="${action(`qti-interaction-response`)}"
      .disabled=${args.disabled}
      .readonly=${args.readonly}
      orientation=${ifDefined(args.orientation)}
      shuffle=${args.shuffle}
      class=${ifDefined(
        args.classes ? (Array.isArray(args.classes) ? args.classes.join(' ') : args.classes) : undefined
      )}
      response-identifier="RESPONSE"
    >
      <qti-prompt
        >The following F1 drivers finished on the podium in the first ever Grand Prix of Bahrain. Can you rearrange them
        into the correct finishing order?</qti-prompt
      >
      <qti-simple-choice identifier="DriverA">Rubens</qti-simple-choice>
      <qti-simple-choice identifier="DriverB">Jenson</qti-simple-choice>
      <qti-simple-choice identifier="DriverC">Michael</qti-simple-choice>
    </qti-order-interaction>
  `,

  args: {}
};
