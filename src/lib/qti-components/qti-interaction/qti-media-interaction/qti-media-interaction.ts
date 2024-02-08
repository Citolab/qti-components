import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';

@customElement('qti-media-interaction')
export class QtiMediaInteraction extends Interaction {
  value = 0;
  reset() {
    // throw new Error('Method not implemented.');
  }
  validate(): boolean {
    // throw new Error('Method not implemented.');
    return true;
  }
  set response(val: undefined) {
    // throw new Error('Method not implemented.');
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
        this.value++;
        this.saveResponse(this.value.toString());
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-media-interaction': QtiMediaInteraction;
  }
}
