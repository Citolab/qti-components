import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { QtiAssessmentItem } from '../../../index';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-set-outcome-value'
};
export default meta;

export const MemberFail: Story = {
  render: () => {
    return html` <qti-assessment-item>
      <qti-outcome-declaration base-type="identifier" cardinality="multiple" identifier="BODY">
        <qti-default-value>
          <qti-value>part1</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-response-processing>
        <!-- https://github.com/1EdTech/qti-examples/blob/6cb8f60ea67155f8ed7f6e04e77ac244c5d76c29/qtiv3-examples/packaging/items/Example05-feedbackBlock-adaptive.xml#L179 -->
        <qti-set-outcome-value identifier="BODY">
          <qti-multiple>
            <qti-variable identifier="BODY"></qti-variable>
            <qti-base-value base-type="identifier">part2</qti-base-value>
          </qti-multiple>
        </qti-set-outcome-value>
      </qti-response-processing>
    </qti-assessment-item>`;
  },
  play: ({ canvasElement }) => {
    // const canvas = within(canvasElement);
    const item = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    item.processResponse();
  }
};
