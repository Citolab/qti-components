import { consume } from '@lit-labs/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';
import { QtiAssessmentItem } from '../../qti-components';

@customElement('test-show-correct')
export class QtiTestShowCorrect extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

  render() {
    const { items, itemIndex } = this._testProvider;
    const item = items[itemIndex].itemEl;

    return html`
      <button @click=${_ => item.showCorrectResponse()}>
        <slot></slot>
      </button>
    `;
  }
}
