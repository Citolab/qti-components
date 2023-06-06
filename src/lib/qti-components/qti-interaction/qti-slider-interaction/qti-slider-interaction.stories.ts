import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import './qti-slider-interaction';
import { ifDefined } from 'lit/directives/if-defined.js';

export default {
  component: 'qti-slider-interaction'
};

type Interaction = {
  min: number;
  max: number;
  step: number;
  orientation: 'horizontal' | 'vertical';
  stepLabel: boolean;
  reverse: boolean;
  response: string;
  readonly: boolean;
  disabled: boolean;
};

export const Interaction = {
  render: args => {
    const { min, max, step, orientation, stepLabel, reverse, response, readonly, disabled } = args;
    return html`
      <qti-slider-interaction
        style="width:300px; left:100px; position: absolute"
        @qti-interaction-response="${action(`on-interaction-response`)}"
        ?disabled=${disabled}
        ?readonly=${readonly}
        response-identifier="RESPONSE"
        lower-bound=${min ? ifDefined(min) : 0}
        upper-bound=${max ? ifDefined(max) : 10}
        step=${ifDefined(step)}
        orientation=${ifDefined(orientation)}
        step-label=${ifDefined(stepLabel)}
        reverse=${ifDefined(reverse)}
      >
        <qti-prompt>
          In total, what percentage of the UK population do you think were eventually classified as having no religion?
        </qti-prompt>
      </qti-slider-interaction>
    `;
  },

  args: {}
};
