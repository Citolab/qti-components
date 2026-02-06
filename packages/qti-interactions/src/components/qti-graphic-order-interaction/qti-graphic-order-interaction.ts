import { html } from 'lit';

import { Interaction } from '@qti-components/base';

import { ChoicesMixin } from '../../mixins/choices/choices.mixin';
import { positionShapes } from '../../internal/hotspots/hotspot';
import styles from './qti-graphic-order-interaction.styles';

import type { QtiHotspotChoice } from '../../elements/qti-hotspot-choice';
import type { Choice } from '../../mixins/choices/choices.mixin';
import type { CSSResultGroup } from 'lit';

type HotspotChoice = Choice & { order: number; orderCorrect?: number };
export class QtiGraphicOrderInteraction extends ChoicesMixin(Interaction, 'qti-hotspot-choice') {
  static override styles: CSSResultGroup = styles;

  protected choiceOrdering: boolean;

  protected _choiceElements: Choice[] = [];

  override render() {
    return html`
      <slot name="prompt"></slot>
      <slot></slot>
      <div role="alert" part="message" id="validation-message"></div>
    `;
  }

  #setHotspotOrder(e: CustomEvent<{ identifier: string }>): void {
    const { identifier } = e.detail;

    const hotspot = this._choiceElements.find(el => el.getAttribute('identifier') === identifier) as HotspotChoice;

    if (!hotspot) return;

    const maxSelection = this._choiceElements.length;

    if (!this.choiceOrdering) {
      this.choiceOrdering = true;

      if (hotspot.order == null) {
        // Hotspot is not selected, so assign the next available order
        const currentSelection = (this._choiceElements as HotspotChoice[]).filter(i => i.order != null).length;

        if (currentSelection >= maxSelection) {
          this.choiceOrdering = false;
          return; // Maximum selection reached
        }

        hotspot.order = currentSelection + 1;
      } else {
        // Hotspot is already selected, so remove its order and renumber the rest
        const removedOrder = hotspot.order;

        hotspot.order = null;

        (this._choiceElements as HotspotChoice[]).forEach(hotspot => {
          if (hotspot.order != null && hotspot.order > removedOrder) {
            hotspot.order--;
          }
        });
      }

      this.choiceOrdering = false;
    }
  }

  public override toggleCorrectResponse(show: boolean) {
    const responseVariable = this.responseVariable;
    const hotspots = this._choiceElements as HotspotChoice[];
    for (const hotspot of hotspots) {
      if (show && responseVariable?.correctResponse?.length > 0 && Array.isArray(responseVariable.correctResponse)) {
        const index = responseVariable.correctResponse.findIndex(identifier => identifier === hotspot.identifier);
        if (index >= 0) {
          hotspot.orderCorrect = index + 1;
        } else {
          hotspot.orderCorrect = null;
        }
      } else {
        hotspot.orderCorrect = null;
      }
    }
  }

  #positionHotspotOnRegister(e: CustomEvent<QtiHotspotChoice>): void {
    const img = this.querySelector('img') as HTMLImageElement;
    const hotspot = e.target as QtiHotspotChoice;
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    const coordsNumber = coords.split(',').map(s => parseInt(s));

    positionShapes(shape, coordsNumber, img, hotspot);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('activate-qti-hotspot-choice', this.#setHotspotOrder);
    this.addEventListener('register-qti-hotspot-choice', this.#positionHotspotOnRegister);
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('activate-qti-hotspot-choice', this.#setHotspotOrder);
    this.removeEventListener('register-qti-hotspot-choice', this.#positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-graphic-order-interaction': QtiGraphicOrderInteraction;
  }
}
