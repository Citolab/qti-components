import { property, query, state } from 'lit/decorators.js';

import { watch } from '../../../../decorators/watch';

import type { ResponseVariable } from '../../../../exports/variables';
import type { ChoiceInterface } from '../active-element/active-element.mixin';
import type { Interaction } from '../../../../exports/interaction';
import type { IInteraction } from '../../../../exports/interaction.interface';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type Choice = HTMLElement &
  ChoiceInterface & {
    internals: ElementInternals;
    inputType: 'checkbox' | 'radio';
    groupName?: string;
    hideControl?: boolean;
    checked: boolean;
  };

export interface ChoicesInterface extends IInteraction {
  minChoices: number;
  maxChoices: number;
  value: string | null;
  response: string | string[] | null;
  toggleCorrectResponse(responseVariable: ResponseVariable, show: boolean): void;
  validate(): boolean;
  reportValidity(): boolean;
}

export const ChoicesMixin = <T extends Constructor<Interaction>>(superClass: T, selector: string) => {
  abstract class ChoicesMixinElement extends superClass implements ChoicesInterface {
    protected _choiceElements: Choice[] = [];
    protected _lastSelectedChoice: Choice | null = null;

    @query('#validationMessage')
    protected _validationMessageElement!: HTMLElement;

    @property({ type: Number, attribute: 'min-choices' })
    public minChoices = 0;

    @property({ type: Number, attribute: 'max-choices' })
    public maxChoices = 1;

    @watch('maxChoices', { waitUntilFirstUpdate: true })
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

    @state() response: string | string[] | null = '';

    @watch('response', { waitUntilFirstUpdate: true })
    protected _handleValueChange = () => {
      this._internals.setFormValue(this.value);
      this._updateChoiceSelection();
    };

    get value(): string | null {
      if (Array.isArray(this.response) && this.response.length === 0) {
        return null;
      } else if (this.response === '') {
        return null;
      }
      return Array.isArray(this.response) ? this.response.join(',') : this.response;
    }

    set value(val: string | null) {
      if (this.maxChoices > 1 && (typeof val === 'string' || val === null)) {
        this.response = !val ? [] : val.toString().split(',');
      } else {
        this.response = val || '';
      }
    }

    public toggleCorrectResponse(responseVariable: ResponseVariable, show: boolean) {
      if (responseVariable.correctResponse) {
        const responseArray = Array.isArray(responseVariable.correctResponse)
          ? responseVariable.correctResponse
          : [responseVariable.correctResponse];
        this._choiceElements.forEach(choice => {
          choice.internals.states.delete('correct-response');
          choice.internals.states.delete('incorrect-response');
          if (show && responseArray.length > 0) {
            if (responseArray.includes(choice.identifier)) {
              choice.internals.states.add('correct-response');
            } else {
              choice.internals.states.add('incorrect-response');
            }
          }
        });
      }
    }

    override connectedCallback() {
      super.connectedCallback();
      this.addEventListener(`register-${selector}`, this._registerChoiceElement);
      this.addEventListener(`unregister-${selector}`, this._unregisterChoiceElement);
      this.addEventListener(`activate-${selector}`, this._choiceElementSelectedHandler);
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener(`register-${selector}`, this._registerChoiceElement);
      this.removeEventListener(`unregister-${selector}`, this._unregisterChoiceElement);
      this.removeEventListener(`activate-${selector}`, this._choiceElementSelectedHandler);
    }

    public validate(): boolean {
      const selectedChoices = this._choiceElements.filter(choice => choice.checked);
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

      if (selectedChoices.length > 0 || this._choiceElements.length > 0) {
        this._internals.setValidity(
          isValid ? {} : { customError: true },
          validityMessage,
          selectedChoices[selectedCount - 1] || this._choiceElements[0] || this
        );
      }
      return isValid;
    }

    override reportValidity() {
      if (this._validationMessageElement) {
        if (!this._internals.validity.valid) {
          this._validationMessageElement.textContent = this._internals.validationMessage;
          this._validationMessageElement.style.display = 'block';
        } else {
          this._validationMessageElement.textContent = '';
          this._validationMessageElement.style.display = 'none';
        }
      }
      return this._internals.validity.valid;
    }

    protected _registerChoiceElement = (event: CustomEvent) => {
      event.stopPropagation();
      const choiceElement = event.target as Choice;
      choiceElement.disabled = this.disabled;

      this._choiceElements.push(choiceElement);
      this._setInputType(choiceElement);
    };

    protected _unregisterChoiceElement = (event: CustomEvent) => {
      event.stopPropagation();
      const choiceElement = event.target as Choice;
      this._choiceElements = this._choiceElements.filter(choice => choice !== choiceElement);

      // Reset lastSelectedChoice if it's being unregistered
      if (this._lastSelectedChoice === choiceElement) {
        this._lastSelectedChoice = null;
      }
    };

    protected _determineInputType() {
      this._choiceElements.forEach(choice => {
        this._setInputType(choice);
      });
    }

    protected _setInputType(choiceElement: Choice) {
      // Set the container role
      this._internals.role = this.maxChoices === 1 ? 'radiogroup' : 'group';

      // Set input type for the choice element
      choiceElement.inputType = this.maxChoices === 1 ? 'radio' : 'checkbox';

      // If this is a radio button, ensure they all share the same name for grouping
      const groupName = 'group-' + (this.getAttribute('response-identifier') || 'response');
      choiceElement.groupName = groupName;
      choiceElement.hideControl = this.classList.contains('qti-input-control-hidden');

      // Keep ARIA roles for accessibility
      const role = this.maxChoices === 1 ? 'radio' : 'checkbox';
      choiceElement.internals.role = role;
    }

    protected _choiceElementSelectedHandler = (event: CustomEvent<{ identifier: string }>) => {
      const choiceElement = event.target as Choice;

      // Handle radio button unselection
      if (this.maxChoices === 1) {
        // If this was the previously selected radio and is now unchecked
        // we need to update the response
        if (this._lastSelectedChoice === choiceElement && !choiceElement.checked) {
          // Radio was unselected, set response to empty
          this.response = '';
          this._lastSelectedChoice = null;
          this.saveResponse(this.response);
          this.validate();
          return;
        }

        // Otherwise, normal radio selection behavior
        if (choiceElement.checked) {
          // Store the last selected choice for radio unselection tracking
          this._lastSelectedChoice = choiceElement;

          // Uncheck all other radio buttons
          this._choiceElements.forEach(choice => {
            if (choice !== choiceElement && choice.checked) {
              choice.checked = false;
            }
          });
        }
      }

      this._handleChoiceSelection();
    };

    protected _handleChoiceSelection() {
      const selectedChoices = this._choiceElements.filter(choice => choice.checked);
      const selectedIdentifiers = selectedChoices.map(choice => choice.identifier);

      this.response = this.maxChoices === 1 ? selectedIdentifiers[0] || '' : selectedIdentifiers;

      this.validate();
      this.saveResponse(this.response);
    }

    /**
     * Updates the selection state of each choice element based on the current response.
     */
    protected _updateChoiceSelection() {
      const responseArray = Array.isArray(this.response) ? this.response : [this.response];

      let foundSelected = false;

      this._choiceElements.forEach(choice => {
        const isSelected = responseArray.includes(choice.identifier);
        choice.checked = isSelected;

        if (isSelected && this.maxChoices === 1) {
          this._lastSelectedChoice = choice;
          foundSelected = true;
        }
      });

      // If no choice is selected in radio mode, reset the lastSelectedChoice
      if (!foundSelected && this.maxChoices === 1) {
        this._lastSelectedChoice = null;
      }
    }
  }
  return ChoicesMixinElement as Constructor<ChoicesInterface> & T;
};
