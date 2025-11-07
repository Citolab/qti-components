import '@citolab/qti-components';
import { getByTestId, userEvent } from 'storybook/test';
import { html, render } from 'lit';

import { Interaction } from '@qti-components/base';

import { ChoicesMixin } from './choices.mixin';

import type { Choice } from './choices.mixin';

class TestElement extends ChoicesMixin(Interaction, 'qti-simple-choice') {
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
            <qti-simple-choice identifier="A" data-testid="A">Option A</qti-simple-choice>
            <qti-simple-choice identifier="B" data-testid="B">Option B</qti-simple-choice>
            <qti-simple-choice identifier="C" data-testid="C">Option C</qti-simple-choice>
            <qti-simple-choice identifier="D" data-testid="D">Option D</qti-simple-choice>
          </test-element>
        `,
        document.body
      );
      element = document.querySelector('test-element') as TestElement;
      await element.updateComplete;
    });

    it('should have role attribute set to "radio" for the first child element', async () => {
      const choiceA = getByTestId(document.body, 'A') as Choice;

      expect(choiceA.internals.role).toBe('radio');
      expect(element.validate()).toBeTruthy();
      await userEvent.click(element.children[0]);
      expect(element.validate()).toBeTruthy();
    });
  });

  describe('min-choices = 1', () => {
    beforeEach(async () => {
      render(
        html`
          <test-element max-choices="1">
            <qti-simple-choice identifier="A" data-testid="A">Option A</qti-simple-choice>
            <qti-simple-choice identifier="B" data-testid="B">Option B</qti-simple-choice>
            <qti-simple-choice identifier="C" data-testid="C">Option C</qti-simple-choice>
            <qti-simple-choice identifier="D" data-testid="D">Option D</qti-simple-choice>
          </test-element>
        `,
        document.body
      );
      element = document.querySelector('test-element') as TestElement;
      await element.updateComplete;
    });

    it('should have role attribute set to "radio" for the first child element', async () => {
      const choiceA = getByTestId(document.body, 'A') as Choice;
      const choiceB = getByTestId(document.body, 'B') as Choice;

      expect(choiceA.internals.role).toBe('radio');

      await userEvent.click(choiceA);

      expect(choiceA.internals.states.has('--checked')).toBe(true);
      expect(choiceA.internals.ariaChecked).toBe('true');

      await userEvent.click(choiceB);
      expect(choiceB.internals.states.has('--checked')).toBe(true);
      expect(choiceB.internals.ariaChecked).toBe('true');
    });
  });

  describe('min-choices = 1, max-choices = 2', () => {
    beforeEach(async () => {
      render(
        html`
          <test-element min-choices="1" max-choices="2">
            <qti-simple-choice identifier="A" data-testid="A">Option A</qti-simple-choice>
            <qti-simple-choice identifier="B" data-testid="B">Option B</qti-simple-choice>
            <qti-simple-choice identifier="C" data-testid="C">Option C</qti-simple-choice>
            <qti-simple-choice identifier="D" data-testid="D">Option D</qti-simple-choice>
          </test-element>
        `,
        document.body
      );
      element = document.querySelector('test-element') as TestElement;
      await element.updateComplete;
    });

    it('should have role attribute set to "checkbox" for the first child element', async () => {
      const choiceA = getByTestId(document.body, 'A') as Choice;
      const choiceB = getByTestId(document.body, 'B') as Choice;

      expect(choiceA.internals.role).toBe('checkbox');
      // expect(element.children[0].getAttribute('role')).toBe('checkbox');
      expect(element.validate()).toBeFalsy();
      await userEvent.click(element.children[0]);
      expect(choiceA.internals.states.has('--checked')).toBe(true);
      expect(choiceA.internals.ariaChecked).toBe('true');
      await userEvent.click(element.children[1]);
      expect(choiceB.internals.states.has('--checked')).toBe(true);
      expect(choiceB.internals.ariaChecked).toBe('true');
    });
  });
});
