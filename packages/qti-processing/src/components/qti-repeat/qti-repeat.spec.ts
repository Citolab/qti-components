import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiRepeat } from './qti-repeat';

describe('qti-repeat', () => {
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

  it('repeats the child expression a fixed number of times', () => {
    const template = () => html`
      <qti-repeat number-repeats="3">
        <qti-base-value base-type="integer">7</qti-base-value>
      </qti-repeat>
    `;
    render(template(), testContainer);

    const qtiRepeat = testContainer.querySelector('qti-repeat') as QtiRepeat;
    const result = qtiRepeat.calculate();

    expect(result).toHaveLength(3);
    expect(result.map(item => item.value)).toEqual(['7', '7', '7']);
  });

  it('repeats based on a template variable identifier', async () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-template-declaration identifier="n" base-type="integer" cardinality="single">
          <qti-default-value>2</qti-default-value>
        </qti-template-declaration>
        <qti-repeat number-repeats="n">
          <qti-base-value base-type="integer">4</qti-base-value>
        </qti-repeat>
      </qti-assessment-item>
    `;
    render(template(), testContainer);

    const templateDeclaration = testContainer.querySelector('qti-template-declaration') as any;
    await templateDeclaration.updateComplete;

    const qtiRepeat = testContainer.querySelector('qti-repeat') as QtiRepeat;
    const result = qtiRepeat.calculate();

    expect(result).toHaveLength(2);
    expect(result.map(item => item.value)).toEqual(['4', '4']);
  });
});
