import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiOrdered } from './qti-ordered';
describe('qti-ordered', () => {
  it('should return an array with the calculated results of its children, single child', () => {
    const template = () => html`
      <qti-ordered>
        <qti-base-value base-type="identifier">DriverC</qti-base-value>
        <qti-base-value base-type="identifier">DriverB</qti-base-value>
        <qti-base-value base-type="identifier">DriverA</qti-base-value>
      </qti-ordered>
    `;
    render(template(), document.body);

    const qtiOrdered = document.body.querySelector('qti-ordered') as QtiOrdered;
    const calculated = qtiOrdered.calculate();
    expect(calculated[0].value).toMatch('DriverC');
  });

  it('should return an array with the calculated results of its children, 3 children', () => {
    const template = () => html`
      <qti-ordered>
        <qti-base-value base-type="identifier">DriverC</qti-base-value>
        <qti-base-value base-type="identifier">DriverB</qti-base-value>
        <qti-base-value base-type="identifier">DriverA</qti-base-value>
      </qti-ordered>
    `;
    render(template(), document.body);

    const qtiOrdered = document.body.querySelector('qti-ordered') as QtiOrdered;
    const calculated = qtiOrdered.calculate();
    expect(calculated[2].value).toMatch('DriverA');
  });
});
