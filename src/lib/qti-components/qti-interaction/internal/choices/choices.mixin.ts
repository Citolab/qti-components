import { property, query } from 'lit/decorators.js';
import { watch } from '../../../../decorators/watch';

import { ChoiceInterface } from '../active-element/active-element.mixin';
import { Interaction } from '../interaction/interaction';
import { IInteraction } from '../interaction/interaction.interface';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type Choice = HTMLElement & ChoiceInterface & { internals: ElementInternals };

export interface ChoicesInterface extends IInteraction {
  correctResponse: string | string[];
}

export const ChoicesMixin = <T extends Constructor<Interaction>>(superClass: T, selector: string) => {
  abstract class ChoicesMixinElement extends superClass implements ChoicesInterface {
    protected _choiceElements: Choice[] = [];

    @query('#validationMessage')
    private _validationMessageElement!: HTMLElement;

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

    private _value: string | string[] = '';

    get value(): string | string[] {
      return Array.isArray(this._value) ? this._value.join(',') : this._value;
    }

    set value(val: string | string[]) {
      if (this.maxChoices > 1 && typeof val === 'string') {
        this._value = val.split(',');
      } else {
        this._value = val;
      }
      // Assuming this.value is an array of strings
      if (Array.isArray(this._value)) {
        const formData = new FormData();
        this._value.forEach(response => {
          formData.append(this.responseIdentifier, response);
        });
        this._internals.setFormValue(formData);
      } else {
        // Handle the case where this.value is not an array
        this._internals.setFormValue(this._value);
      }
      this._updateChoiceSelection();
    }

    public get correctResponse(): string | string[] {
      return this._correctResponse;
    }

    public set correctResponse(value: string | string[]) {
      this._correctResponse = value;
      const responseArray = Array.isArray(value) ? value : [value];
      this._choiceElements.forEach(choice => {
        choice.internals.states.delete('correct-response');
        choice.internals.states.delete('incorrect-response');
        if (responseArray.length > 0) {
          if (responseArray.includes(choice.identifier)) {
            choice.internals.states.add('correct-response');
          } else {
            choice.internals.states.add('incorrect-response');
          }
        }
      });
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
      const selectedChoices = this._choiceElements.filter(choice => this._getChoiceChecked(choice));
      const selectedCount = selectedChoices.length;
      let isValid = true;
      let validityMessage = '';
      if (this.maxChoices !== 0 && selectedCount > this.maxChoices) {
        isValid = false;
        validityMessage = this.dataset.maxSelectionsMessage || `You can select at most ${this.maxChoices} choices.`;
      } else if (selectedCount < this.minChoices) {
        isValid = false;
        validityMessage = this.dataset.minSelectionsMessage || `You must select at least ${this.minChoices} choices.`;
      }

      if (selectedChoices.length > 0) {
        this._internals.setValidity(
          isValid ? {} : { customError: true },
          validityMessage,
          selectedChoices[selectedCount - 1] || this._choiceElements[0] || this
        );
      }
      this.reportValidity();
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

    private _registerChoiceElement(event: CustomEvent) {
      event.stopPropagation();
      const choiceElement = event.target as Choice;
      choiceElement.disabled = this.disabled;

      this._choiceElements.push(choiceElement);
      this._setInputType(choiceElement);
    }

    private _unregisterChoiceElement(event: CustomEvent) {
      event.stopPropagation();
      const choiceElement = event.target as Choice;
      this._choiceElements = this._choiceElements.filter(choice => choice !== choiceElement);
    }

    private _determineInputType() {
      this._choiceElements.forEach(choice => {
        this._setInputType(choice);
      });
    }

    private _setInputType(choiceElement: Choice) {
      this._internals.ariaLabel = this.maxChoices === 1 ? 'radio-group' : 'checkbox-group';

      choiceElement.internals.role = this.maxChoices === 1 ? 'radio' : 'checkbox';
      choiceElement.internals.states.add(choiceElement.internals.role);
    }

    protected _choiceElementSelectedHandler(event: CustomEvent<{ identifier: string }>) {
      this._toggleChoiceChecked(event.target as Choice);
      if (this.maxChoices === 1) {
        this._choiceElements.forEach(choice => {
          if (choice.identifier !== event.detail.identifier) {
            this._setChoiceChecked(choice, false);
          }
        });
      }
      this._handleChoiceSelection();
    }

    private _setChoiceChecked(choice: Choice, checked: boolean) {
      if (choice.internals?.states) {
        if (checked) {
          choice.internals.states.add('--checked');
          choice.internals.ariaChecked = 'true';
        } else {
          choice.internals.states.delete('--checked');
          choice.internals.ariaChecked = 'false';
        }
      }
    }

    private _getChoiceChecked(choice: Choice): boolean {
      return choice.internals.states.has('--checked');
    }

    private _toggleChoiceChecked(choice: Choice) {
      const checked = this._getChoiceChecked(choice);
      this._setChoiceChecked(choice, !checked);
    }

    private _handleChoiceSelection() {
      const selectedChoices = this._choiceElements.filter(choice => this._getChoiceChecked(choice));
      const selectedIdentifiers = selectedChoices.map(choice => choice.identifier);

      this.value = this.maxChoices === 1 ? selectedIdentifiers[0] || '' : selectedIdentifiers;
      this.validate();
      this.saveResponse(this._value);
    }

    /**
     * Updates the selection state of each choice element based on the current response.
     */
    private _updateChoiceSelection() {
      const responseArray = Array.isArray(this._value) ? this._value : [this._value];
      this._choiceElements.forEach(choice => {
        const isSelected = responseArray.includes(choice.identifier);
        this._setChoiceChecked(choice, isSelected);
      });
    }
  }
  return ChoicesMixinElement as Constructor<ChoicesInterface> & T;
};
