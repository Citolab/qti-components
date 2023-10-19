import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-slider')
export class QtiTestSlider extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

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
        part="input"
        type="range"
        value=${itemIndex}
        class="absolute w-full appearance-none bg-transparent"
        max=${items.length - 1}
        @input=${e => this._requestItem(+(e.target as HTMLInputElement).value)}
      />
    `;
  }
}
