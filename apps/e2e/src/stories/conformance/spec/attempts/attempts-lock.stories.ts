import { html } from 'lit';
import { expect, userEvent, waitFor, within as withinLight } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { getAssessmentItemsFromTestContainer } from '../../../../../../../tools/testing/test-utils';
import { ITEM_SESSION_CONTROL_TEST, LINEAR_ADAPTIVE_TEST } from './attempts.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '@qti-components/elements';

/**
 * What a candidate experiences when an item in a test runs out of attempts, checked against the
 * QTI 3 implementation guide §4.4.2.1 (`max-attempts`: default 1, 0 is unlimited, ignored for
 * adaptive items) and the info model's item session lifecycle (§2.2.1: once no more attempts are
 * allowed, the item session is closed and the response can no longer change).
 *
 * QTI does not say what a closed item looks like. We disable it: the candidate's answer stays on
 * screen but cannot be changed, and End Attempt is greyed out. `test-navigation` does this; the
 * stories only click and press what a candidate can.
 */
const meta: Meta = {
  title: 'QTI behaviour/Attempts in a test',
  tags: ['!autodocs', 'qti-spec']
};
export default meta;

const sessionControlTest = () => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container test-url=${ITEM_SESSION_CONTROL_TEST}></test-container>
      <test-end-attempt>End Attempt</test-end-attempt>
      <test-item-link item-id="ITM-choice-default">One try</test-item-link>
      <test-item-link item-id="ITM-choice-max2">Two tries</test-item-link>
      <test-item-link item-id="ITM-choice-noskip">Unlimited</test-item-link>
    </test-navigation>
  </qti-test>
