import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef } from 'lit/directives/ref.js';

import { watch } from '@qti-components/utilities';
import { Interaction } from '@qti-components/base';

import styles from './qti-text-entry-interaction.styles';

import type { CSSResultGroup } from 'lit';

/**
 * Text-entry interaction: single-line inline text input.
 *
 * @customElement qti-text-entry-interaction
 *
 * @attr {string} response-identifier - Required. Identifier of the bound response variable.
 * @attr {number} expected-length - Hint at the expected answer length; drives the rendered
 *   field width and the input's `maxlength`.
 * @attr {string} pattern-mask - Regular expression the value must match to be valid.
 * @attr {string} placeholder-text - Placeholder shown while the field is empty.
 * @attr {string} data-patternmask-message - Custom validation message shown when
 *   `pattern-mask` fails. Part of the QTI shared interaction vocabulary.
 * @attr {number} [base=10] - Not implemented. Numeric base used when recording the value.
 * @attr {string} string-identifier - Not implemented. Identifier of a second, string-typed
 *   response variable that also receives the raw entry.
 * @attr {string} format - Not implemented. QTI types this as a bare normalized string here rather
 *   than as the `plain | preformatted | xhtml` vocabulary it defines for extended-text, and a
 *   single-line input has no formatting to render: it can show neither preserved line breaks nor
 *   markup. The field is always plain text, so this is not planned either.
 *
 * @csspart input - The text input element.
 * @csspart correct - Overlay shown when displaying the correct response.
 */
export class QtiTextEntryInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;
  inputRef = createRef<HTMLInputElement>();

  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @property({ type: String, attribute: 'data-patternmask-message' }) dataPatternmaskMessage: string;

  @property({ type: String, attribute: 'response', reflect: false })
  response: string | null = null;

  @query('input') private _input!: HTMLInputElement;

  @watch('response', { waitUntilFirstUpdate: true })
  protected _handleValueChange = () => {
    this._internals.setFormValue(this.value);
    this.validate();
  };

  override get value(): string | null {
    return this.response || null;
  }
  override set value(val: string | null) {
    this.response = val || null;
  }

  override get isInline(): boolean {
    return true;
  }

  public override validate(): boolean {
    if (!this._input) return false;
    let validityMessage = '';
    let isValid = false;

    if (this.patternMask && this.dataPatternmaskMessage) {
      // Clear any custom error if the this._input is valid
      this._input.setCustomValidity(''); // Clear the custom message
      isValid = this._input.checkValidity();
      if (!isValid) {
        // Set custom error if invalid
        validityMessage = this.dataPatternmaskMessage;
        this._input.setCustomValidity(this.dataPatternmaskMessage); // Set custom message only if invalid
      }
    } else {
      isValid = this._input.checkValidity();
    }

    if (isValid && this.response === '') {
      isValid = false;
    }

    if (!isValid && !validityMessage) {
      validityMessage = this._input.validationMessage || 'Invalid value.';
    }

    this.setInteractionValidity(isValid, validityMessage, this._input, { suppressInline: true });
    return isValid;
  }

  /*
   * The template in named pieces, so a subclass can recompose it. Override a piece to change what
   * one part looks like; override `render()` to change the order. See the longer note on the same
   * pattern in qti-extended-text-interaction.
   */

  /** The answer-key line, revealed above the field when the correct response is shown. */
  protected renderAnswer(): unknown {
    return html`<div part="answer" aria-hidden="true"></div>`;
  }

  /** The field itself. */
  protected renderInput(): unknown {
    return html`<input
      part="input"
      name="${this.responseIdentifier}"
      spellcheck="false"
      autocomplete="off"
      @blur="${(_: FocusEvent) => {
        this.reportValidity();
      }}"
      @keydown="${(event: KeyboardEvent) => event.stopImmediatePropagation()}"
      @keyup="${this.textChanged}"
      @change="${this.textChanged}"
      type="${this.patternMask == '[0-9]*' ? 'number' : 'text'}"
      placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
      .value="${this.response}"
      pattern="${ifDefined(this.patternMask ? this.patternMask : undefined)}"
      maxlength=${1000}
      ?disabled="${this.disabled}"
      ?readonly="${this.readonly}"
    />`;
  }

  /** Hidden until `Interaction.reportValidity` shows it. */
  protected renderValidationMessage(): unknown {
    return html`<div id="validation-message" part="message" role="alert" style="display:none;"></div>`;
  }

  override render() {
    return html` ${this.renderAnswer()} ${this.renderInput()} ${this.renderValidationMessage()} `;
  }

  protected textChanged(event: Event): void {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    if (this.response !== input.value) {
      this.value = input.value;
      this.saveResponse(input.value);
    }
  }

  override reportValidity(): boolean {
    this.validate();
    return super.reportValidity();
  }

  override reset(): void {
    this.response = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-text-entry-interaction': QtiTextEntryInteraction;
  }
}
