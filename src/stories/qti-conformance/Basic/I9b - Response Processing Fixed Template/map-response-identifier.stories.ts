import { QtiAssessmentItem, QtiSimpleChoice } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/test';
import { fireEvent, screen } from '@storybook/testing-library';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getItemByUri } from '../../../../lib/qti-loader';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/I9b Response Processing Fixed Template/map-response-identifier',
  beforeEach: async ({ args }) => {}
};
export default meta;

export const Default: Story = {
  name: 'I9-L1-D1',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {
    
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: 'I9-L1-D1: If the value of the RESPONSE Response Variable is set to NULL or an empty Multiple Container when ending the attempt, the value of the SCORE Outcome Variable is set to 0.'
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D1: If the value of the RESPONSE Response Variable is set to NULL or an empty Multiple Container when ending the attempt, the value of the SCORE Outcome Variable is set to 0.';
    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    //
    fireEvent.click(submitButton);
    expect(+score, 'SCORE = 0').toBe(0);
    expect(response, 'RESPONSE = NULL').toBe(null);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D2: Story = {
  name: 'I9-L1-D2',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: 'I9-L1-D2: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_a], the value of the SCORE OutcomeVariable is set to 1.'
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D2: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_a], the value of the SCORE OutcomeVariable is set to 1.';
    await assessmentItem.updateComplete;

    const choiceA = canvasElement.querySelector('qti-simple-choice[identifier="choice_a"]') as QtiSimpleChoice;
    fireEvent.click(choiceA);
    fireEvent.click(submitButton);
    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    // const score = await waitFor(() => assessmentItem.variables.find(v => v.identifier === 'SCORE').value);
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 1').toBe(1);
    expect(response, 'RESPONSE = choice_a').toEqual(['choice_a']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D3: Story = {
  name: 'I9-L1-D3',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: 'I9-L1-D3: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_b], the value of the SCORE OutcomeVariable is set to 2.'
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D3: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_b], the value of the SCORE OutcomeVariable is set to 2.';

    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]');

    fireEvent.click(choiceB);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 2').toBe(2);
    expect(response, 'RESPONSE = choice_a').toEqual(['choice_b']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D4: Story = {
  name: 'I9-L1-D4',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: I9-L1-D4: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_c], the value of the SCORE OutcomeVariable is set to 5.
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D4: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_c], the value of the SCORE OutcomeVariable is set to 5.';

    const choiceC = canvasElement.querySelector('qti-simple-choice[identifier="choice_c"]');
    // I9-L1-D4: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_c], the value of the SCORE OutcomeVariable is set to 5.
    fireEvent.click(choiceC);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 5').toBe(5);
    expect(response, 'RESPONSE = choice_c').toEqual(['choice_c']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D5: Story = {
  name: 'I9-L1-D5',
    render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: I9-L1-D5: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_d], the value of the SCORE OutcomeVariable is set to 0.
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D5: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_d], the value of the SCORE OutcomeVariable is set to 0.';

    const choiceD = canvasElement.querySelector('qti-simple-choice[identifier="choice_d"]');
    fireEvent.click(choiceD);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 0').toBe(0);
    expect(response, 'RESPONSE = choice_d').toEqual(['choice_d']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D6: Story = {
  name: 'I9-L1-D6',
    render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: I9-L1-D6: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_e], the value of the SCORE OutcomeVariable is set to 0.
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D6: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_e], the value of the SCORE OutcomeVariable is set to 0.';

    const choiceE = canvasElement.querySelector('qti-simple-choice[identifier="choice_e"]');
    fireEvent.click(choiceE);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 0').toBe(0);
    expect(response, 'RESPONSE = choice_e').toEqual(['choice_e']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D7: Story = {
  name: 'I9-L1-D7',
    render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: I9-L1-D7: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_a,choice_b], the value of the SCORE OutcomeVariable is set to 3.
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D7: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_a,choice_b], the value of the SCORE OutcomeVariable is set to 3.';

    const choiceA = canvasElement.querySelector('qti-simple-choice[identifier="choice_a"]');
    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]');
    fireEvent.click(choiceA);
    fireEvent.click(choiceB);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 3').toBe(3);
    expect(response, 'RESPONSE = choice_a and choice_b').toEqual(['choice_a', 'choice_b']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D8: Story = {
  name: 'I9-L1-D8',
    render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');

    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint:I9-L1-D8: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_b,choice_c], the value of the SCORE OutcomeVariable is set to 6.
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D8: If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_b,choice_c], the value of the SCORE OutcomeVariable is set to 6.';

    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]');
    const choiceC = canvasElement.querySelector('qti-simple-choice[identifier="choice_c"]');

    fireEvent.click(choiceB);
    fireEvent.click(choiceC);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 6').toBe(6);
    expect(response, 'RESPONSE = choice_b and choice_c').toEqual(['choice_b', 'choice_c']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D9: Story = {
  name: 'I9-L1-D9',
    render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');

    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint:I9-L1-D7: I9-L1-D9:If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_c,choice_d], the value of the SCORE OutcomeVariable is set to 4.
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D9:If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_c,choice_d], the value of the SCORE OutcomeVariable is set to 4.';

    const choiceC = canvasElement.querySelector('qti-simple-choice[identifier="choice_c"]');
    const choiceD = canvasElement.querySelector('qti-simple-choice[identifier="choice_d"]');
    fireEvent.click(choiceC);
    fireEvent.click(choiceD);
    fireEvent.click(submitButton);
    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 4').toBe(4);
    expect(response, 'RESPONSE = choice_d and choice_c').toEqual(['choice_c', 'choice_d']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D10: Story = {
  name: 'I9-L1-D10',
    render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');

    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint:I9-L1-D10:If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_d, choice_e, choice_f], the value of the SCORE OutcomeVariable is set to 0.
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D10:If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_d, choice_e, choice_f], the value of the SCORE OutcomeVariable is set to 0.';

    const choiceD = canvasElement.querySelector('qti-simple-choice[identifier="choice_d"]');
    const choiceE = canvasElement.querySelector('qti-simple-choice[identifier="choice_e"]');
    const choiceF = canvasElement.querySelector('qti-simple-choice[identifier="choice_f"]');

    fireEvent.click(choiceD);
    fireEvent.click(choiceE);
    fireEvent.click(choiceF);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 0').toBe(0);
    expect(response, 'RESPONSE = choice_d, choice_e and choice_f').toEqual(['choice_d', 'choice_e', 'choice_f']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};

