import { expect, userEvent, waitFor, within } from 'storybook/test';

import { mountWithCorrections } from '../apps/e2e/src/stories/corrections/mount-with-corrections';
import { GETTING_STARTED_TEST } from '../packages/qti-test/src/components/qti-test/getting-started.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The demo on the "Corrections" overview page (`corrections.mdx`), hidden from the sidebar (`!dev`): the
 * page is the entry. It runs the Getting started test with the corrections elements.
 */
const meta: Meta = {
  title: 'Corrections/Overview',
  tags: ['!dev'],
  parameters: { controls: { disable: true } }
};
export default meta;

const markup = `<qti-test navigate="item">
  <test-navigation class="flex flex-col gap-2">
    <test-container class="block h-100 overflow-auto" test-url="${GETTING_STARTED_TEST}"></test-container>
    <nav class="flex justify-between">
      <test-prev>Previous</test-prev>
      <test-show-correct-response></test-show-correct-response>
      <test-next>Next</test-next>
    </nav>
  </test-navigation>
</qti-test>`;

/** The item of the test that is on screen, inside the container's shadow root. */
const loadedItem = (root: ShadowRoot) =>
  waitFor(
    () => {
      const item = root.querySelector('test-container')?.shadowRoot?.querySelector('qti-assessment-item');
      if (!item) throw new Error('the first item is not loaded yet');
      return item as HTMLElement;
    },
    { timeout: 15000 }
  );

/** The button shows the active item's correct response, and hides it again. */
export const ShowCorrectResponse: StoryObj = {
  parameters: {
    testTimeout: 30000,
    docs: {
      source: {
        language: 'html',
        code: `<script type="module">
  import '@citolab/qti-components/corrections';
</script>

${markup}`
      }
    }
  },
  render: () => mountWithCorrections(markup),
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector('div')!.shadowRoot!;
    const item = await loadedItem(root);
    const light = within(item).getByText('Light');
    const button = root.querySelector<HTMLElement>('test-show-correct-response')!;
    expect(button.tabIndex).toBe(0);

    await step('Pressing it marks the correct choice', async () => {
      await waitFor(() => expect(button).not.toHaveAttribute('disabled'));
      await userEvent.click(button);
      await waitFor(() => expect(light.matches(':state(correct-response)')).toBe(true));
      expect(button.shadowRoot!.textContent).toBe('Hide correct response');
    });

    await step('Enter on the focused button hides it again', async () => {
      button.focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(light.matches(':state(correct-response)')).toBe(false));
      expect(button.shadowRoot!.textContent).toBe('Show correct response');
    });
  }
};
