import { ContextConsumer, consume, provide } from '@lit/context';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { configContext } from '../context/config.context';
import { interactionContext } from '../context/interaction.context';
import { itemContext } from '../context/item.context';
import { setState } from '../utils/state-aliases';

import type { PropertyValues } from 'lit';
import type { InteractionContext } from '../context/interaction.context';
import type { ConfigContext, ValidationDisplayMode } from '../context/config.context';
import type { ItemContext } from '../context/types/item.types';
import type { ValidatableInteraction } from '../lib/interaction.interface';
import type { ResponseVariable } from '../lib/variables';

/** Why an interaction is invalid: too few (`min`), too many (`max`), or something else (`other`). */
export type ValidityKind = 'min' | 'max' | 'other';
/** What asked for the report: the candidate changing the response, or a submit (end attempt, form). */
export type ValidityTrigger = 'change' | 'submit';

/**
 * Shared QTI interaction base. Formative correction behavior is supplied by the
 * `@qti-components/corrections` package.
 */
export abstract class Interaction extends LitElement implements ValidatableInteraction {
  /**
   * The item's variables. The interaction takes its response from here as well as publishing it:
   * when the item's value for this response changes to something other than what the interaction
   * shows, it adopts it. That is how `item.variables = …` reaches it, with no list of interactions
   * kept by the item. See {@link Interaction.#adoptResponse}.
   */
  #itemContext = new ContextConsumer(this, {
    context: itemContext,
    subscribe: true,
    callback: context => this.#followItem(context)
  });

  private get _context(): ItemContext | undefined {
    return this.#itemContext.value;
  }

  #seenReadonly?: boolean;
  #seenDisabled?: boolean;

  /**
   * Follows the item: its `readonly` and `disabled`, and the value it holds for this response.
   * `readonly` and `disabled` are only taken when the item says something, so an interaction
   * authored with either stays so inside an item that does not mention it.
   */
  #followItem(context: ItemContext | undefined) {
    if (context?.readonly !== undefined && context.readonly !== this.#seenReadonly) {
      this.#seenReadonly = context.readonly;
      this.readonly = context.readonly;
    }
    if (context?.disabled !== undefined && context.disabled !== this.#seenDisabled) {
      this.#seenDisabled = context.disabled;
      this.disabled = context.disabled;
    }
    this.#adoptResponse(context);
  }

  /** The item's last value for this response, serialised, to tell a change from an unrelated update. */
  #seenResponse?: string;
  /**
   * What this interaction last published or adopted, serialised. It is kept from the interaction's
   * own `qti-interaction-response` events, which every emitter dispatches on the interaction itself,
   * and not read back from `response`: that getter has no common shape (the drag-drop interactions
   * return one comma-joined string where they publish an array), so it cannot be compared.
   */
  #lastResponse?: string;
  #adoptScheduled = false;

  /**
   * Adopts the item's value for this response when it changed and the interaction does not already
   * show it.
   *
   * Two things keep this from fighting the candidate. It reacts to the item's value for *this*
   * response changing, not to any context update, so a score or a timer ticking never rewrites what
   * is being typed. And when the item's value is what the interaction itself last published (which
   * is what happens right after it publishes an answer) it does nothing, so there is no echo.
   *
   * The first value is only adopted when it says something: an unanswered item must not wipe a
   * `response` attribute the author put on the interaction.
   *
   * Setting `response` on an interaction that has not rendered yet is what the item used to avoid
   * by waiting, so until the first update this waits too, then looks at the latest value.
   */
  #adoptResponse(context: ItemContext | undefined) {
    const id = this.responseIdentifier ?? this.getAttribute('response-identifier');
    const variable = context?.variables?.find(v => v.type === 'response' && v.identifier === id);
    if (!variable) return;

    if (!this.hasUpdated) {
      if (!this.#adoptScheduled) {
        this.#adoptScheduled = true;
        void this.updateComplete.then(() => {
          this.#adoptScheduled = false;
          this.#adoptResponse(this._context);
        });
      }
      return;
    }

    const first = this.#seenResponse === undefined;
    const serialised = JSON.stringify(variable.value ?? null);
    if (serialised === this.#seenResponse) return;
    this.#seenResponse = serialised;
    if (first && (variable.value === null || variable.value === undefined)) return;
    if (serialised === this.#lastResponse) return;
    this.#lastResponse = serialised;
    this.response = variable.value as string | string[] | null;
  }

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

  /** Why the interaction is invalid right now; `undefined` while it is valid. */
  protected _validityKind?: ValidityKind;
  /** Set once a submit has reported; from then on every change reports in full. */
  protected _validityReported = false;
  /** True while this element asks its own internals to report, so its `invalid` is not a submit. */
  protected _reportingNatively = false;

  /** Forget that a submit has reported: a reset or a new attempt waits for a submit again. */
  protected resetValidityReport(): void {
    this._validityReported = false;
    this.clearInlineValidationMessage();
  }

  /**
   * Show the validity state, in the configured mode.
   *
   * When it shows depends on what asked: a `change` (the candidate picked or dropped something)
   * reports what they just did wrong, too many, at once; too few is not an error until they say they
   * are done, so a `submit` (the item's end attempt, a form's submit) is what first shows it. After
   * that first submit, changes report in full, so the message clears the moment the minimum is met
   * and comes back if it is lost again. The validity itself is always set: a form with a
   * below-minimum interaction cannot submit either way.
   */
  public reportValidity(options?: { trigger?: ValidityTrigger }): boolean {
    const trigger = options?.trigger ?? 'submit';
    // A submit judges the response as it is now, whatever changed it (a restore, a host write).
    if (trigger === 'submit') this.validate?.();
    const isValid = this._internals.validity.valid;
    const mode = this.validationDisplayMode;

    if (trigger === 'submit') this._validityReported = true;
    if (trigger === 'change' && !this._validityReported && this._validityKind === 'min') {
      this.clearInlineValidationMessage();
      return isValid;
    }

    if (mode === 'native' || mode === 'both') {
      // `internals.reportValidity()` fires `invalid` on this host; that one is ours, not a submit.
      this._reportingNatively = true;
      try {
        this._internals.reportValidity();
      } finally {
        this._reportingNatively = false;
      }
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
        console.warn(
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
    options?: { suppressInline?: boolean; kind?: ValidityKind }
  ): void {
    const validityAnchor = anchor ?? this;
    this._internals.setValidity(isValid ? {} : { customError: true }, validityMessage, validityAnchor);
    this._validityKind = isValid ? undefined : (options?.kind ?? 'other');

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
    this.resetValidityReport();
    this.response = null;
  }

  public formResetCallback(): void {
    this.resetValidityReport();
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

  /**
   * `disabled` and `readonly` are states as well as attributes (qti-theme CONTRACT.md §3): a theme
   * reads `:state(disabled)` on the host the way it reads it on a choice. The attribute stays
   * reflected, so `[disabled]` keeps matching.
   */
  protected override update(changed: PropertyValues): void {
    const first = !this.hasUpdated;
    super.update(changed);
    // Validity from the start, not only from the candidate's first change: an untouched interaction
    // below its minimum is invalid, so a form holding it does not submit. Silent: a validate never
    // shows a message, a report does. Twice and no more: once after the first render, and once two
    // frames later, when a restored response has been applied (choices' checked states and placed
    // chips land in the updates after the first). A submit validates again (reportValidity).
    // Bounded on purpose: a validate can cause an update, so validating per update loops.
    if (first) {
      const run = () => this.isConnected && this.validate();
      void this.updateComplete.then(run);
      requestAnimationFrame(() => requestAnimationFrame(run));
    }
    if (changed.has('disabled')) setState(this._internals.states, 'disabled', this.disabled);
    if (changed.has('readonly')) setState(this._internals.states, 'readonly', this.readonly);
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
    // A form's submit runs the browser's own validation, which fires `invalid` on an invalid
    // element and shows the native message at its anchor. That is a submit: show the inline
    // message too, and from now on report every change in full. Ignored while this element
    // reports through its own internals (that fires `invalid` too). A host calling
    // `form.checkValidity()` also lands here and cannot be told apart from a submit; it counts as one.
    this.addEventListener('invalid', () => {
      if (this._reportingNatively) return;
      this._validityReported = true;
      if (this.validationDisplayMode === 'inline' || this.validationDisplayMode === 'both') {
        this.updateInlineValidationMessage();
      }
    });
    this.addEventListener('qti-interaction-response', (e: Event) => {
      this.#lastResponse = JSON.stringify((e as CustomEvent).detail?.response ?? null);
    });
  }

  /**
   * Optional lifecycle bridge for interaction subclasses that do not need changed-property data.
   *
   * The parameter is `PropertyValues`, matching LitElement, and NOT `PropertyValues<this>`.
   * The polymorphic `this` narrowed the parameter per subclass, which made every interaction
   * class structurally incompatible with `LitElement` — so `Constructor<LitElement>`, the
   * standard constraint for a Lit mixin, rejected all of them and consumers could not wrap an
   * interaction in a mixin without casting. `this` buys nothing in a parameter position and
   * costs contravariant compatibility with the base class.
   *
   * Still optional, so subclasses that ignore the argument can override with `firstUpdated()`.
   */
  protected override firstUpdated(_changedProperties?: PropertyValues): void {}
}