export const D11: Story = {
  name: 'I9-L1-D11',
    render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', DocumentFragment> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');

    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint:I9-L1-D11:If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_a, choice_b, choice_c, choice_d, choice_e, choice_f], the value of the SCORE OutcomeVariable is set to 0.
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D11:If the value of the RESPONSE Response Variable is set to a Multiple Container [choice_a, choice_b, choice_c, choice_d, choice_e, choice_f], the value of the SCORE OutcomeVariable is set to 0.';
    const choiceA = canvasElement.querySelector('qti-simple-choice[identifier="choice_a"]');
    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]');
    const choiceC = canvasElement.querySelector('qti-simple-choice[identifier="choice_c"]');
    const choiceD = canvasElement.querySelector('qti-simple-choice[identifier="choice_d"]');
    const choiceE = canvasElement.querySelector('qti-simple-choice[identifier="choice_e"]');
    const choiceF = canvasElement.querySelector('qti-simple-choice[identifier="choice_f"]');

    fireEvent.click(choiceA);
    fireEvent.click(choiceB);
    fireEvent.click(choiceC);
    fireEvent.click(choiceD);
    fireEvent.click(choiceE);
    fireEvent.click(choiceF);

    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 0').toBe(0);
    expect(response, 'RESPONSE = choice_a, choice_b, choice_c, choice_d, choice_e and choice_f').toEqual([
      'choice_a',
      'choice_b',
      'choice_c',
      'choice_d',
      'choice_e',
      'choice_f'
    ]);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};
