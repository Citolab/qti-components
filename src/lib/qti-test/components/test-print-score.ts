import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-print-score')
export class TestPrintScore extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  _requestItem(index) {
    this.dispatchEvent(
      new CustomEvent('on-test-request-item', {
        composed: true,
        bubbles: true,
        detail: index
      })
    );
  }

  render() {
    const { items } = this._testContext;
    const totalScore = items.reduce((acc, item) => {
      const maxScore = item.variables.find(v => v.identifier === 'SCORE');
      return acc + (maxScore ? +maxScore.value : 0);
    }, 0);
    const totalMaxScore = items.reduce((acc, item) => {
      const maxScore = item.variables.find(v => v.identifier === 'MAXSCORE');
      return acc + (maxScore ? +maxScore.value : 0);
    }, 0);

    return html` ${totalScore}/${totalMaxScore}`;
  }
}
