import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ChoicesMixin } from '../internal/choices/choices.mixin';
import { positionHotspots } from '../internal/hotspots/hotspot';
import { QtiHotspotChoice } from '../qti-hotspot-choice';
import { Interaction } from '../internal/interaction/interaction';
import styles from './qti-hotspot-interaction.styles';

@customElement('qti-hotspot-interaction')
export class QtiHotspotInteraction extends ChoicesMixin(Interaction, 'qti-hotspot-choice') {
  static styles: CSSResultGroup = styles;

  override render() {
    return html`
      <slot name="prompt"></slot>
      <slot></slot>
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
