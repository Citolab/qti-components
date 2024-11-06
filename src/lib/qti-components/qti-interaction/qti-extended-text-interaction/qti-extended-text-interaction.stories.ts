import './qti-extended-text-interaction';

import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../qti-prompt/qti-prompt';

import { expect, fn, within } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { fireEvent } from '@storybook/testing-library';
import { waitFor } from '@testing-library/dom';

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

export const Default = {
  render: args => html`
    <qti-extended-text-interaction
      @qti-register-interaction="${action(`qti-register-interaction`)}"
      @qti-interaction-response="${action(`qti-interaction-response`)}"
      response-identifier=${args['response-identifier']}
      .response=${args.response}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      placeholder-text=${ifDefined(args['placeholder-text'])}
      class="${args.class}"
      expected-length=${ifDefined(args['expected-length'])}
      pattern-mask=${ifDefined(args['pattern-mask'])}
      data-patternmask-message=${ifDefined(args['data-pattern-mask-message'])}
    >
      <qti-prompt>Write Sam a postcard. Answer the questions. Write 25-35 words.</qti-prompt>
    </qti-extended-text-interaction>
  `
};

export const PatternMask = {
  render: Default.render,
  args: {
    'pattern-mask': '[A-Za-z]{3}',
    'data-pattern-mask-message': 'Please enter 3 letters'
  }
};

export const Form: Story = {
  render: () => {
    return html`
      <form name="form" @submit=${e => e.preventDefault()}>
        ${Default.render({
          'pattern-mask': '[A-Za-z]{3}',
          'data-pattern-mask-message': 'Please enter exact 3 letters',
          'response-identifier': 'RESPONSE'
        })}
        <input type="submit" value="submit" />
      </form>
    `;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const extendedTextInteraction = canvasElement.querySelector('qti-extended-text-interaction').shadowRoot;
    const textarea = extendedTextInteraction.querySelector('textarea');
    const form = canvas.getByRole<HTMLFormElement>('form');

    const expectedValue = 'abc';
    // type in the input
    await fireEvent.keyUp(textarea, { target: { value: expectedValue } });
    await fireEvent.submit(form);

    const formData = new FormData(form);
    const value = formData.get('RESPONSE');
    // Check that form data contains the expected values
    expect(value).toEqual(expectedValue);
    let isValid = form.reportValidity();
    expect(isValid).toBe(true);

    await fireEvent.keyUp(textarea, { target: { value: '123' } });

    isValid = form.reportValidity();
    expect(isValid).toBe(false);

    await fireEvent.keyUp(textarea, { target: { value: expectedValue } });
    isValid = form.reportValidity();
    expect(isValid).toBe(true);
    // Define expected values for assertion
  }
};
