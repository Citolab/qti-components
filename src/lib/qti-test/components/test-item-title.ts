import { html, LitElement, nothing } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { QtiTest, sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-item-title')
export class TestItemTitle extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  render() {
    const { items } = this._testContext;
    const itemIdentifier = items.find(item => item.identifier === this._sessionContext.identifier)?.identifier;
    const qtiAssessmentTestEl = this.closest('qti-test') as QtiTest;
    const qtiItemEl = qtiAssessmentTestEl.itemRefEls.get(itemIdentifier);

    return html` ${qtiItemEl ? (qtiItemEl.assessmentItem ? qtiItemEl.assessmentItem.title : nothing) : nothing} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-item-title': TestItemTitle;
  }
}
