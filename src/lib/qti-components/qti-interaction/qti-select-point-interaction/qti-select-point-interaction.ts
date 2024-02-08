import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Interaction } from '../internal/interaction/interaction';

@customElement('qti-select-point-interaction')
export class QtiSelectPointInteraction extends Interaction {
  @property({
    type: Number,
    attribute: 'max-choices'
  })
  public maxChoices: number = 0;

  @property({
    type: Number,
    attribute: 'min-choices'
  })
  public minChoices: number = 0;

  @state()
  private _points: string[] = [];

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

  reset(): void {
    this._points = [];
  }

  validate(): boolean {
    return this._points.length >= this.minChoices && this._points.length <= this.maxChoices;
  }

  set response(val: string | string[]) {
    this._points = Array.isArray(val) ? val : [val];
  }

  override connectedCallback(): void {
    super.connectedCallback();

    const img = this.querySelector('img');

    // Attach a click event listener to the image element
    img.addEventListener('click', event => {
      const x = event.offsetX;
      const y = event.offsetY;

      this._points = [...this._points, x + ' ' + y];
      this.saveResponse(this._points);
    });
  }
  override disconnectedCallback() {
    super.disconnectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-select-point-interaction': QtiSelectPointInteraction;
  }
}
