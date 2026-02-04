import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { consume } from '@lit/context';

import { Interaction } from '@qti-components/base';
import { configContext } from '@qti-components/base';

import type { PropertyValues } from 'lit';
import type { ConfigContext } from '@qti-components/base';

interface OptionType {
  textContent: string;
  value: string;
  selected: boolean;
}
export class QtiInlineChoiceInteraction extends Interaction {
  override get isInline(): boolean {
    return true;
  }

  private static _supportsCustomizableSelectCache: boolean | null = null;

  static override get styles() {
    return [
      css`
        :host {
          display: inline-block;
          vertical-align: baseline;
          position: relative;
        }

        /* --- Progressive enhancement: Customizable select (MDN / WHATWG) --- */
        select[part='select'] {
          font: inherit;
          color: inherit;
          background-color: var(--qti-bg, white);
          border: var(--qti-border-thickness, 2px) var(--qti-border-style, solid) var(--qti-border-color, #c6cad0);
          border-radius: var(--qti-border-radius, 0.3rem);
          padding: 0.25rem 0.75rem;
          /* Enables full styling when supported (Chromium behind a flag / rolling out). */
          appearance: base-select;
        }

        select[part='select']:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        select[part='select']::picker(select) {
          border: var(--qti-border-thickness, 2px) var(--qti-border-style, solid) var(--qti-border-color, #c6cad0);
          border-radius: var(--qti-border-radius, 0.3rem);
          background: var(--qti-bg, white);
          box-shadow:
            0 10px 15px -3px rgb(0 0 0 / 10%),
            0 4px 6px -4px rgb(0 0 0 / 10%);
          padding: 4px;
          width: max-content;
          min-width: 100%;
          max-width: min(90vw, 36rem);
        }

        select[part='select']::picker-icon {
          color: var(--qti-border-color, #c6cad0);
          transition: 0.4s rotate;
          font-size: 1.75em;
        }

        select[part='select']:open::picker-icon {
          color: var(--qti-border-active, #f86d70);
          rotate: 180deg;
        }

        select[part='select'] > button {
          font: inherit;
          color: inherit;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0;
          background: transparent;
          border: 0;
          cursor: pointer;
        }

        select[part='select'] selectedcontent {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        option {
          font: inherit;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.5rem;
          white-space: nowrap;
        }

        option:hover {
          background-color: var(--qti-hover-bg, #f9fafb);
        }

        option:checked {
          background-color: var(--qti-bg-active, #ffecec);
        }

        option::checkmark {
          color: var(--qti-border-active, #f86d70);
        }

        /* --- Fallback custom listbox (for browsers without customizable select) --- */
        button[part='trigger'] {
          font: inherit;
          color: inherit;
          background-color: var(--qti-bg, white);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: space-between;
          border: var(--qti-border-thickness, 2px) var(--qti-border-style, solid) var(--qti-border-color, #c6cad0);
          border-radius: var(--qti-border-radius, 0.3rem);
          padding: 0.25rem 0.75rem;
        }

        [part='value'] {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
        }

        [part='dropdown-icon'] {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          transition: transform 150ms ease;
          transform-origin: 50% 50%;
          color: var(--qti-border-color, #c6cad0);
          font-size: 1.75em;
          line-height: 1;
        }

        button[part='trigger'][aria-expanded='true'] [part='dropdown-icon'] {
          transform: rotate(180deg);
          color: var(--qti-border-active, #f86d70);
        }

        button[part='trigger'][disabled] {
          cursor: not-allowed;
          opacity: 0.6;
        }

        [part='menu'] {
          position: absolute;
          z-index: 1000;
          top: calc(100% + 4px);
          left: 0;
          min-width: 100%;
          max-width: min(90vw, 36rem);
          max-height: min(40vh, 20rem);
          overflow: auto;
          background-color: var(--qti-bg, white);
          border: var(--qti-border-thickness, 2px) var(--qti-border-style, solid) var(--qti-border-color, #c6cad0);
          border-radius: var(--qti-border-radius, 0.3rem);
          box-shadow:
            0 10px 15px -3px rgb(0 0 0 / 10%),
            0 4px 6px -4px rgb(0 0 0 / 10%);
          padding: 4px;
          transform: translate(
            var(--qti-menu-shift-x, 0px),
            var(--qti-menu-shift-y, 0px)
          );
        }

        [part='menu'][data-placement='top'] {
          top: auto;
          bottom: calc(100% + 4px);
        }

        button[part='option'] {
          font: inherit;
          color: inherit;
          background-color: transparent;
          border: 0;
          padding: 0.5rem 0.5rem;
          width: 100%;
          text-align: left;
          border-radius: calc(var(--qti-border-radius, 0.3rem) - 2px);
          cursor: pointer;
          white-space: nowrap;
        }

        button[part='option'][aria-selected='true'] {
          background-color: var(--qti-bg-active, #ffecec);
        }

        button[part='option']:hover {
          background-color: var(--qti-hover-bg, #f9fafb);
        }

        button[part='option']:focus-visible {
          outline: 2px solid var(--qti-border-active, #f86d70);
          outline-offset: 2px;
        }

        [part='option-content'] {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: nowrap;
          white-space: nowrap;
        }

        select[part='select'] img,
        button[part='option'] img,
        button[part='trigger'] img,
        [part='menu'] img {
          display: inline-block;
          max-height: 1em;
          max-width: 1.5em;
          vertical-align: middle;
        }
      `
    ];
  }

