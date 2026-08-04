import { consume, provide } from '@lit/context';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { configContext } from '../context/config.context';
import { interactionContext } from '../context/interaction.context';
import { itemContext } from '../context/item.context';

import type { PropertyValues } from 'lit';
import type { InteractionContext } from '../context/interaction.context';
import type { ConfigContext, ValidationDisplayMode } from '../context/config.context';
import type { ItemContext } from '../context/types/item.types';
import type { ValidatableInteraction } from '../lib/interaction.interface';
import type { ResponseVariable } from '../lib/variables';

/**
 * Shared QTI interaction base. Formative correction behavior is supplied by the
 * `@qti-components/corrections` package.
 */
export abstract class Interaction extends LitElement implements ValidatableInteraction {
  @consume({ context: itemContext, subscribe: true })
  private _context: ItemContext;

  /**
   * Delivery configuration, from the nearest provider — `qti-test` or `qti-item`.
   *
   * **Public so it can be assigned directly, which is the development-time route.** An interaction
   * has to work standalone, and in a story or a spec there is usually no provider above it — so
   * setting the field is all that is needed:
   *
   *     orderInteraction.configContext = { allowReorder: false, validationDisplayMode: 'none' };
   *
   * With no provider, nothing ever overwrites it. That is the whole contract, and its limit: where a
   * provider DOES exist it re-emits on its next update and wins, because `@consume` writes this same
   * field. There is no merging — set the value on the provider in that case.
   *
   * In a lit-html template, bind it as a property rather than assigning after the fact:
   *
   *     html`<qti-order-interaction .configContext=${{ allowReorder: false }}>…`
   *
   * The binding is committed on the detached template clone, before the fragment is inserted, so it
   * is in place by `connectedCallback` — which matters for anything that reads config on connect.
   *
   * It was `protected`, which fooled nobody: every caller reached it anyway through an
   * `as any` / `as { configContext?: … }` cast. Public says what was already true and removes the
   * casts, rather than pretending at an encapsulation the type system was the only thing enforcing.
   */
  @consume({ context: configContext, subscribe: true })
  public configContext: ConfigContext;

  #didLogDisableAfterIfMaxChoicesReachedDeprecation = false;

  /*
   * Published to the choice elements inside this interaction — their role, and how to tell
   * whether they are draggable. Provided here on the base rather than in a mixin so that
   * ChoicesMixin and the drag-drop mixins can each contribute without two providers of the same
   * context competing on one element.
   *
   * Reassign, never mutate: an in-place change does not notify consumers.
   */
  @provide({ context: interactionContext })
  protected _interactionContext: Readonly<InteractionContext> = { choiceRole: null, draggablesSelector: null };

  static formAssociated = true;
  protected _internals: ElementInternals;

  get internals(): ElementInternals {
    return this._internals;
  }

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string;

  @property({ reflect: true, type: Boolean }) disabled = false;

  @property({ reflect: true, type: Boolean }) readonly = false;

  @property({ type: String }) name;

  /** Extension point used by wrappers that should not register as candidate inputs. */
  protected get registersWithItem(): boolean {
    return true;
  }

  get isInline(): boolean {
    return false;
  }

  get responseVariable(): ResponseVariable | undefined {
    if (!this._context?.variables) {
      return undefined;
    }
    const responseVariables = this._context.variables.filter(v => v.type === 'response') as ResponseVariable[];
    const responseIdentifier = this.getAttribute('response-identifier');
    return responseVariables.find(v => v.identifier === responseIdentifier);
  }

  abstract validate(): boolean;

  get value(): string | null {
    return JSON.stringify(this.response);
  }

  set value(val: string | null) {
    this.response = val ? JSON.parse(val) : null;
  }

  abstract get response(): string | string[] | null;
  abstract set response(val: string | string[] | null);

