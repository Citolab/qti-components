import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-print-score')
export class QtiTestPrintScore extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testContext?: TestContext;

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
