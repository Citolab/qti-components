import { html, LitElement, nothing } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { QtiTest, sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-item-debug')
export class TestItemDebug extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  render() {
    if (this._sessionContext?.identifier == null) return;

    const { items } = this._testContext;

    const item = items.find(item => item.identifier === this._sessionContext.identifier);
    const itemIdentifier = item.identifier;

    const qtiAssessmentTestEl = this.closest('qti-test') as QtiTest;
    const qtiItemEl = qtiAssessmentTestEl.itemRefEls.get(itemIdentifier);
    const scoreOutcome = item.variables.find(vr => vr.identifier == 'SCORE');

    return html`
      <dl>
        <dt>id:</dt>
        <dd>${qtiItemEl?.assessmentItem?.identifier ?? nothing}</dd>

        <dt>title:</dt>
        <dd>${qtiItemEl?.assessmentItem?.title ?? nothing}</dd>

        <dt>category:</dt>
        <dd>${item.category ?? html`<em>category not set</em>`}</dd>

        <dt>adaptive:</dt>
        <dd>${qtiItemEl?.assessmentItem?.adaptive ?? html`<em>adaptive not set</em>`}</dd>

        <dt>[SCORE]:</dt>
        <dd>${scoreOutcome?.identifier ?? html`<em>no SCORE outcome</em>`}</dd>

        ${scoreOutcome &&
        html` <dt>[SCORE] externalScored:</dt>
          <dd>${scoreOutcome?.['externalScored'] ?? html`<em>externalScored not set</em>`}</dd>`}
      </dl>
      <pre>
          ${JSON.stringify(item, null, 2)}
      </pre
      >
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-item-debug': TestItemDebug;
  }
}
