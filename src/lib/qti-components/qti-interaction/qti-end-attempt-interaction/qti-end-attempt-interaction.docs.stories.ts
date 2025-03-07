import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { QtiEndAttemptInteraction } from './qti-end-attempt-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getStorybookHelpers('qti-modal-feedback');

type Story = StoryObj<QtiEndAttemptInteraction & typeof args>;

/**
 *
 * ### [3.2.21 End Attempt Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.b3g8rgbtuwqp)
 * is a special interaction which immediately ends the current attempt on an assessment item.  It may be used, for example, to allow the candidate to request a hint or model solution, or in an adaptive item to let the candidate display feedback or to move to the next in a series of interactions in the item.
 *
 */
const meta: Meta<QtiEndAttemptInteraction> = {
  component: 'qti-end-attempt-interaction',
  title: '3.2 interaction types/3.2.21 End Attempt Interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
};
export default meta;

export const EndAttemptInteraction: Story = {
  render: args =>
    html` <qti-assessment-item
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 
  https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0p1_v1p0.xsd"
      identifier="end-attempt-example-1"
      title="End Attempt Example"
      adaptive="false"
      time-dependent="false"
      xml:lang="en-US"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response>
          <qti-value>C</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-response-declaration
        identifier="HINTREQUEST"
        cardinality="single"
        base-type="boolean"
      ></qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-item-body>
        <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
          <qti-prompt>Who was the President of Mexico from 2000 to 2006?</qti-prompt>
          <qti-simple-choice identifier="A">George W Bush</qti-simple-choice>
          <qti-simple-choice identifier="B">Tony Blair</qti-simple-choice>
          <qti-simple-choice identifier="C">Vicente Fox</qti-simple-choice>
          <qti-simple-choice identifier="D">Ariel Sharon</qti-simple-choice>
        </qti-choice-interaction>
        <p>
          <qti-end-attempt-interaction
            response-identifier="HINTREQUEST"
            title="Show Hint"
          ></qti-end-attempt-interaction>
        </p>
        <qti-feedback-block identifier="HINT" outcome-identifier="FEEDBACK" show-hide="show">
          <qti-content-body> Tony lived in the United Kingdom and George lived in Washington, DC. </qti-content-body>
        </qti-feedback-block>
      </qti-item-body>
      <qti-response-processing>
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-base-value base-type="identifier">NOHINT</qti-base-value>
        </qti-set-outcome-value>
        <qti-response-condition>
          <qti-response-if>
            <qti-variable identifier="HINTREQUEST"></qti-variable>
            <qti-set-outcome-value identifier="FEEDBACK">
              <qti-base-value base-type="identifier">HINT</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-if>
          <qti-response-else>
            <qti-response-condition>
              <qti-response-if>
                <qti-match>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                  <qti-correct identifier="RESPONSE"></qti-correct>
                </qti-match>
                <qti-set-outcome-value identifier="SCORE">
                  <qti-base-value base-type="float">1</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="SCORE">
                  <qti-base-value base-type="float">0</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
          </qti-response-else>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Select interaction elements
    const endAttemptButton = canvas.getByShadowText<QtiEndAttemptInteraction>('Show Hint');
    // Select modal feedback dialogs and close buttons
    const feedbackHint = canvas.getByShadowText(`Tony lived in the United Kingdom and George lived in Washington, DC.`);
    const slotHint = feedbackHint?.assignedSlot;

    expect(slotHint).not.toBeVisible();

    await fireEvent.click(endAttemptButton);
    expect(slotHint).toBeVisible();
  }
};
