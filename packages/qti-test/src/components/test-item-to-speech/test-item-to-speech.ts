import { html, LitElement, css } from 'lit';
import { consume, provide, createContext } from '@lit/context';
import { customElement, property, state } from 'lit/decorators.js';

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

  override updated(changed: PropertyValues) {
    if (changed.has('_tts')) {
      this.#internals.states.clear();
      if (this._tts?.state) this.#internals.states.add(this._tts.state);
    }
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
 * @cssstate idle    - No speech active
 * @cssstate playing - Speech is playing
 * @cssstate paused  - Speech is paused
 */
@customElement('test-item-to-speech')
export class TestItemToSpeech extends LitElement {
  @property({ type: String }) language = 'nl-NL';

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
      stop: () => this.#stop(),
      prevElement: () => this.#prevElement(),
      nextElement: () => this.#nextElement()
    };
  }

  override willUpdate(changed: PropertyValues) {
    // no property-driven context updates needed currently
    void changed;
  }

  override updated(_changed: PropertyValues) {
    const current = this._sessionContext?.navItemRefId ?? null;
    // Stop speech when navItemRefId changes (ignore the initial undefined → value transition)
    if (this.#prevNavItemRefId !== undefined && this.#prevNavItemRefId !== current) {
      this.#stop();
      // Reset element collection for the new item
      this.#readingElements = null;
      this.#currentElementIndex = 0;
      this.#updateContext();
    }
    this.#prevNavItemRefId = current;
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
    speechSynthesis.cancel();
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
    }
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

    const identifier = this._sessionContext?.navItemRefId;
    if (!identifier) return [];

    const assessmentItem = this.#itemElements.get(identifier);
    if (!assessmentItem) return [];

    const itemBody = assessmentItem.querySelector('qti-item-body');
    if (!itemBody) return [];

    // Collect block-level elements that contain readable text
    const selector = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption';
    this.#readingElements = Array.from(itemBody.querySelectorAll(selector)).filter(
      el => (el.textContent ?? '').trim().length > 0
    );

    return this.#readingElements;
  }

  #playSpeech() {
    const elements = this.#getReadingElements();
    if (!elements.length) {
      console.warn('test-item-to-speech: no readable elements found in qti-item-body');
      return;
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
      this.#setSpeechState('idle');
      this.#updateContext();
      return;
    }

    this.#currentElementIndex = index;
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
    utterance.lang = this.language;
    utterance.rate = 1;

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name !== 'word') return;
      this.#updateWordHighlight(event.charIndex, event.charLength ?? 0);
    };

    utterance.onend = () => {
      this.#clearWordHighlight();
      this.#speakElement(this.#currentElementIndex + 1);
    };

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
    speechSynthesis.cancel();
    this.#clearAllHighlights();
    this.#setSpeechState('idle');
  }

  #prevElement() {
    const elements = this.#getReadingElements();
    if (!elements.length) return;
    speechSynthesis.cancel();
    this.#clearWordHighlight();
    this.#currentElementIndex = Math.max(0, this.#currentElementIndex - 1);
    this.#updateContext();
    const el = elements[this.#currentElementIndex];
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.#highlightElement(el);
    this.#setSpeechState('idle');
  }

  #nextElement() {
    const elements = this.#getReadingElements();
    if (!elements.length) return;
    speechSynthesis.cancel();
    this.#clearWordHighlight();
    this.#currentElementIndex = Math.min(elements.length - 1, this.#currentElementIndex + 1);
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
    if (!('highlights' in CSS)) return;
    this.#ensureHighlightStyles();
    this.#elementHighlight.clear();
    const range = new Range();
    range.selectNodeContents(element);
    this.#elementHighlight.add(range);
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
    CSS.highlights.delete(HIGHLIGHT_WORD);
  }

  #clearAllHighlights() {
    if (!('highlights' in CSS)) return;
    this.#wordHighlight.clear();
    CSS.highlights.delete(HIGHLIGHT_WORD);
    this.#elementHighlight.clear();
    CSS.highlights.delete(HIGHLIGHT_ELEMENT);
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

    // 2. test-container shadow root — ensures correct cascade for slotted content
    const testContainer =
      this.closest('test-navigation')?.querySelector('test-container') ??
      this.closest('qti-test')?.querySelector('test-container');
    const root = testContainer?.shadowRoot;
    if (root && !root.adoptedStyleSheets.includes(sheet)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
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
@customElement('test-tts-play')
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
@customElement('test-tts-pause')
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
@customElement('test-tts-resume')
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
 * Stop button — enabled when playing or paused.
 * @cssstate idle / playing / paused
 * @csspart button
 */
@customElement('test-tts-stop')
export class TestTtsStop extends TtsButtonBase {
  override render() {
    return html`
      <button part="button" ?disabled=${this._tts?.state === 'idle'} @click=${() => this._tts?.stop()}>
        <slot>■</slot>
      </button>
    `;
  }
}

/**
 * Prev-element button — moves cursor to the previous reading element and pauses.
 * Disabled at the first element or when no elements are loaded.
 * @cssstate idle / playing / paused
 * @csspart button
 */
@customElement('test-tts-prev')
export class TestTtsPrev extends TtsButtonBase {
  override render() {
    const atStart = (this._tts?.currentElementIndex ?? 0) === 0;
    const noElements = (this._tts?.elementCount ?? 0) === 0;
    return html`
      <button part="button" ?disabled=${noElements || atStart} @click=${() => this._tts?.prevElement()}>
        <slot>◀◀</slot>
      </button>
    `;
  }
}

/**
 * Next-element button — moves cursor to the next reading element and pauses.
 * Disabled at the last element or when no elements are loaded.
 * @cssstate idle / playing / paused
 * @csspart button
 */
@customElement('test-tts-next')
export class TestTtsNext extends TtsButtonBase {
  override render() {
    const atEnd =
      (this._tts?.elementCount ?? 0) > 0 && (this._tts?.currentElementIndex ?? 0) >= (this._tts?.elementCount ?? 0) - 1;
    const noElements = (this._tts?.elementCount ?? 0) === 0;
    return html`
      <button part="button" ?disabled=${noElements || atEnd} @click=${() => this._tts?.nextElement()}>
        <slot>▶▶</slot>
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
  }
}
