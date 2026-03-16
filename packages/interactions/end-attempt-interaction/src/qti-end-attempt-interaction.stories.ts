import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiEndAttemptInteraction } from './qti-end-attempt-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-end-attempt-interaction');

type Story = StoryObj<QtiEndAttemptInteraction & typeof args>;

/**
 *
 * ### [3.2.21 End Attempt Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.b3g8rgbtuwqp)
 * is a special interaction which immediately ends the current attempt on an assessment item.  It may be used, for example, to allow the candidate to request a hint or model solution, or in an adaptive item to let the candidate display feedback or to move to the next in a series of interactions in the item.
 *
 */
const meta: Meta<QtiEndAttemptInteraction> = {
  component: 'qti-end-attempt-interaction',
  title: '21 End Attempt',
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
