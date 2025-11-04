import { describe, it, expect } from 'vitest';
import '@qti-components/components';

import { html, render } from 'lit';

import type { QtiGt } from './qti-gt';
describe('qti-gt', () => {
  it('equal = false', () => {
    const template = () => html`
      <qti-gt>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">1</qti-base-value>
      </qti-gt>
    `;
    render(template(), document.body);

    const gt = document.body.querySelector('qti-gt') as QtiGt;
    expect(gt.calculate()).toBeFalsy();
  });

  it('less = false', () => {
    const template = () => html`
      <qti-gt>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">2</qti-base-value>
      </qti-gt>
    `;
    render(template(), document.body);

    const qtiGt = document.body.querySelector('qti-gt') as QtiGt;
    expect(qtiGt.calculate()).toBeFalsy();
  });

  it('greater = true', () => {
    const template = () => html`
      <qti-gt>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-base-value base-type="integer">0</qti-base-value>
      </qti-gt>
    `;
    render(template(), document.body);

    const qtiGt = document.body.querySelector('qti-gt') as QtiGt;
    expect(qtiGt.calculate()).toBeTruthy();
  });
});
