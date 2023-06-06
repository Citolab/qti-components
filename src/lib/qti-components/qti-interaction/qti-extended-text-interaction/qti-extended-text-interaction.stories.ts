import './qti-extended-text-interaction';

import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/web-components';
import { ifDefined } from 'lit/directives/if-defined.js';

type Story = StoryObj;

const meta: Meta = {
  component: 'qti-extended-text-interaction',

  argTypes: {
    base: { description: 'unsupported' },
    'string-identifier': { description: 'unsupported' },
    'expected-length': { control: { type: 'number' } },
    'pattern-mask': { control: { type: 'text' } },
    'placeholder-text': { control: { type: 'text' } },
    'max-strings': { description: 'unsupported' },
    'min-strings': { description: 'unsupported' },
    'expected-lines': { description: 'unsupported' },
    format: { options: ['plain', 'preformatted', 'xhtml'], description: 'unsupported' },
    'response-identifier': { control: { type: 'text' } },
    class: {
      options: ['', 'qti-height-lines-3', 'qti-height-lines-6', 'qti-height-lines-15'],
      control: { type: 'select' }
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } }
  }
};
export default meta;

export const Interaction = {
  render: args =>
    html`
      <qti-extended-text-interaction
        @qti-register-interaction="${action(`qti-register-interaction`)}"
        @qti-interaction-response="${action(`qti-interaction-response`)}"
        response-identifier=${args['response-identifier']}
        .response=${args.response}
        ?disabled=${ifDefined(args.disabled)}
        ?readonly=${ifDefined(args.readonly)}
        placeholder-text=${ifDefined(args['placeholder-text'])}
        class="${args.class}"
        expected-length=${ifDefined(args['expected-length'])}
        pattern-mask=${ifDefined(args['pattern-mask'])}
        data-patternmask-message=${ifDefined(args['data-pattern-mask-message'])}
      >
      </qti-extended-text-interaction>
    `
};

export const patternMask = {
  render: Interaction.render,
  args: {
    'pattern-mask': '[A-Za-z]{3}',
    'data-pattern-mask-message': 'Alleen maar 3 letters toegestaan'
  }
};
