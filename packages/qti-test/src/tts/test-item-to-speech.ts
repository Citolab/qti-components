import { html, LitElement, css } from 'lit';
import { consume, provide, createContext } from '@lit/context';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { sessionContext, testItemsContext } from '@qti-components/base';

import * as styles from '../components/styles';

import type { PropertyValues } from 'lit';
import type { SessionContext, TestItems } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiAssessmentItemRef } from '../components/qti-assessment-item-ref/qti-assessment-item-ref';

// ─── CSS Custom Highlight ─────────────────────────────────────────────────────

const HIGHLIGHT_ELEMENT = 'tts-element'; // navigation cursor — whole element
const HIGHLIGHT_WORD = 'tts-word'; // word boundary during speech

// Shared across all instances — added to whichever shadow root needs it
let highlightSheet: CSSStyleSheet | null = null;

function getHighlightSheet(): CSSStyleSheet {
  if (!highlightSheet) {
    highlightSheet = new CSSStyleSheet();
    highlightSheet.replaceSync(`
      ::highlight(${HIGHLIGHT_ELEMENT}) { background-color: #dbeafe; color: inherit; }
      ::highlight(${HIGHLIGHT_WORD})    { background-color: #ffe066; color: inherit; }
    `);
  }
  return highlightSheet;
}

type SpeechState = 'idle' | 'playing' | 'paused';

// ─── TTS Context ──────────────────────────────────────────────────────────────

export interface TtsContext {
  state: SpeechState;
  /** True while every reading element is highlighted and a click on one starts reading there. */
  picking: boolean;
  /** Index of the currently highlighted reading element (0-based). */
  currentElementIndex: number;
  /** Total number of navigable reading elements in the current item. */
  elementCount: number;
  play(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  prevElement(): void;
  nextElement(): void;
  /** Toggle pick mode: highlight all reading elements, then read from the one that is clicked. */
  togglePick(): void;
}

export { SpeechState };
export const ttsContext = createContext<TtsContext>(Symbol('tts-context'));

// ─── Icons ────────────────────────────────────────────────────────────────────

// Plain geometric glyphs on a 24-unit grid, painted in currentColor. SVG rather than text so
// every button gets the same box: text glyphs (◀◀ ▶ ⏸ ■ ☞) differ in width, and some fall back
// to an emoji font with different line metrics.
const ICONS = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
  stop: 'M6 6h12v12H6z',
  prev: 'M6 5h2v14H6zM20 5v14L9 12z',
  next: 'M16 5h2v14h-2zM4 5v14l11-7z',
  pick: 'M5 3l13 7-5.5 1.6 3.4 6.6-2.4 1.3-3.4-6.7L6 17z'
} as const;

/** Default button content: the icon, plus a visually hidden label as the accessible name. */
const iconContent = (icon: keyof typeof ICONS, label: string) => {
  const svg = html`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="${ICONS[icon]}"></path>
  </svg>`;
  return html`${svg}<span class="label">${label}</span>`;
};

// ─── Shared base for child button elements ────────────────────────────────────

/**
 * Base class shared by all TTS control elements. Consumes `ttsContext` and
 * mirrors the current speech state onto CSS custom states so each child can
 * be styled with `:state(playing)`, `:state(paused)`, `:state(idle)`.
 */
