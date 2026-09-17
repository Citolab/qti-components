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
  // The rest of the QTI vocabulary, which previously fell through to a warning
  // and a null.
  const stat = (name: string, values: number[]) => {
    render(
      html`
        <qti-stats-operator name="${name}">
          <qti-ordered>
            ${values.map(value => html`<qti-base-value base-type="integer">${value}</qti-base-value>`)}
          </qti-ordered>
        </qti-stats-operator>
      `,
      testContainer
    );
    return (testContainer.querySelector('qti-stats-operator') as QtiStatsOperator).calculate();
  };

  it('calculates the median of an odd-sized container', () => {
    expect(stat('median', [7, 1, 5])).toBe(5);
  });

  it('averages the two middle values for an even-sized container', () => {
    expect(stat('median', [1, 5, 7, 11])).toBe(6);
  });

  it('calculates the population variance', () => {
    expect(stat('popVariance', [2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(4, 6);
  });

  it('calculates the sample variance', () => {
    // n-1 denominator: 32/7 rather than the population's 32/8.
    expect(stat('sampleVariance', [2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(32 / 7, 6);
  });

  it('calculates the sample standard deviation', () => {
    expect(stat('sampleSD', [2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(Math.sqrt(32 / 7), 6);
  });

  it('returns null for a sample statistic over a single value', () => {
    expect(stat('sampleSD', [3])).toBeNull();
    expect(stat('sampleVariance', [3])).toBeNull();
  });
});
