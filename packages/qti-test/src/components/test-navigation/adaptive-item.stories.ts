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
 * An adaptive item (`adaptive="true"`) in a linear test part with `max-attempts="1"`.
 *
 * max-attempts does not apply to adaptive items: the item ends itself by setting `completionStatus`
 * to `completed` in its response processing. Until then Next stays locked and End Attempt stays
 * available; after that it is the other way round. The item (`items/adaptive.xml`) completes on a
 * right answer, or after one hint and a second attempt.
 */
const meta: Meta = {
  title: 'test-navigation/Adaptive Item',
  component: 'qti-test',
  parameters: { testTimeout: 30000 }
};
export default meta;

const CORRECT = 'You must stay with your luggage at all times.';
const WRONG = 'Do not let someone else look after your luggage.';

const render = () => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container test-url="/assets/qti-test-package/assessment-linear-adaptive.xml"></test-container>
      <test-end-attempt>End Attempt</test-end-attempt>
      <test-next>Next</test-next>
    </test-navigation>
  </qti-test>
`;

async function choose(canvasElement: HTMLElement, answer: string) {
  await getAssessmentItemsFromTestContainer(canvasElement);
  const item = await waitFor(async () =>
    getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Adaptive Luggage')
  );
  const choice = within(item.querySelector<QtiChoiceInteraction>('qti-choice-interaction')!).getByText<QtiSimpleChoice>(
    answer
  );
  choice.click();
  const simpleChoice = choice.closest('qti-simple-choice') as QtiSimpleChoice;
  await waitFor(() => expect(simpleChoice.internals.states.has('checked')).toBe(true));
}

/** The number of attempts the test context records for the adaptive item. */
const numAttempts = (canvasElement: HTMLElement) =>
  Number(
    (
      canvasElement.querySelector('qti-test') as unknown as {
        testContext?: { items: { identifier: string; variables: { identifier: string; value: unknown }[] }[] };
      }
    ).testContext?.items
      .find(i => i.identifier === 'ITM-adaptive')
      ?.variables.find(v => v.identifier === 'numAttempts')?.value
  ) || 0;

/** Wrong first: the item is not done after attempt 1, even though max-attempts is 1. */
export const NotDoneUntilCompleted: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const endAttempt = canvas.getByShadowText('End Attempt');
    const next = canvas.getByShadowText('Next');

    await choose(canvasElement, WRONG);
    endAttempt.click();
    await waitFor(() => expect(numAttempts(canvasElement)).toBe(1));
    expect(next).toBeDisabled();
    expect(endAttempt).toBeEnabled();

    // second attempt: the item sets completionStatus = completed
    endAttempt.click();
    await waitFor(() => expect(next).toBeEnabled());
    expect(endAttempt).toBeDisabled();
  }
};

/** Right first: the item completes on attempt 1. */
export const DoneOnCompleted: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const endAttempt = canvas.getByShadowText('End Attempt');
    const next = canvas.getByShadowText('Next');

    await choose(canvasElement, CORRECT);
    endAttempt.click();
    await waitFor(() => expect(next).toBeEnabled());
    expect(endAttempt).toBeDisabled();
  }
};
