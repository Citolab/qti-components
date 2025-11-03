import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Interaction } from '@qti-components/shared';

import { ChoicesMixin } from '../../internal/choices/choices.mixin';
import { positionShapes } from '../../internal/hotspots/hotspot';
import styles from './qti-hotspot-interaction.styles';

import type { QtiHotspotChoice } from '../../elements/qti-hotspot-choice';
import type { CSSResultGroup } from 'lit';

@customElement('qti-hotspot-interaction')
export class QtiHotspotInteraction extends ChoicesMixin(Interaction, 'qti-hotspot-choice') {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`
      <slot name="prompt"></slot>
      <slot></slot>
    `;
  }

  private imageLoadPromise: Promise<HTMLImageElement> | null = null;

  private getImageLoadPromise(img: HTMLImageElement): Promise<HTMLImageElement> {
    if (!this.imageLoadPromise) {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        this.imageLoadPromise = Promise.resolve(img);
      } else {
        this.imageLoadPromise = new Promise(resolve => {
          const handler = () => {
            img.removeEventListener('load', handler);
            resolve(img);
          };
          img.addEventListener('load', handler);
        });
      }
    }
    return this.imageLoadPromise;
  }

  private async positionHotspotOnRegister(e: CustomEvent<QtiHotspotChoice>): Promise<void> {
    const img = this.querySelector('img') as HTMLImageElement;
    const hotspot = e.target as QtiHotspotChoice;
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    const coordsNumber = coords.split(',').map(s => parseInt(s));
    const loadedImg = await this.getImageLoadPromise(img);
    positionShapes(shape, coordsNumber, loadedImg, hotspot);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('register-qti-hotspot-choice', this.positionHotspotOnRegister);
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('unregister-qti-hotspot-choice', this.positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hotspot-interaction': QtiHotspotInteraction;
  }
}
