import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';

import styles from './qti-slider-interaction.styles';

import type { CSSResultGroup, PropertyValues } from 'lit';
/**
 * Slider interaction: candidates pick a numeric value along a rail.
 *
 * @slot prompt - The prompt shown above the slider.
 *
 * @csspart slider - The slider root element.
 * @csspart bounds - The min/max bounds label wrapper.
 * @csspart ticks - The tick marks along the rail.
 * @csspart rail - The rail element the knob slides along.
 * @csspart knob - The draggable knob. Tokens: `answer-key` on the ghost knob `qti-corrections`
 *   draws at the correct response (was the part `knob-correct`).
 * @csspart value - The current value display.
 * @cssstate disabled - The interaction is switched off.
 * @cssstate readonly - The interaction is frozen: it shows its value and takes no input.
 */
export class QtiSliderInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

  /**
   * The value the slider shows, or `null` before there is one. A slider has no initial position of
   * its own (QTI 3): it starts at the response declaration's default, which reaches it through
   * `response` like any other value the item holds, or it starts empty.
   */
  #value: number | null = null;

  @query('#rail') private _rail!: HTMLElement;

  @property({ type: Number, attribute: 'lower-bound' }) min = 0;
  @property({ type: Number, attribute: 'upper-bound' }) max = 100;
  @property({ type: Number, attribute: 'step' }) step = 1;

  validate(): boolean {
    return true;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'slider');
  }

  override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    this._internals.ariaValueMin = String(this.min);
    this._internals.ariaValueMax = String(this.max);
  }

  /**
   * Shows the value without publishing it: it came from the item (a default or a restored answer) or
   * from the host, which hold it already. Only the candidate's input is published.
   */
  @property({ attribute: 'response', reflect: false, noAccessor: true })
  get response(): string | null {
    return this.#value === null ? null : this.#value.toString();
  }

  set response(val: string | null) {
    if (val === null || val === undefined || val === '') {
      this.#show(null);
      return;
    }
    const newValue = parseFloat(val);
    if (!isNaN(newValue)) {
      this.#show(newValue);
    }
  }

  /** Extension hook for optional content rendered on the slider rail. */
  protected renderRailSupplement(): unknown {
    return nothing;
  }

  /** Moves the knob to `newValue`, clamped to the bounds, or empties the slider. Returns whether it moved. */
  #show(newValue: number | null): boolean {
    const oldValue = this.#value;
    this.#value = newValue === null ? null : Math.min(this.max, Math.max(this.min, newValue));
    if (this.#value === oldValue) {
      return false;
    }
    if (this.#value === null) {
      this.style.removeProperty('--value-percentage');
      this._internals.setFormValue(null);
      this._internals.ariaValueNow = null;
    } else {
      const valuePercentage = ((this.#value - this.min) / (this.max - this.min)) * 100;
      this.style.setProperty('--value-percentage', `${valuePercentage}%`);
      this._internals.setFormValue(this.value);
      this._internals.ariaValueNow = String(this.#value);
    }
    this.requestUpdate();
    return true;
  }

  /** The candidate's input: shows it and publishes it. */
  #commit(newValue: number) {
    if (this.#show(newValue)) {
      this.saveResponse(this.response);
    }
  }

  override render() {
    return html`
      <slot name="prompt"></slot>
      <div id="slider" part="slider">
        <div id="bounds" part="bounds">
          <div>${this.min}</div>
          <div>${this.max}</div>
        </div>

        <div id="ticks" part="ticks"></div>

        <div id="rail" part="rail" @mousedown=${this.#onMouseDown} @touchstart=${this.#onTouchStart}>
          <div id="knob" part="knob">
            ${this.#value === null ? nothing : html`<div id="value" part="value">${this.#value}</div>`}
          </div>

          ${this.renderRailSupplement()}
        </div>
      </div>
    `;
  }

  #onMouseDown(event: MouseEvent) {
    this.#startDrag(event.pageX);
    const handleMouseMove = (e: MouseEvent) => this.#onDrag(e.pageX);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      this.#onDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  #onTouchStart(event: TouchEvent) {
    this.#startDrag(event.touches[0].pageX);
    const handleTouchMove = (e: TouchEvent) => this.#onDrag(e.touches[0].pageX);
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      this.#onDragEnd();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }

  #startDrag(pageX: number) {
    this.#onDrag(pageX);
  }

  #onDrag(pageX: number) {
    const railRect = this._rail.getBoundingClientRect();
    const diffX = pageX - railRect.left;
    const percentage = Math.min(1, Math.max(0, diffX / railRect.width));
    const steppedValue = this.min + Math.round((percentage * (this.max - this.min)) / this.step) * this.step;
    this.#commit(steppedValue);
  }

  #onDragEnd() {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-slider-interaction': QtiSliderInteraction;
  }
}
