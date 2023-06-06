import { css, html } from 'lit';
import { Interaction } from '../internal/interaction/interaction';

export class QtiMediaInteraction extends Interaction {
  value: number;

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
  }
}

customElements.define('qti-media-interaction', QtiMediaInteraction);
