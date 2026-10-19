import { html } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../tools/testing/test-utils';
import { stateHost } from './state-host';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'Implementation/Cookbook/CitoTestUit/Bookmarks that survive a reload',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `CitoTestUit used to keep bookmarks as \`marked\` on the context items. \`<test-bookmark>\` replaces
that: it is a toggle button for the item on screen, and the marks live in the state the host already
stores, under \`session.plugins.bookmarks\`.

\`\`\`html
<qti-test navigate="item">
  <test-navigation>
    <header><test-bookmark aria-label="Bookmark this item"></test-bookmark></header>
    <test-container test-url="assessment.xml"></test-container>
  </test-navigation>
</qti-test>
\`\`\`

Mark an item, move on, then press **Restart from saved state**: go back and the mark is still there.
There is nothing to save separately. See the Bookmark plugin story for the navigation with stars.`
      }
    }
  }
};
export default meta;

/** Mark the first item, move on, restart from the saved state: the mark comes back. */
export const BookmarksInState: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () =>
    stateHost(html`
      <test-navigation>
        <header><test-bookmark aria-label="Bookmark this item"></test-bookmark></header>
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        <nav><test-prev>Previous</test-prev> <test-next>Next</test-next></nav>
      </test-navigation>
    `),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const bookmark = () => canvasElement.querySelector('test-bookmark')!;

    await step('Mark the first item and move on', async () => {
      await waitFor(
        async () =>
          expect(await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info Start')).toBeTruthy(),
        { timeout: 15000 }
      );
      await waitFor(() => expect(bookmark()).not.toHaveAttribute('disabled'));
      bookmark().click();
      await waitFor(() => expect(bookmark()).toHaveAttribute('aria-pressed', 'true'));
      await waitFor(() => expect(canvas.getByTestId('saved-state').textContent).toContain('bookmarks'));

      canvas.getByText('Next').click();
      await waitFor(() => expect(bookmark()).toHaveAttribute('aria-pressed', 'false'));
    });

    await step('Restart from the saved state: the mark is still there', async () => {
      canvas.getByText('Restart from saved state').click();
      // The resumed test opens on the second item: wait until that item is on screen before going back.
      await waitFor(
        async () => {
          const items = await getAssessmentItemsFromTestContainer(canvasElement);
          if (items.length !== 1 || items[0].dataset.title === 'Info Start') throw new Error('not resumed yet');
        },
        { timeout: 15000 }
      );
      canvas.getByText('Previous').click();
      await waitFor(() => expect(bookmark()).toHaveAttribute('aria-pressed', 'true'), { timeout: 15000 });
    });
  }
};
