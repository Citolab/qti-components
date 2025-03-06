import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/test';
import { fireEvent, screen } from '@storybook/test';
import { html } from 'lit';

import { getItemByUri } from '../../../../../lib/qti-loader';

import type { QtiAssessmentItem, QtiSimpleChoice } from '../../../../../lib';
import type { Meta, StoryObj } from '@storybook/web-components';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/Q2 - Choice Interaction/multiple-cardinality',
  beforeEach: async ({ args }) => {}
};
export default meta;

export const Q22_L1_D1: Story = {
  name: 'Q2-L1-D1',
  render: (_, { loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: 'Q2-L1-D1: For file multiple-cardinality.xml after ending the attempt without selecting any SimpleChoices, the RESPONSE Response Variable is set with the NULL value OR an empty Multiple Container.'
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'Q2-L1-D1: For file multiple-cardinality.xml after ending the attempt without selecting any SimpleChoices, the RESPONSE Response Variable is set with the NULL value OR an empty Multiple Container.';

    //
    fireEvent.click(submitButton);
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(response, 'RESPONSE = NULL').toBe(null);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/Q2/multiple-cardinality.xml`)
    })
  ]
};

export const Q22_L1_D2: Story = {
  name: 'Q2-L1-D2',
  render: (_, { loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: 'Q2-L1-D1: For file multiple-cardinality.xml after ending the attempt without selecting any SimpleChoices, the RESPONSE Response Variable is set with the NULL value OR an empty Multiple Container.'
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'Q2-L1-D2 For file multiple-cardinality.xml after ending the attempt with the SimpleChoice with identifier choice_a selected, the RESPONSE Response Variable is set with a Multiple Container containing a value choice_a, with an Identifier baseType.';

    //

    const choiceA = canvasElement.querySelector('qti-simple-choice[identifier="choice_a"]') as QtiSimpleChoice;
    fireEvent.click(choiceA);
    fireEvent.click(submitButton);
    const responseVariable = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(Array.isArray(responseVariable.value), 'Response Variable is set with a Multiple Container').toBe(true);
    expect(JSON.stringify(responseVariable.value), 'containing a value choice_a').toBe(JSON.stringify(['choice_a']));
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/Q2/multiple-cardinality.xml`)
    })
  ]
};

export const Q22_L1_D3: Story = {
  name: 'Q22-L1-D3',
  render: (_, { loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'Q22-L1-D3: For file multiple-cardinality.xml after ending the attempt with the SimpleChoice with identifier choice_b selected, the RESPONSE Response Variable is set with a Multiple Container containing a value choice_b, with an Identifier baseType.';

    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]') as QtiSimpleChoice;
    fireEvent.click(choiceB);
    fireEvent.click(submitButton);

    const responseVariable = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(responseVariable.value).toStrictEqual(['choice_b']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/Q2/multiple-cardinality.xml`)
    })
  ]
};

export const Q22_L1_D4: Story = {
  name: 'Q22-L1-D4',
  render: (_, { loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'Q22-L1-D4: For file multiple-cardinality.xml after ending the attempt with the SimpleChoice with identifier choice_c selected, the RESPONSE Response Variable is set with a Multiple Container containing a value choice_c, with an Identifier baseType.';

    const choiceC = canvasElement.querySelector('qti-simple-choice[identifier="choice_c"]') as QtiSimpleChoice;
    fireEvent.click(choiceC);
    fireEvent.click(submitButton);

    const responseVariable = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(responseVariable.value).toStrictEqual(['choice_c']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/Q2/multiple-cardinality.xml`)
    })
  ]
};

export const Q22_L1_D5: Story = {
  name: 'Q22-L1-D5',
  render: (_, { loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'Q22-L1-D5: For file multiple-cardinality.xml after ending the attempt with the SimpleChoices with identifiers choice_a and choice_b selected, the RESPONSE Response Variable is set with a Multiple Container containing values choice_a and choice_b, with an Identifier baseType.';

    const choiceA = canvasElement.querySelector('qti-simple-choice[identifier="choice_a"]') as QtiSimpleChoice;
    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]') as QtiSimpleChoice;
    fireEvent.click(choiceA);
    fireEvent.click(choiceB);
    fireEvent.click(submitButton);

    const responseVariable = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(responseVariable.value).toStrictEqual(['choice_a', 'choice_b']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/Q2/multiple-cardinality.xml`)
    })
  ]
};

export const Q22_L1_D6: Story = {
  name: 'Q22-L1-D6',
  render: (_, { loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'Q22-L1-D6: For file multiple-cardinality.xml after ending the attempt with the SimpleChoices with identifiers choice_b and choice_c selected, the RESPONSE Response Variable is set with a Multiple Container containing values choice_b and choice_c, with an Identifier baseType.';

    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]') as QtiSimpleChoice;
    const choiceC = canvasElement.querySelector('qti-simple-choice[identifier="choice_c"]') as QtiSimpleChoice;
    fireEvent.click(choiceB);
    fireEvent.click(choiceC);
    fireEvent.click(submitButton);

    const responseVariable = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(responseVariable.value).toStrictEqual(['choice_b', 'choice_c']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/Q2/multiple-cardinality.xml`)
    })
  ]
};

export const Q22_L1_D7: Story = {
  name: 'Q22-L1-D7',
  render: (_, { loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'Q22-L1-D6: For file multiple-cardinality.xml after ending the attempt with the SimpleChoices with identifiers choice_b and choice_c selected, the RESPONSE Response Variable is set with a Multiple Container containing values choice_b and choice_c, with an Identifier baseType.';

    const choiceA = canvasElement.querySelector('qti-simple-choice[identifier="choice_a"]') as QtiSimpleChoice;
    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]') as QtiSimpleChoice;
    const choiceC = canvasElement.querySelector('qti-simple-choice[identifier="choice_c"]') as QtiSimpleChoice;
    fireEvent.click(choiceA);
    fireEvent.click(choiceB);
    fireEvent.click(choiceC);
    fireEvent.click(submitButton);

    const responseVariable = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(responseVariable.value).toStrictEqual(['choice_a', 'choice_b', 'choice_c']);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/Q2/multiple-cardinality.xml`)
    })
  ]
};
