import { CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import styles from './qti-slider-interaction.styles';

@customElement('qti-slider-interaction')
export class QtiSliderInteraction extends LitElement {
  static formAssociated = true; // Enables elementInternals for forms

  static styles: CSSResultGroup = styles;

  private _value = 0;
  private _internals: ElementInternals;

  @query('#rail') private _rail!: HTMLElement;

  @property({ type: Number, attribute: 'lower-bound' }) min = 0;
  @property({ type: Number, attribute: 'upper-bound' }) max = 100;
  @property({ type: Number, attribute: 'step' }) step = 1;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  override connectedCallback() {
    super.connectedCallback();
    this._updateValue(this.min); // Set initial value
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'slider');
  }

  get value(): string {
    return this._value.toString();
  }

  set value(val: string) {
    const newValue = parseInt(val, 10);
    if (!isNaN(newValue)) {
      this._updateValue(newValue);
    }
  }

  private _updateValue(newValue: number) {
    this._value = Math.min(this.max, Math.max(this.min, newValue));
    const valuePercentage = ((this._value - this.min) / (this.max - this.min)) * 100;
    this.style.setProperty('--value-percentage', `${valuePercentage}%`);
    this._internals.setFormValue(this.value); // Update form value
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

        <div id="rail" part="rail" @mousedown=${this._onMouseDown} @touchstart=${this._onTouchStart}>
          <div id="knob" part="knob"><div id="value" part="value">${this.value}</div></div>
        </div>
      </div>
    `;
  }

  private _onMouseDown(event: MouseEvent) {
    this._startDrag(event.pageX);
    const handleMouseMove = (e: MouseEvent) => this._onDrag(e.pageX);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      this._onDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  private _onTouchStart(event: TouchEvent) {
    this._startDrag(event.touches[0].pageX);
    const handleTouchMove = (e: TouchEvent) => this._onDrag(e.touches[0].pageX);
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      this._onDragEnd();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }

  private _startDrag(pageX: number) {
    this._onDrag(pageX);
  }

  private _onDrag(pageX: number) {
    const railRect = this._rail.getBoundingClientRect();
    const diffX = pageX - railRect.left;
    const percentage = Math.min(1, Math.max(0, diffX / railRect.width));
    const steppedValue = this.min + Math.round((percentage * (this.max - this.min)) / this.step) * this.step;
    this._updateValue(steppedValue);
  }

  private _onDragEnd() {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-slider-interaction': QtiSliderInteraction;
  }
}
