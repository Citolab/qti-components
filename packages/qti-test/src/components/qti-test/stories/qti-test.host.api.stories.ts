import { html, render } from 'lit';
import { expect, fn, waitFor, within } from 'storybook/test';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../../tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTest } from '../qti-test';
import type { QtiTestState } from '../../../types/qti-test-state';

/**
 * The host tier of the public API (`plans/public-api.md`): what a page embedding a `<qti-test>`
 * calls and listens to, exercised through nothing else. A host that depends on one of these
 * members should break a story here, not in production.
 *
 * Persistence (`state`, `qti-state-changed`) has its own story: Persist and restore.
 */
const meta: Meta = {
  title: 'qti-test/Host API',
  component: 'qti-test'
};
export default meta;

const ITEM_1 = 'T1 - Test Entry - Item 1';
const ITEM_2 = 'T1 - Choice Interaction - Multiple Cardinality';
const ITEM_3 = 'T1 - Text Entry Interaction';

const STIMULUS_TEST = '/assets/qti-test-package-stimulus/assessment.xml';

const testMarkup = (
  navigate: 'item' | 'section' = 'item',
  testUrl = '/assets/qti-conformance/Basic/T4-T7/assessment.xml'
) => html`
  <qti-test navigate=${navigate}>
    <test-navigation>
      <test-container test-url=${testUrl}></test-container>
      <test-prev>Previous</test-prev>
      <test-next>Next</test-next>
    </test-navigation>
  </qti-test>
`;

const hostOf = (canvasElement: HTMLElement) => within(canvasElement).getByTestId('host');
const testOf = (canvasElement: HTMLElement) => hostOf(canvasElement).querySelector<QtiTest>('qti-test');

const loadedItem = (canvasElement: HTMLElement, title: string) =>
  waitFor(
    async () => {
      const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, title);
      if (!item) throw new Error(`${title} is not loaded yet`);
      return item;
    },
    { timeout: 15000 }
  );

const loadedTitles = async (canvasElement: HTMLElement) =>
  (await getAssessmentItemsFromTestContainer(canvasElement)).map(i => i.dataset.title);

/** `navigateTo('item', id)` loads that item; without an id it stays on the current one. */
export const NavigateToItem: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host">${testMarkup('item')}</div>`,
  play: async ({ canvasElement, step }) => {
    const test = testOf(canvasElement);
    await loadedItem(canvasElement, ITEM_1);

    await step('to an item by its item-ref identifier', async () => {
      test.navigateTo('item', 't1-test-entry-item3');
      await loadedItem(canvasElement, ITEM_3);
      expect(await loadedTitles(canvasElement)).toEqual([ITEM_3]);
    });

    await step('without an id, stays on the current item', async () => {
      test.navigateTo('item');
      await loadedItem(canvasElement, ITEM_3);
      expect(await loadedTitles(canvasElement)).toEqual([ITEM_3]);
    });
  }
};

/** With `navigate="section"` the unit is a section, and a section shows all of its items. */
export const NavigateToSection: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host">${testMarkup('section')}</div>`,
  play: async ({ canvasElement }) => {
    const test = testOf(canvasElement);
    await loadedItem(canvasElement, ITEM_1);

    test.navigateTo('section', 'assessmentSection-1');

    await waitFor(async () => expect(await loadedTitles(canvasElement)).toHaveLength(4));
    expect(await loadedTitles(canvasElement)).toEqual(expect.arrayContaining([ITEM_1, ITEM_2, ITEM_3]));
  }
};

/**
 * `navigateTo` is a thin wrapper over the `qti-request-navigation` event. Both Kennisnet and
 * CitoTestUit dispatch it themselves as a fallback, so the event is part of the contract.
 */
