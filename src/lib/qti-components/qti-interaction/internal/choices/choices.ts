import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../../../decorators/watch';
import { QtiChoice } from '../choice/qti-choice';

type Constructor<T = {}> = new (...args: any[]) => T;

export interface ChoicesInterface {
  validate(): boolean;
  _choiceElements: HTMLElement[];
  correctResponse: string | string[];
}

export const ChoicesMixin = <T extends Constructor<LitElement>>(superClass: T, selector: string) => {
  class ChoicesMixinElement extends superClass implements ChoicesInterface {
    public _choiceElements: QtiChoice[] = [];

    @property({ attribute: 'response-identifier' }) responseIdentifier: string = '';

    @property({
      type: Number,
      attribute: 'min-choices'
    })
    public minChoices: number = 0;

    /** the maximum number of selections a candidate must make, the other options will be disabled when max options is checked */
    @property({
      type: Number,
      attribute: 'max-choices'
    })
    public maxChoices: number = 1;

    @watch('disabled', { waitUntilFirstUpdate: true })
    _handleDisabledChange = (_: boolean, disabled: boolean) =>
      this._choiceElements.forEach(ch => (ch.disabled = disabled));

    @watch('readonly', { waitUntilFirstUpdate: true })
    _handleReadonlyChange = (_: boolean, readonly: boolean) =>
      this._choiceElements.forEach(ch => (ch.readonly = readonly));

    @watch('maxChoices', { waitUntilFirstUpdate: true })
    _handleMaxChoicesChange = () => this._determineInputType();

    constructor(...args: any[]) {
      super(...args);

      this.addEventListener('qti-register-choice', this._registerChoiceElement);
      this.addEventListener('qti-loose-choice', this._looseChoiceElement);
    }

    validate(): boolean {
      const nrSelected = this._choiceElements.reduce((acc, val) => {
        return acc + (val.checked ? 1 : 0);
      }, 0);
      return nrSelected >= this.minChoices;
    }

    set response(responseValue: string | string[]) {
      const responseValueArray = Array.isArray(responseValue) ? responseValue : [responseValue];
      this._choiceElements.forEach(ce => {
        ce.checked = responseValueArray.find(rv => rv === ce.identifier) ? true : false;
      });
    }

    set correctResponse(responseValue: string | string[]) {
      const responseValueArray = Array.isArray(responseValue) ? responseValue : [responseValue];
      if (responseValue == '') {
        this._choiceElements.forEach(ce => {
          ce.removeAttribute('data-correct-response');
        });
        return;
      }
      this._choiceElements.forEach(ce => {
        ce.setAttribute(
          'data-correct-response',
          responseValueArray.find(rv => rv === ce.identifier) ? 'true' : 'false'
        );
      });
    }

    override connectedCallback() {
      super.connectedCallback();
      this.addEventListener('qti-register-choice', this._registerChoiceElement);
      this.addEventListener('qti-choice-element-selected', this._choiceElementSelectedHandler);
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('qti-choice-element-selected', this._choiceElementSelectedHandler);
      this.removeEventListener('qti-register-choice', this._registerChoiceElement);
    }

    private _registerChoiceElement(e: CustomEvent) {
      e.stopPropagation();
      const choiceElement = e.target as QtiChoice;
      this._choiceElements.push(choiceElement);
      this._setInputType(choiceElement);
    }

    private _looseChoiceElement(e: CustomEvent) {
      e.stopPropagation();
      const choiceElement = e.target as QtiChoice;
      this._choiceElements.push(choiceElement);
      this._choiceElements = this._choiceElements.filter(ch => ch !== choiceElement);
    }

    private _determineInputType() {
      this._choiceElements.forEach(choiceElement => {
        this._setInputType(choiceElement);
      });
    }

    private _setInputType(choiceElement: QtiChoice) {
      if (this.maxChoices === 1) {
        // if zero then you can choose how much you want
        choiceElement.setAttribute('role', 'radio');
      } else {
        choiceElement.setAttribute('role', 'checkbox');
      }
    }

    protected _choiceElementSelectedHandler(event: CustomEvent<{ identifier: string; checked: boolean }>) {
      if (this.maxChoices === 1) {
        this._choiceElements
          .filter(ce => ce.identifier !== event.detail.identifier)
          .forEach(ce => {
            ce.checked = false;
          });
      }
      this._choiceElementSelected();
    }

    protected _choiceElementSelected() {
      const selectedIdentifiers = this._choiceElements.filter(ce => ce.checked).map(ce => ce.identifier);

      if (this.maxChoices > 1) {
        if (this.maxChoices === selectedIdentifiers.length) {
          this._choiceElements.forEach(ce => (ce.disabled = !ce.checked));
        } else {
          this._choiceElements.forEach(ce => (ce.disabled = false));
        }
      }

      let result: string | string[];
      if (this.maxChoices === 1) {
        result = selectedIdentifiers.length > 0 ? selectedIdentifiers[0] : undefined;
      } else {
        result = selectedIdentifiers;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.saveResponse(result);
    }

    protected saveResponse(result) {
      this.dispatchEvent(
        new CustomEvent('qti-interaction-response', {
          bubbles: true,
          composed: true,
          detail: {
            responseIdentifier: this.responseIdentifier,
            result
          }
        })
      );
    }
  }
  return ChoicesMixinElement as Constructor<ChoicesInterface> & T;
};
