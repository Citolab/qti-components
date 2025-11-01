import '../../../../qti-components';
import { html, render } from 'lit';

import type { QtiLte } from './qti-lte';
describe('qti-lte', () => {
  it('equal = true', () => {
    const template = () => html`
      <qti-lte>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">1</qti-base-value>
      </qti-lte>
    `;
    render(template(), document.body);

    const lte = document.body.querySelector('qti-lte') as QtiLte;
    expect(lte.calculate()).toBeTruthy();
  });

  it('less = true', () => {
    const template = () => html`
      <qti-lte>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">2</qti-base-value>
      </qti-lte>
    `;
    render(template(), document.body);

    const qtilte = document.body.querySelector('qti-lte') as QtiLte;
    expect(qtilte.calculate()).toBeTruthy();
  });

  it('greater = false', () => {
    const template = () => html`
      <qti-lte>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">0</qti-base-value>
      </qti-lte>
    `;
    render(template(), document.body);

    const qtilte = document.body.querySelector('qti-lte') as QtiLte;
    expect(qtilte.calculate()).toBeFalsy();
  });
});
