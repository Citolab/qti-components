import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { testContext, TestContext } from '..';

@customElement('test-print-variables')
export class TestPrintVariables extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  render() {
    return html` <pre>${JSON.stringify(this._testContext, null, 2)}</pre> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-print-variables': TestPrintVariables;
  }
}