  public reportValidity(): boolean {
    const isValid = this._internals.validity.valid;
    const mode = this.validationDisplayMode;

    if (mode === 'native' || mode === 'both') {
      this._internals.reportValidity();
    }

    if (mode === 'inline' || mode === 'both') {
      this.updateInlineValidationMessage();
    } else {
      this.clearInlineValidationMessage();
    }

    if (mode === 'none') {
      this.clearInlineValidationMessage();
    }

    return isValid;
  }

  protected get validationDisplayMode(): ValidationDisplayMode {
    return this.configContext?.validationDisplayMode ?? 'inline';
  }

  protected resolveAllowReorder(options?: { defaultWhenUnset?: boolean }): boolean {
    const defaultWhenUnset = options?.defaultWhenUnset ?? true;
    const config = this.configContext;
    if (!config) {
      return defaultWhenUnset;
    }
    if (config.allowReorder !== undefined) {
      return config.allowReorder;
    }
    return defaultWhenUnset;
  }

  protected resolveDisableAfterMaxReached(options?: { defaultWhenUnset?: boolean }): boolean {
    const defaultWhenUnset = options?.defaultWhenUnset ?? false;
    const config = this.configContext;

    if (!config) {
      return defaultWhenUnset;
    }

    if (config.disableAfterMaxReached !== undefined) {
      return config.disableAfterMaxReached;
    }

    if (config.disableAfterIfMaxChoicesReached !== undefined) {
      if (!this.#didLogDisableAfterIfMaxChoicesReachedDeprecation) {
        this.#didLogDisableAfterIfMaxChoicesReachedDeprecation = true;
        console.log(
          '[QTI Config] `disableAfterIfMaxChoicesReached` is deprecated. Use `disableAfterMaxReached` instead.'
        );
      }
      return config.disableAfterIfMaxChoicesReached;
    }

    return defaultWhenUnset;
  }

  protected setInteractionValidity(
    isValid: boolean,
    validityMessage = '',
    anchor?: HTMLElement | null,
    options?: { suppressInline?: boolean }
  ): void {
    const validityAnchor = anchor ?? this;
    this._internals.setValidity(isValid ? {} : { customError: true }, validityMessage, validityAnchor);

    if (
      options?.suppressInline !== true &&
      (this.validationDisplayMode === 'inline' || this.validationDisplayMode === 'both')
    ) {
      this.updateInlineValidationMessage();
    }
  }

  protected updateInlineValidationMessage(): void {
    const validationMessageElement = this.getValidationMessageElement();
    if (!validationMessageElement) {
      return;
    }

    if (!this._internals.validity.valid) {
      validationMessageElement.textContent = this._internals.validationMessage;
      validationMessageElement.style.setProperty('display', 'block', 'important');
      return;
    }

    validationMessageElement.textContent = '';
    validationMessageElement.style.display = 'none';
  }

  protected clearInlineValidationMessage(): void {
    const validationMessageElement = this.getValidationMessageElement();
    if (!validationMessageElement) {
      return;
    }

    validationMessageElement.textContent = '';
    validationMessageElement.style.display = 'none';
  }

  protected getValidationMessageElement(): HTMLElement | null {
    return this.shadowRoot?.querySelector('#validation-message') as HTMLElement | null;
  }

  public reset(): void {
    this.response = null;
  }

  public formResetCallback(): void {
    this.reset();
  }

  public override connectedCallback(): void {
    super.connectedCallback();

    if (!this.registersWithItem) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent('qti-register-interaction', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail: {
          interactionElement: this,
          responseIdentifier: this.responseIdentifier
        }
      })
    );
  }

  public saveResponse(value: string | string[], state?: string | null): void {
    this.dispatchEvent(
      new CustomEvent('qti-interaction-response', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail: {
          responseIdentifier: this.responseIdentifier,
          response: Array.isArray(value) ? [...value] : value,
          ...(state !== undefined ? { state } : {})
        }
      })
    );
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  /** Optional lifecycle bridge for interaction subclasses that do not need changed-property data. */
  protected override firstUpdated(_changedProperties?: PropertyValues<this>): void {}
}
