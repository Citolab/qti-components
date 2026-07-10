import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { consume } from '@lit/context';

import { dragDropContext } from '@qti-components/base';

import styles from './qti-associable-hotspot.styles';

import type { DragDropState } from '@qti-components/base';
import type { CSSResultGroup } from 'lit';

/**
 * A drop target positioned over an image. Like `qti-gap`, it renders the chips it holds from
 * `dragDropContext` rather than having them appended into it.
 *
 * @csspart drop - The region a chip lands in.
 */
export class QtiAssociableHotspot extends LitElement {
  static override styles: CSSResultGroup = styles;

  /** Carries `:state(filled)` while the hotspot holds a chip. */
  public internals: ElementInternals = this.attachInternals();

  /** Opt-in marker read by `DragDropSlottedMixin`; see qti-gap. */
  public readonly acceptsDeclarativeDrops = true;

  @property({ type: String, reflect: true }) identifier: string;

  @consume({ context: dragDropContext, subscribe: true })
  @state()
  private _dragDrop?: Readonly<DragDropState>;

  /** The chips this hotspot holds. Stable node references, cloned once at drop time. */
  public get drags(): readonly HTMLElement[] {
    return this._dragDrop?.nodesByTarget?.[this.identifier] ?? [];
  }

  override connectedCallback() {
    super.connectedCallback();
    this.dispatchEvent(
      new CustomEvent('qti-register-hotspot', {
        bubbles: true,
        composed: true,
        cancelable: false
      })
    );
  }

  override render() {
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
    'qti-associable-hotspot': QtiAssociableHotspot;
  }
}
