import { action } from '@storybook/addon-actions';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { expect, fn, within } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

import '@citolab/qti-components/qti-components';

import { fireEvent } from '@storybook/testing-library';
import { QtiChoiceInteraction, QtiSimpleChoice } from '../../index';

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
    shuffle: { control: { type: 'boolean' }, table: { category: 'QTI' } },
    classes: {
      description: 'supported classes',
      control: 'inline-check',
      options: [
        'qti-choices-stacking-1',
        'qti-choices-stacking-2',
        'qti-choices-stacking-3',
        'qti-choices-stacking-4',
        'qti-choices-stacking-5',

        'qti-labels-suffix-none',
        'qti-labels-suffix-period',
        'qti-labels-suffix-parenthesis',

        'qti-orientation-horizontal',
        'qti-input-control-hidden'
      ],
      table: { category: 'QTI' }
    },
    'data-max-selections-message': { description: 'unsupported', table: { category: 'QTI' } },
    'data-min-selections-message': { description: 'unsupported', table: { category: 'QTI' } }
  }
};
export default meta;

export const Default = {
  render: args => {
    return html`<qti-choice-interaction
        name="choice"
        data-testid="qti-choice-interaction"
        data-max-selections-message="Too much selections made"
        data-min-selections-message="Too little selections made"
        response-identifier="RESPONSE"
        @qti-register-interaction=${action(`qti-register-interaction`)}
        @qti-interaction-response=${action(`qti-interaction-response`)}
        class=${ifDefined(args.classes ? args.classes.join(' ') : undefined)}
        min-choices=${ifDefined(args['min-choices'])}
        max-choices=${ifDefined(args['max-choices'])}
        orientation=${ifDefined(args.orientation)}
        ?shuffle=${args.shuffle}
        ?readonly=${args.readonly}
        .disabled=${args.disabled}
        ><qti-prompt>
          <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
          <p>Pick 1 choice.</p>
        </qti-prompt>
        <qti-simple-choice data-testid="A" identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice data-testid="B" identifier="B" fixed>Option B</qti-simple-choice>
        <qti-simple-choice data-testid="C" identifier="C">Option C</qti-simple-choice>
        <qti-simple-choice data-testid="D" identifier="D">Option D</qti-simple-choice>
      </qti-choice-interaction>`;
  }
};

export const Standard: Story = {
  render: Default.render,
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    fireEvent.click(canvas.getByTestId('B'));
    expect(canvas.getByTestId<QtiSimpleChoice>('B').checked).toBeTruthy();
  }
};

export const Disabled: Story = {
  render: Default.render,
  args: {
    disabled: true
  }
};

export const Readonly: Story = {
  render: Default.render,
  args: { readonly: true }
};

export const MinChoices1: Story = {
  render: Default.render,
  args: {
    minChoices: 1
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fireEvent.click(canvas.getByTestId('B'));
    expect(canvas.getByTestId<QtiSimpleChoice>('B').checked).toBeTruthy();
  }
};

export const MaxChoices2: Story = {
  render: Default.render,
  args: {
    'min-choices': 1,
    'max-choices': 2
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByTestId<QtiSimpleChoice>('A');
    const choiceB = canvas.getByTestId<QtiSimpleChoice>('B');
    const choiceC = canvas.getByTestId<QtiSimpleChoice>('C');

    expect(choiceA.getAttribute('role')).toBe('checkbox');
    // expect(element.validate()).toBeFalsy();

    await fireEvent.click(choiceA);
    expect(choiceA.checked).toBeTruthy();

    await fireEvent.click(choiceB);
    expect(choiceB.checked).toBeTruthy();
    expect(choiceA.checked).toBeTruthy();

    await fireEvent.click(choiceC);
  }
};

export const ControlHidden: Story = {
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
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByTestId<QtiSimpleChoice>('A');
    const choiceB = canvas.getByTestId<QtiSimpleChoice>('B');

    // Set up a spy to check if 'qti-interaction-changed' event is triggered
    const interactionChangedSpy = fn();
    canvasElement.addEventListener('qti-interaction-response', interactionChangedSpy);

    // Simulate clicking choiceB
    await fireEvent.click(choiceA);
    await fireEvent.click(choiceB);

    expect(choiceA.checked).toBeTruthy();
    expect(choiceB.checked).toBeTruthy();

    // Assert that the 'qti-interaction-changed' event was called
    expect(interactionChangedSpy).toHaveBeenCalled();

    // Extract the event data from the spy's second call
    const event = interactionChangedSpy.mock.calls[1][0];
    
    // Define expected detail data
    const expectedDetail = {
      responseIdentifier: 'RESPONSE', // replace with actual response identifier if available
      response: ['A','B'] // assuming "B" is the expected response; adjust as needed
    };

    // Check that the event's detail matches expected data
    expect(event.detail).toEqual(expectedDetail);
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
    el.correctResponse = ['A', 'B'];
  }
};

export const VocabularyDecimal: Story = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-labels-decimal'],
    'min-choices': 1,
    'max-choices': 1
  },
  play: ({ canvasElement }) => {
    // check if screenshots match
  }
};

VocabularyDecimal.parameters = {
  chromatic: { disableSnapshot: false } // Ensure Chromatic takes a snapshot for this story
};

export const VocabularyLowerAlphaStory = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-labels-lower-alpha'],
    'min-choices': 1,
    'max-choices': 1
  }
};

export const VocabularyUpperAlphaStory = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-labels-upper-alpha'],
    'min-choices': 1,
    'max-choices': 1
  }
};

export const VocabularyLowerAlphaSuffixDotStory = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-labels-lower-alpha', 'qti-labels-suffix-period'],
    'min-choices': 1,
    'max-choices': 1
  }
};

export const VocabularyLowerAlphaSuffixDotAndCorrectStory = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    classes: ['qti-labels-lower-alpha', 'qti-labels-suffix-period'],
    'min-choices': 1,
    'max-choices': 1
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('qti-choice-interaction') as QtiChoiceInteraction;
    el.correctResponse = ['A', 'B'];
  }
};

export const Form: Story = {
  render: () => {
    return html`
      <form name="choice-form" @submit=${(e) => e.preventDefault()}>
        ${Default.render({
          'min-choices': 1,
          'max-choices': 2
        })}
        <input type="submit" value="submit" />
      </form>
    `;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByTestId<QtiSimpleChoice>('A');
    const choiceB = canvas.getByTestId<QtiSimpleChoice>('B');
    const form = canvas.getByRole<HTMLFormElement>('form');

    await fireEvent.click(choiceA);
    await fireEvent.click(choiceB);
    
    await fireEvent.submit(form);

    const formData = new FormData(form);
    const submittedValues = Array.from(formData.entries());

    // Define expected values for assertion
    const expectedValues = [
      ['choice', 'A'],
      ['choice', 'B']
    ];

    const selectedOptions = formData.getAll('options'); // Returns an array, e.g., ['A', 'B']

    console.log('Selected Options:', selectedOptions);
    
    // Check that form data contains the expected values
    expect(submittedValues).toEqual(expect.arrayContaining(expectedValues));
  }
};

export const ContentEditable = {
  render: () => {
    return html` <div contenteditable="true">${Default.render({})}</div> `;
  }
};
