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

export const Print: Story = {
  render: args => {
    return html` <qti-assessment-item data-testid="qti-assessment-item">
      <qti-response-declaration base-type="string" cardinality="multiple" identifier="RESPONSE">
        <qti-default-value>
          <qti-value>Dit zou je moeten zien</qti-value>
        </qti-default-value>
      </qti-response-declaration>

      <qti-outcome-declaration base-type="string" cardinality="multiple" identifier="STORY">
        <qti-default-value>
          <qti-value>Dit zou je moeten zien</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>

      <qti-item-body>
        <qti-printed-variable identifier="RESPONSE"></qti-printed-variable>
      </qti-item-body>
      <qti-response-processing>
        <qti-set-outcome-value identifier="STORY">
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
