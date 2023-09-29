import { consume } from '@lit-labs/context';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';
import { QtiAssessmentTest } from '../qti-assessment-test';

@customElement('test-progress')
export class QtiTestProgress extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testProvider?: TestContext;

  static styles = css`
    .active {
      background-color: green;
      color: white;
    }
  `;

  _requestItem(index) {
    this.dispatchEvent(
      new CustomEvent('on-test-request-item', {
        composed: true,
        bubbles: true,
        detail: index
      })
    );
    // this.closest<QtiAssessmentTest>('qti-assessment-test').context = {
    //   ...this.closest<QtiAssessmentTest>('qti-assessment-test').context,
    //   itemIndex: index
    // };
  }

  render() {
    const { items, itemIndex } = this._testProvider;
    return html`
      ${items.map(
        (item, index) =>
          html` <button
            class=${index === itemIndex ? 'active' : ''}
            @click=${_ => this._requestItem(index)}
            id="${item.identifier}"
          >
            ${item.identifier} ${item.variables.find(v => v.identifier === 'completionStatus')?.value}
          </button>`
      )}
    `;
  }
}
