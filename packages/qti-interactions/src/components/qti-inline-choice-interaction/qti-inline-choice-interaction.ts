import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { consume } from '@lit/context';

import { Interaction } from '@qti-components/base';
import { configContext } from '@qti-components/base';

import styles from './qti-inline-choice-interaction.styles.js';

import type { PropertyValues } from 'lit';
import type { ConfigContext } from '@qti-components/base';
import type { ActiveElementMixinInterface } from '../../mixins/active-element/active-element.mixin';

interface OptionType {
  textContent: string;
  value: string;
  selected: boolean;
}

type InlineChoiceOptionElement = HTMLElement & ActiveElementMixinInterface;

let inlineChoiceMenuCounter = 0;

export class QtiInlineChoiceInteraction extends Interaction {
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
  protected correctOption: string = '';

  @state()
  protected _dropdownOpen = false;

  private _slotObserver: MutationObserver | null = null;
  private readonly _menuId = `qti-inline-choice-menu-${inlineChoiceMenuCounter++}`;

  @consume({ context: configContext, subscribe: true })
  @property({ attribute: false })
  declare configContext: ConfigContext;

  override render() {
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
        <span part="value">${unsafeHTML(selected?.textContent ?? '')}</span>
        <span part="${this._dropdownOpen ? 'dropdown-icon dropdown-icon-open' : 'dropdown-icon'}" aria-hidden="true"
          >▾</span
        >
      </button>
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
          <span part="option-content">${unsafeHTML(this.options[0]?.textContent ?? '')}</span>
        </button>
        <slot @slotchange=${this.#onChoicesSlotChange}></slot>
      </div>
      ${unsafeHTML(this.correctOption)}
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#updateOptions();
    this.#startSlotObserver();

    // Simple width estimation - no recalculation needed
    this._estimateOptimalWidth();
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
    const prompt = this.dataset.prompt || this.configContext?.inlineChoicePrompt || 'select';

    const currentlySelectedValue = this.options.find(o => o.selected)?.value ?? '';
    const nextOptions: OptionType[] = [
      {
        textContent: prompt,
        value: '',
        selected: currentlySelectedValue === ''
      },
      ...choices.map(choice => {
        const value = choice.getAttribute('identifier') ?? '';
        return {
          textContent: choice.innerHTML,
          value,
          selected: value !== '' && value === currentlySelectedValue
        };
      })
    ];

    const hasSelected = nextOptions.some(o => o.selected);
    this.options = hasSelected ? nextOptions : nextOptions.map((o, i) => ({ ...o, selected: i === 0 }));
    this.#syncSlottedChoices();

    // Simple width estimation based on content length
    this._estimateOptimalWidth();
  }

  private _estimateOptimalWidth() {
    const menu = this.#menuElement();
    const trigger = this.renderRoot.querySelector<HTMLElement>('button[part="trigger"]');

    let widthPx = 0;
    if (menu) {
      const rectWidth = menu.getBoundingClientRect().width;
      widthPx = Math.max(rectWidth, menu.scrollWidth);
    }

    if (widthPx <= 0 && trigger) {
      widthPx = trigger.getBoundingClientRect().width;
    }

    if (widthPx <= 0) return;

    const fontSize = parseFloat(getComputedStyle(this).fontSize || '16') || 16;
    const widthEm = Math.min(Math.max(widthPx / fontSize, 8.75), 40);

    trigger.style.setProperty('--qti-calculated-min-width', `${widthEm}em`);
  }

  public validate(): boolean {
    const selectedOption = this.options.find(option => option.selected);
    return selectedOption ? selectedOption.value !== '' : false;
  }

  public override reset() {
    this.#setDropdownOpen(false);
    this.options = this.options.map((option, i) => ({ ...option, selected: i === 0 }));
    this.#syncSlottedChoices();
  }

  public set response(value: string | null) {
    const nextValue = value ?? '';
    this.options = this.options.map(option => ({ ...option, selected: option.value === nextValue }));
    this.#syncSlottedChoices();
  }
  get response(): string | null {
    const value = this.options.find(option => option.selected)?.value ?? '';
    return value === '' ? null : value;
  }

  override toggleInternalCorrectResponse(show: boolean) {
    // Call base class implementation to manage CSS states
    super.toggleInternalCorrectResponse(show);

    // Get correct response from either responseVariable (item context) or local property (standalone)
    const correctResponseValue = this.correctResponse;

    if (!show || !correctResponseValue) {
      this.correctOption = '';
      return;
    }

    const correctOptionData = this.options.find(option => correctResponseValue === option.value);
    if (!correctOptionData) {
      this.correctOption = '';
      return;
    }

    this.correctOption = `<span part="correct-option" style="border:1px solid var(--qti-correct); border-radius:4px; padding: 2px 4px; margin: 4px; display:inline-block">${correctOptionData.textContent}</span>`;
  }

  #selectValue(value: string) {
    this.options = this.options.map(option => ({ ...option, selected: option.value === value }));
    this.#syncSlottedChoices();
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
    if (open) {
      requestAnimationFrame(() => this._estimateOptimalWidth());
    }
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
      choice.internals.states.delete('--checked');
    }
  }

  #syncSlottedChoices() {
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
      choice.removeAttribute('aria-disabled');
      choice.removeAttribute('aria-readonly');
      if (isSelected) {
        choice.internals.states.add('--checked');
      } else {
        choice.internals.states.delete('--checked');
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
