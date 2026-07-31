import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { watch } from '@qti-components/utilities';
import { Interaction } from '@qti-components/base';
import { configContext } from '@qti-components/base';
import { MenuAutoSizeMixin } from '@qti-components/interactions-core/mixins/menu-auto-size';

import styles from './qti-inline-choice-interaction.styles.js';

import type { PropertyValues } from 'lit';
import type { ConfigContext } from '@qti-components/base';
import type { ActiveElementMixinInterface } from '@qti-components/interactions-core/mixins/active-element/active-element.mixin';

interface OptionType {
  content: string | Node[];
  value: string;
  selected: boolean;
}

type InlineChoiceOptionElement = HTMLElement & ActiveElementMixinInterface;

let inlineChoiceMenuCounter = 0;

/**
 * Inline choice interaction: dropdown selector rendered inline with surrounding text.
 *
 * @customElement qti-inline-choice-interaction
 *
 * @attr {string} response-identifier - Required. Identifier of the bound response variable.
 * @attr {string} data-prompt - Placeholder shown before a choice is picked. Falls back to
 *   the item configuration's `inlineChoicePrompt`, then to `select`.
 * @attr {boolean} [shuffle=false] - Requests option shuffling. Applied by the transform
 *   pipeline (`qti-transformers`), not by this element.
 * @attr {boolean} [required=false] - Whether a choice must be selected for the response to be
 *   valid. Written as `required="true"` / `required="false"`; a bare `required` is accepted too.
 * @attr {number} [min-choices=0] - Equivalent spelling of `required`: `1` demands an answer.
 *   Absent from the QTI attribute table for this element but used by the conformance suite.
 *
 * @slot - Default slot for `qti-inline-choice` options.
 *
 * @csspart trigger - The dropdown trigger button.
 * @csspart value - The currently displayed value inside the trigger.
 * @csspart dropdown-icon - The chevron icon inside the trigger; also carries `dropdown-icon-open` when open.
 * @csspart menu - The popover element containing the option list.
 * @csspart option - Each option button; also carries `option-prompt` and `option-selected` variants.
 * @csspart option-content - The content wrapper inside each option.
 * @csspart correct-option - Overlay shown when displaying the correct response.
 */
export class QtiInlineChoiceInteraction extends MenuAutoSizeMixin(Interaction) {
  constructor() {
    super();
    this.internals.role = 'listbox';
  }

  override get isInline(): boolean {
    return true;
  }

  static override get styles() {
    return [styles];
  }

  @state()
  protected options: OptionType[] = [];

  @state()
  protected _dropdownOpen = false;

  private _slotObserver: MutationObserver | null = null;
  private readonly _menuId = `qti-inline-choice-menu-${inlineChoiceMenuCounter++}`;

  @consume({ context: configContext, subscribe: true })
  @property({ attribute: false })
  declare configContext: ConfigContext;

  /**
   * Placeholder shown in the closed combobox before a choice is picked.
   *
   * Declared rather than read straight off `dataset` so it reaches the custom elements
   * manifest, the generated types and the Storybook controls — and so that changing it
   * re-renders, which reading `dataset` at render time never did.
   *
   * Falls back to the item configuration's `inlineChoicePrompt`, then to `select`.
   */
  @property({ type: String, attribute: 'data-prompt' }) dataPrompt: string;

  @watch('dataPrompt', { waitUntilFirstUpdate: true })
  protected _handleDataPromptChange = () => {
    this.#updateOptions();
  };

  /**
   * Whether a choice must be selected for the response to be valid. QTI defaults this to
   * false, so an untouched dropdown is a valid empty response unless an author opts in.
   *
   * QTI writes `required="true"` / `required="false"` rather than using HTML's bare-attribute
   * boolean, so `required="false"` must read as false — which Lit's default Boolean converter
   * would get backwards, since it only tests for the attribute's presence.
   */
  @property({
    type: Boolean,
    reflect: true,
    converter: {
      // A bare `required` is accepted too, so HTML-style authoring still behaves sensibly.
      fromAttribute: (value: string | null) => value === 'true' || value === '',
      toAttribute: (value: boolean) => (value ? 'true' : null)
    }
  })
  required = false;

  /**
   * Minimum selections for a valid response — in practice 0 or 1, since the dropdown holds one.
   *
   * Not in the QTI 3 Implementation Guide's attribute table for this element, which offers only
   * `required`. It is in the conformance suite: `Advanced/Q12-inline-choice/inline-choice-sv-3`
   * expresses "must answer" as `min-choices="1"`, and pairs it with `data-min-selections-message`.
   * Authors reach for it because every sibling interaction takes it, so it is honoured here as an
   * equivalent spelling of `required`.
   */
  @property({ type: Number, attribute: 'min-choices' }) minChoices = 0;

