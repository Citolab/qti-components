import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

import { candidateIn } from '../../conformance-candidate';
import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * The suite's "T4 - Test Parts" sample (Elective), loaded unmodified from
 * `public/assets/qti-conformance/Elective/T4-test-parts/`. Its README calls it a QTI 2.2 sample, but
 * the file is QTI 3 (the `imsqtiasi_v3p0` namespace and schema). Two test parts: items 1-3 nonlinear,
 * items 4-6 linear, both individual. The criteria have no IDs; each story quotes the one it asserts.
 */
const meta: Meta = {
  title: 'Testing/Conformance/elective/T4 - Test Parts',
  parameters: { controls: { disable: true }, a11y: { test: 'off' } },
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Elective/T4-test-parts/test-parts.xml"></test-container>
        <test-prev>Previous</test-prev>
        <test-end-attempt>End attempt</test-end-attempt>
        <test-next>Next</test-next>
      </test-navigation>
    </qti-test>
  `
};
export default meta;

export const NavigationModePerTestPart: Story = {
  name: 'The navigation mode of each test part',
  parameters: {
    docs: {
      description: {
        story:
          'While the candidate is on Item 1, Item 2, or Item 3, non linear navigation mode is available (backward/forward navigation). While the candidate is on Item 4, Item 5, or Item 6, linear navigation mode is avaliable (forward navigation).'
      }
    },
    testTimeout: 60000
  },
  play: async ({ canvasElement, step }) => {
    const candidate = candidateIn(canvasElement);
    const failures: string[] = [];
    candidate.test().addEventListener('qc-test-navigation-failed', e => failures.push(e.detail.message));

    await step('Items 1-3 (nonlinear): the candidate jumps from item 1 to item 3', async () => {
      await candidate.sees('T4 - Test Parts - Item 1');
      candidate.test().navigateTo('item', 'item-3');
      await candidate.sees('T4 - Test Parts - Item 3');
    });

    await step('Items 1-3 (nonlinear): Previous goes back to item 2', async () => {
      await candidate.press('Previous');
      await candidate.sees('T4 - Test Parts - Item 2');
      expect(failures).toEqual([]);
    });

    await step('The candidate goes on to item 4, the first item of the linear part', async () => {
      candidate.test().navigateTo('item', 'item-4');
      await candidate.sees('T4 - Test Parts - Item 4');
    });

    await step(
      'Items 4-6 (linear): a jump from item 4 to item 6 is refused; the candidate stays on item 4',
      async () => {
        candidate.test().navigateTo('item', 'item-6');
        await waitFor(() => expect(failures).toHaveLength(1));
        expect(candidate.itemRef()).toBe('item-4');
      }
    );

    await step('Items 4-6 (linear): the candidate answers item 4 and goes forward with Next to item 5', async () => {
      await candidate.choose('Choice 1');
      await candidate.press('End attempt');
      await candidate.press('Next');
      await candidate.sees('T4 - Test Parts - Item 5');
    });

    await step('Items 4-6 (linear): on item 5, Previous is not available', async () => {
      await waitFor(async () => expect(await candidate.button('Previous')).toBeDisabled());
    });
  }
};

// todo: phase T7
export const LeavingTheNonlinearPart: Story = {
  name: 'Leaving the nonlinear part',
  tags: ['todo'],
  ...todo(
    'T4 (Elective)',
    'Test parts are taken in order: once the candidate moves from the nonlinear part (items 1-3) to the linear part (items 4-6), they cannot return. Today item-refs are one list across parts, and Next stops at the end of a part (roadmap 1, T7).',
    'qti3.0/Elective/T4 - Test Parts/README.md'
  )
};
