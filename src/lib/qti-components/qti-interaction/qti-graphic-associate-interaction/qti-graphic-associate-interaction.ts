import { html, svg } from 'lit';
import { customElement, queryAssignedElements, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';

import { positionShapes } from '../internal/hotspots/hotspot';
import { Interaction } from '../../../exports/interaction';
import styles from './qti-graphic-associate-interaction.styles';

import type { QtiHotspotChoice } from '../qti-hotspot-choice';
import type { CSSResultGroup } from 'lit';
import type { ResponseVariable } from '../../../exports/variables';

@customElement('qti-graphic-associate-interaction')
export class QtiGraphicAssociateInteraction extends Interaction {
  static styles: CSSResultGroup = styles;

  private hotspots;
  private startPoint = null;
  private endPoint = null;

  @state() private _correctLines = [];
  @state() private startCoord: { x: number; y: number };
  @state() private mouseCoord: { x: number; y: number };
  @queryAssignedElements({ selector: 'img' }) private grImage;

  @state()
  private _response: string[] | null = [];

  constructor() {
    super();
    this.addEventListener('qti-register-hotspot', this.positionHotspotOnRegister);
  }

  reset(): void {
    this._response = [];
    this._correctLines = [];
  }

  validate(): boolean {
    return this.response.length > 0;
  }

  set response(val) {
    this._response = val;
  }

  get response() {
    return this._response;
  }

  public toggleCorrectResponse(responseVariable: ResponseVariable, show: boolean) {
    if (!show) {
      this._correctLines = [];
      return;
    }
    if (!responseVariable.correctResponse) {
      console.error('No correct response found for this interaction.');
      return;
    }
    const correctResponses = Array.isArray(responseVariable.correctResponse)
      ? responseVariable.correctResponse
      : [responseVariable.correctResponse];
    this._correctLines = correctResponses;
  }

  override render() {
    return html`<slot name="prompt"></slot>
      <line-container>
        <svg
          width=${ifDefined(this.grImage[0]?.width)}
          height=${ifDefined(this.grImage[0]?.height)}
          viewbox="0 0 ${this.grImage[0]?.width} ${this.grImage[0]?.height}"
        >
          ${repeat(
            this.response || [],
            line => line,
            (line, index) => svg`
              <line
                part="line"
                x1=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[0]}]`).style.left)}
                y1=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[0]}]`).style.top)}
                x2=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[1]}]`).style.left)}
                y2=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[1]}]`).style.top)}
                stroke="red"
                stroke-width="3"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._response = this._response.filter((_, i) => i !== index);
                  this.saveResponse(this.response);
                }}
              />
            `
          )}
          ${repeat(
            this._correctLines || [],
            line => line,
            (line, _index) => svg`
              <line
                part="correct-line"
                x1=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[0]}]`).style.left)}
                y1=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[0]}]`).style.top)}
                x2=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[1]}]`).style.left)}
                y2=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[1]}]`).style.top)}
                stroke="var(--qti-correct)"
                stroke-width="3"
                stroke-dasharray="5,5"
              />
            `
          )}
          ${this.startPoint &&
          svg`<line
            part="point"
            x1=${this.startCoord.x}
            y1=${this.startCoord.y}
            x2=${this.mouseCoord.x}
            y2=${this.mouseCoord.y}
            stroke="var(--qti-border-active)"
            stroke-width="3"
          />`}
        </svg>
        <slot></slot>
      </line-container>
      <div role="alert" id="validationMessage"></div>`;
  }

  private positionHotspotOnRegister(e: CustomEvent<QtiHotspotChoice>): void {
    const img = this.querySelector('img') as HTMLImageElement;
    const hotspot = e.target as QtiHotspotChoice;
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    const coordsNumber = coords.split(',').map(s => parseInt(s));
    positionShapes(shape, coordsNumber, img, hotspot);
  }

  override firstUpdated(): void {
    this.hotspots = this.querySelectorAll('qti-associable-hotspot');

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

    this.hotspots.forEach(hotspot => {
      // const img = this.grImage[0];
      // const scaleX = img.naturalWidth / img.clientWidth;
      // const scaleY = img.naturalHeight / img.clientHeight;

      hotspot.style.left = hotspot.getAttribute('coords').split(',')[0] + 'px';
      hotspot.style.top = hotspot.getAttribute('coords').split(',')[1] + 'px';

      hotspot.addEventListener('click', event => {
        if (!this.startPoint) {
          this.startPoint = event.target;

          this.startCoord = {
            x: parseInt(this.startPoint.getAttribute('coords').split(',')[0]),
            y: parseInt(this.startPoint.getAttribute('coords').split(',')[1])
          };
        } else if (!this.endPoint) {
          this.endPoint = event.target;

          this._response = [
            ...this.response,
            `${this.startPoint.getAttribute('identifier')} ${this.endPoint.getAttribute('identifier')}`
          ];
          this.saveResponse(this.response);
          this.startPoint = null;
          this.endPoint = null;
        }
      });
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('qti-register-hotspot', this.positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-graphic-associate-interaction': QtiGraphicAssociateInteraction;
  }
}
