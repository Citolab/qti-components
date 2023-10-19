import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-print-variables')
export class QtiPrintVariables extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

  render() {
    return html`
      <pre>
${JSON.stringify(
          {
            ...this._testProvider,
            items: this._testProvider.items.map(item => ({ ...item, itemEl: null }))
          },
          null,
          2
        )}</pre
      >
    `;
  }
}
