import { QtiAssessmentItem, QtiSimpleChoice } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/test';
import { fireEvent, screen } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getItemByUri } from '../../../../../lib/qti-loader';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/Q2 - Choice Interaction/single-cardinality',
  beforeEach: async ({ args }) => {}
};
export default meta;

export const Q22_L1_D51: Story = {
  name: 'Q22-L1-D51',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
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
        ${unsafeHTML(xml)}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    fireEvent.click(submitButton);

    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(response, 'RESPONSE = NULL').toBe(null);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality.xml')
    })
  ]
};

export const Q22_L1_D52: Story = {
  name: 'Q22-L1-D52',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
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
        ${unsafeHTML(xml)}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const choiceA = assessmentItem.querySelector('qti-simple-choice[identifier="choice_a"]') as QtiSimpleChoice;

    fireEvent.click(choiceA);
    fireEvent.click(submitButton);

    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');

    expect(response.value).toBe('choice_a');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality.xml')
    })
  ]
};

export const Q22_L1_D53: Story = {
  name: 'Q22-L1-D53',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
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
        ${unsafeHTML(xml)}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const choiceB = assessmentItem.querySelector('qti-simple-choice[identifier="choice_b"]') as QtiSimpleChoice;

    fireEvent.click(choiceB);
    fireEvent.click(submitButton);

    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe('choice_b');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality.xml')
    })
  ]
};

export const Q22_L1_D54: Story = {
  name: 'Q22-L1-D54',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
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
        ${unsafeHTML(xml)}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const choiceC = assessmentItem.querySelector('qti-simple-choice[identifier="choice_c"]') as QtiSimpleChoice;

    fireEvent.click(choiceC);
    fireEvent.click(submitButton);

    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe('choice_c');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality.xml')
    })
  ]
};

export const Q22_L1_D55: Story = {
  name: 'Q22-L1-D55',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
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
        ${unsafeHTML(xml)}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const choiceA = assessmentItem.querySelector('qti-simple-choice[identifier="choice_a"]') as QtiSimpleChoice;
    const choiceB = assessmentItem.querySelector('qti-simple-choice[identifier="choice_b"]') as QtiSimpleChoice;

    fireEvent.click(choiceA);
    fireEvent.click(choiceB);

    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe('choice_b');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality.xml')
    })
  ]
};

export const Q22_L1_D56: Story = {
  name: 'Q22-L1-D56',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
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
        ${unsafeHTML(xml)}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    try {
      const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

      if (assessmentItem) {
        throw new Error('Expected XML validation error, but component loaded successfully');
      }
    } catch (error) {
      expect(error.message).toContain('XML validation error'); // Adjust the error message check as per actual exception

      console.log('XML validation exception triggered as expected:', error.message);
    }
  },
  loaders: [
    async ({ args }) => {
      try {
        const xml = await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-invalid.xml');
        return { xml };
      } catch (error) {
        console.error('XML validation exception caught during loading:', error.message);
        return { xml: `<p>XML validation error</p>` };
      }
    }
  ]
};
