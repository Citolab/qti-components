import { action } from '@storybook/addon-actions';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { within } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

import '@citolab/qti-components/qti-components';

import { QtiChoiceInteraction } from '../../index';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-choice-interaction',
  argTypes: {
    'min-choices': { control: { type: 'number' }, table: { category: 'QTI' } },
    'max-choices': { control: { type: 'number' }, table: { category: 'QTI' } },
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
      table: { category: 'QTI' }
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    classes: {
      description: 'supported classes',
      control: 'inline-check',
      options: [
        'qti-choices-stacking-2',
        'qti-choices-stacking-3',
        'qti-choices-stacking-4',
        'qti-choices-stacking-5',
        'qti-orientation-horizontal',
        'qti-input-control-hidden'
      ],
      table: { category: 'QTI' }
    },
    shuffle: { description: 'unsupported', table: { category: 'QTI' } },
    'data-max-selections-message': { description: 'unsupported', table: { category: 'QTI' } },
    'data-min-selections-message': { description: 'unsupported', table: { category: 'QTI' } }
  }
};
export default meta;

export const Default = {
  render: args => {
    return html` <qti-choice-interaction
      data-testid="qti-choice-interaction"
      data-max-selections-message="Too little selections made"
      data-min-selections-message="Too much selections made"
      response-identifier=${args['response-identifier']}
      @qti-register-interaction=${action(`qti-register-interaction`)}
      @qti-interaction-response=${action(`qti-interaction-response`)}
      class=${ifDefined(args.classes ? args.classes.join(' ') : undefined)}
      min-choices=${ifDefined(args['min-choices'])}
      max-choices=${ifDefined(args['max-choices'])}
      orientation=${ifDefined(args.orientation)}
      ?readonly=${args.readonly}
      .disabled=${args.disabled}
      ><qti-prompt>
        <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
        <p>Pick 1 choice.</p></qti-prompt
      >
      ${'\n'}${[
        'I think you can use WorkFlow.',
        'You should use FlowChart',
        'No you should use Workload Rage.',
        'I would recommend Chart Up.'
      ].map(
        (item, index) =>
          html` <qti-simple-choice data-testid="choice-${index}" identifier="choice-${index}">${item}</qti-simple-choice
            >${'\n'}`
      )}</qti-choice-interaction
    >`;
  }
  // play: ({ canvasElement }) => {
  //   const canvas = within(canvasElement);
  //   //   // 👇 Simulate interactions with the component
  //   //   // See https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args to learn how to setup logging in the Actions panel
  //   userEvent.click(canvas.getByTestId('choice-2'));
  //   // //   // 👇 Assert DOM structure
  //   expect(canvas.getByTestId('choice-2').getAttribute('aria-checked')).toBeTruthy();
  // }
};

export const Simple: Story = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-input-control-hidden', 'qti-choices-stacking-2']
  }
};

export const Multiple: Story = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-choices-stacking-2'],
    'min-choices': 1,
    'max-choices': 2
  }
};

export const CorrectResponse: Story = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-input-control-hidden', 'qti-choices-stacking-2'],
    'min-choices': 1,
    'max-choices': 2
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('qti-choice-interaction') as QtiChoiceInteraction;
    el.correctResponse = ['choice-1', 'choice-2'];
  }
};

export const ContentEditable = {
  render: () => {
    return html`
      <div contenteditable="true">
        <qti-choice-interaction response-identifier="RESPONSE">
          <qti-prompt>Can you start editting one of these simplechoices</qti-prompt>
          <qti-simple-choice identifier="choice-1"> I think you can use WorkFlow. </qti-simple-choice>
          <qti-simple-choice identifier="choice-2"><br /></qti-simple-choice>
          <qti-simple-choice identifier="choice-3"> No you should use Workload Rage. </qti-simple-choice>
          <qti-simple-choice identifier="choice-4"><br /></qti-simple-choice>
        </qti-choice-interaction>
      </div>
    `;
  }
};
