import { css, html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { property } from 'lit/decorators.js';

import { computedContext } from '@qti-components/base';

import * as styles from '../styles';
import { dispatchPublic } from '../../public-events';
import { pluginState } from '../../plugin-state';

import type { ComputedContext } from '@qti-components/base';

declare module '../../types/qti-test-state' {
  interface QtiTestPluginState {
    /** Item-ref identifiers the candidate marked to come back to, in the order they were marked. */
    bookmarks: string[];
  }
}

/** The item-ref identifiers bookmarked so far. For a host's own navigation: mark these. */
export const bookmarkedItems = (context: Pick<ComputedContext, 'plugins'> | undefined): string[] =>
  pluginState(context, 'bookmarks') ?? [];

/**
 * A toggle that marks the item on screen to come back to. The marks live in the test's state under
 * `bookmarks` (`session.plugins.bookmarks`), so a host that stores `state` stores them, and a
 * reloaded test shows them again.
 *
 * Put it inside `<test-navigation>`. It is a button (`role="button"`, `aria-pressed`) and reflects
 * `bookmarked` on the host for styling; its content is the label. Without an item on screen it is
 * `disabled`. A host's own navigation reads the marks with `bookmarkedItems(computedContext)`.
 *
 * @slot - The label.
 * @attr bookmarked - Reflected: the item on screen is bookmarked.
 * @attr disabled - Reflected: there is no item on screen.
 */
export class TestBookmark extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  @property({ attribute: false })
  protected computedContext?: ComputedContext;

  @property({ type: Boolean, reflect: true }) bookmarked = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  static override styles = css`
    :host {
      ${styles.btn};
    }
    :host(:hover:not([disabled])) {
      ${styles.btnInteractive};
    }
    :host(:focus-visible) {
      ${styles.focusRing};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  constructor() {
    super();
    this.addEventListener('click', () => this.#toggle());
    this.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      this.#toggle();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'button');
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
  }

  /** The identifier of the item on screen, if any. */
  get #activeItem(): string | undefined {
    return this.computedContext?.testParts
      ?.flatMap(part => part.sections.flatMap(section => section.items))
      .find(item => item.active)?.identifier;
  }

  protected override willUpdate(): void {
    const active = this.#activeItem;
    this.disabled = !active;
    this.bookmarked = !!active && bookmarkedItems(this.computedContext).includes(active);
  }

  protected override updated(): void {
    this.setAttribute('aria-pressed', String(this.bookmarked));
    this.setAttribute('aria-disabled', String(this.disabled));
  }

  #toggle(): void {
    const active = this.#activeItem;
    if (!active) return;
    const marked = bookmarkedItems(this.computedContext);
    const next = marked.includes(active) ? marked.filter(id => id !== active) : [...marked, active];
    // An empty list removes the entry, so a test nobody bookmarked keeps no trace in the state.
    dispatchPublic(this, 'cito-test-update-plugin-state', {
      plugin: 'bookmarks',
      value: next.length > 0 ? next : null
    });
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-bookmark': TestBookmark;
  }
}
