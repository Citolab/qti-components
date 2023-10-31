import '../../../index';
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { QtiAssessmentItem } from '../../../index';
import { within } from '@storybook/testing-library';

type Story = StoryObj; // <Props>;

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

export const Multiple: Story = {
  render: args => {
    return html` <qti-assessment-item data-testid="qti-assessment-item">
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
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    (canvas.getByTestId('qti-assessment-item') as QtiAssessmentItem).processResponse();
  }
};
