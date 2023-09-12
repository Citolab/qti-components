import { css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Interaction } from '../internal/interaction/interaction';
import { customElement, property, state } from 'lit/decorators.js';
import { watch } from '../../../decorators';
import { createRef } from 'lit/directives/ref.js';

@customElement('qti-text-entry-interaction')
export class QtiTextEntryInteraction extends Interaction {
  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @state()
  private _value = '';

  @state()
  private _size = 5;

  inputRef = createRef<HTMLInputElement>();

  @property({ type: String, attribute: 'class' }) classNames;
  @watch('classNames')
  handleclassNamesChange(old, classes: string) {
    const classNames = classes.split(' ');
    classNames.forEach((className: string) => {
      if (className.startsWith('qti-input-width')) {
        const nrRows = className.replace('qti-input-width-', '');
        this._size = parseInt(nrRows);
      }
    });
  }

  public set response(value: string | undefined) {
    this._value = value !== undefined ? value : '';
  }

  public validate() {
    return this._value !== '';
  }

  static override get styles() {
    return [
      css`
        :host {
          display: inline-flex;
        }
      `
    ];
  }

  override render() {
    return html`
      <input
        part="input"
        spellcheck="false"
        autocomplete="off"
        @keydown="${event => event.stopImmediatePropagation()}"
        @keyup="${this.textChanged}"
        @change="${this.textChanged}"
        type="${this.patternMask == '[0-9]*' ? 'number' : 'text'}"
        placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
        .value="${this._value}"
        size="${this._size}"
        pattern="${ifDefined(this.patternMask ? this.patternMask : undefined)}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
      />
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
