import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { Interaction, InteractionReviewController } from '@qti-components/base';

import { positionShapes } from '../../internal/hotspots/hotspot.js';
import {
  getSelectPointCandidateCorrection,
  getSelectPointCorrectAreas
} from './qti-select-point-interaction-review.helpers';


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

  @state() response: string[] | null = null;

  @state()
  private _correctAreas: { shape: string; coords: string }[] = [];

  @state()
  private _responseCorrection: boolean[] = [];

  // Reference to the image element
  private _imgElement: HTMLImageElement | null = null;

  private _scaleX = 1;
  private _scaleY = 1;
  private _imageWidthOriginal = 0;
  private _imageHeightOriginal = 0;

  constructor() {
    super();
    this.reviewController = new InteractionReviewController(this);
  }

  // Extracted click handler method
  private _onImageClick = (event: MouseEvent) => {
    if (this.disabled) {
      return;
    }
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
      this.response = [newPoint];
    } else {
      // If maxChoices > 1, add a new marker if within the limit
      if (this.maxChoices === 0 || (this.response || []).length < this.maxChoices) {
        this.response = [...(this.response || []), newPoint];
      } else {
        // Optional: Notify the user to remove a marker before adding a new one
        // console.warn('Maximum number of points reached. Remove a marker to add a new one.');
      }
    }
    // Save the response with the calculated points
    this.saveResponse(this.response);
  };

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._onResize);
  }

  private _onResize = () => {
    this.calculateScale();
  };

  get responsePoints() {
    return (this.response || [])
      .filter(point => point)
      .map(point => {
        const [x, y] = point.split(' ').map(Number);
        return { x, y };
      });
  }

  public override toggleCandidateCorrection(show: boolean) {
    this._responseCorrection = getSelectPointCandidateCorrection({
      show,
      responseVariable: this.responseVariable,
      responsePoints: this.responsePoints
    });
  }

  public override toggleCorrectResponse(show: boolean) {
    this._correctAreas = getSelectPointCorrectAreas({
      show,
      responseVariable: this.responseVariable
    });
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
          (this.response || []).filter(point => point),
          point => point,
          (point, index) => {
            const [x, y] = point.split(' ').map(Number);
            // point are based on the original image size, so we need calculate the percentage based on the original image
            const leftPercentage = (x / (this._imageWidthOriginal || 1)) * 100;
            const topPercentage = (y / (this._imageHeightOriginal || 1)) * 100;

            // Base size is 1rem (16px), scaled proportionally to the image's current size
            // Base size is 1rem in the original image size
            const baseSize = 16; // Assuming 1rem = 16px
            const widthPercentage = (baseSize / (this._imageWidthOriginal || 1)) * 100;
            const heightPercentage = (baseSize / (this._imageHeightOriginal || 1)) * 100;

            let correctionPart = '';
            if (this._responseCorrection[index] === true) {
              correctionPart = ' correct';
            } else if (this._responseCorrection[index] === false) {
              correctionPart = ' incorrect';
            }

            return html`
              <button
                part="point${correctionPart}"
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
                ?disabled=${this.disabled}
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this.response = (this.response || []).filter((_, i) => i !== index);
                  this.saveResponse(this.response);
                }}
              ></button>
            `;
          }
        )}
        ${repeat(
          this._correctAreas?.filter(area => area) || [],
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

  validate(): boolean {
    return this.response !== null && this.response.length >= this.minChoices && this.response.length <= this.maxChoices;
  }

  private calculateScale() {
    // Get the image dimensions
    this._imageWidthOriginal = this._imgElement.getAttribute('width')
      ? parseFloat(this._imgElement.getAttribute('width')!)
      : this._imgElement.naturalWidth;
    this._imageHeightOriginal = this._imgElement.getAttribute('height')
      ? parseFloat(this._imgElement.getAttribute('height')!)
      : this._imgElement.naturalHeight;
    // Get the image's bounding rectangle and calculate scaling factors
    const rect = this._imgElement.getBoundingClientRect();
    this._scaleX = rect.width === 0 ? 1 : this._imageWidthOriginal / rect.width; // Horizontal scaling factor
    this._scaleY = rect.height === 0 ? 1 : this._imageHeightOriginal / rect.height; // Vertical scaling factor
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
