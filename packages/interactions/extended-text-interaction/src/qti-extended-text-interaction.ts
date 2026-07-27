import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, state } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';
import { Interaction } from '@qti-components/base';

import styles from './qti-extended-text-interaction.styles';

import type { CSSResultGroup } from 'lit';
/**
 * A multi-line text-entry interaction.
 *
 * @slot prompt - The prompt shown above the textarea.
 *
 * @csspart textarea - The textarea input element.
 */
export class QtiExtendedTextInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

  @state()
  protected _rows = 5;

  /** expected length is mapped to the property maxlength on the textarea */
  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  /** text appearing in the extended-text-interaction if it is empty */
  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @property({ type: String, attribute: 'data-patternmask-message' }) dataPatternmaskMessage: string;

  @property({ type: String, attribute: 'class' }) classNames: string;
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

  override get value(): string | null {
    return this.response || null;
  }
  override set value(val: string | null) {
    this.response = val || null;
  }

  public override validate() {
    const textarea = this.shadowRoot.querySelector('textarea');
    if (!textarea) return false;
    let validityMessage = '';
    let isValid = false;

    if (this.patternMask && this.dataPatternmaskMessage) {
      // Clear any custom error initially
      textarea.setCustomValidity('');
      const patternSource =
        this.patternMask.startsWith('^') && this.patternMask.endsWith('$') ? this.patternMask : `^${this.patternMask}$`;

      const pattern = new RegExp(patternSource);
      isValid = textarea.checkValidity() && pattern.test(textarea.value);

      if (!isValid) {
        // Set custom error if invalid
        validityMessage = this.dataPatternmaskMessage;
        textarea.setCustomValidity(this.dataPatternmaskMessage);
      }
    } else {
      isValid = textarea.checkValidity();
    }

    if (isValid && !this.response) {
      isValid = false;
    }

    if (!isValid && !validityMessage) {
      validityMessage = textarea.validationMessage || 'Invalid value.';
    }

    this.setInteractionValidity(isValid, validityMessage, textarea, { suppressInline: true });
    return isValid;
  }

  override reportValidity() {
    this.validate();
    return super.reportValidity();
  }

  /*
   * The template in named pieces, so a subclass can recompose it.
   *
   * Each piece renders one thing and returns it; `render()` below just orders them. A subclass
   * overrides `render()` and calls the pieces where it wants them — which is the point: an extension
   * point that only lets you APPEND has already decided the layout on the subclass's behalf, and the
   * subclass is usually the one that knows better. The correction variant in
   * @qti-components/qti-corrections puts its badge between the field and the validation message;
   * something else may want it above the prompt, or may want to drop a piece entirely.
   *
   * Override a piece to change what one part looks like; override `render()` to change the order.
   */

  /** The prompt, above the field. */
  protected renderPrompt(): unknown {
    return html`<slot name="prompt"></slot>`;
  }

  /** The field itself. */
  protected renderTextarea(): unknown {
    return html`<textarea
      part="textarea"
      name="${this.responseIdentifier}"
      spellcheck="false"
      autocomplete="off"
      maxlength="${5000}"
      @keydown="${(event: KeyboardEvent) => event.stopImmediatePropagation()}"
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

  /** Hidden until `Interaction.reportValidity` shows it. */
  protected renderValidationMessage(): unknown {
    return html`<div id="validation-message" part="message" role="alert" style="display:none;"></div>`;
  }

  override render() {
    /* The prompt and the field are written with NO whitespace between them, deliberately: a text
       node there puts a line box between the two. The original template said `</slot\n><textarea`
       to avoid exactly that, and interpolating them adjacently keeps it. */
    return html`${this.renderPrompt()}${this.renderTextarea()} ${this.renderValidationMessage()}`;
  }

  protected textChanged(event: Event) {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    if (this.response !== input.value) {
      this.value = input.value;
      this.saveResponse(input.value);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-extended-text-interaction': QtiExtendedTextInteraction;
  }
}
