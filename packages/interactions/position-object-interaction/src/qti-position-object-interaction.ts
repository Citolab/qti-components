import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { watch } from '@qti-components/utilities';
import { Interaction, parseResponseAttribute, serializeResponseAttribute, setState } from '@qti-components/base';

import styles from './qti-position-object-interaction.styles';

import type { CSSResultGroup } from 'lit';
import type { ValidityKind, ValidityTrigger } from '@qti-components/base';

type Point = { x: number; y: number };

/** Movement below this many CSS pixels between press and release is a click, not a drag. */
const CLICK_SLOP = 4;

/**
 * Position object interaction (QTI 3, 3.2.16): the candidate places copies of an image (the
 * object) on another image (the stage, the parent `qti-position-object-stage`). The response is a
 * list of `point`s, each the object's centre point in the stage image's own coordinates (its
 * `width`/`height` attributes, else its natural size), whatever size the stage is shown at.
 *
 * Placing:
 * - drag the object onto the stage, or click it and then click the stage;
 * - keyboard: focus the object and press Enter or Space to place a copy at the stage's centre;
 *   on a placed copy, the arrow keys move it (Shift: ten times as far) and Delete or Backspace
 *   removes it;
 * - drag a placed copy to move it, or off the stage to remove it.
 *
 * At `max-choices` (default 1; 0 = no limit) no further copy is placed and the host carries
 * `:state(used)`. Area-mapping areas are never shown, only the candidate's positions.
 *
 * @customElement qti-position-object-interaction
 * @slot - The object image (`img` or `picture`).
 * @attr {number} [max-choices=1] - Most positions; 0 = no limit.
 * @attr {number} [min-choices=0] - Fewest positions for a valid response.
 * @attr {string} center-point - The object's centre point, `x y` (or `x,y`) from its top-left, in
 *   the object's own pixels. Default: the centre of its box.
 *
 * @csspart object - The object to place, beside the stage. Tokens: `selected` while a click has
 *   picked it up (the next click on the stage places it); `used` at `max-choices`.
 * @csspart point - Each placed copy on the stage.
 * @csspart message - The validation message, hidden until `reportValidity` shows it.
 * @cssstate used - Every allowed copy is placed (`max-choices` reached).
 * @cssstate disabled - The interaction is switched off.
 * @cssstate readonly - The interaction is frozen: it shows its value and takes no input.
 */
