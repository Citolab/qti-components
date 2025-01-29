import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { Interaction } from '../../../exports/interaction';
import { positionShapes } from '../internal/hotspots/hotspot';

import type { QtiAreaMapping } from '../../qti-response-processing';
import type { ResponseVariable } from '../../../exports/variables';

@customElement('qti-select-point-interaction')
export class QtiSelectPointInteraction extends Interaction {
  static override styles = [
    css`
      :host {
        display: block;
      }
      point-container {
        display: block;
        position: relative;
        width: fit-content;
      }

      ::slotted(img) {
        max-width: 100%;
        height: auto;
        display: block;
      }
    `
  ];

  @property({
    type: Number,
    attribute: 'max-choices'
  })
  public maxChoices: number = Infinity;

  @property({
    type: Number,
    attribute: 'min-choices'
  })
  public minChoices: number = 0;

  @state()
  private _points: string[] = [];

  @state()
  private _correctAreas: { shape: string; coords: string }[] = [];

  // Reference to the image element
  private _imgElement: HTMLImageElement | null = null;

  private _scaleX = 1;
  private _scaleY = 1;
  private _imageWidthOrginal = 0;
  private _imageHeightOrginal = 0;
  // Extracted click handler method
  private _onImageClick = (event: MouseEvent) => {
    if (!this._imgElement) {
      console.warn('No <img> element found in <qti-select-point-interaction>');
      return;
    }
    this.calculateScale();
    // Get the image's bounding rectangle and calculate scaling factors
    const rect = this._imgElement.getBoundingClientRect();

    // Calculate the x and y coordinates relative to the original image size
    const x = (event.clientX - rect.left) * this._scaleX;
    const y = (event.clientY - rect.top) * this._scaleY;

    // Save the new point as a string
    const newPoint = `${x.toFixed()} ${y.toFixed()}`;

    if (this.maxChoices === 1) {
      // If maxChoices is 1, replace the existing marker with the new one
      this._points = [newPoint];
    } else {
      // If maxChoices > 1, add a new marker if within the limit
      if (this._points.length < this.maxChoices) {
        this._points = [...this._points, newPoint];
      } else {
        // Optional: Notify the user to remove a marker before adding a new one
        console.warn('Maximum number of points reached. Remove a marker to add a new one.');
      }
    }

    // Save the response with the calculated points
    this.saveResponse(this._points);
  };

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._onResize);
  }

  private _onResize = () => {
    this.calculateScale();
  };

  public toggleCorrectResponse(responseVariable: ResponseVariable, show: boolean) {
    // Find the area mapping element from the response variable
    const areaMapping = responseVariable.areaMapping as QtiAreaMapping;

    if (!areaMapping) {
      console.error('No area mapping found for the response variable.');
      return;
    }
    // Get all map entries from the area mapping
    const mapEntries = areaMapping.mapEntries;
    this._correctAreas = show ? mapEntries.map(e => ({ coords: e.coords, shape: e.shape })) : [];
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    const img = this._imgElement;
    if (img && changedProperties.has('_correctAreas') && this._correctAreas.length > 0) {
      this.calculateScale();
      this.shadowRoot.querySelectorAll('div').forEach((el: HTMLElement) => {
        const coords = el.dataset.coord;
        const shape = el.dataset.shape;
        if (coords && shape) {
          positionShapes(
            shape,
            coords.split(',').map(c => +c),
            img,
            el
          );
        }
      });
    }
  }

  override render() {
    return html` <slot name="prompt"></slot>
      <point-container>
        ${repeat(
          this._points.filter(point => point),
          point => point,
          (point, index) => {
            const [x, y] = point.split(' ').map(Number);
            // point are based on the original image size, so we need calculate the percentage based on the original image
            const leftPercentage = (x / (this._imageWidthOrginal || 1)) * 100;
            const topPercentage = (y / (this._imageHeightOrginal || 1)) * 100;
            return html`
              <button
                part="point"
                style=${styleMap({
                  pointerEvents: this.maxChoices === 1 ? 'none' : 'auto',
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  left: `${leftPercentage}%`,
                  top: `${topPercentage}%`
                })}
                aria-label="Remove point at ${point}"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  console.log('click');
                  this._points = this._points.filter((_, i) => i !== index);
                  this.saveResponse(this._points);
                }}
              ></button>
            `;
          }
        )}
        ${repeat(
          this._correctAreas?.filter(area => area),
          area => area,
          (area, _) =>
            html`<div
              style=${styleMap({
                position: 'absolute',
                pointerEvents: 'none',
                backgroundColor: '#808080',
                opacity: '0.5'
              })}
              data-coord="${area.coords}"
              data-shape="${area.shape}"
            ></div>`
        )}
        <slot></slot>
      </point-container>`;
  }

  reset(): void {
    this._points = [];
  }

  validate(): boolean {
    return this._points.length >= this.minChoices && this._points.length <= this.maxChoices;
  }

  set value(val: string | string[]) {
    this._points = Array.isArray(val) ? val : val ? [val] : [];
  }
  get value(): string | string[] {
    return this._points;
  }

  private calculateScale() {
    // Get the image dimensions
    this._imageWidthOrginal = this._imgElement.getAttribute('width')
      ? parseFloat(this._imgElement.getAttribute('width')!)
      : this._imgElement.naturalWidth;
    this._imageHeightOrginal = this._imgElement.getAttribute('height')
      ? parseFloat(this._imgElement.getAttribute('height')!)
      : this._imgElement.naturalHeight;
    // Get the image's bounding rectangle and calculate scaling factors
    const rect = this._imgElement.getBoundingClientRect();
    this._scaleX = rect.width === 0 ? 1 : this._imageWidthOrginal / rect.width; // Horizontal scaling factor
    this._scaleY = rect.height === 0 ? 1 : this._imageHeightOrginal / rect.height; // Vertical scaling factor
  }

  override firstUpdated(): void {
    this._imgElement = this.querySelector('img');

    if (this._imgElement) {
      this.calculateScale();
      // Attach the click event listener to the image element
      this._imgElement.addEventListener('click', this._onImageClick);
    } else {
      console.warn('No <img> element found in <qti-select-point-interaction>');
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    window.removeEventListener('resize', this._onResize);
    if (this._imgElement) {
      // Remove the click event listener from the image element
      this._imgElement.removeEventListener('click', this._onImageClick);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-select-point-interaction': QtiSelectPointInteraction;
  }
}
