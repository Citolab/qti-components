import { html, LitElement, render } from 'lit';
import { ShuffleMixin } from './shuffle-mixin';

class TestElement extends ShuffleMixin(LitElement, 'qti-simple-choice') {
  shuffle: boolean;
  render() {
    return html` <slot></slot> `;
  }
}
customElements.define('test-element', TestElement);

describe('ShuffleMixin', () => {
  afterEach(async () => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  }); // MANDATORY

  let element: TestElement;

  beforeEach(async () => {
    render(
      html`
        <test-element>
          <qti-simple-choice></qti-simple-choice>
          <qti-simple-choice></qti-simple-choice>
          <qti-simple-choice fixed></qti-simple-choice>
          <qti-simple-choice></qti-simple-choice>
        </test-element>
      `,
      document.body
    );
  });

  it('should shuffle non-fixed choices when shuffle is true', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const initialOrder = choices.map((choice, i) => String(i + 1));

    // Reset shuffle
    element.shuffle = true;
    await element.updateComplete;

    const resetOrder = choices.map(choice => choice.style.order);
    // debugger;
    expect(initialOrder).not.to.deep.equal(resetOrder);
  });

  // TODO: fix me!!
  // it('should not shuffle choices when shuffle is false', async () => {
  //   element = document.querySelector('test-element') as TestElement;
  //   element.shuffle = true;
  //   await element.updateComplete;

  //   const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
  //   const nonFixedChoices = choices.filter(choice => !choice.hasAttribute('fixed'));

  //   const initialOrder = nonFixedChoices.map(choice => choice.style.order);

  //   // Enable shuffle
  //   element.shuffle = false;
  //   await element.updateComplete;

  //   const shuffledOrder = nonFixedChoices.map(choice => choice.style.order);

  //   expect(initialOrder).to.deep.equal(shuffledOrder);
  // });
});
