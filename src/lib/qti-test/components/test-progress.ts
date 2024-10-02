import { css, html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';
@customElement('test-progress')
export class TestProgress extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  static styles = css`
    progress {
      width: 100%;
    }
  `;

  render() {
    const { items } = this._testContext;

    const nrItemsFinished =
      this._sessionContext.view === 'scorer'
        ? items.filter(i => i.variables?.find(v => v.identifier === 'SCORE')?.value !== undefined).length
        : items.filter(i => i.variables?.find(v => v.identifier === 'completionStatus')?.value === 'completed').length;

    return html`
      <progress part="progress" id="file" max=${items.length - 1} value=${nrItemsFinished}>
        ${nrItemsFinished / (items.length - 1)}%
      </progress>
    `;
  }
}
