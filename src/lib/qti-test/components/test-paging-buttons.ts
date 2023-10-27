import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';
import { prop } from 'cheerio/lib/api/attributes';

@customElement('test-paging-buttons')
export class TestPagingButtons extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

  @property({ type: Number })
  private maxDisplayedItems = 5;

  protected createRenderRoot() {
    return this;
  }

  _requestItem(index) {
    this.dispatchEvent(
      new CustomEvent('on-test-request-item', {
        composed: true,
        bubbles: true,
        detail: index
      })
    );
  }

  render() {
    const { items, itemIndex } = this._testProvider;
    const start = Math.max(0, itemIndex - this.maxDisplayedItems);
    const end = Math.min(items.length - 1, itemIndex + this.maxDisplayedItems);
    const displayedItems = items.slice(start, end + 1);
    return html`
      ${displayedItems.map(
        (item, index) =>
          html`<button
            part="button"
            data-completion-status=${item.variables.find(v => v.identifier === 'completionStatus')?.value}
            data-active-item=${start + index === itemIndex}
            @click=${_ => this._requestItem(start + index)}
            id="${item.identifier}"
          >
            ${start + index + 1}
          </button>`
      )}
    `;
  }
}
