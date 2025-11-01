import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Interaction } from '../../../exports/interaction';

@customElement('qti-media-interaction')
export class QtiMediaInteraction extends Interaction {
  private _value = null;

  reset() {
    // throw new Error('Method not implemented.');
  }
  validate(): boolean {
    return true;
    // maybe check if the media has been played?
  }

  get response(): string | null {
    return this._value ? this._value.toString() : null;
  }

  set response(val: string | null) {
    if (val) {
      const isNumber = !isNaN(parseInt(val?.toString()));
      if (isNumber) {
        this._value = parseInt(val.toString());
      } else {
        throw new Error(`Value must be a number ${val}`);
      }
    }
  }

  static override get properties() {
    return {
      ...Interaction.properties,
      ...{
        step: {
          type: Number,
          attribute: 'step',
          default: 10
        }
      }
    };
  }

  static override styles = [css``];

  override render() {
    return html` <slot name="prompt"></slot>
      <slot></slot>`;
  }

  constructor() {
    super();
  }

  override connectedCallback() {
    super.connectedCallback();
    // get audio, video of object tag.
    const mediaObject = this.querySelector('audio') || this.querySelector('video') || this.querySelector('object');
    if (mediaObject) {
      // listen to ended event
      mediaObject.addEventListener('ended', () => {
        // set value to 0
        // check if this.value is a number
        this._value++;
        this.saveResponse(this.value);
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-media-interaction': QtiMediaInteraction;
  }
}
