import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { QtiTest, sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-process-response')
export class TestProcessResponse extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  _processResponse() {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);
    const currentItemIdentifier = this._testContext.items[itemIndex].identifier;
    const qtiAssessmentTestEl = this.closest('qti-test') as QtiTest;
    const qtiItemEl = qtiAssessmentTestEl.itemRefEls.get(currentItemIdentifier);
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.processResponse();
  }

  render() {
    return html`
      <button part="button" @click=${_ => this._processResponse()} id="process-response">
        <slot></slot>
      </button>
    `;
  }
}
