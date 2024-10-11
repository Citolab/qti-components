import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/test';
import { screen, userEvent } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getItemByUri } from '../../../../lib/qti-loader';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  component: 'qti-conformance/basic/I9b Response Processing Fixed Template/map-response-identifier',
  beforeEach: async ({ args }) => {}
};
export default meta;

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const Default: Story = {
  name: 'Q2-L1-D1',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
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
        ${unsafeHTML(xml)}
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
    userEvent.click(submitButton);
    timeout(200);
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(response, 'RESPONSE = NULL').toBe(null);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/Q2/multiple-cardinality.xml`)
    })
  ]
};
