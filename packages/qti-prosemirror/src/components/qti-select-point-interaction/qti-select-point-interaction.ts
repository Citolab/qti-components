import { css, html, nothing, svg } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { property, state } from 'lit/decorators.js';

import { Interaction } from '../interaction';

import type { CSSResultGroup, TemplateResult } from 'lit';

type DrawMode = 'select' | 'circle' | 'rect';
type AreaShape = 'circle' | 'rect';

type AreaMappingEntry = {
  id: string;
  shape: AreaShape;
  coords: string;
  mappedValue: number;
  defaultValue: number;
};

type DraftShape = {
  shape: AreaShape;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type ShapeDragState = {
  index: number;
  startX: number;
  startY: number;
  originCoords: number[];
  shape: AreaShape;
};

type SelectPointAttrsChangeDetail = {
  nodeType: 'qtiSelectPointInteraction';
  tagName: 'qti-select-point-interaction';
  attrs: Record<string, unknown>;
};

export class QtiSelectPointInteractionEdit extends Interaction {
  static override styles: CSSResultGroup = [
    css`
      :host {
        display: block;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 12px;
        background: #ffffff;
        white-space: normal !important;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        flex-wrap: wrap;
      }

      .toolbar button,
      .toolbar label {
        font: inherit;
        font-size: 12px;
      }

      .toolbar button {
        border: 1px solid #9ca3af;
        background: #f9fafb;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
      }

      .toolbar button[aria-pressed='true'] {
        background: #2563eb;
        border-color: #2563eb;
        color: #ffffff;
      }

      .toolbar .danger {
        border-color: #b91c1c;
        color: #b91c1c;
      }

      .surface {
        position: relative;
        display: inline-block;
        max-width: 100%;
        border: 1px dashed #d1d5db;
        min-height: 160px;
        min-width: 240px;
        background: #f9fafb;
      }

      img {
        display: block;
        max-width: 100%;
        height: auto;
      }

      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .empty-state {
        display: grid;
        place-items: center;
        min-height: 160px;
        color: #6b7280;
        font-size: 12px;
        padding: 16px;
      }

      .meta {
        margin-top: 8px;
        font-size: 12px;
        color: #4b5563;
      }

      input[type='file'] {
        display: none;
      }
    `
  ];

  @property({ type: Number, attribute: 'max-choices', reflect: true })
  maxChoices = 0;

  @property({ type: Number, attribute: 'min-choices', reflect: true })
  minChoices = 0;

  @property({ type: String, attribute: 'class', reflect: true })
  classes: string | null = null;

  @property({ type: String, attribute: 'image-src', reflect: true })
  imageSrc: string | null = null;

  @property({ type: String, attribute: 'image-alt', reflect: true })
  imageAlt: string | null = null;

  @property({ type: Number, attribute: 'image-width', reflect: true })
  imageWidth: number | null = null;

  @property({ type: Number, attribute: 'image-height', reflect: true })
  imageHeight: number | null = null;

  @property({ type: String, attribute: 'area-mappings', reflect: true })
  areaMappings = '[]';

  @state()
  protected drawMode: DrawMode = 'select';

  @state()
  protected imageReady = false;

  @state()
  protected areaEntries: AreaMappingEntry[] = [];

  @state()
  protected draft: DraftShape | null = null;

  #imageElement: HTMLImageElement | null = null;
  #dragging = false;
  #activePointerId: number | null = null;
  #shapeDrag: ShapeDragState | null = null;
  #fileInputRef = createRef<HTMLInputElement>();

  // protected override createRenderRoot(): HTMLElement | DocumentFragment {
  //   return this;
  // }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#syncAreaEntriesFromAttribute();
  }

  override willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('areaMappings')) {
      this.#syncAreaEntriesFromAttribute();
    }
  }

  #syncAreaEntriesFromAttribute() {
    try {
      const raw = JSON.parse(this.areaMappings || '[]');
      if (!Array.isArray(raw)) {
        this.areaEntries = [];
        return;
      }
      this.areaEntries = raw
        .filter(
          entry => entry && (entry.shape === 'circle' || entry.shape === 'rect') && typeof entry.coords === 'string'
        )
        .map((entry, index) => ({
          id: String(entry.id || `A${index + 1}`),
          shape: entry.shape,
          coords: String(entry.coords),
          mappedValue: Number(entry.mappedValue ?? 1),
          defaultValue: Number(entry.defaultValue ?? 0)
        }));
    } catch {
      this.areaEntries = [];
    }
  }

  #persistAreaEntries(entries: AreaMappingEntry[]) {
    this.areaEntries = entries;
    this.areaMappings = JSON.stringify(entries);
    this.#emitAttrsChange();
  }

  async #onFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const dataUrl = await this.#toDataUrl(file);
    this.imageSrc = dataUrl;
    this.imageAlt = this.imageAlt || file.name;

    const dimensions = await this.#loadImageDimensions(dataUrl);
    if (!this.imageWidth || !this.imageHeight) {
      this.imageWidth = dimensions.width;
      this.imageHeight = dimensions.height;
    }

    this.imageReady = false;
    input.value = '';
    this.#emitAttrsChange();
  }

  #openFilePicker(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.#fileInputRef.value?.click();
  }

  #toDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  #loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    });
  }

  #onImageLoad(event: Event) {
    const img = event.currentTarget as HTMLImageElement;
    this.#imageElement = img;
    if (!this.imageWidth || !this.imageHeight) {
      this.imageWidth = img.naturalWidth;
      this.imageHeight = img.naturalHeight;
    }
    this.imageReady = true;
  }

  #toOriginalCoords(clientX: number, clientY: number): { x: number; y: number } | null {
    const img = this.#imageElement;
    if (!img) return null;

    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const originalWidth = this.imageWidth || img.naturalWidth || rect.width;
    const originalHeight = this.imageHeight || img.naturalHeight || rect.height;

    const x = ((clientX - rect.left) / rect.width) * originalWidth;
    const y = ((clientY - rect.top) / rect.height) * originalHeight;

    return {
      x: Math.max(0, Math.min(originalWidth, x)),
      y: Math.max(0, Math.min(originalHeight, y))
    };
  }

  #onPointerDown(event: PointerEvent) {
    if (!this.imageReady) return;
    const point = this.#toOriginalCoords(event.clientX, event.clientY);
    if (!point) return;

    if (this.drawMode === 'select') {
      const shapeIndex = this.#findHitShapeIndex(point.x, point.y);
      if (shapeIndex < 0) return;

      const entry = this.areaEntries[shapeIndex];
      const originCoords = this.#parseCoords(entry.coords);
      if (!originCoords) return;

      event.preventDefault();
      event.stopPropagation();

      const surface = event.currentTarget as HTMLElement | null;
      if (surface) {
        surface.setPointerCapture(event.pointerId);
      }

      this.#dragging = true;
      this.#activePointerId = event.pointerId;
      this.#shapeDrag = {
        index: shapeIndex,
        startX: point.x,
        startY: point.y,
        originCoords,
        shape: entry.shape
      };
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const surface = event.currentTarget as HTMLElement | null;
    if (surface) {
      surface.setPointerCapture(event.pointerId);
    }

    this.#dragging = true;
    this.#activePointerId = event.pointerId;
    this.draft = {
      shape: this.drawMode,
      startX: point.x,
      startY: point.y,
      currentX: point.x,
      currentY: point.y
    };
  }

  #onPointerMove(event: PointerEvent) {
    if (!this.#dragging || this.#activePointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();

    const point = this.#toOriginalCoords(event.clientX, event.clientY);
    if (!point) return;

    if (this.#shapeDrag) {
      const moved = this.#moveShape(this.#shapeDrag, point.x, point.y);
      if (!moved) return;
      const nextEntries = [...this.areaEntries];
      nextEntries[this.#shapeDrag.index] = moved;
      this.areaEntries = nextEntries;
      return;
    }

    if (!this.draft) return;

    this.draft = {
      ...this.draft,
      currentX: point.x,
      currentY: point.y
    };
  }

  #onPointerUp(event: PointerEvent) {
    if (!this.#dragging || this.#activePointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();

    const point = this.#toOriginalCoords(event.clientX, event.clientY);

    const surface = event.currentTarget as HTMLElement | null;
    if (surface?.hasPointerCapture(event.pointerId)) {
      surface.releasePointerCapture(event.pointerId);
    }

    this.#dragging = false;
    this.#activePointerId = null;
    if (this.#shapeDrag) {
      this.#shapeDrag = null;
      this.#persistAreaEntries([...this.areaEntries]);
      return;
    }

    if (!this.draft) return;

    if (!point) {
      this.draft = null;
      return;
    }

    const completedDraft: DraftShape = {
      ...this.draft,
      currentX: point.x,
      currentY: point.y
    };

    const entry = this.#draftToEntry(completedDraft);
    this.draft = null;

    if (!entry) return;
    this.#persistAreaEntries([...this.areaEntries, entry]);
  }

  #onPointerCancel(event: PointerEvent) {
    if (this.#activePointerId !== event.pointerId) return;

    const surface = event.currentTarget as HTMLElement | null;
    if (surface?.hasPointerCapture(event.pointerId)) {
      surface.releasePointerCapture(event.pointerId);
    }

    this.#dragging = false;
    this.#activePointerId = null;
    this.#shapeDrag = null;
    this.draft = null;
  }

  #parseCoords(coords: string): number[] | null {
    const values = coords.split(',').map(v => Number(v));
    if (values.some(v => Number.isNaN(v))) return null;
    return values;
  }

  #findHitShapeIndex(x: number, y: number): number {
    for (let i = this.areaEntries.length - 1; i >= 0; i -= 1) {
      const entry = this.areaEntries[i];
      const values = this.#parseCoords(entry.coords);
      if (!values) continue;

      if (entry.shape === 'circle' && values.length >= 3) {
        const [cx, cy, r] = values;
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) return i;
      }

      if (entry.shape === 'rect' && values.length >= 4) {
        const [x1, y1, x2, y2] = values;
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) return i;
      }
    }
    return -1;
  }

  #moveShape(state: ShapeDragState, x: number, y: number): AreaMappingEntry | null {
    const deltaX = x - state.startX;
    const deltaY = y - state.startY;
    const source = this.areaEntries[state.index];
    if (!source) return null;

    if (state.shape === 'circle' && state.originCoords.length >= 3) {
      const [cx, cy, r] = state.originCoords;
      return {
        ...source,
        coords: `${Math.round(cx + deltaX)},${Math.round(cy + deltaY)},${Math.round(r)}`
      };
    }

    if (state.shape === 'rect' && state.originCoords.length >= 4) {
      const [x1, y1, x2, y2] = state.originCoords;
      return {
        ...source,
        coords: `${Math.round(x1 + deltaX)},${Math.round(y1 + deltaY)},${Math.round(x2 + deltaX)},${Math.round(y2 + deltaY)}`
      };
    }

    return null;
  }

  #draftToEntry(draft: DraftShape): AreaMappingEntry | null {
    const epsilon = 1;
    if (draft.shape === 'circle') {
      const dx = draft.currentX - draft.startX;
      const dy = draft.currentY - draft.startY;
      const radius = Math.round(Math.sqrt(dx * dx + dy * dy));
      if (radius < epsilon) return null;

      return {
        id: `A${Date.now()}`,
        shape: 'circle',
        coords: `${Math.round(draft.startX)},${Math.round(draft.startY)},${radius}`,
        mappedValue: 1,
        defaultValue: 0
      };
    }

    const x1 = Math.round(Math.min(draft.startX, draft.currentX));
    const y1 = Math.round(Math.min(draft.startY, draft.currentY));
    const x2 = Math.round(Math.max(draft.startX, draft.currentX));
    const y2 = Math.round(Math.max(draft.startY, draft.currentY));

    if (Math.abs(x2 - x1) < epsilon || Math.abs(y2 - y1) < epsilon) return null;

    return {
      id: `A${Date.now()}`,
      shape: 'rect',
      coords: `${x1},${y1},${x2},${y2}`,
      mappedValue: 1,
      defaultValue: 0
    };
  }

  #renderAreaShape(entry: AreaMappingEntry): TemplateResult | typeof nothing {
    const values = entry.coords.split(',').map(Number);

    if (entry.shape === 'circle' && values.length >= 3) {
      const [cx, cy, r] = values;
      return svg`<circle
        cx="${cx}"
        cy="${cy}"
        r="${r}"
        fill="rgba(37,99,235,0.2)"
        stroke="#1d4ed8"
        stroke-width="2"
      />`;
    }

    if (entry.shape === 'rect' && values.length >= 4) {
      const [x1, y1, x2, y2] = values;
      return svg`<rect
        x="${Math.min(x1, x2)}"
        y="${Math.min(y1, y2)}"
        width="${Math.abs(x2 - x1)}"
        height="${Math.abs(y2 - y1)}"
        fill="rgba(37,99,235,0.2)"
        stroke="#1d4ed8"
        stroke-width="2"
      />`;
    }

    return nothing;
  }

  #renderDraft(): TemplateResult | typeof nothing {
    if (!this.draft) return nothing;

    const draftEntry = this.#draftToEntry(this.draft);
    if (!draftEntry) return nothing;

    return this.#renderAreaShape(draftEntry);
  }

  #setDrawMode(mode: DrawMode) {
    this.drawMode = mode;
  }

  #clearMappings() {
    this.#persistAreaEntries([]);
  }

  #emitAttrsChange() {
    const detail: SelectPointAttrsChangeDetail = {
      nodeType: 'qtiSelectPointInteraction',
      tagName: 'qti-select-point-interaction',
      attrs: {
        responseIdentifier: this.responseIdentifier ?? null,
        maxChoices: this.maxChoices ?? 0,
        minChoices: this.minChoices ?? 0,
        class: this.getAttribute('class'),
        correctResponse: this.correctResponse ?? null,
        imageSrc: this.imageSrc ?? null,
        imageAlt: this.imageAlt ?? null,
        imageWidth: this.imageWidth ?? null,
        imageHeight: this.imageHeight ?? null,
        areaMappings: this.areaMappings ?? '[]'
      }
    };

    this.dispatchEvent(
      new CustomEvent<SelectPointAttrsChangeDetail>('qti-prosemirror-node-attrs-change', {
        bubbles: true,
        composed: true,
        detail
      })
    );
  }

  override render() {
    const viewWidth = this.imageWidth || 100;
    const viewHeight = this.imageHeight || 100;

    return html`
      <div class="toolbar">
        <button type="button" @click=${this.#openFilePicker}>Upload image</button>
        <input ${ref(this.#fileInputRef)} type="file" accept="image/*" @change=${this.#onFileChange} />
        <button type="button" aria-pressed=${this.drawMode === 'select'} @click=${() => this.#setDrawMode('select')}>
          Select
        </button>
        <button type="button" aria-pressed=${this.drawMode === 'circle'} @click=${() => this.#setDrawMode('circle')}>
          Circle
        </button>
        <button type="button" aria-pressed=${this.drawMode === 'rect'} @click=${() => this.#setDrawMode('rect')}>
          Rect
        </button>
        <button type="button" class="danger" @click=${this.#clearMappings}>Clear mappings</button>
      </div>

      <div
        class="surface"
        @pointerdown=${this.#onPointerDown}
        @pointermove=${this.#onPointerMove}
        @pointerup=${this.#onPointerUp}
        @pointercancel=${this.#onPointerCancel}
      >
        ${this.imageSrc
          ? html`<img
              src="${this.imageSrc}"
              alt="${ifDefined(this.imageAlt || undefined)}"
              width="${ifDefined(this.imageWidth || undefined)}"
              height="${ifDefined(this.imageHeight || undefined)}"
              @load=${this.#onImageLoad}
              draggable="false"
            />`
          : html`<div class="empty-state">Upload an image to start drawing area mappings.</div>`}
        ${this.imageSrc
          ? html`<svg viewBox="0 0 ${viewWidth} ${viewHeight}" preserveAspectRatio="none">
              ${this.areaEntries.map(entry => this.#renderAreaShape(entry))} ${this.#renderDraft()}
            </svg>`
          : nothing}
      </div>

      <div class="meta">Mappings: ${this.areaEntries.length} | mode: ${this.drawMode}</div>
    `;
  }
}

customElements.define('qti-select-point-interaction', QtiSelectPointInteractionEdit);
