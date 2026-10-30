import { expect, userEvent, waitFor, within } from 'storybook/test';

import { mountWithCorrections } from '../apps/e2e/src/stories/corrections/mount-with-corrections';
import { GETTING_STARTED_TEST } from '../packages/qti-test/src/components/qti-test/getting-started.fixtures';
import drag from '../tools/testing/drag';
import { startFormativeTest } from './formative-host.js';
// The same file as text, for the Code tab: the code shown is the code that runs.
// eslint-disable-next-line import/default
import hostSource from './formative-host.js?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The demo on the "Formative test" page (`formative-test.mdx`), hidden from the sidebar (`!dev`): the
 * page is the entry. A plain test package (the Getting started test) made into a practice test by
 * `formative-host.js`, with the corrections elements.
 */
const meta: Meta = {
  title: 'QTI behaviour/Formative test',
  tags: ['!dev'],
  parameters: { controls: { disable: true } }
};
export default meta;

const markup = `<qti-test navigate="item">
  <test-navigation class="flex flex-col gap-2">
    <p data-progress class="m-0 font-bold"></p>
    <test-container class="block h-100 overflow-auto" test-url="${GETTING_STARTED_TEST}"></test-container>
    <p data-feedback role="status" class="m-0"></p>
    <nav class="flex justify-between">
      <button type="button" data-previous>Previous</button>
      <span class="flex gap-2">
        <button type="button" data-restart>Start again</button>
        <button type="button" data-check>Check</button>
      </span>
      <button type="button" data-next>Next</button>
    </nav>
  </test-navigation>
</qti-test>`;

/** What a page of your own contains: the corrections build, the markup and the host script. */
const pageSource = (call: string) => `${markup}

<script type="module">
  import '@citolab/qti-components/corrections';

${hostSource
  .trim()
  .split('\n')
  .map(line => (line ? `  ${line}` : line))
  .join('\n')}

  ${call}
</script>`;

type Options = { checksBeforeSolution?: number | null; storageKey?: string };

/** Mounts the demo; "Start again" mounts a fresh one in its place. */
const mount = (slot: HTMLElement, options: Options = {}) => {
  const host = mountWithCorrections(markup);
  startFormativeTest(host.shadowRoot!, { ...options, restart: () => mount(slot, options) });
  slot.replaceChildren(host);
};

const renderWith =
  (options: Options = {}) =>
  () => {
    const slot = document.createElement('div');
    mount(slot, options);
    return slot;
  };

/** A run starts fresh and leaves nothing behind, so the docs page never opens halfway through. */
const freshSession = (storageKey: string) => () => {
  sessionStorage.removeItem(storageKey);
  return () => sessionStorage.removeItem(storageKey);
};

const loadedItem = (root: ShadowRoot, title: string) =>
  waitFor(
    () => {
      const item = root
        .querySelector('test-container')
        ?.shadowRoot?.querySelector<HTMLElement>(`qti-assessment-item[data-title="${title}"]`);
      if (!item) throw new Error(`${title} is not loaded yet`);
      return item;
    },
    { timeout: 15000 }
  );

/** The demo's parts, found through its shadow root. */
const parts = (canvasElement: HTMLElement) => {
  const root = () => [...canvasElement.querySelectorAll('div')].find(div => div.shadowRoot)!.shadowRoot!;
  return {
    root,
    button: (name: string) => root().querySelector<HTMLButtonElement>(`[data-${name}]`)!,
    feedback: () => root().querySelector('[data-feedback]')!,
    progress: () => root().querySelector('[data-progress]')!,
    reload: () => {
      canvasElement.replaceChildren(renderWith()());
    }
  };
};

