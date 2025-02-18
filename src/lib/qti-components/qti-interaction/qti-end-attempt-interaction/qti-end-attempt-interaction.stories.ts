import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { QtiEndAttemptInteraction } from './qti-end-attempt-interaction';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-end-attempt-interaction');

type Story = StoryObj<QtiEndAttemptInteraction & typeof args>;

const meta: Meta<QtiEndAttemptInteraction> = {
  component: 'qti-end-attempt-interaction',
  title: 'components/qti-end-attempt-interaction',
  args: { ...args, title: 'end attempt' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs']
};
export default meta;

export const Processing: Story = {
  render: args => html`
    <qti-assessment-item>
      <qti-outcome-declaration base-type="string" cardinality="single" identifier="PROCESSOR"></qti-outcome-declaration>

      <qti-item-body>
        ${template(args)}
        <qti-printed-variable class="qti-well" identifier="PROCESSOR"></qti-printed-variable>
      </qti-item-body>
      <qti-response-processing>
        <qti-set-outcome-value identifier="PROCESSOR">
          <qti-base-value base-type="string">Processed!</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-processing>
    </qti-assessment-item>
  `
};

/** Count attempt increases the numAttempts response variable */
export const CountAttempt: Story = {
  render: args => html`
    <qti-assessment-item>
      <qti-outcome-declaration base-type="string" cardinality="single" identifier="PROCESSOR"></qti-outcome-declaration>

      <qti-item-body>
        <qti-printed-variable class="qti-well" identifier="numAttempts"></qti-printed-variable>
        ${template(args)}

        <qti-printed-variable class="qti-well" identifier="PROCESSOR"></qti-printed-variable>
      </qti-item-body>
      <qti-response-processing>
        <qti-set-outcome-value identifier="PROCESSOR">
          <qti-base-value base-type="string">Processed!</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-processing>
    </qti-assessment-item>
  `,
  args: { 'count-attempt': 'true' }
};
