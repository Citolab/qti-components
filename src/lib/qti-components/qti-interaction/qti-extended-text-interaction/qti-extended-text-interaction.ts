import { css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Interaction } from '../internal/interaction/interaction';
import { customElement, property, state } from 'lit/decorators.js';
import { watch } from '../../../decorators/watch';

@customElement('qti-extended-text-interaction')
export class QtiExtendedTextInteraction extends Interaction {
  @state()
  private _rows = 5;

  /** expected length is mapped to the property maxlength on the textarea */
  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  /** text appearing in the extended-text-nteraction if it is empty */
  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @property({ type: String, attribute: 'data-patternmask-message' }) dataPatternmaskMessage: string;

  @state()
  private _value = '';

  @property({ type: String, attribute: 'class' }) classNames;
  @watch('classNames')
  handleclassNamesChange(old, classes: string) {
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

  get value(): string | string[] {
    return this._value;
  }
  set value(val: string | string[]) {
    if (typeof val === 'string') {
      this._value = val;
      const formData = new FormData();
      formData.append(this.responseIdentifier, val);
      this._internals.setFormValue(formData);
      this.validate();
    } else {
      throw new Error('Value must be a string');
    }
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

    return this._value !== '' && textarea.checkValidity();
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

  static override get styles() {
    return [
      css`
        /* PK: display host as block, else design will be collapsed */
        :host {
          display: block;
        }
        textarea {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          border: 0;
        }
      `
    ];
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
        @blur="${(event: FocusEvent) => {
          this.reportValidity();
        }}"
        placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
        rows="${this._rows}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        .value=${this._value}
      ></textarea>`;
  }

  protected textChanged(event: Event) {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    this.setEmptyAttribute(input.value);
    if (this._value !== input.value) {
      this.value = input.value;
      const isValid = this.validate();
      this.saveResponse(input.value);
    }
  }

  private setEmptyAttribute(text: string) {
    this.setAttribute('empty', text === '' ? 'true' : 'false');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-extended-text-interaction': QtiExtendedTextInteraction;
  }
}
