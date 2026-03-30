import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiMax } from './qti-max';

describe('qti-max', () => {
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

  it('returns the maximum value from an ordered container', () => {
    const template = () => html`
      <qti-max>
        <qti-ordered>
          <qti-base-value base-type="integer">3</qti-base-value>
          <qti-base-value base-type="integer">-5</qti-base-value>
          <qti-base-value base-type="integer">12</qti-base-value>
        </qti-ordered>
      </qti-max>
    `;
    render(template(), testContainer);

    const qtiMax = testContainer.querySelector('qti-max') as QtiMax;
    expect(qtiMax.calculate()).toBe(12);
  });

  it('returns null when no numeric values are provided', () => {
    const template = () => html` <qti-max></qti-max> `;
    render(template(), testContainer);

    const qtiMax = testContainer.querySelector('qti-max') as QtiMax;
    expect(qtiMax.calculate()).toBeNull();
  });
});
