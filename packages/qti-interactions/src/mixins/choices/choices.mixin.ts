import { property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { watch } from '@qti-components/utilities';
import { configContext, type ConfigContext } from '@qti-components/base';

import type { Interaction, IInteraction } from '@qti-components/base';
import type { ChoiceInterface } from '../active-element/active-element.mixin';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type Choice = HTMLElement & ChoiceInterface & { internals: ElementInternals };

export interface ChoicesInterface extends IInteraction {
  minChoices: number;
  maxChoices: number;
  value: string | null;
  response: string | string[] | null;
  validate(): boolean;
  reportValidity(): boolean;
}

export const ChoicesMixin = <T extends Constructor<Interaction>>(superClass: T, selector: string) => {
  abstract class ChoicesMixinElement extends superClass implements ChoicesInterface {
    protected _choiceElements: Choice[] = [];

    @query('#validation-message')
    protected _validationMessageElement!: HTMLElement;

    private _validationMessageShown = false;

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

    @state()
    @consume({ context: configContext, subscribe: true })
    protected _configContext: ConfigContext; //configContext
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

    protected override toggleInternalCorrectResponse(show: boolean) {
      // Get correct response from either responseVariable (item context) or local property (standalone)
      const correctResponse = this.correctResponse;

      if (correctResponse) {
        const responseArray = Array.isArray(correctResponse) ? correctResponse : [correctResponse];
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

    public override toggleCandidateCorrection(show: boolean) {
      // Get correct response from either responseVariable (item context) or local property (standalone)
      const correctResponse = this.correctResponse;

      if (!correctResponse) {
        return;
      }

      const correctResponseArray = Array.isArray(correctResponse) ? correctResponse : [correctResponse];

      // Get current response (works in both standalone and item context modes)
      const currentResponse = this.response;
      const candidateResponseArray = Array.isArray(currentResponse)
        ? currentResponse
        : currentResponse
          ? [currentResponse]
          : [];

      this._choiceElements.forEach(choice => {
        choice.internals.states.delete('candidate-correct');
        choice.internals.states.delete('candidate-incorrect');
        if (!show) {
          return;
        }
        if (!candidateResponseArray.includes(choice.identifier)) {
          return; // Not checked, so no feedback
        }
        if (correctResponseArray.includes(choice.identifier)) {
          choice.internals.states.add('candidate-correct');
        } else {
          choice.internals.states.add('candidate-incorrect');
        }
      });

      // Also update interaction-level states
      super.toggleCandidateCorrection(show);
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
        validityMessage =
          this.dataset.maxSelectionsMessage ||
          `Please select no more than ${this.maxChoices} ${this.maxChoices === 1 ? 'option' : 'options'}.`;
      } else if (selectedCount < this.minChoices) {
        isValid = false;
        validityMessage =
          this.dataset.minSelectionsMessage ||
          `Please select at least ${this.minChoices} ${this.minChoices === 1 ? 'option' : 'options'}.`;
      }

      // Always set validity state, regardless of whether there are selections
      this._internals.setValidity(
        isValid ? {} : { customError: true },
        validityMessage,
        selectedChoices[selectedCount - 1] || this._choiceElements[0] || this
      );

      return isValid;
    }

    override reportValidity() {
      if (this._validationMessageElement) {
        if (!this._internals.validity.valid) {
          this._validationMessageElement.textContent = this._internals.validationMessage;
          // Set the display to block to show the message, add important to override any styles
          this._validationMessageElement.style.setProperty('display', 'block', 'important');
          this._validationMessageShown = true; // Track that validation message was shown
        } else {
          this._validationMessageElement.textContent = '';
          this._validationMessageElement.style.display = 'none';
          // Don't reset _validationMessageShown here - let it be cleared by user input
        }
      }
      return this._internals.validity.valid;
    }

    protected _registerChoiceElement(event: CustomEvent) {
      event.stopPropagation();
      const choiceElement = event.target as Choice;

      // Only override disabled if the interaction is disabled, otherwise respect element's own state
      if (this.disabled) {
        choiceElement.disabled = true;
      }
      choiceElement.readonly = this.readonly;

      // Initialize ariaChecked state
      if (!choiceElement.internals.ariaChecked) {
        choiceElement.internals.ariaChecked = 'false';
      }

      this._choiceElements.push(choiceElement);
      this._setInputType(choiceElement);
    }

    protected _unregisterChoiceElement(event: CustomEvent) {
      event.stopPropagation();
      const choiceElement = event.target as Choice;
      this._choiceElements = this._choiceElements.filter(choice => choice !== choiceElement);
    }

    protected _determineInputType() {
      this._choiceElements.forEach(choice => {
        this._setInputType(choice);
      });
    }

    protected _setInputType(choiceElement: Choice) {
      this._internals.role = this.maxChoices === 1 ? 'radiogroup' : null;

      const role = this.maxChoices === 1 ? 'radio' : 'checkbox';
      choiceElement.internals.role = role;
      choiceElement.internals.states.delete(role === 'radio' ? 'checkbox' : 'radio');
      choiceElement.internals.states.add(role);
    }

    protected _choiceElementSelectedHandler(event: CustomEvent<{ identifier: string }>) {
      this._toggleChoiceChecked(event.target as Choice);
      if (this.maxChoices === 1) {
        this._choiceElements.forEach(choice => {
          if (choice.identifier !== event.detail.identifier) {
            this._setChoiceChecked(choice, false);
          }
        });
      } else if (this.maxChoices !== 0 && this._configContext?.disableAfterIfMaxChoicesReached) {
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
          choice.internals.states.add('--checked');
          choice.internals.ariaChecked = 'true';
        } else {
          choice.internals.states.delete('--checked');
          choice.internals.ariaChecked = 'false';
        }
      }
    }

    protected _getChoiceChecked(choice: Choice): boolean {
      return choice.internals.states.has('--checked');
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

      // Auto-update validation message if it was previously shown (FACE behavior)
      if (this._validationMessageShown) {
        this.reportValidity();
        // Reset flag if now valid to prevent unnecessary future auto-updates
        if (this._internals.validity.valid) {
          this._validationMessageShown = false;
        }
      }

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
