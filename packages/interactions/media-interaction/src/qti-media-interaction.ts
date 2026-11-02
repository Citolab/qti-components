import { html } from 'lit';

import { Interaction } from '@qti-components/base';

import styles from './qti-media-interaction.styles';

import type { CSSResultGroup } from 'lit';
/**
 * Media interaction: wraps an embedded media object (audio/video) and tracks play events.
 *
 * @slot prompt - The prompt shown above the media element.
 * @slot - Default slot for the embedded media element.
 *
 * No parts: the media element is slotted light DOM and is styled directly.
 *
 * @cssstate disabled - The interaction is switched off.
 * @cssstate readonly - The interaction is frozen: it shows its value and takes no input.
 */
export class QtiMediaInteraction extends Interaction {
  static override styles: CSSResultGroup = styles;

  #value: number = null;

  override reset() {
    this.#value = null;
  }
  validate(): boolean {
    return true;
  }

  get response(): string | null {
    return this.#value ? this.#value.toString() : null;
  }

  set response(val: string | null) {
    if (val) {
      const isNumber = !isNaN(parseInt(val?.toString()));
      if (isNumber) {
        this.#value = parseInt(val.toString());
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
        this.#value++;
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
