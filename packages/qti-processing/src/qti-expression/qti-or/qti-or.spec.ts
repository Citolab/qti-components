import '@citolab/qti-components';
import { html, render } from 'lit';

import { QtiConditionExpression } from '@qti-components/base';

import type { QtiOr } from './qti-or';
class MockChild extends QtiConditionExpression {
  value = false;
  override connectedCallback() {
    super.connectedCallback();
    this.value = this.getAttribute('response') == 'true';
  }
  public override calculate() {
    return this.value;
  }
}
window.customElements.define('mock-child', MockChild);

describe('all true', () => {
  it('all true = true', () => {
    const template = () => html`
      <qti-or>
        <mock-child response="true"></mock-child>
        <mock-child response="true"></mock-child>
        <mock-child response="true"></mock-child>
      </qti-or>
    `;
    render(template(), document.body);
    const qtiOr = document.body.querySelector('qti-or') as QtiOr;
    expect(qtiOr.calculate()).toBeTruthy();
  });
});

describe('one true', () => {
  it('one true = true', () => {
    const template = () => html`
      <qti-or>
        <mock-child response="false"></mock-child>
        <mock-child response="true"></mock-child>
        <mock-child response="false"></mock-child>
      </qti-or>
    `;
    render(template(), document.body);

    const qtiOr = document.body.querySelector('qti-or') as QtiOr;
    expect(qtiOr.calculate()).toBeTruthy();
  });
});
describe('all false', () => {
  it('all false = false', () => {
    const template = () => html`
      <qti-or>
        <mock-child response="false"></mock-child>
        <mock-child response="false"></mock-child>
        <mock-child response="false"></mock-child>
      </qti-or>
    `;
    render(template(), document.body);

    const qtiOr = document.body.querySelector('qti-or') as QtiOr;
    expect(qtiOr.calculate()).toBeFalsy();
  });
});
