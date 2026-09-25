import { html, LitElement, css } from 'lit';
import { consume, provide, createContext } from '@lit/context';
import { property, state } from 'lit/decorators.js';

import { sessionContext } from '@qti-components/base';

import type { PropertyValues } from 'lit';
import type { SessionContext } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';

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

// ─── Shared base for child button elements ────────────────────────────────────

/**
 * Base class shared by all TTS control elements. Consumes `ttsContext` and
 * mirrors the current speech state onto CSS custom states so each child can
 * be styled with `:state(playing)`, `:state(paused)`, `:state(idle)`.
 */
abstract class TtsButtonBase extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    button {
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.4;
      cursor: default;
    }
  `;

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
 *   <test-tts-prev>◀◀</test-tts-prev>
 *   <test-tts-next>▶▶</test-tts-next>
 *   <test-tts-stop>■</test-tts-stop>
 * </test-item-to-speech>
 * ```
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
 * ### Which item is read
 *
 * By default the player reads the item the test is navigated to (`navItemRefId` from the
 * session context). When several items share one page — a keep-together section or a
 * vertically scrolling booklet — give each player its own `item-ref-id` so it reads that
 * item regardless of the navigation cursor. The item is looked up by its
 * `qti-assessment-item-ref` identifier, in the player's own tree first and otherwise in
 * any `test-container` shadow root reachable from it, so the player can live inside the
 * item card, next to it, or in the page chrome.
 *
 * Only one item can be spoken at a time; starting one player stops any other.
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
  /** Fallback language when neither the item content nor the document declares one. */
  @property({ type: String }) language = 'nl-NL';

  /**
   * Identifier of the `qti-assessment-item-ref` this player reads. Leave unset to follow the
   * navigation cursor (`navItemRefId`) instead.
   */
  @property({ type: String, attribute: 'item-ref-id' }) itemRefId?: string;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @state()
  @provide({ context: ttsContext })
  _ttsContext!: TtsContext;

  #internals = this.attachInternals();
  #itemElements = new Map<string, QtiAssessmentItem>();
  #boundHandleItemConnected = this.#handleItemConnected.bind(this);
  #eventHost: EventTarget | null = null;

  // Current set of block-level reading elements for the active item
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

  // Tracks previous navItemRefId to detect item switches
  #prevNavItemRefId: string | null | undefined = undefined;
  #boundHandleNavigation = () => this.#stop();

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

  override willUpdate(changed: PropertyValues) {
    // no property-driven context updates needed currently
    void changed;
  }

  override updated(changed: PropertyValues) {
    if (changed.has('itemRefId') && changed.get('itemRefId') !== undefined) {
      this.#resetReadingPosition();
    }
    const current = this._sessionContext?.navItemRefId ?? null;
    // Stop speech when navItemRefId changes (ignore the initial undefined → value transition).
    // A player pinned to an item keeps its reading position: the cursor moving elsewhere on a
    // multi-item page does not change what this player reads.
    if (this.#prevNavItemRefId !== undefined && this.#prevNavItemRefId !== current && !this.itemRefId) {
      this.#resetReadingPosition();
    }
    this.#prevNavItemRefId = current;
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
    // because test-container may not be in the DOM yet at this point.
    // qti-assessment-item-connected is bubbles+composed, so it reaches test-navigation / qti-test
    this.#eventHost =
      this.closest('test-navigation') ?? this.closest('qti-test') ?? (this.getRootNode() as EventTarget);
    this.#eventHost.addEventListener('qti-assessment-item-connected', this.#boundHandleItemConnected as EventListener);
    // qti-request-navigation fires synchronously when the user clicks prev/next — stop immediately
    this.#eventHost.addEventListener('qti-request-navigation', this.#boundHandleNavigation);
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
    this.#eventHost?.removeEventListener(
      'qti-assessment-item-connected',
      this.#boundHandleItemConnected as EventListener
    );
    this.#eventHost?.removeEventListener('qti-request-navigation', this.#boundHandleNavigation);
    this.#eventHost = null;
    this.#itemElements.clear();
  }

  override render() {
    return html`<slot></slot>`;
  }

  #handleItemConnected(event: CustomEvent<QtiAssessmentItem>) {
    const item = event.detail;
    if (item?.identifier) {
      this.#itemElements.set(item.identifier, item);
      // Our item was (re)rendered: the elements we collected earlier are detached now.
      if (this.itemRefId && item.identifier === this.itemRefId && this.#readingElements !== null) {
        this.#resetReadingPosition();
      }
    }
  }

  /**
   * Find the rendered `qti-assessment-item` for an item-ref identifier without relying on the
   * connected-event cache — the player may be added after the item rendered (a header built
   * around an existing item) or sit in a shadow root the event never bubbled through.
   */
  #findItemInDom(identifier: string): QtiAssessmentItem | null {
    const esc = (v: string) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(v) : v.replace(/"/g, '\\"'));
    const selector =
      `qti-assessment-item-ref[identifier="${esc(identifier)}"] qti-assessment-item, ` +
      `qti-assessment-item[identifier="${esc(identifier)}"]`;

    // Nearest first: a player placed inside the item's own card.
    const ownRef = this.closest('qti-assessment-item-ref');
    if (ownRef?.getAttribute('identifier') === identifier) {
      const own = ownRef.querySelector<QtiAssessmentItem>('qti-assessment-item');
      if (own) return own;
    }

    // Then every root from here up to the document, and the test-container shadow roots in them.
    let root: Node = this.getRootNode();
    while (root) {
      const scope = root as ParentNode;
      const direct = scope.querySelector?.<QtiAssessmentItem>(selector);
      if (direct) return direct;
      for (const container of Array.from(scope.querySelectorAll?.('test-container') ?? [])) {
        const inShadow = container.shadowRoot?.querySelector<QtiAssessmentItem>(selector);
        if (inShadow) return inShadow;
      }
      const host = (root as ShadowRoot).host;
      if (!host) break;
      root = host.getRootNode();
    }
    return null;
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
      elementCount: this.#readingElements?.length ?? 0
    };
  }

  /** Return cached reading elements, collecting them lazily on first call for the active item. */
  #getReadingElements(): Element[] {
    if (this.#readingElements !== null) return this.#readingElements;

    const identifier = this.itemRefId || this._sessionContext?.navItemRefId;
    if (!identifier) return [];

    const cached = this.#itemElements.get(identifier);
    const assessmentItem = cached?.isConnected ? cached : this.#findItemInDom(identifier);
    if (!assessmentItem) return [];

    const itemBody = assessmentItem.querySelector('qti-item-body');
    if (!itemBody) return [];

    // Collect block-level elements (and QTI prompt / choice elements) that contain readable text.
    // Keep only the innermost matches so `<li><p>…</p></li>` is not read twice.
    const selector = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, qti-prompt, qti-simple-choice';
    this.#readingElements = Array.from(itemBody.querySelectorAll(selector)).filter(
      el => (el.textContent ?? '').trim().length > 0 && !el.querySelector(selector)
    );

    return this.#readingElements;
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
      console.warn('test-item-to-speech: no readable elements found in qti-item-body');
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
    this.#speakElement(this.#currentElementIndex);
  }

  /** Speak the element at the given index, then auto-advance when it ends. */
  #speakElement(index: number) {
    const elements = this.#readingElements ?? [];

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
    const elements = this.#getReadingElements();
    if (!elements.length) {
      console.warn('test-item-to-speech: no readable elements found in qti-item-body');
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
    const elements = this.#readingElements ?? [];
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
      if ((node.textContent ?? '').length > 0) {
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
   * Add ::highlight() rules both to test-container's shadow root (where highlighted
   * text lives) and to the document (safety net — spec allows document rules to apply
   * across shadow DOM). Called lazily on first highlight use so test-container is
   * guaranteed to be in the DOM by the time navigation or speech starts.
   */
  #ensureHighlightStyles() {
    if (!('highlights' in CSS)) return;
    const sheet = getHighlightSheet();

    // 1. Document-level rule — applies broadly regardless of shadow DOM depth
    if (!document.adoptedStyleSheets.includes(sheet)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }

    // 2. Shadow roots the highlighted text may live in: test-container's, and the player's own
    //    root when the player itself sits inside a shadow tree (e.g. built into an item card).
    const roots = new Set<ShadowRoot>();
    const testContainer =
      this.closest('test-navigation')?.querySelector('test-container') ??
      this.closest('qti-test')?.querySelector('test-container');
    if (testContainer?.shadowRoot) roots.add(testContainer.shadowRoot);
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
 * Use named slots `play` and `pause` to customise the icons/labels independently.
 *
 * @example
 * ```html
 * <test-tts-play>
 *   <span slot="play">▶ Play</span>
 *   <span slot="pause">⏸ Pause</span>
 * </test-tts-play>
 * ```
 *
 * @cssstate idle / playing / paused
 * @csspart button
 */

export class TestTtsPlay extends TtsButtonBase {
  #toggle() {
    if (!this._tts) return;
    if (this._tts.state === 'idle') this._tts.play();
    else if (this._tts.state === 'playing') this._tts.pause();
    else this._tts.resume();
  }

  override render() {
    const playing = this._tts?.state === 'playing';
    return html`
      <button part="button" @click=${this.#toggle}>
        ${playing ? html`<slot name="pause">⏸</slot>` : html`<slot name="play">▶</slot>`}
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
      <button part="button" ?disabled=${this._tts?.state !== 'playing'} @click=${() => this._tts?.pause()}>
        <slot>⏸</slot>
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
      <button part="button" ?disabled=${this._tts?.state !== 'paused'} @click=${() => this._tts?.resume()}>
        <slot>▶</slot>
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
      <button part="button" ?disabled=${idle} @click=${() => this._tts?.stop()}>
        <slot>■</slot>
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
      <button part="button" ?disabled=${collected && atStart} @click=${() => this._tts?.prevElement()}>
        <slot>◀◀</slot>
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
      <button part="button" ?disabled=${atEnd} @click=${() => this._tts?.nextElement()}>
        <slot>▶▶</slot>
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
        aria-pressed=${this._tts?.picking ? 'true' : 'false'}
        @click=${() => this._tts?.togglePick()}
      >
        <slot>☞</slot>
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
