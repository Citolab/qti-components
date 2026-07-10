import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { consume } from '@lit/context';

import { dragDropContext } from '@qti-components/base';

import styles from './qti-gap.styles';

import type { DragDropState } from '@qti-components/base';
import type { CSSResultGroup } from 'lit';

/**
 * A gap in the prose, and the first drop target to render its own chips.
 *
 * The interaction owns placement and publishes it on `dragDropContext`; this element subscribes and
 * renders what it holds. Nothing appends into it. That inverts the old flow, where `handleDrop` did
 * `cloneNode` + `appendChild` and the response was recovered afterwards by reading the DOM back
 * out — which is why placement and the response could ever disagree at all.
 *
 * The chips land in this shadow root rather than in the light DOM, so a theme reaches them as
 * `::part(drag)` — a bare `::part()` matches in any shadow root — instead of by tag. The gap's own
 * `:state(filled)` says whether it holds anything.
 *
 * @csspart drop - The region a chip lands in. Reserves the widest chip's box; see qti-gap.styles.
 */
export class QtiGap extends LitElement {
  static override styles: CSSResultGroup = styles;

  /** Carries `:state(filled)` while the gap holds a chip. */
  public internals: ElementInternals = this.attachInternals();

  /**
   * Opt-in marker, read by `DragDropSlottedMixin`. While this is true the interaction keeps this
   * target's chips in its placement map and never touches this element's children.
   */
  public readonly acceptsDeclarativeDrops = true;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;
  @property({ type: String, reflect: true }) identifier: string;

  @consume({ context: dragDropContext, subscribe: true })
  @state()
  private _dragDrop?: Readonly<DragDropState>;

  /** The chips this gap holds. Stable node references, cloned once at drop time by the interaction. */
  public get drags(): readonly HTMLElement[] {
    return this._dragDrop?.nodesByTarget?.[this.identifier] ?? [];
  }

  override render() {
    // Lit renders a `Node` by reference, so a stable node is moved rather than recreated. Keyed by
    // identifier so `repeat` reorders instead of rebuilding.
    return html`<div part="drop">
      ${repeat(
        this.drags,
        node => node.getAttribute('identifier'),
        node => node
      )}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap': QtiGap;
  }
}
