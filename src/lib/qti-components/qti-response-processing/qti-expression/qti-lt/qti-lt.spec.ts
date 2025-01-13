import '../../../../index';

import { html, render } from 'lit';
import type { QtiLt } from './qti-lt';
describe('qti-gt', () => {
  it('equal = false', () => {
    const template = () => html`
      <qti-lt>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">1</qti-base-value>
      </qti-lt>
    `;
    render(template(), document.body);

    const qtiLt = document.body.querySelector('qti-lt') as QtiLt;
    expect(qtiLt.calculate()).toBeFalsy();
  });

  it('less = true', () => {
    const template = () => html`
      <qti-lt>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">2</qti-base-value>
      </qti-lt>
    `;
    render(template(), document.body);

    const qtiLt = document.body.querySelector('qti-lt') as QtiLt;
    expect(qtiLt.calculate()).toBeTruthy();
  });

  it('greater = false', () => {
    const template = () => html`
      <qti-lt>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">0</qti-base-value>
      </qti-lt>
    `;
    render(template(), document.body);

    const qtiLt = document.body.querySelector('qti-lt') as QtiLt;
    expect(qtiLt.calculate()).toBeFalsy();
  });
});
