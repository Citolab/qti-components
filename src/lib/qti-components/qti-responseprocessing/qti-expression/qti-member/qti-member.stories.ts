import { action } from '@storybook/addon-actions';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

import type { Meta, StoryObj } from '@storybook/web-components';

import '../../../index';
import { QtiMember } from './qti-member';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-member'
};
export default meta;

export const MemberFail: Story = {
  render: args => {
    return html` <qti-assessment-item data-testid="qti-assessment">
      <qti-outcome-declaration base-type="duration" cardinality="multiple" identifier="BODY">
        <qti-default-value>
          <qti-value>part1</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-member data-testid="qti-member">
        <qti-base-value base-type="float"></qti-base-value>
        <qti-variable identifier="BODY"></qti-variable>
        <qti-variable identifier="SUB-BODY"></qti-variable>
      </qti-member>
    </qti-assessment-item>`;
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    (canvas.getByTestId('qti-member') as QtiMember).calculate();
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
