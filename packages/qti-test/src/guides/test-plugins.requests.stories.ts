import { html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { state } from 'lit/decorators.js';
import { expect, fn, waitFor, within } from 'storybook/test';

import { computedContext } from '@qti-components/base';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../tools/testing/test-utils';

import type { ComputedContext } from '@qti-components/base';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTest } from '../components/qti-test/qti-test';
import type { QtiTestState } from '../types/qti-test-state';

/**
 * The requests of the public test plugin API, pinned the way a plugin uses them: dispatched from
 * an element inside `<test-navigation>` with `bubbles: true, composed: true`, by their `qc-`
 * name, and nothing else. The plugin below imports no test code, so a renamed event, a changed
 * `detail` or a handler that moved to another element fails the matching story here.
 *
 * `computedContext` is pinned by the "Test plugins" story; `qc-test-update-plugin-state` by
 * `test-bookmark`.
 */
const meta: Meta = {
  title: 'Extending QTI/Creating a plugin/Requests',
  parameters: { layout: 'padded', testTimeout: 60000 }
};
export default meta;

type Story = StoryObj;

const ITEM_1 = 'T1 - Test Entry - Item 1';
const ITEM_1_ID = 't1-test-entry-item1';
const ITEM_2 = 'T1 - Choice Interaction - Multiple Cardinality';
const ITEM_2_ID = 't1-test-entry-item2';

/** Shows what the plugin can read: the view the test is in. */
class RequestProbe extends LitElement {
  @state()
  @consume({ context: computedContext, subscribe: true })
  computed?: ComputedContext;

  override render() {
    return html`<output>${this.computed?.view ?? ''}</output>`;
  }
}
if (!customElements.get('request-probe')) customElements.define('request-probe', RequestProbe);

const testMarkup = () => html`
  <div data-testid="host">
    <qti-test navigate="item">
      <test-navigation>
        <request-probe></request-probe>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
      </test-navigation>
    </qti-test>
  </div>
`;

const hostOf = (canvasElement: HTMLElement) => within(canvasElement).getByTestId('host');
const testOf = (canvasElement: HTMLElement) => hostOf(canvasElement).querySelector<QtiTest>('qti-test')!;

/** Where a plugin sits: inside `<test-navigation>`. */
const pluginOf = (canvasElement: HTMLElement) => hostOf(canvasElement).querySelector('request-probe')!;

const request = (from: Element, name: string, detail?: unknown) =>
  from.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));

const loadedItem = (canvasElement: HTMLElement, title: string) =>
  waitFor(
    async () => {
      const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, title);
      if (!item) throw new Error(`${title} is not loaded yet`);
      return item;
    },
    { timeout: 15000 }
  );

const variable = (saved: ReturnType<typeof fn>, itemId: string, identifier: string) =>
  (saved.mock.calls.at(-1)?.[0] as QtiTestState | undefined)?.test.items
    .find(i => i.identifier === itemId)
    ?.variables.find(v => v.identifier === identifier)?.value;

/** `detail: { type, id }` shows that item or section, as `test-next` and `test-item-link` do. */
export const Navigate: Story = {
  render: testMarkup,
  play: async ({ canvasElement }) => {
    await loadedItem(canvasElement, ITEM_1);

    request(pluginOf(canvasElement), 'qc-test-navigate', { type: 'item', id: ITEM_2_ID });

    await loadedItem(canvasElement, ITEM_2);
  }
};

/** No `detail`: the item on screen is scored, as `test-end-attempt` does. */
export const EndAttempt: Story = {
  render: testMarkup,
  play: async ({ canvasElement }) => {
    const saved = fn();
    testOf(canvasElement).addEventListener('qc-test-state-changed', e => saved(e.detail));
    const item = await loadedItem(canvasElement, ITEM_1);
    within(item).getByText('Correct').click();
    expect(variable(saved, ITEM_1_ID, 'SCORE')).not.toBe(1);

    request(pluginOf(canvasElement), 'qc-test-end-attempt');

    await waitFor(() => expect(Number(variable(saved, ITEM_1_ID, 'SCORE'))).toBe(1));
  }
};

/** `{ assessmentItemRefId, outcomeVariableId, value }` writes an outcome of that item into the session. */
export const UpdateOutcome: Story = {
  render: testMarkup,
  play: async ({ canvasElement }) => {
    const saved = fn();
    testOf(canvasElement).addEventListener('qc-test-state-changed', e => saved(e.detail));
    await loadedItem(canvasElement, ITEM_1);

    request(pluginOf(canvasElement), 'qc-test-update-outcome', {
      assessmentItemRefId: ITEM_1_ID,
      outcomeVariableId: 'SCORE',
      value: 7
    });

    await waitFor(() => expect(Number(variable(saved, ITEM_1_ID, 'SCORE'))).toBe(7));
  }
};

/** The `View` as `detail` switches the session view, and `computedContext.view` follows. */
export const SwitchView: Story = {
  render: testMarkup,
  play: async ({ canvasElement }) => {
    await loadedItem(canvasElement, ITEM_1);
    const view = () => pluginOf(canvasElement).shadowRoot?.querySelector('output')?.textContent;
    await waitFor(() => expect(view()).toBe('candidate'));

    request(pluginOf(canvasElement), 'qc-test-switch-view', 'scorer');

    await waitFor(() => expect(view()).toBe('scorer'));
  }
};