  @watch(['required', 'minChoices'], { waitUntilFirstUpdate: true })
  protected _handleRequiredChange = () => {
    this.validate();
    this.reportValidity();
  };

  /*
   * The template in named pieces, so a subclass can recompose it. Override a piece to change what
   * one part looks like; override `render()` to change the order. See the longer note on the same
   * pattern in qti-extended-text-interaction.
   */

  /** The closed combobox — the box showing the chosen option. */
  protected renderTrigger(): unknown {
    const selected = this.#selectedOption();

    return html`
      <button
        part="trigger"
        type="button"
        @click=${this.#onTriggerClick}
        @keydown=${this.#onCustomTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded="${this._dropdownOpen ? 'true' : 'false'}"
        aria-controls="${this._menuId}"
        popovertarget="${this._menuId}"
        popovertargetaction="toggle"
        ?disabled="${this.disabled}"
        data-readonly="${this.readonly ? 'true' : 'false'}"
      >
        <span part="value">${selected?.content}</span>
        <span
          part="${this._dropdownOpen ? 'dropdown-icon dropdown-icon-open' : 'dropdown-icon'}"
          aria-hidden="true"
        ></span>
      </button>
    `;
  }

  /** The popover listbox. */
  protected renderMenu(): unknown {
    return html`
      <div
        id="${this._menuId}"
        part="menu"
        role="listbox"
        popover="auto"
        @toggle=${this.#onMenuToggle}
        @keydown=${this.#onCustomMenuKeyDown}
      >
        <button
          part="${this.options[0]?.selected ? 'option option-prompt option-selected' : 'option option-prompt'}"
          type="button"
          role="option"
          aria-selected="${this.options[0]?.selected ? 'true' : 'false'}"
          @click=${() => this.#selectValue('')}
        >
          <span part="option-content">${this.options[0]?.content}</span>
        </button>
        <slot @slotchange=${this.#onChoicesSlotChange}></slot>
      </div>
    `;
  }

  /** Hidden until `Interaction.reportValidity` shows it. */
  protected renderValidationMessage(): unknown {
    return html`<div id="validation-message" part="message" role="alert" style="display:none;"></div>`;
  }

  override render() {
    return html` ${this.renderTrigger()} ${this.renderMenu()} ${this.renderValidationMessage()} `;
  }

