import { html, render } from 'lit';
import '../qti-basevalue/qti-basevalue';
import './qti-multiple';
import type { QtiMultiple } from './qti-multiple';
describe('qti-multiple', () => {
  it('should return an array with the calculated results of its children, single child', () => {
    const template = () => html`
      <qti-multiple>
        <qti-base-value base-type="directedPair">GT1 G1</qti-base-value>
      </qti-multiple>
    `;
    render(template(), document.body);

    const qtiMultiple = document.body.querySelector('qti-multiple') as QtiMultiple;
    const calculated = qtiMultiple.calculate();
    expect(calculated[0].value).toMatch('GT1 G1');
  });

  it('should return an array with the calculated results of its children, 3 children', () => {
    const template = () => html`
      <qti-multiple>
        <qti-base-value base-type="directedPair">GT1 G1</qti-base-value>
        <qti-base-value base-type="float">1.23</qti-base-value>
        <qti-base-value base-type="string">Hoi</qti-base-value>
      </qti-multiple>
    `;
    render(template(), document.body);

    const qtiMultiple = document.body.querySelector('qti-multiple') as QtiMultiple;
    expect(qtiMultiple.calculate()[2].value).toMatch('Hoi');
  });
});