`;

const STAY = 'You must stay with your luggage at all times.';
const LOOK_AFTER = 'Do not let someone else look after your luggage.';
const REMEMBER = 'Remember your luggage when you leave.';

/**
 * What the candidate can do and see. The item element is looked up only to read its QTI variables
 * and to scope the clicks to the question on screen: the three questions here are the same item, so
 * it is found by its item-ref.
 */
const candidate = async (canvasElement: HTMLElement) => {
  const screen = within(canvasElement);
  const endAttemptButton = await screen.findByShadowText('End Attempt');
  let item: QtiAssessmentItem;

  const variable = (identifier: string) => item.itemContext.variables.find(v => v.identifier === identifier)?.value;
  return {
    /** Goes to the question through its link (none: the first question), and waits until it is on screen. */
    open: async (itemRef: string, link?: string) => {
      // A link pressed before the test has loaded asks for nothing.
      await getAssessmentItemsFromTestContainer(canvasElement);
      if (link) await userEvent.click(await screen.findByShadowText(link));
      item = await waitFor(
        () => {
          const ref = canvasElement
            .querySelector('test-container')
            ?.shadowRoot?.querySelector<
              HTMLElement & { assessmentItem?: QtiAssessmentItem }
            >(`qti-assessment-item-ref[identifier="${itemRef}"]`);
          if (!ref?.assessmentItem?.itemContext) throw new Error(`${itemRef} is not on screen yet`);
          return ref.assessmentItem;
        },
        { timeout: 15000 }
      );
      await item.updateComplete;
    },
    choose: async (text: string) => {
      await userEvent.click(withinLight(item).getByText(text));
      await item.updateComplete;
    },
    endAttempt: async () => {
      const before = Number(variable('numAttempts'));
      await waitFor(() => expect(endAttemptButton).toBeEnabled());
      await userEvent.click(endAttemptButton);
      await waitFor(() => expect(Number(variable('numAttempts'))).toBe(before + 1));
    },
    endAttemptButton,
    /** The choice the item holds as the candidate's answer. */
    answer: () => variable('RESPONSE'),
    variable,
    sees: (text: string) => {
      const range = document.createRange();
      range.selectNodeContents(withinLight(item).getByText(text));
      return range.getClientRects().length > 0;
    }
  };
};

/**
 * Without `qti-item-session-control` an item gets one attempt (impl. guide §4.4.2.1). Once it is
 * ended the item session is closed: the answer stays, but the candidate cannot change it.
 */
export const OneTryThenLocked: StoryObj = {
  name: 'With one try, my answer is locked once I end the attempt',
  render: sessionControlTest,
  play: async ({ canvasElement, step }) => {
    const { open, choose, endAttempt, endAttemptButton, answer, variable } = await candidate(canvasElement);

    await step('Open the question that has no item session control', () => open('ITM-choice-default', 'One try'));
    await step('Choose an answer', () => choose(REMEMBER));
    await step('Press End Attempt', () => endAttempt());

    await step('End Attempt is greyed out', async () => {
      await waitFor(() => expect(endAttemptButton).toBeDisabled());
    });

    await step('Choosing another answer changes nothing', async () => {
      await choose(STAY);
      expect(answer()).toBe('ChoiceC');
    });

    await step('One attempt; max-attempts was 1', async () => {
      expect(variable('numAttempts')).toBe('1');
    });
  }
};

/**
 * `max-attempts="2"`: after the first attempt the candidate may change the answer and try again
 * (impl. guide §4.4.2.1); after the second the item is locked.
 */
export const TwoTriesThenLocked: StoryObj = {
  name: 'With two tries, I can change my answer once',
  render: sessionControlTest,
  play: async ({ canvasElement, step }) => {
    const { open, choose, endAttempt, endAttemptButton, answer, variable } = await candidate(canvasElement);

    await step('Open the question with max-attempts 2', () => open('ITM-choice-max2', 'Two tries'));
    await step('Choose a wrong answer', () => choose(REMEMBER));
    await step('Press End Attempt', () => endAttempt());

    await step('I can still change my answer', async () => {
      await choose(LOOK_AFTER);
      expect(answer()).toBe('ChoiceB');
      expect(variable('numAttempts')).toBe('1');
    });

    await step('Press End Attempt again', () => endAttempt());

    await step('End Attempt is greyed out and the answer is locked', async () => {
      await waitFor(() => expect(endAttemptButton).toBeDisabled());
      await choose(STAY);
      expect(answer()).toBe('ChoiceB');
      expect(variable('numAttempts')).toBe('2');
    });
  }
};

/**
 * `max-attempts="0"` means no limit (impl. guide §4.4.2.1): the item is never locked. The answers are
 * all wrong on purpose: `test-end-attempt` also greys out after an optimal attempt, which is our own
 * rule, not QTI's, and not what this story is about.
 */
export const UnlimitedTriesNeverLocked: StoryObj = {
  name: 'With unlimited tries, my answer is never locked',
  render: sessionControlTest,
  play: async ({ canvasElement, step }) => {
    const { open, choose, endAttempt, endAttemptButton, answer, variable } = await candidate(canvasElement);

    await step('Open the question with max-attempts 0', () => open('ITM-choice-noskip', 'Unlimited'));

    for (const [text, id] of [
      [REMEMBER, 'ChoiceC'],
      [LOOK_AFTER, 'ChoiceB'],
      [REMEMBER, 'ChoiceC']
    ] as const) {
      await step(`Choose "${text}" and press End Attempt`, async () => {
        await choose(text);
        expect(answer()).toBe(id);
        await endAttempt();
      });
    }

    await step('Three attempts, and I can still change my answer', async () => {
      expect(variable('numAttempts')).toBe('3');
      await waitFor(() => expect(endAttemptButton).toBeEnabled());
      await choose(LOOK_AFTER);
      expect(answer()).toBe('ChoiceB');
    });
  }
};

/**
 * An adaptive item ignores `max-attempts` (impl. guide §4.4.2.1): it decides itself when it is done,
 * through completionStatus (QTI info model §2.5). In a part with `max-attempts="1"`, a wrong first
 * answer shows a hint and the candidate answers again.
 */
export const AdaptiveItemIgnoresMaxAttempts: StoryObj = {
  name: 'An adaptive item lets me answer again after a hint, even with one try',
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url=${LINEAR_ADAPTIVE_TEST}></test-container>
        <test-end-attempt>End Attempt</test-end-attempt>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement, step }) => {
    const { open, choose, endAttempt, answer, variable } = await candidate(canvasElement);

    await step('The adaptive question appears', () => open('ITM-adaptive'));
    await step('Choose a wrong answer', () => choose(LOOK_AFTER));
    await step('Press End Attempt', () => endAttempt());

    await step('The item is not done and I can change my answer', async () => {
      expect(variable('completionStatus')).not.toBe('completed');
      await choose(STAY);
      expect(answer()).toBe('ChoiceA');
    });
  }
};