abstract class TtsButtonBase extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
    button {
      ${styles.btn};
      min-inline-size: var(--test-button-size, 2.25rem);
      padding-inline: 0.5rem;
      /* Containing block for the visually hidden .label. Without it the label is placed against
         the nearest positioned ancestor, which can sit outside a scroll container and make the
         page as tall as the scrolled content. */
      position: relative;
    }
    button:hover:not(:disabled) {
      ${styles.btnInteractive};
    }
    button:focus-visible {
      ${styles.focusRing};
    }
    button:disabled {
      ${styles.dis};
    }
    button[aria-pressed='true'],
    button[aria-pressed='true']:hover {
      background-color: var(--test-button-selected-background-color, var(--qti-selected-bg, #0175aa));
      color: var(--test-button-selected-color, var(--qti-selected-color, #fff));
    }
    svg,
    ::slotted(svg) {
      flex: none;
      inline-size: var(--test-tts-icon-size, 1.125rem);
      block-size: var(--test-tts-icon-size, 1.125rem);
    }
    svg {
      fill: currentColor;
    }
    /* The default content is icon-only; this keeps the button's accessible name. */
    .label {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `;

  /**
   * Accessible name of the button. Without it the default icon carries an English name, and
   * slotted content names the button by its text; set it when you slot an icon of your own,
   * which has no text to be named by.
   */
  @property({ type: String }) label?: string;

  #internals = this.attachInternals();

  @consume({ context: ttsContext, subscribe: true })
  protected _tts?: TtsContext;

  #mirroredState: SpeechState | undefined;
  #mirroredPicking = false;

  override updated(_changed: PropertyValues) {
    // `_tts` is a context field, not a reactive property, so it never shows up in `changed`:
    // compare against what was last mirrored instead.
    const state = this._tts?.state;
    const picking = this._tts?.picking ?? false;
    if (state === this.#mirroredState && picking === this.#mirroredPicking) return;
    this.#mirroredState = state;
    this.#mirroredPicking = picking;
    this.#internals.states.clear();
    if (state) this.#internals.states.add(state);
    if (picking) this.#internals.states.add('picking');
  }
}

// ─── Controller element ───────────────────────────────────────────────────────

/**
 * `<test-item-to-speech>` is the controller and context provider. It manages
 * speech synthesis, word highlighting, and item element lookup. Compose your
 * own player by placing control elements as children.
 *
 * @example
 * ```html
 * <test-item-to-speech language="nl-NL">
 *   <test-tts-play></test-tts-play>
 *   <test-tts-prev></test-tts-prev>
 *   <test-tts-next></test-tts-next>
 *   <test-tts-stop></test-tts-stop>
 * </test-item-to-speech>
 * ```
 *
 * The controller lays its controls out as a wrapping row; each control draws an icon button,
 * and slotted content replaces the icon — a slotted `<svg>` is sized like the default one. Give a
 * control with a slotted icon a `label`, since an icon has no text to name the button by. Buttons read the qti-theme tokens (with the theme's
 * defaults as fallbacks) and can be sized with `--test-button-size` and `--test-tts-icon-size`.
 *
 * ### Language resolution
 *
 * Each reading element is spoken in the language of the nearest `lang` attribute:
 *
 * 1. `lang` (or `xml:lang`) on the element itself
 * 2. `lang` on the closest ancestor — including `<qti-assessment-item xml:lang>` and, across
 *    shadow roots, anything wrapping the test
 * 3. `lang` on the document's `<html>` element
 * 4. the `language` attribute on `<test-item-to-speech>`
 *
 * The transformer copies `xml:lang` over as a plain `lang` attribute, so QTI authored with
 * `xml:lang="en-GB"` on a `<p>` or on the item root is honoured without further work.
 *
 * ### What is read
 *
 * Decided once per connect, by where the player is placed. The first rule that matches wins:
 *
 * 1. **Next to a stimulus placeholder** — the player shares its parent with a
 *    `[data-stimulus-idref]` element, e.g. in a reading-text panel beside the questions: the
 *    player reads that stimulus (its `qti-stimulus-body`), and only that. Not inside the
 *    placeholder: loading a stimulus replaces the placeholder's content. Items and navigation
 *    are ignored; when the stimulus is (re)loaded or the placeholder swapped, the player starts
 *    over on the new content.
 * 2. **Next to `[data-tts-content]`** — the player shares its parent with an element marked
 *    `data-tts-content`: any HTML, not QTI, e.g. a start screen rendered by React. The marker goes
 *    on one container; the player reads the readable elements inside it. Navigation is ignored.
 *    The reading list is rebuilt when the player starts from the top, and when an element in it
 *    has left the page — so a re-render of the content never interrupts speech.
 * 3. **Inside a `qti-assessment-item-ref`** — e.g. in a `<template item-ref>` on `<qti-test>`,
 *    so every item gets a player of its own: the player reads that item, and only that item.
 *    The navigation cursor is ignored; speech stops when the player leaves the page with its item.
 * 4. **Anywhere else** — a toolbar in the page chrome: the player follows the navigation cursor
 *    and reads the item `navItemRefId` (session context) points at, as rendered by the
 *    `<qti-test>` it sits in. Navigating stops speech and starts the next item from the top.
 *
 * ```html
 * <!-- 1. a player for the shared reading text -->
 * <aside>
 *   <test-item-to-speech>…</test-item-to-speech>
 *   <div data-stimulus-idref="Stimulus1"></div>
 * </aside>
 *
 * <!-- 2. a player for any other HTML -->
 * <div>
 *   <test-item-to-speech>…</test-item-to-speech>
 *   <section data-tts-content lang="nl-NL">…</section>
 * </div>
 *
 * <!-- 3. one player per item -->
 * <qti-test>
 *   <template item-ref>
 *     <test-item-to-speech>…</test-item-to-speech>
 *     {{ xmlDoc }}
 *   </template>
 *   …
 * </qti-test>
 *
 * <!-- 4. one player in the toolbar, following navigation -->
 * <test-navigation>
 *   <header><test-item-to-speech>…</test-item-to-speech></header>
 *   <test-container test-url="…"></test-container>
 * </test-navigation>
 * ```
 *
 * In modes 3 and 4 the item re-rendering (navigating to the item already shown) restarts the
 * player on the fresh content. An item player reads the item body as rendered: a stimulus
 * placed inside the item is read with it, one placed outside (mode 1) is not. Only one player
 * can speak at a time; starting one stops any other.
 *
 * Read are `p`, `h1`–`h6`, `li`, `dt`, `dd`, `th`, `td`, `caption`, `blockquote`, `figcaption`,
 * `qti-prompt` and `qti-simple-choice` — the innermost match only — unless hidden (`display: none`)
 * or inside `aria-hidden="true"`.
 *
 * ### Starting somewhere in the middle
 *
 * `<test-tts-pick>` switches the player into pick mode: every reading element gets the blue
 * cursor highlight, and the first click on one of them leaves pick mode and starts reading
 * from that element. Pressing the button again leaves pick mode without reading.
 *
 * @cssstate idle    - No speech active
 * @cssstate picking - Pick mode: all reading elements highlighted, waiting for a click
 * @cssstate playing - Speech is playing
 * @cssstate paused  - Speech is paused
 */

export class TestItemToSpeech extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--test-tts-gap, 0.25rem);
    }
  `;

  /** Fallback language when neither the item content nor the document declares one. */
  @property({ type: String }) language = 'nl-NL';

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  /** The items of the `qti-test` this player is in, across shadow roots. */
  @consume({ context: testItemsContext, subscribe: true })
  protected testItems?: TestItems;

  @state()
  @provide({ context: ttsContext })
  _ttsContext!: TtsContext;

  #internals = this.attachInternals();

  // Stimulus mode: set on connect when a stimulus placeholder sits next to the player. The
  // placeholder itself is looked up on every use — a host may swap the element.
  #stimulusMode = false;
  // Stimulus mode: resets the player when the stimulus content next to it is replaced.
  #stimulusObserver: MutationObserver | null = null;
  // Content mode: set on connect when a `[data-tts-content]` element sits next to the player.
  // Any HTML, not QTI. No observer: the reading list is rebuilt on demand (#getReadingElements).
  #contentMode = false;
  // Item-ref mode: the item-ref this player sits in, resolved on connect. Null means cursor mode.
  #itemRef: QtiAssessmentItemRef | null = null;
  // Where the item-connected (and, in cursor mode, navigation) events are listened for.
  #eventHost: EventTarget | null = null;
  #boundHandleItemConnected = this.#handleItemConnected.bind(this);
  #boundHandleNavigation = () => this.#stop();

  // Cursor mode: the previous navigation position, to detect moving to another item or section.
  #prevNavItemRefId: string | null | undefined = undefined;
  #prevNavSectionId: string | null | undefined = undefined;

  // Current set of block-level reading elements for the item
  #readingElements: Element[] | null = null;
  #currentElementIndex = 0;

  // Text nodes of the element currently being spoken (for word-boundary highlight)
  #textNodes: Text[] = [];

  // The utterance this player is speaking; lets the error handler tell "our speech was
  // cancelled by another player" apart from a cancel we issued ourselves.
  #currentUtterance: SpeechSynthesisUtterance | null = null;

  // Pick mode: all elements highlighted, a click on one starts reading from there.
  #picking = false;
  #pickRoot: EventTarget | null = null;
  #boundHandlePickClick = this.#handlePickClick.bind(this);

  // Set when the last element has been read: the cursor stays on it (so prev still works),
  // but the next play starts the item over instead of repeating that last element.
  #finished = false;

  // Two separate CSS Highlight objects
  #elementHighlight = new Highlight(); // whole-element cursor
  #wordHighlight = new Highlight(); // current word during speech

  constructor() {
    super();
    this._ttsContext = {
      state: 'idle',
      currentElementIndex: 0,
      elementCount: 0,
      play: () => this.#playSpeech(),
      pause: () => this.#pause(),
      resume: () => this.#resume(),
      stop: () => {
        this.#stopPicking();
        this.#stop();
      },
      prevElement: () => this.#prevElement(),
      nextElement: () => this.#nextElement(),
      togglePick: () => this.#togglePick(),
      picking: false
    };
  }

  // willUpdate, not updated: resetting writes _ttsContext, and state set here goes into the
  // render already under way instead of scheduling a second one (Lit's change-in-update).
  override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    // Stimulus, content and item-ref mode: the navigation cursor does not change what this player reads.
    if (this.#stimulusMode || this.#contentMode || this.#itemRef) return;
    // Cursor mode: moving to another item or section stops speech and starts over (ignore the
    // initial undefined → value transition). Section navigation leaves navItemRefId null, so it
    // needs its own check.
    const item = this._sessionContext?.navItemRefId ?? null;
    const section = this._sessionContext?.navSectionId ?? null;
    const itemChanged = this.#prevNavItemRefId !== undefined && this.#prevNavItemRefId !== item;
    const sectionChanged = this.#prevNavSectionId !== undefined && this.#prevNavSectionId !== section;
    if (itemChanged || sectionChanged) this.#resetReadingPosition();
    this.#prevNavItemRefId = item;
    this.#prevNavSectionId = section;
  }

  /** Stop speech and forget the collected reading elements, so the next play starts afresh. */
  #resetReadingPosition() {
    this.#stopPicking();
    this.#stop();
    this.#readingElements = null;
    this.#currentElementIndex = 0;
    this.#finished = false;
    this.#updateContext();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#setSpeechState('idle');
    // NOTE: #ensureHighlightStyles() is called lazily on first highlight use
    // because the item to read may not be in the DOM yet at this point.
    this.#stimulusMode = this.#stimulusPlaceholder() !== null;
    if (this.#stimulusMode) {
      // Stimulus mode: neither items nor navigation decide what is read, only the content of the
      // placeholder. qti-components replaces it whenever it loads a stimulus (innerHTML, then
      // append), so watch the parent — that also catches a host swapping the placeholder itself.
      this.#stimulusObserver = new MutationObserver(records => {
        if (records.some(record => !this.contains(record.target))) this.#handleStimulusReplaced();
      });
      this.#stimulusObserver.observe(this.parentElement!, { childList: true, subtree: true });
      return;
    }
    // Content mode: plain HTML next to the player. Nothing to listen for: what is read only
    // depends on that element, and the reading list is rebuilt when it goes stale.
    this.#contentMode = this.#contentElement() !== null;
    if (this.#contentMode) return;
    this.#itemRef = this.closest<QtiAssessmentItemRef>('qti-assessment-item-ref');
    // qti-assessment-item-connected is bubbles+composed: it passes the item's own item-ref, and
    // reaches test-navigation / qti-test from inside test-container's shadow root.
    this.#eventHost =
      this.#itemRef ??
      this.closest('test-navigation') ??
      this.testItems?.eventTarget ??
      (this.getRootNode() as EventTarget);
    this.#eventHost.addEventListener('qti-assessment-item-connected', this.#boundHandleItemConnected);
    if (!this.#itemRef) {
      // Cursor mode: qti-request-navigation fires synchronously on prev/next — stop right away
      // instead of waiting for the new position to arrive through the session context.
      this.#eventHost.addEventListener('qti-request-navigation', this.#boundHandleNavigation);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Only silence the synthesizer if it is speaking for this player.
    if (this.#currentUtterance) {
      this.#currentUtterance = null;
      speechSynthesis.cancel();
    }
    this.#stopPicking();
    this.#clearAllHighlights();
    this.#eventHost?.removeEventListener('qti-assessment-item-connected', this.#boundHandleItemConnected);
    this.#eventHost?.removeEventListener('qti-request-navigation', this.#boundHandleNavigation);
    this.#eventHost = null;
    this.#itemRef = null;
    this.#stimulusObserver?.disconnect();
    this.#stimulusObserver = null;
    this.#stimulusMode = false;
    this.#contentMode = false;
  }

  override render() {
    return html`<slot></slot>`;
  }

  /**
   * An item (re)rendered. If it is ours — e.g. after navigating to the item already shown — the
   * elements collected earlier are detached now. That does not move the navigation cursor, so
   * the check in updated() does not catch it.
   */
  #handleItemConnected(event: Event) {
    if (this.#readingElements === null) return;
    // In item-ref mode the event came through our own item-ref, so it is always ours.
    const identifier = (event as CustomEvent<QtiAssessmentItem>).detail?.identifier;
    if (this.#itemRef || identifier === this._sessionContext?.navItemRefId) this.#resetReadingPosition();
  }

  /**
   * Stimulus mode: the stimulus next to the player was (re)loaded or swapped. Forget what was
   * collected, so the next play reads the new content from the top. Unlike
   * #resetReadingPosition this only cancels speech that is ours: a stimulus can finish loading
   * while an item player on the same page is speaking.
   */
  #handleStimulusReplaced() {
    if (this.#currentUtterance) {
      this.#currentUtterance = null;
      speechSynthesis.cancel();
    }
    this.#stopPicking();
    this.#clearAllHighlights();
    this.#setSpeechState('idle');
    this.#readingElements = null;
    this.#currentElementIndex = 0;
    this.#finished = false;
    this.#updateContext();
  }

  /**
   * Stimulus mode: the `[data-stimulus-idref]` placeholder that shares this player's parent, or
   * null. A placeholder holds the stimulus once loaded; the player cannot sit inside it, because
   * loading replaces the placeholder's content.
   */
  #stimulusPlaceholder(): Element | null {
    return this.parentElement?.querySelector(':scope > [data-stimulus-idref]') ?? null;
  }

  /**
   * Content mode: the `[data-tts-content]` element that shares this player's parent, or null.
   * The marker goes on one container; the player finds the readable elements inside it.
   */
  #contentElement(): Element | null {
    return this.parentElement?.querySelector(':scope > [data-tts-content]') ?? null;
  }

  /**
   * The element whose text is read: the stimulus body next to the player (stimulus mode), the
   * marked content next to it (content mode), or the item body of the item to read.
   */
  #resolveReadingRoot(): Element | null {
    if (this.#stimulusMode) return this.#stimulusPlaceholder()?.querySelector('qti-stimulus-body') ?? null;
    if (this.#contentMode) return this.#contentElement();
    return this.#resolveItem()?.querySelector('qti-item-body') ?? null;
  }

  /**
   * The item to read: our item-ref's (item-ref mode), or the navigated one (cursor mode). The test
   * looks the navigated one up in its own items, so a page with several tests showing the same
   * item still reads the right one.
   */
  #resolveItem(): QtiAssessmentItem | null {
    if (this.#itemRef) return this.#itemRef.assessmentItem;
    const identifier = this._sessionContext?.navItemRefId;
    return identifier ? ((this.testItems?.itemElement(identifier) as QtiAssessmentItem | null) ?? null) : null;
  }

  /** Update speech state on both the context (notifies children) and the host's CSS custom states. */
  #setSpeechState(state: SpeechState) {
    this._ttsContext = { ...this._ttsContext, state };
    this.#internals.states.delete('idle');
    this.#internals.states.delete('playing');
    this.#internals.states.delete('paused');
    this.#internals.states.add(state);
  }

  /** Push currentElementIndex and elementCount into context so children can react. */
  #updateContext() {
    this._ttsContext = {
      ...this._ttsContext,
      currentElementIndex: this.#currentElementIndex,
      elementCount: this.#getReadingElements().length
    };
  }

  /**
   * Return the currently readable elements: cached candidates for the item or stimulus (collected lazily on
   * first call), filtered live for visibility on every call. Feedback and other
   * conditionally-shown content (e.g. `qti-feedback-block`, which is `display: none` until a
   * CSS custom state reveals it) is excluded while hidden and picked up again once shown,
   * without needing to re-collect the candidate set.
   */
  #getReadingElements(): Element[] {
    // Content mode has no events or observer telling it the content changed (a framework like
    // React re-renders it at will). Rebuild the list once an element in it has left the page;
    // text changed inside an element needs nothing, it is read when that element is spoken.
    if (this.#contentMode && this.#readingElements?.some(el => !el.isConnected)) {
      this.#readingElements = null;
      this.#currentElementIndex = 0;
      this.#finished = false;
    }
    if (this.#readingElements === null) {
      const root = this.#resolveReadingRoot();
      // Leave the cache empty (rather than `[]`) while the item or stimulus has not rendered yet,
      // so the next call retries instead of getting stuck on an empty result forever.
      if (!root) return [];

      // Collect block-level elements (and QTI prompt / choice elements) that contain readable text.
      // Keep only the innermost matches so `<li><p>…</p></li>` is not read twice. Content hidden
      // from assistive technology (`aria-hidden="true"`, e.g. decorative icons) is not read either.
      const selector =
        'p, h1, h2, h3, h4, h5, h6, li, dt, dd, th, td, caption, blockquote, figcaption, qti-prompt, qti-simple-choice';
      this.#readingElements = Array.from(root.querySelectorAll(selector)).filter(
        el =>
          (el.textContent ?? '').trim().length > 0 && !el.querySelector(selector) && !el.closest('[aria-hidden="true"]')
      );
    }

    return this.#readingElements.filter(el => this.#isVisible(el));
  }

  /** True when an element is actually rendered — not `display: none` (itself or an ancestor). */
  #isVisible(element: Element): boolean {
    if (typeof element.checkVisibility === 'function') {
      return element.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true });
    }
    // Older Safari (< 17.4) fallback: display:none leaves no client rects. Doesn't catch
    // visibility:hidden, which still occupies layout, but display:none is what QTI feedback
    // elements actually use (see qti-feedback-block/qti-feedback-inline default styles).
    return element.getClientRects().length > 0;
  }

  /**
   * Resolve the speech language for a reading element.
   * Element `lang` → closest ancestor `lang` (crossing shadow hosts) → `<html lang>` → `language` attribute.
   * Empty `lang=""` is treated as absent.
   */
  #resolveLang(element: Element): string {
    let node: Element | null = element;
    while (node) {
      const lang = node.getAttribute('lang') || node.getAttribute('xml:lang');
      if (lang?.trim()) return lang.trim();
      node = node.parentElement ?? (node.getRootNode() as ShadowRoot).host ?? null;
    }
    const documentLang = document.documentElement.getAttribute('lang');
    if (documentLang?.trim()) return documentLang.trim();
    return this.language;
  }

  #playSpeech() {
    const elements = this.#getReadingElements();
    if (!elements.length) {
      console.warn('test-item-to-speech: no readable elements found');
      return;
    }
    this.#stopPicking();
    // speechSynthesis is one global queue: another player mid-sentence would otherwise
    // finish first and this one would silently wait its turn.
    speechSynthesis.cancel();
    if (this.#finished) {
      this.#finished = false;
      this.#currentElementIndex = 0;
    }
    // Content mode: starting from the top rebuilds the list, so elements the page added since
    // the last read (a framework re-render) are included.
    if (this.#contentMode && this.#currentElementIndex === 0) this.#readingElements = null;
    this.#speakElement(this.#currentElementIndex);
  }

  /** Speak the element at the given index, then auto-advance when it ends. */
  #speakElement(index: number) {
    const elements = this.#getReadingElements();

    if (index >= elements.length) {
      // Finished all elements — stay on the last element so the user can walk back with prev
      this.#clearWordHighlight();
      this.#currentElementIndex = elements.length - 1;
      if (elements.length > 0) this.#highlightElement(elements[this.#currentElementIndex]);
      this.#finished = true;
      this.#setSpeechState('idle');
      this.#updateContext();
      return;
    }

    this.#currentElementIndex = index;
    this.#finished = false;
    this.#updateContext();

    const element = elements[index];
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.#highlightElement(element);

    // Collect text nodes of this element for word-boundary mapping
    this.#textNodes = this.#collectTextNodes(element);
    const text = this.#textNodes.map(n => n.textContent ?? '').join('');

    if (!text.trim()) {
      // Skip blank element and move to next
      this.#speakElement(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.#resolveLang(element);
    utterance.rate = 1;

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name !== 'word') return;
      this.#updateWordHighlight(event.charIndex, event.charLength ?? 0);
    };

    utterance.onend = () => {
      if (this.#currentUtterance !== utterance) return;
      this.#currentUtterance = null;
      this.#clearWordHighlight();
      this.#speakElement(this.#currentElementIndex + 1);
    };

    // Fires when speech is cancelled from outside this player (another player starting,
    // or the browser); a cancel we issued ourselves has already cleared #currentUtterance.
    utterance.onerror = () => {
      if (this.#currentUtterance !== utterance) return;
      this.#currentUtterance = null;
      this.#clearAllHighlights();
      this.#setSpeechState('idle');
    };

    this.#currentUtterance = utterance;
    speechSynthesis.speak(utterance);
    this.#setSpeechState('playing');
  }

  #pause() {
    speechSynthesis.pause();
    this.#setSpeechState('paused');
  }

  #resume() {
    speechSynthesis.resume();
    this.#setSpeechState('playing');
  }

  #stop() {
    this.#currentUtterance = null;
    speechSynthesis.cancel();
    this.#clearAllHighlights();
    this.#setSpeechState('idle');
  }

  // ─── Pick mode ────────────────────────────────────────────────────────────

  #togglePick() {
    if (this.#picking) this.#stopPicking();
    else this.#startPicking();
  }

  /** Highlight every reading element and wait for a click on one of them. */
  #startPicking() {
    // Content mode: pick from the page as it is now, like starting from the top does.
    if (this.#contentMode) this.#readingElements = null;
    const elements = this.#getReadingElements();
    if (!elements.length) {
      console.warn('test-item-to-speech: no readable elements found');
      return;
    }
    this.#stop();
    this.#picking = true;
    this.#internals.states.add('picking');
    this.#highlightElements(elements);
    // Listen on the item's root so the click is seen before any interaction handles it — in
    // pick mode a click on a choice picks the sentence, it does not answer the question.
    this.#pickRoot = elements[0].getRootNode();
    this.#pickRoot.addEventListener('click', this.#boundHandlePickClick, true);
    this._ttsContext = { ...this._ttsContext, picking: true };
  }

  #stopPicking() {
    if (!this.#picking) return;
    this.#picking = false;
    this.#internals.states.delete('picking');
    this.#pickRoot?.removeEventListener('click', this.#boundHandlePickClick, true);
    this.#pickRoot = null;
    this.#clearAllHighlights();
    this._ttsContext = { ...this._ttsContext, picking: false };
  }

  #handlePickClick(event: Event) {
    const elements = this.#getReadingElements();
    const path = event.composedPath();
    let index = elements.findIndex(el => path.includes(el));
    if (index < 0) {
      // Not on the text itself. A click on the choice or list item around it (its radio button,
      // the padding) still means "this one": take the first reading element inside it.
      const container = path.find(
        (node): node is Element => node instanceof Element && node.matches('qti-simple-choice, li, qti-prompt')
      );
      if (container) index = elements.findIndex(el => container.contains(el));
    }
    if (index < 0) return; // not on a highlighted element — stay in pick mode
    event.preventDefault();
    event.stopPropagation();
    this.#stopPicking();
    speechSynthesis.cancel();
    this.#speakElement(index);
  }

  #prevElement() {
    const elements = this.#getReadingElements();
    if (!elements.length) return;
    this.#currentUtterance = null;
    speechSynthesis.cancel();
    this.#clearWordHighlight();
    this.#currentElementIndex = Math.max(0, this.#currentElementIndex - 1);
    this.#finished = false;
    this.#updateContext();
    const el = elements[this.#currentElementIndex];
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.#highlightElement(el);
    this.#setSpeechState('idle');
  }

  #nextElement() {
    const elements = this.#getReadingElements();
    if (!elements.length) return;
    this.#currentUtterance = null;
    speechSynthesis.cancel();
    this.#clearWordHighlight();
    this.#currentElementIndex = Math.min(elements.length - 1, this.#currentElementIndex + 1);
    this.#finished = false;
    this.#updateContext();
    const el = elements[this.#currentElementIndex];
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.#highlightElement(el);
    this.#setSpeechState('idle');
  }

  /** Walk text nodes without crossing shadow DOM boundaries. */
  #collectTextNodes(root: Element): Text[] {
    const nodes: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      // Text hidden from assistive technology inside a read element — a decorative icon in a
      // list item — is not spoken either. Skipped here, so speech and word highlight agree.
      if ((node.textContent ?? '').length > 0 && !node.parentElement?.closest('[aria-hidden="true"]')) {
        nodes.push(node as Text);
      }
    }
    return nodes;
  }

  /** Highlight the whole element as the navigation cursor (blue). */
  #highlightElement(element: Element) {
    this.#highlightElements([element]);
  }

  /** Put the blue cursor highlight on several elements at once (pick mode). */
  #highlightElements(elements: Element[]) {
    if (!('highlights' in CSS)) return;
    this.#ensureHighlightStyles();
    this.#elementHighlight.clear();
    for (const element of elements) {
      const range = new Range();
      range.selectNodeContents(element);
      this.#elementHighlight.add(range);
    }
    CSS.highlights.set(HIGHLIGHT_ELEMENT, this.#elementHighlight);
  }

  /** Highlight the current word within #textNodes (yellow, during speech). */
  #updateWordHighlight(charIndex: number, charLength: number) {
    if (!('highlights' in CSS)) return;
    this.#ensureHighlightStyles();
    this.#wordHighlight.clear();

    const text = this.#textNodes.map(n => n.textContent ?? '').join('');
    const endIndex = charIndex + (charLength > 0 ? charLength : this.#wordLengthAt(charIndex, text));
    let offset = 0;
    let startNode: Text | null = null;
    let startOffset = 0;
    let endNode: Text | null = null;
    let endOffset = 0;

    for (const node of this.#textNodes) {
      const len = node.textContent?.length ?? 0;
      if (!startNode && offset + len > charIndex) {
        startNode = node;
        startOffset = charIndex - offset;
      }
      if (startNode && offset + len >= endIndex) {
        endNode = node;
        endOffset = endIndex - offset;
        break;
      }
      offset += len;
    }

    if (startNode && endNode) {
      const range = new Range();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      this.#wordHighlight.add(range);
      CSS.highlights.set(HIGHLIGHT_WORD, this.#wordHighlight);
    }
  }

  #clearWordHighlight() {
    if (!('highlights' in CSS)) return;
    this.#wordHighlight.clear();
    // The registry is shared by every player on the page: only drop the entry if it is ours.
    if (CSS.highlights.get(HIGHLIGHT_WORD) === this.#wordHighlight) CSS.highlights.delete(HIGHLIGHT_WORD);
  }

  #clearAllHighlights() {
    if (!('highlights' in CSS)) return;
    this.#clearWordHighlight();
    this.#elementHighlight.clear();
    if (CSS.highlights.get(HIGHLIGHT_ELEMENT) === this.#elementHighlight) CSS.highlights.delete(HIGHLIGHT_ELEMENT);
  }

  /** Fallback word-length when charLength is 0. */
  #wordLengthAt(charIndex: number, text: string): number {
    const right = text.slice(charIndex).search(/\s/);
    return right < 0 ? text.length - charIndex : right;
  }

  /**
   * Add ::highlight() rules both to the shadow root the highlighted text lives in and to the
   * document (safety net — spec allows document rules to apply across shadow DOM). Called lazily
   * on first highlight use, once the reading elements have been collected.
   */
  #ensureHighlightStyles() {
    if (!('highlights' in CSS)) return;
    const sheet = getHighlightSheet();

    // 1. Document-level rule — applies broadly regardless of shadow DOM depth
    if (!document.adoptedStyleSheets.includes(sheet)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }

    // 2. Shadow roots the highlighted text may live in: the item's (e.g. test-container's), and
    //    the player's own root when the player itself sits inside a shadow tree (e.g. built into
    //    an item card).
    const roots = new Set<ShadowRoot>();
    const ownRoot = this.getRootNode();
    if (ownRoot instanceof ShadowRoot) roots.add(ownRoot);
    const itemRoot = this.#readingElements?.[0]?.getRootNode();
    if (itemRoot instanceof ShadowRoot) roots.add(itemRoot);
    for (const root of roots) {
      if (!root.adoptedStyleSheets.includes(sheet)) {
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
      }
    }
  }
}

