import { html, render } from 'lit';
import { VocabularyMixin } from './vocabulary-mixin';
import '../../qti-simple-choice';
import { ShuffleMixin } from '../shuffle/shuffle-mixin';
import { Interaction } from '../interaction/interaction';
class TestElement extends VocabularyMixin(ShuffleMixin(Interaction, 'qti-simple-choice'), 'qti-simple-choice') {
  class: string;
  shuffle: boolean;
  render() {
    return html` <slot></slot> `;
  }
  validate(): boolean {
    return true;
  }
  get value() {
    return '';
  }
}
customElements.define('test-element', TestElement);

describe('VocabularyMixin', () => {
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
          <qti-simple-choice></qti-simple-choice>
          <qti-simple-choice></qti-simple-choice>
        </test-element>
      `,
      document.body
    );
  });

  it('check marker none', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-none';
    await element.updateComplete;

    expect(choices[0].marker).toBe(undefined);
    expect(choices[1].marker).toBe(undefined);
    expect(choices[2].marker).toBe(undefined);
    expect(choices[3].marker).toBe(undefined);

    expect(choices[0].shadowRoot.querySelector('#label')).toBe(null);
    expect(choices[1].shadowRoot.querySelector('#label')).toBe(null);
    expect(choices[2].shadowRoot.querySelector('#label')).toBe(null);
    expect(choices[3].shadowRoot.querySelector('#label')).toBe(null);
  });

  it('check marker decimal', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-decimal';
    await element.updateComplete;

    expect(choices[0].marker).toBe('1');
    expect(choices[1].marker).toBe('2');
    expect(choices[2].marker).toBe('3');
    expect(choices[3].marker).toBe('4');

    expect(choices[0].shadowRoot.querySelector('#label').textContent).toBe('1');
    expect(choices[1].shadowRoot.querySelector('#label').textContent).toBe('2');
    expect(choices[2].shadowRoot.querySelector('#label').textContent).toBe('3');
    expect(choices[3].shadowRoot.querySelector('#label').textContent).toBe('4');
  });

  it('check marker lower alpha', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-lower-alpha';
    await element.updateComplete;

    expect(choices[0].marker).toBe('a');
    expect(choices[1].marker).toBe('b');
    expect(choices[2].marker).toBe('c');
    expect(choices[3].marker).toBe('d');

    expect(choices[0].shadowRoot.querySelector('#label').textContent).toBe('a');
    expect(choices[1].shadowRoot.querySelector('#label').textContent).toBe('b');
    expect(choices[2].shadowRoot.querySelector('#label').textContent).toBe('c');
    expect(choices[3].shadowRoot.querySelector('#label').textContent).toBe('d');
  });

  it('check marker upper alpha', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-upper-alpha';
    await element.updateComplete;

    expect(choices[0].marker).toBe('A');
    expect(choices[1].marker).toBe('B');
    expect(choices[2].marker).toBe('C');
    expect(choices[3].marker).toBe('D');

    expect(choices[0].shadowRoot.querySelector('#label').textContent).toBe('A');
    expect(choices[1].shadowRoot.querySelector('#label').textContent).toBe('B');
    expect(choices[2].shadowRoot.querySelector('#label').textContent).toBe('C');
    expect(choices[3].shadowRoot.querySelector('#label').textContent).toBe('D');
  });

  it('check marker upper alpha shuffle', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const rawChoices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-upper-alpha';
    element.shuffle = true;

    // shuffle changes the order of the choices

    await element.updateComplete;

    const choices = rawChoices.sort((a, b) => +a.style.order - +b.style.order);
    expect(choices[0].marker).toBe('A');
    expect(choices[1].marker).toBe('B');
    expect(choices[2].marker).toBe('C');
    expect(choices[3].marker).toBe('D');

    expect(choices[0].shadowRoot.querySelector('#label').textContent).toBe('A');
    expect(choices[1].shadowRoot.querySelector('#label').textContent).toBe('B');
    expect(choices[2].shadowRoot.querySelector('#label').textContent).toBe('C');
    expect(choices[3].shadowRoot.querySelector('#label').textContent).toBe('D');
  });

  it('check marker lower alpha and suffix none', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-lower-alpha qti-labels-suffix-none';
    await element.updateComplete;

    expect(choices[0].marker).toBe('a');
    expect(choices[1].marker).toBe('b');
    expect(choices[2].marker).toBe('c');
    expect(choices[3].marker).toBe('d');

    expect(choices[0].shadowRoot.querySelector('#label').textContent).toBe('a');
    expect(choices[1].shadowRoot.querySelector('#label').textContent).toBe('b');
    expect(choices[2].shadowRoot.querySelector('#label').textContent).toBe('c');
    expect(choices[3].shadowRoot.querySelector('#label').textContent).toBe('d');
  });

  it('check marker lower alpha and suffix period', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-lower-alpha qti-labels-suffix-period';
    await element.updateComplete;

    expect(choices[0].marker).toBe('a.');
    expect(choices[1].marker).toBe('b.');
    expect(choices[2].marker).toBe('c.');
    expect(choices[3].marker).toBe('d.');

    expect(choices[0].shadowRoot.querySelector('#label').textContent).toBe('a.');
    expect(choices[1].shadowRoot.querySelector('#label').textContent).toBe('b.');
    expect(choices[2].shadowRoot.querySelector('#label').textContent).toBe('c.');
    expect(choices[3].shadowRoot.querySelector('#label').textContent).toBe('d.');
  });

  it('check marker lower alpha and suffix parenthesis', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-lower-alpha qti-labels-suffix-parenthesis';
    await element.updateComplete;

    expect(choices[0].marker).toBe('a)');
    expect(choices[1].marker).toBe('b)');
    expect(choices[2].marker).toBe('c)');
    expect(choices[3].marker).toBe('d)');

    expect(choices[0].shadowRoot.querySelector('#label').textContent).toBe('a)');
    expect(choices[1].shadowRoot.querySelector('#label').textContent).toBe('b)');
    expect(choices[2].shadowRoot.querySelector('#label').textContent).toBe('c)');
    expect(choices[3].shadowRoot.querySelector('#label').textContent).toBe('d)');
  });

  it('check marker suffix parenthesis only', async () => {
    element = document.querySelector('test-element') as TestElement;
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));

    element.class = 'qti-labels-suffix-parenthesis';
    await element.updateComplete;

    expect(choices[0].marker).toBe('A)');
    expect(choices[1].marker).toBe('B)');
    expect(choices[2].marker).toBe('C)');
    expect(choices[3].marker).toBe('D)');

    expect(choices[0].shadowRoot.querySelector('#label').textContent).toBe('A)');
    expect(choices[1].shadowRoot.querySelector('#label').textContent).toBe('B)');
    expect(choices[2].shadowRoot.querySelector('#label').textContent).toBe('C)');
    expect(choices[3].shadowRoot.querySelector('#label').textContent).toBe('D)');
  });
});
