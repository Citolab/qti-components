import { describe, expect, it } from '@jest/globals';
import { html, render } from 'lit';
import '../qti-basevalue/qti-basevalue';
import { QtiConditionExpression } from '../qti-condition-expression';
import './qti-sum';
import { QtiSum } from './qti-sum';
class MockChild extends QtiConditionExpression {
  response = false;
  override connectedCallback() {
    super.connectedCallback();
    this.response = this.getAttribute('response') == 'true';
  }
  public override calculate() {
    return this.response;
  }
}
window.customElements.define('mock-child', MockChild);

describe('QtiComponent qti-sum', () => {
  it('all true', () => {
    const template = () => html`
      <qti-sum>
        <qti-base-value>1</qti-base-value>
        <qti-base-value>1</qti-base-value>
        <qti-base-value>1</qti-base-value>
      </qti-sum>
    `;
    render(template(), document.body);

    const qtiSum = document.body.querySelector('qti-sum') as QtiSum;
    expect(qtiSum.calculate()).toEqual(3);
  });

  it('one false should result in false', () => {
    const template = () => html`
      <qti-sum>
        <qti-base-value>1</qti-base-value>
        <qti-base-value>1</qti-base-value>
        <qti-base-value>4</qti-base-value>
      </qti-sum>
    `;
    render(template(), document.body);

    const qtiSum = document.body.querySelector('qti-sum') as QtiSum;
    expect(qtiSum.calculate()).toEqual(6);
  });
});
