import { html } from 'lit';
import { expect, fireEvent, within } from '@storybook/test';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import type { QtiTextEntryInteraction } from '@citolab/qti-components/qti-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-text-entry-interaction');

type Story = StoryObj<QtiTextEntryInteraction & typeof args>;

const meta: Meta<QtiTextEntryInteraction> = {
  component: 'qti-text-entry-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default = {
  render: args => {
    return html` ${template(args)} `;
  }
};

const inputWidthClass = [
  '',
  'qti-input-width-1',
  'qti-input-width-2',
  'qti-input-width-3',
  'qti-input-width-4',
  'qti-input-width-6',
  'qti-input-width-10',
  'qti-input-width-15',
  'qti-input-width-20',
  'qti-input-width-25',
  'qti-input-width-30',
  'qti-input-width-35',
  'qti-input-width-40',
  'qti-input-width-45',
  'qti-input-width-50',
  'qti-input-width-72'
];

export const PatternMask = {
  render: Default.render,
  args: {
    patternMask: '[A-Za-z]{3}',
    dataPatternmaskMessage: 'Please enter 3 letters'
  }
};

export const Form: Story = {
  render: () => {
    return html`
      <form name="form" @submit=${e => e.preventDefault()}>
        ${Default.render({
          patternMask: '[A-Za-z]{3}',
          dataPatternmaskMessage: 'Please enter exact 3 letters'
        })}
        <input type="submit" value="submit" />
      </form>
    `;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textEntryInteraction = canvasElement.querySelector('qti-text-entry-interaction').shadowRoot;
    const input = textEntryInteraction.querySelector('input');
    const form = canvas.getByRole<HTMLFormElement>('form');

    const expectedValue = 'abc';
    // type in the input
    await fireEvent.keyUp(input, { target: { value: expectedValue } });
    await fireEvent.submit(form);

    const formData = new FormData(form);
    const value = formData.get('RESPONSE');
    // Check that form data contains the expected values
    expect(value).toEqual(expectedValue);
    let isValid = form.reportValidity();
    expect(isValid).toBe(true);

    await fireEvent.keyUp(input, { target: { value: '123' } });
    isValid = form.reportValidity();
    expect(isValid).toBe(false);

    await fireEvent.keyUp(input, { target: { value: expectedValue } });
    isValid = form.reportValidity();
    expect(isValid).toBe(true);
    // Define expected values for assertion
  }
};

export const Sizes = {
  render: args =>
    html`<p>
        qti-input-width-1 :
        <qti-text-entry-interaction
          class="qti-input-width-1"
          expected-length="15"
          response-identifier="RESPONSE1"
        ></qti-text-entry-interaction>
      </p>
      <p>
        qti-input-width-2 :
        <qti-text-entry-interaction
          class="qti-input-width-2"
          expected-length="15"
          response-identifier="RESPONSE2"
        ></qti-text-entry-interaction>
      </p>

      <p>
        qti-input-width-3 :
        <qti-text-entry-interaction
          class="qti-input-width-3"
          expected-length="15"
          response-identifier="RESPONSE3"
        ></qti-text-entry-interaction>
      </p>

      <p>
        qti-input-width-4 :
        <qti-text-entry-interaction
          class="qti-input-width-4"
          expected-length="15"
          response-identifier="RESPONSE4"
        ></qti-text-entry-interaction>
      </p>

      <p>
        qti-input-width-6 :
        <qti-text-entry-interaction
          class="qti-input-width-6"
          expected-length="15"
          response-identifier="RESPONSE5"
        ></qti-text-entry-interaction>
      </p>

      <p>
        qti-input-width-10:
        <qti-text-entry-interaction
          class="qti-input-width-10"
          expected-length="15"
          response-identifier="RESPONSE6"
        ></qti-text-entry-interaction>
      </p>

      <p>
        qti-input-width-15:
        <qti-text-entry-interaction
          class="qti-input-width-15"
          expected-length="15"
          response-identifier="RESPONSE7"
        ></qti-text-entry-interaction>
      </p>

      <p>
        qti-input-width-20:
        <qti-text-entry-interaction
          class="qti-input-width-20"
          expected-length="20"
          response-identifier="RESPONSE8"
        ></qti-text-entry-interaction>
      </p>

      <p>
        qti-input-width-72:
        <qti-text-entry-interaction
          class="qti-input-width-72"
          expected-length="72"
          response-identifier="RESPONSE9"
        ></qti-text-entry-interaction>
      </p>`,
  args: {}
};

export const Formula = {
  render: args =>
    html`<p>Hoeveel kilo CO2 wordt jaarlijks bespaard door 8 zonnepanelen?</p>
      <ul>
        <li>Levensduur zonnepaneel 25 jaar</li>
        <li>CO2 uitstoot voor de productie van 1 zonnepaneel is 500 kilo</li>
        <li>1 zonnepaneel voorkomt 120 kilo CO2 uitstoot per jaar</li>
      </ul>
      <p>Reken uit:</p>
      <p>
        CO2 uitstoot voor productie van de zonnepanelen per jaar is 8 x
        <qti-text-entry-interaction
          class="qti-input-width-3"
          response-identifier="RESPONSE"
        ></qti-text-entry-interaction>
        /
        <qti-text-entry-interaction
          class="qti-input-width-3"
          response-identifier="RESPONSE"
        ></qti-text-entry-interaction>
        =
        <qti-text-entry-interaction
          class="qti-input-width-3"
          response-identifier="RESPONSE"
        ></qti-text-entry-interaction>
        kilo
      </p>
      <p>
        CO2 uitstoot die wordt bespaard per jaar is 8 x
        <qti-text-entry-interaction
          class="qti-input-width-3"
          response-identifier="RESPONSE"
        ></qti-text-entry-interaction>
        -
        <qti-text-entry-interaction
          class="qti-input-width-3"
          response-identifier="RESPONSE"
        ></qti-text-entry-interaction>
        =
        <qti-text-entry-interaction
          class="qti-input-width-3"
          response-identifier="RESPONSE"
        ></qti-text-entry-interaction>
        kilo
      </p>`,
  args: {}
};
