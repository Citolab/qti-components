import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { expect, fireEvent, fn, waitFor, within } from '@storybook/test';
import { getByShadowRole } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { InputType } from '@storybook/core/types';
import type { QtiSimpleChoice } from '../qti-simple-choice';
import type { QtiChoiceInteraction } from './qti-choice-interaction';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-choice-interaction');

type Story = StoryObj<QtiChoiceInteraction & typeof args>;

/**
 *
 * ### [3.2.2 Choice Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.j9nu1oa1tu3b)
 * The ChoiceInteraction.Type (qti-choice-interaction) interaction presents a collection of choices to the candidate. The candidate's task is to select one or more of the choices, up to a maximum of max-choices. The interaction is always initialized with no choices selected.
 *
 */
const meta: Meta<
  QtiChoiceInteraction & { classLabel: InputType; classLabelSuffix: InputType; classOrientation: InputType }
> = {
  component: 'qti-choice-interaction',
  args,
  argTypes: {
    ...argTypes,
    classLabel: {
      options: ['qti-labels-none', 'qti-labels-decimal', 'qti-labels-lower-alpha', 'qti-labels-upper-alpha'],
      control: { type: 'select' },
      table: { category: 'Styling' }
    },
    classLabelSuffix: {
      options: ['qti-labels-suffix-none', 'qti-labels-suffix-period', 'qti-labels-suffix-parenthesis'],
      control: { type: 'select' },
      table: { category: 'Styling' }
    },
    classOrientation: {
      options: ['qti-orientation-horizontal', 'qti-orientation-vertical'],
      control: { type: 'select' },
      table: { category: 'Styling' }
    }
  },
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['!autodocs']
};
export default meta;

export const Default: Story = {
  render: args => {
    return html`
      ${template(
        args,
        html` <qti-prompt>
            <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
          </qti-prompt>
          <qti-simple-choice data-testid="A" identifier="A">Option A</qti-simple-choice>
          <qti-simple-choice data-testid="B" identifier="B" fixed>Option B</qti-simple-choice>
          <qti-simple-choice data-testid="C" identifier="C">Option C</qti-simple-choice>
          <qti-simple-choice data-testid="D" identifier="D">Option D</qti-simple-choice>`
      )}
    `;
  }
};

export const Test: Story = {
  render: () => {
    return html` <qti-choice-interaction min-choices="1" max-choices="2">
        <qti-prompt>
          <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
        </qti-prompt>
        <qti-simple-choice identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice identifier="B">Option B</qti-simple-choice>
        <qti-simple-choice identifier="C">Option C</qti-simple-choice>
        <qti-simple-choice identifier="D">Option D</qti-simple-choice>
      </qti-choice-interaction>
      <button
        id="validate-button"
        @click=${() => {
          const choiceInteraction = document.querySelector('qti-choice-interaction') as HTMLElement & {
            reportValidity: () => boolean;
          };
          choiceInteraction?.reportValidity();
        }}
      >
        Validate
      </button>`;
  },
  args: {
    'min-choices': 1,
    'max-choices': 2
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Option C');
    const button = canvas.getByRole('button', { name: 'Validate' });

    expect(choiceA.internals.role).toBe('checkbox');
    // expect(element.validate()).toBeFalsy();

    await fireEvent.click(choiceA);
    expect(choiceA.checked).toBeTruthy();

    await fireEvent.click(choiceB);
    expect(choiceB.checked).toBeTruthy();
    expect(choiceA.checked).toBeTruthy();

    await fireEvent.click(choiceC);
    const validationMessage = getByShadowRole(canvasElement, 'alert');

    await fireEvent.click(button);

    await waitFor(() => expect(validationMessage).toBeVisible());

    expect(validationMessage.textContent).toBe('Please select no more than 2 options.');
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

export const OrientationHorizontal: Story = {
  render: Default.render,
  args: {
    orientation: 'horizontal'
  }
};

export const ControlHidden: Story = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    class: ['qti-input-control-hidden', 'qti-choices-stacking-2'].join(' ')
  }
};

export const Multiple: Story = {
  render: Default.render,
  args: {
    'response-identifier': 'RESPONSE',
    orientation: 'vertical',
    class: ['qti-choices-stacking-2'].join(' '),
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
      response: ['A', 'B'] // assuming "B" is the expected response; adjust as needed
    };

    // Check that the event's detail matches expected data
    expect(event.detail).toEqual(expectedDetail);
  }
};

export const CorrectResponse: Story = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    class: ['qti-input-control-hidden', 'qti-choices-stacking-2'].join(' '),
    'min-choices': 1,
    'max-choices': 2
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceInteraction = canvas.getByRole<QtiChoiceInteraction>('group');
    choiceInteraction.correctResponse = ['A', 'B'];
  }
};

export const VocabularyDecimal: Story = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    class: ['qti-labels-decimal'].join(' '),
    'min-choices': 1,
    'max-choices': 1
  }
};

VocabularyDecimal.parameters = {
  chromatic: { disableSnapshot: false } // Ensure Chromatic takes a snapshot for this story
};

export const VocabularyLowerAlphaStory = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    class: ['qti-labels-lower-alpha'].join(' '),
    'min-choices': 1,
    'max-choices': 1
  }
};

export const VocabularyUpperAlphaStory = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    class: ['qti-labels-upper-alpha'].join(' '),
    'min-choices': 1,
    'max-choices': 1
  }
};

export const VocabularyLowerAlphaSuffixDotStory = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    class: ['qti-labels-lower-alpha', 'qti-labels-suffix-period'].join(' '),
    'min-choices': 1,
    'max-choices': 1
  }
};

export const VocabularyLowerAlphaSuffixDotAndCorrectStory = {
  render: Default.render,
  args: {
    orientation: 'vertical',
    class: ['qti-labels-lower-alpha', 'qti-labels-suffix-period'].join(' '),
    'min-choices': 1,
    'max-choices': 1
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByRole<QtiChoiceInteraction>('group');
    el.correctResponse = ['A', 'B'];
  }
};

// export const Form: Story = {
//   render: () => {
//     return html`
//       <form name="choice-form" @submit=${e => e.preventDefault()}>
//         ${Default.render({
//           'response-identifier': 'RESPONSE',
//           'min-choices': 1,
//           'max-choices': 2
//         })}
//         <input type="submit" value="submit" />
//       </form>
//     `;
//   },
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     const choiceA = canvas.getByTestId<QtiSimpleChoice>('A');
//     const choiceB = canvas.getByTestId<QtiSimpleChoice>('B');
//     const form = canvas.getByRole<HTMLFormElement>('form');

//     await fireEvent.click(choiceA);
//     await fireEvent.click(choiceB);
//     await fireEvent.submit(form);

//     const formData = new FormData(form);

//     const submittedValues = formData.getAll('RESPONSE');

//     // Define expected values for assertion
//     const expectedValues = ['A', 'B'];

//     // Check that form data contains the expected values
//     expect(submittedValues).toEqual(expect.arrayContaining(expectedValues));
//   }
// };

// export const ContentEditable = {
//   render: () => {
//     return html` <div contenteditable="true">${Default.render({})}</div> `;
//   }
// };
