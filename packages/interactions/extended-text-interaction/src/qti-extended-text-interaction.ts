import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, state } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';
import { Interaction } from '@qti-components/base';

import styles from './qti-extended-text-interaction.styles';

import type { CSSResultGroup } from 'lit';
/** Rows rendered when neither the class vocabulary nor either length hint resolves. */
const DEFAULT_ROWS = 5;

/** Rough characters-per-row rate used to turn `expected-length` into a row count. */
const CHARS_PER_ROW = 50;

/** QTI shared presentation vocabulary prefix carrying an explicit row count. */
const HEIGHT_LINES_PREFIX = 'qti-height-lines-';

/**
 * Warn once per page rather than once per element: an item bank rendering many essays would
 * otherwise bury the console in the same message.
 */
let warnedAboutXhtml = false;

/**
 * A multi-line text-entry interaction.
 *
 * @customElement qti-extended-text-interaction
 *
 * @attr {string} response-identifier - Required. Identifier of the bound response variable.
 * @attr {number} expected-length - Hint at the expected answer length in characters; sets the
 *   textarea's `maxlength`. Also the last-resort row count, used only when neither a
 *   `qti-height-lines-*` class nor `expected-lines` is present.
 * @attr {string} pattern-mask - Regular expression the value must match to be valid.
 * @attr {string} placeholder-text - Placeholder shown while the textarea is empty.
 * @attr {string} data-patternmask-message - Custom validation message shown when
 *   `pattern-mask` fails. Part of the QTI shared interaction vocabulary.
 * @attr {'qti-height-lines-3'|'qti-height-lines-6'|'qti-height-lines-15'} class - QTI shared
 *   presentation vocabulary controlling the rendered height. Outranks both `expected-lines`
 *   and `expected-length`.
 * @attr {number} expected-lines - Expected number of lines of response, and the rendered row
 *   count unless a `qti-height-lines-*` class is present.
 * @attr {number} [base=10] - Not implemented. Numeric base used when recording the value.
 * @attr {string} string-identifier - Not implemented. Identifier of a second, string-typed
 *   response variable that also receives the raw entry.
 * @attr {number} max-strings - Not implemented. Maximum number of separate string responses. QTI
 *   defines these for a multi-string response — several bound variables, one field each. This
 *   element renders a single textarea bound to one variable, so there is nothing for the bounds
 *   to count: reading them as a word or paragraph limit would invent a rule QTI does not state.
 *   Implement alongside multi-string rendering, not before it.
 * @attr {number} min-strings - Not implemented. See `max-strings`.
 * @attr {'plain'|'preformatted'|'xhtml'} [format=plain] - How the response is presented.
 *   `preformatted` renders the field monospaced; `xhtml` is accepted but downgraded to plain,
 *   because the field is a textarea with no rich-text editor behind it.
 *
 * @slot prompt - The prompt shown above the textarea.
 *
 * @csspart textarea - The textarea input element.
 */
