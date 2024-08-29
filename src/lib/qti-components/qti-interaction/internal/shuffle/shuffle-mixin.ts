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

type Constructor<T = {}> = new (...args: any[]) => T;

declare class ShuffleInterface {}

export const ShuffleMixin = <T extends Constructor<LitElement>>(superClass: T, selector: string) => {
  class ShuffleElement extends superClass {
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

    private _shuffleChoices() {
      const choices = Array.from(this.querySelectorAll(selector));

      const fixedElements = [];
      const nonFixedElements = [];

      // Separate fixed and non-fixed elements
      choices.forEach((choice, index) => {
        if (choice.hasAttribute('fixed')) {
          fixedElements.push({ element: choice, index: index });
        } else {
          nonFixedElements.push(choice);
        }
      });

      // Shuffle non-fixed elements
      for (let i = nonFixedElements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonFixedElements[i], nonFixedElements[j]] = [nonFixedElements[j], nonFixedElements[i]];
      }

      // Assign order to each element
      let order = 1;
      choices.forEach((choice: HTMLElement, index) => {
        if (choice.hasAttribute('fixed')) {
          choice.style.order = String(order++);
        } else {
          const nonFixedChoice = nonFixedElements.shift();
          nonFixedChoice.style.order = order++;
        }
      });
    }

    private _resetShuffleChoices() {
      const choices = Array.from(this.querySelectorAll('qti-simple-choice'));
      choices.forEach((choice, index) => {
        choice.style.order = 'initial';
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
