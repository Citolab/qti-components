import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';

import { DragDropSlottedMixin } from '../../mixins/drag-drop';
import styles from './qti-graphic-gap-match-interaction.styles';

import type { QtiHotspotChoice } from '../../elements/qti-hotspot-choice';
import type { CSSResultGroup } from 'lit';

@customElement('qti-graphic-gap-match-interaction')
export class QtiGraphicGapMatchInteraction extends DragDropSlottedMixin(
  Interaction,
  'qti-gap-img, qti-gap-text',
  'qti-associable-hotspot',
  `slot[part='drags']`
) {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html` <slot name="prompt"></slot>
      <slot part="image"></slot>
      <slot part="drags" name="drags" class="hover-border"></slot>
      <div role="alert" part="message" id="validation-message"></div>`;
  }

  private positionHotspotOnRegister(e: CustomEvent<null>): void {
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
