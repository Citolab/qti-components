import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { customElement, property, state } from 'lit/decorators.js';

import { Interaction } from '../../../exports/interaction';
import { watch } from '../../../decorators';
import styles from './qti-extended-text-interaction.styles';

import type { CSSResultGroup } from 'lit';

@customElement('qti-extended-text-interaction')
export class QtiExtendedTextInteraction extends Interaction {
  static styles: CSSResultGroup = styles;

  @state()
  protected _rows = 5;

  /** expected length is mapped to the property maxlength on the textarea */
  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  /** text appearing in the extended-text-interaction if it is empty */
  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @property({ type: String, attribute: 'data-patternmask-message' }) dataPatternmaskMessage: string;

  @property({ type: String, attribute: 'class' }) classNames;
  @watch('classNames')
  handleclassNamesChange(_: any, classes: string) {
    const classNames = classes.split(' ');
    let rowsSet = false;
    classNames.forEach((className: string) => {
      if (className.startsWith('qti-height-lines-')) {
        const nrRows = className.replace('qti-height-lines-', '');
        this._rows = parseInt(nrRows);
        rowsSet = true;
      }
    });
    // If no qti-height-lines class is set, calculate rows based on expectedLength
    if (!rowsSet && this.expectedLength) {
      const estimatedRows = Math.ceil(this.expectedLength / 50); //  '50' based on an estimate for characters per row
      this._rows = estimatedRows;
    }
  }

  @state()
  response: string | null = null;

  @watch('response', { waitUntilFirstUpdate: true })
  protected _handleResponseChange = () => {
    this._internals.setFormValue(this.value);
    this.validate();
  };

  get value(): string | null {
    return this.response || null;
  }
  set value(val: string | null) {
    this.response = val || null;
  }

  public override validate() {
    const textarea = this.shadowRoot.querySelector('textarea');
    if (!textarea) return false;

    if (this.patternMask && this.dataPatternmaskMessage) {
      // Clear any custom error initially
      this._internals.setValidity({});
      textarea.setCustomValidity('');
      const patternSource =
        this.patternMask.startsWith('^') && this.patternMask.endsWith('$') ? this.patternMask : `^${this.patternMask}$`;

      const pattern = new RegExp(patternSource);
      const isValid = textarea.checkValidity() && pattern.test(textarea.value);

      if (!isValid) {
        // Set custom error if invalid
        this._internals.setValidity({ customError: true }, this.dataPatternmaskMessage);
        textarea.setCustomValidity(this.dataPatternmaskMessage);
      }
    } else {
      const isValid = textarea.checkValidity();
      this._internals.setValidity(isValid ? {} : { customError: false });
    }

    return !!this.response && textarea.checkValidity();
  }

  public toggleCorrectResponse() {
    // No correct response possible for extended text interactions
  }

  override reportValidity() {
    const textarea = this.shadowRoot.querySelector('textarea');
    if (!textarea) return false;

    // Run the validate function to ensure the custom validity state is up to date
    const isValid = this.validate();
    if (!isValid) {
      textarea.reportValidity();
    }
    return isValid;
  }

  override render() {
    return html`<slot name="prompt"></slot
      ><textarea
        part="textarea"
        name="${this.responseIdentifier}"
        spellcheck="false"
        autocomplete="off"
        maxlength="${5000}"
        @keydown="${event => event.stopImmediatePropagation()}"
        @keyup="${this.textChanged}"
        @change="${this.textChanged}"
        @blur="${(_: FocusEvent) => {
          this.reportValidity();
        }}"
        placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
        rows="${this._rows}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        .value=${this.response}
      ></textarea>`;
  }

  protected textChanged(event: Event) {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    this.setEmptyAttribute(input.value);
    if (this.response !== input.value) {
      this.value = input.value;
      this.saveResponse(input.value);
    }
  }

  protected setEmptyAttribute(text: string) {
    this.setAttribute('empty', text === '' ? 'true' : 'false');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-extended-text-interaction': QtiExtendedTextInteraction;
  }
}
