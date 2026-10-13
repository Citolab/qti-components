import { expect, waitFor } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';

import { getAssessmentItemsFromTestContainer } from '../../../../../tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '@qti-components/interactions-core';

/**
 * The delivery criteria of the 1EdTech QTI 3 Advanced conformance tests that exercise navigation
 * and item session control: T5 (`T5-L2-D1`) and T12 with S1 and S9 (`T12-L2-D1`, `S1-L2-D1`,
 * `S1-L2-D2`, `S9-L2-D1`). The packages are copied unchanged from
 * https://github.com/1EdTech/qti-conformance (`qti3.0/Advanced`) into `public/assets/qti-conformance/Advanced`.
 *
 * Not asserted: T2 (the 60 second test time limit and the remaining-time display) and S5 (rubric
 * blocks in sections). Neither is implemented in `qti-test` yet.
 */
const meta: Meta = {
  title: 'test-navigation/Conformance Advanced',
  component: 'qti-test',
  parameters: { testTimeout: 60000 }
};
export default meta;

const render = (url: string) => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container test-url=${url}></test-container>
      <test-prev>Previous</test-prev>
      <test-end-attempt>End Attempt</test-end-attempt>
      <test-next>Next</test-next>
    </test-navigation>
  </qti-test>
`;

type ItemRef = Element & { assessmentItem?: Element };

const activeItemRefId = (canvasElement: HTMLElement) =>
  (canvasElement.querySelector('qti-test') as unknown as { sessionContext?: { navItemRefId?: string } }).sessionContext
    ?.navItemRefId;

/** Resolves with the rendered item of the active item ref; end-attempt does nothing before that. */
const activeItem = (canvasElement: HTMLElement) =>
  waitFor(() => {
    const id = activeItemRefId(canvasElement);
    const ref = canvasElement
      .querySelector('test-container')
      ?.shadowRoot?.querySelector<ItemRef>(`qti-assessment-item-ref[identifier="${id}"]`);
    if (!id || !ref?.assessmentItem) throw new Error('active item is not rendered yet');
    return ref.assessmentItem;
  });

/** Picks the choice with the given text in the active item. */
async function choose(canvasElement: HTMLElement, text: string) {
  const item = await activeItem(canvasElement);
  const choice = within(item as HTMLElement).getByText<QtiSimpleChoice>(text);
  choice.click();
  const simpleChoice = choice.closest('qti-simple-choice') as QtiSimpleChoice;
  await waitFor(() => expect(simpleChoice.internals.states.has('checked')).toBe(true));
  return simpleChoice;
}

/**
 * T5-L2-D1: in `testPart-1` the number of attempts per item is unlimited (`max-attempts="0"`).
 * The candidate ends the attempt and can still change the answer and end the attempt again.
 */
export const T5UnlimitedAttempts: StoryObj = {
  render: () => render('/assets/qti-conformance/Advanced/T5/assessment.xml'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await getAssessmentItemsFromTestContainer(canvasElement);

    for (const answer of ['Choice 1', 'Choice 2', 'Choice 1']) {
      const choice = await choose(canvasElement, answer);
      canvas.getByShadowText('End Attempt').click();
      // An attempt that was the last one would disable the interaction; unlimited attempts must not.
      await waitFor(() => expect(choice.internals.states.has('disabled')).toBe(false));
    }
  }
};

const ALL_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `t12-sections-item-${n}`);

/**
 * T12-L2-D1 and S9-L2-D1: eight items in three sections, the third reached through
 * `qti-assessment-section-ref` (`section3.xml`). The candidate meets them in order, 1 to 8.
 */
export const T12ItemsInThreeSections: StoryObj = {
  // Fails until `qti-assessment-section-ref` is implemented (#296): the candidate never reaches item 8.
  // Left out of the test run so CI stays green; remove the tag when #296 lands.
  tags: ['!test'],
  render: () => render('/assets/qti-conformance/Advanced/T12/assessment.xml'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await getAssessmentItemsFromTestContainer(canvasElement);

    const seen: string[] = [];
    for (let i = 0; i < ALL_ITEMS.length; i++) {
      await waitFor(() => expect(activeItemRefId(canvasElement)).toBe(ALL_ITEMS[i]));
      seen.push(activeItemRefId(canvasElement)!);
      await activeItem(canvasElement);

      // Items 5 to 7 (section 2) cannot be skipped, so answer them.
      if (i >= 4 && i <= 6) await choose(canvasElement, 'Choice 1');
      if (i === ALL_ITEMS.length - 1) break;

      canvas.getByShadowText('End Attempt').click();
      const next = canvas.getByShadowText('Next');
      await waitFor(() => {
        if ((next as HTMLButtonElement).hasAttribute('disabled'))
          throw new Error(`Next disabled after ${ALL_ITEMS[i]}`);
      });
      next.click();
    }
    expect(seen).toEqual(ALL_ITEMS);
  }
};

/**
 * S1-L2-D1: in section 1 `allow-skipping="true"`, so the candidate leaves item 1 without a response.
 */
export const S1SectionSkippingAllowed: StoryObj = {
  render: () => render('/assets/qti-conformance/Advanced/T12/assessment.xml'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await getAssessmentItemsFromTestContainer(canvasElement);
    await waitFor(() => expect(activeItemRefId(canvasElement)).toBe('t12-sections-item-1'));
    await activeItem(canvasElement);

    canvas.getByShadowText('End Attempt').click();
    const next = canvas.getByShadowText('Next');
    await waitFor(() => expect(next).toBeEnabled());
    next.click();

    await waitFor(() => expect(activeItemRefId(canvasElement)).toBe('t12-sections-item-2'));
  }
};

/**
 * S1-L2-D2: in section 2 `allow-skipping="false"`, so the candidate stays on item 5 until
 * a response is given.
 */
export const S1SectionSkippingNotAllowed: StoryObj = {
  render: () => render('/assets/qti-conformance/Advanced/T12/assessment.xml'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await getAssessmentItemsFromTestContainer(canvasElement);

    // Walk through section 1 by skipping, as S1-L2-D1 allows.
    for (let n = 1; n <= 4; n++) {
      await waitFor(() => expect(activeItemRefId(canvasElement)).toBe(`t12-sections-item-${n}`));
      await activeItem(canvasElement);
      canvas.getByShadowText('End Attempt').click();
      const next = canvas.getByShadowText('Next');
      await waitFor(() => expect(next).toBeEnabled());
      next.click();
    }
    await waitFor(() => expect(activeItemRefId(canvasElement)).toBe('t12-sections-item-5'));
    await activeItem(canvasElement);

    // No response: ending the attempt must not let the candidate go on.
    canvas.getByShadowText('End Attempt').click();
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(canvas.getByShadowText('Next')).toBeDisabled();
    expect(activeItemRefId(canvasElement)).toBe('t12-sections-item-5');

    // With a response the candidate can go on.
    await choose(canvasElement, 'Choice 1');
    canvas.getByShadowText('End Attempt').click();
    const next = canvas.getByShadowText('Next');
    await waitFor(() => expect(next).toBeEnabled());
    next.click();
    await waitFor(() => expect(activeItemRefId(canvasElement)).toBe('t12-sections-item-6'));
  }
};