export class QtiPositionObjectInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

  @property({ type: Number, attribute: 'max-choices' }) maxChoices = 1;
  @property({ type: Number, attribute: 'min-choices' }) minChoices = 0;
  @property({ type: String, attribute: 'center-point' }) centerPoint: string | null = null;

  @property({
    attribute: 'response',
    reflect: false,
    converter: {
      fromAttribute: (value: string | null) => {
        const parsed = parseResponseAttribute(value);
        if (parsed === null) return null;
        return Array.isArray(parsed) ? parsed : [parsed];
      },
      toAttribute: (value: string[] | null) => serializeResponseAttribute(value)
    }
  })
  response: string[] | null = null;

  /** Bumped when the stage image changes size, so the copies are placed again. */
  @state() private _layout = 0;
  /** A copy following the pointer: the index it moves (-1: a new one) and where it is, in client px. */
  @state() private _drag: { index: number; client: Point; moved: boolean; start: Point } | null = null;
  /** The object was clicked: the next click on the stage places it. */
  @state() private _armed = false;

  #stageImg: HTMLImageElement | null = null;
  #resize = new ResizeObserver(() => this._layout++);

  // ── Response ──────────────────────────────────────────────────────────────────────────────────

  @watch('response')
  protected _handleResponseChange = () => {
    this._internals.setFormValue(serializeResponseAttribute(this.response) || null);
    this.validate();
    setState(this._internals.states, 'used', this.#atMax());
  };

  #points(): Point[] {
    return (this.response ?? []).map(entry => {
      const [x, y] = entry.split(' ').map(Number);
      return { x, y };
    });
  }

  #write(points: Point[]): void {
    this.response = points.map(p => `${Math.round(p.x)} ${Math.round(p.y)}`);
    this.saveResponse(this.response);
    this.validate();
    this.reportValidity({ trigger: 'change' });
  }

  #atMax(): boolean {
    return this.maxChoices > 0 && (this.response?.length ?? 0) >= this.maxChoices;
  }

  validate(): boolean {
    const count = this.response?.length ?? 0;
    const exceedsMax = this.maxChoices > 0 && count > this.maxChoices;
    const belowMin = count < this.minChoices;
    let kind: ValidityKind = 'other';
    let message = '';
    if (exceedsMax) {
      kind = 'max';
      message =
        this.dataset.maxSelectionsMessage ||
        `Please place no more than ${this.maxChoices} ${this.maxChoices === 1 ? 'position' : 'positions'}.`;
    } else if (belowMin) {
      kind = 'min';
      message =
        this.dataset.minSelectionsMessage ||
        `Please place at least ${this.minChoices} ${this.minChoices === 1 ? 'position' : 'positions'}.`;
    }
    const isValid = !exceedsMax && !belowMin;
    this.setInteractionValidity(isValid, message, this, { suppressInline: true, kind });
    return isValid;
  }

  public override reportValidity(options?: { trigger?: ValidityTrigger }): boolean {
    return super.reportValidity(options);
  }

  override reset(): void {
    this.resetValidityReport();
    this._armed = false;
    this.response = [];
    this._internals.setFormValue(null);
  }

  // ── Geometry ──────────────────────────────────────────────────────────────────────────────────

  get #stage(): HTMLElement | null {
    return this.closest('qti-position-object-stage');
  }

  /** The stage image's own size: its `width`/`height` attributes, else its natural size. */
  #stageSize(): { width: number; height: number } {
    const img = this.#stageImg;
    if (!img) return { width: 1, height: 1 };
    return {
      width: parseFloat(img.getAttribute('width') ?? '') || img.naturalWidth || img.clientWidth || 1,
      height: parseFloat(img.getAttribute('height') ?? '') || img.naturalHeight || img.clientHeight || 1
    };
  }

  /** Stage-image units per CSS pixel. */
  #scale(): number {
    const rect = this.#stageImg?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 1;
    return this.#stageSize().width / rect.width;
  }

  /** The object's own size and centre point, in the object's pixels. */
  #object(): { width: number; height: number; centre: Point } {
    const img = this.querySelector<HTMLImageElement>('img');
    const width = parseFloat(img?.getAttribute('width') ?? '') || img?.naturalWidth || 30;
    const height = parseFloat(img?.getAttribute('height') ?? '') || img?.naturalHeight || 30;
    const [cx, cy] = (this.centerPoint ?? '').split(/[\s,]+/).map(Number);
    return {
      width,
      height,
      centre: Number.isFinite(cx) && Number.isFinite(cy) ? { x: cx, y: cy } : { x: width / 2, y: height / 2 }
    };
  }

  /** A client position as a stage point, or null when it is off the stage image. */
  #toStage(client: Point): Point | null {
    const rect = this.#stageImg?.getBoundingClientRect();
    if (!rect) return null;
    if (client.x < rect.left || client.x > rect.right || client.y < rect.top || client.y > rect.bottom) return null;
    const scale = this.#scale();
    return { x: (client.x - rect.left) * scale, y: (client.y - rect.top) * scale };
  }

  /** Where a copy whose centre point sits at a stage point is drawn, relative to the stage. */
  #styleFor(point: Point): Record<string, string> {
    const stageRect = this.#stage?.getBoundingClientRect();
    const imgRect = this.#stageImg?.getBoundingClientRect();
    if (!stageRect || !imgRect) return { display: 'none' };
    const scale = this.#scale();
    const object = this.#object();
    return {
      left: `${imgRect.left - stageRect.left + point.x / scale - object.centre.x / scale}px`,
      top: `${imgRect.top - stageRect.top + point.y / scale - object.centre.y / scale}px`,
      width: `${object.width / scale}px`,
      height: `${object.height / scale}px`
    };
  }

  // ── Input ─────────────────────────────────────────────────────────────────────────────────────

  get #locked(): boolean {
    return this.disabled || this.readonly;
  }

  #place(point: Point): void {
    if (this.#atMax()) return;
    this.#write([...this.#points(), point]);
  }

  #startDrag(event: PointerEvent, index: number): void {
    if (this.#locked || event.button !== 0) return;
    if (index === -1 && this.#atMax()) return;
    event.preventDefault();
    const client = { x: event.clientX, y: event.clientY };
    this._drag = { index, client, start: client, moved: false };
    window.addEventListener('pointermove', this.#onMove);
    window.addEventListener('pointerup', this.#onUp, { once: true });
  }

  #onMove = (event: PointerEvent): void => {
    if (!this._drag) return;
    const client = { x: event.clientX, y: event.clientY };
    const moved =
      this._drag.moved || Math.hypot(client.x - this._drag.start.x, client.y - this._drag.start.y) > CLICK_SLOP;
    this._drag = { ...this._drag, client, moved };
  };

  #onUp = (event: PointerEvent): void => {
    window.removeEventListener('pointermove', this.#onMove);
    const drag = this._drag;
    this._drag = null;
    if (!drag) return;
    if (!drag.moved) {
      // A click: on the object it picks it up for the next click on the stage; on a copy, nothing.
      if (drag.index === -1) this._armed = !this._armed;
      return;
    }
    const target = this.#toStage({ x: event.clientX, y: event.clientY });
    const points = this.#points();
    if (drag.index === -1) {
      if (target) this.#place(target);
    } else if (target) {
      points[drag.index] = target;
      this.#write(points);
    } else {
      // Dragged off the stage: the copy is taken away.
      this.#write(points.filter((_, i) => i !== drag.index));
    }
  };

  #onStageClick = (event: MouseEvent): void => {
    if (!this._armed || this.#locked) return;
    const target = this.#toStage({ x: event.clientX, y: event.clientY });
    if (!target) return;
    this._armed = false;
    this.#place(target);
  };

  #onObjectKey(event: KeyboardEvent): void {
    if (this.#locked) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.#atMax()) return;
      const { width, height } = this.#stageSize();
      this.#place({ x: width / 2, y: height / 2 });
      void this.updateComplete.then(() => {
        const copies = this.shadowRoot?.querySelectorAll<HTMLElement>('[part~="point"]');
        copies?.[copies.length - 1]?.focus();
      });
    } else if (event.key === 'Escape') {
      this._armed = false;
    }
  }

  #onPointKey(event: KeyboardEvent, index: number): void {
    if (this.#locked) return;
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step }
    };
    const points = this.#points();
    if (moves[event.key]) {
      event.preventDefault();
      const { width, height } = this.#stageSize();
      const p = points[index];
      points[index] = {
        x: Math.min(width, Math.max(0, p.x + moves[event.key].x)),
        y: Math.min(height, Math.max(0, p.y + moves[event.key].y))
      };
      this.#write(points);
      void this.updateComplete.then(() =>
        this.shadowRoot?.querySelectorAll<HTMLElement>('[part~="point"]')[index]?.focus()
      );
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.#write(points.filter((_, i) => i !== index));
      void this.updateComplete.then(() => this.shadowRoot?.querySelector<HTMLElement>('[part~="object"]')?.focus());
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    this.#stageImg = this.#stage?.querySelector<HTMLImageElement>(':scope > img, :scope > picture img') ?? null;
    if (this.#stageImg) {
      this.#resize.observe(this.#stageImg);
      this.#stageImg.addEventListener('load', () => this._layout++);
      this.#stageImg.addEventListener('click', this.#onStageClick);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resize.disconnect();
    this.#stageImg?.removeEventListener('click', this.#onStageClick);
    window.removeEventListener('pointermove', this.#onMove);
  }

  // ── Render ────────────────────────────────────────────────────────────────────────────────────

  override render() {
    void this._layout;
    const src = this.querySelector<HTMLImageElement>('img')?.currentSrc || this.querySelector('img')?.src || '';
    const alt = this.querySelector('img')?.getAttribute('alt') || 'object';
    const used = this.#atMax();
    const objectPart = ['object', this._armed ? 'selected' : '', used ? 'used' : ''].filter(Boolean).join(' ');
    const points = this.#points();
    const drag = this._drag;
    // While a copy is dragged it follows the pointer; a new one is drawn as a copy in flight.
    const dragPoint =
      drag && drag.moved && this.#stageImg
        ? (() => {
            const rect = this.#stageImg.getBoundingClientRect();
            const scale = this.#scale();
            return { x: (drag.client.x - rect.left) * scale, y: (drag.client.y - rect.top) * scale };
          })()
        : null;

    return html`
      <div
        part=${objectPart}
        role="button"
        tabindex=${this.#locked || used ? -1 : 0}
        aria-disabled=${this.#locked || used ? 'true' : 'false'}
        aria-pressed=${this._armed ? 'true' : 'false'}
        aria-label=${`Place ${alt}`}
        @pointerdown=${(e: PointerEvent) => this.#startDrag(e, -1)}
        @keydown=${(e: KeyboardEvent) => this.#onObjectKey(e)}
      >
        <slot></slot>
      </div>
      ${repeat(
        points,
        (_, i) => i,
        (point, index) => {
          const shown = drag && drag.index === index && dragPoint ? dragPoint : point;
          return html`<img
            part="point"
            src=${src}
            alt=${`${alt} at ${Math.round(point.x)}, ${Math.round(point.y)}`}
            role="button"
            tabindex=${this.#locked ? -1 : 0}
            draggable="false"
            style=${styleMap(this.#styleFor(shown))}
            @pointerdown=${(e: PointerEvent) => this.#startDrag(e, index)}
            @keydown=${(e: KeyboardEvent) => this.#onPointKey(e, index)}
          />`;
        }
      )}
      ${drag && drag.index === -1 && dragPoint
        ? html`<img part="point" data-ghost src=${src} alt="" style=${styleMap(this.#styleFor(dragPoint))} />`
        : nothing}
      <div part="message" role="alert" id="validation-message" style="display:none;"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-position-object-interaction': QtiPositionObjectInteraction;
  }
}
