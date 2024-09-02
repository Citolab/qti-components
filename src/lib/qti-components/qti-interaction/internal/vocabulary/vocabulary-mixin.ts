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
import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { QtiChoice } from '../choice/qti-choice';
import { QtiSimpleChoice } from '../../qti-simple-choice';

type Constructor<T = {}> = new (...args: any[]) => T;

type LabelType = 'qti-labels-decimal' | 'qti-labels-lower-alpha' | 'qti-labels-upper-alpha';
type LabelSuffixType = 'qti-labels-suffix-period' | 'qti-labels-suffix-parenthesis';

declare class VocabularyInterface {}

export const VocabularyMixin = <T extends Constructor<LitElement>>(superClass: T, selector: string) => {
  class VocabularyElement extends superClass {
    private _classes: string[] = [];
    private _allLabels = ['qti-labels-decimal', 'qti-labels-lower-alpha', 'qti-labels-upper-alpha'];
    private _allLabelSuffixes = ['qti-labels-suffix-period', 'qti-labels-suffix-parenthesis'];
    // Define the property with the custom converter
    @property({
      type: String,
      reflect: true
    })
    set class(value: string) {
      if (!value) {
        return;
      }
      // const oldValue = this._classes.join(' ');
      this._classes = value.split(' ');

      this._addLabels();
      // this.requestUpdate('class', oldValue);
    }
    get class(): string {
      return this._classes?.join(' ') || '';
    }

    protected override updated(_changedProperties: PropertyValues): void {
      super.updated(_changedProperties);
      if (_changedProperties.has('shuffle')) {
        this._addLabels();
      }
    }

    private _addLabels() {
      const classContainsLabel = this._classes.some(
        cls => this._allLabels.includes(cls) || this._allLabelSuffixes.includes(cls)
      );
      const isNumber = value => {
        return !isNaN(+value);
      };
      if (classContainsLabel) {
        const choiceElements = Array.from(this.querySelectorAll('qti-simple-choice')).map(c => c as QtiSimpleChoice);
        const choices = choiceElements
          .map((choice: HTMLElement, index) => {
            return { el: choice, order: isNumber(choice.style.order) ? +choice.style.order : index + 1 };
          })
          .sort((a, b) => a.order - b.order)
          .map(choice => choice.el);
        for (let i = 0; i < choices.length; i++) {
          (choices[i] as QtiSimpleChoice).marker = this._getLabel(i + 1);
        }
      }
    }
    private _getLabel(index: number) {
      let lastLabel = this._classes.filter(c => this._allLabels.includes(c)).pop();
      const lastLabelSuffix = this._classes.filter(c => this._allLabelSuffixes.includes(c)).pop();

      if (!lastLabel && lastLabelSuffix) {
        // a suffix without a label is strange so add qti-labels-upper-alpha
        lastLabel = 'qti-labels-upper-alpha';
      }
      let label = '';
      switch (lastLabel) {
        case 'qti-labels-decimal':
          label = `${index}`;
          break;
        case 'qti-labels-lower-alpha':
          label = `${String.fromCharCode(97 + index - 1)}`;
          break;
        case 'qti-labels-upper-alpha':
          label = `${String.fromCharCode(65 + index - 1)}`;
          break;
      }
      if (lastLabelSuffix === 'qti-labels-suffix-period') {
        label += '.';
      } else if (lastLabelSuffix === 'qti-labels-suffix-parenthesis') {
        label += `)`;
      }
      return label;
    }
  }
  return VocabularyElement as Constructor<VocabularyInterface> & T;
};
