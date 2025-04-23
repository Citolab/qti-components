import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '../../../../decorators/watch';

import type { ComplexAttributeConverter, LitElement } from 'lit';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export interface ChoiceInterface {
  identifier: string;
  disabled: boolean;
  readonly: boolean;
  checked?: boolean;
}

/**
 * Converter to handle boolean attributes for ARIA properties,
 * ensuring they are set as 'true' or 'false' strings.
 */
const ariaBooleanConverter: ComplexAttributeConverter<boolean, boolean> = {
  toAttribute: (value: boolean) => (value ? 'true' : 'false'),
  fromAttribute: (value: string | null) => value === 'true'
};

export interface FormElementOptions {
  /** Type of interaction ('choice', 'checkbox', 'radio', etc.) */
  type: string;
  /** Whether the element can be checked/unchecked */
  checkable?: boolean;
  /** Whether to dispatch 'change' events instead of 'activate' events */
  useChangeEvent?: boolean;
}

export interface ActiveElementMixinInterface {
  identifier: string;
  tabIndex: number;
  disabled: boolean;
  readonly: boolean;
  checked?: boolean;
  internals: ElementInternals;
}

export function ActiveElementMixin<T extends Constructor<LitElement>>(Base: T, options: string | FormElementOptions) {
  const config =
    typeof options === 'string'
      ? { type: options, checkable: false, useChangeEvent: false }
      : { checkable: false, useChangeEvent: false, ...options };

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

    @property({
      type: Boolean,
      reflect: true
    })
    public checked = false;

    public internals: ElementInternals;

    @watch('disabled', { waitUntilFirstUpdate: true })
    handleDisabledChange(_oldValue: boolean, disabled: boolean) {
      this.tabIndex = disabled ? -1 : 0;
      if (disabled) {
        this.blur();
      }
    }

    @watch('checked', { waitUntilFirstUpdate: true })
    handleCheckedChange(_oldValue: boolean, checked: boolean) {
      if (config.checkable && config.useChangeEvent) {
        this._dispatchChangeEvent();
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
      this.dispatchEvent(
        new CustomEvent(`register-${config.type}`, {
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
        new CustomEvent(`unregister-${config.type}`, {
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

    private _activate() {
      if (this.disabled || this.readonly) return;

      if (config.checkable) {
        // Toggle checked state for checkboxes
        // For radio buttons, this would be handled differently (likely by a parent component)
        if (!config.useChangeEvent) {
          this.checked = !this.checked;
        }
      }

      if (config.useChangeEvent) {
        if (config.checkable && !this.checked) {
          this.checked = !this.checked;
        } else {
          this._dispatchChangeEvent();
        }
      } else {
        this._dispatchActivateEvent();
      }
    }

    private _dispatchActivateEvent() {
      this.dispatchEvent(
        new CustomEvent<{ identifier: string; checked?: boolean }>(`activate-${config.type}`, {
          bubbles: true,
          composed: true,
          detail: {
            identifier: this.identifier,
            ...(config.checkable ? { checked: this.checked } : {})
          }
        })
      );
    }

    private _dispatchChangeEvent() {
      this.dispatchEvent(
        new CustomEvent<{ identifier: string; checked: boolean }>(`change-${config.type}`, {
          bubbles: true,
          composed: true,
          detail: {
            identifier: this.identifier,
            checked: this.checked
          }
        })
      );
    }

    override render() {
      return html`<slot></slot>`;
    }
  }

  return QtiChoice as Constructor<ActiveElementMixinInterface> & T;
}