  public static inputWidthClass = [
    '',
    'qti-input-width-2',
    'qti-input-width-1',
    'qti-input-width-3',
    'qti-input-width-4',
    'qti-input-width-6',
    'qti-input-width-10',
    'qti-input-width-15',
    'qti-input-width-20',
    'qti-input-width-72'
  ];

  @state()
  protected options: OptionType[] = [];

  @state()
  protected correctOption: string = '';

  @state()
  private _dropdownOpen = false;

  @property({ attribute: 'data-prompt', type: String })
  dataPrompt: string = '';

  @consume({ context: configContext, subscribe: true })
  @property({ attribute: false })
  declare configContext: ConfigContext;

  override render() {
    const selected = this._selectedOption();
    const useCustomizableSelect = this._supportsCustomizableSelect();

    return html`
      ${useCustomizableSelect
        ? html`
            <select
              part="select"
              @change=${this._onNativeChange}
              ?disabled="${this.disabled || this.readonly}"
              .value="${selected?.value ?? ''}"
            >
              <button type="button">
                <selectedcontent></selectedcontent>
              </button>
              ${this.options.map(
                option => html`<option value="${option.value}">${unsafeHTML(option.textContent)}</option>`
              )}
            </select>
          `
        : html`
            <button
              part="trigger"
              type="button"
              @click=${this._onToggleCustomDropdown}
              @keydown=${this._onCustomTriggerKeyDown}
              aria-haspopup="listbox"
              aria-expanded="${this._dropdownOpen ? 'true' : 'false'}"
              ?disabled="${this.disabled}"
              data-readonly="${this.readonly ? 'true' : 'false'}"
            >
              <span part="value">${unsafeHTML(selected?.textContent ?? '')}</span>
              <span part="dropdown-icon" aria-hidden="true">▾</span>
            </button>
            ${this._dropdownOpen
              ? html`
                  <div part="menu" role="listbox" @keydown=${this._onCustomMenuKeyDown}>
                    ${this.options.map(
                      option => html`
                        <button
                          part="option"
                          type="button"
                          role="option"
                          aria-selected="${option.selected ? 'true' : 'false'}"
                          @click="${() => this._selectValue(option.value)}"
                        >
                          <span part="option-content">${unsafeHTML(option.textContent)}</span>
                        </button>
                      `
                    )}
                  </div>
                `
              : null}
          `}
      ${unsafeHTML(this.correctOption)}
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this._updateOptions();
    if (!this._supportsCustomizableSelect()) {
      document.addEventListener('pointerdown', this._onDocumentPointerDown, true);
      document.addEventListener('keydown', this._onDocumentKeyDown, true);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (!this._supportsCustomizableSelect()) {
      document.removeEventListener('pointerdown', this._onDocumentPointerDown, true);
      document.removeEventListener('keydown', this._onDocumentKeyDown, true);
    }
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('configContext') || changed.has('dataPrompt')) {
      this._updateOptions();
    }
  }

  private _selectedOption(): OptionType | undefined {
    return this.options.find(option => option.selected) ?? this.options[0];
  }

  /**
   * Progressive enhancement for "customizable select" (WHATWG / MDN: `appearance: base-select` + `::picker()`).
   *
   * Notes on current browser behavior (observed around Feb 2026):
   * - Chromium-based browsers can support customizable select in light DOM, but it does not reliably work when the
   *   `<select>` lives inside a shadow root (e.g. the internal `<button>/<selectedcontent>` can end up effectively
   *   not rendered, so rich content like images disappears).
   * - Firefox support is not generally available yet, so we fall back to our custom listbox there as well.
   *
   * Because `CSS.supports(...)` may return syntax-only true, we do a final DOM probe to ensure the customizable-select
   * markup actually takes effect in the current environment before opting in.
   */
  private _supportsCustomizableSelect(): boolean {
    if (QtiInlineChoiceInteraction._supportsCustomizableSelectCache !== null) {
      return QtiInlineChoiceInteraction._supportsCustomizableSelectCache;
    }

    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
      QtiInlineChoiceInteraction._supportsCustomizableSelectCache = false;
      return false;
    }

    // CSS.supports can be a false-positive (syntax-only). We only enable the customizable-select
    // markup if we can verify that `appearance: base-select` actually affects computed styles.
    const supportsPickerSelector =
      CSS.supports('selector(::picker(select))') || CSS.supports('selector(select::picker(select))');
    const supportsAppearanceValue =
      CSS.supports('appearance: base-select') || CSS.supports('-webkit-appearance: base-select');
    if (!supportsPickerSelector || !supportsAppearanceValue) {
      QtiInlineChoiceInteraction._supportsCustomizableSelectCache = false;
      return false;
    }

    try {
      // Final check: verify that the customizable select markup actually takes effect.
      // In some browsers `CSS.supports(...)` returns true, but the internal <button> is not
      // rendered (0x0 rect), meaning we effectively get a native select with broken rich content.
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';

      const select = document.createElement('select');
      select.style.appearance = 'base-select';
      select.style.webkitAppearance = 'base-select';

      const button = document.createElement('button');
      button.type = 'button';
      const selected = document.createElement('selectedcontent');
      selected.textContent = 'probe';
      button.appendChild(selected);

      const option = document.createElement('option');
      option.value = 'probe';
      option.textContent = 'probe';

      select.appendChild(button);
      select.appendChild(option);
      container.appendChild(select);
      (document.body || document.documentElement).appendChild(container);

      const rect = button.getBoundingClientRect();
      container.remove();

      const supported = rect.width > 0 && rect.height > 0;
      QtiInlineChoiceInteraction._supportsCustomizableSelectCache = supported;
      return supported;
    } catch {
      QtiInlineChoiceInteraction._supportsCustomizableSelectCache = false;
      return false;
    }
  }

  private _updateOptions() {
    const choices = Array.from(this.querySelectorAll('qti-inline-choice'));
    const prompt = this.dataPrompt || this.configContext?.inlineChoicePrompt || 'select';

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
  }

  public validate(): boolean {
    const selectedOption = this.options.find(option => option.selected);
    return selectedOption ? selectedOption.value !== '' : false;
  }

  public override reset() {
    this._setDropdownOpen(false);
    this.options = this.options.map((option, i) => ({ ...option, selected: i === 0 }));
  }

  public set response(value: string | null) {
    const nextValue = value ?? '';
    this.options = this.options.map(option => ({ ...option, selected: option.value === nextValue }));
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

  private _onNativeChange = (event: Event) => {
    if (this.readonly) return;
    const selectedOptionValue = (event.target as HTMLSelectElement).value;
    this._selectValue(selectedOptionValue);
  };

  private _selectValue(value: string) {
    this.options = this.options.map(option => ({ ...option, selected: option.value === value }));
    this.saveResponse(value);
    this._setDropdownOpen(false);
  }

  private _setDropdownOpen(open: boolean) {
    if (this._dropdownOpen === open) return;
    this._dropdownOpen = open;

    if (open) {
      void this.updateComplete.then(() => {
        this._positionCustomMenu();
        const selected = this.renderRoot.querySelector<HTMLButtonElement>(
          'button[part="option"][aria-selected="true"]'
        );
        selected?.focus();
      });
    }
  }

  private _onToggleCustomDropdown = () => {
    if (this.disabled || this.readonly) return;
    this._setDropdownOpen(!this._dropdownOpen);
  };

  private _onCustomTriggerKeyDown = (event: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._setDropdownOpen(true);
    }
  };

  private _onCustomMenuKeyDown = (event: KeyboardEvent) => {
    if (!this._dropdownOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this._setDropdownOpen(false);
      this._focusTrigger();
      return;
    }

    const optionButtons = Array.from(this.renderRoot.querySelectorAll<HTMLButtonElement>('button[part="option"]'));
    const active = (this.renderRoot as ShadowRoot).activeElement as HTMLElement | null;
    const activeIndex = optionButtons.findIndex(btn => btn === active);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      optionButtons[Math.min(optionButtons.length - 1, Math.max(0, activeIndex + 1))]?.focus();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      optionButtons[Math.max(0, activeIndex - 1)]?.focus();
    }
  };

  private _focusTrigger() {
    this.renderRoot.querySelector<HTMLButtonElement>('button[part="trigger"]')?.focus();
  }

  private _onDocumentPointerDown = (event: Event) => {
    if (!this._dropdownOpen) return;
    const path = (event as any).composedPath?.() as EventTarget[] | undefined;
    if (path && path.includes(this)) return;
    this._setDropdownOpen(false);
  };

  private _onDocumentKeyDown = (event: KeyboardEvent) => {
    if (!this._dropdownOpen) return;
    if (event.key !== 'Escape') return;
    event.preventDefault();
    this._setDropdownOpen(false);
    this._focusTrigger();
  };

  private _positionCustomMenu() {
    if (!this._dropdownOpen) return;
    const menu = this.renderRoot.querySelector<HTMLElement>('[part="menu"]');
    const trigger = this.renderRoot.querySelector<HTMLElement>('button[part="trigger"]');
    if (!menu || !trigger) return;

    menu.dataset.placement = 'bottom';
    menu.style.setProperty('--qti-menu-shift-x', '0px');
    menu.style.setProperty('--qti-menu-shift-y', '0px');

    const viewportWidth = document.documentElement?.clientWidth || window.innerWidth;
    const viewportHeight = document.documentElement?.clientHeight || window.innerHeight;
    const margin = 8;

    const triggerRect = trigger.getBoundingClientRect();
    let menuRect = menu.getBoundingClientRect();

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    if (menuRect.bottom > viewportHeight - margin && spaceAbove > spaceBelow) {
      menu.dataset.placement = 'top';
      menuRect = menu.getBoundingClientRect();
    }

    let shiftX = 0;
    if (menuRect.right > viewportWidth - margin) {
      shiftX = viewportWidth - margin - menuRect.right;
    } else if (menuRect.left < margin) {
      shiftX = margin - menuRect.left;
    }

    if (shiftX !== 0) {
      const scaleX = menu.offsetWidth > 0 ? menuRect.width / menu.offsetWidth : 1;
      const adjustedShiftX = Number.isFinite(scaleX) && scaleX !== 0 ? shiftX / scaleX : shiftX;
      menu.style.setProperty('--qti-menu-shift-x', `${adjustedShiftX}px`);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-inline-choice-interaction': QtiInlineChoiceInteraction;
  }
}
