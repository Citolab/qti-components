import { html } from 'lit';

import { Interaction } from '@qti-components/base';
import { positionShapes } from '@qti-components/interactions-core/internal/hotspots/hotspot';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

import styles from './qti-graphic-gap-match-interaction.styles';

import type { Graphic } from '@qti-components/interactions-core/internal/hotspots/hotspot';
import type { CSSResultGroup } from 'lit';
const SlottedBase = DragDropSlottedMixin(
  Interaction,
  'qti-gap-img, qti-gap-text',
  'qti-associable-hotspot',
  `slot[part~='drags']`
);

/**
 * Graphic gap-match interaction: candidates drag choices onto image hotspots.
 *
 * @slot prompt - The prompt shown above the image.
 * @slot drags - The draggable choice sources.
 * @slot - Default slot for the base image and hotspots.
 *
 * @csspart image - Wrapper around the image slot.
 * @csspart drags - Wrapper around the drag sources slot.
 * @csspart message - Live validation message region (role="alert").
 */
export class QtiGraphicGapMatchInteraction extends DragDropSlottedSortableMixin(SlottedBase, '[qti-draggable="true"]') {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html` <slot name="prompt"></slot>
      <slot part="image"></slot>
      <slot part="drags" name="drags" class="hover-border"></slot>
      <div role="alert" part="message" id="validation-message"></div>`;
  }

  public override shouldReturnToInventoryOnInventoryDrop(): boolean {
    return true;
  }

  /**
   * The background graphic: a direct child, as QTI places it. Not `findGraphic(this)`, which
   * searches every descendant and would pick up a `qti-gap-img`'s picture (or one in the prompt)
   * when it comes first.
   */
  #graphic(): Graphic | null {
    return this.querySelector<Graphic>(':scope > img, :scope > object[type^="image"]');
  }

  /**
   * Pins the graphic's box to the aspect ratio its width/height attributes declare: the coordinate
   * space the drop areas are percentages of. With the fluid `height: auto` (see the styles) the box
   * would otherwise follow the bitmap — an `<object>` gets no ratio from its attributes at all, and
   * an `<img>` only `auto w / h`, where the loaded bitmap's own ratio wins. Either way a picture
   * whose pixels differ from its declared size would slide out from under its drop areas. Pinned,
   * it fills the declared box as it does at its fixed size.
   */
  #keepDeclaredRatio(graphic: Graphic): void {
    if (graphic.style.aspectRatio) return;
    const length = (name: 'width' | 'height') => {
      const raw = (graphic.getAttribute(name) ?? '').trim();
      const value = parseFloat(raw);
      return raw.endsWith('%') || !(value > 0) ? null : value;
    };
    const width = length('width');
    const height = length('height');
    if (width && height) graphic.style.aspectRatio = `${width} / ${height}`;
  }

  /**
   * Places a drop area over the graphic with `positionShapes`, the hotspot interaction's helper:
   * percentages of the coordinate space the `coords` were authored in, so the areas scale with the
   * graphic when it is narrower than its declared width (see the styles). They used to be written
   * in pixels, which only held while the graphic rendered at exactly that width.
   */
  #positionHotspot(hotspot: HTMLElement): void {
    const graphic = this.#graphic();
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    if (!graphic || !coords || !shape) return;
    this.#keepDeclaredRatio(graphic);
    positionShapes(
      shape,
      coords.split(',').map(s => parseFloat(s)),
      graphic,
      hotspot
    );
  }

  #positionHotspotOnRegister = (e: Event): void => {
    this.#positionHotspot(e.target as HTMLElement);
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('qti-register-hotspot', this.#positionHotspotOnRegister);
    // A hotspot that connected before this element was upgraded has already dispatched its
    // register event (the hotspot interaction has the same catch-up).
    this.querySelectorAll<HTMLElement>(':scope > qti-associable-hotspot').forEach(hotspot =>
      this.#positionHotspot(hotspot)
    );
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('qti-register-hotspot', this.#positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-graphic-gap-match-interaction': QtiGraphicGapMatchInteraction;
  }
}
