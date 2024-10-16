import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../../../decorators/watch';
import { ChoiceInterface } from '../choice/choice.mixin';

type Constructor<T = {}> = new (...args: any[]) => T;

type Choice = HTMLElement & ChoiceInterface;

export interface ChoicesInterface {
  validate(): boolean;
  _choiceElements: Array<Choice>;
  correctResponse: string | string[];
}

export const ChoicesMixin = <T extends Constructor<LitElement>>(superClass: T, selector: string) => {
  class ChoicesMixinElement extends superClass implements ChoicesInterface {
    public _choiceElements = [];

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
      const selectedCount = this._choiceElements.filter(choice => choice.checked).length;
      if (this.maxChoices !== 0 && selectedCount > this.maxChoices) {
        return false;
      }
      return selectedCount >= this.minChoices;
    }

    public set response(responseValue: string | string[]) {
      const responseArray = Array.isArray(responseValue) ? responseValue : [responseValue];
      this._choiceElements.forEach(choice => {
        choice.checked = responseArray.includes(choice.identifier);
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
      this.addEventListener(`click-${selector}`, this._choiceElementSelectedHandler);
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
      this.removeEventListener(`click-${selector}`, this._choiceElementSelectedHandler);
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

    protected _choiceElementSelectedHandler(event: CustomEvent<{ identifier: string; checked: boolean }>) {
      if (this.maxChoices === 1) {
        this._choiceElements.forEach(choice => {
          if (choice.identifier !== event.detail.identifier) {
            choice.checked = false;
          }
        });
      }
      this._handleChoiceSelection();
    }

    protected _handleChoiceSelection() {
      const selectedChoices = this._choiceElements.filter(choice => choice.checked);
      const selectedIdentifiers = selectedChoices.map(choice => choice.identifier);

      if (this.maxChoices > 1 && this.maxChoices !== 0) {
        const disableUnselected = selectedChoices.length >= this.maxChoices;
        this._choiceElements.forEach(choice => {
          if (!choice.checked) {
            choice.disabled = disableUnselected;
          }
        });
      }

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
