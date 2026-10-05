import { html, render } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../../tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTest } from '../qti-test';
import type { QtiTestState } from '../../../types/qti-test-state';

/**
 * The persistence contract, exercised the way a host uses it and through nothing else: listen to
 * `qti-state-changed` to save, assign `state` to resume. See the Persist & restore docs page.
 */
const meta: Meta = {
  title: 'qti-test/Persist and restore',
  component: 'qti-test'
};
export default meta;

const ITEM_1 = 'T1 - Test Entry - Item 1';
const ITEM_2 = 'T1 - Choice Interaction - Multiple Cardinality';

const qtiTest = () => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
      <test-prev>Previous</test-prev>
      <test-next>Next</test-next>
    </test-navigation>
  </qti-test>
`;

const loadedItem = (canvasElement: HTMLElement, title: string) =>
  waitFor(async () => {
    const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, title);
    if (!item) throw new Error(`${title} is not loaded yet`);
    return item;
  });

export const PersistAndRestore: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host">${qtiTest()}</div>`,
  play: async ({ canvasElement, step }) => {
    const host = within(canvasElement).getByTestId('host');
    let stored = '';

    await step('Save: the candidate answers and moves on', async () => {
      const test = host.querySelector<QtiTest>('qti-test');
      test.addEventListener('qti-state-changed', e => (stored = JSON.stringify(e.detail)));

      const item = await loadedItem(canvasElement, ITEM_1);
      within(item).getByText('Correct').click();
      within(host).getByText('Next').click();

      await waitFor(() => {
        const saved = JSON.parse(stored) as QtiTestState;
        expect(saved.session.navItemRefId).toBe('t1-test-entry-item2');
        expect(saved.test.items.find(i => i.identifier === 't1-test-entry-item1')?.variables).toContainEqual(
          expect.objectContaining({ identifier: 'RESPONSE', value: 'correct' })
        );
      });
    });

    await step('Resume: a fresh test is given the stored state before it loads', async () => {
      host.replaceChildren();
      const container = document.createElement('div');
      render(qtiTest(), container);
      container.querySelector<QtiTest>('qti-test').state = JSON.parse(stored);
      host.append(container);

      // It opens where the candidate left off, not at the first item.
      await loadedItem(canvasElement, ITEM_2);
      const titles = (await getAssessmentItemsFromTestContainer(canvasElement)).map(i => i.dataset.title);
      expect(titles).toEqual([ITEM_2]);

      // And the earlier answer is still there.
      within(host).getByText('Previous').click();
      const item = await loadedItem(canvasElement, ITEM_1);
      await waitFor(() => expect(within(item).getByText('Correct').matches(':state(checked)')).toBe(true));
    });
  }
};
