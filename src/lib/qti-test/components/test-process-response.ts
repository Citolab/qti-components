import { css, html, LitElement } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { TestContext, testContext } from '../qti-assessment-test.context';
import { QtiAssessmentTest } from '../qti-assessment-test';

@customElement('test-process-response')
export class TestProcessResponse extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testContext?: TestContext;

  _processResponse() {
    const currentItemIdentifier = this._testContext.items[this._testContext.itemIndex].identifier;
    const qtiAssessmentTestEl = this.closest('qti-assessment-test') as QtiAssessmentTest;
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
