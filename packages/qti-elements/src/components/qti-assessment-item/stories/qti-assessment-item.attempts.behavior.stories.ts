import { html, nothing } from 'lit';
import { expect, userEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { qtiTransformItem } from '@qti-components/transformers';

import solutionItemXml from './fixtures/example03-feedback-block-solution.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '../qti-assessment-item';

/**
 * What a candidate experiences when an attempt at an item starts, ends and repeats, checked against
 * the QTI 3 information model (§2.2, §2.4.5, §2.5) and implementation guide (§3.7.2). Each story is
 * a short script of what the candidate does and sees; the QTI variables it then checks
 * (`numAttempts`, `completionStatus`, `SCORE`, the end-attempt responses) are the ones a results
 * file carries.
 *
 * These stories only do what a candidate can do: choose, type, press the item's buttons. A story
 * that fails is a to-do for the library and is tagged `xfail`. The host API for the same variables
 * is under API Reference/Attempts and completion.
 */
const meta: Meta = {
  title: 'QTI behaviour/Attempts and completion',
  component: 'qti-assessment-item',
  tags: ['!autodocs', 'qti-spec']
};
export default meta;

type Options = {
  adaptive?: boolean;
  /** `count-attempt` on the Check button; `null` leaves the attribute out. */
  checkCounts?: 'true' | 'false' | null;
  hint?: boolean;
  processing?: ReturnType<typeof html>;
};

/**
 * Non-adaptive: Amsterdam adds 1 to SCORE. The item resets SCORE to 0 before every run, so a repeat
 * that still adds 1 shows the reset.
 */
const scoreTheAnswer = html`
  <qti-response-condition>
    <qti-response-if>
      <qti-variable identifier="HINT"></qti-variable>
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-base-value base-type="identifier">HINT</qti-base-value>
      </qti-set-outcome-value>
    </qti-response-if>
    <qti-response-else-if>
      <qti-match>
        <qti-variable identifier="RESPONSE"></qti-variable>
        <qti-correct identifier="RESPONSE"></qti-correct>
      </qti-match>
      <qti-set-outcome-value identifier="SCORE">
        <qti-sum>
          <qti-variable identifier="SCORE"></qti-variable>
          <qti-base-value base-type="float">1</qti-base-value>
        </qti-sum>
      </qti-set-outcome-value>
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-base-value base-type="identifier">CORRECT</qti-base-value>
      </qti-set-outcome-value>
    </qti-response-else-if>
    <qti-response-else>
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-base-value base-type="identifier">INCORRECT</qti-base-value>
      </qti-set-outcome-value>
    </qti-response-else>
  </qti-response-condition>
`;

/**
 * Adaptive, the hint-counter pattern: every wrong try adds to WRONG, which the item keeps between
 * attempts; the right answer scores 2 minus the wrong tries and completes the item.
 */
const buildOnTheLastTry = html`
  <qti-response-condition>
    <qti-response-if>
      <qti-match>
        <qti-variable identifier="RESPONSE"></qti-variable>
        <qti-correct identifier="RESPONSE"></qti-correct>
      </qti-match>
      <qti-set-outcome-value identifier="SCORE">
        <qti-subtract>
          <qti-base-value base-type="float">2</qti-base-value>
          <qti-variable identifier="WRONG"></qti-variable>
        </qti-subtract>
      </qti-set-outcome-value>
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-base-value base-type="identifier">CORRECT</qti-base-value>
      </qti-set-outcome-value>
      <qti-set-outcome-value identifier="completionStatus">
        <qti-base-value base-type="identifier">completed</qti-base-value>
      </qti-set-outcome-value>
    </qti-response-if>
    <qti-response-else>
      <qti-set-outcome-value identifier="WRONG">
        <qti-sum>
          <qti-variable identifier="WRONG"></qti-variable>
          <qti-base-value base-type="integer">1</qti-base-value>
        </qti-sum>
      </qti-set-outcome-value>
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-base-value base-type="identifier">TRY-AGAIN</qti-base-value>
      </qti-set-outcome-value>
      <qti-set-outcome-value identifier="completionStatus">
        <qti-base-value base-type="identifier">incomplete</qti-base-value>
      </qti-set-outcome-value>
    </qti-response-else>
  </qti-response-condition>
`;

const capitalItem = ({
  adaptive = false,
  checkCounts = 'true',
  hint = false,
  processing = scoreTheAnswer
}: Options = {}) => html`
  <qti-assessment-item identifier="capital" title="Capital" adaptive=${adaptive ? 'true' : 'false'}>
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response><qti-value>AMS</qti-value></qti-correct-response>
    </qti-response-declaration>
    <qti-response-declaration identifier="CHECK" cardinality="single" base-type="boolean"></qti-response-declaration>
    <qti-response-declaration identifier="HINT" cardinality="single" base-type="boolean"></qti-response-declaration>
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
      <qti-default-value><qti-value>0</qti-value></qti-default-value>
    </qti-outcome-declaration>
    <qti-outcome-declaration identifier="WRONG" cardinality="single" base-type="integer">
      <qti-default-value><qti-value>0</qti-value></qti-default-value>
    </qti-outcome-declaration>
    <qti-outcome-declaration
      identifier="FEEDBACK"
      cardinality="single"
      base-type="identifier"
    ></qti-outcome-declaration>
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
        <qti-prompt>What is the capital of the Netherlands?</qti-prompt>
        <qti-simple-choice identifier="AMS">Amsterdam</qti-simple-choice>
        <qti-simple-choice identifier="RTM">Rotterdam</qti-simple-choice>
      </qti-choice-interaction>
      <qti-feedback-block outcome-identifier="FEEDBACK" identifier="CORRECT" show-hide="show">
        <p>Correct, it is Amsterdam.</p>
      </qti-feedback-block>
      <qti-feedback-block outcome-identifier="FEEDBACK" identifier="INCORRECT" show-hide="show">
        <p>No, that is not the capital.</p>
      </qti-feedback-block>
      <qti-feedback-block outcome-identifier="FEEDBACK" identifier="TRY-AGAIN" show-hide="show">
        <p>Not quite. Try again.</p>
      </qti-feedback-block>
      <qti-feedback-block outcome-identifier="FEEDBACK" identifier="HINT" show-hide="show">
        <p>Hint: it is the largest city.</p>
      </qti-feedback-block>
      ${hint
        ? html`<qti-end-attempt-interaction
            response-identifier="HINT"
            count-attempt="false"
            title="Hint"
          ></qti-end-attempt-interaction>`
        : nothing}
      <qti-end-attempt-interaction
        response-identifier="CHECK"
        count-attempt=${checkCounts ?? nothing}
        title="Check"
      ></qti-end-attempt-interaction>
    </qti-item-body>
    <qti-response-processing>${processing}</qti-response-processing>
  </qti-assessment-item>
`;

/**
 * What the candidate can do and see, and the item's QTI variables to check afterwards. The item
 * element is looked up only to read those variables; nothing here drives it.
 */
const candidate = async (canvasElement: HTMLElement) => {
  const screen = within(canvasElement);
  const item = await waitFor(() => {
    const found = canvasElement.querySelector<QtiAssessmentItem>('qti-assessment-item');
    if (!found?.itemContext) throw new Error('item is not ready yet');
    return found;
  });
  await item.updateComplete;

  const settle = async () => {
    await item.updateComplete;
    await new Promise(resolve => setTimeout(resolve));
  };
  const button = (name: string) => screen.findByShadowRole<HTMLButtonElement>('button', { name });
  return {
    choose: async (text: string) => {
      await userEvent.click(screen.getByText(text));
      await settle();
    },
    press: async (name: string) => {
      await userEvent.click(await button(name));
      await settle();
    },
    button,
    /**
     * The text is on screen. Feedback hides its content behind a closed slot in its shadow root,
     * which `toBeVisible` and the host's own `checkVisibility` both miss; hidden text has no boxes.
     */
    sees: (text: string) => {
      const range = document.createRange();
      range.selectNodeContents(screen.getByText(text));
      return range.getClientRects().length > 0;
    },
    variable: (identifier: string) => item.itemContext.variables.find(v => v.identifier === identifier)?.value
  };
};

/**
 * QTI info model §2.2.2.3: completionStatus "starts with the reserved value not_attempted. At the
 * start of the first attempt it changes to … unknown." The first attempt starts when the item is
 * presented.
 *
 * §2.2.2.2 says numAttempts "increases by 1 at the start of each attempt", which would make it 1
 * here. TAO, amp-up and QTI.JS count an attempt when it ends, and so do we: numAttempts is 0 until
 * the candidate submits, and that is what a results file carries.
 */
export const IOpenAnItem: StoryObj = {
  name: 'I open an item',
  render: () => capitalItem(),
  play: async ({ canvasElement, step }) => {
    const { sees, button, variable } = await candidate(canvasElement);

    await step('The question and a Check button appear, no feedback yet', async () => {
      expect(sees('What is the capital of the Netherlands?')).toBe(true);
      expect(await button('Check')).toBeEnabled();
      expect(sees('Correct, it is Amsterdam.')).toBe(false);
      expect(sees('No, that is not the capital.')).toBe(false);
    });

    await step('Nothing is counted yet; the item is no longer not_attempted', async () => {
      expect(variable('numAttempts')).toBe('0');
      expect(variable('completionStatus')).toBe('unknown');
      expect(variable('SCORE')).toBe('0');
    });
  }
};

/**
 * QTI info model §2.2.1 and §2.5: pressing an end-attempt button ends the attempt, and response
 * processing runs at the end of each attempt. The item shows the feedback its outcomes select.
 *
 * A non-adaptive item need not set completionStatus; QTI leaves it `unknown` then. We mark it
 * `completed` once an attempt has ended, as TAO does and the 1EdTech results-reporting reference
 * results expect.
 */
export const IAnswerAndPressCheck: StoryObj = {
  name: 'I answer and press Check',
  render: () => capitalItem(),
  play: async ({ canvasElement, step }) => {
    const { choose, press, sees, variable } = await candidate(canvasElement);

    await step('Choose Amsterdam', () => choose('Amsterdam'));
    await step('Press Check', () => press('Check'));

    await step('The feedback "Correct, it is Amsterdam." appears, and only that', async () => {
      expect(sees('Correct, it is Amsterdam.')).toBe(true);
      expect(sees('No, that is not the capital.')).toBe(false);
    });

    await step('One attempt, completed, scored 1', async () => {
      expect(variable('numAttempts')).toBe('1');
      expect(variable('completionStatus')).toBe('completed');
      expect(variable('SCORE')).toBe('1');
    });
  }
};

/**
 * QTI info model §2.2.2.3: for a non-adaptive item "the values of the outcome variables are reset
 * to their default values prior to each invocation of response processing". Each attempt is scored
 * on its own: the item's rule adds 1 to SCORE, and the second attempt still ends at 1.
 */
export const ITryAgainWithTheSameAnswer: StoryObj = {
  name: 'I try again with the same answer',
  render: () => capitalItem(),
  play: async ({ canvasElement, step }) => {
    const { choose, press, sees, variable } = await candidate(canvasElement);

    await step('Choose Amsterdam', () => choose('Amsterdam'));
    await step('Press Check', () => press('Check'));
    await step('Press Check again', () => press('Check'));

    await step('The same feedback shows', async () => {
      expect(sees('Correct, it is Amsterdam.')).toBe(true);
    });

    await step('Two attempts; the score is that of the last one, not the sum', async () => {
      expect(variable('numAttempts')).toBe('2');
      expect(variable('SCORE')).toBe('1');
    });
  }
};

/**
 * QTI info model §2.4.5: the end-attempt interaction the candidate used gets the response `true`,
 * every other one `false`. A Hint button marked `count-attempt="false"` shows its hint without
 * using up an attempt. The item's processing tests HINT as a bare boolean condition, as the spec's own
 * examples do (§3.7.2).
 */
export const IAskForAHintThenAnswer: StoryObj = {
  name: 'I ask for a hint, then answer',
  render: () => capitalItem({ hint: true }),
  play: async ({ canvasElement, step }) => {
    const { choose, press, sees, variable } = await candidate(canvasElement);

    await step('Choose Amsterdam', () => choose('Amsterdam'));
    await step('Press Hint', () => press('Hint'));

    await step('The hint appears, no answer feedback', async () => {
      expect(sees('Hint: it is the largest city.')).toBe(true);
      expect(sees('Correct, it is Amsterdam.')).toBe(false);
    });

    await step('HINT is true, CHECK false; the hint used no attempt', async () => {
      expect([variable('HINT'), variable('CHECK')]).toEqual(['true', 'false']);
      expect(variable('numAttempts')).toBe('0');
    });

    await step('Press Check', () => press('Check'));

    await step('The answer feedback replaces the hint', async () => {
      expect(sees('Correct, it is Amsterdam.')).toBe(true);
      expect(sees('Hint: it is the largest city.')).toBe(false);
    });

    await step('HINT is false, CHECK true; one attempt', async () => {
      expect([variable('HINT'), variable('CHECK')]).toEqual(['false', 'true']);
      expect(variable('numAttempts')).toBe('1');
      expect(variable('SCORE')).toBe('1');
    });
  }
};

/**
 * `count-attempt` on an end-attempt interaction: QTI 2.x gave it the default `true`; QTI 3 gives no
 * default (info model §5.45). We follow 2.x, amp-up and QTI.JS: a button that does not say counts
 * the attempt. Only `count-attempt="false"` does not count.
 */
export const AButtonWithoutCountAttemptCounts: StoryObj = {
  name: 'A Check button that does not say whether it counts, counts',
  render: () => capitalItem({ checkCounts: null }),
  play: async ({ canvasElement, step }) => {
    const { choose, press, variable } = await candidate(canvasElement);

    await step('Choose Amsterdam', () => choose('Amsterdam'));
    await step('Press Check', () => press('Check'));

    await step('One attempt', async () => {
      expect(variable('numAttempts')).toBe('1');
    });
  }
};

/**
 * The implementation guide's own adaptive example (§3.7.2, "Using feedbackBlock to show a
 * solution"), unchanged. Its response processing shows the solution, hides the Show Solution
 * button, sets SCORE to 0 with an explanation, and completes the item.
 *
 * After that the item is completed and its session closes (QTI info model §2.5), so the example's
 * "if an answer is submitted" branch cannot be reached by the candidate here.
 */
export const IGiveUpAndLookAtTheSolution: StoryObj = {
  name: 'I give up and look at the solution',
  render: () => qtiTransformItem().parse(solutionItemXml).htmlDoc(),
  play: async ({ canvasElement, step }) => {
    const { press, button, sees, variable } = await candidate(canvasElement);

    await step('The question and a Show Solution button appear, no solution yet', async () => {
      expect((await button('Show Solution')).checkVisibility()).toBe(true);
      expect(sees('7.389')).toBe(false);
    });

    await step('Press Show Solution', () => press('Show Solution'));

    await step('The solution and why the score is 0 appear; the button is gone', async () => {
      expect(sees('7.389')).toBe(true);
      expect(sees('Since you have viewed the solution, your score for this question will be 0.')).toBe(true);
      expect((await button('Show Solution')).checkVisibility()).toBe(false);
      expect(sees('Correct')).toBe(false);
    });

    await step('The item is completed with SCORE 0', async () => {
      expect(variable('completionStatus')).toBe('completed');
      // The item writes the float as `0.0`.
      expect(Number(variable('SCORE'))).toBe(0);
      expect(variable('SOLREQUEST')).toBe('true');
    });
  }
};

/**
 * QTI info model §2.2.2.3 and §2.5: an adaptive item keeps its outcomes between attempts, so its
 * processing can build on the previous one (here: a wrong try costs a point), and it decides itself
 * when it is done by setting completionStatus to `completed`.
 */
export const TheItemBuildsOnMyLastTry: StoryObj = {
  name: 'The item builds on my last try',
  render: () => capitalItem({ adaptive: true, processing: buildOnTheLastTry }),
  play: async ({ canvasElement, step }) => {
    const { choose, press, sees, variable } = await candidate(canvasElement);

    await step('Choose Rotterdam', () => choose('Rotterdam'));
    await step('Press Check', () => press('Check'));

    await step('"Not quite. Try again." appears; the item is not done', async () => {
      expect(sees('Not quite. Try again.')).toBe(true);
      expect(variable('numAttempts')).toBe('1');
      expect(variable('completionStatus')).toBe('incomplete');
      expect(variable('SCORE')).toBe('0');
    });

    await step('Choose Amsterdam', () => choose('Amsterdam'));
    await step('Press Check', () => press('Check'));

    await step('"Correct, it is Amsterdam." replaces the try-again feedback', async () => {
      expect(sees('Correct, it is Amsterdam.')).toBe(true);
      expect(sees('Not quite. Try again.')).toBe(false);
    });

    await step('Completed; the score remembers the wrong try (2 − 1)', async () => {
      expect(variable('numAttempts')).toBe('2');
      expect(variable('completionStatus')).toBe('completed');
      expect(variable('SCORE')).toBe('1');
    });
  }
};

/**
 * QTI info model §2.5: when an adaptive item sets completionStatus to `completed`, the item session
 * closes and no further attempt can start. The candidate sees that as a Check button that no longer
 * works.
 *
 * Fails: on its own the item keeps its end-attempt buttons enabled (in a test, `test-end-attempt`
 * locks the test's own button).
 */
export const ICannotTryAgainOnceTheItemIsDone: StoryObj = {
  name: 'I cannot try again once the item is done',
  tags: ['xfail'],
  render: () => capitalItem({ adaptive: true, processing: buildOnTheLastTry }),
  play: async ({ canvasElement, step }) => {
    const { choose, press, button, variable } = await candidate(canvasElement);

    await step('Choose Amsterdam', () => choose('Amsterdam'));
    await step('Press Check', () => press('Check'));

    await step('The item is completed and the Check button is greyed out', async () => {
      expect(variable('completionStatus')).toBe('completed');
      expect(await button('Check')).toBeDisabled();
    });
  }
};
