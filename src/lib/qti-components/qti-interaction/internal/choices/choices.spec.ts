import '../../qti-simple-choice';

import { getByTestId, userEvent } from '@storybook/test';
import { html, LitElement, render } from 'lit';
import { ChoicesMixin } from './choices.mixin';

class TestElement extends ChoicesMixin(LitElement, 'qti-simple-choice') {
  render() {
    return html`<slot></slot> `;
  }
}
customElements.define('test-element', TestElement);

describe('ChoicesMixin', () => {
  beforeEach(async () => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  }); // MANDATORY

  let element: TestElement;

  /*
   * min-choices: 0 (unlimited)
   * max-choices: 1
   */
  describe('default', () => {
    beforeEach(async () => {
      render(
        html`
          <test-element>
            <qti-simple-choice data-testid="A">Option A</qti-simple-choice>
            <qti-simple-choice data-testid="B">Option B</qti-simple-choice>
            <qti-simple-choice data-testid="C">Option C</qti-simple-choice>
            <qti-simple-choice data-testid="D">Option D</qti-simple-choice>
          </test-element>
        `,
        document.body
      );
      element = document.querySelector('test-element') as TestElement;
      await element.updateComplete;
    });

    it('should have role attribute set to "radio" for the first child element', async () => {
      expect(element.children[0].getAttribute('role')).toBe('radio');
      expect(element.validate()).toBeTruthy();
      await userEvent.click(element.children[0]);
      expect(element.validate()).toBeTruthy();
    });
  });

  describe('min-choices = 1', () => {
    beforeEach(async () => {
      render(
        html`
          <test-element min-choices="1">
            <qti-simple-choice data-testid="A">Option A</qti-simple-choice>
            <qti-simple-choice data-testid="B">Option B</qti-simple-choice>
            <qti-simple-choice data-testid="C">Option C</qti-simple-choice>
            <qti-simple-choice data-testid="D">Option D</qti-simple-choice>
          </test-element>
        `,
        document.body
      );
      element = document.querySelector('test-element') as TestElement;
      await element.updateComplete;
    });

    it('should have role attribute set to "radio" for the first child element', async () => {
      const choiceA = getByTestId(document.body, 'A');
      const choiceB = getByTestId(document.body, 'B');

      expect(element.children[0].getAttribute('role')).toBe('radio');
      expect(element.validate()).toBeFalsy();

      await userEvent.click(choiceA);
      expect(choiceA.getAttribute('aria-checked')).toBe('true');
      expect(choiceB.getAttribute('aria-checked')).toBe('false');

      await userEvent.click(choiceB);
      expect(choiceB.getAttribute('aria-checked')).toBe('true');
      expect(element.validate()).toBeTruthy();
    });
  });

  describe('min-choices = 1, max-choices = 2', () => {
    beforeEach(async () => {
      render(
        html`
          <test-element min-choices="1" max-choices="2">
            <qti-simple-choice data-testid="A">Option A</qti-simple-choice>
            <qti-simple-choice data-testid="B">Option B</qti-simple-choice>
            <qti-simple-choice data-testid="C">Option C</qti-simple-choice>
            <qti-simple-choice data-testid="D">Option D</qti-simple-choice>
          </test-element>
        `,
        document.body
      );
      element = document.querySelector('test-element') as TestElement;
      await element.updateComplete;
    });

    it('should have role attribute set to "radio" for the first child element', async () => {
      expect(element.children[0].getAttribute('role')).toBe('checkbox');
      expect(element.validate()).toBeFalsy();
      await userEvent.click(element.children[0]);
      expect(getByTestId(document.body, 'A').getAttribute('aria-checked')).toBe('true');
      await userEvent.click(element.children[1]);
      expect(getByTestId(document.body, 'B').getAttribute('aria-checked')).toBe('true');
    });
  });
});
