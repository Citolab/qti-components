import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { QtiEndAttemptInteraction } from '../../qti-interaction/qti-end-attempt-interaction/qti-end-attempt-interaction';
import type { QtiModalFeedback } from './qti-modal-feedback';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getStorybookHelpers('qti-modal-feedback');

type Story = StoryObj<QtiModalFeedback & typeof args>;

/**
 * ### [3.7.3 Feedback](https://www.imsglobal.org/spec/qti/v3p0/impl#h.of39hkegnqll)
 * # qti-modal-feedback
 */
const meta: Meta<QtiModalFeedback> = {
  component: 'qti-modal-feedback',
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

export const ModalFeedback: Story = {
  render: args =>
    html` <qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 
  https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0p1_v1p0.xsd"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      identifier="Example01-modalFeedback"
      title="Example 1 - modal feedback"
      adaptive="false"
      time-dependent="false"
      xml:lang="en"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <!-- The response variable RESPONSE will hold the candidate's input-->
        <qti-correct-response>
          <!--The value of the right answer is declared-->
          <qti-value>true</qti-value>
        </qti-correct-response>
      </qti-response-declaration>

      <!-- Define a feedback variable; its baseType is "identifier" so that it can contain 
          the identifier of the feedback message-->
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
        <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
          <qti-prompt>Sigmund Freud and Carl Jung both belong to the psychoanalytic school of psychology.</qti-prompt>
          <qti-simple-choice identifier="true" fixed="true">True </qti-simple-choice>
          <qti-simple-choice identifier="false" fixed="true">False </qti-simple-choice>
        </qti-choice-interaction>
        <qti-end-attempt-interaction title="End attempt"></qti-end-attempt-interaction>
      </qti-item-body>
      <qti-response-processing>
        <qti-response-condition>
          <qti-response-if>
            <qti-match>
              <!-- The value of RESPONSE is compared with the correct value identified 
                      in the RESPONSE declaration-->
              <qti-variable identifier="RESPONSE"></qti-variable>
              <qti-correct identifier="RESPONSE"></qti-correct>
            </qti-match>
            <qti-set-outcome-value identifier="SCORE">
              <qti-variable identifier="MAXSCORE"></qti-variable>
            </qti-set-outcome-value>
            <qti-set-outcome-value identifier="FEEDBACK">
              <qti-base-value base-type="identifier">correct</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-if>
          <qti-response-else>
            <!--￼Depending on whether the input matches the correct answer or not, FEEDBACK 
                      is given the value of the identifier of the appropriate feedback message-->
            <qti-set-outcome-value identifier="FEEDBACK">
              <qti-base-value base-type="identifier">incorrect</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-else>
        </qti-response-condition>
      </qti-response-processing>

      <!-- Note how the identifiers in the following modalFeedback elements match those of the 
          setOutcomeValue elements above -->

      <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="correct">
        <qti-content-body>That's correct</qti-content-body>
      </qti-modal-feedback>
      <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="incorrect">
        <qti-content-body>That's not correct</qti-content-body>
      </qti-modal-feedback>
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

    const dialogCorrect = feedbackCorrect?.assignedSlot?.closest<HTMLDialogElement>('dialog');
    const dialogIncorrect = feedbackIncorrect?.assignedSlot?.closest<HTMLDialogElement>('dialog');

    const closeButtonCorrect = feedbackCorrect?.parentElement?.shadowRoot?.querySelector('.close-button');
    const closeButtonIncorrect = feedbackIncorrect?.parentElement?.shadowRoot?.querySelector('.close-button');

    // Ensure elements exist before proceeding
    expect(dialogCorrect).toBeDefined();
    expect(dialogIncorrect).toBeDefined();
    expect(closeButtonCorrect).toBeDefined();
    expect(closeButtonIncorrect).toBeDefined();

    // Step 1: Without selecting a choice, end attempt → should show incorrect feedback
    await fireEvent.click(endAttemptButton);
    expect(dialogIncorrect).toBeVisible();
    await fireEvent.click(closeButtonIncorrect);
    expect(dialogIncorrect).not.toBeVisible();

    // Step 2: Select "True", end attempt → should show correct feedback
    await fireEvent.click(choiceTrue);
    await fireEvent.click(endAttemptButton);
    expect(dialogCorrect).toBeVisible();
    await fireEvent.click(closeButtonCorrect);
    expect(dialogCorrect).not.toBeVisible();

    // Step 3: Select "False", end attempt → should show incorrect feedback again
    await fireEvent.click(choiceFalse);
    await fireEvent.click(endAttemptButton);
    expect(dialogCorrect).not.toBeVisible();
    expect(dialogIncorrect).toBeVisible();
    await fireEvent.click(closeButtonIncorrect);
    expect(dialogIncorrect).not.toBeVisible();
  }
};
