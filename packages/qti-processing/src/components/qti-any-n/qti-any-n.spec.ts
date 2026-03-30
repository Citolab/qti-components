import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiAnyN } from './qti-any-n';

describe('qti-any-n', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    testContainer.remove();
  });

  it('returns true when the number of true values is within the min and max range', () => {
    render(
      html`
        <qti-any-n min="1" max="2">
          <qti-base-value base-type="boolean">true</qti-base-value>
          <qti-base-value base-type="boolean">false</qti-base-value>
          <qti-base-value base-type="boolean">true</qti-base-value>
        </qti-any-n>
      `,
      testContainer
    );

    const operator = testContainer.querySelector('qti-any-n') as QtiAnyN;
    expect(operator.calculate()).toBe(true);
  });
});
