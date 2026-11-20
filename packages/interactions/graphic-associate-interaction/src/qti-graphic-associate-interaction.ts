import { html, nothing, svg } from 'lit';
import { property, queryAssignedElements, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';

import { Interaction, responseAttributeConverter, setState } from '@qti-components/base';
import { positionShapes } from '@qti-components/interactions-core/internal/hotspots/hotspot';

import styles from './qti-graphic-associate-interaction.styles';

import type { QtiAssociableHotspot } from '@qti-components/interactions-core/elements/qti-associable-hotspot';
import type { QtiHotspotChoice } from '@qti-components/interactions-core/elements/qti-hotspot-choice';
import type { CSSResultGroup } from 'lit';
import type { ValidityKind, ValidityTrigger } from '@qti-components/base';
/**
 * Graphic associate interaction: candidates connect points/hotspots on an image with lines.
 *
 * @slot prompt - The prompt shown above the image.
 * @slot - Default slot for hotspot choices layered over the image.
 *
 * @csspart line - Each line drawn by the candidate. Tokens: `answer-key` on a line of the correct
 *   response, drawn by `qti-corrections` (was the part `correct-line`).
 * @csspart point - The in-progress line from the first chosen hotspot to the pointer.
 *
 * Interaction: click (or Enter / Space on a focused point) a point to start a line, then another
 * point to finish it. The chosen start point carries `:state(checked)`; clicking it again, Escape,
 * or a click on the image away from the points cancels. A point that already takes its `match-max`
 * lines carries `:state(full)` and cannot start or end another. Click a line (or focus it and press
 * Enter, Space, Delete or Backspace) to remove it. The response is `pair`, undirected: "B A" is the
 * existing "A B", and a point cannot be paired with itself.
 * @csspart message - Live validation message region (role="alert").
 * @cssstate disabled - The interaction is switched off.
 * @cssstate readonly - The interaction is frozen: it shows its value and takes no input.
 */
export class QtiGraphicAssociateInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

  #hotspots: QtiAssociableHotspot[] = [];
  #startPoint: HTMLElement | null = null;

  @state() private startCoord: { x: number; y: number };
  @state() private mouseCoord: { x: number; y: number };
  @queryAssignedElements({ selector: 'img' }) grImage: any[];

  @state()
  private _response: string[] | null = [];

  constructor() {
    super();
    this.addEventListener('qti-register-hotspot', this.#positionHotspotOnRegister);
  }

  /** Fewest associations a valid response holds (QTI `min-associations`, default 0). */
  @property({ type: Number, attribute: 'min-associations' }) minAssociations = 0;

  /** Most associations a candidate can draw (QTI `max-associations`, default 1; 0 = no limit). */
  @property({ type: Number, attribute: 'max-associations' }) maxAssociations = 1;

  override reset(): void {
    this.resetValidityReport();
    this._response = [];
    this._internals.setFormValue(null);
    this.validate();
    this.#startPoint = null;
    this.#syncHotspotStates();
  }

  validate(): boolean {
    const count = this.#getResponseArray().length;
    const exceedsMax = this.maxAssociations > 0 && count > this.maxAssociations;
    const belowMin = count < this.minAssociations;
    let kind: ValidityKind = 'other';
    let message = '';
    if (exceedsMax) {
      kind = 'max';
      message =
        this.dataset.maxAssociationsMessage ||
        this.dataset.maxSelectionsMessage ||
        `You've selected too many associations. Maximum allowed is ${this.maxAssociations}.`;
    } else if (belowMin) {
      kind = 'min';
      message =
        this.dataset.minAssociationsMessage ||
        this.dataset.minSelectionsMessage ||
        `Please select at least ${this.minAssociations} ${this.minAssociations === 1 ? 'association' : 'associations'}.`;
    }
    const isValid = !exceedsMax && !belowMin;
    this.setInteractionValidity(isValid, message, this, { suppressInline: true, kind });
    return isValid;
  }

  public override reportValidity(options?: { trigger?: ValidityTrigger }): boolean {
    return super.reportValidity(options);
  }

  @property({
    attribute: 'response',
    reflect: false,
    noAccessor: true,
    converter: responseAttributeConverter({ emptyAs: [] })
  })
  set response(val: string | string[] | null) {
    this._response = this.#normalizeResponse(val);
    this.#responseChanged(false);
    this.#syncHotspotStates();
  }

  /** The form value and the validity follow every change; a candidate's change also reports. */
  #responseChanged(byCandidate: boolean): void {
    const lines = this.#getResponseArray();
    this._internals.setFormValue(lines.length ? JSON.stringify(lines) : null);
    this.validate();
    if (byCandidate) this.reportValidity({ trigger: 'change' });
  }

  get response(): string[] | null {
    return this._response;
  }

  #normalizeResponse(value: string | string[] | null | undefined): string[] {
    if (value === null || value === undefined || value === '') return [];
    return Array.isArray(value) ? value : [value];
  }

  #getResponseArray(): string[] {
    return this.#normalizeResponse(this._response);
  }

  /** Extension hook for optional SVG lines rendered above the candidate response. */
  protected renderSupplementalLines(): unknown {
    return nothing;
  }

  override render() {
    return html`<slot name="prompt"></slot>
      <line-container
        @click=${(e: Event) => {
          // A click on the image away from the points cancels a started line.
          if (this.#startPoint && !e.composedPath().some(n => this.#hotspots.includes(n as QtiAssociableHotspot))) {
            this.#cancel();
          }
        }}
      >
        <svg
          width=${ifDefined(this.grImage[0]?.width)}
          height=${ifDefined(this.grImage[0]?.height)}
          viewbox="0 0 ${this.grImage[0]?.width} ${this.grImage[0]?.height}"
        >
          ${repeat(
            this.#getResponseArray(),
            line => line,
            (line, index) => {
              const [a, b] = line.split(' ');
              const from = this.querySelector<HTMLElement>(`[identifier=${a}]`);
              const to = this.querySelector<HTMLElement>(`[identifier=${b}]`);
              if (!from || !to) return nothing;
              const x1 = parseInt(from.style.left);
              const y1 = parseInt(from.style.top);
              const x2 = parseInt(to.style.left);
              const y2 = parseInt(to.style.top);
              const remove = (e: Event) => {
                e.stopPropagation();
                this.#removeLine(index);
              };
              return svg`
                <line part="line" x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke="currentColor" stroke-width="3" />
                <line
                  data-hit
                  x1=${x1}
                  y1=${y1}
                  x2=${x2}
                  y2=${y2}
                  tabindex=${this.disabled || this.readonly ? -1 : 0}
                  role="button"
                  aria-label=${`Remove line ${a} – ${b}`}
                  @click=${remove}
                  @keydown=${(e: KeyboardEvent) => {
                    if (['Enter', ' ', 'Delete', 'Backspace'].includes(e.key)) {
                      e.preventDefault();
                      remove(e);
                    }
                  }}
                ><title>Remove line ${a} – ${b}</title></line>
              `;
            }
          )}
          ${this.renderSupplementalLines()}
          ${this.#startPoint &&
          svg`<line
            part="point"
            x1=${this.startCoord.x}
            y1=${this.startCoord.y}
            x2=${(this.mouseCoord ?? this.startCoord).x}
            y2=${(this.mouseCoord ?? this.startCoord).y}
            stroke="currentColor"
            stroke-width="3"
          />`}
        </svg>
        <slot></slot>
      </line-container>
      <div role="alert" part="message" id="validation-message"></div>`;
  }

  #positionHotspotOnRegister(e: CustomEvent<QtiHotspotChoice>): void {
    const img = this.querySelector('img') as HTMLImageElement;
    const hotspot = e.target as QtiHotspotChoice;
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    const coordsNumber = coords.split(',').map(s => parseInt(s));
    positionShapes(shape, coordsNumber, img, hotspot);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this.#hotspots = Array.from(this.querySelectorAll<QtiAssociableHotspot>('qti-associable-hotspot'));

    this.addEventListener('mousemove', event => {
      const img = this.grImage[0];
      if (!img) return;

      const rect = img.getBoundingClientRect();
      // const scaleX = img.naturalWidth / img.clientWidth;
      // const scaleY = img.naturalHeight / img.clientHeight;

      // console.log(`scaleX: ${scaleX}, scaleY: ${scaleY}`);

      this.mouseCoord = {
        x: event.clientX - rect.left, // * scaleX,
        y: event.clientY - rect.top // * scaleY
      };
    });

    this.#hotspots.forEach(hotspot => {
      // const img = thisgrImage[0];
      // const scaleX = img.naturalWidth / img.clientWidth;
      // const scaleY = img.naturalHeight / img.clientHeight;

      hotspot.style.left = hotspot.getAttribute('coords').split(',')[0] + 'px';
      hotspot.style.top = hotspot.getAttribute('coords').split(',')[1] + 'px';

      hotspot.tabIndex = 0;
      hotspot.setAttribute('role', 'button');
      if (!hotspot.hasAttribute('aria-label')) {
        hotspot.setAttribute('aria-label', hotspot.getAttribute('hotspot-label') || hotspot.getAttribute('identifier'));
      }
      hotspot.addEventListener('click', () => this.#pick(hotspot));
      hotspot.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.#pick(hotspot);
        }
      });
    });

    this.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.#startPoint) this.#cancel();
    });
    this.#syncHotspotStates();
  }

  /** A point clicked or activated: start a line, finish one, or cancel by picking the start again. */
  #pick(hotspot: HTMLElement): void {
    if (this.disabled || this.readonly) return;
    if (!this.#startPoint) {
      if (this.#isFull(hotspot)) return;
      this.#startPoint = hotspot;
      this.startCoord = this.#centre(hotspot);
      this.mouseCoord = this.startCoord;
      this.#syncHotspotStates();
      return;
    }
    if (hotspot === this.#startPoint) {
      this.#cancel();
      return;
    }
    const a = this.#startPoint.getAttribute('identifier');
    const b = hotspot.getAttribute('identifier');
    const current = this.#getResponseArray();
    const exists = current.some(pair => this.#samePair(pair, a, b));
    const roomLeft = this.maxAssociations === 0 || current.length < this.maxAssociations;
    // At `max-associations`, an existing pair, or a full end point: nothing is drawn.
    if (!exists && roomLeft && !this.#isFull(hotspot)) {
      this._response = [...current, `${a} ${b}`];
      this.saveResponse(this.response);
      this.#responseChanged(true);
    }
    this.#cancel();
  }

  #cancel(): void {
    this.#startPoint = null;
    this.#syncHotspotStates();
    this.requestUpdate();
  }

  #removeLine(index: number): void {
    if (this.disabled || this.readonly) return;
    this._response = this.#getResponseArray().filter((_, i) => i !== index);
    this.saveResponse(this.response);
    this.#responseChanged(true);
    this.#syncHotspotStates();
  }

  /** Pairs are undirected: "A B" is "B A". */
  #samePair(pair: string, a: string, b: string): boolean {
    const [x, y] = pair.split(' ');
    return (x === a && y === b) || (x === b && y === a);
  }

  /** Lines this point takes part in, against its `match-max` (0 = no limit). */
  #isFull(hotspot: HTMLElement): boolean {
    const max = Number(hotspot.getAttribute('match-max') ?? 0);
    if (!max) return false;
    const id = hotspot.getAttribute('identifier');
    return this.#getResponseArray().filter(pair => pair.split(' ').includes(id)).length >= max;
  }

  #centre(hotspot: HTMLElement): { x: number; y: number } {
    const [x, y] = (hotspot.getAttribute('coords') ?? '0,0').split(',').map(n => parseInt(n));
    return { x, y };
  }

  /** `checked` on the chosen start point, `full` on a point at its `match-max`. */
  #syncHotspotStates(): void {
    for (const hotspot of this.#hotspots) {
      const states = (hotspot as unknown as { internals?: ElementInternals }).internals?.states;
      setState(states, 'checked', hotspot === this.#startPoint);
      setState(states, 'full', this.#isFull(hotspot));
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('qti-register-hotspot', this.#positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-graphic-associate-interaction': QtiGraphicAssociateInteraction;
  }
}
