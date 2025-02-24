import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { expect, fireEvent } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { QtiEndAttemptInteraction } from '../../qti-interaction/qti-end-attempt-interaction/qti-end-attempt-interaction';
import type { QtiFeedbackInline } from './qti-feedback-inline';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-feedback-inline');

type Story = StoryObj<QtiFeedbackInline & typeof args>;

/**
 * ### [3.7.3 Feedback](https://www.imsglobal.org/spec/qti/v3p0/impl#h.of39hkegnqll)
 * # qti-feedback-inline
 */
const meta: Meta<QtiFeedbackInline> = {
  component: 'qti-feedback-inline',
  title: 'components/feedback',
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

export const FeedbackInline: Story = {
  render: args =>
    html` <qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation=" http://www.imsglobal.org/xsd/imsqtiasi_v3p0 
  https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0p1_v1p0.xsd"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      identifier="Example02-feedbackInline"
      title="Example 2 - inline feedback"
      adaptive="false"
      time-dependent="false"
      xml:lang="en"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response>
          <qti-value>true</qti-value>
        </qti-correct-response>
      </qti-response-declaration>

      <!-- Define a feedback variable; its base-type is "identifier" so that it can contain the identifier
           of the feedback message-->
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" normal-maximum="10.0">
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
        <qti-default-value>
          <qti-value>10.0</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>

      <qti-item-body>
        <!-- The response variable RESPONSE will hold the candidate's input-->
        <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
          <qti-prompt>Sigmund Freud and Carl Jung both belong to the psychoanalytic school of psychology.</qti-prompt>
          <qti-simple-choice identifier="true" fixed="true"
            >True
            <!--￼￼￼The feedbackInline elements are each given the same identifier as the corresponding option.-->
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="true" show-hide="show">
              — <strong>That's correct</strong></qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="false" fixed="true"
            >False
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="false" show-hide="show">
              — <strong>That's not correct</strong></qti-feedback-inline
            >
          </qti-simple-choice>
        </qti-choice-interaction>
        <qti-end-attempt-interaction title="End attempt"></qti-end-attempt-interaction>
      </qti-item-body>

      <qti-response-processing>
        <!--￼This time, FEEDBACK is given the value of the identifier of the option which was selected.-->
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-variable identifier="RESPONSE"></qti-variable>
        </qti-set-outcome-value>
        <qti-response-condition>
          <qti-response-if>
            <qti-match>
              <qti-variable identifier="RESPONSE"></qti-variable>
              <qti-correct identifier="RESPONSE"></qti-correct>
            </qti-match>
            <qti-set-outcome-value identifier="SCORE">
              <qti-variable identifier="MAXSCORE"></qti-variable>
            </qti-set-outcome-value>
          </qti-response-if>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Select interaction elements
    const endAttemptButton = canvas.getByShadowText<QtiEndAttemptInteraction>('End attempt');
    const choiceTrue = canvas.getByShadowText('True');
    const choiceFalse = canvas.getByShadowText('False');

    // Select modal feedback dialogs and close buttons
    const feedbackCorrect = canvas.getByShadowText(`That's correct`);
    const feedbackIncorrect = canvas.getByShadowText(`That's not correct`);

    const slotCorrect = feedbackCorrect?.assignedSlot;
    const slotIncorrect = feedbackIncorrect?.assignedSlot;

    const closeButtonCorrect = feedbackCorrect?.parentElement?.shadowRoot?.querySelector('.close-button');
    const closeButtonIncorrect = feedbackIncorrect?.parentElement?.shadowRoot?.querySelector('.close-button');

    // Ensure elements exist before proceeding
    expect(slotCorrect).toBeDefined();
    expect(slotIncorrect).toBeDefined();
    expect(closeButtonCorrect).toBeDefined();
    expect(closeButtonIncorrect).toBeDefined();

    // Step 1: Select "True", end attempt → should show correct feedback
    await fireEvent.click(choiceTrue);
    await fireEvent.click(endAttemptButton);
    expect(slotCorrect).toBeVisible();

    // Step 2: Select "False", end attempt → should show incorrect feedback again
    await fireEvent.click(choiceFalse);
    await fireEvent.click(endAttemptButton);
    expect(slotCorrect).not.toBeVisible();
    expect(slotIncorrect).toBeVisible();
  }
};
