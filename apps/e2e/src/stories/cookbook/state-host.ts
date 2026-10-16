import { html, render } from 'lit';

import type { TemplateResult } from 'lit';
import type { QtiTestState } from '@qti-components/test';

/** Same seed on every load, or a resumed test shows items and choices in a different order. */
export const SEED = 'session-1';

/**
 * The chrome a host puts around a `<qti-test>` to save and resume it, for the cookbook stories.
 *
 * - Saves from `cito-test-state-changed`, whose `detail` is the state, and shows it as JSON.
 * - "Restart from saved state" builds a fresh test and assigns the saved `state` and the same seed
 *   before the test is attached, which is what a host does after a page reload.
 *
 * Built with plain DOM so it works on the docs page too, where `play` does not run.
 */
export const stateHost = (inner: TemplateResult): HTMLElement => {
  const root = document.createElement('div');
  const stage = document.createElement('div');
  const output = document.createElement('pre');
  output.dataset.testid = 'saved-state';
  output.textContent = 'Nothing saved yet.';
  output.style.cssText = 'max-height: 12rem; overflow: auto; font-size: 0.75rem;';

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

  const mount = (state?: QtiTestState) => {
    const container = document.createElement('div');
    // `.state` is assigned while the test is detached: safe before or after it loads.
    render(
      state
        ? html`<qti-test navigate="item" .qtiContext=${qtiContext} .state=${state}>${inner}</qti-test>`
        : html`<qti-test navigate="item" .qtiContext=${qtiContext}>${inner}</qti-test>`,
      container
    );
    container.querySelector('qti-test')!.addEventListener('cito-test-state-changed', event => {
      saved = event.detail;
      output.textContent = JSON.stringify(saved, null, 2);
      restart.disabled = false;
    });
    stage.replaceChildren(container);
  };

  restart.addEventListener('click', () => mount(saved));
  root.append(restart, stage, output);
  mount();
  return root;
};
