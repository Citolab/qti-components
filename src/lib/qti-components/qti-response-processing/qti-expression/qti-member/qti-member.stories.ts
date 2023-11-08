import { html } from 'lit';
import '../../../index';
// import { expect } from '@storybook/jest';
import { action } from '@storybook/addon-actions';
import { within } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { QtiMember } from './qti-member';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-member'
};
export default meta;

export const MemberFail: Story = {
  render: args => {
    return html` <qti-assessment-item data-testid="qti-assessment">
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
    (canvas.getByTestId('qti-member') as QtiMember).calculate();
  }
};

export const MemberCorrect: Story = {
  render: args => {
    return html` <qti-assessment-item>
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
  }
  // play: ({ canvasElement }) => {
  //   const canvas = within(canvasElement);
  //   const isMember = (canvas.getByTestId('qti-member') as QtiMember).calculate();
  //   expect(isMember).toBeTruthy;
  // }
};

export const AssessmentCorrect: Story = {
  render: args => {
    return html` <qti-assessment-item
      data-testid="qti-assessment-item"
      @qti-outcome-changed=${action(`qti-outcome-changed`)}
    >
      <qti-outcome-declaration base-type="string" cardinality="multiple" identifier="BODY">
        <qti-default-value>
          <qti-value>part1</qti-value>
          <qti-value>part2</qti-value>
          <qti-value>part3</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-response-processing>
        <qti-response-condition>
          <qti-response-if>
            <qti-member data-testid="qti-member">
              <qti-base-value base-type="string">part2</qti-base-value>
              <qti-variable identifier="BODY"></qti-variable>
            </qti-member>
            <qti-set-outcome-value>
              <qti-base-value base-type="string">WOOHOO</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-if>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>`;
  }
  // play: ({ canvasElement }) => {
  //   const canvas = within(canvasElement);
  //   (canvas.getByTestId('qti-assessment-item') as QtiAssessmentItem).processResponse();
  // }
};
