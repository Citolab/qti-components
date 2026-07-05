import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef } from 'lit/directives/ref.js';

import { watch } from '@qti-components/utilities';
import { Correctness, Interaction } from '@qti-components/base';

import styles from './qti-text-entry-interaction.styles';

import type { CSSResultGroup } from 'lit';
/**
 * Text-entry interaction: single-line inline text input.
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
    if (this.showCandidateCorrection) {
      this.toggleCandidateCorrection(true);
    }
  };

  override get value(): string | null {
    return this.response || null;
  }
  override set value(val: string | null) {
    this.response = val || null;
  }

  override get correctness(): Readonly<Correctness | null> {
    const responseVariable = this.responseVariable;

    if (!responseVariable) {
      // Standalone mode (no item context): fall through to the base correctness
      // getter, which compares `this.response` to `this.correctResponse`.
      return super.correctness;
    }

    if (responseVariable.value === null) {
      return Correctness.Incorrect;
    }

    if (responseVariable.mapping) {
      const maxScore = responseVariable.mapping.mapEntries.reduce<number>(
        (currentMax, mapEntry) => Math.max(mapEntry.mappedValue, currentMax),
        0
      );
      for (const mapEntry of responseVariable.mapping.mapEntries) {
        let mapAnswer = mapEntry.mapKey;
        let responseAnswer = responseVariable.value as string;
        if (!mapEntry.caseSensitive) {
          mapAnswer = mapAnswer.toLowerCase();
          responseAnswer = responseAnswer.toLowerCase();
        }
        if (mapAnswer === responseAnswer) {
          if (mapEntry.mappedValue === maxScore) {
            return Correctness.Correct;
          }
          if (mapEntry.mappedValue <= (responseVariable.mapping.defaultValue || 0)) {
            return Correctness.Incorrect;
          }
          return Correctness.PartiallyCorrect;
        }
      }
    }

    // Fallback to the correct response

    return responseVariable.correctResponse === responseVariable.value ? Correctness.Correct : Correctness.Incorrect;
  }

  override get isInline(): boolean {
    return true;
  }

  public override validate(): boolean {
    if (!this._input) return false;
    if (this.patternMask && this.dataPatternmaskMessage) {
      // Clear any custom error if the this._input is valid
      this._internals.setValidity({});
      this._input.setCustomValidity(''); // Clear the custom message
      const isValid = this._input.checkValidity();
      if (!isValid) {
        // Set custom error if invalid
        this._internals.setValidity({ customError: true }, this.dataPatternmaskMessage);
        this._input.setCustomValidity(this.dataPatternmaskMessage); // Set custom message only if invalid
      }
    } else {
      const isValid = this._input.checkValidity();
      this._internals.setValidity(isValid ? {} : { customError: false });
    }
    return this.response !== '' && this._input.checkValidity();
  }

  /**
   * Display flag for the `[part='correct']` overlay. Separate from
   * `_correctResponse` (the base's storage for the `correct-response`
   * attribute value) — toggling this does NOT clobber the correct response.
   */
  @state() private _showCorrectOverlay: boolean = false;

  public override toggleInternalCorrectResponse(show: boolean): void {
    // Drive only the overlay flag; read the actual correct-response value at
    // render time via `this.correctResponse` (works in standalone + item-context).
    this._showCorrectOverlay = show && !!this.correctResponse;
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
      />
      ${this._showCorrectOverlay && this.correctResponse
        ? html`<div part="correct">${this.correctResponse}</div>`
        : nothing}
    `;
  }
  // ${this._correctResponse ? html`<div popover part="correct">${this._correctResponse}</div>` : nothing}

  protected textChanged(event: Event): void {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    this.#setEmptyAttribute(input.value);
    if (this.response !== input.value) {
      this.value = input.value;
      this.saveResponse(input.value);
    }
  }

  override reportValidity(): boolean {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return false;

    // Run the validate function to ensure the custom validity state is up to date
    const isValid = this.validate();
    if (!isValid) {
      input.reportValidity();
    }
    return isValid;
  }

  override reset(): void {
    this.response = '';
  }

  #setEmptyAttribute(text: string): void {
    this.setAttribute('empty', text === '' ? 'true' : 'false');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-text-entry-interaction': QtiTextEntryInteraction;
  }
}
