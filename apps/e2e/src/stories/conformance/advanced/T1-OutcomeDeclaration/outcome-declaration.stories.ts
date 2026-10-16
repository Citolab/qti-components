import { html } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../../../../tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * The suite's "T1 - Outcome Declaration & T9 - Outcome Processing for Tests" sample (Advanced profile): a
 * linear test of three choice items with a test-level `SCORE_TOTAL` (float, default 0) and outcome
 * processing that sums the items' `SCORE`. Both stories are written from the criterion text alone.
 */
const meta: Meta = {
  title: 'qti-conformance/advanced/T1 - Outcome Declaration and T9 - Outcome Processing',
  parameters: { controls: { disable: true }, testTimeout: 60000 }
};
export default meta;

const TEST_URL = '/assets/qti-conformance/Advanced/T1/assessment.xml';
const ITEM = (n: number) => `T1 - Outcome Declaration - Item ${n}`;

/** The `qti-test` of the story: what a host holds to read the test's outcomes. */
type TestElement = HTMLElement & { getOutcome(id: string): { value: unknown; baseType?: string } | undefined };

const render = () => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container test-url=${TEST_URL}></test-container>
      <test-end-attempt>End Attempt</test-end-attempt>
      <test-next>Next</test-next>
      <test-submit>Submit</test-submit>
    </test-navigation>
  </qti-test>
`;

const loadedItem = (canvasElement: HTMLElement, n: number) =>
  waitFor(
    async () => {
      const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, ITEM(n));
      if (!item) throw new Error(`${ITEM(n)} is not loaded yet`);
      return item;
    },
    { timeout: 15000 }
  );

/**
 * T1-L2-D1: The variable value bound to the SCORE_TOTAL is by default, initialized to 0, where
 * base-type="float".
 */
export const T1_L2_D1: Story = {
  name: 'T1-L2-D1',
  render,
  play: async ({ canvasElement }) => {
    await loadedItem(canvasElement, 1);
    const test = canvasElement.querySelector('qti-test') as TestElement;

    // Nothing has been answered and no outcome processing has run: this is the declared default.
    const scoreTotal = test.getOutcome('SCORE_TOTAL');
    expect(scoreTotal, 'SCORE_TOTAL is declared on the test').toBeTruthy();
    expect(scoreTotal!.baseType).toBe('float');
    expect(Number(scoreTotal!.value)).toBe(0);
  }
};

/**
 * T9-L2-D1: While taking the test, the variable value bound to the SCORE_TOTAL Outcome Declaration remains
 * strictly equal to the amount of correctly responded AssessmentItems amongst the AssessmentTest.
 *
 * The candidate answers the first two items correctly, ending the attempt and moving on after each (the
 * test is linear with individual submission, so Next only unlocks once the attempt has ended), then presses
 * Submit, which scores the test. Each submit starts from the declared default, so the total is the count of
 * correct items and does not accumulate over submits.
 */
export const T9_L2_D1: Story = {
  name: 'T9-L2-D1',
  render,
  play: async ({ canvasElement, step }) => {
    const test = canvasElement.querySelector('qti-test') as TestElement;
    const next = within(canvasElement).getByText('Next');
    const endAttempt = within(canvasElement).getByText('End Attempt');
    const submit = within(canvasElement).getByText('Submit');
    const scoreTotal = () => Number(test.getOutcome('SCORE_TOTAL')?.value);

    const answerCorrectlyAndMoveOn = async (n: number) => {
      within(await loadedItem(canvasElement, n))
        .getByText('Correct')
        .click();
      endAttempt.click();
      await waitFor(() => expect(next).toBeEnabled());
      next.click();
      await loadedItem(canvasElement, n + 1);
    };

    await step('item 1 answered correctly: SCORE_TOTAL is 1', async () => {
      await answerCorrectlyAndMoveOn(1);
      submit.click();
      await waitFor(() => expect(scoreTotal()).toBe(1), { timeout: 5000 });
    });

    await step('item 2 answered correctly: SCORE_TOTAL is 2', async () => {
      await answerCorrectlyAndMoveOn(2);
      submit.click();
      await waitFor(() => expect(scoreTotal()).toBe(2), { timeout: 5000 });
    });
  }
};
