import { consume } from '@lit-labs/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('qti-test-prev')
export class QtiTestPrev extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  private _testProvider?: TestContext;

  render() {
    const { items, itemIndex } = this._testProvider;
    console.log(items, itemIndex);
    return html` <button @click=${() => this._emit('on-user-ask-prev', items[itemIndex + 1].href)}>
      <slot></slot>
    </button>`;
  }

  private _emit(ev: string, identifier: string) {
    this.dispatchEvent(
      new CustomEvent<string>(ev, {
        composed: true,
        bubbles: true,
        detail: identifier
      })
    );
  }
}
