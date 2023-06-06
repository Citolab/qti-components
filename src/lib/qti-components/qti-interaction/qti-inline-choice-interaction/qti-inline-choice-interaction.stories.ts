import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import './qti-inline-choice-interaction';

import { QtiInlineChoiceInteraction } from './qti-inline-choice-interaction';

export default {
  component: 'qti-inline-choice-interaction',
  argTypes: {
    inputWidthClass: {
      control: { type: 'select', options: QtiInlineChoiceInteraction.inputWidthClass },
      description: 'attr: class qti-inline-choice-interaction'
    },
    response: { description: 'prop: qti-assessment-item', type: 'string' },
    shuffle: { description: 'attr: qti-inline-choice-interaction', type: 'boolean' },
    readonly: { description: 'attr: qti-inline-choice-interaction', type: 'boolean' },
    disabled: { description: 'attr: qti-inline-choice-interaction', type: 'boolean' }
  }
};

export const Interaction = {
  render: args =>
    html` <qti-inline-choice-interaction
      @on-interaction-response="${e => {
        action(JSON.stringify(e.detail))();
      }}"
      .response=${args.response}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      class="${args.inputWidthClass}"
      response-identifier="RESPONSE"
      shuffle="${args.shuffle}"
    >
      <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
      <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
      <qti-inline-choice identifier="Y">York</qti-inline-choice>
    </qti-inline-choice-interaction>`
};

export const Item = {
  render: ({ shuffle, inputWidthClass, response }) =>
    html` <qti-assessment-item
      .responses="${response}"
      identifier="inline-choice"
      @qti-interaction-changed="${e => {
        action(JSON.stringify(e.detail))();
      }}"
    >
      <qti-item-body>
        <p>Identify the missing word in this famous quote from Shakespeare's Richard III.</p>
        <blockquote>
          <p>
            Now is the winter of our discontent <br />Made glorious summer by this sun of
            <qti-inline-choice-interaction
              class="${inputWidthClass}"
              response-identifier="RESPONSE"
              shuffle="${shuffle}"
            >
              <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
              <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
              <qti-inline-choice identifier="Y">York</qti-inline-choice>
            </qti-inline-choice-interaction>
            And all the clouds that lour'd upon our house <br />In the deep bosom of the ocean buried.
          </p>
        </blockquote>
      </qti-item-body>
    </qti-assessment-item>`
};
