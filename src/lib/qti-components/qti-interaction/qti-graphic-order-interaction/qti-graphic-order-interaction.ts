import type { CSSResultGroup } from 'lit';
import { html } from 'lit';
import type { Choice } from '../internal/choices/choices.mixin';
import { ChoicesMixin } from '../internal/choices/choices.mixin';
import type { QtiHotspotChoice } from '../qti-hotspot-choice';
import { customElement } from 'lit/decorators.js';
import { positionHotspots } from '../internal/hotspots/hotspot';
import { Interaction } from '../../../exports/interaction';
import styles from './qti-graphic-order-interaction.styles';

type HotspotChoice = Choice & { order: number };

@customElement('qti-graphic-order-interaction')
export class QtiGraphicOrderInteraction extends ChoicesMixin(Interaction, 'qti-hotspot-choice') {
  static styles: CSSResultGroup = styles;

  protected choiceOrdering: boolean;

  protected _choiceElements: Choice[] = [];

  override render() {
    return html`
      <slot name="prompt"></slot>
      <slot></slot>
      <div role="alert" id="validationMessage"></div>
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
