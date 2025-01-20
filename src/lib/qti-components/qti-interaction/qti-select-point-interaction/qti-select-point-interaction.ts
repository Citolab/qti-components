import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { Interaction } from '../../../exports/interaction';

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

  @state()
  private _points: string[] = [];

  // Reference to the image element
  private _imgElement: HTMLImageElement | null = null;

  // Extracted click handler method
  private _onImageClick = (event: MouseEvent) => {
    if (this._points.length < this.maxChoices) {
      const x = event.offsetX;
      const y = event.offsetY;

      this._points = [...this._points, `${x} ${y}`];
      this.saveResponse(this._points);
    }
  };

  override render() {
    return html` <slot name="prompt"></slot>
      <point-container>
        ${repeat(
          this._points,
          point => point,
          (point, index) => html`
            <button
              part="point"
              style=${styleMap({
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                left: `${point.split(' ')[0]}px`,
                top: `${point.split(' ')[1]}px`
              })}
              aria-label="Remove point at ${point}"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._points = this._points.filter((_, i) => i !== index);
                this.saveResponse(this._points);
              }}
            ></button>
          `
        )}
        <slot></slot>
      </point-container>`;
  }

  reset(): void {
    this._points = [];
  }

  validate(): boolean {
    return this._points.length >= this.minChoices && this._points.length <= this.maxChoices;
  }

  set value(val: string | string[]) {
    this._points = Array.isArray(val) ? val : [val];
  }
  get value(): string | string[] {
    return this._points;
  }

  override firstUpdated(): void {
    this._imgElement = this.querySelector('img');

    if (this._imgElement) {
      // Attach the click event listener to the image element
      this._imgElement.addEventListener('click', this._onImageClick);
    } else {
      console.warn('No <img> element found in <qti-select-point-interaction>');
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

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
