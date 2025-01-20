import { html, svg } from 'lit';
import { customElement, queryAssignedElements, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';

import { positionHotspots } from '../internal/hotspots/hotspot';
import { Interaction } from '../../../exports/interaction';
import styles from './qti-graphic-associate-interaction.styles';

import type { QtiHotspotChoice } from '../qti-hotspot-choice';
import type { CSSResultGroup } from 'lit';

@customElement('qti-graphic-associate-interaction')
export class QtiGraphicAssociateInteraction extends Interaction {
  static styles: CSSResultGroup = styles;

  private hotspots;
  private startPoint = null;
  private endPoint = null;
  @state() private _lines = [];
  @state() private startCoord: { x: any; y: any };
  @state() private mouseCoord: { x: number; y: number };
  @queryAssignedElements({ selector: 'img' }) private grImage;

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
  set value(val: string | string[]) {
    if (Array.isArray(val)) {
      this._lines = val;
    }
  }
  get value(): string | string[] {
    return this._lines;
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
      </line-container>
      <div role="alert" id="validationMessage"></div>`;
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
