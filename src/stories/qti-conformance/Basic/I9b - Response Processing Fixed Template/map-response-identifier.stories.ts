import { expect } from '@storybook/test';
import { screen, userEvent } from '@storybook/testing-library';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { html } from 'lit';
import { fetchItem } from 'src/stories/fetch-item';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  component: 'qti-conformance/basic/I9b Response Processing Fixed Template/map-response-identifier'
};
export default meta;

export const Default: Story = {
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
    // docsHint: 'Some other value than the default'
  },
  play: ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;

    // If the value of the RESPONSE Response Variable is set to NULL or an empty Multiple Container when ending the attempt, the value of the SCORE Outcome Variable is set to 0.
    userEvent.click(submitButton);
    expect(+score, 'SCORE = 0').toBe(0);
    expect(response, 'RESPONSE = NULL').toBe(null);
  },
  loaders: [
    async ({ args }) => ({
      xml: await fetchItem(`assets/qti-conformance/Basic/I9b/map-response-identifier.xml`)
    })
  ]
};
