import { css, html, LitElement } from 'lit';
import { Events } from '../../qti-utilities/EventStrings';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { QtiHotspotChoice } from '../qti-hotspot-choice';
import { positionHotspots } from '../internal/hotspots/hotspot';

export class QtiGraphicGapMatchInteraction extends DragDropInteractionMixin(
  LitElement,
  'qti-gap-img',
  false,
  'qti-associable-hotspot'
) {
  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
    }
    slot[name='qti-gap-img'] {
      display: flex;
      gap: 1rem;
    }
  `;

  override render() {
    return html` <slot></slot>
      <slot name="qti-gap-img"></slot>`;
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

customElements.define('qti-graphic-gap-match-interaction', QtiGraphicGapMatchInteraction);
