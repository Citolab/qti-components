import { html, render } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '@qti-components/elements';

const meta: Meta = {
  title: 'Cookbook/CitoTestUit/Review a finished attempt',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `A review screen shows what a candidate answered, locked, with the feedback they got. It uses
three members of \`<qti-assessment-item>\` and nothing else:

\`\`\`js
item.variables = storedAttempt.variables;           // shows the answer in the interactions
item.setOutcomeVariable('FEEDBACK', storedFeedback); // replays the outcome, so its feedback shows
item.disabled = true;                                // locks the item
\`\`\`

\`setOutcomeVariable\` shows the feedback by the time it returns. Assigning \`variables\` shows the values
in the interactions, possibly on the next update. Switch between the two stored attempts below.`
      }
    }
  }
};
export default meta;

const attempts = {
  'Attempt 1': { response: 'correct', feedback: 'correct' },
  'Attempt 2': { response: 'incorrect', feedback: 'incorrect' }
};

const item = html`
  <qti-assessment-item identifier="review-item" title="Review item">
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response><qti-value>correct</qti-value></qti-correct-response>
    </qti-response-declaration>
    <qti-outcome-declaration
      identifier="FEEDBACK"
      cardinality="single"
      base-type="identifier"
    ></qti-outcome-declaration>
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
        <qti-prompt>Which answer is right?</qti-prompt>
        <qti-simple-choice identifier="correct">Correct</qti-simple-choice>
        <qti-simple-choice identifier="incorrect">Incorrect</qti-simple-choice>
      </qti-choice-interaction>
      <qti-feedback-block show-hide="show" outcome-identifier="FEEDBACK" identifier="correct">
        <qti-content-body>That is right</qti-content-body>
      </qti-feedback-block>
      <qti-feedback-block show-hide="show" outcome-identifier="FEEDBACK" identifier="incorrect">
        <qti-content-body>That is wrong</qti-content-body>
      </qti-feedback-block>
    </qti-item-body>
  </qti-assessment-item>
`;

/** Show a stored attempt: its answer, its feedback, locked. */
export const ReviewAnAttempt: StoryObj = {
  render: () => {
    const root = document.createElement('div');
    const buttons = document.createElement('p');
    const stage = document.createElement('div');
    render(item, stage);
    const qtiItem = stage.querySelector<QtiAssessmentItem>('qti-assessment-item')!;

    const show = async (attempt: { response: string; feedback: string }) => {
      await qtiItem.updateComplete;
      qtiItem.variables = [{ identifier: 'RESPONSE', type: 'response', value: attempt.response }];
      qtiItem.setOutcomeVariable('FEEDBACK', attempt.feedback);
      qtiItem.disabled = true;
    };

    for (const [label, attempt] of Object.entries(attempts)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => void show(attempt));
      buttons.append(button, ' ');
    }
    root.append(buttons, stage);
    return root;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvasElement.querySelector('qti-choice-interaction')!;
    const feedback = (id: string) =>
      canvasElement.querySelector<HTMLElement & { showStatus: string }>(`qti-feedback-block[identifier="${id}"]`)!;

    canvas.getByText('Attempt 2').click();
    await waitFor(() => expect(canvas.getByText('Incorrect').matches(':state(checked)')).toBe(true));
    expect(feedback('incorrect').showStatus).toBe('on');
    expect(feedback('correct').showStatus).toBe('off');
    expect(interaction).toHaveAttribute('disabled');

    canvas.getByText('Attempt 1').click();
    await waitFor(() => expect(canvas.getByText('Correct').matches(':state(checked)')).toBe(true));
    expect(feedback('correct').showStatus).toBe('on');
  }
};
