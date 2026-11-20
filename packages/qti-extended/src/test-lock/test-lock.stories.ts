import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import '../../../../.storybook/utilities.css';
import { GETTING_STARTED_TEST } from '../getting-started.fixtures';

import type { TestLock } from './test-lock';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes } = getStorybookHelpers('test-lock');

type Story = StoryObj<TestLock & typeof args>;

/**
 * `<test-lock>` locks the test when the candidate leaves the page, to another tab or window, and
 * covers it with a modal until it is unlocked. It is a deterrent for a supervised session, not
 * security: the page is the candidate's.
 *
 * The lock lives in the test's state under `session.plugins.lock` (`{ locked, times }`), so a host that
 * stores `state` keeps it over a reload and can show a proctor how often the candidate left. With a
 * `code` the modal asks for it; without one only the host unlocks, with `unlock()`. Focus moving into
 * an iframe of the test (a portable custom interaction) does not lock it.
 *
 * Switch to another tab and back to see it; the code here is `1234`.
 */
const meta: Meta<TestLock> = {
  tags: ['autodocs'],
  title: 'QTI Test/Plugins/Lock',
  component: 'test-lock',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: () =>
    html`<qti-test navigate="item">
      <test-navigation>
        <test-lock code="1234">De toets is vergrendeld omdat je de pagina hebt verlaten.</test-lock>
        <nav class="flex items-center gap-1 mb-2">
          <test-prev>Vorige</test-prev>
          <test-next>Volgende</test-next>
        </nav>
        <test-container
          test-url=${GETTING_STARTED_TEST}
          class="block h-[32rem] overflow-auto border rounded"
        ></test-container>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const lock = canvasElement.querySelector<TestLock>('test-lock')!;
    const dialog = () => lock.shadowRoot!.querySelector('dialog')!;
    // The test must be running before leaving it counts.
    await waitFor(
      () =>
        expect(
          canvasElement.querySelector('test-container')?.shadowRoot?.querySelector('qti-assessment-item')
        ).toBeTruthy(),
      {
        timeout: 15000
      }
    );

    window.dispatchEvent(new Event('blur'));
    await waitFor(() => expect(dialog().open).toBe(true));

    lock.shadowRoot!.querySelector('input')!.value = '1234';
    lock.shadowRoot!.querySelector('form')!.requestSubmit();
    await waitFor(() => expect(dialog().open).toBe(false));
  }
};
