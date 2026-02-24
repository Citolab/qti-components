import { html } from 'lit';
import { property, query } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';

import styles from './qti-slider-interaction.styles';

import type { CSSResultGroup } from 'lit';
export class QtiSliderInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

  #value = 0;
  #correctResponseNumber: number | null = null;

  @query('#rail') private _rail!: HTMLElement;

  @property({ type: Number, attribute: 'lower-bound' }) min = 0;
  @property({ type: Number, attribute: 'upper-bound' }) max = 100;
  @property({ type: Number, attribute: 'step' }) step = 1;

  validate(): boolean {
    return true;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#updateValue(this.min); // Set initial value
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'slider');
  }

  get response(): string {
    return this.#value.toString();
  }

  set response(val: string) {
    const newValue = parseInt(val, 10);
    if (!isNaN(newValue)) {
      this.#updateValue(newValue);
    }
  }

  public override toggleCorrectResponse(show: boolean) {
    const responseVariable = this.responseVariable;
    if (!responseVariable?.correctResponse) return;

    if (show) {
      this._correctResponse = responseVariable.correctResponse.toString();
      const nr = parseFloat(responseVariable.correctResponse.toString());
      if (!isNaN(nr)) {
        this.#correctResponseNumber = nr;
        const valuePercentage = ((this.#correctResponseNumber - this.min) / (this.max - this.min)) * 100;
        this.style.setProperty('--value-percentage-correct', `${valuePercentage}%`);
      } else {
        this.#correctResponseNumber = null;
      }
    } else {
      this.#correctResponseNumber = null;
    }
    this.requestUpdate();
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

          ${this.#correctResponseNumber !== null
            ? html`
                <div id="knob-correct" part="knob-correct">
                  <div id="value" part="value">${this.#correctResponseNumber}</div>
                </div>
              `
            : null}
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
