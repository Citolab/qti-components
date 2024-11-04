import { css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Interaction } from '../internal/interaction/interaction';
import { ref, createRef } from 'lit/directives/ref.js';
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

  @state()
  private _value = '';

  @property({ type: String, attribute: 'class' }) classNames;
  @watch('classNames')
  handleclassNamesChange(old, classes: string) {
    const classNames = classes.split(' ');
    classNames.forEach((className: string) => {
      if (className.startsWith('qti-height-lines-')) {
        const nrRows = className.replace('qti-height-lines-', '');
        this._rows = parseInt(nrRows);
      }
    });
  }

  public set response(value: string) {
    this._value = value !== undefined ? value : '';
  }

  public validate() {
    return this._value !== '';
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
        spellcheck="false"
        autocomplete="off"
        @keydown="${event => event.stopImmediatePropagation()}"
        @keyup="${this.textChanged}"
        @change="${this.textChanged}"
        @blur="${(event: FocusEvent) => {
          const input = event.target as HTMLInputElement;
          if (!input.checkValidity()) {
            input.setCustomValidity(this.dataset.patternmaskMessage || 'Invalid input');
            input.reportValidity(); // Show the validation message
          } else {
            input.setCustomValidity(''); // Clear the custom validity message
          }
        }}"
        placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
        maxlength="${ifDefined(this.expectedLength ? this.expectedLength : undefined)}"
        pattern="${ifDefined(this.patternMask ? this.patternMask : undefined)}"
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
      this._value = input.value;
      this.saveResponse(input.value);
    }
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
    'qti-extended-text-interaction': QtiExtendedTextInteraction;
  }
}
