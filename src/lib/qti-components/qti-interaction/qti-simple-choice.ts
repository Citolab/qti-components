import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { ActiveElementMixin } from './internal/active-element/active-element.mixin';

/**
 * QtiSimpleChoice component with pure CSS radio and checkbox styling
 * The entire component area is clickable
 * Supports unselecting a choice by clicking it again
 */
@customElement('qti-simple-choice')
export class QtiSimpleChoice extends ActiveElementMixin(LitElement, 'qti-simple-choice') {
  @property({ type: String, attribute: 'template-identifier' })
  public templateIdentifier: string | null = null;

  @property({ type: String, attribute: 'show-hide' })
  public showHide: string | null = 'show';

  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value: string | null) => value === 'true',
      toAttribute: (value: boolean) => String(value)
    }
  })
  public fixed: boolean = false;

  // Input type - will be set by parent component
  @property({ type: String, reflect: true })
  public inputType: 'checkbox' | 'radio' = 'checkbox';

  // Input type - will be set by parent component
  @property({ type: String, reflect: true })
  public groupName: string = '';

  // Query for the input element
  @query('input')
  private _inputElement!: HTMLInputElement;

  @property({ type: String, attribute: false })
  public marker: string;

  // Track if this choice was the last one selected (for radio unselection)
  private _wasLastSelected = false;

  static styles = css`
    :host {
      display: block;
      user-select: none;
      cursor: pointer;
      border-radius: 4px;
      padding: 0.5rem;
      transition: background-color 0.2s ease;
      margin-bottom: 0.5rem;
      position: relative; /* Needed for proper event handling */
    }

    .form-control {
      display: grid;
      grid-template-columns: 1em auto;
      gap: 0.5em;
      align-items: center;
      width: 100%;
    }

    /* Hide the native radio button appearance but keep it accessible */
    input[type='radio'] {
      -webkit-appearance: none;
      appearance: none;
      background-color: transparent;
      margin: 0;
      font: inherit;
      color: currentColor;
      width: 1.15em;
      height: 1.15em;
      border: 0.15em solid var(--qti-border-color, #c6cad0);
      border-radius: 50%;
      display: grid;
      place-content: center;
      transform: translateY(-0.075em);
    }

    /* The inner dot for radio buttons */
    input[type='radio']::before {
      content: '';
      width: 0.65em;
      height: 0.65em;
      border-radius: 50%;
      transform: scale(0);
      transition: 120ms transform ease-in-out;
      box-shadow: inset 1em 1em var(--qti-border-active, #f86d70);
      background-color: CanvasText;
    }

    /* Show the inner dot when checked */
    input[type='radio']:checked::before {
      transform: scale(1);
    }

    /* Custom styling for checkbox inputs */
    input[type='checkbox'] {
      -webkit-appearance: none;
      appearance: none;
      background-color: transparent;
      margin: 0;
      font: inherit;
      color: currentColor;
      width: 1.15em;
      height: 1.15em;
      border: 0.15em solid var(--qti-border-color, #c6cad0);
      border-radius: 0.15em;
      display: grid;
      place-content: center;
      transform: translateY(-0.075em);
    }

    /* Checkmark for checkboxes */
    input[type='checkbox']::before {
      content: '';
      width: 0.65em;
      height: 0.65em;
      transform: scale(0);
      transition: 120ms transform ease-in-out;
      box-shadow: inset 1em 1em var(--qti-border-active, #f86d70);
      transform-origin: center;
      clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
      background-color: CanvasText;
    }

    input[type='checkbox']:checked::before {
      transform: scale(1);
    }

    /* Focus styles */
    input:focus {
      outline: max(2px, 0.15em) solid var(--qti-focus-color, #bddcff7e);
      outline-offset: max(2px, 0.15em);
    }

    /* Hover state */
    input:hover:not(:disabled) {
      border-color: var(--qti-border-active, #f86d70);
    }

    /* Active border coloring when checked */
    input:checked {
      border-color: var(--qti-border-active, #f86d70);
    }

    /* States for the host element */
    :host(:hover:not([disabled], [readonly])) {
      background-color: var(--qti-hover-bg, #f9fafb);
    }

    :host([aria-checked='true']),
    :host([checked]) {
      background-color: var(--qti-bg-active, #ffecec);
    }

    :host([disabled]) {
      opacity: 0.6;
      cursor: not-allowed;
    }

    :host([readonly]) {
      pointer-events: none;
    }

    /* Correct/incorrect response indicators */
    :host([internals|states~='correct-response'])::after {
      content: '✓';
      color: var(--qti-correct, #66bb6a);
      margin-left: 0.5rem;
    }

    :host([internals|states~='incorrect-response'])::after {
      content: '✗';
      color: var(--qti-border-active, #f86d70);
      margin-left: 0.5rem;
    }

    /* Marker style (e.g., A, B, C, etc.) */
    #marker {
      margin-right: 0.5rem;
    }
  `;

  get checked(): boolean {
    return this._inputElement?.checked || false;
  }

  set checked(value: boolean) {
    if (this._inputElement) {
      this._inputElement.checked = value;
      // Update the internal state to maintain compatibility
      if (value) {
        this.internals.states.add('--checked');
        this.internals.ariaChecked = 'true';
        this._wasLastSelected = true;
      } else {
        this.internals.states.delete('--checked');
        this.internals.ariaChecked = 'false';
        this._wasLastSelected = false;
      }
    }
  }

  // get the first parent element with the tag name that endswith '-interaction'
  get parentInteraction(): HTMLElement | null {
    let parent = this.parentElement;
    while (parent && !parent.tagName.toLowerCase().endsWith('-interaction')) {
      parent = parent.parentElement;
    }
    return parent;
  }

  override render() {
    // Generate a unique ID for the input
    const inputId = `input-${this.identifier || Math.random().toString(36).substring(2, 9)}`;
    return html`
      <div class="form-control">
        <input
          id="${inputId}"
          type="${this.inputType}"
          name="${this.groupName}"
          .disabled="${this.disabled}"
          .readOnly="${this.readonly}"
          .checked="${this.internals.states.has('--checked')}"
          @change="${this._handleInputChange}"
        />
        <label for="${inputId}">
          ${this.marker ? html`<span id="marker">${this.marker}</span>` : nothing}
          <slot part="slot"></slot>
        </label>
      </div>
    `;
  }

  override firstUpdated() {
    // Add a click handler to the entire component (host element)
    this.addEventListener('click', this._handleHostClick);

    // For radio buttons, we need special handling for unselection
    if (this.inputType === 'radio') {
      const inputElement = this.shadowRoot?.querySelector('input');
      if (inputElement) {
        inputElement.addEventListener('click', this._handleRadioClick);
      }
    }
  }

  // This function handles the entire component area clicks
  private _handleHostClick = (e: MouseEvent) => {
    // Don't handle clicks if disabled or readonly
    if (this.disabled || this.readonly) {
      return;
    }

    // Find input element
    const inputElement = this.shadowRoot?.querySelector('input') as HTMLInputElement;
    if (!inputElement) return;

    // Get the elements in the event path
    const path = e.composedPath();

    // If the click was directly on the input or label, let the native handlers work
    if (path.includes(inputElement)) {
      return;
    }

    const labelElement = this.shadowRoot?.querySelector('label') as HTMLLabelElement;
    if (labelElement && path.includes(labelElement)) {
      return;
    }

    // If we're here, the click was on the host but not on input or label
    // So we need to programmatically click the input
    if (this.inputType === 'radio' && this._wasLastSelected) {
      // For radio buttons that are already selected, trigger the unselect logic
      this._unSelectRadio();
    } else {
      // For normal selection, just click the input
      inputElement.click();
    }
  };

  // This function specifically handles radio button clicks for unselection
  private _handleRadioClick = (e: MouseEvent) => {
    // Don't handle clicks if disabled or readonly
    if (this.disabled || this.readonly) {
      return;
    }

    // If this is a radio button and it was already checked
    if (this._wasLastSelected) {
      e.preventDefault();
      e.stopPropagation();

      this._unSelectRadio();
    }
  };

  // Helper method to unselect a radio button
  private _unSelectRadio() {
    if (!this._inputElement) return;

    // Uncheck it and update states
    setTimeout(() => {
      this._inputElement.checked = false;
      this.internals.states.delete('--checked');
      this.internals.ariaChecked = 'false';
      this._wasLastSelected = false;

      // Dispatch event to parent
      this.dispatchEvent(
        new CustomEvent(`activate-qti-simple-choice`, {
          bubbles: true,
          composed: true,
          detail: { identifier: this.identifier }
        })
      );
    }, 0);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Remove event listeners
    this.removeEventListener('click', this._handleHostClick);

    if (this.inputType === 'radio') {
      const inputElement = this.shadowRoot?.querySelector('input');
      if (inputElement) {
        inputElement.removeEventListener('click', this._handleRadioClick);
      }
    }
  }

  private _handleInputChange(e: Event) {
    const isChecked = this._inputElement.checked;

    // Normal handling for when something gets checked
    if (isChecked) {
      this.internals.states.add('--checked');
      this.internals.ariaChecked = 'true';
      this._wasLastSelected = true;
    } else {
      this.internals.states.delete('--checked');
      this.internals.ariaChecked = 'false';
      this._wasLastSelected = false;
    }

    // Dispatch the activate event to notify the parent
    this.dispatchEvent(
      new CustomEvent(`activate-qti-simple-choice`, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier }
      })
    );
  }

  // Update when attributes change
  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    if (changedProperties.has('disabled') && this._inputElement) {
      this._inputElement.disabled = this.disabled;
    }

    if (changedProperties.has('readonly') && this._inputElement) {
      this._inputElement.readOnly = this.readonly;
    }

    // If the input type changes, we need to update event listeners
    if (changedProperties.has('inputType')) {
      // Remove old event listeners
      const inputElement = this.shadowRoot?.querySelector('input');
      if (inputElement) {
        inputElement.removeEventListener('click', this._handleRadioClick);

        // Add new event listeners if it's a radio
        if (this.inputType === 'radio') {
          inputElement.addEventListener('click', this._handleRadioClick);
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-choice': QtiSimpleChoice;
  }
}
