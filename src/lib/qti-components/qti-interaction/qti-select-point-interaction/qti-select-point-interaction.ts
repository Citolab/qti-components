import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { Interaction } from '../../../exports/interaction';
import { positionShapes } from '../internal/hotspots/hotspot';

import type { QtiAreaMapEntry, QtiAreaMapping } from '../../qti-response-processing';
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
      if (this.maxChoices === 0 || this._points.length < this.maxChoices) {
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
    if (!show) {
      this._correctAreas = [];
      return;
    }
    // Find the area mapping element from the response variable
    const areaMapping = responseVariable.areaMapping as QtiAreaMapping;
    let areaMapEntries: QtiAreaMapEntry[] = [];
    if (!areaMapping || areaMapping.areaMapEntries.length === 0) {
      if (responseVariable.correctResponse) {
        const correctResponses = Array.isArray(responseVariable.correctResponse)
          ? responseVariable.correctResponse
          : [responseVariable.correctResponse];
        if (correctResponses.length === 0 || correctResponses.find(r => r.split(' ').length < 2)) {
          console.error('No valid correct responses found for the response variable.');
          return null;
        }
        console.warn(
          `No area mapping found for the response variable. Using the correct responses to display the correct response but it probably won't score correct.`
        );
        // Create a new area mapping object with the correct responses
        areaMapEntries = correctResponses.map(r => {
          const coords = r.split(' ').join(',').concat(',10'); // Add a radius of 10 pixels to the coordinates
          return { shape: 'circle', coords, defaultValue: 1, mappedValue: 1 };
        });
      } else {
        console.error('No area mapping found for the response variable.');
        return;
      }
    } else {
      // Get all map entries from the area mapping
      areaMapEntries = areaMapping.areaMapEntries;
    }
    this._correctAreas = areaMapEntries.map(e => ({ coords: e.coords, shape: e.shape }));
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

            // Base size is 1rem (16px), scaled proportionally to the image's current size
            // Base size is 1rem in the original image size
            const baseSize = 16; // Assuming 1rem = 16px
            const widthPercentage = (baseSize / (this._imageWidthOrginal || 1)) * 100;
            const heightPercentage = (baseSize / (this._imageHeightOrginal || 1)) * 100;

            return html`
              <button
                part="point"
                style=${styleMap({
                  pointerEvents: this.maxChoices === 1 ? 'none' : 'auto',
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  left: `${leftPercentage}%`,
                  top: `${topPercentage}%`,
                  width: `min(${widthPercentage}%, 1rem)`,
                  height: `min(${heightPercentage}%, 1rem)`,
                  minWidth: `min(${widthPercentage}%, 1rem)`,
                  minHeight: `min(${heightPercentage}%, 1rem)`,
                  borderRadius: '50%', // Ensures round shape
                  background: 'red' // Example styling, adjust as needed
                })}
                aria-label="Remove point at ${point}"
                @click=${(e: Event) => {
                  e.stopPropagation();
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
          (area, i) =>
            html`<div
              style=${styleMap({
                position: 'absolute',
                pointerEvents: 'none',
                backgroundColor: 'var(--qti-correct)',
                opacity: '0.5'
              })}
              data-coord="${area.coords}"
              alt=${`correct-response-${i + 1}`}
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
