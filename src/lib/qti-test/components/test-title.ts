import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { QtiAssessmentTest, sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-title')
export class TestTitle extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  render() {
    const { items } = this._testContext;
    const itemIdentifier = items.find(item => item.identifier === this._sessionContext.identifier)?.identifier;
    const qtiAssessmentTestEl = this.closest('qti-assessment-test') as QtiAssessmentTest;

    return html`${qtiAssessmentTestEl.title} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-title': TestTitle;
  }
}
