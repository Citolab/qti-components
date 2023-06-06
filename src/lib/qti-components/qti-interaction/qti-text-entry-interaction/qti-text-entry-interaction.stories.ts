import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import { QtiTextEntryInteraction } from './qti-text-entry-interaction';
import './qti-text-entry-interaction';

const inputWidthClass = [
  '',
  'qti-input-width-2',
  'qti-input-width-1',
  'qti-input-width-3',
  'qti-input-width-4',
  'qti-input-width-6',
  'qti-input-width-10',
  'qti-input-width-15',
  'qti-input-width-20',
  'qti-input-width-72'
];

export default {
  component: 'qti-text-entry-interaction',
  argTypes: {
    // response: { type: 'string' },
    // expectedLength: { type: 'number' },
    // readonly: { description: 'attr: qti-inline-choice-interaction', type: 'boolean' },
    // disabled: { description: 'attr: qti-inline-choice-interaction', type: 'boolean' },
  }
};

export const Interaction = {
  render: args =>
    html`
      <qti-text-entry-interaction
        @qti-register-interaction="${action(`qti-register-interaction`)}"
        @qti-interaction-response="${action(`qti-interaction-response`)}"
        .response=${args.response}
        ?disabled=${args.disabled}
        ?readonly=${args.readonly}
        placeholder-text="totaal"
        class="text-entry-interaction ${inputWidthClass}"
        expected-length=${args.expectedLength}
        pattern-mask=${args.patternMask}
        data-patternmask-message=${args.dataPatternmaskMessage}
        response-identifier="RESPONSE"
      >
      </qti-text-entry-interaction>
    `,

  args: {}
};
