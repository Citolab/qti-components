import { expect, waitFor } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiChoiceInteraction } from '@qti-components/choice-interaction';
import type { QtiSimpleChoice } from '@qti-components/interactions-core';

/**
 * Sequencing in a linear test part: `qti-pre-condition` and `qti-branch-rule`.
 *
 * Every story is the same small test, three items, and the same candidate action: answer the first
 * item ("Unattended Luggage"), end the attempt, press Next. What differs is the XML of the test,
 * which you can read next to the story (`public/assets/qti-test-package/assessment-linear-*.xml`).
 * The play function then checks which item the candidate lands on.
 *
 * - A **pre-condition** sits inside an item ref (or section, or test part) and decides whether it
 *   is *presented*. It reads earlier results with `<qti-variable identifier="ITM-choice.SCORE">`.
 * - A **branch rule** sits inside an item ref (or section, or test part) and, after that item, jumps
 *   *forward* to its `target`: an item ref, a section, a test part, or `EXIT_SECTION`,
 *   `EXIT_TESTPART`, `EXIT_TEST`.
 * - Both only apply in linear mode. Items passed over are announced with `cito-test-items-skipped`;
 *   running out of items (or `EXIT_TEST`) with `cito-test-end-reached`.
 */
const meta: Meta = {
  title: 'test-navigation/Sequencing',
  component: 'qti-test',
  parameters: { testTimeout: 30000 }
};
export default meta;

const CORRECT = 'You must stay with your luggage at all times.';
const WRONG = 'Do not let someone else look after your luggage.';

const render = (url: string) => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container test-url=${url}></test-container>
      <test-end-attempt>End Attempt</test-end-attempt>
      <test-next>Next</test-next>
    </test-navigation>
  </qti-test>
`;

/** Plays the first item: choose an answer, end the attempt. Next is then enabled (one attempt only). */
async function answerFirstItem(canvasElement: HTMLElement, answer: string) {
  const canvas = within(canvasElement);
  await getAssessmentItemsFromTestContainer(canvasElement);

  const item = await waitFor(async () =>
    getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage')
  );
  const choice = within(item.querySelector<QtiChoiceInteraction>('qti-choice-interaction')!).getByText<QtiSimpleChoice>(
    answer
  );
  choice.click();
  const simpleChoice = choice.closest('qti-simple-choice') as QtiSimpleChoice;
  await waitFor(() => expect(simpleChoice.internals.states.has('checked')).toBe(true));

  canvas.getByShadowText('End Attempt').click();
  const next = canvas.getByShadowText('Next');
  await waitFor(() => expect(next).toBeEnabled());
  return next;
}

/** The identifier of the item ref the test is showing. */
const activeItemRef = (canvasElement: HTMLElement) =>
  (canvasElement.querySelector('qti-test') as unknown as { sessionContext?: { navItemRefId?: string } }).sessionContext
    ?.navItemRefId;

/** Records the ids announced by `cito-test-items-skipped`. */
function collectSkipped(canvasElement: HTMLElement): string[] {
  const skipped: string[] = [];
  canvasElement.addEventListener('cito-test-items-skipped', e => skipped.push(...(e as CustomEvent).detail.ids));
  return skipped;
}

/**
 * Test: `ITM-choice` → `ITM-text_entry` (pre-condition: only when ITM-choice.SCORE is not 1) → `ITM-extended_text`.
 *
 * A right answer makes the pre-condition false, so the text entry is skipped.
 */
export const PreConditionSkipsItem: StoryObj = {
  render: () => render('/assets/qti-test-package/assessment-linear-precondition.xml'),
  play: async ({ canvasElement }) => {
    const skipped = collectSkipped(canvasElement);
    const next = await answerFirstItem(canvasElement, CORRECT);
    next.click();

    await waitFor(() => expect(activeItemRef(canvasElement)).toBe('ITM-extended_text'));
    // announced once the jump went through, which can be a moment after the item changes
    await waitFor(() => expect(skipped).toEqual(['ITM-text_entry']));
  }
};

/** Same test, wrong answer: the pre-condition is true, so the text entry is shown as the next item. */
export const PreConditionShowsItem: StoryObj = {
  render: () => render('/assets/qti-test-package/assessment-linear-precondition.xml'),
  play: async ({ canvasElement }) => {
    const skipped = collectSkipped(canvasElement);
    const next = await answerFirstItem(canvasElement, WRONG);
    next.click();

    await waitFor(() => expect(activeItemRef(canvasElement)).toBe('ITM-text_entry'));
    expect(skipped).toEqual([]);
  }
};

/**
 * Test: `ITM-choice` (branch rule → `ITM-extended_text` when SCORE is 1) → `ITM-text_entry` → `ITM-extended_text`.
 *
 * A right answer makes the branch rule fire after the first item and the test jumps over the second.
 */
export const BranchRuleJumpsToItem: StoryObj = {
  render: () => render('/assets/qti-test-package/assessment-linear-branch-rule.xml'),
  play: async ({ canvasElement }) => {
    const skipped = collectSkipped(canvasElement);
    const next = await answerFirstItem(canvasElement, CORRECT);
    next.click();

    await waitFor(() => expect(activeItemRef(canvasElement)).toBe('ITM-extended_text'));
    // announced once the jump went through, which can be a moment after the item changes
    await waitFor(() => expect(skipped).toEqual(['ITM-text_entry']));
  }
};

/** Same test, wrong answer: the rule is false, nothing branches and the test simply goes on to the next item. */
export const BranchRuleDoesNotFire: StoryObj = {
  render: () => render('/assets/qti-test-package/assessment-linear-branch-rule.xml'),
  play: async ({ canvasElement }) => {
    const skipped = collectSkipped(canvasElement);
    const next = await answerFirstItem(canvasElement, WRONG);
    next.click();

    await waitFor(() => expect(activeItemRef(canvasElement)).toBe('ITM-text_entry'));
    expect(skipped).toEqual([]);
  }
};

/**
 * Test: `ITM-choice` (branch rule → `EXIT_TEST` when SCORE is 1) → `ITM-text_entry`.
 *
 * A right answer ends the test: the test stays on the current item and announces
 * `cito-test-end-reached`, which is where a host shows its result screen.
 */
export const BranchRuleExitsTest: StoryObj = {
  render: () => render('/assets/qti-test-package/assessment-linear-exit-test.xml'),
  play: async ({ canvasElement }) => {
    let ended = false;
    canvasElement.addEventListener('cito-test-end-reached', () => (ended = true));
    const skipped = collectSkipped(canvasElement);

    const next = await answerFirstItem(canvasElement, CORRECT);
    next.click();

    await waitFor(() => expect(ended).toBe(true));
    // announced once the jump went through, which can be a moment after the item changes
    await waitFor(() => expect(skipped).toEqual(['ITM-text_entry']));
    expect(activeItemRef(canvasElement)).toBe('ITM-choice');
  }
};
