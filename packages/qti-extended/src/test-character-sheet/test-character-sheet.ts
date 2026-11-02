import { css, html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { property, state } from 'lit/decorators.js';
import { computedContext } from '@citolab/qti-components/qti-base';
import { controlStyles as styles } from '@citolab/qti-components/qti-test/plugin-api';

import type { ComputedContext } from '@citolab/qti-components/qti-base';

/** The characters a Dutch candidate reaches for that are not on the keyboard. */
const DEFAULT_CHARACTERS = 'é è ë ê ï ö ü à á ç ñ € £ § ± ° ² ³ × ÷ ≤ ≥ ≠ → ←';

type Field = HTMLInputElement | HTMLTextAreaElement;

/** Whether `element` is inside `ancestor`, also through shadow roots. */
const within = (element: Node | null, ancestor: Element): boolean => {
  let node: Node | null = element;
  while (node) {
    if (ancestor.contains(node)) return true;
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return false;
};

const isField = (node: unknown): node is Field =>
  node instanceof HTMLTextAreaElement ||
  (node instanceof HTMLInputElement && /^(text|search|url|tel|email|)$/.test(node.type));

/**
 * The character sheet plugin: a button that opens a sheet of characters that are not on the keyboard
 * (`é`, `€`, `²`, …) and types the one the candidate picks into the answer field they were writing in.
 *
 * It follows the keyboard focus: the last text field or text area of a rendered item that had focus is
 * the one it types into, so a candidate writes, opens the sheet, picks a character and goes on writing.
 * Until an answer field has had focus it is `disabled`. A character goes in at the caret, replacing a
 * selection, and the field gets a `change` event, so the interaction records the new answer.
 *
 * Put it inside `<test-navigation>`. It is a button (`role="button"`, `aria-expanded`) with its content
 * as the label; `characters` is the sheet, as a string with the characters separated by spaces (the
 * default is a Dutch set). The sheet opens in the top layer below the button, closes on Escape, on a
 * click outside it, and when another item comes on screen. Style the sheet with `::part(sheet)` and its
 * keys with `::part(key)`.
 *
 * @slot - The label of the button.
 * @attr characters - The characters of the sheet, separated by spaces.
 * @attr open - Reflected: the sheet is open.
 * @attr disabled - Reflected: no answer field has had focus yet.
 * @csspart button - The button.
 * @csspart sheet - The sheet of characters.
 * @csspart key - One character on the sheet.
 */
export class TestCharacterSheet extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  @property({ attribute: false })
  protected computedContext?: ComputedContext;

  @property() characters = DEFAULT_CHARACTERS;

  @property({ type: Boolean, reflect: true }) open = false;

  @property({ type: Boolean, reflect: true }) disabled = true;

  /** The answer field the sheet types into: the last one that had focus. */
  @state() private field: Field | null = null;

  #activeItem?: string;

  static override styles = [
    styles.button,
    css`
      :host {
        position: relative;
      }
      :host([open]) .control {
        ${styles.btnActive};
      }
      .sheet {
        position: fixed;
        inset: auto;
        margin: 0;
        padding: 0.375rem;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(2.25rem, 1fr));
        gap: 0.125rem;
        width: var(--test-character-sheet-width, 20rem);
        max-width: calc(100vw - 1rem);
        border: var(--qti-border-width, var(--qc-border-width, var(--cito-border-width, 1px))) solid
          var(--qti-border-color, color-mix(in oklab, CanvasText 45%, Canvas));
        border-radius: var(--qti-radius-box, var(--qc-radius-box, var(--cito-radius-box, 0.5rem)));
        background: var(--qti-color-base-100, var(--qc-color-base-100, var(--cito-color-base-100, Canvas)));
        color: var(--qti-color-base-content, var(--qc-color-base-content, var(--cito-color-base-content, CanvasText)));
        box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.35);
        font: inherit;
      }
      .sheet:not(:popover-open) {
        display: none;
      }
      .key {
        ${styles.form};
        padding: 0;
        min-block-size: 2.25rem;
        font-size: 1.125em;
        background: transparent;
        border: 0;
        color: inherit;
      }
      @media (hover: hover) and (pointer: fine) {
        .key:hover {
          ${styles.btnInteractive};
        }
      }
      .key:active {
        ${styles.btnActive};
      }
      .key:focus-visible {
        ${styles.focusRing};
        outline-offset: -2px;
      }
    `
  ];

  #onFocusIn = (event: FocusEvent) => {
    const target = event.composedPath()[0];
    if (!isField(target) || !this.#inItem(target)) return;
    this.field = target;
  };

  #onPointerDown = (event: PointerEvent) => {
    if (this.open && !event.composedPath().includes(this)) this.open = false;
  };

  #onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.open) {
      event.stopPropagation();
      this.open = false;
      this.focus();
    }
  };

  constructor() {
    super();
    this.addEventListener('click', event => {
      // A key on the sheet is inside the host too; only a press on the button itself toggles.
      if (!event.composedPath().some(node => node instanceof HTMLElement && node.classList.contains('key')))
        this.#toggle();
    });
    this.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (event.composedPath()[0] !== this) return;
      event.preventDefault();
      this.#toggle();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'button');
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    document.addEventListener('focusin', this.#onFocusIn);
    document.addEventListener('pointerdown', this.#onPointerDown);
    document.addEventListener('keydown', this.#onKeyDown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('focusin', this.#onFocusIn);
    document.removeEventListener('pointerdown', this.#onPointerDown);
    document.removeEventListener('keydown', this.#onKeyDown);
  }

  /** The item on screen, or in a section the one the candidate is in. */
  get #active(): string | undefined {
    return this.computedContext?.testParts
      ?.flatMap(part => part.sections.flatMap(section => section.items))
      .find(item => item.active)?.identifier;
  }

  /** Whether a field belongs to an item the test has rendered. */
  #inItem(field: Field): boolean {
    const lookup = this.computedContext?.itemElement;
    if (!lookup) return false;
    return (this.computedContext?.testParts ?? []).some(part =>
      part.sections.some(section =>
        section.items.some(item => {
          const element = lookup(item.identifier);
          return !!element && within(field, element);
        })
      )
    );
  }

  protected override willUpdate(): void {
    // Another item on screen: the field it typed into is gone with the old one.
    const active = this.#active;
    if (active !== this.#activeItem) {
      this.#activeItem = active;
      this.open = false;
    }
    if (this.field && !this.field.isConnected) this.field = null;
    this.disabled = !this.field;
  }

  protected override updated(): void {
    this.setAttribute('aria-disabled', String(this.disabled));
    this.setAttribute('aria-expanded', String(this.open));
    const sheet = this.renderRoot.querySelector<HTMLElement>('.sheet');
    if (!sheet) return;
    if (this.open) {
      if (!sheet.matches(':popover-open')) sheet.showPopover?.();
      // Below the button, kept on screen; measured once it shows.
      const box = this.getBoundingClientRect();
      sheet.style.top = `${box.bottom + 4}px`;
      sheet.style.left = `${Math.max(8, Math.min(box.left, window.innerWidth - sheet.offsetWidth - 8))}px`;
    } else if (sheet.matches(':popover-open')) sheet.hidePopover?.();
  }

  #toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
  }

  #type(character: string): void {
    const field = this.field;
    if (!field?.isConnected) return;
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    field.setRangeText(character, start, end, 'end');
    field.focus();
    // The interactions record a `change`; `input` is for anything else that watches the field.
    field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    field.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  override render() {
    const characters = this.characters.split(/\s+/).filter(Boolean);
    // A press on the button must not take the focus from the field the sheet types into.
    return html`<span class="control" part="button" @pointerdown=${(event: Event) => event.preventDefault()}
        ><slot>Ω</slot></span
      >
      <div class="sheet" part="sheet" popover="manual" role="group">
        ${characters.map(
          character =>
            html`<button
              class="key"
              part="key"
              type="button"
              tabindex="-1"
              @pointerdown=${(event: Event) => event.preventDefault()}
              @click=${() => this.#type(character)}
            >
              ${character}
            </button>`
        )}
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-character-sheet': TestCharacterSheet;
  }
}
