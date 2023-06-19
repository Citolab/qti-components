import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import './qti-slider-interaction';
import { ifDefined } from 'lit/directives/if-defined.js';

import * as htmlToImage from 'html-to-image';
import { StoryObj, Meta } from '@storybook/web-components';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-slider-interaction',
  argTypes: {
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
      table: { category: 'QTI' }
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } }
  }
};
export default meta;

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

    const showScreenshot = () => {
      const interaction: HTMLElement = document.querySelector('qti-slider-interaction');
      const shot: HTMLImageElement = document.querySelector('.screenshot');

      htmlToImage
        .toPng(interaction)
        .then(dataUrl => (shot.src = dataUrl))
        .catch(error => console.error('oops, something went wrong!', error));
    };

    return html`
      <button @click=${() => showScreenshot()}>screenshot</button>

      <!-- style="width:300px; left:100px; position: absolute" -->
      <qti-slider-interaction
        @qti-interaction-response="${action(`on-interaction-response`)}"
        ?disabled=${disabled}
        ?readonly=${readonly}
        response=${ifDefined(response)}
        response-identifier="RESPONSE"
        lower-bound=${min ? ifDefined(min) : 0}
        upper-bound=${max ? ifDefined(max) : 10}
        step=${ifDefined(step)}
        orientation=${ifDefined(orientation)}
        ?step-label=${stepLabel}
        ?reverse=${reverse}
      >
        <qti-prompt>
          In total, what percentage of the UK population do you think were eventually classified as having no religion?
        </qti-prompt>
      </qti-slider-interaction>
      <img class="screenshot" />
    `;
  },

  args: {}
};