// ─── Child control elements ───────────────────────────────────────────────────

/**
 * Play/pause/resume toggle button — always enabled, cycles through states.
 * Use named slots `play` and `pause` to customise the icons/labels independently; `label` and
 * `pause-label` name the button in each state (set them when the slotted content is an icon).
 *
 * @example
 * ```html
 * <test-tts-play>
 *   <span slot="play">Voorlezen</span>
 *   <span slot="pause">Pauzeren</span>
 * </test-tts-play>
 * ```
 *
 * @cssstate idle / playing / paused
 * @csspart button
 */

export class TestTtsPlay extends TtsButtonBase {
  /** Accessible name of the button while speech is playing; see `label`. */
  @property({ type: String, attribute: 'pause-label' }) pauseLabel?: string;

  #toggle() {
    if (!this._tts) return;
    if (this._tts.state === 'idle') this._tts.play();
    else if (this._tts.state === 'playing') this._tts.pause();
    else this._tts.resume();
  }

  override render() {
    const playing = this._tts?.state === 'playing';
    return html`
      <button part="button" aria-label=${ifDefined(playing ? this.pauseLabel : this.label)} @click=${this.#toggle}>
        ${playing
          ? html`<slot name="pause">${iconContent('pause', this.pauseLabel ?? 'Pause')}</slot>`
          : html`<slot name="play">${iconContent('play', this.label ?? 'Play')}</slot>`}
      </button>
    `;
  }
}

