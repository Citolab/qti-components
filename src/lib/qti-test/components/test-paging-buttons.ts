import { consume } from '@lit-labs/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';
import { prop } from 'cheerio/lib/api/attributes';

@customElement('test-paging-buttons')
export class QtiTestPagingButtons extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

  protected createRenderRoot(): Element | ShadowRoot {
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
    return html`
      ${items.map(
        (item, index) =>
          html` <button
            part="button"
            data-completion-status=${item.variables.find(v => v.identifier === 'completionStatus')?.value}
            data-active-item=${index === itemIndex}
            @click=${_ => this._requestItem(index)}
            id="${item.identifier}"
          >
            ${index + 1}
          </button>`
      )}
    `;
  }
}
