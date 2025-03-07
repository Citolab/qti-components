import './qti-extended-text-interaction';

import { html } from 'lit';
import { expect, fireEvent, within } from '@storybook/test';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { QtiExtendedTextInteraction } from './qti-extended-text-interaction';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-extended-text-interaction');

type Story = StoryObj<QtiExtendedTextInteraction & typeof args>;

/**
 *
 * ### [3.2.4 Extended Text Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.omuxci3o5dmg)
 * A block interaction that allows the candidate to enter an extended amount of text.
 *
 */
const meta: Meta<QtiExtendedTextInteraction> = {
  component: 'qti-extended-text-interaction',
  title: '3.2 interaction types/3.2.4 Extended Text Interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'basic']
};
export default meta;

export const Default = {
  render: args => {
    return html` ${template(args)} `;
  }
};

export const PatternMask = {
  render: Default.render,
  args: {
    'pattern-mask': '[A-Za-z]{3}',
    'data-patternmask-message': 'Please enter exact 3 letters',
    'response-identifier': 'RESPONSE'
  }
};

export const Test: Story = {
  render: args => {
    return html`
      <form name="form" @submit=${e => e.preventDefault()}>
        <qti-extended-text-interaction ${spread(args)}></qti-extended-text-interaction>

        <input type="submit" value="submit" />
      </form>
    `;
  },
  args: {
    'pattern-mask': '[A-Za-z]{3}',
    'data-patternmask-message': 'Please enter exact 3 letters',
    'response-identifier': 'RESPONSE',
    name: 'RESPONSE'
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
