/* eslint-disable lit/no-invalid-html */
import { css, html, svg } from 'lit';
import { customElement, query, queryAssignedElements, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { positionHotspots } from '../internal/hotspots/hotspot';
import { Interaction } from '../internal/interaction/interaction';
import { QtiHotspotChoice } from '../qti-hotspot-choice';

@customElement('qti-graphic-associate-interaction')
export class QtiGraphicAssociateInteraction extends Interaction {
  choiceOrdering: boolean;
  hotspots;
  startPoint = null;
  endPoint = null;
  @state() _lines = [];
  @state() startCoord: { x: any; y: any };
  @state() mouseCoord: { x: number; y: number };
  @query('svg') svgContainer;
  @queryAssignedElements({ selector: 'img' }) grImage;

  // target the main slot make it relative and fit with the conten
  static override styles = [
    css`
      slot:not([name='prompt']) {
        // position: relative; /* qti-hotspot-choice relative to the slot */
        display: block;
        width: fit-content; /* hotspots not stretching further if image is at max size */
      }
      ::slotted(img) {
        /* image not selectable anymore */
        pointer-events: none;
        user-select: none;
      }
      ::slotted(qti-associable-hotspot) {
        transform: translate(-50%, -50%);
      }
      line-container {
        display: block;
        position: relative;
      }
      svg {
        position: absolute;
        top: 0px;
        left: 0px;
      }
    `
  ];
  svg: SVGSVGElement;

  constructor() {
    super();
    this.addEventListener('qti-register-hotspot', this.positionHotspotOnRegister);
  }

  reset(): void {
    this._lines = [];
  }
  validate(): boolean {
    return this._lines.length > 0;
  }
  set response(val: string | string[]) {
    if (Array.isArray(val)) {
      this._lines = val;
    }
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
            this._lines,
            line => line,
            (line, index) => svg`
              <line
                part="line"
                x1=${parseInt(this.querySelector<SVGLineElement>('[identifier=' + line.split(' ')[0] + ']').style.left)}
                y1=${parseInt(this.querySelector<SVGLineElement>('[identifier=' + line.split(' ')[0] + ']').style.top)}
                x2=${parseInt(this.querySelector<SVGLineElement>('[identifier=' + line.split(' ')[1] + ']').style.left)}
                y2=${parseInt(this.querySelector<SVGLineElement>('[identifier=' + line.split(' ')[1] + ']').style.top)}
                stroke="red"
                stroke-width="3"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._lines = this._lines.filter((_, i) => i !== index);
                  this.saveResponse(this._lines);
                }}
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
            stroke="red"
            stroke-width="3"
          />`}
        </svg>
        <slot></slot>
      </line-container>`;
  }

  private positionHotspotOnRegister(e: CustomEvent<QtiHotspotChoice>): void {
    const img = this.querySelector('img') as HTMLImageElement;
    const hotspot = e.target as QtiHotspotChoice;
    const coords = hotspot.getAttribute('coords');
    const shape = hotspot.getAttribute('shape');
    const coordsNumber = coords.split(',').map(s => parseInt(s));
    positionHotspots(shape, coordsNumber, img, hotspot);
  }

  override firstUpdated(e): void {
    super.firstUpdated(e);

    this.hotspots = this.querySelectorAll('qti-associable-hotspot');

    document.addEventListener('mousemove', event => {
      this.mouseCoord = {
        x: event.clientX - this.grImage[0].getBoundingClientRect().left,
        y: event.clientY - this.grImage[0].getBoundingClientRect().top
      };
    });

    this.hotspots.forEach(hotspot => {
      hotspot.style.left = hotspot.getAttribute('coords').split(',')[0] + 'px';
      hotspot.style.top = hotspot.getAttribute('coords').split(',')[1] + 'px';

      hotspot.addEventListener('click', event => {
        if (!this.startPoint) {
          this.startPoint = event.target;

          this.startCoord = {
            x: this.startPoint.getAttribute('coords').split(',')[0],
            y: this.startPoint.getAttribute('coords').split(',')[1]
          };
        } else if (!this.endPoint) {
          this.endPoint = event.target;

          this._lines = [
            ...this._lines,
            this.startPoint.getAttribute('identifier') + ' ' + this.endPoint.getAttribute('identifier')
          ];
          this.saveResponse(this._lines);
          this.startPoint = null;
          this.endPoint = null;
        }
      });
    });
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('qti-register-hotspot', this.positionHotspotOnRegister);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-graphic-associate-interaction': QtiGraphicAssociateInteraction;
  }
}
