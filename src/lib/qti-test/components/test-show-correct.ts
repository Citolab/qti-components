import { html, LitElement } from 'lit';

import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { QtiTest, sessionContext, SessionContext, testContext, TestContext } from '..';
@customElement('test-show-correct')
export class TestShowCorrect extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  render() {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);

    if (itemIndex == null) return html``;
    const item = this.closest<QtiTest>('qti-test')?.itemRefEls.get(items[itemIndex]?.identifier)
      ?.assessmentItem as QtiAssessmentItem;

    return html`
      <button part="button" @click=${_ => item.showCorrectResponse(true)}>
        <slot></slot>
      </button>
    `;
  }
}
