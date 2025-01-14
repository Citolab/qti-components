import { html, render } from 'lit';
import './qti-basevalue';
import type { QtiBaseValue } from './qti-basevalue';
describe('qti-base-value', () => {
  it('should return value in the correct baseType(float)', () => {
    const template = () => html` <qti-base-value base-type="float">1.034</qti-base-value> `;
    render(template(), document.body);

    const qtiBaseValue = document.body.querySelector('qti-base-value') as QtiBaseValue;
    expect(qtiBaseValue.calculate()).toMatch('1.034');
  });

  it('should return value in the correct baseType(directedPair)', () => {
    const template = () => html` <qti-base-value base-type="directedPair">GT1 G1</qti-base-value> `;
    render(template(), document.body);

    const qtiBaseValue = document.body.querySelector('qti-base-value') as QtiBaseValue;
    expect(qtiBaseValue.calculate()).toMatch('GT1 G1');
  });
});
