import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { watch } from '@qti-components/utilities';
import { Interaction } from '@qti-components/base';
import { parseResponseAttribute, ScoringHelper, serializeResponseAttribute } from '@qti-components/base';
import { positionShapes } from '@qti-components/interactions-core/internal/hotspots/hotspot';

import styles from './qti-select-point-interaction.styles';

import type { CSSResultGroup } from 'lit';
import type { QtiAreaMapEntry, QtiAreaMapping } from '@qti-components/base';
/**
 * Select-point interaction: candidates place points onto a background image.
 *
 * @slot prompt - The prompt shown above the image.
 * @slot - Default slot for the base image.
 *
 * @csspart point - Each selected point; carries `correct` or `incorrect` variants when candidate correction is shown.
 */
export class QtiSelectPointInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

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

  @property({
    attribute: 'response',
    reflect: false,
    converter: {
      // Each entry is `"x y"`; the codec splits on commas. Point cardinality
      // needs an array locally, so wrap a single-string codec output.
      fromAttribute: (value: string | null) => {
        const parsed = parseResponseAttribute(value);
        if (parsed === null) return null;
        return Array.isArray(parsed) ? parsed : [parsed];
      },
      toAttribute: (value: string[] | null) => serializeResponseAttribute(value)
    }
  })
  response: string[] | null = null;

  /**
   * Standalone area mapping as a JSON string. Mirrors the editor's
   * `#syncAreaEntriesFromAttribute` codec — each entry has `{shape, coords, mappedValue?, defaultValue?}`
   * and `shape` must be `'circle'` or `'rect'`. Used when no
   * `qti-response-declaration` provides `areaMapping`.
   *
   * @example
   * ```html
   * <qti-select-point-interaction area-mappings='[{"shape":"circle","coords":"191,393,10","mappedValue":1}]'>
   * ```
   */
  @property({ attribute: 'area-mappings' })
  areaMappings: string | null = null;

  @state()
  private _areaEntries: QtiAreaMapEntry[] = [];

  @watch('areaMappings' as never)
  protected _handleAreaMappingsChange = () => {
    this.#syncAreaEntriesFromAttribute();
    if (this.showCorrectResponse) this.toggleInternalCorrectResponse(true);
    if (this.showCandidateCorrection) this.toggleCandidateCorrection(true);
  };

  #syncAreaEntriesFromAttribute() {
    try {
      const raw = JSON.parse(this.areaMappings || '[]');
      if (!Array.isArray(raw)) {
        this._areaEntries = [];
        return;
      }
      this._areaEntries = raw
        .filter(
          entry => entry && (entry.shape === 'circle' || entry.shape === 'rect') && typeof entry.coords === 'string'
        )
        .map(entry => ({
          shape: entry.shape,
          coords: String(entry.coords),
          mappedValue: Number(entry.mappedValue ?? 1),
          defaultValue: Number(entry.defaultValue ?? 0)
        }));
    } catch {
      this._areaEntries = [];
    }
  }

  private get _effectiveAreaEntries(): QtiAreaMapEntry[] {
    const fromResponseVariable = (this.responseVariable?.areaMapping as QtiAreaMapping | undefined)?.areaMapEntries;
    if (fromResponseVariable?.length) return fromResponseVariable;
    return this._areaEntries;
  }

  @watch('response' as never, { waitUntilFirstUpdate: true })
  protected _handleResponseChange = () => {
    if (this.showCandidateCorrection) {
      this.toggleCandidateCorrection(true);
    }
  };

  @state()
  private _correctAreas: { shape: string; coords: string }[] = [];

  @state()
  private _responseCorrection: boolean[] = [];

  // Reference to the image element
  #imgElement: HTMLImageElement | null = null;

  #scaleX = 1;
  #scaleY = 1;
  #imageWidthOriginal = 0;
  #imageHeightOriginal = 0;

  // Extracted click handler method
  #onImageClick = (event: MouseEvent) => {
    if (this.disabled) {
      return;
    }
    if (!this.#imgElement) {
      console.warn('No <img> element found in <qti-select-point-interaction>');
      return;
    }
    this.#calculateScale();
    // Get the image's bounding rectangle and calculate scaling factors
    const rect = this.#imgElement.getBoundingClientRect();

    // Calculate the x and y coordinates relative to the original image size
    const x = (event.clientX - rect.left) * this.#scaleX;
    const y = (event.clientY - rect.top) * this.#scaleY;

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
    window.addEventListener('resize', this.#onResize);
  }

  #onResize = () => {
    this.#calculateScale();
  };

  get responsePoints() {
    // Normalize: the base toggleFullCorrectResponse may set `clone.response`
    // to a string when `correctResponse` is a single point — handle both.
    const raw = this.response;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return list
      .filter(point => point)
      .map(point => {
        const [x, y] = point.split(' ').map(Number);
        return { x, y };
      });
  }

  public override toggleCandidateCorrection(show: boolean) {
    this._responseCorrection = [];
    if (!show) {
      return;
    }
    const areaEntries = this._effectiveAreaEntries;
    const baseType = this.responseVariable?.baseType;
    const correctResponseValue = this.correctResponse;

    this.responsePoints.forEach(point => {
      let correct = false;
      if (areaEntries.length) {
        correct = areaEntries.some(area =>
          ScoringHelper.isPointInArea(`${point.x} ${point.y}`, `${area.shape},${area.coords}`, baseType)
        );
      } else if (correctResponseValue) {
        // Standalone mode — compare against `correct-response` points with a
        // 10px radius (matches the fallback used by toggleInternalCorrectResponse).
        const correctList = Array.isArray(correctResponseValue) ? correctResponseValue : [correctResponseValue];
        correct = correctList.some(r => {
          const [cx, cy] = r.split(' ').map(Number);
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return false;
          return Math.hypot(point.x - cx, point.y - cy) <= 10;
        });
      }
      this._responseCorrection.push(correct);
    });
  }

  public override toggleInternalCorrectResponse(show: boolean) {
    if (!show) {
      this._correctAreas = [];
      return;
    }
    let areaMapEntries: QtiAreaMapEntry[] = this._effectiveAreaEntries;
    if (!areaMapEntries.length) {
      // Standalone / no area mapping — render circles at the correct-response
      // point coordinates with a 10px radius.
      const correctResponseValue = this.correctResponse;
      if (!correctResponseValue) {
        this._correctAreas = [];
        return;
      }
      const correctResponses = Array.isArray(correctResponseValue) ? correctResponseValue : [correctResponseValue];
      if (correctResponses.find(r => r.split(' ').length < 2)) {
        console.error('No valid correct responses found.');
        return;
      }
      areaMapEntries = correctResponses.map(r => {
        const coords = r.split(' ').join(',').concat(',10');
        return { shape: 'circle', coords, defaultValue: 1, mappedValue: 1 };
      });
    }
    this._correctAreas = areaMapEntries.map(e => ({ coords: e.coords, shape: e.shape }));
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    const img = this.#imgElement;
    if (img && changedProperties.has('_correctAreas') && this._correctAreas.length > 0) {
      this.#calculateScale();
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
    // Normalize: when set via the full-correct-response clone path the
    // response may be a single string rather than an array.
    const rawResponse = this.response;
    const responseList = Array.isArray(rawResponse) ? rawResponse : rawResponse ? [rawResponse] : [];
    return html` <slot name="prompt"></slot>
      <point-container>
        ${repeat(
          responseList.filter(point => point),
          point => point,
          (point, index) => {
            const [x, y] = point.split(' ').map(Number);
            // point are based on the original image size, so we need calculate the percentage based on the original image
            const leftPercentage = (x / (this.#imageWidthOriginal || 1)) * 100;
            const topPercentage = (y / (this.#imageHeightOriginal || 1)) * 100;

            // Base size is 1rem (16px), scaled proportionally to the image's current size
            // Base size is 1rem in the original image size
            const baseSize = 16; // Assuming 1rem = 16px
            const widthPercentage = (baseSize / (this.#imageWidthOriginal || 1)) * 100;
            const heightPercentage = (baseSize / (this.#imageHeightOriginal || 1)) * 100;

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
    const selectedCount = this.response?.length ?? 0;
    const exceedsMax = this.maxChoices !== 0 && Number.isFinite(this.maxChoices) && selectedCount > this.maxChoices;
    const belowMin = selectedCount < this.minChoices;

    let isValid = true;
    let validityMessage = '';

    if (exceedsMax) {
      isValid = false;
      validityMessage =
        this.dataset.maxSelectionsMessage ||
        `Please select no more than ${this.maxChoices} ${this.maxChoices === 1 ? 'point' : 'points'}.`;
    } else if (belowMin) {
      isValid = false;
      validityMessage =
        this.dataset.minSelectionsMessage ||
        `Please select at least ${this.minChoices} ${this.minChoices === 1 ? 'point' : 'points'}.`;
    }

    this.setInteractionValidity(isValid, validityMessage, this.#imgElement ?? this, { suppressInline: true });
    return isValid;
  }

  public override reportValidity(): boolean {
    return super.reportValidity();
  }

  #calculateScale() {
    // Get the image dimensions
    this.#imageWidthOriginal = this.#imgElement.getAttribute('width')
      ? parseFloat(this.#imgElement.getAttribute('width')!)
      : this.#imgElement.naturalWidth;
    this.#imageHeightOriginal = this.#imgElement.getAttribute('height')
      ? parseFloat(this.#imgElement.getAttribute('height')!)
      : this.#imgElement.naturalHeight;
    // Get the image's bounding rectangle and calculate scaling factors
    const rect = this.#imgElement.getBoundingClientRect();
    this.#scaleX = rect.width === 0 ? 1 : this.#imageWidthOriginal / rect.width; // Horizontal scaling factor
    this.#scaleY = rect.height === 0 ? 1 : this.#imageHeightOriginal / rect.height; // Vertical scaling factor
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this.#imgElement = this.querySelector('img');

    if (this.#imgElement) {
      this.#calculateScale();
      // Attach the click event listener to the image element
      this.#imgElement.addEventListener('click', this.#onImageClick);
    } else {
      console.warn('No <img> element found in <qti-select-point-interaction>');
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    window.removeEventListener('resize', this.#onResize);
    if (this.#imgElement) {
      // Remove the click event listener from the image element
      this.#imgElement.removeEventListener('click', this.#onImageClick);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-select-point-interaction': QtiSelectPointInteraction;
  }
}
