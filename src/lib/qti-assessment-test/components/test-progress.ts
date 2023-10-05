import { consume } from '@lit-labs/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-progress')
export class QtiTestProgress extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

  render() {
    const { items, itemIndex } = this._testProvider;
    return html`
      <progress id="file" max=${items.length - 1} value=${itemIndex}>${itemIndex / (items.length - 1)}%</progress>
    `;
  }
}
