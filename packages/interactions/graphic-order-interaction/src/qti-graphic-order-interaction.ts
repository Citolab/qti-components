import { html } from 'lit';

import { Interaction } from '@qti-components/base';
import { ChoicesMixin } from '@qti-components/interactions-core/mixins/choices/choices.mixin';
import { positionShapes } from '@qti-components/interactions-core/internal/hotspots/hotspot';

import styles from './qti-graphic-order-interaction.styles';

import type { QtiHotspotChoice } from '@qti-components/interactions-core/elements/qti-hotspot-choice';
import type { Choice } from '@qti-components/interactions-core/mixins/choices/choices.mixin';
import type { CSSResultGroup } from 'lit';

type HotspotChoice = Choice & { order: number };
/**
 * Graphic order interaction: candidates order hotspots on an image.
 *
 * @slot prompt - The prompt shown above the image.
 * @slot - Default slot for the image and hotspot choices.
 *
 * @csspart message - Live validation message region (role="alert").
 */
export class QtiGraphicOrderInteraction extends ChoicesMixin(Interaction, 'qti-hotspot-choice') {
  static override styles: CSSResultGroup = styles;

  static readonly #LOCATOR_CLASS = 'cito-graphic-order-marker';

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

      this.refreshLocatorPins();
      this.choiceOrdering = false;
    }
  }

  #anchorNameForChoice(choice: HotspotChoice): string {
    const raw = choice.identifier || choice.getAttribute('identifier') || 'hotspot';
    const normalized = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    return `--qti-graphic-order-${normalized}`;
  }

  /** Extension hook for packages that add semantic color states to locator pins. */
  protected resolvePinColor(_choice: HotspotChoice): string {
    return 'var(--qti-selected-bg)';
  }

  protected refreshLocatorPins() {
    // Remove previous markers and anchor names managed by this component.
    this.querySelectorAll(`.${QtiGraphicOrderInteraction.#LOCATOR_CLASS}`).forEach(marker => marker.remove());

    (this._choiceElements as HotspotChoice[]).forEach(choice => {
      choice.style.removeProperty('anchor-name');
    });

    const orderedChoices = (this._choiceElements as HotspotChoice[])
      .filter(choice => choice.order != null)
      .sort((a, b) => a.order - b.order);

    orderedChoices.forEach(choice => {
      const anchorName = this.#anchorNameForChoice(choice);
      choice.style.setProperty('anchor-name', anchorName);

      const marker = document.createElement('span');
      marker.className = QtiGraphicOrderInteraction.#LOCATOR_CLASS;
      marker.style.setProperty('position-anchor', anchorName);
      marker.style.setProperty('--qti-graphic-order-pin-color', this.resolvePinColor(choice));
      if (choice.getAttribute('shape') === 'poly') {
        marker.classList.add('cito-graphic-order-marker--poly');
      }
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = String(choice.order);
      this.append(marker);
    });
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
    this.refreshLocatorPins();
  }
  override disconnectedCallback() {
    this.querySelectorAll(`.${QtiGraphicOrderInteraction.#LOCATOR_CLASS}`).forEach(marker => marker.remove());
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
