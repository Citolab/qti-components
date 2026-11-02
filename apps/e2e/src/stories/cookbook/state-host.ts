import { html, render } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// The layout classes below; Storybook chrome, not a package this app depends on.
// eslint-disable-next-line import/no-relative-packages
import '../../../../../.storybook/utilities.css';

import type { TemplateResult } from 'lit';
import type { QtiTestState } from '@qti-components/test';

/** Same seed on every load, or a resumed test shows items and choices in a different order. */
export const SEED = 'session-1';

/**
 * The chrome a host puts around a `<qti-test>` to save and resume it, for the cookbook stories.
 *
 * - Keeps the state from `qc-test-state-changed`, whose `detail` is the state. A
 *   `<test-print-state>` dropped into the test shows it, to the right of the player.
 * - "Restart from saved state" builds a fresh test and assigns the kept `state` and the same seed
 *   before the test is attached, which is what a host does after a page reload.
 *
 * Built with plain DOM so it works on the docs page too, where `play` does not run. `markup` may be a
 * string: the docs stories have no `lit` of their own.
 */
export const stateHost = (markup: TemplateResult | string): HTMLElement => {
  const inner = typeof markup === 'string' ? unsafeHTML(markup) : markup;
  const root = document.createElement('div');
  root.className = 'flex flex-col gap-2';
  const stage = document.createElement('div');

  const restart = document.createElement('button');
  restart.type = 'button';
  restart.textContent = 'Restart from saved state';
  restart.disabled = true;

  let saved: QtiTestState | undefined;
  const qtiContext = {
    QTI_CONTEXT: {
      testIdentifier: 'test',
      candidateIdentifier: 'candidate',
      environmentIdentifier: 'default',
      seed: SEED
    }
  };

  // The state's column stretches to the player's height and the tree fills it, so a long state
  // scrolls instead of making the row taller.
  const content = html`
    <div class="flex gap-3">
      <div class="flex-1 min-w-0">${inner}</div>
      <div class="relative w-80">
        <test-print-state class="absolute inset-0 overflow-auto font-mono text-xs text-gray-500"></test-print-state>
      </div>
    </div>
  `;

  const mount = (state?: QtiTestState) => {
    const container = document.createElement('div');
    // `.state` is assigned while the test is detached: safe before or after it loads.
    render(
      state
        ? html`<qti-test navigate="item" .qtiContext=${qtiContext} .state=${state}>${content}</qti-test>`
        : html`<qti-test navigate="item" .qtiContext=${qtiContext}>${content}</qti-test>`,
      container
    );
    container.querySelector('qti-test')!.addEventListener('qc-test-state-changed', event => {
      saved = event.detail;
      restart.disabled = false;
    });
    stage.replaceChildren(container);
  };

  restart.addEventListener('click', () => mount(saved));
  root.append(restart, stage);
  mount();
  return root;
};
