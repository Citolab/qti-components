import { css, html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators.js';

import type { TemplateResult } from 'lit';
import type { QtiTestState } from '@citolab/qti-components/qti-test/plugin-api';

/**
 * Whether `node` sits inside `ancestor`, also through shadow roots: the test a notification comes
 * from is this element's own test when the element is somewhere inside it.
 */
const isInside = (node: Node, ancestor: EventTarget | undefined): boolean => {
  for (let current: Node | null = node; current; ) {
    if (current === ancestor) return true;
    current = current.parentNode ?? (current instanceof ShadowRoot ? current.host : null);
  }
  return false;
};

/**
 * Shows the test's state (`qtiTest.state`) as a tree you can fold open and shut. It shows the state
 * each `qc-test-state-changed` of its own test carries: the test sends one once it is ready and one on
 * every change, so place it in the page from the start. A debug helper: drop it anywhere inside
 * `<qti-test>`.
 *
 * The first two levels start open. A list entry with an `identifier` (an item, a variable) is labelled
 * by it. The element only lays out the tree; give it a font, colour and height from the page.
 *
 * @customElement test-print-state
 * @csspart key - the name of a field, or the label of a list entry
 * @csspart value - a value that is not an object or a list
 * @csspart count - the number of entries of a folded object or list
 */
export class TestPrintState extends LitElement {
  @state() private testState?: QtiTestState;

  static override styles = css`
    :host {
      display: block;
    }
    ul {
      list-style: none;
      margin: 0;
      padding-inline-start: 1rem;
    }
    summary {
      cursor: pointer;
    }
    [part~='count'] {
      opacity: 0.7;
    }
  `;

  /** A notification goes up from the test, so it is heard on the document; only its own test's counts. */
  #onStateChanged = (event: Event) => {
    if (!isInside(this, event.composedPath()[0])) return;
    this.testState = (event as CustomEvent<QtiTestState>).detail;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    // Under the public name only: `cito-test-state-changed` carries the same state, once more.
    this.ownerDocument.addEventListener('qc-test-state-changed', this.#onStateChanged);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.ownerDocument.removeEventListener('qc-test-state-changed', this.#onStateChanged);
  }

  override render() {
    if (!this.testState) return nothing;
    return html`<ul>
      ${this.#renderNode('state', this.testState, 0)}
    </ul>`;
  }

  #renderNode(label: string, value: unknown, depth: number): TemplateResult {
    if (value === null || typeof value !== 'object') {
      return html`<li><span part="key">${label}</span>: <span part="value">${JSON.stringify(value)}</span></li>`;
    }
    const entries: [string, unknown][] = Array.isArray(value)
      ? value.map((entry, index) => [entryLabel(entry, index), entry])
      : Object.entries(value);
    const count = Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`;
    // `open` is bound once per depth, so Lit leaves a node the reader folded alone on the next update.
    return html`<li>
      <details ?open=${depth < 2}>
        <summary><span part="key">${label}</span> <span part="count">${count}</span></summary>
        <ul>
          ${entries.map(([key, entry]) => this.#renderNode(key, entry, depth + 1))}
        </ul>
      </details>
    </li>`;
  }
}

/** An item or a variable is easier to find by its identifier than by its index. */
const entryLabel = (entry: unknown, index: number): string => {
  const identifier = (entry as { identifier?: unknown } | null)?.identifier;
  return typeof identifier === 'string' ? `${index} · ${identifier}` : String(index);
};

declare global {
  interface HTMLElementTagNameMap {
    'test-print-state': TestPrintState;
  }
}
