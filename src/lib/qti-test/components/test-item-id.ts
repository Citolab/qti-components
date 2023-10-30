import { css, html, LitElement } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-item-id')
export class TestItemId extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testContext?: TestContext;

  render() {
    const { items, itemIndex } = this._testContext;
    return html` ${items[itemIndex]?.identifier} `;
  }
}
