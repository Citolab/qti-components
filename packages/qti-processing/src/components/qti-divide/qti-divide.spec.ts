import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiDivide } from './qti-divide';

describe('qti-divide', () => {
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

  it('divides the first value by the second value', () => {
    const template = () => html`
      <qti-divide>
        <qti-base-value base-type="integer">10</qti-base-value>
        <qti-base-value base-type="integer">2</qti-base-value>
      </qti-divide>
    `;
    render(template(), testContainer);

    const qtiDivide = testContainer.querySelector('qti-divide') as QtiDivide;
    expect(qtiDivide.calculate()).toBe(5);
  });

  it('returns null when dividing by zero', () => {
    const template = () => html`
      <qti-divide>
        <qti-base-value base-type="integer">10</qti-base-value>
        <qti-base-value base-type="integer">0</qti-base-value>
      </qti-divide>
    `;
    render(template(), testContainer);

    const qtiDivide = testContainer.querySelector('qti-divide') as QtiDivide;
    expect(qtiDivide.calculate()).toBeNull();
  });
});
