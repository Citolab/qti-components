import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';

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

    /*
     * `tabindex` is a native focusability attribute, not an ARIA state — it has to reach the
     * DOM or the element cannot be focused. Reflect it, unlike disabled/readonly below.
     */
    @property({ type: Number, reflect: true, attribute: 'tabindex' })
    public override tabIndex = 0;

    /*
     * Author markup may set `aria-disabled` / `aria-readonly` to seed these, but they are
     * deliberately never reflected back out. The semantics live on ElementInternals: the
     * ARIA property feeds the accessibility tree, the custom state feeds CSS. Style with
     * `:state(disabled)` / `:state(readonly)`, never an attribute selector.
     */
    @property({
      type: Boolean,
      attribute: 'aria-disabled',
      converter: ariaBooleanConverter
    })
    public disabled = false;

    @property({
      type: Boolean,
      attribute: 'aria-readonly',
      converter: ariaBooleanConverter
    })
    public readonly = false;

    public internals: ElementInternals;

    @watch('disabled', { waitUntilFirstUpdate: true })
    handleDisabledChange(_oldValue: boolean, disabled: boolean) {
      // Mirror the semantic onto ElementInternals: the ARIA property feeds the accessibility
      // tree, the custom state feeds CSS (`:state(disabled)`). Only assert them when actually
      // disabled and clear them otherwise, so an enabled element carries no disabled semantics.
      if (disabled) {
        this.internals.ariaDisabled = 'true';
        this.internals.states.add('disabled');
        this.blur();
      } else {
        this.internals.ariaDisabled = null;
        this.internals.states.delete('disabled');
      }
      this.tabIndex = disabled ? -1 : 0;
    }

    @watch('readonly', { waitUntilFirstUpdate: true })
    handleReadonlyChange(_oldValue: boolean, readonly: boolean) {
      if (readonly) {
        this.internals.ariaReadOnly = 'true';
        this.internals.states.add('readonly');
      } else {
        this.internals.ariaReadOnly = null;
        this.internals.states.delete('readonly');
      }
    }

    constructor(...args: any[]) {
      super(...args);
      this.internals = this.attachInternals();
    }

    override connectedCallback() {
      super.connectedCallback();

      // Initialize ARIA/state on internals (watchers only fire on change). Only assert
      // disabled/readonly when true — an enabled, editable element carries no such semantics.
      this.internals.ariaChecked = 'false';
      if (this.disabled) {
        this.internals.ariaDisabled = 'true';
        this.internals.states.add('disabled');
        this.tabIndex = -1;
      }
      if (this.readonly) {
        this.internals.ariaReadOnly = 'true';
        this.internals.states.add('readonly');
      }

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

    private _onKeyUp(event: KeyboardEvent) {
      if (event.altKey) return;

      if (event.code === 'Space' || event.code === 'Enter') {
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
