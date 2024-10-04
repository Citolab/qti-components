/* eslint-disable lit-a11y/click-events-have-key-events */

import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from 'src/lib/qti-test';

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
    const currentItem = items.find(item => item.identifier === this._sessionContext.identifier);

    return html` <div class="flex w-full flex-grow items-center  bg-slate-200 px-2">
      <div class="hidden flex-col justify-center text-lg font-semibold text-sky-800 md:flex">Punten</div>
      <test-scoring-buttons
        .view=${'scorer'}
        ...=${currentItem?.scoreType === 'api' || currentItem?.scoreType === 'manual' ? {} : { disabled: true }}
      ></test-scoring-buttons>
      ${currentItem?.type !== 'info' &&
      html`<score-info
        .scoreType=${currentItem?.scoreType as string}
        .score=${currentItem?.score as number}
        .answered=${currentItem?.answered as boolean}
      ></score-info>`}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-auto-scoring': TestAutoScoring;
  }
}
