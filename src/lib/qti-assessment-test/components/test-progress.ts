import { consume } from '@lit-labs/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-progress')
export class QtiTestProgress extends LitElement {
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
      <input
        type="range"
        value=${itemIndex}
        class="absolute w-full appearance-none bg-transparent"
        max=${items.length - 1}
        @input=${e => this._requestItem(+(e.target as HTMLInputElement).value)}
      />

      <progress id="file" max=${items.length - 1} value=${itemIndex}>70%</progress>

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
