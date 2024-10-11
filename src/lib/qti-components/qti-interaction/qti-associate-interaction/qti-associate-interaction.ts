import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { DragDropInteractionMixin } from '../internal/drag-drop';

@customElement('qti-associate-interaction')
export class QtiAssociateInteraction extends DragDropInteractionMixin(
  LitElement,
  'qti-simple-associable-choice',
  true,
  '.dl'
) {
  @state() private _childrenMap: Element[];

  static override styles = css`
    :host {
      display: block; /* necessary to calculate scaling position */
    }
    slot[name='qti-simple-associable-choice'] {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  `;

  override render() {
    return html` <slot name="prompt"></slot>
      <slot name="qti-simple-associable-choice"></slot>
      <div part="drop-container">
        ${this._childrenMap.length > 0 &&
        Array.from(Array(Math.ceil(this._childrenMap.length / 2)).keys()).map(
          (_, index) =>
            html`<div part="associables-container">
              <div name="left${index}" part="drop-list" class="dl" identifier="droplist${index}_left"></div>
              <div name="right${index}" part="drop-list" class="dl" identifier="droplist${index}_right"></div>
            </div>`
        )}
      </div>`;
  }

  override connectedCallback() {
    super.connectedCallback();
    this._childrenMap = Array.from(this.querySelectorAll('qti-simple-associable-choice'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-associate-interaction': QtiAssociateInteraction;
  }
}
