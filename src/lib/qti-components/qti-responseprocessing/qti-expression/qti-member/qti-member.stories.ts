import '../../../index';
import { html } from 'lit';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { QtiMember } from './qti-member';
import { QtiAssessmentItem } from '../../../index';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-member'
};
export default meta;

export const MemberFail: Story = {
  render: args => {
    return html` <qti-assessment-item data-testid="qti-assessment-item">
      <qti-outcome-declaration base-type="duration" cardinality="single" identifier="BODY">
        <qti-default-value>
          <qti-value>part1</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-response-processing>
        <qti-member data-testid="qti-member">
          <qti-base-value base-type="float"></qti-base-value>
          <qti-variable identifier="BODY"></qti-variable>
          <qti-variable identifier="SUB-BODY"></qti-variable>
        </qti-member>
      </qti-response-processing>
    </qti-assessment-item>`;
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // (canvas.getByTestId('qti-member') as QtiMember).calculate();
    (canvas.getByTestId('qti-assessment-item') as QtiAssessmentItem).processResponse();
  }
};

export const MemberCorrect: Story = {
  render: args => {
    return html` <qti-assessment-item data-testid="qti-assessment">
      <qti-outcome-declaration base-type="string" cardinality="multiple" identifier="BODY">
        <qti-default-value>
          <qti-value>part1</qti-value>
          <qti-value>part2</qti-value>
          <qti-value>part3</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-member data-testid="qti-member">
        <qti-base-value base-type="string">part2</qti-base-value>
        <qti-variable identifier="BODY"></qti-variable>
      </qti-member>
    </qti-assessment-item>`;
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const isMember = (canvas.getByTestId('qti-member') as QtiMember).calculate();
    expect(isMember).toBeTruthy;
  }
};