export const RequestNavigationEvent: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host">${testMarkup('item')}</div>`,
  play: async ({ canvasElement }) => {
    const test = testOf(canvasElement);
    await loadedItem(canvasElement, ITEM_1);

    test.dispatchEvent(
      new CustomEvent('qti-request-navigation', {
        detail: { type: 'item', id: 't1-test-entry-item2' },
        bubbles: true,
        composed: true
      })
    );

    await loadedItem(canvasElement, ITEM_2);
    expect(await loadedTitles(canvasElement)).toEqual([ITEM_2]);
  }
};

/**
 * The lifecycle events a host waits for before it restores or measures anything. They bubble and
 * are composed, so one listener on `qti-test` hears all of them. The test document loads once, so
 * the listeners go on before the element is attached.
 */
export const LifecycleEvents: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host"></div>`,
  play: async ({ canvasElement }) => {
    const names = [
      'qti-assessment-test-connected',
      'qti-assessment-item-ref-connected',
      'qti-assessment-item-connected',
      'qti-test-loaded'
    ];
    const seen = Object.fromEntries(names.map(name => [name, fn()]));

    const container = document.createElement('div');
    render(testMarkup('item'), container);
    const test = container.querySelector<QtiTest>('qti-test');
    for (const name of names) test.addEventListener(name, seen[name]);
    hostOf(canvasElement).append(container);

    await loadedItem(canvasElement, ITEM_1);
    await waitFor(() => names.forEach(name => expect(seen[name]).toHaveBeenCalled()));

    // The test is announced before the item that opens it.
    const order = names.map(name => seen[name].mock.invocationCallOrder[0]);
    expect(order[0]).toBeLessThan(order[2]);

    // `qti-assessment-item-connected` carries the item element itself.
    const [connected] = seen['qti-assessment-item-connected'].mock.calls[0] as [CustomEvent];
    expect(connected.detail.identifier).toBe('t1-test-entry-item1');

    // `qti-test-loaded` lists the items that were just loaded: here the one that opens the test.
    const [loaded] = seen['qti-test-loaded'].mock.calls[0] as [CustomEvent<{ identifier: string }[]>];
    expect(loaded.detail.map(i => i.identifier)).toEqual(['t1-test-entry-item1']);
  }
};

/** A candidate's input arrives as `qti-interaction-changed`, naming the item and the response. */
export const InteractionChangedEvent: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host">${testMarkup('item')}</div>`,
  play: async ({ canvasElement }) => {
    const test = testOf(canvasElement);
    const changed = fn();
    test.addEventListener('qti-interaction-changed', changed);

    const item = await loadedItem(canvasElement, ITEM_1);
    within(item).getByText('Correct').click();

    await waitFor(() => expect(changed).toHaveBeenCalled());
    const [event] = changed.mock.calls.at(-1) as [CustomEvent];
    expect(event.detail).toMatchObject({ responseIdentifier: 'RESPONSE', response: 'correct' });
  }
};

/**
 * `updateItemVariables` is how a host writes a value it computed elsewhere, such as a score from a
 * backend, into the session. It reaches the state (so it is saved) and survives navigation.
 */
export const UpdateItemVariables: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host">${testMarkup('item')}</div>`,
  play: async ({ canvasElement }) => {
    const test = testOf(canvasElement);
    const saved = fn();
    test.addEventListener('qti-state-changed', (e: Event) => saved((e as CustomEvent<QtiTestState>).detail));
    await loadedItem(canvasElement, ITEM_1);

    test.updateItemVariables('t1-test-entry-item1', [{ identifier: 'SCORE', value: '1' }]);

    await waitFor(() => {
      const state = saved.mock.calls.at(-1)?.[0] as QtiTestState;
      expect(state.test.items.find(i => i.identifier === 't1-test-entry-item1')?.variables).toContainEqual(
        expect.objectContaining({ identifier: 'SCORE', value: '1' })
      );
    });
  }
};

/**
 * Deprecated, but both main hosts still depend on it, so it keeps firing until they have moved to
 * `qti-state-changed`. Remove this story together with the event.
 */
