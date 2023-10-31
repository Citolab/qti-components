import './qti-and';
import { QtiAnd } from './qti-and';
import { html, render } from 'lit';
import { describe, expect, it } from '@jest/globals';
import { QtiConditionExpression } from '../qti-condition-expression';
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

describe('QtiComponent', () => {
  it('all true', () => {
    const template = () => html`
      <qti-and>
        <mock-child response="true"></mock-child>
        <mock-child response="true"></mock-child>
        <mock-child response="true"></mock-child>
      </qti-and>
    `;
    render(template(), document.body);

    const qtiAnd = document.body.querySelector('qti-and') as QtiAnd;
    expect(qtiAnd.calculate()).toBeTruthy();
  });

  it('one false should result in false', () => {
    const template = () => html`
      <qti-and>
        <mock-child response="true"></mock-child>
        <mock-child response="false"></mock-child>
        <mock-child response="true"></mock-child>
      </qti-and>
    `;
    render(template(), document.body);

    const qtiAnd = document.body.querySelector('qti-and') as QtiAnd;
    expect(qtiAnd.calculate()).toBeFalsy();
  });
});
