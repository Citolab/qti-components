import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { candidateIn } from '../../conformance-candidate';
import { WITH_REPLACEMENT_TEST } from './selection.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTest } from '@qti-components/test';

/**
 * `qti-selection with-replacement="true"`, which the 1EdTech suite does not cover, checked against
 * the QTI 3 implementation guide §4.5.1: an item may be selected more than once, "no items should be
 * cloned until all subsections and items have been included at least once", and "clones of items
 * become instances of the original item". The info model (§5.98) asks for each instance to be told
 * apart in results, by its sequence number.
 *
 * Here a section selects 3 of its 2 items. With the seed `with-replacement` the luggage question
 * (`ITM-choice`) comes twice: the second time as its clone `ITM-choice#2`, an item session of its
 * own (decided 2026-11-27, `plans/host-api.md` → Decided).
 */
const meta: Meta = {
  title: 'QTI behaviour/Selection with replacement',
  tags: ['!autodocs', 'qti-spec'],
  render: () => html`
    <qti-test navigate="item" .qtiContext=${{ QTI_CONTEXT: { seed: 'with-replacement' } }}>
      <test-navigation>
        <test-container test-url=${WITH_REPLACEMENT_TEST}></test-container>
        <test-prev>Previous</test-prev>
        <test-next>Next</test-next>
      </test-navigation>
    </qti-test>
  `
};
export default meta;

type Story = StoryObj;

const STAY = 'You must stay with your luggage at all times.';
const LOOK_AFTER = 'Do not let someone else look after your luggage.';

/** Waits until the luggage question is on screen: its first choice is visible. */
const seesLuggageQuestion = (canvasElement: HTMLElement) =>
  waitFor(
    async () => {
      const choices = await within(canvasElement).findAllByShadowText(STAY);
      expect(choices.some(choice => choice.checkVisibility())).toBe(true);
    },
    { timeout: 15000 }
  );

/** What the stored state holds as the response of one item instance. */
const storedResponse = (qtiTest: QtiTest, instance: string) =>
  qtiTest.state.test.items
    .find(item => item.identifier === instance)
    ?.variables.find(variable => variable.identifier === 'RESPONSE')?.value ?? null;

export const AnItemSelectedTwiceIsTwoItemSessions: Story = {
  parameters: { testTimeout: 60000 },
  play: async ({ canvasElement, step }) => {
    const candidate = candidateIn(canvasElement);

    await step('The test presents 3 items from 2: each once, then the luggage question again', async () => {
      await seesLuggageQuestion(canvasElement);
      expect(candidate.test().testContext.items.map(item => item.identifier)).toEqual([
        'ITM-choice',
        'ITM-choice#2',
        'ITM-text'
      ]);
    });

    await step(`Candidate answers the luggage question: "${STAY}"`, async () => {
      await candidate.choose(STAY);
      await waitFor(() => expect(storedResponse(candidate.test(), 'ITM-choice')).toBe('ChoiceA'));
    });

    await step('Next shows the luggage question again, as its clone, unanswered', async () => {
      await candidate.press('Next');
      await waitFor(() => expect(candidate.itemRef()).toBe('ITM-choice#2'));
      await seesLuggageQuestion(canvasElement);
      expect(storedResponse(candidate.test(), 'ITM-choice#2')).toBeNull();
    });

    await step(`Candidate answers the clone: "${LOOK_AFTER}"; the first answer stays`, async () => {
      await candidate.choose(LOOK_AFTER);
      await waitFor(() => expect(storedResponse(candidate.test(), 'ITM-choice#2')).toBe('ChoiceB'));
      expect(storedResponse(candidate.test(), 'ITM-choice')).toBe('ChoiceA');
    });

    await step('Previous goes back to the first instance, with its own answer', async () => {
      await candidate.press('Previous');
      await waitFor(() => expect(candidate.itemRef()).toBe('ITM-choice'));
      await seesLuggageQuestion(canvasElement);
      expect(storedResponse(candidate.test(), 'ITM-choice')).toBe('ChoiceA');
    });
  }
};
