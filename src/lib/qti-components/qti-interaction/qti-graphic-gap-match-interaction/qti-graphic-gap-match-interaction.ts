import { css, CSSResultGroup, html, PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { QtiHotspotChoice } from '../qti-hotspot-choice';
import { Interaction } from '../internal/interaction/interaction';
import styles from './qti-graphic-gap-match-interaction.styles';
@customElement('qti-graphic-gap-match-interaction')
export class QtiGraphicGapMatchInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-gap-img, qti-gap-text',
  'qti-associable-hotspot',
  `slot[part='drags']`
) {
  static styles: CSSResultGroup = styles;

  private observer: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  override render() {
    return html` <slot name="prompt"></slot>
      <slot part="image"></slot>
      <slot part="drags" name="drags" class="hover-border"></slot>
      <div role="alert" id="validationMessage"></div>`;
  }

  override firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.updateMinDimensionsForDrowZones();

    // MutationObserver to observe changes in child elements
    this.observer = new MutationObserver(() => this.updateMinDimensionsForDrowZones());
    this.observer.observe(this, { childList: true, subtree: true });

    // ResizeObserver to monitor size changes of `gapTexts`
    this.resizeObserver = new ResizeObserver(() => this.updateMinDimensionsForDrowZones());
    const draggableGaps = this.querySelectorAll('qti-gap-img, qti-gap-text');
    draggableGaps.forEach(gapText => this.resizeObserver?.observe(gapText));
  }

  private updateMinDimensionsForDrowZones() {
    const draggableGaps = this.querySelectorAll('qti-gap-img, qti-gap-text');
    const gaps = this.querySelectorAll('qti-associable-hotspot');
    let maxHeight = 0;
    let maxWidth = 0;
    draggableGaps.forEach(gapText => {
      const rect = gapText.getBoundingClientRect();
      maxHeight = Math.max(maxHeight, rect.height);
      maxWidth = Math.max(maxWidth, rect.width);
    });
    const slots = this.shadowRoot.querySelectorAll('slot');
    const dragSlot = Array.from(slots).find(slot => slot.name === 'drags') as HTMLElement;
    if (dragSlot) {
      dragSlot.style.minHeight = `${maxHeight}px`;
      dragSlot.style.minWidth = `${maxWidth}px`;
    }
    for (const gap of gaps) {
      gap.style.minHeight = `${maxHeight}px`;
      gap.style.minWidth = `${maxWidth}px`;
    }
  }

  private positionHotspotOnRegister(e: CustomEvent<null>): void {
    const img = this.querySelector('img') as HTMLImageElement;
    const hotspot = e.target as QtiHotspotChoice;
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    const coordsNumber = coords.split(',').map(s => parseInt(s));

    // positionHotspots(shape, coordsNumber, img, hotspot);
    switch (shape) {
      case 'circle':
        {
          const [centerX, centerY, radius] = coordsNumber;
          hotspot.style.left = centerX - radius + 'px';
          hotspot.style.top = centerY - radius + 'px';
          hotspot.style.width = hotspot.style.height = 2 * radius + 'px';
        }
        break;

      case 'rect':
        {
          const [leftX, topY, rightX, bottomY] = coordsNumber;
          hotspot.style.left = leftX + 'px';
          hotspot.style.top = topY + 'px';
          hotspot.style.width = rightX - leftX + 'px';
          hotspot.style.height = bottomY - topY + 'px';
        }
        break;

      default:
        break;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('qti-register-hotspot', this.positionHotspotOnRegister);
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('qti-register-hotspot', this.positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-graphic-gap-match-interaction': QtiGraphicGapMatchInteraction;
  }
}
