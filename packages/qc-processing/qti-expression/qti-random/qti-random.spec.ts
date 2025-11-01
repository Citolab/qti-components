import '../../../../qti-components';
import { html, render } from 'lit';
import './qti-random';

import type { QtiRandom } from './qti-random';
describe('qti-random', () => {
  it('pick random', () => {
    const template = () => html`
      <qti-random>
        <qti-multiple>
          <qti-base-value base-type="integer">45</qti-base-value>
          <qti-base-value base-type="integer">60</qti-base-value>
          <qti-base-value base-type="integer">75</qti-base-value>
          <qti-base-value base-type="integer">90</qti-base-value>
          <qti-base-value base-type="integer">90</qti-base-value>
          <qti-base-value base-type="integer">90</qti-base-value>
        </qti-multiple>
      </qti-random>
    `;
    render(template(), document.body);

    const random = document.body.querySelector('qti-random') as QtiRandom;

    expect(['45', '60', '75', '90'].includes(random.calculate())).toBeTruthy();
  });
});
