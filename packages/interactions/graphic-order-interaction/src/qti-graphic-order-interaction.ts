import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';
import { Interaction } from '@qti-components/base';
import { ChoicesMixin } from '@qti-components/interactions-core/mixins/choices/choices.mixin';
import { findGraphic, positionShapes } from '@qti-components/interactions-core/internal/hotspots/hotspot';

import styles from './qti-graphic-order-interaction.styles';

import type { QtiHotspotChoice } from '@qti-components/interactions-core/elements/qti-hotspot-choice';
import type { Choice } from '@qti-components/interactions-core/mixins/choices/choices.mixin';
import type { CSSResultGroup } from 'lit';

type HotspotChoice = Choice & { order: number | null };
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

  /*
   * Unlimited by default, unlike ChoicesMixin's `1`. Ordering is not a single-select: a default of
   * 1 made this interaction a `radiogroup` of `radio` hotspots and let only one hotspot carry an
   * order at a time. QTI's own `max-choices` default for an ordering is "no limit", i.e. 0.
   */
  @property({ type: Number, attribute: 'max-choices' })
  public override maxChoices = 0;

  protected _choiceElements: Choice[] = [];

  override render() {
    return html`
      <slot name="prompt"></slot>
      <slot></slot>
      <div role="alert" part="message" id="validation-message"></div>
    `;
  }

  /*
   * Shadows ChoicesMixin's handler, deliberately without calling up to it.
   *
   * The mixin publishes the response as the set of *checked* choices in DOM order, which is
   * exactly what an ordering interaction must not do: the candidate's sequence never reached
   * RESPONSE, and with the mixin's max-choices default of 1 each click also cleared the previous
   * hotspot. Here the response IS the ordering, so the interaction owns it — and because the
   * response is the ordered list of identifiers, removing one renumbers the rest by itself.
   */
  protected _choiceElementSelectedHandler(event: CustomEvent<{ identifier: string }>): void {
    const { identifier } = event.detail;

    if (!this._choiceElements.some(choice => choice.identifier === identifier)) return;

    const ordered = [...this.#orderedResponse()];
    const position = ordered.indexOf(identifier);

    if (position >= 0) {
      ordered.splice(position, 1);
    } else {
      // 0 means "no limit" — QTI's default for an ordering — so cap at the hotspots that exist.
      const maxSelection = this.maxChoices > 0 ? this.maxChoices : this._choiceElements.length;
      if (ordered.length >= maxSelection) return;
      ordered.push(identifier);
    }

    this.response = ordered;

    this.validate();
    this.reportValidity();
    this.saveResponse(this.response);
  }

  /** The response as the ordered identifier list this interaction always treats it as. */
  #orderedResponse(): string[] {
    if (Array.isArray(this.response)) return this.response;
    return this.response ? [this.response] : [];
  }

  /*
   * Pins and `aria-ordervalue` are a pure function of the response, so any route into it repaints
   * them: a candidate's click, a restored attempt, a correct-response display, an author setting
   * the property. Nothing has to remember to keep a second copy of the ordering in step.
   */
  @watch('response')
  protected handleOrderedResponseChange(): void {
    this.refreshLocatorPins();
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
    const ordered = this.#orderedResponse();

    for (const choice of this._choiceElements as HotspotChoice[]) {
      const position = ordered.indexOf(choice.identifier);
      choice.order = position >= 0 ? position + 1 : null;
    }

    const orderedChoices = (this._choiceElements as HotspotChoice[])
      .filter(choice => choice.order != null)
      .sort((a, b) => a.order - b.order);

    const markers = Array.from(this.querySelectorAll<HTMLElement>(`.${QtiGraphicOrderInteraction.#LOCATOR_CLASS}`));

    /*
     * Idempotent on purpose, because the pins are light-DOM children of an element ChoicesMixin
     * watches with a subtree MutationObserver: appending a marker feeds a mutation straight back
     * into _syncChoicesFromDOM -> _updateChoiceSelection -> here. Rebuilding unconditionally would
     * mutate again on every round and never settle.
     */
    const unchanged =
      markers.length === orderedChoices.length &&
      orderedChoices.every((choice, index) => {
        const marker = markers[index];
        return (
          marker.textContent === String(choice.order) &&
          marker.style.getPropertyValue('position-anchor') === this.#anchorNameForChoice(choice) &&
          marker.style.getPropertyValue('--qti-graphic-order-pin-color') === this.resolvePinColor(choice)
        );
      });

    if (unchanged) return;

    // Remove previous markers and anchor names managed by this component.
    markers.forEach(marker => marker.remove());

    (this._choiceElements as HotspotChoice[]).forEach(choice => {
      choice.style.removeProperty('anchor-name');
    });

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

  #positionHotspot(hotspot: QtiHotspotChoice): void {
    // `<object>` as well as `<img>`: the spec's own example items carry the graphic as an object.
    const graphic = findGraphic(this);
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');

    if (!graphic) {
      console.error('No <img> or <object type="image/*"> found in <qti-graphic-order-interaction>.');
      return;
    }

    const coordsNumber = coords.split(',').map(s => parseInt(s));

    positionShapes(shape, coordsNumber, graphic, hotspot);
  }

  #positionHotspotOnRegister = (e: CustomEvent<QtiHotspotChoice>): void => {
    this.#positionHotspot(e.target as QtiHotspotChoice);
    // A hotspot can upgrade after the response is already set — a restored attempt, say — so give
    // the newcomer its order and pin rather than waiting for the next response change.
    this.refreshLocatorPins();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('register-qti-hotspot-choice', this.#positionHotspotOnRegister);
    this.refreshLocatorPins();
    // qti-hotspot-choice registers itself (and dispatches this event) as soon as it's
    // upgraded, which can happen before this element is upgraded and this listener is
    // attached — the shared elements module is registered ahead of the interaction
    // modules in the bundle. Catch any choices that already connected and missed the
    // event by positioning them directly here too.
    this.querySelectorAll<QtiHotspotChoice>('qti-hotspot-choice').forEach(hotspot => this.#positionHotspot(hotspot));
  }
  override disconnectedCallback() {
    this.querySelectorAll(`.${QtiGraphicOrderInteraction.#LOCATOR_CLASS}`).forEach(marker => marker.remove());
    super.disconnectedCallback();
    this.removeEventListener('register-qti-hotspot-choice', this.#positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-graphic-order-interaction': QtiGraphicOrderInteraction;
  }
}
