/**
 * Mixin that provides shuffling functionality for a LitElement.
 * @template T - The type of the LitElement subclass.
 * @param {T} superClass - The superclass to extend.
 * @param {string} selector - The CSS selector for the elements to shuffle.
 * @returns {Constructor<ShuffleInterface> & T} - The extended class with shuffling functionality.
 *
 * adds a shuffle property to the class with an attribute converter
 *
 * qti-inline-choice-interaction
 * qti-choice-interaction
 * qti-match-interaction
 */
import { property } from 'lit/decorators.js';
import { Interaction } from '../interaction/interaction';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class ShuffleInterface {}
export const ShuffleMixin = <T extends Constructor<Interaction>>(superClass: T, selector: string) => {
  abstract class ShuffleElement extends superClass {
    /** <span style="color:blue">some *blue* text</span>. Does not work in storybook */
    @property({ type: String, reflect: true })
    shuffle: 'true' | 'false' = 'false'; // Defaults to 'false'

    connectedCallback() {
      super.connectedCallback();
      this._applyShuffle();
    }

    updated(changedProperties: Map<string, unknown>) {
      if (changedProperties.has('shuffle')) {
        this._applyShuffle();
      }
    }

    private _applyShuffle() {
      if (this.shuffle === 'true') {
        this._shuffleChoices();
      } else {
        this._resetShuffleChoices();
      }
    }

    private _shuffleChoices() {
      const choices = Array.from(this.querySelectorAll<HTMLElement>(selector));
      const fixedChoices = choices.filter(choice => choice.hasAttribute('fixed'));
      const nonFixedChoices = choices.filter(choice => !choice.hasAttribute('fixed'));

      if (nonFixedChoices.length <= 1) {
        console.warn('Shuffling is not possible with fewer than 2 non-fixed elements.');
        return;
      }

      const originalOrder = [...nonFixedChoices];
      let shuffled = false;
      let attempts = 0;

      // Shuffle until the result is different or attempts are exceeded
      while (!shuffled && attempts < 10) {
        attempts++;
        for (let i = nonFixedChoices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonFixedChoices[i], nonFixedChoices[j]] = [nonFixedChoices[j], nonFixedChoices[i]];
        }
        shuffled = !nonFixedChoices.every((choice, index) => choice === originalOrder[index]);
      }

      if (!shuffled) {
        console.warn('Failed to shuffle the choices after multiple attempts.');
      }

      // Apply order styles
      let order = 1;
      [...fixedChoices, ...nonFixedChoices].forEach(choice => {
        choice.style.setProperty('order', String(order++));
      });
    }

    private _resetShuffleChoices() {
      this.querySelectorAll<HTMLElement>(selector).forEach(choice => {
        choice.style.setProperty('order', 'initial');
      });
    }
  }

  return ShuffleElement as Constructor<ShuffleInterface> & T;
};
