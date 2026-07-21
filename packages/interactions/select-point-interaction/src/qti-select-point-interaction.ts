import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { watch } from '@qti-components/utilities';
import { Interaction } from '@qti-components/base';
import { parseResponseAttribute, serializeResponseAttribute } from '@qti-components/base';
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
 * @csspart point - Each selected point marker.
 * @cssprop --qti-select-point-icon - Marker mask image (SVG data URL). Should be a solid silhouette for color inheritance.
 * @cssprop --qti-select-point-marker-size - Marker size.
 * @cssprop --qti-select-point-marker-anchor - Vertical translate anchor (`-100%` for bottom tip, `-50%` for center).
 * @cssprop --qti-select-point-marker-color - Marker color; defaults to currentColor so it can be inherited.
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

  protected get _effectiveAreaEntries(): QtiAreaMapEntry[] {
    const fromResponseVariable = (this.responseVariable?.areaMapping as QtiAreaMapping | undefined)?.areaMapEntries;
    if (fromResponseVariable?.length) return fromResponseVariable;
    return this._areaEntries;
  }

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
    const raw = this.response;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return list
      .filter(point => point)
      .map(point => {
        const [x, y] = point.split(' ').map(Number);
        return { x, y };
      });
  }

  /** Extension hook for additional part tokens on a rendered response point. */
  protected pointPart(_point: string, _index: number): string {
    return 'point';
  }

  /** Extension hook for optional layers rendered above the response points. */
  protected renderSupplementalLayer(): unknown {
    return nothing;
  }

  /** Positions overlay elements that carry `data-coord` and `data-shape`. */
  protected positionOverlayElements(elements: Iterable<HTMLElement>): void {
    const img = this.#imgElement;
    if (!img) return;
    this.#calculateScale();
    for (const element of elements) {
      const coords = element.dataset.coord;
      const shape = element.dataset.shape;
      if (!coords || !shape) continue;
      positionShapes(
        shape,
        coords.split(',').map(c => +c),
        img,
        element
      );
    }
  }

  override render() {
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

            return html`
              <button
                part=${this.pointPart(point, index)}
                style=${styleMap({
                  pointerEvents: this.maxChoices === 1 ? 'none' : 'auto',
                  position: 'absolute',
                  left: `${leftPercentage}%`,
                  top: `${topPercentage}%`
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
        ${this.renderSupplementalLayer()}
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
