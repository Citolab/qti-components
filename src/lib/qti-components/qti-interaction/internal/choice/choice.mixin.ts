import { ComplexAttributeConverter, LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../../../decorators/watch';

type Constructor<T = {}> = new (...args: any[]) => T;

export interface ChoiceInterface {
  identifier: string;
  disabled: boolean;
  readonly: boolean;
  checked: boolean;
}

/**
 * Converter to handle boolean attributes for ARIA properties,
 * ensuring they are set as 'true' or 'false' strings.
 */
const ariaBooleanConverter: ComplexAttributeConverter<boolean, boolean> = {
  toAttribute: (value: boolean) => (value ? 'true' : 'false'),
  fromAttribute: (value: string | null) => value === 'true'
};

/**
 * A mixin that adds choice functionality to a LitElement-based class.
 * It dispatches events with a custom `type` and handles selection logic.
 *
 * @param Base - The base class to extend.
 * @param type - The type of the choice, used in event names.
 * @returns A new class extending the base class with choice functionality.
 */
export function QtiChoiceMixin<T extends Constructor<LitElement>>(Base: T, type: string) {
  class QtiChoice extends Base {
    @property({ type: String })
    public identifier = '';

    @property({ type: Number, reflect: true, attribute: 'tabindex' })
    public tabIndex = 0;

    @property({
      type: Boolean,
      reflect: true,
      attribute: 'aria-disabled',
      converter: ariaBooleanConverter
    })
    public disabled = false;

    @property({
      type: Boolean,
      reflect: true,
      attribute: 'aria-readonly',
      converter: ariaBooleanConverter
    })
    public readonly = false;

    @property({
      type: Boolean,
      reflect: true,
      attribute: 'aria-checked',
      converter: ariaBooleanConverter
    })
    public checked = false;

    @watch('disabled', { waitUntilFirstUpdate: true })
    handleDisabledChange(_oldValue: boolean, disabled: boolean) {
      this.tabIndex = disabled ? -1 : 0;
      if (disabled) {
        this.blur();
      }
    }

    override connectedCallback() {
      super.connectedCallback();

      this.addEventListener('keyup', this._onKeyUp);
      this.addEventListener('click', this._onClick);

      this.dispatchEvent(
        new CustomEvent(`register-${type}`, {
          bubbles: true,
          composed: true
        })
      );
    }

    override disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener('keyup', this._onKeyUp);
      this.removeEventListener('click', this._onClick);

      this.dispatchEvent(
        new CustomEvent(`unregister-${type}`, {
          bubbles: true,
          composed: true
        })
      );
    }

    /** Resets the choice to its initial state. */
    public reset() {
      this.checked = false;
      this.disabled = false;
    }

    private _onKeyUp(event: KeyboardEvent) {
      if (event.altKey) return;

      if (event.code === 'Space') {
        event.preventDefault();
        this._toggleChecked();
      }
    }

    private _onClick() {
      this._toggleChecked();
    }

    private _toggleChecked() {
      if (this.disabled || this.readonly) return;
      this.checked = !this.checked;

      this.dispatchEvent(
        new CustomEvent(`click-${type}`, {
          bubbles: true,
          composed: true,
          detail: { identifier: this.identifier, checked: this.checked }
        })
      );
    }

    override render() {
      return html`<slot></slot>`;
    }
  }
  return QtiChoice as Constructor<ChoiceInterface> & T;
}
