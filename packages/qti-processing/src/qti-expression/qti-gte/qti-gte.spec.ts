import '@qti-components/components';

import { html, render } from 'lit';

import type { QtiGte } from './qti-gte';
describe('qti-gte', () => {
  it('equal = true', () => {
    const template = () => html`
      <qti-gte>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">1</qti-base-value>
      </qti-gte>
    `;
    render(template(), document.body);

    const gte = document.body.querySelector('qti-gte') as QtiGte;
    expect(gte.calculate()).toBeTruthy();
  });

  it('less = false', () => {
    const template = () => html`
      <qti-gte>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">2</qti-base-value>
      </qti-gte>
    `;
    render(template(), document.body);

    const qtiGte = document.body.querySelector('qti-gte') as QtiGte;
    expect(qtiGte.calculate()).toBeFalsy();
  });

  it('greater = true', () => {
    const template = () => html`
      <qti-gte>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">0</qti-base-value>
      </qti-gte>
    `;
    render(template(), document.body);

    const qtiGte = document.body.querySelector('qti-gte') as QtiGte;
    expect(qtiGte.calculate()).toBeTruthy();
  });
});
