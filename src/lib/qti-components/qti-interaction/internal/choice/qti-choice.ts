import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../../../decorators/watch';

const KEYCODE = {
  SPACE: 32
};

/**
 * @summary qti-choice is used by qti-simple-choice, qti-inline-choice, qti-hottext, qti-hotspot-choice.
 *
 * @since 1.0
 * @status stable
 *
 * @event qti-register-choice - register itselves on a qti-choice-interaction element.
 * @event qti-loose-choice - de-register itselves on a qti-choice-interaction element.
 * @event qti-choice-element-selected - Emitted when the choice is selected.
 *
 * @slot - The choices slot element
 */
export abstract class QtiChoice extends LitElement {
  @property({ type: String }) identifier: string;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  @property({
    reflect: true,
    type: Boolean,
    attribute: 'aria-disabled',
    converter: {
      toAttribute: value => value
    }
  })
  disabled = false;

  @property({
    reflect: true,
    type: Boolean,
    attribute: 'aria-readonly',
    converter: {
      toAttribute: value => value
    }
  })
  readonly = false;

  @property({
    reflect: true,
    type: Boolean,
    attribute: 'aria-checked',
    converter: {
      toAttribute: value => value
    }
  })
  checked = false;

  @watch('disabled', { waitUntilFirstUpdate: true })
  handleDisabledChange(_: boolean, disabled: boolean) {
    if (disabled) {
      this.tabindex = undefined;
      this.blur();
    } else {
      this.tabIndex = 0;
    }
  }

  override connectedCallback() {
    super.connectedCallback();

    this.addEventListener('keyup', this._onKeyUp);
    this.addEventListener('click', this._onClick);

    this.dispatchEvent(
      new CustomEvent('qti-register-choice', {
        bubbles: true,
        cancelable: false,
        composed: true
      })
    );
  }

  override disconnectedCallback() {
    this.removeEventListener('keyup', this._onKeyUp);
    this.removeEventListener('click', this._onClick);

    this.dispatchEvent(
      new CustomEvent('qti-loose-choice', {
        bubbles: true,
        cancelable: false,
        composed: true
      })
    );
  }

  public reset() {
    this.checked = false;
    this.disabled = false;
  }

  private _onKeyUp(event: KeyboardEvent) {
    if (event.altKey) return;

    switch (event.keyCode) {
      case KEYCODE.SPACE:
        event.preventDefault();
        this._toggleChecked();
        break;

      default:
    }
  }

  private _onClick() {
    this._toggleChecked();
  }

  private _toggleChecked() {
    if (this.disabled || this.readonly) return;
    this.checked = !this.checked;

    this.dispatchEvent(
      new CustomEvent('qti-choice-element-selected', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { identifier: this.identifier, checked: this.checked }
      })
    );
  }

  validateAllProps() {
    if (!this.getAttribute('identifier')) return false;
    return true;
  }

  override render() {
    if (!this.validateAllProps()) {
      console.warn(`Invalid props for ${this.outerHTML}`, `missing identifier`);
    }
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-choice': QtiChoice;
  }
}
