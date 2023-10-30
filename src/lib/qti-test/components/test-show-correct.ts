import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';
import { QtiAssessmentItem } from '../../qti-components';
import { QtiAssessmentTest } from '../qti-assessment-test';

@customElement('test-show-correct')
export class TestShowCorrect extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

  render() {
    const { items, itemIndex } = this._testProvider;
    if (itemIndex == null) return html``;
    const item = this.closest<QtiAssessmentTest>('qti-assessment-test')?.itemRefEls.get(items[itemIndex]?.identifier)
      ?.assessmentItem as QtiAssessmentItem;

    return html`
      <button part="button" @click=${_ => item._showCorrectResponse()}>
        <slot></slot>
      </button>
    `;
  }
}
