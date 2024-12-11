import './qti-extended-text-interaction';

import { html } from 'lit';

import { expect, fireEvent, fn, within } from '@storybook/test';

import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import type { QtiExtendedTextInteraction } from '@citolab/qti-components/qti-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-extended-text-interaction');

type Story = StoryObj<QtiExtendedTextInteraction & typeof args>;

const meta: Meta<QtiExtendedTextInteraction> = {
  component: 'qti-extended-text-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
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

export const Form: Story = {
  render: () => {
    return html`
      <form name="form" @submit=${e => e.preventDefault()}>
        ${Default.render({
          'pattern-mask': '[A-Za-z]{3}',
          'data-patternmask-message': 'Please enter exact 3 letters',
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
