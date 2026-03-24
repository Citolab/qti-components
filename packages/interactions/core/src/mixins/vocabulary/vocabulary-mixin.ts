import { property } from 'lit/decorators.js';

import type { QtiSimpleChoice } from '../../elements/qti-simple-choice';
import type { LitElement, PropertyValues } from 'lit';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

type LabelType =
  | 'qti-labels-none'
  | 'qti-labels-decimal'
  | 'qti-labels-lower-alpha'
  | 'qti-labels-upper-alpha';
type LabelSuffixType =
  | 'qti-labels-suffix-none'
  | 'qti-labels-suffix-period'
  | 'qti-labels-suffix-parenthesis';

declare class VocabularyInterface {}

export const VocabularyMixin = <T extends Constructor<LitElement>>(superClass: T, _selector: string) => {
  abstract class VocabularyElement extends superClass {
    #classes: string[] = [];
    #allLabels: LabelType[] = [
      'qti-labels-none',
      'qti-labels-decimal',
      'qti-labels-lower-alpha',
      'qti-labels-upper-alpha',
    ];
    #allLabelSuffixes: LabelSuffixType[] = [
      'qti-labels-suffix-none',
      'qti-labels-suffix-period',
      'qti-labels-suffix-parenthesis',
    ];
    #mutationObserver: MutationObserver | null = null;

    @property({
      type: String,
      attribute: 'class',
    })
    set class(value: string) {
      this.#classes = this.#tokenizeClasses(value);
      this.#syncLabels();
    }

    get class(): string {
      return this.#classes.join(' ');
    }

    override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      super.attributeChangedCallback(name, oldValue, newValue);

      if (name === 'class' && oldValue !== newValue) {
        this.class = newValue ?? '';
      }
    }

    protected override updated(_changedProperties: PropertyValues): void {
      super.updated(_changedProperties);
      this.#syncLabels();
    }

    override connectedCallback(): void {
      super.connectedCallback();
      this.class = this.getAttribute('class') ?? '';
      this.#mutationObserver = new MutationObserver(mutations => {
        if (
          mutations.some(
            mutation =>
              mutation.type === 'childList' ||
              (mutation.type === 'attributes' && mutation.attributeName === 'style')
          )
        ) {
          this.#syncLabels();
        }
      });
      this.#mutationObserver.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
      });
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this.#mutationObserver?.disconnect();
      this.#mutationObserver = null;
    }

    #tokenizeClasses(value: string | null | undefined): string[] {
      if (!value) return [];

      return value
        .split(/\s+/)
        .map(token => token.trim())
        .filter(Boolean)
        .filter((token, index, tokens) => tokens.indexOf(token) === index);
    }

    #syncLabels() {
      const choiceElements = Array.from(this.querySelectorAll('qti-simple-choice')).map(c => c as QtiSimpleChoice);
      const choices = this.#getOrderedChoices(choiceElements);
      const labelType = this.#getActiveLabelType();
      const labelSuffixType = this.#getActiveLabelSuffixType();

      choices.forEach((choice, index) => {
        choice.marker = this.#getLabel(index + 1, labelType, labelSuffixType);
      });
    }

    #getOrderedChoices(choiceElements: QtiSimpleChoice[]): QtiSimpleChoice[] {
      return choiceElements
        .map((choice, index) => {
          const order = Number(choice.style.order);
          return { el: choice, order: Number.isFinite(order) ? order : index + 1, index };
        })
        .sort((a, b) => a.order - b.order || a.index - b.index)
        .map(choice => choice.el);
    }

    #getActiveLabelType(): LabelType | null {
      return this.#classes.filter(c => this.#allLabels.includes(c as LabelType)).pop() as LabelType | undefined ?? null;
    }

    #getActiveLabelSuffixType(): LabelSuffixType | null {
      return this.#classes.filter(c => this.#allLabelSuffixes.includes(c as LabelSuffixType)).pop() as LabelSuffixType | undefined ?? null;
    }

    #getLabel(index: number, labelType: LabelType | null, labelSuffixType: LabelSuffixType | null): string {
      let effectiveLabelType = labelType;

      if (!effectiveLabelType && labelSuffixType && labelSuffixType !== 'qti-labels-suffix-none') {
        effectiveLabelType = 'qti-labels-upper-alpha';
      }

      if (!effectiveLabelType || effectiveLabelType === 'qti-labels-none') {
        return '';
      }

      let label = '';
      switch (effectiveLabelType) {
        case 'qti-labels-decimal':
          label = `${index}`;
          break;
        case 'qti-labels-lower-alpha':
          label = this.#toAlphabetic(index, 'lower');
          break;
        case 'qti-labels-upper-alpha':
          label = this.#toAlphabetic(index, 'upper');
          break;
      }

      if (labelSuffixType === 'qti-labels-suffix-period') {
        return `${label}.`;
      }

      if (labelSuffixType === 'qti-labels-suffix-parenthesis') {
        return `${label})`;
      }

      return label;
    }

    #toAlphabetic(index: number, casing: 'lower' | 'upper'): string {
      let value = index;
      let label = '';
      const charCodeBase = casing === 'lower' ? 97 : 65;

      while (value > 0) {
        value -= 1;
        label = String.fromCharCode(charCodeBase + (value % 26)) + label;
        value = Math.floor(value / 26);
      }

      return label;
    }
  }
  return VocabularyElement as Constructor<VocabularyInterface> & T;
};
