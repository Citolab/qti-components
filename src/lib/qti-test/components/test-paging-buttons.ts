import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';
@customElement('test-paging-buttons')
export class TestPagingButtons extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: Number, attribute: 'max-displayed-items' })
  private maxDisplayedItems = 3;

  @property({ type: String, attribute: 'skip-on-category' })
  private skipOnCategory = null;

  protected createRenderRoot() {
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

    const itemsWithoutSkippedCategory = items.filter(item => !item.category?.split(' ').includes(this.skipOnCategory));

    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);
    const start = Math.max(0, itemIndex - this.maxDisplayedItems);
    const end = Math.min(items.length - 1, itemIndex + this.maxDisplayedItems);
    const displayedItems = items.slice(start, end + 1);

    const startItem = items[start];
    const startItemIndexWithoutSkippedCategory = Math.max(
      0,
      itemsWithoutSkippedCategory.findIndex(item => item.identifier === startItem.identifier)
    );
    let counter = startItemIndexWithoutSkippedCategory;
    return html`
      ${displayedItems.map((item, index) => {
        const rawscore = item.variables.find(vr => vr.identifier == 'SCORE');
        const score = parseInt(rawscore?.value?.toString());
        const completionStatus = item.variables.find(v => v.identifier === 'completionStatus')?.value;

        const isInfoItem = item.category?.split(' ').includes(this.skipOnCategory);
        const isSkippedInCounting = isInfoItem && this.skipOnCategory === this.skipOnCategory;
        if (!isSkippedInCounting) {
          counter++;
        }

        return html`<button
          part="button"
          data-completion-status=${item.variables.find(v => v.identifier === 'completionStatus')?.value}
          data-active-item=${this._sessionContext.identifier === item.identifier}
          class=${`
            ${item.category !== this.skipOnCategory ? 'rounded-full' : ``}
            ${this._sessionContext.identifier === item.identifier ? ' !border-sky-600' : ''}
            ${this._sessionContext.view === 'candidate' && completionStatus === 'completed' ? `bg-slate-300 shadow-sm` : ''}
            ${this._sessionContext.view === 'scorer' && completionStatus === 'completed' ? '' : ''}
            ${this._sessionContext.view === 'scorer' && item.category !== this.skipOnCategory && score !== undefined && !isNaN(score) && score > 0 ? 'bg-green-100 border-green-400' : ''}
            ${this._sessionContext.view === 'scorer' && item.category !== this.skipOnCategory && score !== undefined && !isNaN(score) && score <= 0 ? 'bg-red-100 border-red-400' : ''}
          flex h-4 w-4 cursor-pointer items-center justify-center border-2
          `}
          @click=${_ => {
            this._requestItem(item.identifier);
          }}
          id="${item.identifier}"
          aria-label="${item.identifier}"
        ></button>`;
      })}
    `;
  }
}

// ${isSkippedInCounting ? 'i' : counter}