  override async connectedCallback() {
    super.connectedCallback();
    this.#updateOptions();
    this.#startSlotObserver();

    // First measurement, once the trigger and menu exist to be measured. After this the mixin's
    // ResizeObserver keeps the width current on its own.
    await this.updateComplete;

    if (!this.isConnected) return;

    this.updateMenuWidth();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    this.#teardownSlottedChoices();
    this._slotObserver?.disconnect();
    this._slotObserver = null;
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('configContext')) {
      this.#updateOptions();
    }
  }

  override updated(changed: PropertyValues<this>) {
    const dropdownOpenKey = '_dropdownOpen' as keyof QtiInlineChoiceInteraction;
    if (changed.has(dropdownOpenKey) && this._dropdownOpen) {
      this.#syncSlottedChoices();
      const first = this.#allMenuOptions()[0];
      first?.focus();
    }

    if (changed.has('disabled') || changed.has('readonly')) {
      this.#syncSlottedChoices();
    }
  }

  #selectedOption(): OptionType | undefined {
    return this.options.find(option => option.selected) ?? this.options[0];
  }

  #updateOptions() {
    const choices = Array.from(this.querySelectorAll('qti-inline-choice'));
    const prompt = this.dataPrompt || this.configContext?.inlineChoicePrompt || 'select';

    // Pending value from `response="…"` attribute set before slotted options existed
    // takes precedence over any current selection.
    const pendingValue = this._pendingResponse;
    const currentlySelectedValue =
      pendingValue !== undefined ? (pendingValue ?? '') : (this.options.find(o => o.selected)?.value ?? '');

    const nextOptions: OptionType[] = [
      {
        content: prompt,
        value: '',
        selected: currentlySelectedValue === ''
      },
      ...choices.map(choice => {
        const value = choice.getAttribute('identifier') ?? '';
        return {
          content: Array.from(choice.childNodes).map(node => node.cloneNode(true)),
          value,
          selected: value !== '' && value === currentlySelectedValue
        };
      })
    ];

    const hasSelected = nextOptions.some(o => o.selected);
    this.options = hasSelected ? nextOptions : nextOptions.map((o, i) => ({ ...o, selected: i === 0 }));
    this._pendingResponse = undefined;
    this.#syncSlottedChoices();

    this.updateMenuWidth();
  }

  /**
   * Autosizing is opt-in through `configContext.inlineChoiceAutosize`, and an explicit
   * `qti-input-width-*` class always wins.
   *
   * That second check has to live here rather than in CSS: the measurement is written as an inline
   * style on the trigger, and the width classes set the same property on `:host`, so the cascade
   * would hand it to the measurement every time. Not writing at all is what makes the class win.
   */
  public override shouldAutoSizeMenu(): boolean {
    if (!this.configContext?.inlineChoiceAutosize) return false;
    return !Array.from(this.classList).some(c => c.startsWith('qti-input-width-'));
  }

  /**
   * The chevron sits in the trigger and not in the menu, so the menu never measures it.
   *
   * `offsetWidth`, NOT `getBoundingClientRect().width`: the icon rotates when the menu opens, and a
   * client rect reports the TRANSFORMED box — so a chevron caught mid-rotation measures wider than
   * it is, and the trigger grew and shrank by a few pixels on every open. offsetWidth is the layout
   * box and ignores the transform. (Same trap the drag-drop clone code documents for a chip picked
   * up mid-animation.)
   */
  public override menuAutoSizeExtraWidth(): number {
    const icon = this.renderRoot.querySelector<HTMLElement>('span[part~="dropdown-icon"]');
    return icon?.offsetWidth ?? 0;
  }

  public validate(): boolean {
    const selectedOption = this.options.find(option => option.selected);
    const hasSelection = selectedOption ? selectedOption.value !== '' : false;

    // An empty response only invalidates when the author asked for one, spelled either way.
    // Before `required` existed this returned `hasSelection` outright, which made every
    // untouched dropdown invalid — the behaviour of a permanently-required field, and out of
    // step with `ChoicesMixin`, where an empty response is valid while `min-choices` is 0.
    const answerDemanded = this.required || this.minChoices >= 1;
    const isValid = hasSelection || !answerDemanded;

    const validityMessage = this.dataset.minChoicesMessage || 'Please select an option.';
    this.setInteractionValidity(isValid, isValid ? '' : validityMessage, this, { suppressInline: true });
    return isValid;
  }

  public override reportValidity(): boolean {
    return super.reportValidity();
  }

  public override reset() {
    this.#setDropdownOpen(false);
    this.options = this.options.map((option, i) => ({ ...option, selected: i === 0 }));
    this.#syncSlottedChoices();
  }

  /**
   * Captures an attribute-set response before slotted options have been
   * gathered. `#updateOptions` consumes it once the options exist.
   * `undefined` = no pending value.
   */
  private _pendingResponse: string | null | undefined = undefined;

  @property({ attribute: 'response', reflect: false, noAccessor: true })
  public set response(value: string | null) {
    const nextValue = value ?? '';
    if (this.options.length === 0) {
      this._pendingResponse = value;
      return;
    }
    this.options = this.options.map(option => ({ ...option, selected: option.value === nextValue }));
    this.#syncSlottedChoices();
  }
  get response(): string | null {
    const value = this.options.find(option => option.selected)?.value ?? '';
    return value === '' ? null : value;
  }

  #selectValue(value: string) {
    this.options = this.options.map(option => ({ ...option, selected: option.value === value }));
    this.#syncSlottedChoices();
    this.validate();
    this.reportValidity();
    this.saveResponse(value);
    this.#setDropdownOpen(false);
  }

  #setDropdownOpen(open: boolean) {
    const menu = this.#menuElement();
    if (!menu) return;

    if (open) {
      if (!menu.matches(':popover-open')) {
        menu.showPopover();
      }
      return;
    }

    if (menu.matches(':popover-open')) {
      menu.hidePopover();
    }
  }

  #onTriggerClick = (event: MouseEvent) => {
    if (this.disabled || this.readonly) {
      event.preventDefault();
    }
  };

  #onCustomTriggerKeyDown = (event: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.#setDropdownOpen(true);
    }
  };

  #onMenuToggle = (event: Event) => {
    const toggleEvent = event as Event & { newState?: 'open' | 'closed' };
    const open = toggleEvent.newState === 'open';
    if (this._dropdownOpen !== open) {
      this._dropdownOpen = open;
    }
    // Published as a custom state so the theme can paint the open control — it squares the corners
    // where the trigger meets the menu. `_dropdownOpen` is a Lit @state and reaches no selector; a
    // custom state is the same opt-in the theme already uses for :state(disabled) / :state(readonly)
    // on this element. Not an attribute: a host whose mutation observer polices attributes (the
    // ProseMirror editor) cannot take one.
    if (open) this._internals.states.add('open');
    else this._internals.states.delete('open');
  };

  #onCustomMenuKeyDown = (event: KeyboardEvent) => {
    if (!this._dropdownOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.#setDropdownOpen(false);
      this.#focusTrigger();
      return;
    }

    const optionElements = this.#allMenuOptions();
    const shadowActive = (this.renderRoot as ShadowRoot).activeElement as HTMLElement | null;
    const deepActive = this.#getDeepActiveElement();
    const active =
      shadowActive ||
      (deepActive instanceof HTMLElement && this.#isElementInsideInteraction(deepActive) ? deepActive : null);
    const activeIndex = optionElements.findIndex(el => el === active);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      optionElements[Math.min(optionElements.length - 1, Math.max(0, activeIndex + 1))]?.focus();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      optionElements[Math.max(0, activeIndex - 1)]?.focus();
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (!active) return;
      event.preventDefault();
      if (active instanceof HTMLButtonElement) {
        active.click();
      } else {
        const value = active.getAttribute('identifier') ?? '';
        this.#selectValue(value);
      }
    }
  };

  #focusTrigger() {
    this.renderRoot.querySelector<HTMLButtonElement>('button[part="trigger"]')?.focus();
  }

  #getDeepActiveElement(): Element | null {
    let current: Element | null = document.activeElement;

    while (current && current instanceof HTMLElement && current.shadowRoot?.activeElement) {
      current = current.shadowRoot.activeElement;
    }

    return current;
  }

  #isElementInsideInteraction(element: HTMLElement): boolean {
    return element === this || this.contains(element) || this.renderRoot.contains(element);
  }

  #menuElement(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(`#${this._menuId}`);
  }

  #startSlotObserver() {
    this._slotObserver = new MutationObserver(() => this.#updateOptions());
    this._slotObserver.observe(this, { childList: true, subtree: true });
  }

  #onChoicesSlotChange = () => {
    this.#updateOptions();
  };

  #onSlottedChoiceClick = (event: Event) => {
    if (this.disabled || this.readonly) return;
    const target = event.currentTarget as HTMLElement;
    const value = target.getAttribute('identifier') ?? '';
    this.#selectValue(value);
  };

  #teardownSlottedChoices() {
    const choices = Array.from(this.querySelectorAll<InlineChoiceOptionElement>('qti-inline-choice'));
    for (const choice of choices) {
      choice.removeEventListener('click', this.#onSlottedChoiceClick);
      choice.removeAttribute('tabindex');
      choice.internals.role = null;
      choice.internals.ariaSelected = null;
      choice.internals.ariaChecked = 'false';
      choice.internals.states.delete('checked');
    }
  }

  async #syncSlottedChoices() {
    await this.updateComplete;
    const selectedValue = this.options.find(option => option.selected)?.value ?? '';
    const choices = Array.from(this.querySelectorAll<InlineChoiceOptionElement>('qti-inline-choice'));
    for (const choice of choices) {
      const value = choice.getAttribute('identifier') ?? '';
      const isSelected = value === selectedValue;
      choice.removeEventListener('click', this.#onSlottedChoiceClick);
      choice.addEventListener('click', this.#onSlottedChoiceClick);
      choice.disabled = this.disabled;
      choice.readonly = this.readonly;
      choice.internals.role = 'option';
      choice.internals.ariaSelected = isSelected ? 'true' : 'false';
      choice.internals.ariaChecked = isSelected ? 'true' : 'false';
      choice.internals.ariaDisabled = this.disabled ? 'true' : 'false';
      choice.internals.ariaReadOnly = this.readonly ? 'true' : 'false';
      if (isSelected) {
        choice.internals.states.add('checked');
      } else {
        choice.internals.states.delete('checked');
      }
      choice.tabIndex = -1;
    }
  }

  #allMenuOptions(): HTMLElement[] {
    const promptOption = this.renderRoot.querySelector<HTMLElement>('button[part~="option"]');
    const slottedChoices = Array.from(this.querySelectorAll<HTMLElement>('qti-inline-choice'));
    return [...(promptOption ? [promptOption] : []), ...slottedChoices];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-inline-choice-interaction': QtiInlineChoiceInteraction;
  }
}
