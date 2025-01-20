import '../../../../index';
import { html, render } from 'lit';

import type { QtiIsNull } from './qti-is-null';
describe('qti-is-null', () => {
  it('null = true', () => {
    const template = () => html`
      <qti-is-null>
        <qti-base-value base-type="identifier"></qti-base-value>
      </qti-is-null>
    `;
    render(template(), document.body);

    const qtiIsNull = document.body.querySelector('qti-is-null') as QtiIsNull;
    expect(qtiIsNull.calculate()).toBeTruthy();
  });

  it('not null = false', () => {
    const template = () => html`
      <qti-is-null>
        <qti-base-value base-type="identifier">Test</qti-base-value>
      </qti-is-null>
    `;
    render(template(), document.body);

    const qtiGte = document.body.querySelector('qti-is-null') as QtiIsNull;
    expect(qtiGte.calculate()).toBeFalsy();
  });
});
