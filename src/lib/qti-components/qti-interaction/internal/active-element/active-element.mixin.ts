import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '../../../../decorators/watch';

import type { ComplexAttributeConverter, LitElement } from 'lit';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export interface ChoiceInterface {
  identifier: string;
  disabled: boolean;
  readonly: boolean;
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
export interface ActiveElementMixinInterface {
  identifier: string;
  tabIndex: number;
  disabled: boolean;
  readonly: boolean;
  internals: ElementInternals;
}

export function ActiveElementMixin<T extends Constructor<LitElement>>(Base: T, type: string) {
  abstract class QtiChoice extends Base {
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

    public internals: ElementInternals;

    @watch('disabled', { waitUntilFirstUpdate: true })
    handleDisabledChange(_oldValue: boolean, disabled: boolean) {
      this.tabIndex = disabled ? -1 : 0;
      if (disabled) {
        this.blur();
      }
    }

    constructor(...args: any[]) {
      super(...args);
      this.internals = this.attachInternals();
    }

    override connectedCallback() {
      super.connectedCallback();

      this.addEventListener('keyup', this._onKeyUp);
      this.addEventListener('click', this._onClick);
      this.addEventListener('touchend', this._onTouchEnd);

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
      this.removeEventListener('touchend', this._onTouchEnd);
      this.dispatchEvent(
        new CustomEvent(`unregister-${type}`, {
          bubbles: true,
          composed: true
        })
      );
    }

    private _onKeyUp(event: KeyboardEvent) {
      if (event.altKey) return;

      if (event.code === 'Space') {
        event.preventDefault();
        this._activate();
      }
    }

    private _onClick() {
      if (this.disabled || this.readonly) return;
      this.focus();
      this._activate();
    }

    private _onTouchEnd(event: TouchEvent) {
      if (this.disabled || this.readonly) return;
      // Prevent the click event from firing after touchend to avoid double activation
      event.preventDefault();
      this.focus();
      this._activate();
    }

    private _activate() {
      if (this.disabled || this.readonly) return;

      this.dispatchEvent(
        new CustomEvent<{ identifier: string }>(`activate-${type}`, {
          bubbles: true,
          composed: true,
          detail: { identifier: this.identifier }
        })
      );
    }

    override render() {
      return html`<slot></slot>`;
    }
  }
  return QtiChoice as Constructor<ActiveElementMixinInterface> & T;
}
