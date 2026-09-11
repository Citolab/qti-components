import { html } from 'lit';

import { Interaction } from '@qti-components/base';
import { ChoicesMixin } from '@qti-components/interactions-core/mixins/choices/choices.mixin';
import { positionShapes } from '@qti-components/interactions-core/internal/hotspots/hotspot';

import styles from './qti-hotspot-interaction.styles';

import type { QtiHotspotChoice } from '@qti-components/interactions-core/elements/qti-hotspot-choice';
import type { CSSResultGroup } from 'lit';
/**
 * Hotspot interaction: candidates select one or more hotspots on an image.
 *
 * @slot prompt - The prompt shown above the image.
 * @slot - Default slot for the image and hotspot choices.
 */
export class QtiHotspotInteraction extends ChoicesMixin(Interaction, 'qti-hotspot-choice') {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`
      <slot name="prompt"></slot>
      <slot></slot>
      <div part="message" role="alert" id="validation-message"></div>
    `;
  }

  #imageLoadPromise: Promise<HTMLImageElement> | null = null;

  #getImageLoadPromise(img: HTMLImageElement): Promise<HTMLImageElement> {
    if (!this.#imageLoadPromise) {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        this.#imageLoadPromise = Promise.resolve(img);
      } else {
        this.#imageLoadPromise = new Promise(resolve => {
          const handler = () => {
            img.removeEventListener('load', handler);
            resolve(img);
          };
          img.addEventListener('load', handler);
        });
      }
    }
    return this.#imageLoadPromise;
  }

  async #positionHotspot(hotspot: QtiHotspotChoice): Promise<void> {
    const img = this.querySelector('img') as HTMLImageElement;
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    const coordsNumber = coords.split(',').map(s => parseInt(s));
    const loadedImg = await this.#getImageLoadPromise(img);
    positionShapes(shape, coordsNumber, loadedImg, hotspot);
  }

  #positionHotspotOnRegister = (e: CustomEvent<QtiHotspotChoice>): void => {
    this.#positionHotspot(e.target as QtiHotspotChoice);
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('register-qti-hotspot-choice', this.#positionHotspotOnRegister);
    // qti-hotspot-choice registers itself (and dispatches this event) as soon as it's
    // upgraded, which can happen before this element is upgraded and this listener is
    // attached — the shared elements module is registered ahead of the interaction
    // modules in the bundle. Catch any choices that already connected and missed the
    // event by positioning them directly here too.
    this.querySelectorAll<QtiHotspotChoice>('qti-hotspot-choice').forEach(hotspot => this.#positionHotspot(hotspot));
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('register-qti-hotspot-choice', this.#positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hotspot-interaction': QtiHotspotInteraction;
  }
}
