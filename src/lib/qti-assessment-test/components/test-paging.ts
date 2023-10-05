import { consume } from '@lit-labs/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-paging')
export class QtiTestPaging extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

  static styles = css`
    .active {
      background-color: green;
      color: white;
    }
  `;

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
            class=${index === itemIndex ? 'active' : ''}
            @click=${_ => this._requestItem(index)}
            id="${item.identifier}"
          >
            ${item.identifier}<br />${item.variables.find(v => v.identifier === 'completionStatus')?.value}
            <br />${item.variables.find(v => v.identifier === 'SCORE')?.value}
          </button>`
      )}
    `;
  }
}
