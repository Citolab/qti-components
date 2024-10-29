import { LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { watch } from '../../../../decorators/watch';
import { ChoiceInterface } from '../active-element/active-element.mixin';

type Constructor<T = {}> = new (...args: any[]) => T;

type Choice = HTMLElement & ChoiceInterface & { internals: ElementInternals };


export interface InteractionInterface {
    validate(): boolean;

}

export interface ChoicesInterface extends InteractionInterface {
  _choiceElements: Array<Choice>;
  correctResponse: string | string[];
}

export const ChoicesMixin = <T extends Constructor<LitElement>>(superClass: T, selector: string) => {
  class ChoicesMixinElement extends superClass implements ChoicesInterface {
    static formAssociated = true;

    public _choiceElements: Choice[] = [];
    private _internals: ElementInternals;

    @query('#validationMessage')
    private _validationMessageElement!: HTMLElement;

    @property({ attribute: 'response-identifier' })
    public responseIdentifier = '';

    @property({ type: Number, attribute: 'min-choices' })
    public minChoices = 0;

    @property({ type: Number, attribute: 'max-choices' }) maxChoices = 1;
        
    @watch('maxChoices', { waitUntilFirstUpdate: true })
    _handleMaxChoicesChange(_oldValue: number, _newValue: number) {
      this._determineInputType();
    }

    @property({ reflect: true, type: Boolean }) disabled = false;
    @watch('disabled', { waitUntilFirstUpdate: true })
    _handleDisabledChange = (_: boolean, disabled: boolean) => {
      this._choiceElements.forEach(ch => (ch.disabled = disabled));
    };

    @property({ reflect: true, type: Boolean }) readonly = false;
    @watch('readonly', { waitUntilFirstUpdate: true })
    _handleReadonlyChange = (_: boolean, readonly: boolean) => {
      this._choiceElements.forEach(choice => (choice.readonly = readonly));
    };

    _value: string;
    _response: string | string[];
    
    get value() {
      return Array.isArray(this._response) ? this._response.join(',') : this._response;
    }
    
    set value(val) {
      this._value = val;
      this._internals.setFormValue("response", this.value);
      if (this.maxChoices > 1) {
        this.response = val.split(',');
      } else {
        this.response = val;
      }
    }

    public get response(): string | string[] {
      return this._response;
    }

    public set response(responseValue: string | string[]) {
      const responseArray = Array.isArray(responseValue) ? responseValue : [responseValue];
      this._choiceElements.forEach(choice => {
        this._setChoiceChecked(choice, responseArray.includes(choice.identifier));
      });
    }

    constructor(...args: any[]) {
      super(...args);
      this._internals = this.attachInternals();
    }

    public validate(): boolean {
      const selectedChoices = this._choiceElements.filter(choice => this._getChoiceChecked(choice));
      const selectedCount = selectedChoices.length;
      let isValid = true;
      let validityMessage = '';

      if (this.maxChoices !== 0 && selectedCount > this.maxChoices) {
        isValid = false;
        validityMessage = this.dataset.maxSelectionsMessage;
        // validityMessage = `You can select at most ${this.maxChoices} choices.`;
      } else if (selectedCount < this.minChoices) {
        isValid = false;
        validityMessage = this.dataset.minSelectionsMessage;
        // validityMessage = `You must select at least ${this.minChoices} choices.`;
      }

      this._internals.setValidity(isValid ? {} : { customError: true }, validityMessage,

        // find the latest choice element which has been checked
        selectedChoices[selectedCount - 1] || this._choiceElements[0] || this

      );
      return isValid;
    }

    reportValidity() {
      console.log('reportValidity');
      const isValid = this.validate();
      if (!isValid) {
        this._validationMessageElement.textContent = this._internals.validationMessage;
        this._validationMessageElement.style.display = 'block';
      } else {
        this._validationMessageElement.textContent = '';
        this._validationMessageElement.style.display = 'none';
      }
      return this._internals.reportValidity();
    }



    public set correctResponse(responseValue: string | string[]) {
      const responseArray = Array.isArray(responseValue) ? responseValue : [responseValue];
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
      this.dispatchEvent(
        new CustomEvent(`qti-register-interaction`, {
          bubbles: true,
          composed: true
        })
      );
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener(`register-${selector}`, this._registerChoiceElement);
      this.removeEventListener(`unregister-${selector}`, this._unregisterChoiceElement);
      this.removeEventListener(`activate-${selector}`, this._choiceElementSelectedHandler);
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
      choiceElement.setAttribute('role', this.maxChoices === 1 ? 'radio' : 'checkbox');
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
      if (checked) {
        choice.internals.states.add('checked');
        choice.internals.ariaChecked = 'true';
      } else {
        choice.internals.states.delete('checked');
        choice.internals.ariaChecked = 'false';
      }
    }

    private _getChoiceChecked(choice: Choice): boolean {
      return choice.internals.states.has('checked');
    }

    private _toggleChoiceChecked(choice: Choice) {
      const checked = this._getChoiceChecked(choice);
      this._setChoiceChecked(choice, !checked);
    }

    /**
     * Handles the selection of choices.
     *
     * This method filters the choice elements based on their checked state and retrieves the selected identifiers.
     * Finally, it saves the response based on the `maxChoices` property.
     */
    protected _handleChoiceSelection() {
      const selectedChoices = this._choiceElements.filter(choice => this._getChoiceChecked(choice));
      const selectedIdentifiers = selectedChoices.map(choice => choice.identifier);

      /**
       * The response from the interaction.
       * If `maxChoices` is 1, it will be the selected identifier or `undefined` if no identifier is selected.
       * If `maxChoices` is greater than 1, it will be an array of selected identifiers.
       */
      this.response = this.maxChoices === 1 ? selectedIdentifiers[0] || undefined : selectedIdentifiers;
      this.validate();
      this._saveResponse();
    }

    protected _saveResponse() {
      this.dispatchEvent(
        new CustomEvent('qti-interaction-response', {
          bubbles: true,
          composed: true,
          detail: {
            responseIdentifier: this.responseIdentifier,
            response: this.response
          }
        })
      );
    }
  }
  return ChoicesMixinElement as Constructor<ChoicesInterface> & T;
};
