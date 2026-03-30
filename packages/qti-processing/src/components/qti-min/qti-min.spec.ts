import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiMin } from './qti-min';

describe('qti-min', () => {
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

  it('returns the minimum value from an ordered container', () => {
    const template = () => html`
      <qti-min>
        <qti-ordered>
          <qti-base-value base-type="integer">3</qti-base-value>
          <qti-base-value base-type="integer">-5</qti-base-value>
          <qti-base-value base-type="integer">12</qti-base-value>
        </qti-ordered>
      </qti-min>
    `;
    render(template(), testContainer);

    const qtiMin = testContainer.querySelector('qti-min') as QtiMin;
    expect(qtiMin.calculate()).toBe(-5);
  });

  it('returns null when no numeric values are provided', () => {
    const template = () => html` <qti-min></qti-min> `;
    render(template(), testContainer);

    const qtiMin = testContainer.querySelector('qti-min') as QtiMin;
    expect(qtiMin.calculate()).toBeNull();
  });
});
