import { html, LitElement } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit-labs/context';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-next')
export class TestNext extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  private _context: TestContext;
  connectedCallback(): void {
    super.connectedCallback();
    // new ContextConsumer(
    //   this,
    //   itemContext,
    //   e => this.dispatchEvent(new CustomEvent('context-changed', { bubbles: true, composed: true, detail: e })),
    //   true
    // );
  }
  render() {
    const { href, identifier, variables } = this._context.items[this._context.itemIndex];
    // return html` <pre>${JSON.stringify(variables, null, 2)}</pre> `;
  }
}
