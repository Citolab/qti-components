import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent, fn } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';
import { spread } from '@open-wc/lit-helpers';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { InputType } from '@storybook/core/types';
import type { QtiSimpleChoice } from '../qti-simple-choice';
import type { QtiChoiceInteraction } from './qti-choice-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-choice-interaction', {
  excludeCategories: []
});

type Story = StoryObj<QtiChoiceInteraction & typeof args>;

/**
 *
 * ### [3.2.2 Choice Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.j9nu1oa1tu3b)
 * Presents a set of choices to the candidate. The candidate's task is to select one or more of the choices, up to a maximum number of choices allowed.
 *
 */
const meta: Meta<
  QtiChoiceInteraction & { classLabel: InputType; classLabelSuffix: InputType; classOrientation: InputType }
> = {
  component: 'qti-choice-interaction',
  title: '3.2 interaction types/3.2.2 Choice Interaction',
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

export const Default: Story = {
  render: args => {
    return html`
      ${template(
        args,
        html`<qti-prompt>
            <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
          </qti-prompt>
          <qti-simple-choice identifier="A">Option A</qti-simple-choice>
          <qti-simple-choice identifier="B">Option B</qti-simple-choice>
          <qti-simple-choice identifier="C">Option C</qti-simple-choice>
          <qti-simple-choice identifier="D">Option D</qti-simple-choice>`
      )}
    `;
  }
};

export const Test: Story = {
  render: args => {
    return html` <qti-choice-interaction ${spread(args)} data-testid="interaction">
      <qti-prompt>
        <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
      </qti-prompt>
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>`;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Option C');
    // const choiceD = canvas.getByText<QtiSimpleChoice>('Option D');
    // const validationMessage = getByShadowRole(interaction, 'alert');

    const spy = fn(e => e.detail.response);

    interaction.addEventListener('qti-interaction-response', spy);

    // await fireEvent.click(choiceA);
    // expect(choiceA.checked).toBeTruthy();

    // await fireEvent.click(choiceB);
    // expect(choiceB.checked).toBeTruthy();
    // expect(choiceA.checked).toBeTruthy();

    // await fireEvent.click(choiceC);
    // const validationMessage = getByShadowRole(canvasElement, 'alert');

    // interaction.reportValidity();

    // await waitFor(() => expect(validationMessage).toBeVisible());

    // expect(validationMessage.textContent).toBe('Please select no more than 2 options.');

    // const callback = fn(e => e.detail.response);

    // interaction.addEventListener('qti-interaction-response', callback);

    try {
      /* QTI */
      await step('response null', async () => {
        expect(interaction.value).toBe(null);
      });
      await step('default attribute values', async () => {
        expect(interaction.maxChoices).toBe(1);
        expect(interaction.minChoices).toBe(0); // unlimited
        expect(interaction.orientation).toBe('vertical');
        // expect(interaction.shuffle).toBe(false);
      });
      await step('children have default attribute values', async () => {
        expect(choiceA.identifier).not.toBe(null);
        expect(choiceB.identifier).not.toBe(null);
        expect(choiceC.identifier).not.toBe(null);
        expect(choiceA.templateIdentifier).toBe(null);
        expect(choiceA.showHide).toBe('show');
        expect(choiceA.fixed).toBe(false);
      });
      await step('initial state', async () => {
        expect(choiceA.internals.role).toBe('radio');
        expect(choiceB.internals.role).toBe('radio');
        expect(choiceC.internals.role).toBe('radio');
      });
      /* ACCESSIBILITY */
      await step('interaction and childreven have correct accessibility roles', async () => {
        expect(choiceA.internals.role).toBe('radio');
        expect(interaction['_internals'].role).toBe('radiogroup');
      });
      /* INTERACTION */
      await step('interaction', async () => {
        await fireEvent.click(choiceA);
        expect(choiceA.checked).toBeTruthy();
        expect(interaction.value).toBe('A');
        await fireEvent.click(choiceB);
        expect(choiceB.checked).toBeTruthy();
        expect(interaction.value).toBe('B');
        expect(choiceA.checked).toBeFalsy();
      });
      /* INTERNALS */
      await step('event called', async () => {
        expect(spy).toHaveBeenCalled();
      });
      await step('event detail', async () => {
        const receivedEvent = spy.mock.calls.at(0)[0];
        const expectedResponse = 'A';
        expect(receivedEvent.detail.response).toEqual(expectedResponse);
      });
      /* FORM */
      // await step('reset interaction', async () => {
      //   interaction.reset();
      //   expect(interaction.value).toBe(null);
      // });
      await step('tab index', async () => {
        choiceA.focus();
        await expect(choiceA).toHaveFocus();
        // await delay(2000);
        // await userEvent.tab();
        // await expect(choiceB).toHaveFocus();
        // await userEvent.keyboard('{space}');
        // await expect(choiceB.checked).toBeTruthy();
      });
      // await step('changing qti attributes should reset state', async () => {
      //   interaction.maxChoices = 2;
      //   expect(interaction.value).toBe(null);
      // });
      // await step('validate', async () => {
      //   interaction.reportValidity();
      //   // expect(validationMessage).toBe('Please select an option.');
      // });
      // await step('responsiveness container queries', async () => {});

      // await step('changing qti attributes should reset state', async () => {});
      // await step('keyboard navigation', async () => {});
      // await step('touch events', async () => {});

      // await step('the dom is wihout added attributes', async () => {
      //   console.log(interaction.outerHTML);
      // });
      // await step('correct event thrown', async () => {});
      // await step('set value', async () => {});

      // await step('set value outside', async () => {});
      // await step('report reportValidity', async () => {});
      // await step('disabled', async () => {});
      // await step('readonly', async () => {});
      // await step('default attributes in QTI not on the item ( webcomponent without attributes )', async () => {});
    } finally {
      interaction.removeEventListener('qti-interaction-response', spy);
    }
  }
};

export const Disabled: Story = {
  render: Test.render,
  args: {
    disabled: true
  }
};

export const Readonly: Story = {
  render: Test.render,
  args: { readonly: true }
};

export const CorrectResponse: Story = {
  render: Test.render,
  args: {
    orientation: 'vertical',
    class: ['qti-input-control-hidden', 'qti-choices-stacking-2'].join(' '),
    'min-choices': 1,
    'max-choices': 2
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceInteraction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    choiceInteraction.correctResponse = ['A', 'B'];
  }
};

const formTemplate = (args, context) => html`
  <form data-testid="form" role="form" @submit=${e => e.preventDefault()}>
    ${Test.render(args, context)}
    <input type="submit" value="submit" />
  </form>
`;

export const FormCheckbox: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'max-choices': 0
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    const form = canvas.getByRole<HTMLFormElement>('form');

    await step('event', async () => {
      expect(choiceA.internals.role).toBe('checkbox');
    });

    await step('event', async () => {
      await fireEvent.click(choiceA);
      await fireEvent.click(choiceB);
      await fireEvent.submit(form);
      const formData = new FormData(form);

      const submittedValuesArray: string[] = (formData.get('RESPONSE') as string).split(',');
      const expectedValues = ['A', 'B'];

      expect(submittedValuesArray).toEqual(expect.arrayContaining(expectedValues));
    });
  }
};

export const FormRadio: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    const form = canvas.getByRole<HTMLFormElement>('form');

    await step('event', async () => {
      expect(choiceA.internals.role).toBe('radio');
    });

    await step('event', async () => {
      await fireEvent.click(choiceA);
      await fireEvent.click(choiceB);
      await fireEvent.submit(form);
      const formData = new FormData(form);
      const submittedValues = formData.getAll('RESPONSE');
      const expectedValues = ['B'];
      expect(submittedValues).toEqual(expect.arrayContaining(expectedValues));
    });
  }
};

export const ContentEditable = {
  render: (args, context) => {
    return html` <div contenteditable="true">${Test.render(args, context)}</div> `;
  }
};

export const Multiple: Story = {
  render: Test.render,
  args: {
    'response-identifier': 'RESPONSE',
    'min-choices': 1,
    'max-choices': 2
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');

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
