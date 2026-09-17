import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiMathConstant } from './qti-math-constant';

describe('qti-math-constant', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  const constant = (name: string) => {
    render(html`<qti-math-constant name="${name}"></qti-math-constant>`, testContainer);
    return (testContainer.querySelector('qti-math-constant') as QtiMathConstant).calculate();
  };

  it('returns pi', () => {
    expect(constant('pi')).toBeCloseTo(Math.PI, 10);
  });

  it('returns e', () => {
    expect(constant('e')).toBeCloseTo(Math.E, 10);
  });

  it('is case insensitive', () => {
    expect(constant('PI')).toBeCloseTo(Math.PI, 10);
  });

  it('returns null for a name outside the vocabulary', () => {
    expect(constant('tau')).toBeNull();
  });

  it('feeds its value into a surrounding expression', () => {
    render(
      html`
        <qti-product>
          <qti-math-constant name="pi"></qti-math-constant>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-product>
      `,
      testContainer
    );
    const product = testContainer.querySelector('qti-product') as any;
    expect(product.calculate()).toBeCloseTo(Math.PI * 2, 10);
  });
});
