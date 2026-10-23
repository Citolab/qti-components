import { html } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

/**
 * `qti-custom-operator` computes a value QTI has no operator for. It sits inside response
 * processing like any other expression, so it reads the processing copy of the item context and
 * its writes land there too: a rule after it sees them, and the item publishes them once.
 */
const meta: Meta = {
  title: 'Elements/qti-custom-operator',
  component: 'qti-custom-operator'
};
export default meta;

const score = () => html`
  <p>SCORE: <qti-printed-variable data-testid="score" identifier="SCORE"></qti-printed-variable></p>
  <p>FEEDBACK: <qti-printed-variable data-testid="feedback" identifier="FEEDBACK"></qti-printed-variable></p>
`;

/** The item in the story, rendered and ready, and the value of one of its variables. */
const readyItem = async (canvasElement: HTMLElement) => {
  const item = await waitFor(() => {
    const found = canvasElement.querySelector<QtiAssessmentItem>('qti-assessment-item');
    if (!found) throw new Error('item is not rendered yet');
    return found;
  });
  await item.updateComplete;
  const value = (identifier: string) => item.variables.find(v => v.identifier === identifier)?.value;
  return { item, value };
};

const scoreButton = () => html`
  <button
    @click=${(e: Event) =>
      (
        (e.target as HTMLElement)
          .closest('[data-testid=host]')!
          .querySelector('qti-assessment-item') as QtiAssessmentItem
      ).processResponse()}
  >
    Score
  </button>
`;

/**
 * `class="js.org"`: inline JavaScript in a comment. `item.getVariable` reads the processing copy and
 * `item.updateOutcomeVariable` writes to it, so the script reads its own write back. What the script
 * returns goes to the `qti-set-outcome-value` around it.
 */
export const InlineJavaScript: StoryObj = {
  render: () => html`
    <div data-testid="host">
      <qti-assessment-item identifier="custom-operator-js">
        <qti-response-declaration identifier="RESPONSE-A" cardinality="single" base-type="identifier">
          <qti-correct-response><qti-value>A2</qti-value></qti-correct-response>
        </qti-response-declaration>
        <qti-response-declaration identifier="RESPONSE-B" cardinality="single" base-type="identifier">
          <qti-correct-response><qti-value>B1</qti-value></qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="integer">
          <qti-default-value><qti-value>0</qti-value></qti-default-value>
        </qti-outcome-declaration>
        <qti-outcome-declaration
          identifier="FEEDBACK"
          cardinality="single"
          base-type="string"
        ></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE-A" max-choices="1">
            <qti-prompt>2 + 2 =</qti-prompt>
            <qti-simple-choice identifier="A1">3</qti-simple-choice>
            <qti-simple-choice identifier="A2">4</qti-simple-choice>
          </qti-choice-interaction>
          <qti-choice-interaction response-identifier="RESPONSE-B" max-choices="1">
            <qti-prompt>The capital of France</qti-prompt>
            <qti-simple-choice identifier="B1">Paris</qti-simple-choice>
            <qti-simple-choice identifier="B2">Lyon</qti-simple-choice>
          </qti-choice-interaction>
          ${score()}
        </qti-item-body>
        <qti-response-processing>
          <qti-set-outcome-value identifier="FEEDBACK">
            <qti-custom-operator class="js.org">
              <qti-base-value base-type="string">
                <!--
                  const correct = id => item.getVariable(id).value === item.getVariable(id).correctResponse ? 1 : 0;
                  item.updateOutcomeVariable('SCORE', String(correct('RESPONSE-A') + correct('RESPONSE-B')));
                  return item.getVariable('SCORE').value + ' of 2 correct';
                -->
              </qti-base-value>
            </qti-custom-operator>
          </qti-set-outcome-value>
        </qti-response-processing>
      </qti-assessment-item>
      ${scoreButton()}
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const host = within(canvasElement);
    const { value } = await readyItem(canvasElement);

    await step('Answer 4 (right) and Lyon (wrong)', () => {
      host.getByText('4').click();
      host.getByText('Lyon').click();
    });

    await step('Press Score: the script sets SCORE 1 and returns "1 of 2 correct" as FEEDBACK', async () => {
      host.getByText('Score').click();
      await waitFor(() => expect(value('FEEDBACK')).toBe('1 of 2 correct'));
      expect(value('SCORE')).toBe('1');
    });

    await step('Change Lyon to Paris and press Score: SCORE 2, "2 of 2 correct"', async () => {
      host.getByText('Paris').click();
      host.getByText('Score').click();
      await waitFor(() => expect(value('FEEDBACK')).toBe('2 of 2 correct'));
      expect(value('SCORE')).toBe('2');
    });
  }
};

/**
 * `definition`: an operator the host registered with `registerCustomOperator`, or a built-in. Here
 * the built-in `depcp:Trim` lets " Paris " count as Paris.
 */
export const Definition: StoryObj = {
  render: () => html`
    <div data-testid="host">
      <qti-assessment-item identifier="custom-operator-definition">
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
          <qti-correct-response><qti-value>Paris</qti-value></qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="integer">
          <qti-default-value><qti-value>0</qti-value></qti-default-value>
        </qti-outcome-declaration>
        <qti-outcome-declaration
          identifier="FEEDBACK"
          cardinality="single"
          base-type="string"
        ></qti-outcome-declaration>
        <qti-item-body>
          <p>
            The capital of France:
            <qti-text-entry-interaction response-identifier="RESPONSE"></qti-text-entry-interaction>
          </p>
          ${score()}
        </qti-item-body>
        <qti-response-processing>
          <qti-response-condition>
            <qti-response-if>
              <qti-match>
                <qti-custom-operator definition="depcp:Trim">
                  <qti-variable identifier="RESPONSE"></qti-variable>
                </qti-custom-operator>
                <qti-correct identifier="RESPONSE"></qti-correct>
              </qti-match>
              <qti-set-outcome-value identifier="SCORE"
                ><qti-base-value base-type="integer">1</qti-base-value></qti-set-outcome-value
              >
            </qti-response-if>
          </qti-response-condition>
        </qti-response-processing>
      </qti-assessment-item>
      ${scoreButton()}
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const host = within(canvasElement);
    const { item, value } = await readyItem(canvasElement);

    await step('The answer is " Paris " with spaces around it', () => {
      item.updateResponseVariable('RESPONSE', '  Paris ');
    });

    await step('Press Score: depcp:Trim removes the spaces, so it matches Paris: SCORE 1', async () => {
      host.getByText('Score').click();
      await waitFor(() => expect(value('SCORE')).toBe('1'));
    });
  }
};
