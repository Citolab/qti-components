import { html } from 'lit';
import { expect, userEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { FeedbackEventDetail } from '../../public-events';

export default { title: 'Elements/qti-feedback/events' };

/**
 * A host that shows feedback its own way. It cancels `cito-feedback-show`, so the feedback element
 * stays hidden, and puts the feedback's text in its own box under the question instead.
 *
 * Choose an answer and press Check: the box shows the feedback. Press Check again with the same
 * answer: nothing changes, the outcome is the same. Choose the other answer and press Check: the box
 * shows the other feedback.
 *
 * A feedback the host took over sends no `cito-feedback-hide`: the host clears its own box.
 */
export const HostShowsFeedback = {
  render: () => {
    const showInHostBox = (e: CustomEvent<FeedbackEventDetail>) => {
      e.preventDefault();
      const hostBox = (e.currentTarget as HTMLElement).querySelector('[data-testid="host-box"]')!;
      hostBox.textContent = e.detail.element.textContent?.trim() ?? '';
    };

    return html`<div @cito-feedback-show=${showInHostBox}>
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
          <qti-correct-response><qti-value>true</qti-value></qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration
          identifier="FEEDBACK"
          cardinality="single"
          base-type="identifier"
        ></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
            <qti-prompt>Freud and Jung both belong to the psychoanalytic school.</qti-prompt>
            <qti-simple-choice identifier="true">True</qti-simple-choice>
            <qti-simple-choice identifier="false">False</qti-simple-choice>
          </qti-choice-interaction>
          <qti-end-attempt-interaction response-identifier="CHECK" title="Check"></qti-end-attempt-interaction>
          <qti-feedback-block outcome-identifier="FEEDBACK" identifier="true" show-hide="show">
            <p>That's correct.</p>
          </qti-feedback-block>
          <qti-feedback-block outcome-identifier="FEEDBACK" identifier="false" show-hide="show">
            <p>That's not correct.</p>
          </qti-feedback-block>
        </qti-item-body>
        <qti-response-processing>
          <qti-set-outcome-value identifier="FEEDBACK"
            ><qti-variable identifier="RESPONSE"></qti-variable
          ></qti-set-outcome-value>
        </qti-response-processing>
      </qti-assessment-item>
      <p>Host: <output data-testid="host-box"></output></p>
    </div>`;
  },
  play: async ({ canvasElement, step }) => {
    const screen = within(canvasElement);
    const hostBox = screen.getByTestId('host-box');
    const check = async () => userEvent.click(await screen.findByShadowRole('button', { name: 'Check' }));

    await step('Choose False and press Check: the host shows "That\'s not correct."', async () => {
      await userEvent.click(screen.getByText('False'));
      await check();
      await waitFor(() => expect(hostBox).toHaveTextContent("That's not correct."));
    });

    await step('Choose True and press Check: the host shows "That\'s correct."', async () => {
      await userEvent.click(screen.getByText('True'));
      await check();
      await waitFor(() => expect(hostBox).toHaveTextContent("That's correct."));
    });
  }
};
