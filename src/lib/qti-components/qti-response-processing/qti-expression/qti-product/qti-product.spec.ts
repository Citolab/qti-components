import '../../../../index';
import { html, render } from 'lit';
import { QtiProduct } from './qti-product';

describe('qti-product', () => {
  it('multiplies, the product of one or more variables', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-product>
          <qti-base-value base-type="integer">12</qti-base-value>
          <qti-base-value base-type="integer">3</qti-base-value>
        </qti-product>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiProduct = document.body.querySelector('qti-product') as QtiProduct;

    expect(qtiProduct.calculate()).toBe(36);
  });

  it('product is empty', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-product>
          <qti-base-value base-type="integer"></qti-base-value>
        </qti-product>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiProduct = document.body.querySelector('qti-product') as QtiProduct;

    expect(qtiProduct.calculate()).toBeNaN();
  });
});
