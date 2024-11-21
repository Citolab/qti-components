import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect, within } from '@storybook/test';
import { fireEvent } from '@storybook/testing-library';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getItemByUri } from '../../../../lib/qti-loader';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/I9b Response Processing Fixed Template/match-correct-identifier',
  beforeEach: async ({ args }) => {}
};
export default meta;

export const Default: Story = {
  name: 'I9-L1-D12',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    // docsHint:  If the value of the RESPONSE Response Variable is set to NULL when ending the attempt, the value of the SCORE Outcome Variable is set to 0.
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D12: If the value of the RESPONSE Response Variable is set to NULL when ending the attempt, the value of the SCORE Outcome Variable is set to 0.';
    //
    fireEvent.click(submitButton);
    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;

    expect(+score, 'SCORE = 0').toBe(0);
    expect(response, 'RESPONSE = NULL').toBe(null);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/match-correct-identifier.xml`)
    })
  ]
};

export const D13: Story = {
  name: 'I9-L1-D13',

  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {

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
    // docsHint:  I9-L1-D13: If the value of the RESPONSE Response Variable is set to choice_a when ending the attempt, the value of the SCORE Outcome Variable is set to 1.
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D13: If the value of the RESPONSE Response Variable is set to choice_a when ending the attempt, the value of the SCORE Outcome Variable is set to 1.';

    //
    const choiceA = canvasElement.querySelector('qti-simple-choice[identifier="choice_a"]');
    fireEvent.click(choiceA);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;

    expect(+score, 'SCORE = 1').toBe(1);
    expect(response, 'RESPONSE = choice_a').toEqual('choice_a');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/match-correct-identifier.xml`)
    })
  ]
};

export const D14: Story = {
  name: 'I9-L1-D14',

  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {

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
    // docsHint:  I9-L1-D14: If the value of the RESPONSE Response Variable is set to choice_b when ending the attempt, the value of the SCORE Outcome Variable is set to 0.
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent =
      'I9-L1-D14: If the value of the RESPONSE Response Variable is set to choice_b when ending the attempt, the value of the SCORE Outcome Variable is set to 0.';

    //
    const choiceB = canvasElement.querySelector('qti-simple-choice[identifier="choice_b"]');
    fireEvent.click(choiceB);
    fireEvent.click(submitButton);

    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;

    expect(+score, 'SCORE = 0').toBe(0);
    expect(response, 'RESPONSE = choice_b').toEqual('choice_b');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/I9b/match-correct-identifier.xml`)
    })
  ]
};
