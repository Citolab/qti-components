/* eslint-disable lit-a11y/click-events-have-key-events */

import { OutcomeVariable } from '@citolab/qti-components/qti-components';
import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '../../qti-test';

@customElement('test-auto-scoring')
export class TestAutoScoring extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    if (this._sessionContext.view !== 'scorer') return html``;
    const { items } = this._testContext;
    const item = items.find(item => item.identifier === this._sessionContext.identifier);
    const scoreOutcome = item.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;
    const externalScored = scoreOutcome.externalScored;

    return html` <div class="flex w-full flex-grow items-center  bg-slate-200 px-2">
      <div class="hidden flex-col justify-center text-lg font-semibold text-sky-800 md:flex">Punten</div>
      <test-scoring-buttons
        .view=${'scorer'}
        .disabled=${externalScored === 'externalMachine' || externalScored === 'human'}
      ></test-scoring-buttons>
      ${item.category !== 'dep-informational' && html`<score-info></score-info>`}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-auto-scoring': TestAutoScoring;
  }
}
