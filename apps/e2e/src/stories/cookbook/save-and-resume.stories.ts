import { html } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../../tools/testing/test-utils';
import { stateHost } from './state-host';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTestState } from '@qti-components/test';

const ITEM_1 = 'T1 - Test Entry - Item 1';
const ITEM_2 = 'T1 - Choice Interaction - Multiple Cardinality';

const meta: Meta = {
  title: 'Implementation/Cookbook/All hosts/Save and resume a test',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Every host does this. The test fires \`cito-test-state-changed\` on every change and its
\`detail\` is the state: store it wherever you like. To resume, assign it to \`qtiTest.state\` and give the
test the same \`seed\` in \`qtiContext\`, then let it load.

\`\`\`js
test.addEventListener('cito-test-state-changed', e => save(candidateId, e.detail));

// after a reload
test.qtiContext = { QTI_CONTEXT: { testIdentifier, candidateIdentifier, environmentIdentifier: 'default', seed } };
test.state = await load(candidateId);
\`\`\`

Answer an item, go to the next one, then press **Restart from saved state**: a fresh test opens where
you left off and the answer is still there. Used by Kennisnet, CitoTestUit and PeilingLezen; see
\`plans/host-migration/\`.`
      }
    }
  }
};
export default meta;

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
    stateHost(html`
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
        <nav><test-prev>Previous</test-prev> <test-next>Next</test-next></nav>
      </test-navigation>
    `),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('The candidate answers and moves on', async () => {
      const item = await loadedItem(canvasElement, ITEM_1);
      within(item).getByText('Correct').click();
      canvas.getByText('Next').click();
      await waitFor(() => {
        const saved = JSON.parse(canvas.getByTestId('saved-state').textContent!) as QtiTestState;
        expect(saved.session.navItemRefId).toBe('t1-test-entry-item2');
      });
    });

    await step('A fresh test resumes from the saved state', async () => {
      canvas.getByText('Restart from saved state').click();
      await loadedItem(canvasElement, ITEM_2);

      canvas.getByText('Previous').click();
      const item = await loadedItem(canvasElement, ITEM_1);
      await waitFor(() => expect(within(item).getByText('Correct').matches(':state(checked)')).toBe(true));
    });
  }
};
