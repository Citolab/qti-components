import { property, query, state } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';
import { responseAttributeConverter } from '@qti-components/base';

import type { ComplexAttributeConverter } from 'lit';
import type { Interaction, ValidatableInteraction } from '@qti-components/base';
import type { ChoiceInterface } from '../active-element/active-element.mixin';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type Choice = HTMLElement & ChoiceInterface & { internals: ElementInternals };

export interface ChoicesInterface extends ValidatableInteraction {
  minChoices: number;
  maxChoices: number;
  value: string | null;
  response: string | string[] | null;
}

export const ChoicesMixin = <T extends Constructor<Interaction>>(superClass: T, selector: string) => {
  abstract class ChoicesMixinElement extends superClass implements ChoicesInterface {
    protected _choiceElements: Choice[] = [];

    #mutationObserver: MutationObserver | null = null;

    @query('#validation-message')
    protected _validationMessageElement!: HTMLElement;

    @property({ type: Number, attribute: 'min-choices' })
    public minChoices = 0;

    @property({ type: Number, attribute: 'max-choices' })
    public maxChoices = 1;

    /* removed waitUntilFirstUpdate to fix issues with stories and tests */
    @watch('maxChoices')
    protected _handleMaxChoicesChange(_oldValue: number, _newValue: number) {
      this._determineInputType();
    }

    @watch('disabled', { waitUntilFirstUpdate: true })
    protected _handleDisabledChange = (_: boolean, disabled: boolean) => {
      this._choiceElements.forEach(ch => (ch.disabled = disabled));
    };

    @watch('readonly', { waitUntilFirstUpdate: true })
    protected _handleReadonlyChange = (_: boolean, readonly: boolean) => {
      this._choiceElements.forEach(choice => (choice.readonly = readonly));
    };

    @property({
      attribute: 'response',
      reflect: false,
      converter: responseAttributeConverter({ emptyAs: '' }) as ComplexAttributeConverter<unknown, unknown>
    })
    response: string | string[] | null = '';

    @watch('response', { waitUntilFirstUpdate: true })
    protected _handleValueChange = () => {
      this._internals.setFormValue(this.value);
      this._updateChoiceSelection();
    };

    override get value(): string | null {
      if (Array.isArray(this.response) && this.response.length === 0) {
        return null;
      } else if (this.response === '') {
        return null;
      }
      return Array.isArray(this.response) ? this.response.join(',') : this.response;
    }

    override set value(val: string | null) {
      if (this.maxChoices > 1 && (typeof val === 'string' || val === null)) {
        this.response = !val ? [] : val.toString().split(',');
      } else {
        this.response = val || '';
      }
    }

    protected override firstUpdated() {
      super.firstUpdated();
      // The `response` watcher has waitUntilFirstUpdate:true, so an initial
      // value set via the `response` attribute never fires it — sync the
      // radios/checkboxes explicitly here.
      this._updateChoiceSelection();
    }

    override connectedCallback() {
      super.connectedCallback();
      this.addEventListener(`activate-${selector}`, this._choiceElementSelectedHandler);

      // Use MutationObserver to track choice elements (handles both direct children and nested descendants)
      this.#mutationObserver = new MutationObserver(() => this._syncChoicesFromDOM());
      this.#mutationObserver.observe(this, { childList: true, subtree: true });

      // Initial sync after DOM is ready
      this._syncChoicesFromDOM();
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener(`activate-${selector}`, this._choiceElementSelectedHandler);

      // Disconnect the observer
      if (this.#mutationObserver) {
        this.#mutationObserver.disconnect();
        this.#mutationObserver = null;
      }
    }

    /**
     * Synchronizes the internal choice elements list with the current DOM state.
     * Also filters the response to only include valid identifiers.
     */
    protected _syncChoicesFromDOM() {
      const previousChoices = new Set(this._choiceElements);
      this._choiceElements = Array.from(this.querySelectorAll(selector)) as Choice[];

      // Initialize new choice elements
      this._choiceElements.forEach(choiceElement => {
        if (!previousChoices.has(choiceElement)) {
          // New choice element - initialize it
          if (this.disabled) {
            choiceElement.disabled = true;
          }
          choiceElement.readonly = this.readonly;

          if (choiceElement.internals && !choiceElement.internals.ariaChecked) {
            choiceElement.internals.ariaChecked = 'false';
          }
        }
      });

      // Choices pull their own role from `interactionContext`; nothing to push here.
      this._determineInputType();

      // Filter response to only include valid identifiers (handles removal)
      const validIdentifiers = new Set(this._choiceElements.map(c => c.identifier));
      if (Array.isArray(this.response)) {
        const filteredResponse = this.response.filter(id => validIdentifiers.has(id));
        if (filteredResponse.length !== this.response.length) {
          this.response = filteredResponse;
        }
      } else if (this.response && !validIdentifiers.has(this.response)) {
        this.response = '';
      }

      // Update selection state to match response
      this._updateChoiceSelection();
    }

    public validate(): boolean {
      const selectedChoices = this._choiceElements.filter(choice => this._getChoiceChecked(choice));
      const selectedCount = selectedChoices.length;
      let isValid = true;
      let validityMessage = '';
      if (this.maxChoices !== 0 && selectedCount > this.maxChoices) {
        isValid = false;
        validityMessage =
          this.dataset.maxSelectionsMessage ||
          `Please select no more than ${this.maxChoices} ${this.maxChoices === 1 ? 'option' : 'options'}.`;
      } else if (selectedCount < this.minChoices) {
        isValid = false;
        validityMessage =
          this.dataset.minSelectionsMessage ||
          `Please select at least ${this.minChoices} ${this.minChoices === 1 ? 'option' : 'options'}.`;
      }

      // Always set validity state, regardless of whether there are selections.
      const anchor = this._choiceElements.find(c => this.contains(c)) || this;
      this.setInteractionValidity(isValid, validityMessage, anchor, { suppressInline: true });

      return isValid;
    }

    override reportValidity() {
      return super.reportValidity();
    }

    /**
     * Publish the role the choices should take. Each choice subscribes to
     * `interactionContext` and applies its own ARIA role and `:state(radio|checkbox)`.
     *
     * The interaction no longer reaches into its children to do this. That also removes the
     * upgrade-order hazard the old code worked around: a choice that had not yet upgraded had
     * no `internals`, so the push silently did nothing. A subscriber applies the role whenever
     * it is ready.
     */
    protected _determineInputType() {
      this._internals.role = this.maxChoices === 1 ? 'radiogroup' : null;
      const choiceRole = this.maxChoices === 1 ? 'radio' : 'checkbox';
      if (this._interactionContext.choiceRole !== choiceRole) {
        this._interactionContext = { ...this._interactionContext, choiceRole };
      }
    }

    protected _choiceElementSelectedHandler(event: CustomEvent<{ identifier: string }>) {
      this._toggleChoiceChecked(event.target as Choice);
      const shouldDisableAtMax = this.resolveDisableAfterMaxReached({ defaultWhenUnset: false });
      if (this.maxChoices === 1) {
        this._choiceElements.forEach(choice => {
          if (choice.identifier !== event.detail.identifier) {
            this._setChoiceChecked(choice, false);
          }
        });
      } else if (this.maxChoices !== 0 && shouldDisableAtMax) {
        const selectedChoices = this._choiceElements.filter(choice => this._getChoiceChecked(choice));
        if (selectedChoices.length >= this.maxChoices) {
          this._choiceElements.forEach(choice => {
            if (!this._getChoiceChecked(choice)) {
              choice.disabled = true;
            }
          });
        } else {
          this._choiceElements.forEach(choice => (choice.disabled = false));
        }
      }

      this._handleChoiceSelection();
    }

    protected _setChoiceChecked(choice: Choice, checked: boolean) {
      if (choice.internals?.states) {
        if (checked) {
          choice.internals.states.add('checked');
          choice.internals.ariaChecked = 'true';
        } else {
          choice.internals.states.delete('checked');
          choice.internals.ariaChecked = 'false';
        }
      }
    }

    protected _getChoiceChecked(choice: Choice): boolean {
      return choice.internals.states.has('checked');
    }

    protected _toggleChoiceChecked(choice: Choice) {
      const checked = this._getChoiceChecked(choice);
      this._setChoiceChecked(choice, !checked);
    }

    protected _handleChoiceSelection() {
      const selectedChoices = this._choiceElements.filter(choice => this._getChoiceChecked(choice));
      const selectedIdentifiers = selectedChoices.map(choice => choice.identifier);

      this.response = this.maxChoices === 1 ? selectedIdentifiers[0] || '' : selectedIdentifiers;

      this.validate();

      // Always update the configured validity UI mode after user-driven selection changes.
      // This ensures inline messages are cleared immediately when state becomes valid again.
      this.reportValidity();

      this.saveResponse(this.response);
    }

    /**
     * Updates the selection state of each choice element based on the current response.
     */
    protected _updateChoiceSelection() {
      const responseArray = Array.isArray(this.response) ? this.response : [this.response];
      this._choiceElements.forEach(choice => {
        const isSelected = responseArray.includes(choice.identifier);
        this._setChoiceChecked(choice, isSelected);
      });
    }
  }
  return ChoicesMixinElement as Constructor<ChoicesInterface> & T;
};
