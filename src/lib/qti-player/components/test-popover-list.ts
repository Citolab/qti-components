/* eslint-disable lit-a11y/click-events-have-key-events */

import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '../../qti-test';

@customElement('test-popover-list')
export class TestPopOverList extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: String, attribute: 'info-category' })
  private infoCategory = null;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  _requestItem(identifier: string) {
    this.dispatchEvent(
      new CustomEvent('qti-test-set-item', {
        composed: true,
        bubbles: true,
        detail: identifier
      })
    );
  }

  render() {
    const { items } = this._testContext;

    return html`<div class="mt-1 flex justify-between gap-8 p-4 text-sky-800">
        <div class="font-semibold">${this.title}</div>
        <button
          @click=${() => this.hidePopover()}
          class="flex cursor-pointer gap-2 rounded border-none bg-white p-2 text-lg  font-bold text-sky-800  shadow-sm outline-none ring-transparent"
        >
          <hi-24-outline-x-mark class="h-6 w-6 stroke-[2px]"></hi-24-outline-x-mark>
        </button>
      </div>
      <test-navigation-list class=" grid-cols-1 divide-y overflow-y-auto p-4 md:columns-4">
        ${items.map((item, index) => {
          const rawscore = item.variables.find(vr => vr.identifier == 'SCORE');
          const score = parseInt(rawscore?.value?.toString());
          const completionStatus = item.variables.find(v => v.identifier === 'completionStatus')?.value;
          const type = item.category !== this.infoCategory ? 'regular' : 'info'; // rounded-full
          const active = this._sessionContext.identifier === item.identifier; // !border-sky-600
          const correct =
            this._sessionContext.view === 'scorer' &&
            type == 'regular' &&
            score !== undefined &&
            !isNaN(score) &&
            score > 0; // bg-green-100 border-green-400
          const incorrect =
            this._sessionContext.view === 'scorer' &&
            type == 'regular' &&
            score !== undefined &&
            !isNaN(score) &&
            score <= 0; // bg-red-100 border-red-400
          const answered =
            this._sessionContext.view === 'candidate' &&
            completionStatus === 'completed' &&
            item.category !== this.infoCategory; // bg-slate-300 shadow-sm

          return html`
            <div
              class="${active
                ? 'bg-sky-500 text-white'
                : ''} flex cursor-pointer items-center justify-between gap-2 px-2 py-1 text-sm 
                          text-slate-600"
              @click=${() => {
                this._requestItem(item.identifier);
                this.dispatchEvent(new CustomEvent('close-dialog'));
              }}
            >
              <div class=${`h-4 w-4 cursor-pointer border-2`}></div>
              <div class="flex flex-grow gap-1 py-0.5">${type === 'regular' ? item.title : html`info`}</div>
              <div class="mr-2 w-4 text-right text-xs text-slate-300">${item.sequenceNumber}</div>
            </div>
          `;
        })}
      </test-navigation-list>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-popover-list': TestPopOverList;
  }
}
