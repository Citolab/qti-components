import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../../../decorators/watch';
import { ChoiceInterface } from '../active-element/active-element.mixin';

type Constructor<T = {}> = new (...args: any[]) => T;

type Choice = HTMLElement & ChoiceInterface;

export interface ChoicesInterface {
  validate(): boolean;
  _choiceElements: Array<Choice>;
  correctResponse: string | string[];
}

export const ChoicesMixin = <T extends Constructor<LitElement>>(superClass: T, selector: string) => {
  class ChoicesMixinElement extends superClass implements ChoicesInterface {
    public _choiceElements: Choice[] = [];

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

    constructor(...args: any[]) {
      super(...args);
    }

    public validate(): boolean {
      const selectedCount = this._choiceElements.filter(choice => this._getChoiceChecked(choice)).length;
      if (this.maxChoices !== 0 && selectedCount > this.maxChoices) {
        return false;
      }
      return selectedCount >= this.minChoices;
    }

    public set response(responseValue: string | string[]) {
      const responseArray = Array.isArray(responseValue) ? responseValue : [responseValue];
      this._choiceElements.forEach(choice => {
        this._setChoiceChecked(choice, responseArray.includes(choice.identifier));
      });
    }

    public set correctResponse(responseValue: string | string[]) {
      const responseArray = Array.isArray(responseValue) ? responseValue : [responseValue];
      if (responseArray.length === 0) {
        this._choiceElements.forEach(choice => {
          choice.removeAttribute('data-correct-response');
        });
        return;
      }
      this._choiceElements.forEach(choice => {
        choice.setAttribute('data-correct-response', responseArray.includes(choice.identifier) ? 'true' : 'false');
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
      choice.setAttribute('aria-checked', checked.toString());
    }

    private _getChoiceChecked(choice: Choice): boolean {
      return choice.getAttribute('aria-checked') === 'true';
    }

    private _toggleChoiceChecked(choice: Choice) {
      const checked = this._getChoiceChecked(choice);
      this._setChoiceChecked(choice, !checked);
    }

    /**
     * Handles the selection of choices.
     *
     * This method filters the choice elements based on their checked state and retrieves the selected identifiers.
     * If the `maxChoices` property is set to a value greater than 1 and not equal to 0, it disables unselected choices
     * when the maximum number of choices is reached.
     * Finally, it saves the response based on the `maxChoices` property.
     */
    protected _handleChoiceSelection() {
      const selectedChoices = this._choiceElements.filter(choice => this._getChoiceChecked(choice));
      const selectedIdentifiers = selectedChoices.map(choice => choice.identifier);

      if (this.maxChoices > 1 && this.maxChoices !== 0) {
        const disableUnselected = selectedChoices.length >= this.maxChoices;
        this._choiceElements.forEach(choice => {
          if (!this._getChoiceChecked(choice)) {
            choice.disabled = disableUnselected;
          }
        });
      }

      /**
       * The response from the interaction.
       * If `maxChoices` is 1, it will be the selected identifier or `undefined` if no identifier is selected.
       * If `maxChoices` is greater than 1, it will be an array of selected identifiers.
       */
      const response = this.maxChoices === 1 ? selectedIdentifiers[0] || undefined : selectedIdentifiers;
      this._saveResponse(response);
    }

    protected _saveResponse(response: string | string[] | undefined) {
      this.dispatchEvent(
        new CustomEvent('qti-interaction-response', {
          bubbles: true,
          composed: true,
          detail: {
            responseIdentifier: this.responseIdentifier,
            response
          }
        })
      );
    }
  }
  return ChoicesMixinElement as Constructor<ChoicesInterface> & T;
};
