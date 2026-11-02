import { expect, waitFor, within } from 'storybook/test';

import '../.storybook/utilities.css';
import { stateHost } from '../apps/e2e/src/stories/cookbook/state-host';
import { GETTING_STARTED_TEST } from '../packages/qti-test/src/components/qti-test/getting-started.fixtures';
import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTestState } from '@qti-components/test';

/**
 * The demo on the "State" page (`state.mdx`), hidden from the sidebar (`!dev`): the page is the entry,
 * this story is its demo. It runs the Getting started test, like every docs demo.
 */
const meta: Meta = {
  title: 'Implementation/State',
  tags: ['!dev'],
  parameters: { controls: { disable: true } }
};
export default meta;

const ITEM_1 = 'Photosynthesis';
const ITEM_2 = 'Inside a leaf';

const loadedItem = (canvasElement: HTMLElement, title: string) =>
  waitFor(
    async () => {
      const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, title);
      if (!item) throw new Error(`${title} is not loaded yet`);
      return item;
    },
    { timeout: 15000 }
  );

/** Answer, move on, restart from what was saved: the test resumes where the candidate stopped. */
export const SaveAndResume: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () =>
    stateHost(`
      <test-navigation class="flex flex-col gap-2">
        <test-container class="block h-100 overflow-auto" test-url="${GETTING_STARTED_TEST}"></test-container>
        <nav class="flex justify-between">
          <test-prev>Previous</test-prev>
          <test-next>Next</test-next>
        </nav>
      </test-navigation>
    `),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('The candidate answers and moves on', async () => {
      const item = await loadedItem(canvasElement, ITEM_1);
      within(item).getByText('Light').click();
      canvas.getByText('Next').click();
      await waitFor(() => {
        const test = canvasElement.querySelector<HTMLElement & { state: QtiTestState }>('qti-test')!;
        expect(test.state.session.navItemRefId).toBe('GS-leaf');
      });
    });

    await step('A fresh test resumes from the saved state', async () => {
      canvas.getByText('Restart from saved state').click();
      await loadedItem(canvasElement, ITEM_2);
      // It opens where the candidate left off, with only that item on screen.
      const titles = (await getAssessmentItemsFromTestContainer(canvasElement))!.map(item => item.dataset.title);
      expect(titles).toEqual([ITEM_2]);

      canvas.getByText('Previous').click();
      const item = await loadedItem(canvasElement, ITEM_1);
      await waitFor(() => expect(within(item).getByText('Light').matches(':state(checked)')).toBe(true));
    });
  }
};
