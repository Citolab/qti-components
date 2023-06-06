import { css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Interaction } from '../internal/interaction/interaction';
import { resetCss } from '../../utilities/reset-styles/reset-shadowroot-styles';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('qti-text-entry-interaction')
export class QtiTextEntryInteraction extends Interaction {
  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @state()
  private _value = '';

  @property({ type: String, attribute: 'class' }) classNames;
  // @watch('classNames', { waitUntilFirstUpdate: true })
  // handleclassNamesChange(old, disabled: boolean) {
  //   const classNames = this.classNames.split(' ');
  //   classNames.forEach((className: string) => {
  //     if (className.startsWith('qti-height-lines')) {
  //       const nrRows = className.replace('qti-height-lines-', '');
  //       if (this.textareaRef) {
  //         this.textareaRef.value.rows = parseInt(nrRows);
  //       }
  //     }
  //   });
  // }

  public set response(value: string | undefined) {
    this._value = value !== undefined ? value : '';
  }

  public validate() {
    return this._value !== '';
  }

  static override get styles() {
    return [
      resetCss,
      css`
        /* PK: display host as block, else design will be collapsed */
        :host {
          display: inline-block;
        }
        input {
          padding: var(--qti-padding, 0.5rem);
        }
      `
    ];
  }

  override render() {
    return html` <input
      part="input"
      spellcheck="false"
      autocomplete="off"
      @keydown="${event => event.stopImmediatePropagation()}"
      @keyup="${this.textChanged}"
      @change="${this.textChanged}"
      type="text"
      placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
      .value="${this._value}"
      size="${ifDefined(this.expectedLength ? this.expectedLength : undefined)}"
      pattern="${ifDefined(this.patternMask ? this.patternMask : undefined)}"
      ?disabled="${this.disabled}"
      ?readonly="${this.readonly}"
    />`;
  }
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