/**
 * Pause button — enabled only when playing.
 * @cssstate idle / playing / paused
 * @csspart button
 */

export class TestTtsPause extends TtsButtonBase {
  override render() {
    return html`
      <button
        part="button"
        aria-label=${ifDefined(this.label)}
        ?disabled=${this._tts?.state !== 'playing'}
        @click=${() => this._tts?.pause()}
      >
        <slot>${iconContent('pause', this.label ?? 'Pause')}</slot>
      </button>
    `;
  }
}

/**
 * Resume button — enabled only when paused.
 * @cssstate idle / playing / paused
 * @csspart button
 */

export class TestTtsResume extends TtsButtonBase {
  override render() {
    return html`
      <button
        part="button"
        aria-label=${ifDefined(this.label)}
        ?disabled=${this._tts?.state !== 'paused'}
        @click=${() => this._tts?.resume()}
      >
        <slot>${iconContent('play', this.label ?? 'Resume')}</slot>
      </button>
    `;
  }
}

/**
 * Stop button — enabled when playing, paused, or in pick mode (where it leaves pick mode).
 * @cssstate idle / playing / paused
 * @csspart button
 */

export class TestTtsStop extends TtsButtonBase {
  override render() {
    const idle = this._tts?.state === 'idle' && !this._tts?.picking;
    return html`
      <button part="button" aria-label=${ifDefined(this.label)} ?disabled=${idle} @click=${() => this._tts?.stop()}>
        <slot>${iconContent('stop', this.label ?? 'Stop')}</slot>
      </button>
    `;
  }
}

