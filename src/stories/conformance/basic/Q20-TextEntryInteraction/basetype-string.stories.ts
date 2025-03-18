import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/test';
import { fireEvent, screen, userEvent } from '@storybook/test';
import { html } from 'lit';

import { getItemByUri } from '@citolab/qti-components/qti-loader';

import type { QtiAssessmentItem, QtiTextEntryInteraction } from '../../../../lib';
import type { Meta, StoryObj } from '@storybook/web-components';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/Q20 - Text Entry Interaction/baseType-string',
  beforeEach: async ({ args }) => {}
};
export default meta;

export const Q20_L1_D1: Story = {
  name: 'Q20-L1-D1',
  render: (args, { argTypes, loaded: { xml } }) => {
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
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction') as QtiTextEntryInteraction;
    const input = textEntryInteraction.shadowRoot.querySelector('input');
    // Add a space to the input field
    await userEvent.type(input, 'T');
    // Remove the space
    await userEvent.keyboard('{backspace}');

    fireEvent.click(submitButton);

    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe('');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/qti-conformance/Basic/Q20/text-entry-sv-1.xml')
    })
  ]
};

export const Q20_L1_D2: Story = {
  name: 'Q20-L1-D2',
  render: (args, { argTypes, loaded: { xml } }) => {
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
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction') as QtiTextEntryInteraction;
    const input = textEntryInteraction.shadowRoot.querySelector('input');
    await userEvent.type(input, 'jumped');
    fireEvent.click(submitButton);

    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe('jumped');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/qti-conformance/Basic/Q20/text-entry-sv-1.xml')
    })
  ]
};
