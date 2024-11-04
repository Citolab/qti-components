import { css, html } from 'lit';
import type { CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef } from 'lit/directives/ref.js';
import { watch } from '../../../decorators';
import { Interaction } from '../internal/interaction/interaction';
import styles from './qti-text-entry-interaction.styles';
@customElement('qti-text-entry-interaction')
export class QtiTextEntryInteraction extends Interaction {
  static styles: CSSResultGroup = styles;

  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @state()
  private _value = '';

  @state()
  private _correctValue = '';

  inputRef = createRef<HTMLInputElement>();

  public set response(value: string | undefined) {
    this._value = value !== undefined ? value : '';
  }

  public validate() {
    return this._value !== '';
  }

  set correctResponse(value: string) {
    this._correctValue = value;
  }

  override render() {
    return html`
      <input
        part="input"
        spellcheck="false"
        autocomplete="off"
        @blur="${(event: FocusEvent) => {
          const input = event.target as HTMLInputElement;
          if (!input.checkValidity()) {
            input.setCustomValidity(this.dataset.patternmaskMessage || 'Invalid input');
            input.reportValidity(); // Show the validation message
          } else {
            input.setCustomValidity(''); // Clear the custom validity message
          }
        }}"
        @keydown="${event => event.stopImmediatePropagation()}"
        @keyup="${this.textChanged}"
        @change="${this.textChanged}"
        type="${this.patternMask == '[0-9]*' ? 'number' : 'text'}"
        placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
        .value="${this._value}"
        pattern="${ifDefined(this.patternMask ? this.patternMask : undefined)}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
      />
      <div part="correct">${this._correctValue}</div>
    `;
  }
  //
  // maxlength="${ifDefined(this.expectedLength ? this.expectedLength : undefined)}"

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
    'qti-text-entry-interaction': QtiTextEntryInteraction;
  }
}