/**
 * Prev-element button — moves cursor to the previous reading element and pauses.
 * Disabled at the first element. Reading elements are collected lazily, so an element count
 * of 0 means "not looked yet" rather than "nothing to read": the button stays enabled and the
 * first click collects them.
 * @cssstate idle / playing / paused
 * @csspart button
 */

export class TestTtsPrev extends TtsButtonBase {
  override render() {
    const collected = (this._tts?.elementCount ?? 0) > 0;
    const atStart = (this._tts?.currentElementIndex ?? 0) === 0;
    return html`
      <button
        part="button"
        aria-label=${ifDefined(this.label)}
        ?disabled=${collected && atStart}
        @click=${() => this._tts?.prevElement()}
      >
        <slot>${iconContent('prev', this.label ?? 'Previous sentence')}</slot>
      </button>
    `;
  }
}

/**
 * Next-element button — moves cursor to the next reading element and pauses.
 * Disabled at the last element; enabled while the elements have not been collected yet
 * (see `TestTtsPrev`).
 * @cssstate idle / playing / paused
 * @csspart button
 */

export class TestTtsNext extends TtsButtonBase {
  override render() {
    const count = this._tts?.elementCount ?? 0;
    const atEnd = count > 0 && (this._tts?.currentElementIndex ?? 0) >= count - 1;
    return html`
      <button
        part="button"
        aria-label=${ifDefined(this.label)}
        ?disabled=${atEnd}
        @click=${() => this._tts?.nextElement()}
      >
        <slot>${iconContent('next', this.label ?? 'Next sentence')}</slot>
      </button>
    `;
  }
}

/**
 * Pick button — toggles pick mode on the controller: every reading element is highlighted and
 * a click on one of them starts reading from there. Reflects the mode as `:state(picking)`.
 * @cssstate idle / playing / paused
 * @cssstate picking
 * @csspart button
 */

export class TestTtsPick extends TtsButtonBase {
  override render() {
    return html`
      <button
        part="button"
        aria-label=${ifDefined(this.label)}
        aria-pressed=${this._tts?.picking ? 'true' : 'false'}
        @click=${() => this._tts?.togglePick()}
      >
        <slot>${iconContent('pick', this.label ?? 'Read from here')}</slot>
      </button>
    `;
  }
}

// ─── Global type declarations ─────────────────────────────────────────────────

declare global {
  interface HTMLElementTagNameMap {
    'test-item-to-speech': TestItemToSpeech;
    'test-tts-play': TestTtsPlay;
    'test-tts-pause': TestTtsPause;
    'test-tts-resume': TestTtsResume;
    'test-tts-stop': TestTtsStop;
    'test-tts-prev': TestTtsPrev;
    'test-tts-next': TestTtsNext;
    'test-tts-pick': TestTtsPick;
  }
}
