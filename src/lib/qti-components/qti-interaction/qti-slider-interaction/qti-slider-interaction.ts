import { css, html } from 'lit';
import { state, property, query } from 'lit/decorators.js';

import { Interaction } from '../internal/interaction/interaction';
import { watch } from '../../utilities/decorators/watch';

export class QtiSliderInteraction extends Interaction {
  @query('#knob')
  private _knob: HTMLElement;

  @query('#rail')
  private _rail: HTMLElement;

  @property({ type: Number }) value: number;

  @property({ type: Boolean, attribute: 'step-label' }) stepLabel = false;

  @property({ type: Boolean }) reverse = false;

  private _min: number;
  @property({ type: Number, attribute: 'lower-bound' }) set min(value: number) {
    this._min = value;
    this.value = value;
    this.style.setProperty('--min', `${this._min}`);
  }
  get min(): number {
    return this._min;
  }

  private _max: number;
  @property({ type: Number, attribute: 'upper-bound' }) set max(value: number) {
    this._max = value;
    this.style.setProperty('--max', `${this._max}`);
  }
  get max(): number {
    return this._max;
  }

  private _step: number;
  @property({ type: Number, attribute: 'step' }) set step(value: number) {
    this._step = value;
    this.style.setProperty('--step', `${this._step}`);
  }
  get step(): number {
    return this._step;
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  _handleDisabledChange = (old, disabled) => {};

  @watch('readonly', { waitUntilFirstUpdate: true })
  _handleReadonlyChange = (old, readonly) => {};

  reset() {
    // throw new Error('Method not implemented.');
  }
  validate(): boolean {
    return true;
  }

  set response(myResponse: string | string[]) {
    if (Array.isArray(myResponse)) {
      console.error('QtiSliderInteraction: response is an array, but should be a single value');
      return;
    }
    const value = parseInt(myResponse);
    if (Number.isNaN(value)) {
      console.error('QtiSliderInteraction: response is not a number');
      return;
    }
    this.value = value;
  }

  static override styles = [css``];

  override render() {
    // convert the value, which is the real slider value to a percentage for the dom.
    this.value < this.min && (this.value = this.min);
    this.value > this.max && (this.value = this.max);
    const _leftValue = ((this.value - this.min) / (this.max - this.min)) * 100;

    return html`<slot name="prompt"></slot>
      <div id="slider" part="slider">
        <div id="bounds" part="bounds">
          <div>${this._min}</div>
          <div>${this._max}</div>
        </div>
        <div id="ticks" part="ticks"></div>
        <div id="rail" part="rail" @mousedown=${this._onMouseDown} @touchstart=${this._onTouchMove}>
          <div id="knob" part="knob" style="left:${_leftValue}%"></div>
        </div>
        <div id="value" part="value">${this.value}</div>
      </div>`;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.step = 1;
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'slider');
  }

  private _onTouchMove(event) {
    const handleTouchMove = event => {
      const { x } = this.getPositionFromEvent(event);
      const diffX = x - this._rail.getBoundingClientRect().left - document.documentElement.scrollLeft;
      this.calculateValue(diffX);
      event.stopPropagation();
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      this.saveResponse(this.value.toString());
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    const { x } = this.getPositionFromEvent(event);
    const diffX = x - this._rail.getBoundingClientRect().left - document.documentElement.scrollLeft;
    this.calculateValue(diffX);
    event.stopPropagation();
  }

  private _onMouseDown(event) {
    const handleMouseMove = (event: MouseEvent) => {
      // PK: Fixme.. this fixes
      // if the qti-slider-interaction has an absolute left position and body is scrolled a bit, take account for that
      const diffX = event.pageX - this._rail.getBoundingClientRect().left - document.documentElement.scrollLeft;

      this.calculateValue(diffX);
      event.preventDefault();
      event.stopPropagation();
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      this.saveResponse(this.value.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // PK: Fixme.. this fixes
    // if the qti-slider-interaction has an absolute left position and body is scrolled a bit, take account for that
    const diffX = event.pageX - this._rail.getBoundingClientRect().left - document.documentElement.scrollLeft;

    this.calculateValue(diffX);
    event.preventDefault();
    event.stopPropagation();
  }

  /** calculateValue gets x position and compares this with the total width in pixels */
  private calculateValue(diffX: number) {
    const valueNow = this.min + ((this.max - this.min) * diffX) / this._rail.getBoundingClientRect().width;
    const roundedStepValue = this.min + Math.round((valueNow - this.min) / this._step) * this._step;
    this.value = roundedStepValue;
  }

  private getPositionFromEvent(e: any): {
    x: number;
    y: number;
  } {
    let _touchMove;
    if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
      const evt = typeof e.originalEvent === 'undefined' ? e : e.originalEvent;
      const touch = evt.touches[0] || evt.changedTouches[0];
      _touchMove = {
        x: touch.pageX,
        y: touch.pageY
      };
    } else if (
      e.type == 'mousedown' ||
      e.type == 'mouseup' ||
      e.type == 'mousemove' ||
      e.type == 'mouseover' ||
      e.type == 'mouseout' ||
      e.type == 'mouseenter' ||
      e.type == 'mouseleave'
    ) {
      _touchMove = {
        x: e.clientX,
        y: e.clientY
      };
    }
    return _touchMove;
  }
}

customElements.define('qti-slider-interaction', QtiSliderInteraction);
