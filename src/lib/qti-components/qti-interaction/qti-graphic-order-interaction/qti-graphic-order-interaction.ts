import { css, html } from 'lit';
import { Choice, ChoicesMixin } from '../internal/choices/choices.mixin';
import { QtiHotspotChoice } from '../qti-hotspot-choice';

import { customElement } from 'lit/decorators.js';
import { positionHotspots } from '../internal/hotspots/hotspot';
import { Interaction } from '../internal/interaction/interaction';

type HotspotChoice = Choice & { order: number };

@customElement('qti-graphic-order-interaction')
export class QtiGraphicOrderInteraction extends ChoicesMixin(Interaction, 'qti-hotspot-choice') {
  choiceOrdering: boolean;

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

  private setHotspotOrder(e: CustomEvent<{ identifier: string; checked: boolean }>): void {
    const { identifier } = e.detail;

    const hotspot = this._choiceElements.find(el => el.getAttribute('identifier') === identifier) as HotspotChoice;

    const maxSelection = this._choiceElements.length;
    if (!this.choiceOrdering) {
      this.choiceOrdering = true;
      if (hotspot.order == null) {
        if ((this._choiceElements as HotspotChoice[]).filter(i => i.order > 0).length >= maxSelection) {
          this.choiceOrdering = false;
          return; // don't do anything if user already selected 5 images.
        }
        hotspot.order = (this._choiceElements as HotspotChoice[]).filter(i => !!i.order).length + 1;
        this.choiceOrdering = false;
        return;
      } else {
        (this._choiceElements as HotspotChoice[]).forEach(hotspot => {
          if (hotspot.order > hotspot.order) {
            hotspot.order--;
          }
          return hotspot;
        });
        hotspot.order = null;
      }
      this.choiceOrdering = false;
    }
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
    this.addEventListener('activate-qti-hotspot-choice', this.setHotspotOrder);
    this.addEventListener('register-qti-hotspot-choice', this.positionHotspotOnRegister);
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('activate-qti-hotspot-choice', this.setHotspotOrder);
    this.removeEventListener('register-qti-hotspot-choice', this.positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-graphic-order-interaction': QtiGraphicOrderInteraction;
  }
}
