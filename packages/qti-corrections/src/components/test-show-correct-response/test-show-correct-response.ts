import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { computedContext } from '@qti-components/base';

import * as styles from '../styles';

import type { ComputedContext } from '@qti-components/base';

/**
 * A button that shows and hides the correct response of the active item. Put it inside
 * `<test-navigation>`: it reads the active item from there, and it is disabled when that item
 * declares no correct response or mapping. It switches back to "show" when the candidate moves on.
 *
 * Needs the corrections build (`@citolab/qti-components/corrections`), whose `<test-navigation>`
 * passes the request to the active item's `showCorrectResponse(show)`.
 *
 * @customElement test-show-correct-response
 * @fires test-show-correct-response - `detail` is `true` to show the correct response, `false` to hide it.
 */
export class TestShowCorrectResponse extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  static override styles = css`
    :host {
      ${styles.btn};
    }
    :host(:focus-visible) {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  #internals: ElementInternals;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = 'button';
    this.addEventListener('click', () => this.#toggleState());
    this.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      this.#toggleState();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
  }

  @property({ type: Boolean, reflect: true }) shown = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) showCorrectText = 'Show correct response';
  @property({ type: String }) hideCorrectText = 'Hide correct response';
  @property({ type: String }) noCorrectResponseText = 'No correct response specified';

  #previousActiveItem?: unknown; // Store previous active item reference

  override willUpdate(_changedProperties: Map<string | number | symbol, unknown>) {
    const activeItem = this.computedContext?.testParts
      .flatMap(testPart => testPart.sections.flatMap(section => section.items))
      .find(item => item.active);

    // If active item changed, reset shown before the update
    if (this.#previousActiveItem !== activeItem) {
      this.shown = false;
      this.#previousActiveItem = activeItem; // Update previous active item
    }

    if (activeItem) {
      const containsCorrectResponse = !!activeItem?.variables?.some(v => (v as any)['correctResponse']);
      const containsMapping = !!activeItem?.variables?.some(v => {
        return (v as any)['mapping']?.mapEntries?.length > 0 || (v as any)['areaMapping']?.areaMapEntries?.length > 0;
      });
      this.disabled = !containsCorrectResponse && !containsMapping;
    } else {
      this.disabled = true;
    }
    this.#internals.ariaDisabled = String(this.disabled);
    this.#internals.ariaPressed = String(this.shown);
  }
  #toggleState() {
    if (this.disabled) return;
    this.shown = !this.shown;

    this.dispatchEvent(
      new CustomEvent('test-show-correct-response', {
        detail: this.shown,
        bubbles: true
      })
    );
  }

  #getDisplayedText(): string {
    return this.disabled ? this.noCorrectResponseText : this.shown ? this.hideCorrectText : this.showCorrectText;
  }

  override render() {
    return html`${this.#getDisplayedText()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-show-correct-response': TestShowCorrectResponse;
  }
}
