import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ChoicesMixin } from '../internal/choices/choices';
import { positionHotspots } from '../internal/hotspots/hotspot';
import { QtiHotspotChoice } from '../qti-hotspot-choice';

@customElement('qti-hotspot-interaction')
export class QtiHotspotInteraction extends ChoicesMixin(LitElement, 'qti-hotspot-choice') {
  // do not select ( highlight blue, the image)
  // target the main slot make it relative and fit with the conten
  static override styles = [
    css`
      slot:not([name='prompt']) {
        position: relative; /* qti-hotspot-choice relative to the slot */
        display: block;
        width: fit-content; /* hotspots not stretching further if image is at max size */
      }
      ::slotted(img) {
        /* image not selectable anymore */
        pointer-events: none;
        user-select: none;
        /* width:100%; */
      }
    `
  ];
  override render() {
    return html`
      <slot name="prompt"></slot>
      <!-- slot for the prompt -->
      <slot></slot>
      <!-- slot for the image and hotspots -->
    `;
  }

  private positionHotspotOnRegister(e: CustomEvent<QtiHotspotChoice>): void {
    const img = this.querySelector('img') as HTMLImageElement;
    const hotspot = e.target as QtiHotspotChoice;
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    const coordsNumber = coords.split(',').map(s => parseInt(s));

    positionHotspots(shape, coordsNumber, img, hotspot);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('qti-register-choice', this.positionHotspotOnRegister);
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('qti-register-choice', this.positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hotspot-interaction': QtiHotspotInteraction;
  }
}
