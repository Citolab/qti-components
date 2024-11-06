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
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { Interaction } from '../interaction/interaction';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class ShuffleInterface {}
export const ShuffleMixin = <T extends Constructor<Interaction>>(superClass: T, selector: string) => {
  abstract class ShuffleElement extends superClass {
    private _shuffle: boolean = false;

    // Define the property with the custom converter
    @property({
      type: String,
      reflect: true,
      converter: stringToBooleanConverter
    })
    set shuffle(value: boolean) {
      const oldValue = this._shuffle;
      this._shuffle = value;
      if (value) {
        this._shuffleChoices();
      } else {
        this._resetShuffleChoices();
      }
      this.requestUpdate('shuffle', oldValue);
    }

    get shuffle(): boolean {
      return this._shuffle;
    }

    connectedCallback() {
      super.connectedCallback();
      // Call _resetShuffleChoices initially to set the CSS order to initial.
      // If shuffle is true, _shuffleChoices will be called automatically via the setter.
      if (this.shuffle) {
        this._shuffleChoices();
      } else {
        this._resetShuffleChoices();
      }
    }

    private _shuffleChoices() {
      const choices = Array.from(this.querySelectorAll<HTMLElement>(selector));
      const fixedElements: Array<{ element: HTMLElement; index: number }> = [];
      const nonFixedElements: Array<HTMLElement> = [];

      // Separate fixed and non-fixed elements
      choices.forEach((choice, index) => {
        if (choice.hasAttribute('fixed')) {
          fixedElements.push({ element: choice, index: index });
        } else {
          nonFixedElements.push(choice);
        }
      });

      // If there are 1 or fewer non-fixed elements, throw an error (no shuffle possible)
      if (nonFixedElements.length <= 1) {
        console.warn('Shuffling is not possible with fewer than 2 non-fixed elements.');
        return;
      }

      let isShuffled = false;
      const maxAttempts = 10; // Max attempts to prevent infinite loops
      let attempt = 0;

      // Create a copy of the original order for comparison
      const originalOrder = [...nonFixedElements];

      // Shuffle until the result is different or maxAttempts is reached
      while (!isShuffled && attempt < maxAttempts) {
        attempt++;

        // Shuffle non-fixed elements
        for (let i = nonFixedElements.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonFixedElements[i], nonFixedElements[j]] = [nonFixedElements[j], nonFixedElements[i]];
        }

        // Check if the shuffled result is different from the original order
        isShuffled = !nonFixedElements.every((choice, index) => choice === originalOrder[index]);

        if (isShuffled) break;
      }

      if (!isShuffled) {
        console.warn('Failed to shuffle the choices after multiple attempts.');
      }

      // Assign order to each element
      let order = 1;
      choices.forEach((choice: HTMLElement, index) => {
        if (choice.hasAttribute('fixed')) {
          choice.style.setProperty('order', String(order++));
        } else {
          const nonFixedChoice = nonFixedElements.shift();
          nonFixedChoice!.style.setProperty('order', String(order++));
        }
      });
    }

    private _resetShuffleChoices() {
      const choices = Array.from(this.querySelectorAll('qti-simple-choice'));
      choices.forEach((choice, index) => {
        choice.style.setProperty('order', 'initial'); // choice.style.order = 'initial';
      });
    }
  }
  return ShuffleElement as Constructor<ShuffleInterface> & T;
};

const stringToBooleanConverter = {
  fromAttribute(value: string | null): boolean {
    return value === 'true';
  },
  toAttribute(value: boolean): string {
    return value ? 'true' : 'false';
  }
};
