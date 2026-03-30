import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiStatsOperator } from './qti-stats-operator';

describe('qti-stats-operator', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  it('calculates the mean of a numeric container', () => {
    const template = () => html`
      <qti-stats-operator name="mean">
        <qti-ordered>
          <qti-base-value base-type="integer">2</qti-base-value>
          <qti-base-value base-type="integer">4</qti-base-value>
          <qti-base-value base-type="integer">6</qti-base-value>
        </qti-ordered>
      </qti-stats-operator>
    `;
    render(template(), testContainer);

    const qtiStatsOperator = testContainer.querySelector('qti-stats-operator') as QtiStatsOperator;
    expect(qtiStatsOperator.calculate()).toBe(4);
  });

  it('calculates the population standard deviation (popSD)', () => {
    const template = () => html`
      <qti-stats-operator name="popSD">
        <qti-ordered>
          <qti-base-value base-type="integer">2</qti-base-value>
          <qti-base-value base-type="integer">4</qti-base-value>
          <qti-base-value base-type="integer">4</qti-base-value>
          <qti-base-value base-type="integer">4</qti-base-value>
          <qti-base-value base-type="integer">5</qti-base-value>
          <qti-base-value base-type="integer">5</qti-base-value>
          <qti-base-value base-type="integer">7</qti-base-value>
          <qti-base-value base-type="integer">9</qti-base-value>
        </qti-ordered>
      </qti-stats-operator>
    `;
    render(template(), testContainer);

    const qtiStatsOperator = testContainer.querySelector('qti-stats-operator') as QtiStatsOperator;
    expect(qtiStatsOperator.calculate()).toBeCloseTo(2, 6);
  });
});