export const DeprecatedContextUpdatedEvent: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host">${testMarkup('item')}</div>`,
  play: async ({ canvasElement }) => {
    const test = testOf(canvasElement);
    const updated = fn();
    test.addEventListener('qti-test-context-updated', updated);

    const item = await loadedItem(canvasElement, ITEM_1);
    within(item).getByText('Correct').click();

    await waitFor(() => expect(updated).toHaveBeenCalled());
    const [event] = updated.mock.calls.at(-1) as [CustomEvent];
    // The payload is the live test context: what the hosts read their answers from today.
    expect(event.detail.items).toBeInstanceOf(Array);
  }
};

/** The text in the closed trigger of an inline choice: the prompt, until something is picked. */
const inlineChoicePrompt = (item: HTMLElement) =>
  item
    .querySelector('qti-inline-choice-interaction')
    ?.shadowRoot?.querySelector('[part~="value"]')
    ?.textContent?.trim();

/**
 * Mounts the stimulus test with `setup` applied before it attaches, and resolves once it has
 * loaded: navigating earlier is ignored, because there is no test document to navigate in yet.
 */
const mountStimulusTest = async (
  canvasElement: HTMLElement,
  setup: (parts: { test: QtiTest; navigation: HTMLElement & { qtiContext: any } }) => void
) => {
  const host = hostOf(canvasElement);
  host.replaceChildren();
  const container = document.createElement('div');
  render(testMarkup('item', STIMULUS_TEST), container);
  const test = container.querySelector<QtiTest>('qti-test');
  setup({ test, navigation: container.querySelector('test-navigation') });
  const loaded = new Promise(resolve => test.addEventListener('qti-test-loaded', resolve, { once: true }));
  host.append(container);
  await loaded;
  return test;
};

/**
 * `configContext` on `qti-test` reaches the interactions inside the items it loads, through the
 * `test-container`'s shadow root. Both hosts set options this way (`inlineChoicePrompt`,
 * `validationDisplayMode`, `correctResponseMode`, ...). What each option does is covered in the
 * interaction's own stories; this one pins that the test hands it down.
 */
export const ConfigContext: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host"></div>`,
  play: async ({ canvasElement }) => {
    const test = await mountStimulusTest(canvasElement, ({ test }) => {
      test.configContext = { inlineChoicePrompt: 'Pick a house' };
    });
    test.navigateTo('item', 'ITM-inline_choice');

    const item = await loadedItem(canvasElement, 'Richard III (Take 2)');
    await waitFor(() => expect(inlineChoicePrompt(item)).toBe('Pick a house'));
  }
};

const choiceLabels = (item: HTMLElement) =>
  [...item.querySelectorAll('qti-simple-choice')].map(c => c.textContent.trim());

/** Mounts a fresh test whose session carries `seed`, and returns the order a shuffled item shows. */
const shuffledOrder = async (canvasElement: HTMLElement, seed: string) => {
  const test = await mountStimulusTest(canvasElement, ({ navigation }) => {
    navigation.qtiContext = { QTI_CONTEXT: { ...navigation.qtiContext.QTI_CONTEXT, seed } };
  });
  test.navigateTo('item', 'ITM-choice_multiple');
  return choiceLabels(await loadedItem(canvasElement, 'Composition of Water'));
};

/**
 * The seed a host writes to `test-navigation.qtiContext` decides how choices are shuffled, so a
 * resumed session shows the same order. CitoTestUit generates one per session on its backend and
 * depends on exactly this. Phase 3 adds a provider on `qti-test`; this must keep working.
 */
export const SeedFixesTheShuffle: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`<div data-testid="host"></div>`,
  play: async ({ canvasElement }) => {
    const first = await shuffledOrder(canvasElement, 'session-one');
    const again = await shuffledOrder(canvasElement, 'session-one');
    const other = await shuffledOrder(canvasElement, 'session-two');

    expect(first).toHaveLength(6);
    expect(again).toEqual(first);
    expect(other).not.toEqual(first);
    expect([...other].sort()).toEqual([...first].sort());
  }
};
