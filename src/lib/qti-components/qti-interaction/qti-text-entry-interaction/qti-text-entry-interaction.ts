import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef } from 'lit/directives/ref.js';

import { Interaction } from '../../../exports/interaction';
import styles from './qti-text-entry-interaction.styles';

import type { CSSResultGroup } from 'lit';
@customElement('qti-text-entry-interaction')
export class QtiTextEntryInteraction extends Interaction {
  static styles: CSSResultGroup = styles;

  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @property({ type: String, attribute: 'data-patternmask-message' }) dataPatternmaskMessage: string;

  @state()
  private _value = '';

  inputRef = createRef<HTMLInputElement>();

  get value(): string | string[] | null {
    return this._value || null;
  }
  set value(val: string | string[] | null) {
    if (typeof val === 'string' || val === null) {
      this._value = (val || '') as string;
      const formData = new FormData();
      formData.append(this.responseIdentifier, this._value);
      this._internals.setFormValue(formData);
      this.validate();
    } else {
      throw new Error('Value must be a string');
    }
  }

  public override validate() {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return false;
    if (this.patternMask && this.dataPatternmaskMessage) {
      // Clear any custom error if the input is valid
      this._internals.setValidity({});
      input.setCustomValidity(''); // Clear the custom message
      const isValid = input.checkValidity();
      if (!isValid) {
        // Set custom error if invalid
        this._internals.setValidity({ customError: true }, this.dataPatternmaskMessage);
        input.setCustomValidity(this.dataPatternmaskMessage); // Set custom message only if invalid
      }
    } else {
      const isValid = input.checkValidity();
      this._internals.setValidity(isValid ? {} : { customError: false });
    }
    return this._value !== '' && input.checkValidity();
  }

  override render() {
    return html`
      <input
        part="input"
        name="${this.responseIdentifier}"
        spellcheck="false"
        autocomplete="off"
        @blur="${(_: FocusEvent) => {
          this.reportValidity();
        }}"
        @keydown="${event => event.stopImmediatePropagation()}"
        @keyup="${this.textChanged}"
        @change="${this.textChanged}"
        type="${this.patternMask == '[0-9]*' ? 'number' : 'text'}"
        placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
        .value="${this._value}"
        pattern="${ifDefined(this.patternMask ? this.patternMask : undefined)}"
        maxlength=${1000}
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
      />
      <div part="correct">${this._correctResponse}</div>
    `;
  }
  protected textChanged(event: Event) {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    this.setEmptyAttribute(input.value);
    if (this._value !== input.value) {
      this.value = input.value;
      this.saveResponse(input.value);
    }
  }

  override reportValidity() {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return false;

    // Run the validate function to ensure the custom validity state is up to date
    const isValid = this.validate();
    if (!isValid) {
      input.reportValidity();
    }
    return isValid;
  }

  reset(): void {
    this._value = '';
  }

  private setEmptyAttribute(text: string) {
    this.setAttribute('empty', text === '' ? 'true' : 'false');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-text-entry-interaction': QtiTextEntryInteraction;
  }
}
