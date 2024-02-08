import { expect, within } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../../index';
import { QtPrintedVariable, QtiAssessmentItem } from '../../../index';

type Story = StoryObj<typeof QtPrintedVariable>; // <Props>;

const meta: Meta = {
  component: 'qti-printed-variable'
};
export default meta;

export const Single: Story = {
  render: args => {
    return html` <qti-assessment-item data-testid="qti-assessment-item">
      <qti-outcome-declaration base-type="string" cardinality="single" identifier="OUTCOME">
        <qti-default-value>
          <qti-value>SINGLE</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>

      <qti-item-body>
        <qti-printed-variable identifier="OUTCOME"></qti-printed-variable>
      </qti-item-body>
      <qti-response-processing>
        <qti-set-outcome-value identifier="OUTCOME">
          <qti-base-value base-type="identifier">UITSTOOT</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-processing>
    </qti-assessment-item>`;
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    (canvas.getByTestId('qti-assessment-item') as QtiAssessmentItem).processResponse();
  }
};

// Function to emulate pausing between interactions
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const Multiple: Story = {
  render: args => {
    return html` <qti-assessment-item>
      <qti-outcome-declaration base-type="string" cardinality="multiple" identifier="OUTCOME">
        <qti-default-value>
          <qti-value>MULTIPLE</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>

      <qti-item-body>
        <qti-printed-variable identifier="OUTCOME"></qti-printed-variable>
      </qti-item-body>
      <qti-response-processing>
        <qti-set-outcome-value identifier="OUTCOME">
          <qti-base-value base-type="identifier">UITSTOOT</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-processing>
    </qti-assessment-item>`;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await sleep(2000);
    (canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem).processResponse();
    await sleep(2000);
    expect(canvasElement.querySelector('qti-printed-variable')?.shadowRoot.textContent).toEqual(
      `[ "MULTIPLE", "UITSTOOT" ]`
    );
  }
};
