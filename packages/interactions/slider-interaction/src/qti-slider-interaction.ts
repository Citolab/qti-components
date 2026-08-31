import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';

import styles from './qti-slider-interaction.styles';

import type { CSSResultGroup } from 'lit';
/**
 * Slider interaction: candidates pick a numeric value along a rail.
 *
 * @slot prompt - The prompt shown above the slider.
 *
 * @csspart slider - The slider root element.
 * @csspart bounds - The min/max bounds label wrapper.
 * @csspart ticks - The tick marks along the rail.
 * @csspart rail - The rail element the knob slides along.
 * @csspart knob - The draggable knob.
 * @csspart value - The current value display (used twice in the layout).
 * @csspart knob-correct - Ghost knob shown at the correct response position.
 */
export class QtiSliderInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

  #value = 0;

  @query('#rail') private _rail!: HTMLElement;

  @property({ type: Number, attribute: 'lower-bound' }) min = 0;
  @property({ type: Number, attribute: 'upper-bound' }) max = 100;
  @property({ type: Number, attribute: 'step' }) step = 1;

  validate(): boolean {
    return true;
  }

  override connectedCallback() {
    super.connectedCallback();
    // Only seed with `min` if no explicit response was set via attribute/property.
    if (!this.hasAttribute('response')) {
      this.#updateValue(this.min);
    }
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'slider');
  }

  @property({ attribute: 'response', reflect: false, noAccessor: true })
  get response(): string {
    return this.#value.toString();
  }

  set response(val: string | null) {
    if (val === null || val === '') return;
    const newValue = parseFloat(val);
    if (!isNaN(newValue)) {
      this.#updateValue(newValue);
    }
  }

  /** Extension hook for optional content rendered on the slider rail. */
  protected renderRailSupplement(): unknown {
    return nothing;
  }

  #updateValue(newValue: number) {
    const oldValue = this.#value;
    this.#value = Math.min(this.max, Math.max(this.min, newValue));
    if (this.#value === oldValue) {
      return; // Do not update if the value is the same as before
    }
    const valuePercentage = ((this.#value - this.min) / (this.max - this.min)) * 100;
    this.style.setProperty('--value-percentage', `${valuePercentage}%`);
    this._internals.setFormValue(this.value); // Update form value
    this.saveResponse(this.response);
    this.requestUpdate();
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
            <div id="value" part="value">${this.response}</div>
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
    this.#updateValue(steppedValue);
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