/** Check an answer, try again, move on; a reload resumes where the candidate was. */
export const FormativeTest: StoryObj = {
  parameters: {
    testTimeout: 90000,
    docs: { source: { language: 'html', code: pageSource('startFormativeTest(document);') } }
  },
  beforeEach: freshSession('formative-test'),
  render: renderWith(),
  play: async ({ canvasElement, step }) => {
    const { root, button, feedback, progress, reload } = parts(canvasElement);

    const first = await loadedItem(root(), 'Photosynthesis');
    const choice = (label: string) => within(first).getByText(label);

    await step('Next stays locked until the answer is checked', async () => {
      await waitFor(() => expect(button('next')).toBeDisabled());
      await userEvent.click(choice('Heat'));
      expect(button('next')).toBeDisabled();
    });

    await step('Checking a wrong answer marks it and says so', async () => {
      await userEvent.click(button('check'));
      await waitFor(() => expect(feedback()).toHaveTextContent('not right'));
      expect(choice('Heat').matches(':state(candidate-incorrect)')).toBe(true);
      expect(button('next')).toBeEnabled();
      expect(button('check')).toBeVisible();
    });

    await step('Changing the answer clears the marks and locks Next again', async () => {
      await userEvent.click(choice('Light'));
      await waitFor(() => expect(choice('Heat').matches(':state(candidate-incorrect)')).toBe(false));
      expect(feedback()).toHaveTextContent('');
      expect(button('next')).toBeDisabled();
    });

    await step('Checking the right answer hides Check', async () => {
      await userEvent.click(button('check'));
      await waitFor(() => expect(feedback()).toHaveTextContent('completely right'));
      expect(choice('Light').matches(':state(candidate-correct)')).toBe(true);
      expect(button('check')).not.toBeVisible();
    });

    const gap = (leaf: HTMLElement, word: string, gapId: string) =>
      drag(leaf.querySelector(`qti-gap-text[identifier="${word}"]`)!, {
        to: leaf.querySelector(`qti-gap[identifier="${gapId}"]`)!,
        duration: 100
      });

    await step('One of two gaps right is partly right (MAXSCORE 2)', async () => {
      await userEvent.click(button('next'));
      const leaf = await loadedItem(root(), 'Inside a leaf');
      await gap(leaf, 'chlorophyll', 'G1');
      await userEvent.click(button('check'));
      await waitFor(() => expect(feedback()).toHaveTextContent('not completely right'));
      expect(button('next')).toBeEnabled();
    });

    await step('A reload resumes on the checked question, still checked', async () => {
      reload();
      await loadedItem(root(), 'Inside a leaf');
      await waitFor(() => expect(progress()).toHaveTextContent('Question 2 of 3'));
      await waitFor(() => expect(feedback()).toHaveTextContent('not completely right'));
      expect(button('next')).toBeEnabled();
    });

    await step('A changed answer stays unchecked after going back and forth', async () => {
      const leaf = await loadedItem(root(), 'Inside a leaf');
      await gap(leaf, 'stomata', 'G2');
      await waitFor(() => expect(button('next')).toBeDisabled());
      await userEvent.click(button('previous'));
      await loadedItem(root(), 'Photosynthesis');
      await waitFor(() => expect(button('next')).toBeEnabled());
      await userEvent.click(button('next'));
      await loadedItem(root(), 'Inside a leaf');
      await waitFor(() => expect(progress()).toHaveTextContent('Question 2 of 3'));
      expect(button('next')).toBeDisabled();
      expect(feedback()).toHaveTextContent('');
    });

    await step('Finishing the last question shows the score and locks the test', async () => {
      await userEvent.click(button('check'));
      await waitFor(() => expect(button('next')).toBeEnabled());
      await userEvent.click(button('next'));
      await loadedItem(root(), 'The steps');
      await userEvent.click(button('check'));
      await waitFor(() => expect(button('next')).toHaveTextContent('Finish'));
      await waitFor(() => expect(button('next')).toBeEnabled());
      await userEvent.click(button('next'));
      await waitFor(() => expect(progress()).toHaveTextContent(/^Score: \d+ of 4$/));
      expect(button('check')).not.toBeVisible();
    });
  }
};

/** With `checksBeforeSolution: 2`, two wrong checks show the correct response, lock the item and unlock Next. */
export const SolutionAfterTwoChecks: StoryObj = {
  parameters: {
    testTimeout: 60000,
    docs: {
      source: { language: 'html', code: pageSource('startFormativeTest(document, { checksBeforeSolution: 2 });') }
    }
  },
  beforeEach: freshSession('formative-test-two-checks'),
  render: renderWith({ checksBeforeSolution: 2, storageKey: 'formative-test-two-checks' }),
  play: async ({ canvasElement }) => {
    const { root, button, feedback } = parts(canvasElement);
    const first = await loadedItem(root(), 'Photosynthesis');
    const choice = (label: string) => within(first).getByText(label);

    await userEvent.click(choice('Heat'));
    await userEvent.click(button('check'));
    await waitFor(() => expect(feedback()).toHaveTextContent('not right'));
    await userEvent.click(choice('Sound'));
    await userEvent.click(button('check'));

    await waitFor(() => expect(feedback()).toHaveTextContent('This is the right answer.'));
    expect(choice('Light').matches(':state(answer-key)')).toBe(true);
    expect((first as HTMLElement & { disabled: boolean }).disabled).toBe(true);
    expect(button('check')).not.toBeVisible();
    expect(button('next')).toBeEnabled();
  }
};