export class QtiExtendedTextInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

  @state()
  protected _rows = DEFAULT_ROWS;

  /** expected length is mapped to the property maxlength on the textarea */
  @property({ type: Number, attribute: 'expected-length' }) expectedLength: number;

  /** QTI's own hint at the response height. Outranked by `qti-height-lines-*`; see `#resolveRows`. */
  @property({ type: Number, attribute: 'expected-lines' }) expectedLines: number;

  /**
   * How the response text is presented. Reflected so themes can key off
   * `:host([format='preformatted'])`.
   *
   * `xhtml` is accepted and recorded but renders as `plain`: the field is a `<textarea>`, and
   * there is no rich-text editor behind it. Downgrading loudly beats either refusing valid QTI
   * or pretending to support formatting the candidate cannot actually produce.
   */
  /*
   * The vocabulary is written inline rather than as an exported `TextFormat` alias. Both text
   * interactions need it in their public API, and the umbrella `@qti-components/interactions`
   * re-exports both packages — two identically-named exported aliases collide at that barrel
   * (TS2308). Inline, there is no name to collide, and the manifest still reads the union.
   */
  @property({ type: String, reflect: true }) format: 'plain' | 'preformatted' | 'xhtml' = 'plain';

  @watch('format')
  protected _handleFormatChange = () => {
    if (this.format !== 'xhtml' || warnedAboutXhtml) return;

    warnedAboutXhtml = true;
    console.warn(
      '<qti-extended-text-interaction format="xhtml"> renders as plain text. ' +
        'The interaction has no rich-text editor; the recorded response will contain no markup.'
    );
  };

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  /** text appearing in the extended-text-interaction if it is empty */
  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  @property({ type: String, attribute: 'data-patternmask-message' }) dataPatternmaskMessage: string;

  @property({ type: String, attribute: 'class' }) classNames: string;

  /*
   * All three inputs feed one resolver rather than each assigning `_rows` in its own handler.
   * With separate handlers the last attribute to change would win, so the same markup could
   * render a different height depending on attribute order — and `expected-length` only ever
   * applied when a `class` was also present, because the fallback lived inside the class watcher.
   */
  @watch(['classNames', 'expectedLines', 'expectedLength'])
  protected _handleRowsInputChange() {
    this._rows = this.#resolveRows();
  }

  /**
   * Row count, highest precedence first:
   *
   * 1. `qti-height-lines-N` — the QTI shared presentation vocabulary. An explicit rendering
   *    instruction, so it outranks the content-level hints below.
   * 2. `expected-lines` — QTI's hint at how long the response should be.
   * 3. `expected-length` — a character count, converted at a rough characters-per-row rate.
   * 4. {@link DEFAULT_ROWS}.
   */
  #resolveRows(): number {
    const fromHeightLines = this.#rowsFromHeightLinesClass();
    if (fromHeightLines !== null) return fromHeightLines;

    if (this.expectedLines > 0) return this.expectedLines;
    if (this.expectedLength > 0) return Math.ceil(this.expectedLength / CHARS_PER_ROW);

    return DEFAULT_ROWS;
  }

  /** The `N` of the first usable `qti-height-lines-N` class, or null when none is present. */
  #rowsFromHeightLinesClass(): number | null {
    for (const className of (this.classNames ?? '').split(' ')) {
      if (!className.startsWith(HEIGHT_LINES_PREFIX)) continue;

      const rows = parseInt(className.slice(HEIGHT_LINES_PREFIX.length), 10);
      // A bare `qti-height-lines-` parses to NaN; ignore it rather than render NaN rows.
      if (!Number.isNaN(rows) && rows > 0) return rows;
    }

    return null;
  }

  /*
   * Declared with `attribute: 'response'`, not `@state`, so `response="…"` in markup reaches the
   * field. As a `@state` it was unobserved: every sibling interaction accepts the attribute — it
   * is half of the codec's contract in packages/qti-base/src/lib/response.ts, which parses
   * `response` and `correct-response` alike — but this one silently ignored it, so authored or
   * restored prose rendered as an empty textarea.
   *
   * Plain `type: String`, deliberately NOT `responseAttributeConverter`. That codec splits on
   * commas to build multi-value responses, which is right for identifiers, pairs and points and
   * wrong for prose: an essay containing a comma would arrive as an array. text-entry, the other
   * single-string interaction, declares it plainly for the same reason.
   */
  @property({ type: String, attribute: 'response', reflect: false })
  response: string | null = null;

  @watch('response', { waitUntilFirstUpdate: true })
  protected _handleResponseChange = () => {
    this._internals.setFormValue(this.value);
    this.validate();
  };

  override get value(): string | null {
    return this.response || null;
  }
  override set value(val: string | null) {
    this.response = val || null;
  }

  public override validate() {
    const textarea = this.shadowRoot.querySelector('textarea');
    if (!textarea) return false;
    let validityMessage = '';
    let isValid = false;

    if (this.patternMask && this.dataPatternmaskMessage) {
      // Clear any custom error initially
      textarea.setCustomValidity('');
      const patternSource =
        this.patternMask.startsWith('^') && this.patternMask.endsWith('$') ? this.patternMask : `^${this.patternMask}$`;

      const pattern = new RegExp(patternSource);
      isValid = textarea.checkValidity() && pattern.test(textarea.value);

      if (!isValid) {
        // Set custom error if invalid
        validityMessage = this.dataPatternmaskMessage;
        textarea.setCustomValidity(this.dataPatternmaskMessage);
      }
    } else {
      isValid = textarea.checkValidity();
    }

    if (isValid && !this.response) {
      isValid = false;
    }

    if (!isValid && !validityMessage) {
      validityMessage = textarea.validationMessage || 'Invalid value.';
    }

    this.setInteractionValidity(isValid, validityMessage, textarea, { suppressInline: true });
    return isValid;
  }

  override reportValidity() {
    this.validate();
    return super.reportValidity();
  }

  /*
   * The template in named pieces, so a subclass can recompose it.
   *
   * Each piece renders one thing and returns it; `render()` below just orders them. A subclass
   * overrides `render()` and calls the pieces where it wants them — which is the point: an extension
   * point that only lets you APPEND has already decided the layout on the subclass's behalf, and the
   * subclass is usually the one that knows better. The correction variant in
   * @qti-components/corrections puts its badge between the field and the validation message;
   * something else may want it above the prompt, or may want to drop a piece entirely.
   *
   * Override a piece to change what one part looks like; override `render()` to change the order.
   */

  /** The prompt, above the field. */
  protected renderPrompt(): unknown {
    return html`<slot name="prompt"></slot>`;
  }

  /** The field itself. */
  protected renderTextarea(): unknown {
    return html`<textarea
      part="textarea"
      name="${this.responseIdentifier}"
      spellcheck="false"
      autocomplete="off"
      maxlength="${5000}"
      @keydown="${(event: KeyboardEvent) => event.stopImmediatePropagation()}"
      @keyup="${this.textChanged}"
      @change="${this.textChanged}"
      @blur="${(_: FocusEvent) => {
        this.reportValidity();
      }}"
      placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
      rows="${this._rows}"
      ?disabled="${this.disabled}"
      ?readonly="${this.readonly}"
      .value=${this.response}
    ></textarea>`;
  }

  /** Hidden until `Interaction.reportValidity` shows it. */
  protected renderValidationMessage(): unknown {
    return html`<div id="validation-message" part="message" role="alert" style="display:none;"></div>`;
  }

  override render() {
    /* The prompt and the field are written with NO whitespace between them, deliberately: a text
       node there puts a line box between the two. The original template said `</slot\n><textarea`
       to avoid exactly that, and interpolating them adjacently keeps it. */
    return html`${this.renderPrompt()}${this.renderTextarea()} ${this.renderValidationMessage()}`;
  }

  protected textChanged(event: Event) {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    if (this.response !== input.value) {
      this.value = input.value;
      this.saveResponse(input.value);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-extended-text-interaction': QtiExtendedTextInteraction;
  }
}
