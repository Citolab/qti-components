import { expect, within } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../../index';
import { QtiPrintedVariable, QtiAssessmentItem } from '../../../index';

type Story = StoryObj<typeof QtiPrintedVariable>; // <Props>;

const meta: Meta = {
  component: 'qti-printed-variable'
};
export default meta;

export const Single: Story = {
  render: _args => {
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

export const Multiple: Story = {
  render: _args => {
    return html` <qti-assessment-item data-testid="qti-assessment-item">
      <qti-outcome-declaration base-type="string" cardinality="multiple" identifier="OUTCOME">
        <qti-default-value>
          <qti-value>MULTIPLE</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>

      <qti-item-body>
        <qti-printed-variable identifier="OUTCOME" data-testid="qti-printed-variable"></qti-printed-variable>
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
    canvas.getByTestId<QtiAssessmentItem>('qti-assessment-item').processResponse();

    // Wait for the updates to complete
    const printedVariable = canvas.getByTestId<QtiPrintedVariable>('qti-printed-variable');
    await printedVariable.updateComplete; // Wait for the LitElement to finish updating
    expect(canvas.getByTestId('qti-printed-variable')?.shadowRoot.textContent.replace(/\s+/g, '')).toEqual(
      `[ "MULTIPLE", "UITSTOOT" ]`.replace(/\s+/g, '')
    );
  }
};
